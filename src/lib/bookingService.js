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
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * 🎯 BOOKING SERVICE - Core booking logic for LifeFundies
 * Handles guide slots, bookings, and session creation
 */

// ============================================
// 📅 SLOT MANAGEMENT
// ============================================

/**
 * Get available slots for a guide
 */
export async function getGuideSlots(guideId, startDate, endDate) {
  try {
    let slots = [];
    
    // 1. Try fetching from top-level guide_slots
    try {
      const q = query(
        collection(db, 'guide_slots'),
        where('guideId', '==', guideId),
        where('isBooked', '==', false)
      );
      const snapshot = await getDocs(q);
      slots = snapshot.docs.map(doc => ({
        id: doc.id,
        source: 'guide_slots',
        ...doc.data()
      }));
    } catch (err) {
      console.warn('Top-level guide_slots query failed (likely due to missing firestore rules), falling back to nested slots:', err);
    }

    // 2. Fallback to legacy guides/{guideId}/slots subcollection
    if (slots.length === 0) {
      const legacyQ = query(
        collection(db, 'guides', guideId, 'slots'),
        where('isBooked', '==', false)
      );
      const legacySnapshot = await getDocs(legacyQ);
      slots = legacySnapshot.docs.map(doc => ({
        id: doc.id,
        source: 'guides',
        ...doc.data()
      }));
    }

    // 3. Filter by date range and other flags (in-memory)
    return slots
      .filter(slot => {
        if (!slot?.date) return false;
        if (slot.isBlocked === true || slot.isActive === false) return false;
        
        // Date strings are in format YYYY-MM-DD, direct string comparison is safe and accurate
        const slotDate = slot.date;
        const start = startDate ? (startDate.includes('T') ? startDate.split('T')[0] : startDate) : null;
        const end = endDate ? (endDate.includes('T') ? endDate.split('T')[0] : endDate) : null;
        
        if (start && slotDate < start) return false;
        if (end && slotDate > end) return false;
        
        return true;
      })
      .sort((a, b) => {
        const aKey = `${a.date || ''} ${a.time || ''}`;
        const bKey = `${b.date || ''} ${b.time || ''}`;
        return aKey.localeCompare(bKey);
      });
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
}

async function resolveSlotReference(guideId, slotId) {
  const topLevelRef = doc(db, 'guide_slots', slotId);
  const topLevelSnap = await getDoc(topLevelRef);
  if (topLevelSnap.exists()) {
    const slotData = topLevelSnap.data();
    if (!slotData.guideId || slotData.guideId === guideId) {
      return { ref: topLevelRef, data: slotData };
    }
  }

  const nestedRef = doc(db, 'guides', guideId, 'slots', slotId);
  const nestedSnap = await getDoc(nestedRef);
  if (nestedSnap.exists()) {
    return { ref: nestedRef, data: nestedSnap.data() };
  }

  return null;
}

/**
 * Check if a specific slot is available
 */
export async function checkSlotAvailability(guideId, slotId) {
  try {
    const resolved = await resolveSlotReference(guideId, slotId);
    if (!resolved) {
      return { available: false, reason: 'Slot not found' };
    }

    const slotData = resolved.data;

    if (slotData.isBooked) {
      return { available: false, reason: 'Already booked' };
    }

    if (slotData.isBlocked) {
      return { available: false, reason: 'Slot blocked by guide' };
    }

    return { available: true, slot: slotData };
  } catch (error) {
    console.error('Error checking slot:', error);
    throw error;
  }
}

// ============================================
// 🔒 BOOKING CREATION (With Transaction Lock)
// ============================================

/**
 * Create a booking with atomic slot locking
 * This prevents double booking
 */
export async function createBooking({
  userId,
  guideId,
  slotId,
  domain,
  selectedIssue,
  userNotes,
  price
}) {
  try {
    // Run as transaction for atomic operation
    const result = await runTransaction(db, async (transaction) => {
      const resolved = await resolveSlotReference(guideId, slotId);
      if (!resolved) {
        throw new Error('Slot not found');
      }

      const slotRef = resolved.ref;
      const slotData = resolved.data;

      if (slotData.isBooked) {
        throw new Error('Slot already booked');
      }

      if (slotData.isBlocked) {
        throw new Error('Slot not available');
      }

      // 2. Create booking document
      const bookingRef = doc(collection(db, 'bookings'));
      const bookingData = {
        bookingId: bookingRef.id,
        userId,
        guideId,
        slotId,
        domain,
        selectedIssue: selectedIssue || '',
        userNotes: userNotes || '',
        price,
        discount: 0,
        finalAmount: price,
        paymentStatus: 'pending',
        status: 'pending',
        sessionDate: slotData.date,
        sessionTime: slotData.time,
        sessionDuration: slotData.duration,
        sessionCreated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      transaction.set(bookingRef, bookingData);
      
      // 3. Lock the slot (mark as booked)
      transaction.update(slotRef, {
        isBooked: true,
        bookedBy: userId,
        bookingId: bookingRef.id,
        bookedAt: serverTimestamp()
      });
      
      return {
        bookingId: bookingRef.id,
        ...bookingData
      };
    });
    
    console.log('✅ Booking created:', result.bookingId);
    return result;
    
  } catch (error) {
    console.error('❌ Booking failed:', error.message);
    throw error;
  }
}

// ============================================
// 💳 PAYMENT CONFIRMATION
// ============================================

/**
 * Confirm payment and create session
 */
export async function confirmPayment({
  bookingId,
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // 1. Get booking
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const bookingData = bookingDoc.data();
      
      // 2. Update booking with payment info
      transaction.update(bookingRef, {
        paymentId,
        paymentStatus: 'completed',
        status: 'pending',
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // 3. Create payment record
      const paymentRef = doc(collection(db, 'payments'));
      transaction.set(paymentRef, {
        paymentId: paymentRef.id,
        bookingId,
        userId: bookingData.userId,
        amount: bookingData.finalAmount,
        currency: 'INR',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      });

      // 4. Send notification to Seeker
      const notifRef = doc(collection(db, 'notifications'));
      transaction.set(notifRef, {
        userId: bookingData.userId,
        type: 'booking_requested',
        title: 'Booking Request Sent!',
        body: `Your booking request for ${bookingData.sessionDate} at ${bookingData.sessionTime} has been sent to the mentor.`,
        read: false,
        actionUrl: '/dashboard',
        createdAt: serverTimestamp()
      });

      // 5. Send notification to Mentor
      const mentorNotifRef = doc(collection(db, 'notifications'));
      transaction.set(mentorNotifRef, {
        userId: bookingData.guideId,
        type: 'booking_request_received',
        title: 'New Booking Request!',
        body: `You have a new booking request for ${bookingData.sessionDate} at ${bookingData.sessionTime}.`,
        read: false,
        actionUrl: '/mentor-portal',
        createdAt: serverTimestamp()
      });
      
      return {
        bookingId,
        status: 'pending'
      };
    });
    
    console.log('✅ Payment confirmed, booking is pending mentor approval:', bookingId);
    return result;
    
  } catch (error) {
    console.error('❌ Payment confirmation failed:', error);
    throw error;
  }
}

// ============================================
// 📊 BOOKING QUERIES
// ============================================

/**
 * Get user's bookings
 */
export async function getUserBookings(userId) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Listen to user's bookings in real-time so accepted sessions appear without refresh.
 */
export function listenToUserBookings(userId, onUpdate) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(data);
    }, (error) => {
      console.error('Error listening to user bookings:', error);
    });
  } catch (error) {
    console.error('Error setting up user bookings listener:', error);
    return () => {};
  }
}

/**
 * Get guide's bookings
 */
export async function getGuideBookings(guideId) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('guideId', '==', guideId),
      where('status', '==', 'confirmed'),
      orderBy('sessionDate'),
      orderBy('sessionTime')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching guide bookings:', error);
    throw error;
  }
}

/**
 * Get single booking details
 */
export async function getBooking(bookingId) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    return {
      id: bookingDoc.id,
      ...bookingDoc.data()
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

// ============================================
// ❌ BOOKING CANCELLATION
// ============================================

/**
 * Cancel a booking (before session)
 */
export async function cancelBooking(bookingId, cancelledBy) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Get booking
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const bookingData = bookingDoc.data();
      
      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledBy,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Release the slot
      const slotRef = doc(db, 'guides', bookingData.guideId, 'slots', bookingData.slotId);
      transaction.update(slotRef, {
        isBooked: false,
        bookedBy: null,
        bookingId: null,
        releasedAt: serverTimestamp()
      });
      
      // If session exists, mark as cancelled
      if (bookingData.sessionId) {
        const sessionRef = doc(db, 'sessions', bookingData.sessionId);
        transaction.update(sessionRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        });
      }
      
      return { success: true, bookingId };
    });
    
    console.log('✅ Booking cancelled:', bookingId);
    return result;
    
  } catch (error) {
    console.error('❌ Cancellation failed:', error);
    throw error;
  }
}

const bookingService = {
  getGuideSlots,
  checkSlotAvailability,
  createBooking,
  confirmPayment,
  getUserBookings,
  getGuideBookings,
  getBooking,
  cancelBooking
};

export default bookingService;

// ============================================
// 🧩 V2 FLOW (guides + guide_slots + checkout)
// ============================================

export async function createBookingDraft({
  userId,
  guideId,
  slotId,
  domain,
  issueSummary,
  sessionType,
  amount,
}) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const slotRef = doc(db, 'guide_slots', slotId);
      const slotDoc = await transaction.get(slotRef);

      if (!slotDoc.exists()) {
        throw new Error('Slot not found');
      }

      const slotData = slotDoc.data();
      if (slotData.guideId !== guideId) {
        throw new Error('Slot does not belong to selected guide');
      }

      if (slotData.isBooked) {
        throw new Error('Selected slot is already booked');
      }

      const bookingRef = doc(collection(db, 'bookings'));
      const bookingData = {
        userId,
        guideId,
        slotId,
        domain,
        issueSummary: issueSummary || '',
        sessionType,
        amount,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      transaction.set(bookingRef, bookingData);
      transaction.update(slotRef, {
        isBooked: true,
        bookingId: bookingRef.id,
        bookedBy: userId,
        updatedAt: serverTimestamp(),
      });

      return { id: bookingRef.id, ...bookingData };
    });

    return result;
  } catch (error) {
    console.error('createBookingDraft failed:', error);
    throw error;
  }
}

export async function getBookingById(bookingId) {
  const ref = doc(db, 'bookings', bookingId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('Booking not found');
  }

  return { id: snap.id, ...snap.data() };
}

export async function markBookingPaidAndCreateSession({
  bookingId,
  orderId,
  paymentId,
  paymentStatus,
}) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const bookingData = bookingDoc.data();

      transaction.update(bookingRef, {
        status: 'paid',
        paymentStatus: 'paid',
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const paymentRef = doc(collection(db, 'payments'));
      transaction.set(paymentRef, {
        bookingId,
        userId: bookingData.userId,
        guideId: bookingData.guideId,
        amount: bookingData.amount,
        orderId,
        paymentId,
        status: paymentStatus || 'SUCCESS',
        createdAt: serverTimestamp(),
      });

      const sessionRef = doc(collection(db, 'sessions'));
      transaction.set(sessionRef, {
        bookingId,
        userId: bookingData.userId,
        guideId: bookingData.guideId,
        status: 'upcoming',
        notes: '',
        reflection: '',
        createdAt: serverTimestamp(),
      });

      transaction.update(bookingRef, {
        sessionId: sessionRef.id,
      });

      return {
        sessionId: sessionRef.id,
        bookingId,
      };
    });

    return result;
  } catch (error) {
    console.error('markBookingPaidAndCreateSession failed:', error);
    throw error;
  }
}

/**
 * Listen to user notifications in real-time
 */
export function listenToUserNotifications(userId, onUpdate) {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      onUpdate(data);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });
  } catch (error) {
    console.error('Error setting up notifications listener:', error);
    return () => {};
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error marking notification read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications read:', error);
  }
}

/**
 * Get all bookings for a guide
 */
export async function getGuideAllBookings(guideId) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('guideId', '==', guideId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching all guide bookings:', error);
    throw error;
  }
}

/**
 * Accept a booking request
 */
export async function acceptBookingRequest(bookingId) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      const bookingData = bookingDoc.data();
      const existingSessionId = bookingData.sessionId || null;
      let sessionId = existingSessionId;

      // Update booking status
      transaction.update(bookingRef, {
        status: 'confirmed',
        paymentStatus: 'completed', // auto confirm payment for mentor direct acceptance
        updatedAt: serverTimestamp()
      });

      // Create session document in sessions collection once.
      if (!existingSessionId) {
        const sessionRef = doc(collection(db, 'sessions'));
        sessionId = sessionRef.id;
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
        };
        transaction.set(sessionRef, sessionData);
      }

      // Update booking with session ID
      transaction.update(bookingRef, {
        sessionCreated: true,
        sessionId
      });

      // Send notification to the seeker
      const notifRef = doc(collection(db, 'notifications'));
      const notifData = {
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
      };
      transaction.set(notifRef, notifData);

      const mentorNotifRef = doc(collection(db, 'notifications'));
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
      });

      return { success: true, sessionId };
    });
    return result;
  } catch (error) {
    console.error('Error accepting booking request:', error);
    throw error;
  }
}

/**
 * Decline a booking request
 */
export async function declineBookingRequest(bookingId) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      const bookingData = bookingDoc.data();

      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Release the slot if it is top-level
      if (bookingData.slotId) {
        const slotRef = doc(db, 'guide_slots', bookingData.slotId);
        transaction.update(slotRef, {
          isBooked: false,
          bookingId: null,
          bookedBy: null,
          updatedAt: serverTimestamp()
        });
      }

      // Send notification to seeker
      const notifRef = doc(collection(db, 'notifications'));
      const notifData = {
        userId: bookingData.userId,
        type: 'booking_declined',
        title: 'Session Declined',
        body: `Your booking request for ${bookingData.sessionDate || ''} was declined.`,
        read: false,
        actionUrl: '/dashboard',
        createdAt: serverTimestamp()
      };
      transaction.set(notifRef, notifData);

      return { success: true };
    });
    return result;
  } catch (error) {
    console.error('Error declining booking request:', error);
    throw error;
  }
}

/**
 * Create a new availability slot for a guide
 */
export async function createGuideSlot({ guideId, date, time, duration = 60, price = 499 }) {
  try {
    const slotsRef = collection(db, 'guide_slots');
    const newSlotDoc = await addDoc(slotsRef, {
      guideId,
      date,
      time,
      duration,
      price,
      isBooked: false,
      isBlocked: false,
      isActive: true,
      createdAt: serverTimestamp()
    });
    return { id: newSlotDoc.id };
  } catch (error) {
    console.error('Error creating guide slot:', error);
    throw error;
  }
}

/**
 * Delete a guide slot (if not booked)
 */
export async function deleteGuideSlot(slotId) {
  try {
    const slotRef = doc(db, 'guide_slots', slotId);
    const slotDoc = await getDoc(slotRef);
    if (!slotDoc.exists()) {
      throw new Error('Slot not found');
    }
    if (slotDoc.data().isBooked) {
      throw new Error('Cannot delete a booked slot');
    }
    await deleteDoc(slotRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting guide slot:', error);
    throw error;
  }
}

/**
 * Complete a booking and its session
 */
export async function completeBookingSession(bookingId, sessionId) {
  try {
    const batch = writeBatch(db);
    const bookingRef = doc(db, 'bookings', bookingId);
    batch.update(bookingRef, { status: 'completed', updatedAt: serverTimestamp() });
    
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId);
      batch.update(sessionRef, { status: 'completed', endedAt: serverTimestamp() });
    }
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error completing booking session:', error);
    throw error;
  }
}
