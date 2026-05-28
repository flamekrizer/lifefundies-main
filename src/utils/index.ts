import { LIFE_DOMAINS, type DomainId } from '../types'

export const getDomain = (id: DomainId) => LIFE_DOMAINS.find(d => d.id === id)

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)

export const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date)

export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length)}...` : text

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data for demo
export const MOCK_MENTORS = [
  {
    uid: 'm1',
    displayName: 'Priya Sharma',
    email: 'priya@lifefundies.com',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Life coach & career strategist with 8+ years helping young professionals find their purpose. Former HR at Google India.',
    domains: ['career', 'confidence', 'professional'] as DomainId[],
    expertise: ['Career Transitions', 'Interview Coaching', 'Leadership'],
    sessionPrice: 349,
    rating: 4.9,
    reviewCount: 127,
    totalSessions: 420,
    availability: {},
    yearsOfExperience: 8,
    education: 'MBA – IIM Bangalore',
    languages: ['Hindi', 'English'],
    isVerified: true,
  },
  {
    uid: 'm2',
    displayName: 'Rahul Verma',
    email: 'rahul@lifefundies.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Psychologist & emotional wellness guide. Specialises in anxiety, stress, and relationship dynamics for Gen Z and millennials.',
    domains: ['emotional', 'stress', 'relationships'] as DomainId[],
    expertise: ['Anxiety Management', 'Relationship Counselling', 'Mindfulness'],
    sessionPrice: 299,
    rating: 4.8,
    reviewCount: 94,
    totalSessions: 310,
    availability: {},
    yearsOfExperience: 6,
    education: 'M.Sc Psychology – Delhi University',
    languages: ['Hindi', 'English', 'Punjabi'],
    isVerified: true,
  },
  {
    uid: 'm3',
    displayName: 'Anika Patel',
    email: 'anika@lifefundies.com',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Entrepreneur & personal growth mentor. Went from confused college dropout to building a 50Cr brand. Guides students through life transitions.',
    domains: ['growth', 'motivation', 'decisions'] as DomainId[],
    expertise: ['Entrepreneurship', 'Goal Setting', 'Resilience Building'],
    sessionPrice: 399,
    rating: 4.95,
    reviewCount: 156,
    totalSessions: 580,
    availability: {},
    yearsOfExperience: 10,
    education: 'B.Tech – IIT Bombay',
    languages: ['Hindi', 'English', 'Gujarati'],
    isVerified: true,
  },
  {
    uid: 'm4',
    displayName: 'Dr. Sanjay Mehta',
    email: 'sanjay@lifefundies.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Communication expert & confidence coach. Former TEDx speaker trainer. Helps introverts become impactful communicators.',
    domains: ['communication', 'confidence', 'social'] as DomainId[],
    expertise: ['Public Speaking', 'Body Language', 'Social Skills'],
    sessionPrice: 349,
    rating: 4.85,
    reviewCount: 88,
    totalSessions: 290,
    availability: {},
    yearsOfExperience: 12,
    education: 'PhD Communication – JNU',
    languages: ['Hindi', 'English'],
    isVerified: true,
  },
]

export const MOCK_TESTIMONIALS = [
  {
    name: 'Shreya Agarwal',
    role: 'Engineering Student, BITS Pilani',
    domain: 'Career & Purpose',
    text: 'I was completely lost about my career path — software or core engineering? After just 2 sessions with my LifeFundies mentor, I had a clear 3-year plan. Life-changing!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&h=100&fit=crop&crop=faces&q=80',
  },
  {
    name: 'Vikram Nair',
    role: 'Marketing Executive, Mumbai',
    domain: 'Emotional Well-being',
    text: 'The anonymous option made me open up in ways I never could before. My mentor helped me process my anxiety without any judgement. I finally feel like myself again.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces&q=80',
  },
  {
    name: 'Tanvi Joshi',
    role: 'MBA Student, IIM Lucknow',
    domain: 'Relationships',
    text: 'I was struggling with a toxic friendship dynamic. The guidance I received was practical, compassionate, and exactly what I needed. Worth every rupee.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop&crop=faces&q=80',
  },
  {
    name: 'Arjun Singh',
    role: 'Startup Founder, Bangalore',
    domain: 'Motivation & Discipline',
    text: 'As a founder, burnout hit me hard. LifeFundies helped me rebuild my routine and mindset. My productivity has literally doubled since I started sessions.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces&q=80',
  },
]
