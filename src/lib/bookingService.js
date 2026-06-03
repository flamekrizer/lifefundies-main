/**
 * BookingService Facade (JS Wrapper)
 * Forwards calls to the standardized BookingRepository.
 */

import {
  subscribeToUserBookings,
  subscribeToGuideBookings,
  subscribeToGuideSlots,
  createGuideSlot,
  deleteGuideSlot,
  createBookingDraft,
  confirmPaymentAndNotify,
  acceptBookingRequest,
  declineBookingRequest,
  completeBookingSession,
  cancelBooking,
  subscribeToSessionsForGuide
} from './bookingRepository';

export {
  subscribeToUserBookings,
  subscribeToGuideBookings,
  subscribeToGuideSlots,
  createGuideSlot,
  deleteGuideSlot,
  createBookingDraft,
  confirmPaymentAndNotify,
  acceptBookingRequest,
  declineBookingRequest,
  completeBookingSession,
  cancelBooking,
  subscribeToSessionsForGuide
};
