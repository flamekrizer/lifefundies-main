import { NextResponse } from 'next/server';

const CASHFREE_BASE_URL =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, amount, customerDetails, guideName } = body;

    if (!bookingId || !amount || !customerDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `LF_${bookingId}_${Date.now()}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerDetails.id || `user_${Date.now()}`,
        customer_name: customerDetails.name || 'LifeFundies User',
        customer_email: customerDetails.email || 'user@lifefundies.com',
        customer_phone: customerDetails.phone || '9999999999',
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lifefundies.com'}/session/${bookingId}?order_id={order_id}&order_token={order_token}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lifefundies.com'}/api/cashfree/webhook`,
      },
      order_note: `LifeFundies Session with ${guideName || 'Guide'}`,
      order_tags: {
        booking_id: bookingId,
      },
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree order creation failed:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to create payment order' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      cfOrderId: data.cf_order_id,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
