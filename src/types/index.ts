// TypeScript Types & Interfaces for LifeFundies

export type UserRole = 'user' | 'mentor' | 'admin'

export type SessionStatus = 'payment_pending' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type MentorCategoryId = 'peer-buddy' | 'young-mentor' | 'senior-advisory-group'

export interface MentorCategoryPrice {
  duration: number
  price: number
}

export interface MentorCategory {
  id: MentorCategoryId
  label: string
  prices: MentorCategoryPrice[]
}

export const MENTOR_CATEGORIES: MentorCategory[] = [
  {
    id: 'peer-buddy',
    label: 'Peer Buddy',
    prices: [
      { duration: 30, price: 129 },
    ],
  },
  {
    id: 'young-mentor',
    label: 'Young Mentor',
    prices: [
      { duration: 45, price: 199 },
    ],
  },
  {
    id: 'senior-advisory-group',
    label: 'Senior Advisor',
    prices: [
      { duration: 45, price: 299 },
    ],
  },
]

export const LIFE_DOMAINS = [
  { id: 'career', color: '#2563EB', label: 'Career & Profession', description: 'Job growth, professional development, workplace success, and career planning.' },
  { id: 'emotional', color: '#7C3AED', label: 'Mental Well-being', description: 'Managing stress, anxiety, focus, emotional balance, and mental resilience.' },
  { id: 'relationships', color: '#E11D48', label: 'Relationships', description: 'Building strong bonds with family members through love, trust, and support.' },
  { id: 'confidence', color: '#16A34A', label: 'Health & Fitness', description: 'Physical health, nutrition, exercise, sleep, and overall body wellness.' },
  { id: 'communication', color: '#0891B2', label: 'Education & Learning', description: 'Acquiring knowledge, skills, certifications, academic growth, and lifelong learning.' },
  { id: 'productivity', color: '#EA580C', label: 'Business & Entrepreneurship', description: 'Building ventures, innovation, leadership, business strategy, and financial sustainability.' },
  { id: 'stress', color: '#CA8A04', label: 'Finance & Wealth',  description: 'Earning, saving, investing, budgeting, and achieving financial security.' },
  { id: 'decisions', color: '#DB2777', label: 'Love & Intimacy', description: 'Romantic relationships, emotional connection, trust, compatibility, and partnership growth.' },
  { id: 'motivation', color: '#0D9488', label: 'Social Life & Networking', description: 'Friendships, communication skills, networking, and social engagement.' },
  { id: 'growth', color: '#65A30D', label: 'Personal Growth', description: 'Self-improvement, confidence, discipline, productivity, and character development.' },
  { id: 'social', color: '#8B5CF6', label: 'Spirituality & Purpose', description: 'Finding inner peace, values, purpose, mindfulness, and spiritual growth.' },
  { id: 'academic', color: '#0284C7', label: 'Technology & Digital Life', description: 'Managing digital tools, online presence, technology usage, and digital productivity.' },
  { id: 'professional', color: '#B45309', label: 'Family Responsibilities', description: 'Managing duties towards parents, siblings, children, and household responsibilities.' },
  { id: 'lifestyle', color: '#9333EA', label: 'Creativity & Innovation', description: 'Expressing ideas through art, writing, design, innovation, and creative thinking.' },
  { id: 'transitions', color: '#F97316', label: 'Entertainment & Fun', description: 'Recreation, hobbies, leisure activities, enjoyment, and maintaining life balance.' },
  { id: 'values', color: '#059669', label: 'Society & Contribution', description: 'Giving back to society through volunteering, social impact, mentorship, and community service.' },
  { id: 'financial', color: '#64748B', label: 'Self-Identity', description: 'Understanding personal values, beliefs, strengths, weaknesses, and authentic self.' },
  { id: 'clarity', color: '#D97706', label: 'Dreams & Aspirations', description: 'Long-term goals, ambitions, vision, life mission, and legacy building.' },
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
  bio?: string
  city?: string
  profession?: string
  ageGroup?: string
  mentorInterests?: string[]
  onboardingStep?: number
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
  categories?: MentorCategoryId[]
  qualification?: string
  certifications?: string[]
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
  authorPhotoURL?: string
  isAnonymous: boolean
  domain: DomainId
  title: string
  content: string
  upvotes: number
  upvoters?: string[]
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
  authorPhotoURL?: string
  isAnonymous: boolean
  content: string
  upvotes: number
  upvoters?: string[]
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
