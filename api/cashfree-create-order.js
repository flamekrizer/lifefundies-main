const getCashfreeBaseUrl = () => {
  const env = process.env.CASHFREE_ENV || process.env.VITE_CASHFREE_ENV || 'sandbox'
  return env === 'production' || env === 'prod'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com'
}

const getCashfreeCredentials = () => ({
  appId: process.env.CASHFREE_APP_ID || process.env.VITE_CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY || process.env.VITE_CASHFREE_SECRET_KEY,
})

const getAppUrl = (req) => {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return host ? `${proto}://${host}` : 'http://localhost:5173'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { appId, secretKey } = getCashfreeCredentials()

  if (!appId || !secretKey) {
    res.status(500).json({ error: 'Cashfree app id or secret key is not configured.' })
    return
  }

  try {
    const {
      bookingId,
      amount,
      mentorName,
      customer,
    } = req.body || {}

    if (!bookingId || !amount || !customer?.id) {
      res.status(400).json({ error: 'bookingId, amount, and customer.id are required.' })
      return
    }

    const appUrl = getAppUrl(req)
    const orderId = `LF_${bookingId}_${Date.now()}`
    const customerPhone = String(customer.phone || '').replace(/\D/g, '').slice(-10) || '9999999999'

    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      order_note: `LifeFundies session${mentorName ? ` with ${mentorName}` : ''}`,
      customer_details: {
        customer_id: String(customer.id),
        customer_name: customer.name || 'LifeFundies Seeker',
        customer_email: customer.email || 'support@lifefundies.in',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${appUrl}/sessions?bookingId=${encodeURIComponent(bookingId)}&order_id={order_id}`,
        notify_url: `${appUrl}/api/cashfree-webhook`,
      },
      order_tags: {
        bookingId,
        platform: 'lifefundies',
      },
    }

    const response = await fetch(`${getCashfreeBaseUrl()}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': process.env.CASHFREE_API_VERSION || '2023-08-01',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      res.status(response.status).json({
        error: data?.message || data?.error_description || 'Cashfree order creation failed.',
        cashfree: data,
      })
      return
    }

    res.status(200).json({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      order_status: data.order_status,
    })
  } catch (error) {
    console.error('Cashfree create order error:', error)
    res.status(500).json({ error: error.message || 'Cashfree order creation failed.' })
  }
}
