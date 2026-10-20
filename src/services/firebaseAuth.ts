import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleAuthProvider, db, handleFirestoreError, OperationType } from './firebase';

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

const LOCAL_CURRENT_USER_KEY = 'shurjopay_current_session_user_v1';

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
 * Sign in with Google Popup (Official Firebase Auth Provisioned Provider)
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;
    const userDocRef = doc(db, 'users', fbUser.uid);

    let profile: UserProfile;
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        profile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: data.displayName || fbUser.displayName || 'Merchant',
          merchantName: data.merchantName || 'shurjoPay Merchant',
          storeId: data.storeId || 1,
          prefix: data.prefix || 'sp',
          createdAt: data.createdAt || new Date().toISOString(),
          provider: 'firebase',
        };
      } else {
        profile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Merchant',
          merchantName: 'shurjoPay Merchant',
          storeId: 1,
          prefix: 'sp',
          createdAt: new Date().toISOString(),
          provider: 'firebase',
        };
        await setDoc(userDocRef, {
          ...profile,
          serverCreated: serverTimestamp(),
        });
      }
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.GET, `users/${fbUser.uid}`);
    }

    setCurrentSessionUser(profile);
    return profile;
  } catch (authErr: any) {
    console.error('Firebase Google Sign-In error:', authErr);
    throw authErr;
  }
}

/**
 * 1-Click Sandbox Test Merchant Sign-In (for quick dev testing)
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
    provider: 'local_persistent',
  };
  setCurrentSessionUser(demoProfile);
  return demoProfile;
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  try {
    if (auth.currentUser) {
      await fbSignOut(auth);
    }
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  setCurrentSessionUser(null);
}

/**
 * Register user mock for legacy forms (if offline / fallback)
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

  setCurrentSessionUser(newProfile);
  return newProfile;
}

/**
 * Login user fallback
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const profile: UserProfile = {
    uid: `usr_${Date.now()}`,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    merchantName: 'Registered Merchant',
    storeId: 1,
    prefix: 'sp',
    createdAt: new Date().toISOString(),
    provider: 'local_persistent'
  };
  setCurrentSessionUser(profile);
  return profile;
}

/**
 * Update Profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = getCurrentSessionUser();
  if (!current) return null;

  const updated: UserProfile = {
    ...current,
    ...updates,
  };

  setCurrentSessionUser(updated);

  // If authenticated with Firebase, save to Firestore
  if (auth.currentUser && auth.currentUser.uid === current.uid) {
    try {
      await setDoc(doc(db, 'users', current.uid), updated, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${current.uid}`);
    }
  }

  return updated;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  return fbOnAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          setCurrentSessionUser(profile);
          callback(profile);
          return;
        }
      } catch (err) {
        console.warn('Error fetching Firestore user document:', err);
      }
      const basicProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Merchant',
        merchantName: 'shurjoPay Merchant',
        storeId: 1,
        prefix: 'sp',
        createdAt: new Date().toISOString(),
        provider: 'firebase',
      };
      setCurrentSessionUser(basicProfile);
      callback(basicProfile);
    } else {
      callback(getCurrentSessionUser());
    }
  });
}
