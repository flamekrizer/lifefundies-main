import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import type { User as UserType, Mentor } from '../types'
import { normalizeMentorCategories, getLowestCategoryPrice } from './pricing'
import type { DomainId } from '../types'
import { generateLFID } from '../utils/generateLFID'

const mapUserDoc = (uid: string, data: any): UserType => ({
  uid,
  lfId: data.lfId || generateLFID(uid),
  displayName: data.displayName || data.fullName || 'User',
  email: data.email || '',
  phone: data.phone || '',
  role: data.role || 'user',
  domains: data.domains || [],
  isAnonymous: data.isAnonymous || false,
  onboardingComplete: data.onboardingComplete || false,
  createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
  photoURL: data.photoURL || '',
  bio: data.bio || '',
  city: data.city || '',
  profession: data.profession || '',
  ageGroup: data.ageGroup || '',
  mentorInterests: data.mentorInterests || [],
  onboardingStep: data.onboardingStep,
  ...(data.fullName ? { fullName: data.fullName } : {}),
  ...(data.qualification || data.education ? { qualification: data.qualification || data.education, education: data.education || data.qualification } : {}),
  ...(data.experience !== undefined || data.yearsOfExperience !== undefined ? { experience: data.experience, yearsOfExperience: data.yearsOfExperience || data.experience } : {}),
  ...(data.languages || data.languagesKnown ? { languages: data.languages || data.languagesKnown, languagesKnown: data.languagesKnown || data.languages } : {}),
  ...(data.expertise || data.expertiseDomains ? { expertise: data.expertise || data.expertiseDomains, expertiseDomains: data.expertiseDomains || data.expertise } : {}),
  ...(data.certifications ? { certifications: data.certifications } : {}),
  ...(data.categories ? { categories: data.categories } : {}),
  ...(data.sessionPrice ? { sessionPrice: data.sessionPrice } : {}),
  ...(data.guideStatus ? { guideStatus: data.guideStatus } : {}),
  ...(data.mentorApplicationStatus ? { mentorApplicationStatus: data.mentorApplicationStatus } : {}),
  ...(data.mentorApplication ? { mentorApplication: data.mentorApplication } : {}),
})

/**
 * UserRepository
 * Encapsulates Firestore database access for Seeker and Mentor user profiles.
 * Paths: users/{userId} (for both Seekers and Mentors)
 */

export const getUserDoc = async (uid: string): Promise<UserType | null> => {
  try {
    const userDocRef = doc(db, 'users', uid)
    const docSnap = await getDoc(userDocRef)
    if (!docSnap.exists()) return null
    
    return mapUserDoc(uid, docSnap.data())
  } catch (error) {
    console.error('Error in getUserDoc:', error)
    throw error
  }
}

export const subscribeToUserDoc = (uid: string, callback: (user: UserType | null) => void) => {
  const userDocRef = doc(db, 'users', uid)
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(mapUserDoc(uid, docSnap.data()))
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('Error subscribing to user doc:', error)
    callback(null)
  })
}

export const createUserDoc = async (user: UserType): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', user.uid)
    await setDoc(userDocRef, {
      ...user,
      lfId: user.lfId || generateLFID(user.uid),
      createdAt: Timestamp.fromDate(user.createdAt || new Date()),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error creating user doc:', error)
    throw error
  }
}

export const updateUserProfile = async (uid: string, updateData: Partial<UserType>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid)
    const cleanData = { ...updateData, updatedAt: serverTimestamp() }
    await updateDoc(userDocRef, cleanData)
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export const publishMentorGuideProfile = async (uid: string, profile: any): Promise<void> => {
  try {
    const categories = normalizeMentorCategories(profile.categories)
    const rawDomains = Array.isArray(profile.domains) && profile.domains.length
      ? profile.domains
      : Array.isArray(profile.expertise)
        ? profile.expertise
        : Array.isArray(profile.expertiseDomains)
          ? profile.expertiseDomains
          : []
    const domains = Array.from(new Set(rawDomains.map(normalizeGuideDomain).filter(Boolean)))

    const guideRef = doc(db, 'guides', uid)
    await setDoc(guideRef, {
      uid,
      name: profile.displayName || profile.fullName || profile.name || 'Guide',
      displayName: profile.displayName || profile.fullName || profile.name || 'Guide',
      photoURL: profile.photoURL || profile.avatar || '',
      bio: profile.bio || profile.about || '',
      domains,
      domainIds: domains,
      expertise: profile.expertise || profile.expertiseDomains || domains,
      categories,
      price: getLowestCategoryPrice(categories),
      sessionPrice: getLowestCategoryPrice(categories),
      rating: profile.rating || 5,
      reviewCount: profile.reviewCount || 0,
      totalSessions: profile.totalSessions || 0,
      yearsOfExperience: Number(profile.yearsOfExperience || profile.experience || 1),
      education: profile.education || profile.qualification || '',
      qualification: profile.qualification || profile.education || '',
      languages: profile.languages || profile.languagesKnown || ['Hindi', 'English'],
      isActive: true,
      isAvailable: true,
      isVerified: true,
      source: 'users',
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('Error publishing mentor guide profile:', error)
    throw error
  }
}

export const submitMentorApplication = async (
  uid: string,
  applicationData: {
    fullName: string
    phone: string
    qualification: string
    experience: string
    expertise: string[]
    languages: string[]
    bio: string
  }
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid)
    await updateDoc(userDocRef, {
      mentorApplicationStatus: 'pending',
      mentorApplication: {
        ...applicationData,
        submittedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error submitting mentor application:', error)
    throw error
  }
}

export const updateMentorProfile = async (
  uid: string,
  profileForm: {
    fullName: string
    displayName: string
    photoURL: string
    bio: string
    qualification: string
    experience: string
    languages: string
    expertise: string
    certifications: string
    categories: string[]
  }
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid)
    const languagesArray = profileForm.languages.split(',').map(item => item.trim()).filter(Boolean)
    const expertiseArray = profileForm.expertise.split(',').map(item => item.trim()).filter(Boolean)
    const certificationsArray = profileForm.certifications.split(',').map(item => item.trim()).filter(Boolean)
    const categoriesArray = profileForm.categories
    const yearsExp = Number(profileForm.experience) || 0

    const payload = {
      photoURL: profileForm.photoURL,
      fullName: profileForm.fullName.trim(),
      displayName: profileForm.displayName.trim() || profileForm.fullName.trim(),
      bio: profileForm.bio.trim(),
      qualification: profileForm.qualification.trim(),
      education: profileForm.qualification.trim(),
      experience: yearsExp,
      yearsOfExperience: yearsExp,
      languages: languagesArray,
      languagesKnown: languagesArray,
      expertise: expertiseArray,
      expertiseDomains: expertiseArray,
      certifications: certificationsArray,
      categories: categoriesArray,
      sessionPrice: Math.min(...categoriesArray.flatMap(categoryId => {
        // Fallback pricing structures check
        const categoryPrices = getLowestCategoryPrice([categoryId as any])
        return [categoryPrices || 1]
      })),
      guideStatus: 'profile_complete',
      isVerified: true,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(userDocRef, payload)
    await publishMentorGuideProfile(uid, payload)
  } catch (error) {
    console.error('Error updating mentor profile:', error)
    throw error
  }
}

export const subscribeToMentorApplications = (callback: (applications: any[]) => void) => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('mentorApplicationStatus', 'in', ['pending', 'info_requested', 'rejected', 'approved']))

  return onSnapshot(q, (snapshot) => {
    const applications = snapshot.docs.map(docSnap => ({
      uid: docSnap.id,
      ...docSnap.data(),
      submittedAt: docSnap.data().mentorApplication?.submittedAt?.toDate?.() || null,
    })).sort((a: any, b: any) => {
      const aTime = a.submittedAt?.getTime?.() || 0
      const bTime = b.submittedAt?.getTime?.() || 0
      return bTime - aTime
    })
    callback(applications)
  }, (err) => {
    console.error('Failed to subscribe to mentor applications:', err)
  })
}

export const reviewMentorApplication = async (
  uid: string,
  decision: 'approved' | 'rejected' | 'info_requested',
  note = ''
) => {
  try {
    const userDocRef = doc(db, 'users', uid)
    const snap = await getDoc(userDocRef)
    if (!snap.exists()) throw new Error('User application not found')

    const data = snap.data()
    const application = data.mentorApplication || {}
    const expertise = application.expertise || []
    const languages = application.languages || []
    const yearsExp = Number(application.experience) || 0

    const payload: any = {
      mentorApplicationStatus: decision,
      mentorReviewNote: note,
      mentorReviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    if (decision === 'approved') {
      payload.role = 'mentor'
      payload.guideStatus = 'verified'
      payload.displayName = application.fullName || data.displayName || 'Guide'
      payload.fullName = application.fullName || data.fullName || data.displayName || 'Guide'
      payload.phone = application.phone || data.phone || ''
      payload.qualification = application.qualification || data.qualification || ''
      payload.education = application.qualification || data.education || ''
      payload.experience = yearsExp
      payload.yearsOfExperience = yearsExp
      payload.expertise = expertise
      payload.expertiseDomains = expertise
      payload.languages = languages.length ? languages : ['Hindi', 'English']
      payload.languagesKnown = languages.length ? languages : ['Hindi', 'English']
      payload.bio = application.bio || data.bio || ''
      payload.categories = normalizeMentorCategories(data.categories)
      payload.sessionPrice = getLowestCategoryPrice(payload.categories)
      payload.isVerified = true
    }

    await updateDoc(userDocRef, payload)
    if (decision === 'approved') {
      await publishMentorGuideProfile(uid, payload)
    }
  } catch (error) {
    console.error('Error reviewing mentor application:', error)
    throw error
  }
}

const normalizeGuideDomain = (domain: any): DomainId | null => {
  const raw = String(typeof domain === 'string' ? domain : domain?.id || domain?.name || '').trim().toLowerCase()
  const aliases: Record<string, DomainId> = {
    career: 'career',
    careers: 'career',
    studies: 'academic',
    study: 'academic',
    academic: 'academic',
    finance: 'financial',
    financial: 'financial',
    'mental-health': 'emotional',
    mental: 'emotional',
    emotional: 'emotional',
    relationships: 'relationships',
    relationship: 'relationships',
    'life-advice': 'clarity',
    clarity: 'clarity',
    confidence: 'confidence',
    communication: 'communication',
    lifestyle: 'lifestyle',
    decisions: 'decisions',
    social: 'social',
    growth: 'growth',
    motivation: 'motivation',
    stress: 'stress',
    productivity: 'productivity',
    professional: 'professional',
    transitions: 'transitions',
    values: 'values',
  }
  return aliases[raw] || null
}

const mapGuideDocToMentor = (uid: string, data: any): Mentor => {
  const categories = normalizeMentorCategories(data.categories)
  const domainCandidates = [
    ...(Array.isArray(data.domainIds) ? data.domainIds : []),
    ...(Array.isArray(data.domains) ? data.domains : []),
  ]
  const domains = Array.from(new Set(domainCandidates.map(normalizeGuideDomain).filter(Boolean))) as DomainId[]

  return {
    uid,
    displayName: data.displayName || data.fullName || data.name || 'Guide',
    email: data.email || '',
    photoURL: data.photoURL || data.avatar || '',
    bio: data.bio || data.about || '',
    domains,
    expertise: data.expertise || data.expertiseDomains || domains,
    categories,
    sessionPrice: getLowestCategoryPrice(categories),
    rating: data.rating || 5.0,
    reviewCount: data.reviewCount || 0,
    totalSessions: data.totalSessions || 0,
    availability: data.availability || {},
    yearsOfExperience: Number(data.yearsOfExperience || data.experience || 1),
    education: data.education || data.qualification || '',
    qualification: data.qualification || data.education || '',
    languages: data.languages || data.languagesKnown || ['English', 'Hindi'],
    isVerified: data.isVerified !== undefined ? data.isVerified : true,
    certifications: data.certifications || [],
  }
}

export const subscribeToMentors = (callback: (mentors: Mentor[]) => void) => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('role', '==', 'mentor'))
  const guidesRef = collection(db, 'guides')

  let userMentors: Mentor[] = []
  let guideMentors: Mentor[] = []
  const emit = () => {
    const merged = new Map<string, Mentor>()
    guideMentors.forEach(mentor => merged.set(mentor.uid, mentor))
    userMentors.forEach(mentor => merged.set(mentor.uid, mentor))
    callback(Array.from(merged.values()).filter(mentor => mentor.isVerified !== false))
  }

  const unsubscribeGuides = onSnapshot(guidesRef, (snapshot) => {
    guideMentors = snapshot.docs
      .filter(docSnap => docSnap.data().source === 'users')
      .map(docSnap => mapGuideDocToMentor(docSnap.id, docSnap.data()))
      .filter(mentor => mentor.isVerified !== false)
    emit()
  }, (err) => {
    console.error('Failed to subscribe to public guides:', err)
    guideMentors = []
    emit()
  })

  const unsubscribeUsers = onSnapshot(q, (snapshot) => {
    userMentors = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      const categories = normalizeMentorCategories(data.categories)
      return {
        uid: docSnap.id,
        displayName: data.displayName || data.fullName || 'Mentor',
        email: data.email || '',
        photoURL: data.photoURL || '',
        bio: data.bio || data.about || '',
        domains: data.domains || [],
        expertise: data.expertise || data.expertiseDomains || [],
        categories,
        sessionPrice: getLowestCategoryPrice(categories),
        rating: data.rating || 5.0,
        reviewCount: data.reviewCount || 0,
        totalSessions: data.totalSessions || 0,
        availability: data.availability || {},
        yearsOfExperience: Number(data.yearsOfExperience || data.experience || 0),
        education: data.education || data.qualification || '',
        qualification: data.qualification || data.education || '',
        languages: data.languages || data.languagesKnown || ['English', 'Hindi'],
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        certifications: data.certifications || [],
      } as Mentor
    })
    emit()
  }, (err) => {
    console.error('Failed to subscribe to mentors:', err)
    userMentors = []
    emit()
  })

  return () => {
    unsubscribeGuides()
    unsubscribeUsers()
  }
}

export const updateUserMentorInterests = async (uid: string, interests: string[]): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid)
    await updateDoc(userDocRef, {
      mentorInterests: interests,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating mentor interests:', error)
    throw error
  }
}
