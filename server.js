import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import cashfreeCreateOrder from './api/cashfree-create-order.js'
import cashfreeVerifyOrder from './api/cashfree-verify-order.js'
import cashfreeWebhook from './api/cashfree-webhook.js'
import chatHandler from './api/chat.js'
import chatStatusHandler from './api/chat/status.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 3000
const distDir = path.join(__dirname, 'dist')

app.disable('x-powered-by')
app.set('trust proxy', true)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'lifefundies' })
})

app.post('/api/cashfree-create-order', cashfreeCreateOrder)
app.post('/api/cashfree-verify-order', cashfreeVerifyOrder)
app.post('/api/cashfree-webhook', cashfreeWebhook)
app.post('/api/chat', chatHandler)
app.get('/api/chat/status', chatStatusHandler)

app.use('/assets', express.static(path.join(distDir, 'assets'), {
  immutable: true,
  maxAge: '1y',
}))

app.use('/assets', (_req, res) => {
  res.status(404).type('text/plain').send('Asset not found. Run npm run build before starting the server.')
})

app.use(express.static(distDir, {
  extensions: ['html'],
  maxAge: '1y',
  setHeaders: (res, servedPath) => {
    if (servedPath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  },
}))

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`LifeFundies server listening on port ${port}`)
})
