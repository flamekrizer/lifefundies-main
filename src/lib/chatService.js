/**
 * 💬 LifeFundies Chat Service
 * Real-time Firestore chat for guide ↔ user sessions
 */

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribe to real-time messages in a session
 * @param {string} sessionId
 * @param {(msgs: any[]) => void} callback
 * @returns unsubscribe function
 */
export function subscribeToMessages(sessionId, callback) {
  if (!db) return () => {};

  const messagesRef = collection(db, 'sessions', sessionId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(300));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to JS Date
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
    callback(msgs);
  });
}

/**
 * Send a message in a session
 */
export async function sendMessage(sessionId, { senderId, senderName, text, role }) {
  if (!db) throw new Error('Firebase not connected');
  if (!text?.trim()) return;

  const messagesRef = collection(db, 'sessions', sessionId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    senderName,
    text: text.trim(),
    role, // 'user' | 'guide'
    createdAt: serverTimestamp(),
  });
}

/**
 * Mark session as active (guide joined)
 */
export async function activateSession(sessionId) {
  if (!db) return;
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    status: 'active',
    startedAt: serverTimestamp(),
  });
}

/**
 * Mark session as completed
 */
export async function completeSession(sessionId, notes = '') {
  if (!db) return;
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    status: 'completed',
    completedAt: serverTimestamp(),
    notes,
  });
}
