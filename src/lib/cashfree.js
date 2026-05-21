/**
 * 💳 Cashfree Payment Integration
 * Handles payment initialization and verification
 */

// Load Cashfree SDK script
export const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize Cashfree and create payment session
 */
export const initiateCashfreePayment = async ({
  amount, // in rupees
  bookingId,
  guideName,
  userDetails,
  onSuccess,
  onFailure,
}) => {
  try {
    // Load Cashfree SDK if not already loaded
    const isLoaded = await loadCashfreeScript();
    if (!isLoaded) {
      throw new Error('Failed to load Cashfree SDK');
    }

    // Initialize Cashfree
    const cashfree = Cashfree({
      mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox', // sandbox or production
    });

    // In production, this order creation should happen on backend
    // For now, using frontend flow
    const orderData = {
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userDetails.id || `user_${Date.now()}`,
        customer_name: userDetails.name || 'LifeFundies User',
        customer_email: userDetails.email || '',
        customer_phone: userDetails.phone || '',
      },
      order_meta: {
        return_url: `${window.location.origin}/session/${bookingId}`,
        notify_url: `${window.location.origin}/api/cashfree-webhook`,
      },
      order_note: `Session with ${guideName}`,
    };

    // TODO: Replace with actual backend API call to create order
    // const response = await fetch('/api/cashfree/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData),
    // });
    // const { order_id, payment_session_id } = await response.json();

    // For now, using dummy session ID (will fail in actual payment)
    const paymentSessionId = `session_${bookingId}_${Date.now()}`;

    // Configure checkout options
    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      returnUrl: `${window.location.origin}/session/${bookingId}`,
      // Optional: customize appearance
      theme: {
        backgroundColor: '#ffffff',
        color: '#10b981',
        fontSize: '14px',
      },
    };

    // Open Cashfree Drop-in checkout
    cashfree.checkout(checkoutOptions).then((result) => {
      if (result.error) {
        console.error('Payment failed:', result.error);
        onFailure?.(new Error(result.error.message || 'Payment failed'));
      } else if (result.paymentDetails) {
        // Payment successful
        onSuccess({
          orderId: result.paymentDetails.orderId,
          paymentId: result.paymentDetails.paymentId,
          paymentStatus: result.paymentDetails.paymentStatus,
        });
      }
    });
  } catch (error) {
    console.error('Cashfree initialization error:', error);
    onFailure?.(error);
  }
};

/**
 * Verify payment status (should be done on backend)
 */
export const verifyCashfreePayment = async (orderId) => {
  try {
    // TODO: Implement backend verification
    // const response = await fetch(`/api/cashfree/verify-payment?order_id=${orderId}`);
    // return await response.json();
    
    console.warn('Payment verification should be implemented on backend');
    return { verified: true, orderId };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { verified: false, error: error.message };
  }
};

/**
 * Format amount for display
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get payment status message
 */
export const getPaymentStatusMessage = (status) => {
  const messages = {
    PENDING: 'Payment pending',
    SUCCESS: 'Payment successful',
    FAILED: 'Payment failed',
    USER_DROPPED: 'Payment cancelled by user',
    VOID: 'Payment voided',
    CANCELLED: 'Payment cancelled',
    FLAGGED: 'Payment flagged for review',
  };
  return messages[status] || 'Unknown status';
};

/**
 * Create order on backend (template for API route)
 * Create this at: /app/api/cashfree/create-order/route.js
 */
export const createOrderTemplate = `
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: body.orderId,
        order_amount: body.amount,
        order_currency: 'INR',
        customer_details: body.customer_details,
        order_meta: body.order_meta,
        order_note: body.order_note,
      }),
    });
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
`;
