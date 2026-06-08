import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
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
const buildDir = path.join(__dirname, process.env.VITE_BUILD_DIR || 'build')
const indexPath = path.join(buildDir, 'index.html')
const chatRooms = new Map()

const getReferencedAssets = () => {
  if (!fs.existsSync(indexPath)) return []
  const indexHtml = fs.readFileSync(indexPath, 'utf8')
  return Array.from(indexHtml.matchAll(/\/assets\/[^"')\s<>]+/g), match => match[0])
}

const hasCompleteBuild = () => {
  if (!fs.existsSync(indexPath)) return false
  const assets = getReferencedAssets()
  return assets.length > 0 && assets.every(assetPath => {
    const relativeAssetPath = assetPath.replace(/^\//, '')
    return fs.existsSync(path.join(buildDir, relativeAssetPath))
  })
}

const ensureBuild = () => {
  if (hasCompleteBuild()) return

  console.log('Build output missing or incomplete. Running npm run build...')
  execFileSync('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  })

  if (!hasCompleteBuild()) {
    throw new Error('Build completed, but build assets are still missing.')
  }
}

ensureBuild()

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

const normalizeRoomId = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'general'

app.get('/api/chatrooms/:roomId/messages', (req, res) => {
  const roomId = normalizeRoomId(req.params.roomId)
  res.status(200).json({
    roomId,
    messages: chatRooms.get(roomId) || [],
  })
})

app.post('/api/chatrooms/:roomId/messages', (req, res) => {
  const roomId = normalizeRoomId(req.params.roomId)
  const message = String(req.body?.message || '').trim()
  const authorName = String(req.body?.authorName || 'Anonymous').trim().slice(0, 60) || 'Anonymous'
  const authorId = String(req.body?.authorId || 'guest').trim().slice(0, 120) || 'guest'

  if (!message) {
    res.status(400).json({ error: 'message is required.' })
    return
  }

  if (message.length > 800) {
    res.status(400).json({ error: 'message must be 800 characters or less.' })
    return
  }

  const roomMessages = chatRooms.get(roomId) || []
  const nextMessage = {
    id: `${roomId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomId,
    authorId,
    authorName,
    message,
    createdAt: new Date().toISOString(),
  }

  const nextMessages = [...roomMessages, nextMessage].slice(-120)
  chatRooms.set(roomId, nextMessages)

  res.status(201).json(nextMessage)
})

app.use('/assets', express.static(path.join(buildDir, 'assets'), {
  immutable: true,
  maxAge: '1y',
}))

app.use('/assets', (_req, res) => {
  res.status(404).type('text/plain').send('Asset not found. Run npm run build before starting the server.')
})

app.use(express.static(buildDir, {
  extensions: ['html'],
  maxAge: '1y',
  setHeaders: (res, servedPath) => {
    if (servedPath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  },
}))

app.get('*', (_req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`LifeFundies server listening on port ${port}`)
})
