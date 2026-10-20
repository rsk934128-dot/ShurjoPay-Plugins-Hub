import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface SavedTransaction {
  id: string;
  orderId: string;
  spOrderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  bankTrxId?: string;
  spCode?: string;
  status: 'Completed' | 'Successful' | 'Cancelled' | 'Failed' | 'Initiated';
  method?: string;
  createdAt: string;
  userId?: string;
  endpoint?: string;
  durationMs?: number;
  syncedToFirestore?: boolean;
}

export interface UserMerchantSettings {
  activeMode: 'sandbox' | 'live';
  sandboxUsername: string;
  sandboxPassword?: string;
  sandboxPrefix: string;
  sandboxStoreId: string | number;
  sandboxBaseUrl: string;
  liveUsername?: string;
  livePassword?: string;
  livePrefix?: string;
  liveStoreId?: string | number;
  liveBaseUrl: string;
  clientIp?: string;
  defaultCurrency: 'BDT' | 'USD';
  webhookUrl?: string;
  lastPingStatus?: 'success' | 'failed' | null;
  lastPingTime?: string;
  userId?: string;
}

const DEFAULT_SETTINGS: UserMerchantSettings = {
  activeMode: 'sandbox',
  sandboxUsername: 'sp_sandbox',
  sandboxPassword: 'pyyk97hu&6u6',
  sandboxPrefix: 'sp',
  sandboxStoreId: 1,
  sandboxBaseUrl: 'https://sandbox.shurjopayment.com',
  liveUsername: '',
  livePassword: '',
  livePrefix: 'sp',
  liveStoreId: 1,
  liveBaseUrl: 'https://engine.shurjopay.com',
  clientIp: '103.101.1.2',
  defaultCurrency: 'BDT',
  webhookUrl: 'https://yoursite.com/api/shurjopay/callback',
  lastPingStatus: null
};

function getStorageKey(uid: string, type: string) {
  return `shurjopay_userdata_${uid}_${type}`;
}

// ----------------- SETTINGS -----------------

export function getUserSettings(uid: string): UserMerchantSettings {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'settings'));
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function fetchUserSettingsFromFirestore(uid: string): Promise<UserMerchantSettings> {
  const local = getUserSettings(uid);
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return local;
  }
  const path = `users/${uid}/settings/merchant`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'settings', 'merchant'));
    if (snap.exists()) {
      const data = snap.data() as UserMerchantSettings;
      const merged = { ...DEFAULT_SETTINGS, ...data };
      localStorage.setItem(getStorageKey(uid, 'settings'), JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return local;
}

export function saveUserSettings(uid: string, settings: Partial<UserMerchantSettings>): UserMerchantSettings {
  const current = getUserSettings(uid);
  const updated = { ...current, ...settings, userId: uid };
  try {
    localStorage.setItem(getStorageKey(uid, 'settings'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings locally:', e);
  }

  // Sync to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const path = `users/${uid}/settings/merchant`;
    setDoc(doc(db, 'users', uid, 'settings', 'merchant'), updated, { merge: true }).catch((err) => {
      console.warn('Firestore settings sync warn:', err);
    });
  }

  return updated;
}

// ----------------- TRANSACTIONS & TEST LOGS -----------------

export function getUserTransactions(uid: string): SavedTransaction[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'transactions'));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchTransactionsFromFirestore(uid: string): Promise<SavedTransaction[]> {
  const local = getUserTransactions(uid);
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return local;
  }
  const path = `users/${uid}/transactions`;
  try {
    const q = query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: SavedTransaction[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as SavedTransaction), syncedToFirestore: true });
    });
    if (list.length > 0) {
      localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(list));
      return list;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
  return local;
}

/**
 * Real-time listener for user test transactions in Firestore
 */
export function subscribeToUserTransactions(
  uid: string, 
  onUpdate: (txs: SavedTransaction[]) => void
): () => void {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    // Return empty unsubscribe if not authenticated in Firestore
    return () => {};
  }

  const path = `users/${uid}/transactions`;
  const q = query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const liveList: SavedTransaction[] = [];
      snapshot.forEach((d) => {
        liveList.push({ ...(d.data() as SavedTransaction), syncedToFirestore: true });
      });
      if (liveList.length > 0) {
        localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(liveList));
      }
      onUpdate(liveList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Save transaction both locally and directly to Firebase Firestore
 */
export function saveUserTransaction(uid: string, tx: SavedTransaction): SavedTransaction[] {
  const sanitizedId = tx.id ? tx.id.replace(/[^a-zA-Z0-9_-]/g, '_') : `tx_${Date.now()}`;
  const isCloudAuth = !!auth.currentUser && auth.currentUser.uid === uid;
  const enrichedTx: SavedTransaction = {
    ...tx,
    id: sanitizedId,
    userId: uid,
    syncedToFirestore: isCloudAuth
  };

  const list = getUserTransactions(uid);
  const filtered = list.filter((item) => item.id !== sanitizedId && item.spOrderId !== tx.spOrderId);
  const updated = [enrichedTx, ...filtered].slice(0, 50);

  try {
    localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transaction locally:', e);
  }

  // Sync to Firestore if authenticated
  if (isCloudAuth) {
    const txDocRef = doc(db, 'users', uid, 'transactions', sanitizedId);
    setDoc(txDocRef, enrichedTx, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/transactions/${sanitizedId}`);
    });
  }

  return updated;
}

/**
 * Async version of saving transaction with explicit await
 */
export async function saveUserTransactionAsync(
  uid: string, 
  tx: SavedTransaction
): Promise<{ updated: SavedTransaction[]; syncedToFirestore: boolean }> {
  const sanitizedId = tx.id ? tx.id.replace(/[^a-zA-Z0-9_-]/g, '_') : `tx_${Date.now()}`;
  const isCloudAuth = !!auth.currentUser && auth.currentUser.uid === uid;
  const enrichedTx: SavedTransaction = {
    ...tx,
    id: sanitizedId,
    userId: uid,
    syncedToFirestore: isCloudAuth
  };

  const list = getUserTransactions(uid);
  const filtered = list.filter((item) => item.id !== sanitizedId && item.spOrderId !== tx.spOrderId);
  const updated = [enrichedTx, ...filtered].slice(0, 50);

  try {
    localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transaction locally:', e);
  }

  if (isCloudAuth) {
    try {
      const txDocRef = doc(db, 'users', uid, 'transactions', sanitizedId);
      await setDoc(txDocRef, enrichedTx, { merge: true });
      return { updated, syncedToFirestore: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/transactions/${sanitizedId}`);
    }
  }

  return { updated, syncedToFirestore: false };
}

/**
 * Delete individual transaction from local and Firestore
 */
export async function deleteUserTransaction(uid: string, txId: string): Promise<SavedTransaction[]> {
  const list = getUserTransactions(uid);
  const updated = list.filter((item) => item.id !== txId);

  try {
    localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete transaction locally:', e);
  }

  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'transactions', txId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/transactions/${txId}`);
    }
  }

  return updated;
}

/**
 * Push all local transactions to Firestore once user signs in
 */
export async function syncLocalTransactionsToFirestore(uid: string): Promise<number> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return 0;
  }

  const localList = getUserTransactions(uid);
  let count = 0;

  for (const item of localList) {
    const sanitizedId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      const txDocRef = doc(db, 'users', uid, 'transactions', sanitizedId);
      await setDoc(txDocRef, { ...item, userId: uid, syncedToFirestore: true }, { merge: true });
      count++;
    } catch (err) {
      console.warn(`Failed syncing transaction ${item.id} to Firestore:`, err);
    }
  }

  return count;
}

export function clearUserTransactions(uid: string): void {
  try {
    localStorage.removeItem(getStorageKey(uid, 'transactions'));
  } catch (e) {
    console.error('Failed to clear transactions:', e);
  }

  if (auth.currentUser && auth.currentUser.uid === uid) {
    // Asynchronously clear recent docs in Firestore
    const q = query(collection(db, 'users', uid, 'transactions'), limit(50));
    getDocs(q).then((snap) => {
      snap.forEach((d) => {
        deleteDoc(d.ref).catch(() => {});
      });
    }).catch(() => {});
  }
}

// ----------------- FAVORITES -----------------

export function getUserFavoritePlugins(uid: string): string[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'favorite_plugins'));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleUserFavoritePlugin(uid: string, pluginId: string): string[] {
  const current = getUserFavoritePlugins(uid);
  const exists = current.includes(pluginId);
  const updated = exists ? current.filter((id) => id !== pluginId) : [...current, pluginId];
  try {
    localStorage.setItem(getStorageKey(uid, 'favorite_plugins'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
  return updated;
}

// ----------------- KYC -----------------

export interface MerchantKycData {
  userId?: string;
  tinNumber: string;
  tinOwnerName: string;
  tinTaxZone: string;
  tinTaxCircle: string;
  tinStatus: 'verified' | 'pending' | 'unsubmitted';
  tinDocumentName?: string;
  tradeLicenseNumber: string;
  tradeLicenseAuthority: string;
  tradeLicenseCategory: string;
  tradeLicenseIssueDate: string;
  tradeLicenseExpiryDate: string;
  tradeLicenseStatus: 'verified' | 'pending' | 'expired' | 'unsubmitted';
  tradeLicenseDocumentName?: string;
  nidNumber: string;
  nidNameEn: string;
  nidNameBn: string;
  nidDob: string;
  nidFatherName: string;
  nidStatus: 'verified' | 'pending' | 'unsubmitted';
  nidDocumentName?: string;
  passportNumber: string;
  passportCountry: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportStatus: 'verified' | 'pending' | 'unsubmitted';
  passportDocumentName?: string;
  overallComplianceStatus: 'approved' | 'in_review' | 'incomplete';
  updatedAt?: string;
}

export const DEFAULT_KYC_DATA: MerchantKycData = {
  tinNumber: '584930192847',
  tinOwnerName: 'শেখ ফরিদ / Tech Solutions BD',
  tinTaxZone: 'Zone-08 (Dhaka)',
  tinTaxCircle: 'Circle-165 (Gulshan)',
  tinStatus: 'verified',
  tinDocumentName: 'e_tin_certificate_2025_2026.pdf',
  tradeLicenseNumber: 'TRAD/DNCC/049281/2024',
  tradeLicenseAuthority: 'ঢাকা উত্তর সিটি কর্পোরেশন (DNCC, Zone-3)',
  tradeLicenseCategory: 'সফটওয়্যার ডেভেলপমেন্ট ও ই-কমার্স সেবা',
  tradeLicenseIssueDate: '2024-07-01',
  tradeLicenseExpiryDate: '2026-06-30',
  tradeLicenseStatus: 'verified',
  tradeLicenseDocumentName: 'trade_license_dncc_valid.pdf',
  nidNumber: '6492019385',
  nidNameEn: 'SHEIKH FARID',
  nidNameBn: 'শেখ ফরিদ',
  nidDob: '1992-04-14',
  nidFatherName: 'মো: রফিকুল ইসলাম',
  nidStatus: 'verified',
  nidDocumentName: 'smart_nid_card_front_back.pdf',
  passportNumber: 'A04928174',
  passportCountry: 'বাংলাদেশ (Bangladesh)',
  passportIssueDate: '2021-03-10',
  passportExpiryDate: '2031-03-09',
  passportStatus: 'verified',
  passportDocumentName: 'passport_bio_page_scan.pdf',
  overallComplianceStatus: 'approved',
  updatedAt: new Date().toISOString()
};

export function getUserKycData(uid: string): MerchantKycData {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'kyc_documents'));
    return raw ? { ...DEFAULT_KYC_DATA, ...JSON.parse(raw) } : DEFAULT_KYC_DATA;
  } catch {
    return DEFAULT_KYC_DATA;
  }
}

export function saveUserKycData(uid: string, kyc: Partial<MerchantKycData>): MerchantKycData {
  const current = getUserKycData(uid);
  const updated = { 
    ...current, 
    ...kyc,
    userId: uid,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(getStorageKey(uid, 'kyc_documents'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save KYC documents:', e);
  }

  if (auth.currentUser && auth.currentUser.uid === uid) {
    setDoc(doc(db, 'users', uid, 'compliance', 'kyc'), updated, { merge: true }).catch((err) => {
      console.warn('Firestore KYC sync warn:', err);
    });
  }

  return updated;
}
