const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Parse .env file in parent directory
const envPath = path.join(__dirname, '../.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      env[match[1]] = val;
    }
  });
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

console.log('Firebase Configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    // 1. Fetch Bookings
    console.log('\n--- Bookings ---');
    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    if (bookingsSnap.empty) {
      console.log('No bookings found.');
    } else {
      bookingsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        console.log(`Booking ID: ${docSnap.id}`);
        console.log(`  guideId: ${data.guideId}`);
        console.log(`  userId: ${data.userId}`);
        console.log(`  status: ${data.status}`);
        console.log(`  paymentStatus: ${data.paymentStatus}`);
        console.log(`  sessionDate: ${data.sessionDate} at ${data.sessionTime}`);
        console.log(`  slotId: ${data.slotId}`);
      });
    }

    // 2. Fetch Slots
    console.log('\n--- Slots ---');
    const slotsSnap = await getDocs(collection(db, 'guide_slots'));
    if (slotsSnap.empty) {
      console.log('No slots found in guide_slots.');
    } else {
      slotsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        console.log(`Slot ID: ${docSnap.id}`);
        console.log(`  guideId: ${data.guideId}`);
        console.log(`  date: ${data.date} at ${data.time}`);
        console.log(`  isBooked: ${data.isBooked}`);
        console.log(`  bookedBy: ${data.bookedBy}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

run();
