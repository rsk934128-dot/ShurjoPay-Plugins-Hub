import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fallbackConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  fallbackConfig.firestoreDatabaseId ||
  'ai-studio-shurjopayplugins-71ee31b1-e424-439c-bd7c-5d1abfb43629';

// Initialize Firebase App as singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export auth and db instances for authentication and database operations
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);

export default app;
