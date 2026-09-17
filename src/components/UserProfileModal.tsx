import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Store, 
  KeyRound, 
  History, 
  Save, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  FileCheck,
  FileText,
  Globe,
  UploadCloud,
  Check
} from 'lucide-react';
import { UserProfile, logoutUser, updateUserProfile } from '../services/firebaseAuth';
import { 
  getUserSettings, 
  saveUserSettings, 
  getUserTransactions, 
  clearUserTransactions, 
  SavedTransaction, 
  UserMerchantSettings,
  getUserKycData,
  saveUserKycData,
  MerchantKycData
} from '../services/userData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onProfileUpdated?: (user: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials' | 'kyc' | 'transactions'>('profile');
  
  // Profile edit
  const [displayName, setDisplayName] = useState(user.displayName);
  const [merchantName, setMerchantName] = useState(user.merchantName || '');
  const [storeId, setStoreId] = useState(String(user.storeId || 1));
  const [prefix, setPrefix] = useState(user.prefix || 'sp');

  // Merchant Settings
  const [settings, setSettings] = useState<UserMerchantSettings>(() => getUserSettings(user.uid));

  // KYC Documents (TIN, Trade License, NID, Passport)
  const [kycData, setKycData] = useState<MerchantKycData>(() => getUserKycData(user.uid));
  
  // Transactions
  const [transactions, setTransactions] = useState<SavedTransaction[]>(() => getUserTransactions(user.uid));

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getUserSettings(user.uid));
      setKycData(getUserKycData(user.uid));
      setTransactions(getUserTransactions(user.uid));
      setDisplayName(user.displayName);
      setMerchantName(user.merchantName || '');
      setStoreId(String(user.storeId || 1));
      setPrefix(user.prefix || 'sp');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserProfile({
      displayName,
      merchantName,
      storeId,
      prefix
    });
    if (updated && onProfileUpdated) {
      onProfileUpdated(updated);
    }
    setSavedStatus('প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSavedStatus(null), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserSettings(user.uid, settings);
    setSavedStatus('গেটওয়ে ক্রেডেনশিয়াল সফলভাবে সেভ করা হয়েছে!');
    setTimeout(() => setSavedStatus(null), 2500);
  };

  const handleSaveKyc = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserKycData(user.uid, kycData);
    setSavedStatus('টিআইএন, লাইসেন্স, এনআইডি ও পাসপোর্ট তথ্য সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setSavedStatus(null), 2500);
  };

  const handleClearTransactions = () => {
    if (confirm('আপনি কি সব সংরক্ষিত ট্রানজ্যাকশন হিস্ট্রি মুছে ফেলতে চান?')) {
      clearUserTransactions(user.uid);
      setTransactions([]);
      setSavedStatus('ট্রানজ্যাকশন হিস্ট্রি মুছে ফেলা হয়েছে।');
      setTimeout(() => setSavedStatus(null), 2000);
    }
  };

  const handleSignOutClick = async () => {
    await logoutUser();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="user-profile-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-base shadow-sm">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{user.displayName}</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  লগইন রয়েছে (Active)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOutClick}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              লগআউট
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            প্রোফাইল ও মার্চেন্ট তথ্য
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            সংরক্ষিত API ক্রেডেনশিয়াল
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'kyc'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            টিআইএন, লাইসেন্স, এনআইডি, পাসপোর্ট
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            সেভ করা ট্রানজ্যাকশন ({transactions.length})
          </button>
        </div>

        {/* Status notification */}
        {savedStatus && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{savedStatus}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: Profile & Merchant info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মার্চেন্ট / প্রতিষ্ঠানের নাম</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মার্চেন্ট স্টোর আইডি (Store ID)</label>
                  <input
                    type="text"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    অথেন্টিকেশন প্রোভাইডার
                  </span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Firebase Auth Compatible
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ইউজার আইডি (UID):</span>
                  <code className="font-mono text-slate-300 text-[10px]">{user.uid}</code>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>অ্যাকাউন্ট খোলার সময়:</span>
                  <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Credentials Settings */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  স্যান্ডবক্স ক্রেডেনশিয়াল (Sandbox Credentials)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Sandbox Username</label>
                    <input
                      type="text"
                      value={settings.sandboxUsername}
                      onChange={(e) => setSettings({ ...settings, sandboxUsername: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sandbox Password</label>
                    <input
                      type="password"
                      value={settings.sandboxPassword || ''}
                      onChange={(e) => setSettings({ ...settings, sandboxPassword: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Prefix</label>
                    <input
                      type="text"
                      value={settings.sandboxPrefix}
                      onChange={(e) => setSettings({ ...settings, sandboxPrefix: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sandbox Store ID</label>
                    <input
                      type="text"
                      value={settings.sandboxStoreId}
                      onChange={(e) => setSettings({ ...settings, sandboxStoreId: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Sandbox Base URL</label>
                    <input
                      type="text"
                      value={settings.sandboxBaseUrl || 'https://sandbox.shurjopay.com'}
                      onChange={(e) => setSettings({ ...settings, sandboxBaseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  লাইভ ইঞ্জিন ক্রেডেনশিয়াল (Live Production Credentials)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Live Username</label>
                    <input
                      type="text"
                      placeholder="e.g. your_merchant_username"
                      value={settings.liveUsername || ''}
                      onChange={(e) => setSettings({ ...settings, liveUsername: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Live Secret Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={settings.livePassword || ''}
                      onChange={(e) => setSettings({ ...settings, livePassword: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Live Base URL</label>
                    <input
                      type="text"
                      value={settings.liveBaseUrl || 'https://engine.shurjopay.com'}
                      onChange={(e) => setSettings({ ...settings, liveBaseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  ক্রেডেনশিয়াল সেভ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: KYC & Legal Documents (TIN, Trade License, NID, Passport) */}
          {activeTab === 'kyc' && (
            <form onSubmit={handleSaveKyc} className="space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">বাংলাদেশ ব্যাংক PSO রেগুলেশন কমপ্লায়েন্স</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                    লাইভ গেটওয়ে অ্যাক্টিভেশনের জন্য আপনার ই-টিআইএন, ট্রেড লাইসেন্স, এনআইডি এবং পাসপোর্ট তথ্য সংরক্ষণ করুন।
                  </p>
                </div>
              </div>

              {/* 1. e-TIN */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    ১. ই-টিআইএন (e-TIN) সনদ
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    NBR Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">১২ ডিজিট টিআইএন নম্বর</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={kycData.tinNumber}
                      onChange={(e) => setKycData({ ...kycData, tinNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">করদাতার নাম</label>
                    <input
                      type="text"
                      value={kycData.tinOwnerName}
                      onChange={(e) => setKycData({ ...kycData, tinOwnerName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">কর অঞ্চল</label>
                    <input
                      type="text"
                      value={kycData.tinTaxZone}
                      onChange={(e) => setKycData({ ...kycData, tinTaxZone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ট্যাক্স সার্কেল</label>
                    <input
                      type="text"
                      value={kycData.tinTaxCircle}
                      onChange={(e) => setKycData({ ...kycData, tinTaxCircle: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Trade License */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    ২. ট্রেড লাইসেন্স (Trade License)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Active &amp; Valid
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ট্রেড লাইসেন্স নম্বর</label>
                    <input
                      type="text"
                      value={kycData.tradeLicenseNumber}
                      onChange={(e) => setKycData({ ...kycData, tradeLicenseNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ইস্যুকারী কর্তৃপক্ষ</label>
                    <input
                      type="text"
                      value={kycData.tradeLicenseAuthority}
                      onChange={(e) => setKycData({ ...kycData, tradeLicenseAuthority: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ব্যবসার ক্যাটাগরি</label>
                    <input
                      type="text"
                      value={kycData.tradeLicenseCategory}
                      onChange={(e) => setKycData({ ...kycData, tradeLicenseCategory: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">মেয়াদোত্তীর্ণের তারিখ</label>
                    <input
                      type="date"
                      value={kycData.tradeLicenseExpiryDate}
                      onChange={(e) => setKycData({ ...kycData, tradeLicenseExpiryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. National ID (NID) */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    ৩. জাতীয় পরিচয়পত্র (National ID / NID)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    EC Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">১০/১৭ ডিজিট এনআইডি নম্বর</label>
                    <input
                      type="text"
                      value={kycData.nidNumber}
                      onChange={(e) => setKycData({ ...kycData, nidNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">নাম (ইংরেজিতে NID অনুযায়ী)</label>
                    <input
                      type="text"
                      value={kycData.nidNameEn}
                      onChange={(e) => setKycData({ ...kycData, nidNameEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 uppercase text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">নাম (বাংলায়)</label>
                    <input
                      type="text"
                      value={kycData.nidNameBn}
                      onChange={(e) => setKycData({ ...kycData, nidNameBn: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">জন্ম তারিখ</label>
                    <input
                      type="date"
                      value={kycData.nidDob}
                      onChange={(e) => setKycData({ ...kycData, nidDob: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Passport */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    ৪. পাসপোর্ট (Passport)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Valid ICAO Passport
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">পাসপোর্ট নম্বর</label>
                    <input
                      type="text"
                      value={kycData.passportNumber}
                      onChange={(e) => setKycData({ ...kycData, passportNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono uppercase text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ইস্যুকারী দেশ</label>
                    <input
                      type="text"
                      value={kycData.passportCountry}
                      onChange={(e) => setKycData({ ...kycData, passportCountry: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">মেয়াদোত্তীর্ণের তারিখ</label>
                    <input
                      type="date"
                      value={kycData.passportExpiryDate}
                      onChange={(e) => setKycData({ ...kycData, passportExpiryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">সংযুক্ত ডকুমেন্ট</label>
                    <span className="block px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-emerald-400 font-mono text-[11px] truncate">
                      {kycData.passportDocumentName || 'passport_bio_page_scan.pdf'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  কেওয়াইসি ও নথি তথ্য সেভ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Saved Transactions History */}
          {activeTab === 'transactions' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  স্যান্ডবক্স সিমুলেটরে সম্পন্ন করা ট্রানজ্যাকশনগুলো স্বয়ংক্রিয়ভাবে আপনার অ্যাকাউন্টে সেভ থাকে।
                </p>
                {transactions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearTransactions}
                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" />
                    সব মুছুন
                  </button>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium">কোন সংরক্ষিত ট্রানজ্যাকশন নেই</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sandbox Simulator-এ পেমেন্ট টেস্ট করলে তা এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-200">{tx.orderId}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.status === 'Completed' || tx.status === 'Successful'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : tx.status === 'Cancelled'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {tx.status} ({tx.spCode || '1000'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3">
                          <span>গ্রাহক: {tx.customerName}</span>
                          <span>ফোন: {tx.customerPhone}</span>
                          {tx.bankTrxId && <span>Bank Trx: <code className="text-slate-300 font-mono">{tx.bankTrxId}</code></span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-400 block font-mono">
                          {tx.currency} {tx.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Firebase Session Active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
