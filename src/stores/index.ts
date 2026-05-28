import { create } from 'zustand'
import type { User, Mentor, Session, Post } from '../types'

// ── Auth Store ──────────────────────────────────────
interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null }),
}))

// ── App Store ──────────────────────────────────────
export interface NotificationItem {
  id: number
  text: string
  isRead: boolean
}

interface AppState {
  mentors: Mentor[]
  sessions: Session[]
  posts: Post[]
  notificationsList: NotificationItem[]
  setMentors: (mentors: Mentor[]) => void
  setSessions: (sessions: Session[]) => void
  setPosts: (posts: Post[]) => void
  setNotificationsList: (list: NotificationItem[]) => void
  markAllNotificationsRead: () => void
  markNotificationRead: (id: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  mentors: [],
  sessions: [],
  posts: [],
  notificationsList: [
    { id: 1, text: '📅 Priya Sharma confirmed your booking for tomorrow at 4:00 PM.', isRead: false },
    { id: 2, text: "💬 New reply on your thread in the 'Career & Purpose' community!", isRead: false },
    { id: 3, text: '🌿 Complete your onboarding questions to unlock matches in other domains.', isRead: true }
  ],
  setMentors: (mentors) => set({ mentors }),
  setSessions: (sessions) => set({ sessions }),
  setPosts: (posts) => set({ posts }),
  setNotificationsList: (list) => set({ notificationsList: list }),
  markAllNotificationsRead: () => set((state) => ({
    notificationsList: state.notificationsList.map(n => ({ ...n, isRead: true }))
  })),
  markNotificationRead: (id) => set((state) => ({
    notificationsList: state.notificationsList.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
}))
