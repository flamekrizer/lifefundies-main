import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post, Comment } from '../types'

/**
 * CommunityRepository
 * Coordinates posts, comments, chat rooms, text reviews, and star session ratings.
 */

// ── Chat rooms ──────────────────────────────────────

export const CHAT_MESSAGE_MAX_LENGTH = 500

export interface ChatRoomMessage {
  id: string
  roomId: string
  authorId: string
  authorName: string
  message: string
  createdAt: string
}

export const getChatRoomId = (room: string) =>
  room.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general'

export const isCrisisChatRoom = (groupTitle: string) =>
  groupTitle.toLowerCase().includes('crisis')

const mapChatDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): ChatRoomMessage => {
  const data = docSnap.data()
  const createdAt = data.createdAt as { toDate?: () => Date } | undefined
  return {
    id: docSnap.id,
    roomId: String(data.roomId || ''),
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || 'Anonymous'),
    message: String(data.message || ''),
    createdAt: createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
}

export const subscribeToChatMessages = (
  roomId: string,
  callback: (messages: ChatRoomMessage[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'chat_messages'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(mapChatDoc).reverse()
    callback(messages)
  }, (error) => {
    console.error('Chat subscription error:', error)
    onError?.(error)
  })
}

export const sendChatMessage = async (
  roomId: string,
  authorId: string,
  authorName: string,
  message: string
) => {
  const trimmed = message.trim()
  if (!trimmed) throw new Error('Message cannot be empty')
  if (trimmed.length > CHAT_MESSAGE_MAX_LENGTH) {
    throw new Error(`Message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer`)
  }

  await addDoc(collection(db, 'chat_messages'), {
    roomId,
    message: trimmed,
    authorId,
    authorName,
    createdAt: serverTimestamp(),
  })
}

// ── Posts ──────────────────────────────────────

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'community_posts'), {
      ...postData,
      upvotes: 0,
      commentCount: 0,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, ...postData }
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

export const getPosts = async (
  domain?: string,
  sortBy: 'trending' | 'recent' = 'recent',
  limitCount: number = 50
) => {
  try {
    let q
    if (domain) {
      q = query(
        collection(db, 'community_posts'),
        where('domain', '==', domain)
      )
    } else {
      q = query(
        collection(db, 'community_posts'),
        orderBy(sortBy === 'trending' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    let list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    })) as (Post & { id: string })[]

    if (domain) {
      list.sort((a, b) => {
        if (sortBy === 'trending') {
          return (b.upvotes || 0) - (a.upvotes || 0)
        } else {
          return b.createdAt.getTime() - a.createdAt.getTime()
        }
      })
      list = list.slice(0, limitCount)
    }

    return list
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export const subscribeToPosts = (
  callback: (posts: Post[]) => void,
  limitCount = 100,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'community_posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    })) as Post[]
    callback(list)
  }, (error) => {
    console.error('Error subscribing to posts:', error)
    onError?.(error)
    callback([])
  })
}

export const getUserPosts = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'community_posts'),
      where('authorId', '==', userId)
    )
    const snapshot = await getDocs(q)
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    })) as (Post & { id: string })[]
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

export const upvotePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'community_posts', postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) throw new Error('Post not found')

    const upvoters = postSnap.data().upvoters || []
    const hasUpvoted = upvoters.includes(userId)

    if (hasUpvoted) {
      await updateDoc(postRef, {
        upvoters: arrayRemove(userId),
        upvotes: increment(-1),
      })
    } else {
      await updateDoc(postRef, {
        upvoters: arrayUnion(userId),
        upvotes: increment(1),
      })
    }
    return !hasUpvoted
  } catch (error) {
    console.error('Error upvoting post:', error)
    throw error
  }
}

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'community_posts', postId))
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

// ── Comments ──────────────────────────────────────

export const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
  try {
    const batch = writeBatch(db)
    const createdAt = Timestamp.now()

    const commentRef = await addDoc(collection(db, 'community_comments'), {
      ...commentData,
      upvotes: 0,
      createdAt,
    })

    const postRef = doc(db, 'community_posts', commentData.postId)
    batch.update(postRef, { commentCount: increment(1) })
    await batch.commit()

    return { id: commentRef.id, ...commentData, upvotes: 0, createdAt: createdAt.toDate() }
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export const getComments = async (postId: string) => {
  try {
    const q = query(
      collection(db, 'community_comments'),
      where('postId', '==', postId)
    )
    const snapshot = await getDocs(q)
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    })) as (Comment & { id: string })[]
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export const upvoteComment = async (commentId: string, userId: string) => {
  try {
    const commentRef = doc(db, 'community_comments', commentId)
    const commentSnap = await getDoc(commentRef)

    if (!commentSnap.exists()) throw new Error('Comment not found')

    const upvoters = commentSnap.data().upvoters || []
    const hasUpvoted = upvoters.includes(userId)

    if (hasUpvoted) {
      await updateDoc(commentRef, {
        upvoters: arrayRemove(userId),
        upvotes: increment(-1),
      })
    } else {
      await updateDoc(commentRef, {
        upvoters: arrayUnion(userId),
        upvotes: increment(1),
      })
    }
    return !hasUpvoted
  } catch (error) {
    console.error('Error upvoting comment:', error)
    throw error
  }
}

export const deleteComment = async (commentId: string, postId: string) => {
  try {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'community_comments', commentId))

    const postRef = doc(db, 'community_posts', postId)
    batch.update(postRef, { commentCount: increment(-1) })

    await batch.commit()
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// ============================================
// ⭐ REVIEWS & RATING CONSOLIDATION
// ============================================

export const addReviewAndUpvoteMentor = async (
  mentorId: string,
  userId: string,
  rating: number,
  text: string,
  sessionId?: string
) => {
  try {
    const completedBookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('guideId', '==', mentorId),
      where('status', '==', 'completed'),
      limit(1)
    )
    const completedBookings = await getDocs(completedBookingsQuery)

    if (completedBookings.empty) {
      throw new Error('You can review a mentor only after completing a session with them.')
    }

    const completedBooking = completedBookings.docs[0].data()
    const bookingId = completedBookings.docs[0].id
    const reviewSessionId = sessionId || completedBooking.sessionId

    if (!reviewSessionId) {
      throw new Error('Completed session record not found for this review.')
    }

    const result = await runTransaction(db, async (transaction) => {
      const reviewDocRef = doc(db, 'mentor_reviews', `review_${bookingId}`)
      const reviewSnap = await transaction.get(reviewDocRef)

      const isNewReview = !reviewSnap.exists()
      const prevRating = isNewReview ? 0 : reviewSnap.data()?.rating || 0

      // Create/update review doc
      transaction.set(reviewDocRef, {
        mentorId,
        userId,
        bookingId,
        sessionId: reviewSessionId,
        rating,
        text,
        createdAt: isNewReview ? serverTimestamp() : reviewSnap.data()?.createdAt,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      // Update booking rating
      const bookingRef = doc(db, 'bookings', bookingId)
      transaction.update(bookingRef, { rating })

      // Update mentor stats in users collection
      const mentorRef = doc(db, 'users', mentorId)
      const mentorSnap = await transaction.get(mentorRef)

      if (mentorSnap.exists()) {
        const mentor = mentorSnap.data()
        const currentReviews = mentor.reviewCount || 0
        const currentRating = mentor.rating || 0

        let newRating = 0
        let newCount = currentReviews

        if (isNewReview) {
          newCount += 1
          newRating = (currentRating * currentReviews + rating) / newCount
        } else {
          newRating = (currentRating * currentReviews - prevRating + rating) / currentReviews
        }

        transaction.update(mentorRef, {
          rating: Math.round(newRating * 10) / 10,
          reviewCount: newCount,
          updatedAt: serverTimestamp()
        })
      }

      return { rating, text, bookingId, sessionId: reviewSessionId }
    })

    return { id: `review_${result.bookingId}`, mentorId, userId, ...result, createdAt: new Date() }
  } catch (error) {
    console.error('Error adding review:', error)
    throw error
  }
}

export const rateSessionAndCreateReview = async (bookingId: string, ratingValue: number): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const bookingDoc = await transaction.get(bookingRef)
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found')
      }

      const bookingData = bookingDoc.data()
      if (bookingData.status !== 'completed') {
        throw new Error('You can rate a session only after it is completed.')
      }

      // Update booking rating
      transaction.update(bookingRef, { rating: ratingValue })

      const mentorId = bookingData.guideId
      const userId = bookingData.userId
      const sessionId = bookingData.sessionId || ''

      const reviewDocRef = doc(db, 'mentor_reviews', `review_${bookingId}`)
      const reviewDoc = await transaction.get(reviewDocRef)

      const isNewReview = !reviewDoc.exists()
      const prevRating = isNewReview ? 0 : reviewDoc.data()?.rating || 0

      transaction.set(reviewDocRef, {
        mentorId,
        userId,
        bookingId,
        sessionId,
        rating: ratingValue,
        text: isNewReview ? '' : reviewDoc.data()?.text || '',
        createdAt: isNewReview ? serverTimestamp() : reviewDoc.data()?.createdAt,
        updatedAt: serverTimestamp()
      }, { merge: true })

      // Update mentor stats
      const mentorRef = doc(db, 'users', mentorId)
      const mentorSnap = await transaction.get(mentorRef)
      if (mentorSnap.exists()) {
        const mentorData = mentorSnap.data()
        const currentReviews = mentorData.reviewCount || 0
        const currentRating = mentorData.rating || 0

        let newRating = 0
        let newCount = currentReviews

        if (isNewReview) {
          newCount += 1
          newRating = (currentRating * currentReviews + ratingValue) / newCount
        } else {
          newRating = (currentRating * currentReviews - prevRating + ratingValue) / currentReviews
        }

        transaction.update(mentorRef, {
          rating: Math.round(newRating * 10) / 10,
          reviewCount: newCount,
          updatedAt: serverTimestamp()
        })
      }
    })
  } catch (error) {
    console.error('Error in rateSessionAndCreateReview:', error)
    throw error
  }
}

export const getMentorReviews = async (mentorId: string) => {
  try {
    const q = query(
      collection(db, 'mentor_reviews'),
      where('mentorId', '==', mentorId)
    )
    const snapshot = await getDocs(q)
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    })) as any[]
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export const deleteReview = async (reviewId: string) => {
  try {
    await deleteDoc(doc(db, 'mentor_reviews', reviewId))
  } catch (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}
