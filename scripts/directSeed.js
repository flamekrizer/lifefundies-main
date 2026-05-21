/**
 * Standalone direct FireStore database seeder - Dynamically seeds slots for ALL existing guides
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

// Clean private key newlines
privateKey = privateKey.replace(/\\n/g, '\n');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

const timeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

async function seed() {
  console.log('🌱 Fetching all guides from your database...');
  
  const guidesSnapshot = await db.collection('guides').get();
  
  if (guidesSnapshot.empty) {
    console.log('⚠️ No guides found in the database. Seeding default guides first...');
    // Seed default guides if collection is empty
    const defaultGuides = [
      {
        id: 'guide-career-1',
        name: 'Rajesh Kumar',
        bio: 'Former HR Manager at Google & Microsoft. Helped 500+ professionals transition careers successfully.',
        isActive: true,
        price: 299,
        rating: 4.8,
      },
      {
        id: 'guide-mental-health-1',
        name: 'Priya Sharma',
        bio: 'Licensed therapist with 8 years experience. Specializing in anxiety & stress.',
        isActive: true,
        price: 399,
        rating: 4.9,
      }
    ];

    for (const dg of defaultGuides) {
      const { id, ...data } = dg;
      await db.collection('guides').doc(id).set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Refresh snapshot
    console.log('✅ Default guides seeded successfully.');
  }

  // Refetch guides to process all of them
  const finalSnapshot = await db.collection('guides').get();
  console.log(`📋 Found ${finalSnapshot.size} guides in your database.`);
  
  let slotsCount = 0;

  for (const doc of finalSnapshot.docs) {
    const guideId = doc.id;
    const guideData = doc.data();
    const guideName = guideData.name || 'Unnamed Guide';
    const guidePrice = guideData.price || 399;

    console.log(`\n📅 Generating slots for guide: ${guideName} (${guideId})...`);

    // Generate slots for next 7 days from today
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      for (const time of timeSlots) {
        const slotId = `${guideId}-${dateString}-${time.replace(/[: ]/g, '-')}`;
        const slotPayload = {
          guideId: guideId,
          date: dateString,
          time: time,
          duration: 30,
          price: guidePrice,
          isBooked: false,
          isBlocked: false,
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 1. Write to top-level guide_slots (V2 Flow)
        await db.collection('guide_slots').doc(slotId).set(slotPayload);

        // 2. Write to nested subcollection guides/{guideId}/slots (V1 Flow)
        await db.collection('guides').doc(guideId).collection('slots').doc(slotId).set(slotPayload);

        slotsCount++;
      }
    }
    console.log(`✅ Generated 7 days of slots for ${guideName}`);
  }

  console.log(`\n🎉 Completed Seeding! Successfully generated slots for all ${finalSnapshot.size} guides (Total slots created: ${slotsCount}).`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
