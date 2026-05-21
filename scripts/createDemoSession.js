/**
 * Creates a mock live session in Firestore for testing and demo purposes
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lifefundies-d66e9';
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
let privateKey = env.FIREBASE_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, '\n');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();

async function createDemo() {
  console.log('🌱 Creating demo booking and session documents...');

  const bookingId = 'demo-booking';
  const sessionId = 'demo-session';

  // 1. Create a live mock booking
  const bookingPayload = {
    bookingId,
    userId: 'demo-user-id',
    guideId: 'guide-mental-health-1', // Priya Sharma
    slotId: 'demo-slot-id',
    domain: 'mental-health',
    selectedIssue: 'Anxiety and career stress management',
    userNotes: 'Looking forward to career transition tips.',
    price: 399,
    amount: 399,
    paymentStatus: 'paid',
    status: 'active', // active so it can be joined
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '02:00 PM',
    sessionDuration: 30,
    sessionType: 'video', // Video call
    sessionCreated: true,
    sessionId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('bookings').doc(bookingId).set(bookingPayload);
  console.log(`✅ Mock Booking Created: ${bookingId}`);

  // 2. Create a live mock session
  const sessionPayload = {
    sessionId,
    bookingId,
    userId: 'demo-user-id',
    guideId: 'guide-mental-health-1',
    domain: 'mental-health',
    scheduledAt: new Date().toISOString(), // Starting right now!
    duration: 30,
    status: 'active', // active or upcoming
    videoRoomId: `lf-session-${sessionId}`,
    chatEnabled: true,
    notes: 'Demo session notes: Priya recommends deep breathing techniques and setting boundaries at work.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('sessions').doc(sessionId).set(sessionPayload);
  console.log(`✅ Mock Session Created: ${sessionId}`);

  console.log('\n🎉 Demo booking and session are now LIVE in Firestore!');
  console.log(`🔗 Demo URL: http://localhost:3000/session/${sessionId}`);
  process.exit(0);
}

createDemo().catch(err => {
  console.error('❌ Failed to create demo:', err);
  process.exit(1);
});
