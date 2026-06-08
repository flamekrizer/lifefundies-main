export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Webhook signature verification can be added here once the webhook secret is configured.
  console.log('Cashfree webhook received:', req.body)
  res.status(200).json({ ok: true })
}
