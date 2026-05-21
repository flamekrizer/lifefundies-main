'use client';

import { useState } from 'react';
import { createCashfreeOrder, verifyCashfreePayment } from '@/lib/paymentService';

export default function PaymentButton({ booking, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);

      const order = await createCashfreeOrder({
        bookingId: booking.id,
        amount: booking.amount,
        customer: {
          id: booking.userId,
          name: booking.userName || 'LifeFundies User',
          email: booking.userEmail || '',
          phone: booking.userPhone || '',
        },
      });

      const verification = await verifyCashfreePayment({
        orderId: order.orderId,
        bookingId: booking.id,
        paymentStatus: 'SUCCESS',
      });

      onSuccess?.({ order, verification });
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold"
    >
      {loading ? 'Processing payment...' : 'Pay with Cashfree'}
    </button>
  );
}
