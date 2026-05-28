const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables from a local .env (not committed) if present
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv is optional — fall back to process.env
}

const env = process.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log('Testing connection to Firestore...');
  const timeout = setTimeout(() => {
    console.error('❌ Connection timed out after 5 seconds.');
    process.exit(1);
  }, 5000);

  try {
    const testDocRef = doc(db, 'test_connection', 'test_doc');
    await setDoc(testDocRef, {
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
    clearTimeout(timeout);
    console.log('✅ SUCCESS! Firestore database is writable!');
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Firestore write failed:');
    console.error(error.message || error);
    process.exit(1);
  }
}

runTest();
