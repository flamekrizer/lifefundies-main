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
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { createNotification } from './notificationRepository'

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
    const slots = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as any[]

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
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })).sort((a: any, b: any) => {
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
      if (slotData.isBooked) {
        throw new Error('Slot already booked')
      }
      if (slotData.isBlocked) {
        throw new Error('Slot not available')
      }

      const bookingRef = doc(collection(db, 'bookings'))
      const bookingData = {
        bookingId: bookingRef.id,
        userId: bookingDetails.userId,
        guideId: bookingDetails.guideId,
        slotId: bookingDetails.slotId,
        domain: bookingDetails.domain,
        selectedIssue: bookingDetails.selectedIssue || '',
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      transaction.set(bookingRef, bookingData)
      transaction.update(slotRef, {
        isBooked: true,
        bookedBy: bookingDetails.userId,
        bookingId: bookingRef.id,
        bookedAt: serverTimestamp()
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

      transaction.update(bookingRef, {
        paymentId: paymentDetails.paymentId,
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

      let clientName = `Client (${userId.substring(0, 6)})`
      let clientPhotoURL = ''

      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            clientName = userData.displayName || userData.fullName || clientName
            clientPhotoURL = userData.photoURL || ''
          }
        } catch (e) {
          console.error('Error fetching user profile in booking join:', e)
        }
      }

      return {
        id: docSnap.id,
        ...data,
        clientName,
        clientPhotoURL,
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

      let clientName = `Client (${userId.substring(0, 6)})`
      let clientPhotoURL = ''

      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            clientName = userData.displayName || userData.fullName || clientName
            clientPhotoURL = userData.photoURL || ''
          }
        } catch (e) {
          console.error('Error fetching user profile in booking join:', e)
        }
      }

      return {
        id: docSnap.id,
        ...data,
        clientName,
        clientPhotoURL,
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
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })).sort((a: any, b: any) => {
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
          scheduledAt: bookingData.sessionDate && bookingData.sessionTime
            ? `${bookingData.sessionDate}T${bookingData.sessionTime}:00`
            : '',
          duration: bookingData.sessionDuration || 60,
          status: 'upcoming',
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

      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled',
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
        body: `Your booking request for ${bookingData.sessionDate || ''} was declined.`,
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
    const batch = writeBatch(db)
    const bookingRef = doc(db, 'bookings', bookingId)
    batch.update(bookingRef, { status: 'completed', updatedAt: serverTimestamp() })

    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId)
      batch.update(sessionRef, { status: 'completed', endedAt: serverTimestamp() })
    }
    await batch.commit()
    return { success: true }
  } catch (error) {
    console.error('Error completing booking session:', error)
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
