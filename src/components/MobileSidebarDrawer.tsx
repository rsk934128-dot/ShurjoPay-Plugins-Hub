import React, { useEffect } from 'react';
import {
  Layers,
  Play,
  BookOpen,
  FileCheck,
  Building2,
  HardDrive,
  Mail,
  Smartphone,
  ShieldCheck,
  X,
  User,
  LogIn,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Key,
  Code2
} from 'lucide-react';
import { UserProfile } from '../services/firebaseAuth';
import { ThemeToggle } from './ThemeToggle';
import { ConceptBrandLogo } from './ConceptBrandLogo';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'plugins' | 'sandbox' | 'docs' | 'kyc' | 'openbanking' | 'workspace' | 'credentials';
  onSelectView: (view: 'plugins' | 'sandbox' | 'docs' | 'kyc' | 'openbanking' | 'workspace' | 'credentials') => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenReceiptModal: () => void;
  onTriggerInstall: () => void;
  pluginsCount: number;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenReceiptModal,
  onTriggerInstall,
  pluginsCount
}) => {
  // Close drawer on ESC key and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (view: 'plugins' | 'sandbox' | 'docs' | 'kyc' | 'openbanking' | 'workspace' | 'credentials') => {
    onSelectView(view);
    onClose();
  };

  const programs = [
    {
      id: 'sandbox' as const,
      title: 'স্যান্ডবক্স সিমুলেটর',
      subtitle: 'bKash, Nagad, Rocket ও কার্ড পেমেন্ট টেস্ট ও কলব্যাক',
      badge: 'লাইভ ডেমো',
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
      icon: Play
    },
    {
      id: 'credentials' as const,
      title: 'মার্চেন্ট কানেক্ট হাব',
      subtitle: 'API কী, .env জেনারেটর, ক্লায়েন্ট আইপি ও ওয়েবহুক চেকার',
      badge: 'API Connect',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Key
    },
    {
      id: 'workspace' as const,
      title: 'জিমেইল & ড্রাইভ ব্যাকআপ',
      subtitle: 'ডিজিটাল ক্যাশ মেমো ইমেইল ও ক্লাউড ব্যাকআপ সিঙ্ক',
      badge: 'Google Agent',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      icon: HardDrive
    },
    {
      id: 'openbanking' as const,
      title: 'ওপেন ব্যাংকিং ও বিনিময়',
      subtitle: 'বাংলাদেশ ব্যাংক বিনিময় IDTP, NPSB ও A2A ট্রান্সফার',
      badge: 'A2A / IDTP',
      badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
      icon: Building2
    },
    {
      id: 'docs' as const,
      title: 'এপিআই গাইড ও রেসপন্স কোড',
      subtitle: 'REST এন্ডপয়েন্ট, রিয়েলটাইম ল্যাটেন্সি ও এরর 1000-1068',
      badge: 'REST v2',
      badgeColor: 'bg-sky-950/80 text-sky-400 border-sky-800/60',
      icon: BookOpen
    },
    {
      id: 'kyc' as const,
      title: 'KYC ও আইনি নথি',
      subtitle: 'ট্রেড লাইসেন্স, TIN, NID ও মার্চেন্ট ভেরিফিকেশন',
      badge: 'অনবোর্ডিং',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      icon: FileCheck
    },
    {
      id: 'plugins' as const,
      title: 'প্ল্যাটফর্ম সাপোর্ট ওভারভিউ',
      subtitle: 'PHP, WordPress, Node.js, Python, Mobile SDK নির্দেশিকা',
      badge: 'Ecosystem',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Layers
    }
  ];

  return (
    <div id="mobile-sidebar-root" className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Dark Backdrop */}
      <div
        id="mobile-sidebar-backdrop"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        id="mobile-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="সকল প্রোগ্রাম ও সাইডবার মেনু"
        className="relative w-full max-w-xs sm:max-w-sm h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ConceptBrandLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-tight">SPay DevHub</h2>
                <span className="text-[9px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                  Concept Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Independent Developer Showcase</p>
            </div>
          </div>

          <button
            id="btn-close-mobile-sidebar"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
            aria-label="সাইডবার বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Profile / Login Banner */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm">
            {currentUser ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-white truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-mono">
                      Store #{currentUser.storeId || 1} (সেশন সক্রিয়)
                    </span>
                  </div>
                </div>
                <button
                  id="mobile-sidebar-profile-btn"
                  onClick={() => {
                    onClose();
                    onOpenProfileModal();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors shrink-0"
                >
                  প্রোফাইল
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">মার্চেন্ট একাউন্ট</span>
                    <span className="block text-[10px] text-slate-400">লগইন করে টেস্ট ডেটা সংরক্ষণ করুন</span>
                  </div>
                </div>
                <button
                  id="mobile-sidebar-login-btn"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>লগইন</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Programs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                সকল প্রোগ্রাম ({programs.length})
              </span>
              <span className="text-[10px] text-slate-500">ট্যাপ করে ওপেন করুন</span>
            </div>

            <div className="space-y-1.5">
              {programs.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`mobile-sidebar-nav-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-950/50 hover:bg-slate-800 text-slate-200 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-900 text-amber-400 border border-slate-800'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full shrink-0 border ${
                            isSelected
                              ? 'bg-slate-950/30 text-slate-950 border-transparent'
                              : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-slate-950 translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Theme Preference */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              অ্যাপ থিম (Light / Dark)
            </span>
            <ThemeToggle id="mobile-sidebar-theme-toggle" variant="sidebar-item" />
          </div>

          {/* Visual Showcase Card in Mobile Sidebar */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300">সূর্যপে গেটওয়ে ইকোসিস্টেম</span>
              <span className="text-[10px] text-amber-400 font-mono">v2.0 Active</span>
            </div>
            <div className="aspect-[16/8] w-full rounded-lg overflow-hidden border border-slate-800/80">
              <img
                src="/images/developer_hub_banner_1789577203623.jpg"
                alt="shurjoPay Gateway Ecosystem"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Section: Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              দ্রুত সার্ভিস ও টুলস
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                id="mobile-sidebar-action-receipt"
                onClick={() => {
                  onClose();
                  onOpenReceiptModal();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block">ক্যাশ মেমো / রসিদ তৈরি</span>
                    <span className="text-[10px] text-slate-400">কাস্টমারকে ডিজিটাল ইনভয়েস পাঠান</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="mobile-sidebar-action-install"
                onClick={() => {
                  onClose();
                  onTriggerInstall();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-xs font-medium text-amber-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block">মোবাইলে অ্যাপ ইনস্টল করুন</span>
                    <span className="text-[10px] text-amber-400/80">হোম স্ক্রিনে সরাসরি যুক্ত করুন (PWA)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 shrink-0 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-mono">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Independent Concept Prototype</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Target Gateway: shurjoPay API v2 (Not affiliated with shurjoMukhi Ltd.)
          </p>
          <p className="text-[10px] text-slate-400">
            shurjoPay Helpline for Merchants: <a href="tel:09612748756" className="text-amber-400 underline font-mono">09612-shurjo (748756)</a>
          </p>
        </div>
      </aside>
    </div>
  );
};
