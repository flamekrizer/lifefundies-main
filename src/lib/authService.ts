import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth'
import { generateLFID } from '../utils/generateLFID'
import { auth } from './firebase'
import type { User as UserType } from '../types'
import { createUserDoc, getUserDoc, subscribeToUserDoc } from './userRepository'
import { roleForEmail } from './admin'

// ── Sentinel returned by signUpWithEmail when email verification is pending ──
// The caller (RegisterPage) checks for this to redirect to the verify-email screen
// instead of trying to navigate into the app.
export const EMAIL_VERIFICATION_PENDING = 'EMAIL_VERIFICATION_PENDING' as const
export type SignUpResult = UserType | typeof EMAIL_VERIFICATION_PENDING

const PENDING_EMAIL_PROFILE_KEY = 'lifefundies:pending-email-profile'

const getAuthErrorMessage = (error: any, fallback: string): string => {
  const code = String(error?.code || '')
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already exists with this email. Please sign in instead.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it completed.',
    'auth/too-many-requests': 'Too many attempts. Please wait a bit and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account was found with this email.',
    'auth/weak-password': 'Please use a stronger password.',
    'auth/wrong-password': 'Invalid email or password.',
  }
  return messages[code] || fallback
}

const persistPendingEmailProfile = (profile: Pick<UserType, 'uid' | 'lfId' | 'displayName' | 'email' | 'phone' | 'role'>) => {
  try {
    window.sessionStorage.setItem(PENDING_EMAIL_PROFILE_KEY, JSON.stringify(profile))
    window.sessionStorage.setItem('verify-email', profile.email)
  } catch {
    // Non-fatal: verification can still complete with Firebase Auth profile data.
  }
}

const readPendingEmailProfile = (uid: string): Partial<UserType> => {
  try {
    const raw = window.sessionStorage.getItem(PENDING_EMAIL_PROFILE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed?.uid === uid ? parsed : {}
  } catch {
    return {}
  }
}

const clearPendingEmailProfile = () => {
  try {
    window.sessionStorage.removeItem(PENDING_EMAIL_PROFILE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

// ── Email/Password Auth ──────────────────────────────────────
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  phone: string = '',
  role: 'user' | 'mentor' = 'user',
): Promise<SignUpResult> => {
  try {
    const safeRole = roleForEmail(email, role === 'mentor' ? 'user' : role)

    // 1. Create the Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // 2. Set displayName on the Firebase Auth profile while we still have the session
    await updateProfile(firebaseUser, { displayName })

    const pendingUser = {
      uid: firebaseUser.uid,
      lfId: generateLFID(firebaseUser.uid),
      displayName,
      email,
      phone,
      role: safeRole,
      domains: [],
      isAnonymous: false,
      onboardingComplete: false,
      createdAt: new Date(),
    }
    persistPendingEmailProfile(pendingUser)

    // 3. Send exactly one verification email while leaving the current session intact.
    //    The verify-email screen can then refresh the status without re-prompting for credentials.
    await sendEmailVerification(firebaseUser)

    // 4. Return the sentinel so the UI can show the "check your inbox" screen.
    //    Firestore profile creation happens only after Firebase confirms emailVerified.
    return EMAIL_VERIFICATION_PENDING
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw new Error(getAuthErrorMessage(error, 'Failed to sign up. Please try again.'))
  }
}

export const signInWithEmail = async (email: string, password: string, selectedRole?: 'user' | 'mentor') => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Block login if the user registered with email/password but hasn't verified yet.
    // Google accounts are pre-verified by Google, so they skip this check.
    if (!firebaseUser.emailVerified && !firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
      await signOut(auth)
      throw new Error(
        'Please verify your email before signing in. Check your inbox for the verification link.',
      )
    }

    let userData = await getUserDoc(firebaseUser.uid)

    if (!userData) {
      const newUser: UserType = {
        uid: firebaseUser.uid,
        lfId: generateLFID(firebaseUser.uid),
        displayName: firebaseUser.displayName || 'User',
        email: firebaseUser.email || email,
        phone: firebaseUser.phoneNumber || '',
        role: roleForEmail(firebaseUser.email || email),
        domains: [],
        isAnonymous: false,
        onboardingComplete: false,
        createdAt: new Date(),
      }
      await createUserDoc(newUser)
      userData = newUser
    } else {
      if (selectedRole === 'mentor' && userData.role !== 'mentor' && userData.role !== 'admin') {
        throw new Error('This account is not approved as a mentor yet. Please use seeker login or submit a mentor application.')
      }
    }

    const loggedInUser: UserType = {
      uid: firebaseUser.uid,
      lfId: userData.lfId || generateLFID(firebaseUser.uid),
      displayName: firebaseUser.displayName || userData.displayName || 'User',
      email: firebaseUser.email || email,
      phone: userData.phone || firebaseUser.phoneNumber || '',
      role: roleForEmail(firebaseUser.email || email, userData.role || 'user'),
      domains: userData.domains || [],
      isAnonymous: userData.isAnonymous || false,
      onboardingComplete: userData.onboardingComplete || false,
      createdAt: userData.createdAt || new Date(),
    }

    return loggedInUser
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(getAuthErrorMessage(error, error.message || 'Failed to sign in.'))
  }
}

// ── Google Auth ──────────────────────────────────────
export const signInWithGoogle = async (role: 'user' | 'mentor' = 'user') => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const firebaseUser = userCredential.user

    let loggedInUser = await getUserDoc(firebaseUser.uid)

    if (!loggedInUser) {
      const newUser: UserType = {
        uid: firebaseUser.uid,
        lfId: generateLFID(firebaseUser.uid),
        displayName: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        role: roleForEmail(firebaseUser.email),
        domains: [],
        isAnonymous: false,
        onboardingComplete: false,
        createdAt: new Date(),
      }

      await createUserDoc(newUser)
      loggedInUser = newUser
    } else {
      if (role === 'mentor' && loggedInUser.role !== 'mentor' && loggedInUser.role !== 'admin') {
        throw new Error('This account is not approved as a mentor yet. Please use seeker login or submit a mentor application.')
      }
    }

    return loggedInUser
  } catch (error: any) {
    console.error('Google sign in error:', error)
    throw new Error(getAuthErrorMessage(error, 'Failed to sign in with Google.'))
  }
}

export const signInAnonymously = async () => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth)
    const firebaseUser = userCredential.user
    
    let anonymousUser = await getUserDoc(firebaseUser.uid)

    if (anonymousUser) {
      return anonymousUser
    }

    const newUser: UserType = {
      uid: firebaseUser.uid,
      lfId: generateLFID(firebaseUser.uid),
      displayName: 'Anonymous User',
      email: '',
      role: roleForEmail(firebaseUser.email),
      domains: [],
      isAnonymous: true,
      onboardingComplete: false,
      createdAt: new Date(),
    }

    await createUserDoc(newUser)
    return newUser
  } catch (error: any) {
    console.error('Anonymous sign in error:', error)
    throw new Error(getAuthErrorMessage(error, 'Failed to continue anonymously.'))
  }
}

// ── Logout ──────────────────────────────────────
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error('Sign out error:', error)
    throw new Error(getAuthErrorMessage(error, 'Failed to sign out.'))
  }
}

// ── Password Reset ──────────────────────────────────────
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('Password reset error:', error)
    throw new Error(getAuthErrorMessage(error, 'Failed to send password reset email.'))
  }
}

// ── Resend Verification Email ─────────────────────────────────
export const resendVerificationEmail = async (email?: string, password?: string) => {
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      if (currentUser.emailVerified) {
        return
      }
      await sendEmailVerification(currentUser)
      return
    }

    if (email && password) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser)
      }
      return
    }

    throw new Error('No active account found. Please sign in again to resend the verification email.')
  } catch (error: any) {
    console.error('Resend verification error:', error)
    throw new Error(getAuthErrorMessage(error, error.message || 'Failed to resend verification email.'))
  }
}

export const refreshVerificationStatus = async () => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('No active account found.')
    }

    await currentUser.reload()
    return currentUser.emailVerified
  } catch (error: any) {
    console.error('Refresh verification error:', error)
    throw new Error(getAuthErrorMessage(error, error.message || 'Failed to refresh verification status.'))
  }
}

export const ensureVerifiedEmailUserDoc = async (): Promise<UserType> => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No active account found.')
  }

  await currentUser.reload()
  if (!currentUser.emailVerified) {
    throw new Error('Please verify your email before continuing.')
  }

  const existingUser = await getUserDoc(currentUser.uid)
  if (existingUser) {
    clearPendingEmailProfile()
    return existingUser
  }

  const pendingProfile = readPendingEmailProfile(currentUser.uid)
  const newUser: UserType = {
    uid: currentUser.uid,
    lfId: pendingProfile.lfId || generateLFID(currentUser.uid),
    displayName: pendingProfile.displayName || currentUser.displayName || 'User',
    email: currentUser.email || pendingProfile.email || '',
    phone: pendingProfile.phone || currentUser.phoneNumber || '',
    role: roleForEmail(currentUser.email || pendingProfile.email, pendingProfile.role || 'user'),
    domains: [],
    isAnonymous: false,
    onboardingComplete: false,
    createdAt: new Date(),
  }

  await createUserDoc(newUser)
  clearPendingEmailProfile()
  return newUser
}

// ── Auth State Listener (Real-time, multi-tab safe) ──────────────────────────
export const onAuthStateChange = (callback: (user: UserType | null) => void) => {
  let unsubscribeUserDoc: (() => void) | null = null

  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
    // Clean up previous user document listener when auth state changes
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc()
      unsubscribeUserDoc = null
    }

    if (firebaseUser) {
      const isUnverifiedEmailPasswordUser = !firebaseUser.emailVerified && firebaseUser.providerData.some((provider) => provider.providerId === 'password')

      if (isUnverifiedEmailPasswordUser) {
        callback(null)
        return
      }

      try {
        let userData = await getUserDoc(firebaseUser.uid)

        if (!userData) {
          // Create user doc if first login
          const newUser: UserType = {
            uid: firebaseUser.uid,
            lfId: generateLFID(firebaseUser.uid),
            displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Anonymous User' : 'User'),
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role: roleForEmail(firebaseUser.email),
            domains: [],
            isAnonymous: firebaseUser.isAnonymous,
            onboardingComplete: false,
            createdAt: new Date(),
          }
          await createUserDoc(newUser)
          userData = newUser
        }

        // Unlock the app immediately. Firestore realtime subscriptions can be
        // delayed by network/rules issues, but the shell should still render.
        callback(userData)

        // Subscribe to real-time user doc updates (role changes, profile edits)
        unsubscribeUserDoc = subscribeToUserDoc(firebaseUser.uid, (user) => {
          callback(user || userData)
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        callback({
          uid: firebaseUser.uid,
          lfId: generateLFID(firebaseUser.uid),
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Anonymous User' : 'User'),
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: roleForEmail(firebaseUser.email),
          domains: [],
          isAnonymous: firebaseUser.isAnonymous,
          onboardingComplete: false,
          createdAt: new Date(),
        })
      }
    } else {
      // User signed out — callback(null) clears auth store
      callback(null)
    }
  })

  // Return cleanup function that unsubscribes both listeners
  return () => {
    unsubscribeAuth()
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc()
    }
  }
}
