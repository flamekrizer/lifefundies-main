import { initializeApp, getApps, getApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredFirebaseVars = [
  { key: 'VITE_FIREBASE_API_KEY', value: import.meta.env.VITE_FIREBASE_API_KEY },
  { key: 'VITE_FIREBASE_AUTH_DOMAIN', value: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN },
  { key: 'VITE_FIREBASE_PROJECT_ID', value: import.meta.env.VITE_FIREBASE_PROJECT_ID },
  { key: 'VITE_FIREBASE_STORAGE_BUCKET', value: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET },
  { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', value: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID },
  { key: 'VITE_FIREBASE_APP_ID', value: import.meta.env.VITE_FIREBASE_APP_ID },
]

const missingVars = requiredFirebaseVars.filter(v => !v.value).map(v => v.key)
if (missingVars.length) {
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}. Add them and rebuild the app.`)
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to initialize Firebase auth persistence:', error)
})
const db = getFirestore(app);

export { app, auth, db };
