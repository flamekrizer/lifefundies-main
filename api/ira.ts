import { IRARequest, IRAResponse } from '../types/fundoo'

const IRA_API_URL = import.meta.env.VITE_IRA_API_URL || 'http://127.0.0.1:8000'

export const callIRA = async (request: IRARequest): Promise<IRAResponse> => {
  const response = await fetch(`${IRA_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`IRA API Error: ${response.statusText}`)
  }

  const data: IRAResponse = await response.json()
  return data
}

export const getSessionHistory = async (sessionId: string) => {
  const response = await fetch(`${IRA_API_URL}/api/session/${sessionId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch session history')
  }

  return response.json()
}

export const saveUserMemory = async (userId: string, memory: any) => {
  const response = await fetch(`${IRA_API_URL}/api/memory/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memory),
  })

  if (!response.ok) {
    throw new Error('Failed to save memory')
  }

  return response.json()
}

export const getUserMemory = async (userId: string) => {
  const response = await fetch(`${IRA_API_URL}/api/memory/${userId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch user memory')
  }

  return response.json()
}

export const getMentorsForDomain = async (domain: string) => {
  const response = await fetch(`${IRA_API_URL}/api/booking/mentors?domain=${encodeURIComponent(domain)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch mentors')
  }

  return response.json()
}

export const createIRABooking = async (booking: {
  mentorId: string
  domain: string
  slotDate: string
  slotTime: string
  userId: string
  price: number
}) => {
  const response = await fetch(`${IRA_API_URL}/api/booking/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    throw new Error('Failed to create booking')
  }

  return response.json()
}
