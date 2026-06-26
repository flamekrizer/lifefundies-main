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

    // 3. Pre-create the Firestore user doc so the user exists as soon as they verify.
    //    We do this before signing out so Firestore rules (auth.uid == userId) pass.
    const newUser: UserType = {
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
    await createUserDoc(newUser)

    // 4. Send exactly one verification email
    await sendEmailVerification(firebaseUser)

    // 5. Sign out — the user must click the verification link before they can log in.
    //    signInWithEmail will gate on emailVerified before letting them into the app.
    await signOut(auth)

    // 6. Return the sentinel so the UI can show the "check your inbox" screen
    return EMAIL_VERIFICATION_PENDING
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw new Error(error.message || 'Failed to sign up')
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
    throw new Error(error.message || 'Failed to sign in')
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
    throw new Error(error.message || 'Failed to sign in with Google')
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
    throw new Error(error.message || 'Failed to continue anonymously')
  }
}

// ── Logout ──────────────────────────────────────
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error('Sign out error:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

// ── Password Reset ──────────────────────────────────────
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('Password reset error:', error)
    throw new Error(error.message || 'Failed to send password reset email')
  }
}

// ── Resend Verification Email ─────────────────────────────────
// Signs in temporarily just to send a fresh verification email, then signs out again.
export const resendVerificationEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    if (firebaseUser.emailVerified) {
      // Already verified — nothing to resend, just sign back out
      await signOut(auth)
      return
    }
    await sendEmailVerification(firebaseUser)
    await signOut(auth)
  } catch (error: any) {
    console.error('Resend verification error:', error)
    throw new Error(error.message || 'Failed to resend verification email')
  }
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