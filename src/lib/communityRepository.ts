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
  serverTimestamp,
  Transaction,
  DocumentReference,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { assertAllowedCommunityText } from './contentModeration'
import type { Post, Comment } from '../types'

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
  assertAllowedCommunityText(trimmed)

  await addDoc(collection(db, 'chat_messages'), {
    roomId,
    message: trimmed,
    authorId,
    authorName,
    createdAt: serverTimestamp(),
  })
}

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
  assertAllowedCommunityText(`${postData.title} ${postData.content}`)

  try {
    const docRef = await addDoc(collection(db, 'community_posts'), {
      ...postData,
      upvotes: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, ...postData, createdAt: new Date() }
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
    const collectionRef = collection(db, 'community_posts')

    if (domain) {
      q = query(
        collectionRef,
        where('domain', '==', domain),
        orderBy(sortBy === 'trending' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        collectionRef,
        orderBy(sortBy === 'trending' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    })) as (Post & { id: string })[]
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
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
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
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
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
    const result = await runTransaction(db, async (transaction) => {
      const postRef = doc(db, 'community_posts', postId)
      const postSnap = await transaction.get(postRef)
      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const data = postSnap.data()
      const upvoters = data.upvoters || []
      const hasUpvoted = upvoters.includes(userId)

      const newUpvoters = hasUpvoted
        ? upvoters.filter((id: string) => id !== userId)
        : [...upvoters, userId]

      transaction.update(postRef, {
        upvoters: newUpvoters,
        upvotes: hasUpvoted ? increment(-1) : increment(1),
      })

      return !hasUpvoted
    })
    return result
  } catch (error) {
    console.error('Error upvoting post:', error)
    throw error
  }
}

export const upvoteComment = async (commentId: string, userId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const commentRef = doc(db, 'community_comments', commentId)
      const commentSnap = await transaction.get(commentRef)
      if (!commentSnap.exists()) {
        throw new Error('Comment not found')
      }

      const data = commentSnap.data()
      const upvoters = data.upvoters || []
      const hasUpvoted = upvoters.includes(userId)

      const newUpvoters = hasUpvoted
        ? upvoters.filter((id: string) => id !== userId)
        : [...upvoters, userId]

      transaction.update(commentRef, {
        upvoters: newUpvoters,
        upvotes: hasUpvoted ? increment(-1) : increment(1),
      })

      return !hasUpvoted
    })
    return result
  } catch (error) {
    console.error('Error upvoting comment:', error)
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

export const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
  assertAllowedCommunityText(commentData.content)

  try {
    const batch = writeBatch(db)

    const commentRef = doc(collection(db, 'community_comments'))
    const now = serverTimestamp()

    batch.set(commentRef, {
      ...commentData,
      upvotes: 0,
      createdAt: now,
    })

    const postRef = doc(db, 'community_posts', commentData.postId)
    batch.update(postRef, {
      commentCount: increment(1),
    })

    await batch.commit()

    return {
      id: commentRef.id,
      ...commentData,
      upvotes: 0,
      createdAt: new Date(),
    }
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
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    })) as (Comment & { id: string })[]
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
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

function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.')
  }
}

async function updateMentorReviewStats(
  transaction: Transaction,
  mentorId: string,
  rating: number,
  prevRating: number,
  isNew: boolean
): Promise<void> {
  const mentorRef = doc(db, 'users', mentorId)
  const mentorSnap = await transaction.get(mentorRef)
  if (!mentorSnap.exists()) return

  const data = mentorSnap.data()
  const currentReviews = data.reviewCount || 0
  const currentRating = data.rating || 0

  let newCount = currentReviews
  let newRating = 0

  if (isNew) {
    newCount += 1
    newRating = (currentRating * currentReviews + rating) / newCount
  } else {
    newRating = (currentRating * currentReviews - prevRating + rating) / currentReviews
  }

  transaction.update(mentorRef, {
    rating: Math.round(newRating * 10) / 10,
    reviewCount: newCount,
    updatedAt: serverTimestamp(),
  })
}

async function getCompletedBooking(
  userId: string,
  mentorId: string
): Promise<{ id: string; data: Record<string, unknown> }> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('guideId', '==', mentorId),
    where('status', '==', 'completed'),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    throw new Error('You can review a mentor only after completing a session with them.')
  }
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, data: docSnap.data() }
}

export const addReviewAndUpvoteMentor = async (
  mentorId: string,
  userId: string,
  rating: number,
  text: string,
  sessionId?: string
) => {
  validateRating(rating)
  assertAllowedCommunityText(text)

  try {
    const { id: bookingId, data: bookingData } = await getCompletedBooking(userId, mentorId)
    const reviewSessionId = sessionId || bookingData.sessionId

    if (!reviewSessionId) {
      throw new Error('Completed session record not found for this review.')
    }

    const result = await runTransaction(db, async (transaction) => {
      const reviewDocRef = doc(db, 'mentor_reviews', `review_${bookingId}`)
      const reviewSnap = await transaction.get(reviewDocRef)

      const isNewReview = !reviewSnap.exists()
      const prevRating = isNewReview ? 0 : reviewSnap.data()?.rating || 0

      transaction.set(
        reviewDocRef,
        {
          mentorId,
          userId,
          bookingId,
          sessionId: reviewSessionId,
          rating,
          text,
          createdAt: isNewReview ? serverTimestamp() : reviewSnap.data()?.createdAt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      const bookingRef = doc(db, 'bookings', bookingId)
      transaction.update(bookingRef, { rating })

      await updateMentorReviewStats(transaction, mentorId, rating, prevRating, isNewReview)

      return { rating, text, bookingId, sessionId: reviewSessionId }
    })

    return { id: `review_${result.bookingId}`, mentorId, userId, ...result, createdAt: new Date() }
  } catch (error) {
    console.error('Error adding review:', error)
    throw error
  }
}

export const rateSessionAndCreateReview = async (bookingId: string, ratingValue: number): Promise<void> => {
  validateRating(ratingValue)

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

      transaction.update(bookingRef, { rating: ratingValue })

      const mentorId = bookingData.guideId
      const userId = bookingData.userId
      const sessionId = bookingData.sessionId || ''

      const reviewDocRef = doc(db, 'mentor_reviews', `review_${bookingId}`)
      const reviewDoc = await transaction.get(reviewDocRef)

      const isNewReview = !reviewDoc.exists()
      const prevRating = isNewReview ? 0 : reviewDoc.data()?.rating || 0

      transaction.set(
        reviewDocRef,
        {
          mentorId,
          userId,
          bookingId,
          sessionId,
          rating: ratingValue,
          text: isNewReview ? '' : reviewDoc.data()?.text || '',
          createdAt: isNewReview ? serverTimestamp() : reviewDoc.data()?.createdAt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await updateMentorReviewStats(transaction, mentorId, ratingValue, prevRating, isNewReview)
    })
  } catch (error) {
    console.error('Error in rateSessionAndCreateReview:', error)
    throw error
  }
}

export const getMentorReviews = async (mentorId: string, limitCount: number = 20) => {
  try {
    const q = query(
      collection(db, 'mentor_reviews'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    })) as any[]
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