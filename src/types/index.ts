// TypeScript Types & Interfaces for LifeFundies

export type UserRole = 'user' | 'mentor' | 'admin'

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export const LIFE_DOMAINS = [
  { id: 'career', label: 'Career & Purpose', icon: '🎯', color: '#0D7377', description: 'Find your professional direction and calling' },
  { id: 'emotional', label: 'Emotional Well-being', icon: '💚', color: '#10B981', description: 'Build emotional strength and resilience' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: '#FF6B6B', description: 'Navigate bonds, love, and connections' },
  { id: 'confidence', label: 'Confidence & Self-Image', icon: '✨', color: '#F7B731', description: 'Unlock your self-worth and inner power' },
  { id: 'communication', label: 'Communication', icon: '💬', color: '#7C3AED', description: 'Express yourself with clarity and impact' },
  { id: 'productivity', label: 'Productivity & Time', icon: '⚡', color: '#0D7377', description: 'Master your focus, habits, and schedule' },
  { id: 'stress', label: 'Stress & Overthinking', icon: '🧘', color: '#14A9AE', description: 'Quiet the mental noise and find peace' },
  { id: 'decisions', label: 'Decision Making', icon: '🔮', color: '#FF6B6B', description: 'Make confident choices without regret' },
  { id: 'motivation', label: 'Motivation & Discipline', icon: '🔥', color: '#F7B731', description: 'Stay driven and build lasting discipline' },
  { id: 'growth', label: 'Personal Growth', icon: '🌱', color: '#10B981', description: 'Evolve into your best version every day' },
  { id: 'social', label: 'Social & Family Dynamics', icon: '👨‍👩‍👧', color: '#7C3AED', description: 'Navigate family and social relationships' },
  { id: 'academic', label: 'Academic Direction', icon: '📚', color: '#0D7377', description: 'Make smart academic and learning choices' },
  { id: 'professional', label: 'Professional Development', icon: '💼', color: '#14A9AE', description: 'Grow your skills and workplace presence' },
  { id: 'lifestyle', label: 'Lifestyle & Habits', icon: '🌅', color: '#FF6B6B', description: 'Design a lifestyle that works for you' },
  { id: 'transitions', label: 'Life Transitions', icon: '🦋', color: '#F7B731', description: 'Navigate change and new life chapters' },
  { id: 'values', label: 'Values & Identity', icon: '🧭', color: '#7C3AED', description: 'Understand who you are and what matters' },
  { id: 'financial', label: 'Financial Awareness', icon: '💰', color: '#10B981', description: 'Build financial literacy and smart habits' },
  { id: 'clarity', label: 'Overall Life Clarity', icon: '🌟', color: '#0D7377', description: 'Bring structure and meaning to your life' },
] as const

export type DomainId = typeof LIFE_DOMAINS[number]['id']

export interface User {
  uid: string
  lfId?: string
  displayName: string
  email: string
  phone?: string
  photoURL?: string
  role: UserRole
  domains: DomainId[]
  isAnonymous: boolean
  onboardingComplete: boolean
  createdAt: Date
  city?: string
  profession?: string
  ageGroup?: string
}

export interface Mentor {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  bio: string
  domains: DomainId[]
  expertise: string[]
  sessionPrice: number
  rating: number
  reviewCount: number
  totalSessions: number
  availability: Record<string, string[]>
  yearsOfExperience: number
  education?: string
  languages: string[]
  isVerified: boolean
}

export interface Session {
  id: string
  userId: string
  mentorId: string
  domain: DomainId
  status: SessionStatus
  scheduledAt: Date
  duration: number // minutes
  price: number
  paymentId?: string
  meetingLink?: string
  notes?: string
  rating?: number
  feedback?: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  isAnonymous: boolean
  domain: DomainId
  title: string
  content: string
  upvotes: number
  commentCount: number
  tags: string[]
  createdAt: Date
  hasUpvoted?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  isAnonymous: boolean
  content: string
  upvotes: number
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'session_confirmed' | 'session_reminder' | 'new_message' | 'payment_success'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
