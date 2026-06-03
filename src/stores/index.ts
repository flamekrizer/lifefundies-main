import { create } from 'zustand'
import type { User, Mentor, Session, Post } from '../types'

// ── Auth Store ──────────────────────────────────────
interface AuthState {
  user: User | null
  loading: boolean
  authModalOpen: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setAuthModalOpen: (open: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  authModalOpen: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setAuthModalOpen: (authModalOpen) => set({ authModalOpen }),
  logout: () => {
    set({ user: null })
    // Also clear app store notifications on logout
    useAppStore.getState().setNotificationsList([])
    useAppStore.getState().setSessions([])
  },
}))

// ── App Store ──────────────────────────────────────
export interface NotificationItem {
  id: number | string
  text: string
  isRead: boolean
  actionUrl?: string
  type?: string
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
  markNotificationRead: (id: number | string) => void
}

export const useAppStore = create<AppState>((set) => ({
  mentors: [],
  sessions: [],
  posts: [],
  notificationsList: [],
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
