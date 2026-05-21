import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const adminDb = getAdminDb();

    const ref = await adminDb.collection('testWrites').add({
      message: 'Firestore connection test successful',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: ref.id,
      message: 'Test write successful',
    });
  } catch (error) {
    console.error('❌ Firestore test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        fullError: String(error),
      },
      { status: 500 }
    );
  }
}