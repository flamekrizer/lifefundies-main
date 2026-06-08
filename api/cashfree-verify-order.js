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
    const { orderId } = req.body || {}
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required.' })
      return
    }

    const response = await fetch(`${getCashfreeBaseUrl()}/pg/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': process.env.CASHFREE_API_VERSION || '2023-08-01',
      },
    })

    const data = await response.json()
    if (!response.ok) {
      res.status(response.status).json({
        error: data?.message || data?.error_description || 'Cashfree order verification failed.',
        cashfree: data,
      })
      return
    }

    res.status(200).json({
      order_id: data.order_id,
      order_status: data.order_status,
      payment_status: data.order_status === 'PAID' ? 'success' : data.order_status,
      cf_order_id: data.cf_order_id,
    })
  } catch (error) {
    console.error('Cashfree verify order error:', error)
    res.status(500).json({ error: error.message || 'Cashfree order verification failed.' })
  }
}
