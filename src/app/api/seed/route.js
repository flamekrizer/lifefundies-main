import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const adminDb = getAdminDb();

    // 1. Core sample guides to seed
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

    const timeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
    let guidesCount = 0;
    let slotsCount = 0;

    for (const guide of sampleGuides) {
      const { id, ...guideData } = guide;
      
      // Save or overwrite the guide document with fixed ID
      await adminDb.collection('guides').doc(id).set({
        ...guideData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      guidesCount++;

      // Generate fresh slots for the next 7 days starting from today (in server local time)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        
        // Format YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        for (const time of timeSlots) {
          const slotId = `${id}-${dateString}-${time.replace(/[: ]/g, '-')}`;
          const slotPayload = {
            guideId: id,
            date: dateString,
            time: time,
            duration: 30,
            price: guide.price,
            isBooked: false,
            isBlocked: false,
            isActive: true,
            createdAt: new Date(),
          };

          // 1. Set in top-level guide_slots collection (V2 Flow)
          await adminDb.collection('guide_slots').doc(slotId).set(slotPayload);

          // 2. Set in legacy subcollection guides/{guideId}/slots (V1 Flow)
          await adminDb.collection('guides').doc(id).collection('slots').doc(slotId).set(slotPayload);

          slotsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully! Created/Updated ${guidesCount} guides and ${slotsCount} fresh slots for the next 7 days.`,
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}