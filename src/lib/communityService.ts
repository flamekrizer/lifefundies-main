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
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post, Comment } from '../types'

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
        where('domain', '==', domain),
        orderBy(sortBy === 'trending' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        collection(db, 'community_posts'),
        orderBy(sortBy === 'trending' ? 'upvotes' : 'createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as (Post & { id: string })[]
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export const getUserPosts = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'community_posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as (Post & { id: string })[]
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
      // Remove upvote
      await updateDoc(postRef, {
        upvoters: arrayRemove(userId),
        upvotes: increment(-1),
      })
    } else {
      // Add upvote
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

    // Add comment
    const commentRef = await addDoc(collection(db, 'community_comments'), {
      ...commentData,
      upvotes: 0,
      createdAt,
    })

    // Update post comment count
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
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as (Comment & { id: string })[]
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

    // Delete comment
    batch.delete(doc(db, 'community_comments', commentId))

    // Decrement post comment count
    const postRef = doc(db, 'community_posts', postId)
    batch.update(postRef, { commentCount: increment(-1) })

    await batch.commit()
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// ── Reviews (for Mentors) ──────────────────────────────────────
export const addReview = async (
  mentorId: string,
  userId: string,
  rating: number,
  text: string,
  sessionId?: string
) => {
  try {
    const batch = writeBatch(db)
    const createdAt = Timestamp.now()

    // Add review
    const reviewRef = await addDoc(collection(db, 'mentor_reviews'), {
      mentorId,
      userId,
      rating,
      text,
      sessionId: sessionId || '',
      createdAt,
    })

    // Update mentor's average rating
    const mentorRef = doc(db, 'users', mentorId)
    const mentorSnap = await getDoc(mentorRef)

    if (mentorSnap.exists()) {
      const mentor = mentorSnap.data()
      const currentReviews = mentor.reviewCount || 0
      const currentRating = mentor.rating || 0

      const newRating =
        (currentRating * currentReviews + rating) / (currentReviews + 1)

      batch.update(mentorRef, {
        rating: Math.round(newRating * 10) / 10,
        reviewCount: increment(1),
      })
    }

    await batch.commit()
    return { id: reviewRef.id, mentorId, userId, rating, text, sessionId: sessionId || '', createdAt: createdAt.toDate() }
  } catch (error) {
    console.error('Error adding review:', error)
    throw error
  }
}

export const getMentorReviews = async (mentorId: string) => {
  try {
    const q = query(
      collection(db, 'mentor_reviews'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
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
