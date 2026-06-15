import type { UserRole } from '../types'

const ADMIN_EMAILS = ['asmitsharma895@gmail.com']

export const isAdminEmail = (email?: string | null) =>
  Boolean(email && ADMIN_EMAILS.includes(email.trim().toLowerCase()))

export const roleForEmail = (email: string | undefined | null, fallback: UserRole = 'user'): UserRole =>
  isAdminEmail(email) ? 'admin' : fallback
