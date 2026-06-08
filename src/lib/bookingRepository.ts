import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  writeBatch,
  onSnapshot,
  Timestamp,
  arrayUnion
} from 'firebase/firestore'
import { db } from './firebase'
import { createNotification } from './notificationRepository'

const getSafeLFID = async (userId: string) => {
  const fallback = `LF-${userId.slice(0, 6).toUpperCase()}`
  if (!userId) return fallback

  try {
    const userSnap = await getDoc(doc(db, 'users', userId))
    if (!userSnap.exists()) return fallback
    return userSnap.data().lfId || fallback
  } catch {
    return fallback
  }
}

/**
 * BookingRepository
 * Canonical database service for slots, bookings, sessions, and payments.
 * Enforces top-level 'guide_slots' as the single source of truth for time slots.
 */

// ============================================
// 📅 AVAILABILITY SLOTS (Top-level 'guide_slots')
// ============================================

export const getGuideSlots = async (guideId: string, startDate?: string, endDate?: string) => {
  try {
    const slotsRef = collection(db, 'guide_slots')
    const q = query(
      slotsRef,
      where('guideId', '==', guideId),
      where('isBooked', '==', false)
    )
    const snapshot = await getDocs(q)
    const slots = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        price: data.price ?? 129
      }
    }) as any[]

    return slots
      .filter(slot => {
        if (!slot?.date) return false
        if (slot.isBlocked === true || slot.isActive === false) return false

        const slotDate = slot.date
        const start = startDate ? (startDate.includes('T') ? startDate.split('T')[0] : startDate) : null
        const end = endDate ? (endDate.includes('T') ? endDate.split('T')[0] : endDate) : null

        if (start && slotDate < start) return false
        if (end && slotDate > end) return false

        return true
      })
      .sort((a, b) => {
        const aKey = `${a.date || ''} ${a.time || ''}`
        const bKey = `${b.date || ''} ${b.time || ''}`
        return aKey.localeCompare(bKey)
      })
  } catch (error) {
    console.error('Error fetching guide slots:', error)
    throw error
  }
}

export const subscribeToGuideSlots = (guideId: string, callback: (slots: any[]) => void) => {
  const slotsRef = collection(db, 'guide_slots')
  const q = query(slotsRef, where('guideId', '==', guideId))

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        price: data.price ?? 129
      }
    }).sort((a: any, b: any) => {
      const keyA = `${a.date || ''} ${a.time || ''}`
      const keyB = `${b.date || ''} ${b.time || ''}`
      return keyA.localeCompare(keyB)
    })
    callback(list)
  }, (err) => {
    console.error('Failed to listen to guide slots:', err)
  })
}

export const createGuideSlot = async (slotData: {
  guideId: string
  date: string
  time: string
  duration: number
  price: number
  category?: string
}) => {
  try {
    const slotsRef = collection(db, 'guide_slots')
    const docRef = await addDoc(slotsRef, {
      ...slotData,
      isBooked: false,
      isBlocked: false,
      isActive: true,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id }
  } catch (error) {
    console.error('Error creating guide slot:', error)
    throw error
  }
}

export const deleteGuideSlot = async (slotId: string) => {
  try {
    const slotRef = doc(db, 'guide_slots', slotId)
    const slotSnap = await getDoc(slotRef)
    if (!slotSnap.exists()) {
      throw new Error('Slot not found')
    }
    if (slotSnap.data().isBooked) {
      throw new Error('Cannot delete a booked slot')
    }
    await deleteDoc(slotRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting guide slot:', error)
    throw error
  }
}

// ============================================
// 🔒 BOOKINGS (Transaction Lock)
// ============================================

export const createBooking = async (bookingDetails: {
  userId: string
  guideId: string
  slotId: string
  domain: string
  price: number
  category: string
  duration: number
  selectedIssue?: string
  userNotes?: string
}) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const slotRef = doc(db, 'guide_slots', bookingDetails.slotId)
      const slotDoc = await transaction.get(slotRef)

      if (!slotDoc.exists()) {
        throw new Error('Slot not found')
      }

      const slotData = slotDoc.data()
      if (slotData.guideId !== bookingDetails.guideId) {
        throw new Error('Selected slot does not belong to this guide')
      }
      if (slotData.isBooked) {
        throw new Error('Slot already booked')
      }
      if (slotData.isBlocked) {
        throw new Error('Slot not available')
      }
      if (slotData.isActive === false) {
        throw new Error('Slot not available')
      }
      if (slotData.category && slotData.category !== bookingDetails.category) {
        throw new Error('Selected slot is not available for this session type')
      }
      if (Number(slotData.duration) !== Number(bookingDetails.duration)) {
        throw new Error('Selected slot duration changed. Please choose another slot.')
      }

      const bookingRef = doc(collection(db, 'bookings'))
      const bookingData = {
        bookingId: bookingRef.id,
        userId: bookingDetails.userId,
        guideId: bookingDetails.guideId,
        slotId: bookingDetails.slotId,
        domain: bookingDetails.domain,
        category: bookingDetails.category,
        selectedIssue: bookingDetails.selectedIssue || '',
        issueSummary: bookingDetails.selectedIssue || '',
        userNotes: bookingDetails.userNotes || '',
        price: bookingDetails.price,
        discount: 0,
        finalAmount: bookingDetails.price,
        paymentStatus: 'pending',
        status: 'payment_pending',
        sessionDate: slotData.date,
        sessionTime: slotData.time,
        sessionDuration: bookingDetails.duration,
        sessionCreated: false,
        privacyMode: 'lfid_only',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      transaction.set(bookingRef, bookingData)
      transaction.update(slotRef, {
        isBooked: true,
        bookedBy: bookingDetails.userId,
        bookingId: bookingRef.id,
        bookedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return bookingData
    })

    return result
  } catch (error: any) {
    console.error('Booking transaction failed:', error.message)
    throw error
  }
}

export const confirmPayment = async (paymentDetails: {
  bookingId: string
  paymentId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', paymentDetails.bookingId)
      const bookingDoc = await transaction.get(bookingRef)

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }

      const bookingData = bookingDoc.data()
      if (bookingData.status === 'cancelled') {
        throw new Error('Cannot confirm payment for a cancelled booking')
      }
      if (bookingData.paymentStatus === 'completed' && bookingData.status !== 'payment_pending') {
        return {
          bookingId: paymentDetails.bookingId,
          status: bookingData.status || 'pending'
        }
      }

      transaction.update(bookingRef, {
        paymentId: paymentDetails.paymentId,
        cashfreeOrderId: paymentDetails.razorpayOrderId,
        cashfreePaymentId: paymentDetails.razorpayPaymentId,
        cashfreeTransactionId: paymentDetails.razorpaySignature,
        paymentStatus: 'completed',
        status: 'pending',
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      const paymentRef = doc(collection(db, 'payments'))
      transaction.set(paymentRef, {
        paymentId: paymentRef.id,
        bookingId: paymentDetails.bookingId,
        userId: bookingData.userId,
        amount: bookingData.finalAmount,
        currency: 'INR',
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
        status: 'completed',
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      })

      // Notify Seeker
      const seekerNotifRef = doc(collection(db, 'notifications'))
      transaction.set(seekerNotifRef, {
        userId: bookingData.userId,
        type: 'booking_requested',
        title: 'Booking Request Sent!',
        body: `Your booking request for ${bookingData.sessionDate} at ${bookingData.sessionTime} has been sent to the mentor.`,
        read: false,
        actionUrl: '/dashboard',
        createdAt: serverTimestamp()
      })

      // Notify Mentor
      const mentorNotifRef = doc(collection(db, 'notifications'))
      transaction.set(mentorNotifRef, {
        userId: bookingData.guideId,
        type: 'booking_request_received',
        title: 'New Booking Request!',
        body: `You have a new booking request for ${bookingData.sessionDate} at ${bookingData.sessionTime}.`,
        read: false,
        actionUrl: '/mentor-portal',
        createdAt: serverTimestamp()
      })

      return {
        bookingId: paymentDetails.bookingId,
        status: 'pending'
      }
    })

    return result
  } catch (error) {
    console.error('Payment confirmation failed:', error)
    throw error
  }
}

/**
 * Cancel a pending payment and release the slot
 * Called when payment fails or is cancelled by user
 */
export const cancelPendingBooking = async (bookingId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }

      const bookingData = bookingDoc.data()

      // Only allow cancellation if payment hasn't been completed
      if (bookingData.paymentStatus === 'completed') {
        throw new Error('Cannot cancel a completed booking')
      }

      // Update booking status to failed
      transaction.update(bookingRef, {
        status: 'payment_failed',
        paymentStatus: 'failed',
        updatedAt: serverTimestamp()
      })

      // Release the slot
      if (bookingData.slotId) {
        const slotRef = doc(db, 'guide_slots', bookingData.slotId)
        transaction.update(slotRef, {
          isBooked: false,
          bookedBy: null,
          bookingId: null,
          releasedAt: serverTimestamp()
        })
      }

      return { success: true, bookingId }
    })

    return result
  } catch (error) {
    console.error('Failed to cancel pending booking:', error)
    throw error
  }
}

// ============================================
// 🔄 REAL-TIME BOOKINGS LISTENERS (With Joins)
// ============================================

export const subscribeToUserBookings = (userId: string, callback: (bookings: any[]) => void) => {
  const bookingsRef = collection(db, 'bookings')
  const q = query(
    bookingsRef,
    where('userId', '==', userId)
  )

  return onSnapshot(q, async (snapshot) => {
    const list = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data()
      const guideId = data.guideId

      let mentorName = 'LifeFundies Mentor'
      let mentorPhotoURL = ''

      if (guideId) {
        try {
          const guideDoc = await getDoc(doc(db, 'users', guideId))
          if (guideDoc.exists()) {
            const guideData = guideDoc.data()
            mentorName = guideData.displayName || guideData.fullName || mentorName
            mentorPhotoURL = guideData.photoURL || ''
          }
        } catch (e) {
          console.error('Error fetching guide profile in booking join:', e)
        }
      }

      return {
        id: docSnap.id,
        ...data,
        mentor: mentorName,
        mentorName,
        mentorPhotoURL,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      }
    }))
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(list)
  }, (err) => {
    console.error('Failed to listen to user bookings:', err)
  })
}

export const subscribeToGuideBookings = (guideId: string, callback: (bookings: any[]) => void) => {
  const bookingsRef = collection(db, 'bookings')
  const q = query(
    bookingsRef,
    where('guideId', '==', guideId)
  )

  return onSnapshot(q, async (snapshot) => {
    const list = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data()
      const userId = data.userId

      const lfid = await getSafeLFID(userId)

      return {
        id: docSnap.id,
        ...data,
        lfid,
        clientName: lfid,
        clientPhotoURL: '',
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      }
    }))
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    callback(list)
  }, (err) => {
    console.error('Failed to listen to guide bookings:', err)
  })
}

export const getUserBookings = async (userId: string): Promise<any[]> => {
  try {
    const bookingsRef = collection(db, 'bookings')
    const q = query(
      bookingsRef,
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    const list = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data()
      const guideId = data.guideId

      let mentorName = 'LifeFundies Mentor'
      let mentorPhotoURL = ''

      if (guideId) {
        try {
          const guideDoc = await getDoc(doc(db, 'users', guideId))
          if (guideDoc.exists()) {
            const guideData = guideDoc.data()
            mentorName = guideData.displayName || guideData.fullName || mentorName
            mentorPhotoURL = guideData.photoURL || ''
          }
        } catch (e) {
          console.error('Error fetching guide profile in booking join:', e)
        }
      }

      return {
        id: docSnap.id,
        ...data,
        mentor: mentorName,
        mentorName,
        mentorPhotoURL,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      }
    }))
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Failed to get user bookings:', error)
    return []
  }
}

export const getGuideBookings = async (guideId: string): Promise<any[]> => {
  try {
    const bookingsRef = collection(db, 'bookings')
    const q = query(
      bookingsRef,
      where('guideId', '==', guideId)
    )
    const snapshot = await getDocs(q)
    const list = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data()
      const userId = data.userId

      const lfid = await getSafeLFID(userId)

      return {
        id: docSnap.id,
        ...data,
        lfid,
        clientName: lfid,
        clientPhotoURL: '',
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      }
    }))
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Failed to get guide bookings:', error)
    return []
  }
}

export const getGuideSlotsAll = async (guideId: string): Promise<any[]> => {
  try {
    const slotsRef = collection(db, 'guide_slots')
    const q = query(slotsRef, where('guideId', '==', guideId))
    const snapshot = await getDocs(q)
    const list = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        price: data.price ?? 129
      }
    }).sort((a: any, b: any) => {
      const keyA = `${a.date || ''} ${a.time || ''}`
      const keyB = `${b.date || ''} ${b.time || ''}`
      return keyA.localeCompare(keyB)
    })
    return list
  } catch (error) {
    console.error('Failed to get guide slots:', error)
    return []
  }
}

export const getSessionsForGuide = async (guideId: string): Promise<any[]> => {
  try {
    const sessionsRef = collection(db, 'sessions')
    const q = query(sessionsRef, where('guideId', '==', guideId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }))
  } catch (error) {
    console.error('Failed to get guide sessions:', error)
    return []
  }
}

// ============================================
// 🧑‍🏫 GUIDE PORTAL OPERATIONS
// ============================================

export const acceptBookingRequest = async (bookingId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }
      const bookingData = bookingDoc.data()
      if (bookingData.paymentStatus !== 'completed' || bookingData.status !== 'pending') {
        throw new Error('Only paid pending bookings can be accepted')
      }
      const existingSessionId = bookingData.sessionId || null
      let sessionId = existingSessionId

      // Update booking status
      transaction.update(bookingRef, {
        status: 'confirmed',
        paymentStatus: 'completed',
        updatedAt: serverTimestamp()
      })

      // Create session document once
      if (!existingSessionId) {
        const sessionRef = doc(collection(db, 'sessions'))
        sessionId = sessionRef.id
        const sessionData = {
          sessionId: sessionRef.id,
          bookingId,
          userId: bookingData.userId,
          guideId: bookingData.guideId,
          domain: bookingData.domain,
          sessionDate: bookingData.sessionDate || '',
          sessionTime: bookingData.sessionTime || '',
          lfid: await getSafeLFID(bookingData.userId),
          querySummary: bookingData.issueSummary || bookingData.userNotes || '',
          scheduledAt: bookingData.sessionDate && bookingData.sessionTime
            ? `${bookingData.sessionDate}T${bookingData.sessionTime}:00`
            : '',
          duration: bookingData.sessionDuration || 60,
          status: 'confirmed',
          videoRoomId: `lf_room_${sessionRef.id}`,
          chatEnabled: true,
          createdAt: serverTimestamp()
        }
        transaction.set(sessionRef, sessionData)
      }

      transaction.update(bookingRef, {
        sessionCreated: true,
        sessionId
      })

      // Notify seeker
      const seekerNotifRef = doc(collection(db, 'notifications'))
      transaction.set(seekerNotifRef, {
        userId: bookingData.userId,
        type: 'booking_confirmed',
        title: 'Session Confirmed!',
        body: `Your mentor accepted the session on ${bookingData.sessionDate} at ${bookingData.sessionTime}. Join from your dashboard.`,
        read: false,
        actionUrl: '/dashboard',
        bookingId,
        sessionId,
        guideId: bookingData.guideId,
        createdAt: serverTimestamp()
      })

      // Notify mentor
      const mentorNotifRef = doc(collection(db, 'notifications'))
      transaction.set(mentorNotifRef, {
        userId: bookingData.guideId,
        type: 'booking_accepted',
        title: 'Session Accepted',
        body: `You accepted the session for ${bookingData.sessionDate} at ${bookingData.sessionTime}.`,
        read: false,
        actionUrl: '/mentor-portal',
        bookingId,
        sessionId,
        seekerId: bookingData.userId,
        createdAt: serverTimestamp()
      })

      return { success: true, sessionId }
    })
    return result
  } catch (error) {
    console.error('Error accepting booking request:', error)
    throw error
  }
}

export const declineBookingRequest = async (bookingId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }
      const bookingData = bookingDoc.data()
      if (bookingData.status !== 'pending') {
        throw new Error('Only pending booking requests can be declined')
      }

      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled',
        refundStatus: bookingData.paymentStatus === 'completed' ? 'review_required' : null,
        updatedAt: serverTimestamp()
      })

      // Release slot (Top-level guide_slots)
      if (bookingData.slotId) {
        const slotRef = doc(db, 'guide_slots', bookingData.slotId)
        transaction.update(slotRef, {
          isBooked: false,
          bookingId: null,
          bookedBy: null,
          updatedAt: serverTimestamp()
        })
      }

      // Notify seeker
      const seekerNotifRef = doc(collection(db, 'notifications'))
      transaction.set(seekerNotifRef, {
        userId: bookingData.userId,
        type: 'booking_declined',
        title: 'Session Declined',
        body: `Your booking request for ${bookingData.sessionDate || ''} was declined. Our team will review the payment if a refund is required.`,
        read: false,
        actionUrl: '/dashboard',
        createdAt: serverTimestamp()
      })

      return { success: true }
    })
    return result
  } catch (error) {
    console.error('Error declining booking request:', error)
    throw error
  }
}

export const cancelBooking = async (bookingId: string, cancelledBy: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }

      const bookingData = bookingDoc.data()

      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledBy,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Release slot (Top-level guide_slots)
      if (bookingData.slotId) {
        const slotRef = doc(db, 'guide_slots', bookingData.slotId)
        transaction.update(slotRef, {
          isBooked: false,
          bookedBy: null,
          bookingId: null,
          releasedAt: serverTimestamp()
        })
      }

      if (bookingData.sessionId) {
        const sessionRef = doc(db, 'sessions', bookingData.sessionId)
        transaction.update(sessionRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        })
      }

      return { success: true, bookingId }
    })

    return result
  } catch (error) {
    console.error('Cancellation failed:', error)
    throw error
  }
}

export const completeBookingSession = async (bookingId: string, sessionId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }

      const bookingData = bookingDoc.data()
      if (bookingData.status !== 'confirmed') {
        throw new Error('Only confirmed bookings can be completed')
      }

      const resolvedSessionId = sessionId || bookingData.sessionId
      transaction.update(bookingRef, { status: 'completed', updatedAt: serverTimestamp() })

      if (resolvedSessionId) {
        const sessionRef = doc(db, 'sessions', resolvedSessionId)
        transaction.set(sessionRef, {
          status: 'completed',
          endedAt: serverTimestamp()
        }, { merge: true })
      }

      return { success: true, sessionId: resolvedSessionId || null }
    })
    return result
  } catch (error) {
    console.error('Error completing booking session:', error)
    throw error
  }
}

export const saveGuideSessionNote = async (noteData: {
  guideId: string
  userId: string
  bookingId: string
  sessionId?: string
  note: string
  summary?: string
}) => {
  try {
    const bookingRef = doc(db, 'bookings', noteData.bookingId)
    const note = {
      id: `note_${Date.now()}`,
      guideId: noteData.guideId,
      userId: noteData.userId,
      sessionId: noteData.sessionId || '',
      note: noteData.note,
      summary: noteData.summary || '',
      lfid: await getSafeLFID(noteData.userId),
      isPrivate: true,
      createdAt: new Date().toISOString(),
    }
    await updateDoc(bookingRef, {
      guidePrivateNotes: arrayUnion(note),
      updatedAt: serverTimestamp(),
    })
    return { id: note.id }
  } catch (error) {
    console.error('Error saving guide note:', error)
    throw error
  }
}

export const getGuideNotesForLFID = async (guideId: string, userId: string) => {
  try {
    const history = await getGuideSessionHistoryForLFID(guideId, userId)
    return history.flatMap((booking: any) => (
      Array.isArray(booking.guidePrivateNotes)
        ? booking.guidePrivateNotes
            .filter((note: any) => note.guideId === guideId)
            .map((note: any) => ({
              ...note,
              bookingId: booking.id,
              createdAt: note.createdAt ? new Date(note.createdAt) : null,
            }))
        : []
    )).sort((a: any, b: any) => {
      const aTime = a.createdAt?.getTime?.() || 0
      const bTime = b.createdAt?.getTime?.() || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error('Failed to fetch guide notes:', error)
    return []
  }
}

export const getGuideSessionHistoryForLFID = async (guideId: string, userId: string) => {
  try {
    const bookingsRef = collection(db, 'bookings')
    const q = query(bookingsRef, where('guideId', '==', guideId), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt || null,
    })).sort((a: any, b: any) => {
      const aKey = `${a.sessionDate || ''} ${a.sessionTime || ''}`
      const bKey = `${b.sessionDate || ''} ${b.sessionTime || ''}`
      return bKey.localeCompare(aKey)
    })
  } catch (error) {
    console.error('Failed to fetch guide session history:', error)
    return []
  }
}

export const completeBookingSessionWithSummary = async (completionData: {
  bookingId: string
  sessionId?: string
  guideId: string
  userId: string
  summary: string
  recommendations: string
  followUp: string
  privateNote?: string
}) => {
  try {
    const privateNoteText = completionData.privateNote?.trim()
    const privateNote = privateNoteText
      ? {
          id: `note_${Date.now()}`,
          guideId: completionData.guideId,
          userId: completionData.userId,
          sessionId: completionData.sessionId || '',
          note: privateNoteText,
          summary: completionData.summary,
          lfid: await getSafeLFID(completionData.userId),
          isPrivate: true,
          createdAt: new Date().toISOString(),
        }
      : null

    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', completionData.bookingId)
      const bookingDoc = await transaction.get(bookingRef)
      if (!bookingDoc.exists()) throw new Error('Booking not found')

      const bookingData = bookingDoc.data()
      const earningAmount = Number(bookingData.finalAmount || bookingData.price || 0)

      const bookingUpdate: any = {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionSummary: completionData.summary,
        recommendations: completionData.recommendations,
        followUpSuggestions: completionData.followUp,
        earningStatus: 'pending',
        earningAmount,
        updatedAt: serverTimestamp(),
      }
      if (privateNote) {
        bookingUpdate.guidePrivateNotes = arrayUnion(privateNote)
      }

      transaction.update(bookingRef, bookingUpdate)

      if (completionData.sessionId) {
        const sessionRef = doc(db, 'sessions', completionData.sessionId)
        transaction.set(sessionRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          guideSummary: completionData.summary,
          recommendations: completionData.recommendations,
          followUpSuggestions: completionData.followUp,
        }, { merge: true })
      }

      const userNotifRef = doc(collection(db, 'notifications'))
      transaction.set(userNotifRef, {
        userId: completionData.userId,
        type: 'session_completed',
        title: 'Session Completed',
        body: 'Your guide has shared a session summary and recommendations.',
        read: false,
        actionUrl: '/sessions',
        bookingId: completionData.bookingId,
        createdAt: serverTimestamp(),
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to complete session with summary:', error)
    throw error
  }
}

export const subscribeToSessionsForGuide = (guideId: string, callback: (sessions: any[]) => void) => {
  const sessionsRef = collection(db, 'sessions')
  const q = query(sessionsRef, where('guideId', '==', guideId))

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }))
    callback(list)
  }, (err) => {
    console.error('Failed to listen to guide sessions:', err)
  })
}
