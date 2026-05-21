/**
 * 🌱 Firestore Database Seeder
 * Adds sample guides and slots for testing
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample guides data
const sampleGuides = [
  {
    id: 'guide-career-1',
    name: 'Rajesh Kumar',
    bio: 'Former HR Manager at Google & Microsoft. Helped 500+ professionals transition careers successfully. Specialized in tech industry job hunting strategies.',
    avatar: '',
    domains: [
      { id: 'career', name: 'Career', description: 'Job & career guidance' },
      { id: 'studies', name: 'Studies', description: 'Academic planning' },
    ],
    domainIds: ['career', 'studies'],
    price: 299,
    rating: 4.8,
    totalSessions: 127,
    isActive: true,
    isAvailable: true,
  },
  {
    id: 'guide-mental-health-1',
    name: 'Priya Sharma',
    bio: 'Licensed therapist with 8 years experience. Specializing in anxiety, stress management, and work-life balance for young professionals.',
    avatar: '',
    domains: [
      { id: 'mental-health', name: 'Mental Health', description: 'Stress & anxiety support' },
      { id: 'relationships', name: 'Relationships', description: 'Dating & friendship advice' },
    ],
    domainIds: ['mental-health', 'relationships'],
    price: 399,
    rating: 4.9,
    totalSessions: 234,
    isActive: true,
    isAvailable: true,
  },
  {
    id: 'guide-finance-1',
    name: 'Amit Patel',
    bio: 'Certified Financial Planner. Simplifying personal finance, investment, and wealth building for millennials and Gen-Z.',
    avatar: '',
    domains: [
      { id: 'finance', name: 'Finance', description: 'Money management' },
      { id: 'career', name: 'Career', description: 'Salary negotiation' },
    ],
    domainIds: ['finance', 'career'],
    price: 499,
    rating: 4.7,
    totalSessions: 89,
    isActive: true,
    isAvailable: true,
  },
  {
    id: 'guide-relationships-1',
    name: 'Sneha Reddy',
    bio: 'Relationship counselor and life coach. Expert in navigating modern dating, communication, and building healthy relationships.',
    avatar: '',
    domains: [
      { id: 'relationships', name: 'Relationships', description: 'Dating & love advice' },
      { id: 'life-advice', name: 'Life Advice', description: 'General life guidance' },
    ],
    domainIds: ['relationships', 'life-advice'],
    price: 349,
    rating: 4.9,
    totalSessions: 156,
    isActive: true,
    isAvailable: true,
  },
];

// Generate slots for next 7 days
function generateSlots(guideId, guidePrice) {
  const slots = [];
  const timeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateString = date.toISOString().split('T')[0];
    
    timeSlots.forEach(time => {
      slots.push({
        id: `${guideId}-${dateString}-${time.replace(/[: ]/g, '-')}`,
        date: dateString,
        time: time,
        duration: 30,
        price: guidePrice,
        isBooked: false,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    });
  }
  
  return slots;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Add guides
    console.log('📝 Adding guides...');
    for (const guide of sampleGuides) {
      const guideRef = doc(db, 'guides', guide.id);
      const { id, ...guideData } = guide;
      await setDoc(guideRef, {
        ...guideData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added guide: ${guide.name}`);
      
      // Add slots for this guide
      console.log(`   📅 Adding slots for ${guide.name}...`);
      const slots = generateSlots(guide.id, guide.price);
      let slotCount = 0;
      
      for (const slot of slots) {
        const slotRef = doc(db, 'guides', guide.id, 'slots', slot.id);
        const { id, ...slotData } = slot;
        await setDoc(slotRef, slotData);
        slotCount++;
      }
      
      console.log(`   ✅ Added ${slotCount} slots\n`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Guides added: ${sampleGuides.length}`);
    console.log(`   - Slots per guide: ${generateSlots('test', 100).length}`);
    console.log(`   - Total slots: ${sampleGuides.length * generateSlots('test', 100).length}`);
    console.log(`\n✅ You can now test the booking flow at: http://localhost:3000/guides\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
