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
import { getCurrentSessionUser, UserProfile } from './services/firebaseAuth';
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
  HardDrive
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'plugins' | 'sandbox' | 'docs' | 'kyc' | 'openbanking' | 'workspace'>('plugins');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPluginForSnippet, setSelectedPluginForSnippet] = useState<PluginItem | null>(null);

  // Authentication & Saved User Data State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSessionUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // PWA Mobile Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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
            {/* shurjoPay Official App Logo */}
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-amber-500/40 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center transition-transform hover:scale-105">
              <img 
                src="/logo.png" 
                alt="shurjoPay Logo" 
                className="w-full h-full object-cover rounded-[10px]"
                loading="eager"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>shurjoPay</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Plugins Hub V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Merchant SDKs, Modules &amp; RESTful API Gateway</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-1.5">
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
              Plugins &amp; SDKs ({PLUGINS_DATA.length})
            </button>

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
              Sandbox Simulator
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
              API Guide &amp; Codes
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
              <span>KYC ও আইনি নথি</span>
              <span className="hidden xl:inline text-[10px] opacity-80">(TIN, NID...)</span>
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
              className="hidden lg:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 items-center gap-1.5 transition-colors"
              title="Compose payment confirmation receipt"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Send Receipt
            </button>

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
                <span className="hidden sm:inline">লগইন / রেজিস্টার</span>
                <span className="sm:hidden">লগইন</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro banner with logged in personalization */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {currentUser 
                  ? `স্বাগতম, ${currentUser.displayName}! (${currentUser.merchantName || 'মার্চেন্ট হাব'})`
                  : 'Welcome to ShurjoPay Developer Hub'
                }
              </h2>
              {currentUser && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  Firebase Session Active
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              shurjoPay provides complete plugins, modules, and native SDKs across PHP, Laravel, WooCommerce, OpenCart, Android, Flutter, iOS Swift, Node.js, Python, Spring, .NET, and Rust. {currentUser ? 'আপনার টেস্ট ট্রানজ্যাকশন এবং গেটওয়ে ক্রেডেনশিয়াল অ্যাকাউন্টে সংরক্ষিত হচ্ছে।' : 'মার্চেন্ট হিসেবে লগইন করে আপনার টেস্ট ট্রানজ্যাকশন ও ক্রেডেনশিয়াল সেভ রাখুন।'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="flex items-center gap-1 text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PSO Licensed in Bangladesh
              </span>
              <span className="flex items-center gap-1 text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" /> bKash, Nagad, Cards, MFS &amp; Internet Banking
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
        </div>

        {/* View Switcher */}
        {activeView === 'plugins' && (
          <PluginsCatalog
            plugins={PLUGINS_DATA}
            onSelectSnippet={(plugin) => setSelectedPluginForSnippet(plugin)}
          />
        )}

        {activeView === 'sandbox' && <SandboxSimulator />}

        {activeView === 'docs' && <ApiDocumentation />}

        {activeView === 'kyc' && (
          <MerchantKycCompliance onOpenSandbox={() => setActiveView('sandbox')} />
        )}

        {activeView === 'openbanking' && (
          <OpenBankingHub onOpenSandbox={() => setActiveView('sandbox')} />
        )}

        {activeView === 'workspace' && (
          <GoogleWorkspaceAgentHub onOpenSandbox={() => setActiveView('sandbox')} />
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
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 border border-amber-500/30 p-0.5 shrink-0">
              <img src="/logo.png" alt="shurjoPay" className="w-full h-full object-cover rounded-xs" />
            </div>
            <p>© {new Date().getFullYear()} shurjoPay. Haque Tower (10th Floor), Mohakhali C/A, Dhaka-1212, Bangladesh.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইলে ইনস্টল</span>
            </button>
            <a href="https://documenter.getpostman.com/view/6335853/U16dS8ig" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              Postman Docs
            </a>
            <a href="https://shurjopay.com.bd/#contactsshurjoPay" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              Contact Us
            </a>
          </div>
        </div>
      </footer>

      {/* PWA Mobile Installation Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo and App Title */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-500/40 p-1 shadow-xl shadow-amber-500/25 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="shurjoPay Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">shurjoPay Plugins Hub</h3>
                <p className="text-xs text-amber-400 font-medium">মোবাইল অ্যাপ হিসেবে যুক্ত করুন</p>
                <p className="text-xs text-slate-400 mt-1">
                  অ্যাপটি আপনার ফোনের হোম স্ক্রিনে ইনস্টল করে সরাসরি অ্যাপ আইকন থেকে চালু করতে পারেন।
                </p>
              </div>
            </div>

            {/* Direct 1-Click Install Button if supported by browser */}
            {deferredPrompt && (
              <button
                onClick={handleTriggerInstall}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>সরাসরি ডিভাইসে ইনস্টল করুন</span>
              </button>
            )}

            {/* Instructions for Android & iOS */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android (Chrome / Edge):</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                  ব্রাউজারের উপরের ডান কোণায় তিনটি ডট মেনু <strong className="text-slate-300">(⋮)</strong> চাপুন এবং <strong className="text-amber-300">"Install app"</strong> বা <strong className="text-amber-300">"Add to Home screen"</strong> নির্বাচন করুন।
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>iPhone / iPad (Safari):</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                  সাফারি ব্রাউজারের নিচে শেয়ার বাটনে <strong className="text-slate-300">(Share icon)</strong> চাপুন এবং নিচে স্ক্রোল করে <strong className="text-amber-300">"Add to Home Screen"</strong> নির্বাচন করুন।
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors w-full"
              >
                বুঝেছি, বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
