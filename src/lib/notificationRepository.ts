import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  getDocs,
  writeBatch,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface NotificationDoc {
  id: string
  userId: string
  type: string
  title: string
  body: string
  read: boolean
  actionUrl?: string
  createdAt: Date
  [key: string]: any
}

/**
 * NotificationRepository
 * Encapsulates operations for notifications.
 * Path: notifications/{notificationId}
 */

export const subscribeToUserNotifications = (
  userId: string,
  onUpdate: (notifications: NotificationDoc[]) => void
) => {
  try {
    const notifsRef = collection(db, 'notifications')
    const q = query(
      notifsRef,
      where('userId', '==', userId)
    )

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const docData = docSnap.data()
        return {
          id: docSnap.id,
          userId: docData.userId,
          type: docData.type || 'general',
          title: docData.title || 'Notification',
          body: docData.body || '',
          read: docData.read === true,
          actionUrl: docData.actionUrl || '',
          createdAt: docData.createdAt?.toDate?.() || docData.createdAt || new Date(),
          ...docData
        } as NotificationDoc
      })
      data.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
        return timeB - timeA
      })
      onUpdate(data)
    }, (error) => {
      console.error('Error listening to notifications in repository:', error)
    })
  } catch (error) {
    console.error('Error setting up notifications subscriber:', error)
    return () => {}
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifRef = doc(db, 'notifications', notificationId)
    await updateDoc(notifRef, {
      read: true,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error marking notification read in repository:', error)
    throw error
  }
}

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notifsRef = collection(db, 'notifications')
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return

    const batch = writeBatch(db)
    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true, updatedAt: serverTimestamp() })
    })
    await batch.commit()
  } catch (error) {
    console.error('Error marking all notifications read in repository:', error)
    throw error
  }
}

export const createNotification = async (
  userId: string,
  notification: {
    type: string
    title: string
    body: string
    actionUrl?: string
    [key: string]: any
  }
): Promise<string> => {
  try {
    const notifsRef = collection(db, 'notifications')
    const docRef = await addDoc(notifsRef, {
      userId,
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}
