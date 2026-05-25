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
interface AppState {
  mentors: Mentor[]
  sessions: Session[]
  posts: Post[]
  notifications: number
  setMentors: (mentors: Mentor[]) => void
  setSessions: (sessions: Session[]) => void
  setPosts: (posts: Post[]) => void
  setNotifications: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  mentors: [],
  sessions: [],
  posts: [],
  notifications: 3,
  setMentors: (mentors) => set({ mentors }),
  setSessions: (sessions) => set({ sessions }),
  setPosts: (posts) => set({ posts }),
  setNotifications: (count) => set({ notifications: count }),
}))
