import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function getFirebaseFunctions(): Functions | null {
  if (!isFirebaseConfigured()) return null;
  if (!functions) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    const region = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? 'us-central1';
    functions = getFunctions(firebaseApp, region);
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR === '1') {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
  }
  return functions;
}
