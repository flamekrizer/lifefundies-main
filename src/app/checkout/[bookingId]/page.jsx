'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PaymentButton from '@/components/PaymentButton';
import { getBookingById, markBookingPaidAndCreateSession } from '@/lib/bookingService';
import { getGuideById } from '@/lib/guideService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [guide, setGuide] = useState(null);
  const [slot, setSlot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      try {
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);

        const [guideData, slotSnap] = await Promise.all([
          getGuideById(bookingData.guideId),
          getDoc(doc(db, 'guide_slots', bookingData.slotId)),
        ]);

        setGuide(guideData);
        if (slotSnap.exists()) {
          setSlot({ id: slotSnap.id, ...slotSnap.data() });
        }
      } catch (err) {
        setError(err.message || 'Unable to load checkout');
      }
    };

    load();
  }, [bookingId]);

  const handlePaymentSuccess = async ({ order, verification }) => {
    try {
      const result = await markBookingPaidAndCreateSession({
        bookingId,
        orderId: order.orderId,
        paymentId: verification.paymentId,
        paymentStatus: verification.status,
      });
      router.push(`/session/${result.sessionId}`);
    } catch (err) {
      setError(err.message || 'Payment post-processing failed');
    }
  };

  if (!booking) {
    return <main className="min-h-screen px-4 py-10">{error || 'Loading checkout...'}</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <div className="space-y-2 text-sm">
          <p><span className="text-gray-500">Booking:</span> {booking.id}</p>
          <p><span className="text-gray-500">Guide:</span> {guide?.name || booking.guideId}</p>
          <p><span className="text-gray-500">Slot:</span> {slot ? `${slot.date} ${slot.time}` : booking.slotId}</p>
          <p><span className="text-gray-500">Domain:</span> {booking.domain}</p>
          <p><span className="text-gray-500">Session Type:</span> {booking.sessionType}</p>
          <p className="text-lg font-semibold">Total: INR {booking.amount}</p>
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <PaymentButton
            booking={booking}
            onSuccess={handlePaymentSuccess}
            onError={(err) => setError(err.message || 'Payment failed')}
          />
        )}
      </div>
    </main>
  );
}
