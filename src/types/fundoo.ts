export type IRASender = 'user' | 'fundoo'

export interface IRAUserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  emotionState?: string
  recentDomains: string[]
  sessionHistory: string[]
  preferences: Record<string, unknown>
}

export interface IRAMessage {
  id: string
  sender: IRASender
  content: string
  timestamp: string
  emotion?: string
  domain?: string
  responseType?: string
  metadata?: Record<string, unknown>
}

export interface IRARequest {
  userId: string
  message: string
  userProfile: IRAUserProfile
  conversationContext: IRAMessage[]
  sessionId?: string
}

export interface IRASuggestedAction {
  type: 'GUIDE' | 'BOOK_MENTOR' | 'RESOURCE' | 'ESCALATE' | 'CHAT' | string
  label: string
  data?: {
    domain?: string
    [key: string]: unknown
  }
}

export interface IRAResponse {
  sessionId?: string
  message: string
  emotion: string
  domain: string
  responseType: 'GUIDE' | 'BOOK_MENTOR' | 'RESOURCE' | 'ESCALATE' | 'CHAT' | string
  suggestedActions?: IRASuggestedAction[]
  userProfileUpdate?: Partial<IRAUserProfile>
  metadata?: Record<string, unknown>
}
