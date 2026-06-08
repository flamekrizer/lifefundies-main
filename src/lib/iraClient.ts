import type { IRARequest, IRAResponse } from '../types/fundoo'

const getIraApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_IRA_API_URL || ''
  const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredUrl)

  if (import.meta.env.PROD && isLocalUrl) return ''
  return configuredUrl || ''
}

const IRA_API_URL = getIraApiUrl()

export async function callIRA(request: IRARequest): Promise<IRAResponse> {
  const response = await fetch(`${IRA_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `IRA API Error: ${response.status}`)
  }

  return response.json()
}

export async function getIRAStatus() {
  const response = await fetch(`${IRA_API_URL}/api/chat/status`)

  if (!response.ok) {
    throw new Error(`IRA status unavailable: ${response.status}`)
  }

  return response.json() as Promise<{ llmConfigured: boolean; model: string }>
}
