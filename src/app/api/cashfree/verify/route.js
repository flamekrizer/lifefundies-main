export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.orderId || !body.bookingId) {
      return Response.json({ error: 'orderId and bookingId are required' }, { status: 400 });
    }

    return Response.json({
      success: true,
      verified: true,
      status: body.paymentStatus || 'SUCCESS',
      paymentId: `pay_${Date.now()}`,
      orderId: body.orderId,
      bookingId: body.bookingId,
      message: 'Payment verification mocked. Replace with server-side Cashfree verification in production.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
