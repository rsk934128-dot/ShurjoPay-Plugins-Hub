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

export function getUserSettings(uid: string): UserMerchantSettings {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'settings'));
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(uid: string, settings: Partial<UserMerchantSettings>): UserMerchantSettings {
  const current = getUserSettings(uid);
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(getStorageKey(uid, 'settings'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
  return updated;
}

export function getUserTransactions(uid: string): SavedTransaction[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, 'transactions'));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserTransaction(uid: string, tx: SavedTransaction): SavedTransaction[] {
  const list = getUserTransactions(uid);
  // Avoid duplicate by orderId or spOrderId
  const filtered = list.filter((item) => item.id !== tx.id && item.spOrderId !== tx.spOrderId);
  const updated = [tx, ...filtered].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(getStorageKey(uid, 'transactions'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transaction:', e);
  }
  return updated;
}

export function clearUserTransactions(uid: string): void {
  try {
    localStorage.removeItem(getStorageKey(uid, 'transactions'));
  } catch (e) {
    console.error('Failed to clear transactions:', e);
  }
}

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

export interface MerchantKycData {
  // 1. e-TIN (Taxpayer Identification Number)
  tinNumber: string;
  tinOwnerName: string;
  tinTaxZone: string;
  tinTaxCircle: string;
  tinStatus: 'verified' | 'pending' | 'unsubmitted';
  tinDocumentName?: string;

  // 2. Trade License (ব্যবসা প্রতিষ্ঠানের ট্রেড লাইসেন্স)
  tradeLicenseNumber: string;
  tradeLicenseAuthority: string;
  tradeLicenseCategory: string;
  tradeLicenseIssueDate: string;
  tradeLicenseExpiryDate: string;
  tradeLicenseStatus: 'verified' | 'pending' | 'expired' | 'unsubmitted';
  tradeLicenseDocumentName?: string;

  // 3. National ID (জাতীয় পরিচয়পত্র / NID)
  nidNumber: string;
  nidNameEn: string;
  nidNameBn: string;
  nidDob: string;
  nidFatherName: string;
  nidStatus: 'verified' | 'pending' | 'unsubmitted';
  nidDocumentName?: string;

  // 4. Passport (পাসপোর্ট)
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
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(getStorageKey(uid, 'kyc_documents'), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save KYC documents:', e);
  }
  return updated;
}

