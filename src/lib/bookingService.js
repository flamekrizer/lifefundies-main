import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  runTransaction
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

/**
 * Check if a specific slot is available
 */
export async function checkSlotAvailability(guideId, slotId) {
  try {
    const slotRef = doc(db, 'guides', guideId, 'slots', slotId);
    const slotDoc = await getDoc(slotRef);
    
    if (!slotDoc.exists()) {
      return { available: false, reason: 'Slot not found' };
    }
    
    const slotData = slotDoc.data();
    
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
      // 1. Check slot availability
      const slotRef = doc(db, 'guides', guideId, 'slots', slotId);
      const slotDoc = await transaction.get(slotRef);
      
      if (!slotDoc.exists()) {
        throw new Error('Slot not found');
      }
      
      const slotData = slotDoc.data();
      
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
        status: 'confirmed',
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // 3. Create session document
      const sessionRef = doc(collection(db, 'sessions'));
      const sessionData = {
        sessionId: sessionRef.id,
        bookingId,
        userId: bookingData.userId,
        guideId: bookingData.guideId,
        domain: bookingData.domain,
        scheduledAt: `${bookingData.sessionDate}T${bookingData.sessionTime}:00Z`,
        duration: bookingData.sessionDuration,
        status: 'upcoming',
        videoRoomId: `lf_room_${sessionRef.id}`,
        chatEnabled: true,
        createdAt: serverTimestamp()
      };
      
      transaction.set(sessionRef, sessionData);
      
      // 4. Update booking with sessionId
      transaction.update(bookingRef, {
        sessionCreated: true,
        sessionId: sessionRef.id
      });
      
      // 5. Create payment record
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
      
      return {
        sessionId: sessionRef.id,
        bookingId,
        status: 'confirmed'
      };
    });
    
    console.log('✅ Payment confirmed, session created:', result.sessionId);
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
