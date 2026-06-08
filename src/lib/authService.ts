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
} from 'firebase/auth'
import { generateLFID } from '../utils/generateLFID'
import { auth } from './firebase'
import type { User as UserType } from '../types'
import { createUserDoc, getUserDoc, subscribeToUserDoc } from './userRepository'

// ── Email/Password Auth ──────────────────────────────────────
export const signUpWithEmail = async (email: string, password: string, displayName: string, phone: string = '', role: 'user' | 'mentor' = 'user') => {
  try {
    const safeRole = role === 'mentor' ? 'user' : role
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName })

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

    return newUser
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw new Error(error.message || 'Failed to sign up')
  }
}

export const signInWithEmail = async (email: string, password: string, selectedRole?: 'user' | 'mentor') => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    let userData = await getUserDoc(firebaseUser.uid)

    if (!userData) {
      const newUser: UserType = {
        uid: firebaseUser.uid,
        lfId: generateLFID(firebaseUser.uid),
        displayName: firebaseUser.displayName || 'User',
        email: firebaseUser.email || email,
        phone: firebaseUser.phoneNumber || '',
        role: 'user',
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
      role: userData.role || 'user',
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
        role: 'user',
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
      role: 'user',
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
            role: 'user',
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
          role: 'user',
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
