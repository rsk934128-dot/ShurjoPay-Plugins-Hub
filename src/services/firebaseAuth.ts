import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  merchantName?: string;
  storeId?: string | number;
  prefix?: string;
  createdAt: string;
  provider: 'firebase' | 'local_persistent';
}

// Fallback configuration if custom Firebase keys aren't set in environment
const defaultFirebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDemoShurjoPayKey1234567890",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "shurjopay-hub.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "shurjopay-hub",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "shurjopay-hub.appspot.com",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "622126518866",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:622126518866:web:shurjopay123456"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let isFirebaseInitialized = false;

try {
  if (!getApps().length) {
    app = initializeApp(defaultFirebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn('Firebase initialized with local fallback:', error);
  isFirebaseInitialized = false;
}

// Persistent Local User Storage Keys
const LOCAL_USERS_KEY = 'shurjopay_registered_users_v1';
const LOCAL_CURRENT_USER_KEY = 'shurjopay_current_session_user_v1';

function getStoredLocalUsers(): Array<{ email: string; passwordHash: string; profile: UserProfile }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalUsers(users: Array<{ email: string; passwordHash: string; profile: UserProfile }>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist users to localStorage:', e);
  }
}

export function getCurrentSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update session:', e);
  }
}

/**
 * Register user with Email, Password & Merchant Details
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string,
  merchantName?: string,
  storeId?: string | number,
  prefix: string = 'sp'
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Try Real Firebase Auth if real project configured
  if (isFirebaseInitialized && auth && defaultFirebaseConfig.apiKey !== "AIzaSyDemoShurjoPayKey1234567890") {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split('@')[0],
        merchantName: merchantName || 'Merchant Store',
        storeId: storeId || 1,
        prefix: prefix || 'sp',
        createdAt: new Date().toISOString(),
        provider: 'firebase'
      };
      setCurrentSessionUser(profile);
      return profile;
    } catch (fbErr: any) {
      // If Firebase rejects (e.g. mock API key or offline network), seamlessly fallback to local durable auth
      console.info('Firebase Auth network response, using local persistent auth layer:', fbErr.message);
    }
  }

  // Local Persistent Auth Layer (Durable across browser reloads & tabs)
  const users = getStoredLocalUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।');
  }

  const newProfile: UserProfile = {
    uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
    merchantName: merchantName || 'ShurjoPay Merchant',
    storeId: storeId || 1,
    prefix: prefix || 'sp',
    createdAt: new Date().toISOString(),
    provider: 'local_persistent'
  };

  users.push({
    email: cleanEmail,
    passwordHash: pass, // In client mock store
    profile: newProfile
  });
  saveStoredLocalUsers(users);
  setCurrentSessionUser(newProfile);

  return newProfile;
}

/**
 * Login user with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // Try Real Firebase Auth
  if (isFirebaseInitialized && auth && defaultFirebaseConfig.apiKey !== "AIzaSyDemoShurjoPayKey1234567890") {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cleanEmail,
        displayName: cred.user.displayName || cleanEmail.split('@')[0],
        merchantName: 'Registered Merchant',
        storeId: 1,
        prefix: 'sp',
        createdAt: new Date().toISOString(),
        provider: 'firebase'
      };
      setCurrentSessionUser(profile);
      return profile;
    } catch (fbErr: any) {
      console.info('Firebase login fallback to local check:', fbErr.message);
    }
  }

  // Check Local Persistent Auth
  const users = getStoredLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  // If user doesn't exist yet and it's the demo credentials
  if (!found && cleanEmail === 'merchant@shurjopay.com.bd' && pass === 'sp123456') {
    const demoProfile: UserProfile = {
      uid: 'demo_merchant_01',
      email: 'merchant@shurjopay.com.bd',
      displayName: 'Maharab Kibria (Merchant)',
      merchantName: 'Dhaka Tech Solutions',
      storeId: 1,
      prefix: 'sp',
      createdAt: new Date().toISOString(),
      provider: 'local_persistent'
    };
    users.push({
      email: cleanEmail,
      passwordHash: pass,
      profile: demoProfile
    });
    saveStoredLocalUsers(users);
    setCurrentSessionUser(demoProfile);
    return demoProfile;
  }

  if (!found) {
    throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে রেজিস্ট্রেশন করুন।');
  }

  if (found.passwordHash !== pass) {
    throw new Error('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
  }

  setCurrentSessionUser(found.profile);
  return found.profile;
}

/**
 * Quick 1-Click Test Merchant Sign-In
 */
export async function loginWithDemoMerchant(): Promise<UserProfile> {
  const demoProfile: UserProfile = {
    uid: 'demo_merchant_sp_sandbox',
    email: 'sp_sandbox@shurjopay.com.bd',
    displayName: 'Sandbox Test Merchant',
    merchantName: 'ShurjoPay Sandbox Store',
    storeId: 1,
    prefix: 'sp',
    createdAt: new Date().toISOString(),
    provider: 'local_persistent'
  };
  setCurrentSessionUser(demoProfile);
  return demoProfile;
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  if (isFirebaseInitialized && auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  }
  setCurrentSessionUser(null);
}

/**
 * Update Profile
 */
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
  const current = getCurrentSessionUser();
  if (!current) return null;

  const updated: UserProfile = {
    ...current,
    ...updates
  };

  setCurrentSessionUser(updated);

  // update in users list
  const users = getStoredLocalUsers();
  const idx = users.findIndex((u) => u.profile.uid === updated.uid);
  if (idx !== -1) {
    users[idx].profile = updated;
    saveStoredLocalUsers(users);
  }

  return updated;
}
