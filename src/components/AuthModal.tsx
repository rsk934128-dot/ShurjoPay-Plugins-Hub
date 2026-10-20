import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Store, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { 
  signInWithGoogle, 
  loginWithDemoMerchant, 
  UserProfile,
  setCurrentSessionUser
} from '../services/firebaseAuth';
import { ConceptBrandLogo } from './ConceptBrandLogo';
import { BinanceBrandLogo } from './BinanceBrandLogo';
import { BinanceLoginModal } from './BinanceLoginModal';
import { createDemoBinanceMerchant, saveBinanceAuth, BinanceAuthUser } from '../services/binanceAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isBinanceModalOpen, setIsBinanceModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setSuccessMsg('Google অ্যাকাউন্ট দিয়ে সফলভাবে সাইন ইন হয়েছে!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google সাইন-ইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithDemoMerchant();
      setSuccessMsg('স্যান্ডবক্স টেস্ট মার্চেন্ট হিসেবে প্রবেশ সফল!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setError('ডেমো লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleBinanceSignIn = () => {
    setIsBinanceModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <ConceptBrandLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  মার্চেন্ট অথেনটিকেশন (Firebase)
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                  Cloud DB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ক্লাউড ডাটাবেজ ও ট্রানজ্যাকশন হিস্টোরি সিঙ্ক করতে লগইন করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Real Firebase Google Sign-In button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'অথেনটিকেশন হচ্ছে...' : 'Google দিয়ে সাইন ইন করুন (Firebase Auth)'}</span>
            </button>

            {/* Official Binance Sign-In button */}
            <button
              id="binance-signin-btn"
              type="button"
              onClick={handleBinanceSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#F0B90B] hover:bg-[#FCD535] disabled:opacity-60 text-[#181A20] font-bold text-xs rounded-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer shadow-amber-500/10"
            >
              <BinanceBrandLogo size="xs" />
              <span>{loading ? 'অথেনটিকেশন হচ্ছে...' : 'বাইনান্স দিয়ে সাইন ইন (Binance OAuth / Web3)'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider">অথবা ডেমো ট্রাই করুন</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Quick Demo Merchant */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>১-ক্লিকে টেস্ট মার্চেন্ট লগইন (Sandbox Mode)</span>
            </button>
          </div>

          {/* Secure Firebase footer note */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Firestore Enterprise ডাটাবেজে আপনার রিয়েল-টাইম তথ্য ও সেটিংস এনক্রিপ্টেড থাকে।</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono pl-6">
              Project: gen-lang-client-0768881149
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Binance Login Portal Modal */}
      <BinanceLoginModal
        isOpen={isBinanceModalOpen}
        onClose={() => setIsBinanceModalOpen(false)}
        onSuccess={(bUser: BinanceAuthUser) => {
          setIsBinanceModalOpen(false);
          const userProfile: UserProfile = {
            uid: bUser.uid,
            email: bUser.email,
            displayName: `${bUser.displayName} (Binance)`,
            merchantName: `${bUser.displayName} - Binance Pay`,
            storeId: 88,
            prefix: 'bn',
            createdAt: bUser.connectedAt,
            provider: 'local_persistent',
          };
          setCurrentSessionUser(userProfile);
          onSuccess(userProfile);
          onClose();
        }}
      />
    </div>
  );
};
