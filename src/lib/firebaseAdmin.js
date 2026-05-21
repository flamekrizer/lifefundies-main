import admin from 'firebase-admin';

function ensureAdminApp() {
  if (admin.apps.length) return admin.app();

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Initialize only when all service-account vars exist.
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export function getAdminDb() {
  const app = ensureAdminApp();
  if (!app) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID), FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  return admin.firestore();
}
