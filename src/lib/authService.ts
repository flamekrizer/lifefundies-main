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
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User as UserType } from '../types'

// ── Email/Password Auth ──────────────────────────────────────
export const signUpWithEmail = async (email: string, password: string, displayName: string, role: 'user' | 'mentor' = 'user') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName })

    const newUser: UserType = {
      uid: firebaseUser.uid,
      displayName,
      email,
      role,
      domains: [],
      isAnonymous: false,
      onboardingComplete: false,
      createdAt: new Date(),
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: Timestamp.now(),
    })

    return newUser
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw new Error(error.message || 'Failed to sign up')
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    const userData = userDoc.data()
    const loggedInUser: UserType = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || userData.displayName || 'User',
      email: firebaseUser.email || email,
      role: userData.role || 'user',
      domains: userData.domains || [],
      isAnonymous: false,
      onboardingComplete: userData.onboardingComplete || false,
      createdAt: userData.createdAt?.toDate() || new Date(),
    }

    return loggedInUser
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

// ── Google Auth ──────────────────────────────────────
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const firebaseUser = userCredential.user

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    let loggedInUser: UserType

    if (!userDoc.exists()) {
      const newUser: UserType = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        role: 'user',
        domains: [],
        isAnonymous: false,
        onboardingComplete: false,
        createdAt: new Date(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: Timestamp.now(),
      })

      loggedInUser = newUser
    } else {
      const userData = userDoc.data()
      loggedInUser = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || userData.displayName || 'Google User',
        email: firebaseUser.email || userData.email || '',
        role: userData.role || 'user',
        domains: userData.domains || [],
        isAnonymous: userData.isAnonymous || false,
        onboardingComplete: userData.onboardingComplete || false,
        createdAt: userData.createdAt?.toDate() || new Date(),
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
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: firebaseUser.uid,
        displayName: userData.displayName || 'Anonymous User',
        email: userData.email || '',
        role: userData.role || 'user',
        domains: userData.domains || [],
        isAnonymous: true,
        onboardingComplete: userData.onboardingComplete || true,
        createdAt: userData.createdAt?.toDate() || new Date(),
      } as UserType
    }

    const anonymousUser: UserType = {
      uid: firebaseUser.uid,
      displayName: 'Anonymous User',
      email: '',
      role: 'user',
      domains: [],
      isAnonymous: true,
      onboardingComplete: true,
      createdAt: new Date(),
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...anonymousUser,
      createdAt: Timestamp.now(),
    })

    return anonymousUser
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

// ── Auth State Listener ──────────────────────────────────────
export const onAuthStateChange = (callback: (user: UserType | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const user: UserType = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || userData.displayName || 'User',
            email: firebaseUser.email || userData.email || '',
            role: userData.role || 'user',
            domains: userData.domains || [],
            isAnonymous: userData.isAnonymous || false,
            onboardingComplete: userData.onboardingComplete || false,
            createdAt: userData.createdAt?.toDate() || new Date(),
          }
          callback(user)
        } else if (firebaseUser.isAnonymous) {
          const anonymousUser: UserType = {
            uid: firebaseUser.uid,
            displayName: 'Anonymous User',
            email: '',
            role: 'user',
            domains: [],
            isAnonymous: true,
            onboardingComplete: true,
            createdAt: new Date(),
          }
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...anonymousUser,
            createdAt: Timestamp.now(),
          })
          callback(anonymousUser)
        } else {
          callback(null)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}
