import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const HMS_API_BASE = 'https://api.100ms.live/v2'

const normalizeRoomName = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'lf-session'

const getManagementToken = () => {
  const accessKey = process.env.HMS_ACCESS_KEY
  const secret = process.env.HMS_SECRET
  if (!accessKey || !secret) return null

  return jwt.sign(
    { access_key: accessKey, type: 'management', version: 2 },
    secret,
    { algorithm: 'HS256', expiresIn: '5m', jwtid: crypto.randomUUID() },
  )
}

const hmsFetch = (path, token, init = {}) =>
  fetch(`${HMS_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const templateId = process.env.HMS_TEMPLATE_ID
  const managementToken = getManagementToken()
  if (!managementToken || !templateId) {
    res.status(500).json({ error: '100ms credentials are not configured.' })
    return
  }

  try {
    const { sessionId, userName } = req.body || {}
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required.' })
      return
    }

    const roomName = `lf-session-${normalizeRoomName(sessionId)}`
    const displayName = String(userName || 'Guest').trim().slice(0, 60) || 'Guest'

    let room
    const lookupResponse = await hmsFetch(`/rooms?name=${encodeURIComponent(roomName)}`, managementToken)
    const lookupData = await lookupResponse.json()
    if (lookupResponse.ok && lookupData?.data?.length) {
      room = lookupData.data[0]
    } else {
      const createResponse = await hmsFetch('/rooms', managementToken, {
        method: 'POST',
        body: JSON.stringify({ name: roomName, template_id: templateId }),
      })
      room = await createResponse.json()
      if (!createResponse.ok) {
        res.status(createResponse.status).json({
          error: room?.message || '100ms room creation failed.',
        })
        return
      }
    }

    let codesResponse = await hmsFetch(`/room-codes/room/${room.id}`, managementToken)
    let codesData = await codesResponse.json()
    if (!codesData?.data?.length) {
      codesResponse = await hmsFetch(`/room-codes/room/${room.id}`, managementToken, { method: 'POST' })
      codesData = await codesResponse.json()
      if (!codesResponse.ok) {
        res.status(codesResponse.status).json({
          error: codesData?.message || '100ms room code creation failed.',
        })
        return
      }
    }

    const roomCode = codesData.data[0]?.code
    if (!roomCode) {
      res.status(500).json({ error: 'No 100ms room code available.' })
      return
    }

    res.status(200).json({ roomCode, userName: displayName })
  } catch (error) {
    console.error('100ms create room error:', error)
    res.status(500).json({ error: error.message || '100ms room creation failed.' })
  }
}
