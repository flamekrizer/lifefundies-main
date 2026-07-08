import { initializeApp, getApps, getApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}

export const isFirebaseConfigured = [
  env.VITE_FIREBASE_API_KEY,
  env.VITE_FIREBASE_AUTH_DOMAIN,
  env.VITE_FIREBASE_PROJECT_ID,
  env.VITE_FIREBASE_STORAGE_BUCKET,
  env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  env.VITE_FIREBASE_APP_ID,
].every(Boolean)

const requiredFirebaseVars = [
  { key: 'VITE_FIREBASE_API_KEY', value: env.VITE_FIREBASE_API_KEY },
  { key: 'VITE_FIREBASE_AUTH_DOMAIN', value: env.VITE_FIREBASE_AUTH_DOMAIN },
  { key: 'VITE_FIREBASE_PROJECT_ID', value: env.VITE_FIREBASE_PROJECT_ID },
  { key: 'VITE_FIREBASE_STORAGE_BUCKET', value: env.VITE_FIREBASE_STORAGE_BUCKET },
  { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', value: env.VITE_FIREBASE_MESSAGING_SENDER_ID },
  { key: 'VITE_FIREBASE_APP_ID', value: env.VITE_FIREBASE_APP_ID },
]

const missingVars = requiredFirebaseVars.filter(v => !v.value).map(v => v.key)
if (missingVars.length) {
  console.warn(`Missing Firebase environment variables: ${missingVars.join(', ')}. The app will load with Firebase features disabled.`)
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'missing-api-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'missing-auth-domain',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'missing-project-id',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'missing-storage-bucket',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'missing-messaging-sender-id',
  appId: env.VITE_FIREBASE_APP_ID || 'missing-app-id'
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to initialize Firebase auth persistence:', error)
})
const db = getFirestore(app);

export { app, auth, db };
