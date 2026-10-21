import React, { useState, useEffect } from 'react';
import { PLUGINS_DATA } from './data';
import { PluginsCatalog } from './components/PluginsCatalog';
import { SandboxSimulator } from './components/SandboxSimulator';
import { ApiDocumentation } from './components/ApiDocumentation';
import { MerchantKycCompliance } from './components/MerchantKycCompliance';
import { OpenBankingHub } from './components/OpenBankingHub';
import { GoogleWorkspaceAgentHub } from './components/GoogleWorkspaceAgentHub';
import { GmailReceiptModal } from './components/GmailReceiptModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MobileSidebarDrawer } from './components/MobileSidebarDrawer';
import { MerchantCredentialsConnectHub } from './components/MerchantCredentialsConnectHub';
import { ThemeToggle } from './components/ThemeToggle';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ConceptBrandLogo } from './components/ConceptBrandLogo';
import { BinanceBrandLogo } from './components/BinanceBrandLogo';
import { BinanceAuthHub } from './components/BinanceAuthHub';
import { BinanceLoginModal } from './components/BinanceLoginModal';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './context/ToastContext';
import { getCurrentSessionUser, UserProfile } from './services/firebaseAuth';
import { getStoredBinanceAuth, BinanceAuthUser } from './services/binanceAuth';
import { PluginItem } from './types';
import { 
  CreditCard, 
  Layers, 
  Play, 
  BookOpen, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Smartphone, 
  Code2, 
  CheckCircle2,
  PhoneCall,
  User,
  LogIn,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  PlusSquare,
  X,
  FileCheck,
  Building2,
  HardDrive,
  Menu,
  Key,
  ZoomIn,
  Copy,
  Check
} from 'lucide-react';

export default function App() {
  const { success, info } = useToast();
  const [activeView, setActiveView] = useState<'sandbox' | 'credentials' | 'binance' | 'workspace' | 'openbanking' | 'docs' | 'kyc' | 'plugins'>('sandbox');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPluginForSnippet, setSelectedPluginForSnippet] = useState<PluginItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication & Saved User Data State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSessionUser());
  const [binanceUser, setBinanceUser] = useState<BinanceAuthUser | null>(() => getStoredBinanceAuth());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBinanceLoginModalOpen, setIsBinanceLoginModalOpen] = useState(false);

  // PWA Mobile Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<'pwa' | 'apk'>('pwa');
  const [copiedCapCmd, setCopiedCapCmd] = useState(false);

  // Picture Preview Lightbox Modal State
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    src: string;
    title: string;
    desc?: string;
    badge?: string;
  } | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setIsInstallModalOpen(true);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Independent Developer Concept Logo */}
            <ConceptBrandLogo size="lg" showBadge />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>SPay DevHub</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Independent Concept / Demo
                </span>
              </div>
              <p className="text-xs text-slate-400">Proposed Developer Portal &amp; Tooling for shurjoPay Gateway</p>
            </div>
          </div>

          {/* Desktop Navigation tabs (hidden on mobile/tablet) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              id="nav-btn-sandbox"
              onClick={() => setActiveView('sandbox')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'sandbox'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>স্যান্ডবক্স সিমুলেটর</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold bg-slate-950/20 text-slate-950">
                Live
              </span>
            </button>

            <button
              id="nav-btn-credentials"
              onClick={() => setActiveView('credentials')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'credentials'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>মার্চেন্ট কানেক্ট হাব</span>
            </button>

            <button
              id="nav-btn-binance"
              onClick={() => setActiveView('binance')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === 'binance'
                  ? 'bg-[#F0B90B] text-[#181A20] shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BinanceBrandLogo size="xs" />
              <span>বাইনান্স অথ</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold ${
                activeView === 'binance' ? 'bg-[#181A20]/20 text-[#181A20]' : 'bg-amber-500/20 text-amber-300'
              }`}>
                Crypto
              </span>
            </button>

            <button
              id="nav-btn-workspace"
              onClick={() => setActiveView('workspace')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'workspace'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HardDrive className={`w-3.5 h-3.5 ${activeView === 'workspace' ? 'text-white' : 'text-sky-400'}`} />
              <span>জিমেইল &amp; ড্রাইভ ব্যাকআপ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold bg-sky-950/40 text-sky-200">
                Agent
              </span>
            </button>

            <button
              id="nav-btn-openbanking"
              onClick={() => setActiveView('openbanking')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'openbanking'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-950" />
              <span className={activeView === 'openbanking' ? 'text-slate-950' : 'text-slate-200'}>
                ওপেন ব্যাংকিং
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold bg-slate-950/20 text-slate-950">
                A2A
              </span>
            </button>

            <button
              id="nav-btn-docs"
              onClick={() => setActiveView('docs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'docs'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>এপিআই গাইড &amp; কোডস</span>
            </button>

            <button
              id="nav-btn-kyc"
              onClick={() => setActiveView('kyc')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'kyc'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>KYC অনবোর্ডিং</span>
            </button>

            <button
              id="nav-btn-plugins"
              onClick={() => setActiveView('plugins')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeView === 'plugins'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>প্ল্যাটফর্ম সাপোর্ট</span>
            </button>

            {/* Mobile / PWA App Install Button */}
            <button
              id="header-install-app-btn"
              onClick={handleTriggerInstall}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              title="স্মার্টফোনে বা কম্পিউটারে অ্যাপটি ইনস্টল করুন"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
              <span className="sm:hidden">ইনস্টল</span>
            </button>

            <button
              id="header-receipt-btn"
              onClick={() => setIsReceiptModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 items-center gap-1.5 transition-colors"
              title="Compose payment confirmation receipt"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Send Receipt
            </button>

            {/* Quick Binance Auth Connection Chip */}
            <button
              id="header-binance-quick-btn"
              onClick={() => {
                if (binanceUser) {
                  setActiveView('binance');
                } else {
                  setIsBinanceLoginModalOpen(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                binanceUser
                  ? 'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/40 hover:bg-[#F0B90B]/25'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:border-[#F0B90B]/50 hover:text-white'
              }`}
              title={binanceUser ? `বাইনান্স অ্যাক্টিভ (${binanceUser.displayName}) - ভিউ করুন` : 'বাইনান্স দিয়ে সাইন ইন / কানেক্ট করুন'}
            >
              <BinanceBrandLogo size="xs" />
              <span className="hidden xl:inline">
                {binanceUser ? 'Binance Connected' : 'Binance Login'}
              </span>
              {binanceUser ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono hidden xl:inline">
                  SSO
                </span>
              )}
            </button>

            {/* Global Theme Toggle (Desktop) */}
            <ThemeToggle id="header-desktop-theme-toggle" />

            {/* Firebase Auth Account Button */}
            {currentUser ? (
              <button
                id="header-user-account-btn"
                onClick={() => setIsProfileModalOpen(true)}
                className="ml-1 sm:ml-2 pl-2 pr-3 py-1 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 rounded-lg text-xs flex items-center gap-2 transition-all shadow-sm group"
                title="Manage profile, saved credentials and transactions"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-[11px] leading-tight text-white font-semibold truncate max-w-[110px]">
                    {currentUser.displayName}
                  </span>
                  <span className="block text-[9px] leading-tight text-amber-400 font-mono">
                    Store #{currentUser.storeId || 1}
                  </span>
                </div>
              </button>
            ) : (
              <button
                id="header-auth-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="ml-1 sm:ml-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                title="Firebase Auth ইউজার রেজিস্ট্রেশন / লগইন"
              >
                <span className="text-xs">🔥</span>
                <span>লগইন / রেজিস্টার</span>
              </button>
            )}
          </nav>

          {/* Mobile Right Controls: Theme, Install, Profile & Sidebar */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Global Theme Toggle (Mobile) */}
            <ThemeToggle id="header-mobile-theme-toggle" variant="mobile-header" />

            {/* Quick Install Icon */}
            <button
              id="header-mobile-install-btn"
              onClick={handleTriggerInstall}
              className="p-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors shrink-0"
              title="স্মার্টফোনে অ্যাপ ইনস্টল করুন"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Quick Binance Mobile Icon */}
            <button
              id="header-mobile-binance-btn"
              onClick={() => {
                if (binanceUser) {
                  setActiveView('binance');
                } else {
                  setIsBinanceLoginModalOpen(true);
                }
              }}
              className={`p-2 rounded-xl border transition-colors shrink-0 flex items-center justify-center ${
                binanceUser
                  ? 'bg-[#F0B90B]/20 border-[#F0B90B]/50 text-[#F0B90B]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-[#F0B90B]/40'
              }`}
              title={binanceUser ? 'বাইনান্স হাব দেখুন' : 'বাইনান্স কানেক্ট করুন'}
            >
              <BinanceBrandLogo size="xs" />
            </button>

            {/* Quick User Button */}
            {currentUser ? (
              <button
                id="header-mobile-user-btn"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                title="প্রোফাইল সেটিংস"
              >
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
              </button>
            ) : (
              <button
                id="header-mobile-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 shrink-0 transition-all"
                title="মার্চেন্ট লগইন"
              >
                <span>🔥</span>
                <span>লগইন</span>
              </button>
            )}

            {/* Primary Mobile Sidebar Toggle Button */}
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              aria-label="মোবাইল সাইডবার বাটন - সকল প্রোগ্রাম দেখুন"
              title="সকল প্রোগ্রাম ও সার্ভিস মেনু"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-100">সকল প্রোগ্রাম</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 space-y-8">
        {/* Intro banner with logged in personalization and Developer Hub Visual Feature */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Left Column: Context & Actions */}
            <div className="lg:col-span-8 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUser 
                    ? `স্বাগতম, ${currentUser.displayName}! (${currentUser.merchantName || 'প্রপোজাল ডেমো'})`
                    : 'SPay DevHub — Developer Experience Concept'
                  }
                </h2>
                {currentUser && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    Firebase Session Active
                  </span>
                )}
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Independent Concept Demo
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  v2.0 Proposal Prototype
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                এটি একজন স্বতন্ত্র ডেভেলপার (Independent Developer) দ্বারা তৈরিকৃত আধুনিক ডেভেলপার হাব ও ইন্টারেক্টিভ স্যান্ডবক্স কনসেপ্ট ডেমো — যা shurjoPay-এর মার্চেন্ট ও ইঞ্জিনিয়ারিং টিমের জন্য একটি প্রস্তাবিত সহযোগিতা হিসেবে প্রস্তুত করা হয়েছে। (Not an official shurjoMukhi Ltd. entity, but a proposed community showcase).
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" /> Independent Developer Concept
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Target: shurjoPay API v2
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> bKash, Nagad, Cards &amp; NPSB
                </span>
                {currentUser ? (
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 ml-auto font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> সংরক্ষিত তথ্য দেখুন
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 ml-auto font-medium"
                  >
                    🔥 Firebase লগইন করুন <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Developer Hub Visual Picture Card */}
            <div className="lg:col-span-4">
              <div
                onClick={() => setActiveLightboxImage({
                  src: '/images/developer_hub_banner_1789577203623.jpg',
                  title: 'SPay DevHub — Developer Experience Concept',
                  desc: 'মার্চেন্ট SDKs, ইন্টিগ্রেশন মডিউল, রেস্টফুল গেটওয়ে এবং আর্কিটেকচার ব্লুপ্রিন্ট প্রিভিউ।',
                  badge: 'Concept Prototype V2.0'
                })}
                className="group relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 cursor-pointer shadow-md hover:border-amber-500/60 hover:shadow-amber-500/10 transition-all"
                title="পূর্ণ রেজুলিউশনে দেখতে ক্লিক করুন"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src="/images/developer_hub_banner_1789577203623.jpg"
                    alt="shurjoPay Developer Hub Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" /> বড় করে দেখুন (HD)
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                      Gateway Hub
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        {activeView === 'plugins' && (
          <PluginsCatalog
            plugins={PLUGINS_DATA}
            onSelectSnippet={(plugin) => setSelectedPluginForSnippet(plugin)}
            onNavigateToView={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'credentials' && (
          <MerchantCredentialsConnectHub
            onNavigateToSimulator={() => setActiveView('sandbox')}
            onNavigateToDocs={() => setActiveView('docs')}
            onNavigateToBinance={() => setActiveView('binance')}
            onSaveCredentials={(mode) => {
              // Confirmation hook
            }}
          />
        )}

        {activeView === 'binance' && (
          <BinanceAuthHub
            onOpenSandbox={() => setActiveView('sandbox')}
            onOpenDocs={() => setActiveView('docs')}
            onAuthChange={(user) => {
              setBinanceUser(user);
              setCurrentUser(getCurrentSessionUser());
            }}
          />
        )}

        {activeView === 'sandbox' && (
          <SandboxSimulator onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        )}

        {activeView === 'docs' && (
          <ApiDocumentation onNavigateToSimulator={() => setActiveView('sandbox')} />
        )}

        {activeView === 'kyc' && (
          <MerchantKycCompliance
            onOpenSandbox={() => setActiveView('sandbox')}
            onKycSubmitted={() => {
              // KYC submission hook
            }}
          />
        )}

        {activeView === 'openbanking' && (
          <OpenBankingHub onOpenSandbox={() => setActiveView('sandbox')} />
        )}

        {activeView === 'workspace' && (
          <GoogleWorkspaceAgentHub
            onOpenSandbox={() => setActiveView('sandbox')}
            onBackupSuccess={(fileName, type) => {
              // Backup success hook
            }}
          />
        )}

        {/* Code Snippet Drawer/Modal if clicked */}
        {selectedPluginForSnippet && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-slate-100">
                  {selectedPluginForSnippet.framework} Integration Quickstart
                </h3>
                <button
                  onClick={() => setSelectedPluginForSnippet(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400">{selectedPluginForSnippet.description}</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Installation:</label>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-amber-300 overflow-x-auto">
                    {selectedPluginForSnippet.installCommand || 'Available on repository'}
                  </pre>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repository:</label>
                  <code className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 block">
                    {selectedPluginForSnippet.repository}
                  </code>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedPluginForSnippet(null)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ConceptBrandLogo size="sm" />
            <div>
              <p className="text-slate-300 font-medium">
                Proposed Developer Hub Concept for shurjoPay <span className="text-amber-400 font-normal">(Unofficial Demo / Proposal)</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                স্বতন্ত্র ডেভেলপার দ্বারা তৈরিকৃত ইন্টারঅ্যাক্টিভ কনসেপ্ট প্রজেক্ট। All official trademarks, logos, and licenses belong to shurjoMukhi Limited.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইলে ইনস্টল</span>
            </button>
            <a href="https://documenter.getpostman.com/view/6335853/U16dS8ig" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200">
              shurjoPay Postman Docs (Reference)
            </a>
            <a href="https://shurjopay.com.bd/#contacts" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200">
              shurjoPay Portal (shurjopay.com.bd)
            </a>
          </div>
        </div>
      </footer>

      {/* PWA Mobile Installation & Android APK Build Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo and App Title */}
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <ConceptBrandLogo size="lg" showBadge />
              <div>
                <h3 className="text-base font-bold text-white">SPay DevHub — মোবাইল ও অ্যান্ড্রয়েড অ্যাপ</h3>
                <p className="text-xs text-amber-400 font-medium">ইনস্টল ও গিটহাব থেকে APK তৈরির উপায়</p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 rounded-xl gap-1 text-xs">
              <button
                type="button"
                onClick={() => setInstallModalTab('pwa')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  installModalTab === 'pwa'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ব্রাউজারে ইনস্টল (PWA)</span>
              </button>

              <button
                type="button"
                onClick={() => setInstallModalTab('apk')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  installModalTab === 'apk'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>GitHub থেকে APK বিল্ড</span>
              </button>
            </div>

            {/* TAB 1: PWA Quick Install */}
            {installModalTab === 'pwa' && (
              <div className="space-y-4">
                {/* Direct 1-Click Install Button if supported by browser */}
                {deferredPrompt && (
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>সরাসরি ডিভাইসে ইনস্টল করুন</span>
                  </button>
                )}

                {/* Instructions for Android & iOS */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Android (Chrome / Edge):</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                      ব্রাউজারের উপরের ডান কোণায় তিনটি ডট মেনু <strong className="text-slate-300">(⋮)</strong> চাপুন এবং <strong className="text-amber-300">"Install app"</strong> বা <strong className="text-amber-300">"Add to Home screen"</strong> নির্বাচন করুন।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>iPhone / iPad (Safari):</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                      সাফারি ব্রাউজারের নিচে শেয়ার বাটনে <strong className="text-slate-300">(Share icon)</strong> চাপুন এবং নিচে স্ক্রোল করে <strong className="text-amber-300">"Add to Home Screen"</strong> নির্বাচন করুন।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Android APK & GitHub Actions */}
            {installModalTab === 'apk' && (
              <div className="space-y-3.5 text-xs">
                {/* Method 1: GitHub Actions Cloud APK */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>পদ্ধতি ১: GitHub Actions অটোমেটিক APK</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                      No PC Setup Required
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    আপনার রিপোজিটরিতে <strong><code className="text-amber-300 font-mono">.github/workflows/android-apk.yml</code></strong> ফাইল তৈরি করা হয়েছে।
                    গিটহাবে কোড পুশ করে <strong>Actions</strong> ট্যাবে গেলেই রেডিমেড <strong>.apk</strong> ডাউনলোড করতে পারবেন!
                  </p>
                </div>

                {/* Method 2: Local Capacitor Commands */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      পদ্ধতি ২: পিসিতে Android Studio ও Capacitor
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('npm install @capacitor/core @capacitor/cli @capacitor/android && npm run build && npx cap add android && npx cap sync android && npx cap open android');
                        setCopiedCapCmd(true);
                        setTimeout(() => setCopiedCapCmd(false), 2000);
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      {copiedCapCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCapCmd ? 'কপি হয়েছে!' : 'কমান্ড কপি'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto">
                    npm run build &amp;&amp; npx cap add android &amp;&amp; npx cap open android
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Android Studio ওপেন হলে <strong>Build &gt; Build APK(s)</strong> চাপলেই ফোন টেস্টের জন্য APK তৈরি হবে।
                  </p>
                </div>

                {/* Method 3: PWABuilder Store Release */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block text-[11px]">পদ্ধতি ৩: PWABuilder (Google Play Store AAB)</span>
                    <span className="text-slate-400 text-[10px]">Play Store-এ আপলোড করার জন্য সরাসরি .aab প্যাকেজ বানান</span>
                  </div>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>PWABuilder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors w-full cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar for rapid switching */}
      <nav
        id="mobile-bottom-navigation-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl"
      >
        <button
          id="mobile-bottom-tab-plugins"
          onClick={() => {
            setActiveView('plugins');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeView === 'plugins' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>প্লাগিন</span>
        </button>

        <button
          id="mobile-bottom-tab-sandbox"
          onClick={() => {
            setActiveView('sandbox');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeView === 'sandbox' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>স্যান্ডবক্স</span>
        </button>

        <button
          id="mobile-bottom-tab-docs"
          onClick={() => {
            setActiveView('docs');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeView === 'docs' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>এপিআই</span>
        </button>

        <button
          id="mobile-bottom-tab-sidebar"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-amber-400 active:scale-95 transition-transform"
          aria-label="সকল প্রোগ্রাম ও সাইডবার মেনু দেখুন"
        >
          <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-xs">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-amber-300">সব প্রোগ্রাম</span>
        </button>
      </nav>

      {/* Mobile Full Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenReceiptModal={() => setIsReceiptModalOpen(true)}
        onTriggerInstall={handleTriggerInstall}
        pluginsCount={PLUGINS_DATA.length}
      />

      {/* Gmail receipt modal */}
      <GmailReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Firebase Auth Registration & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Global Binance Dedicated Login & Connection Modal */}
      <BinanceLoginModal
        isOpen={isBinanceLoginModalOpen}
        onClose={() => setIsBinanceLoginModalOpen(false)}
        onSuccess={(bUser) => {
          setBinanceUser(bUser);
          setCurrentUser(getCurrentSessionUser());
        }}
      />

      {/* User Profile & Saved Data Manager Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
          }}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
          }}
        />
      )}

      {/* Picture Lightbox Preview Modal */}
      {activeLightboxImage && (
        <ImageLightboxModal
          isOpen={!!activeLightboxImage}
          onClose={() => setActiveLightboxImage(null)}
          imageSrc={activeLightboxImage.src}
          title={activeLightboxImage.title}
          description={activeLightboxImage.desc}
          badge={activeLightboxImage.badge}
        />
      )}

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}
