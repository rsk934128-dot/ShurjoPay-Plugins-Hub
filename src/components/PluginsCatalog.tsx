import React, { useState } from 'react';
import { PluginItem } from '../types';
import { Search, ExternalLink, ArrowUpRight, ZoomIn, ShieldCheck, Sparkles, PhoneCall, Globe, CheckCircle2, Play, Key, HardDrive } from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface PluginsCatalogProps {
  plugins: PluginItem[];
  onSelectSnippet?: (plugin: PluginItem) => void;
  onNavigateToView?: (view: 'sandbox' | 'credentials' | 'workspace') => void;
}

export const PluginsCatalog: React.FC<PluginsCatalogProps> = ({ plugins, onSelectSnippet, onNavigateToView }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  const categories = ['All', 'PHP & CMS', 'Mobile Platform', 'Java, JavaScript & Others'];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    const matchesSearch =
      plugin.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="plugins-catalog-section" className="space-y-6">
      {/* Honest Verification Notice & Core Tools Showcase Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                অফিসিয়াল সোর্স পলিসি
              </span>
              <span className="text-xs text-slate-400 font-mono">Official Integration Notice</span>
            </div>
            <h3 className="text-base font-bold text-white">
              প্লাগইন ও এসডিকে প্যাকেজ তথ্যের সত্যতা ও নির্দেশিকা
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              shurjoPay গেটওয়ে বিভিন্ন প্ল্যাটফর্মে (PHP, WordPress, Python, Node.js, Mobile Apps ইত্যাদি) সংযোগ সমর্থন করে। কোনো অনুমাননির্ভর প্যাকেজ বা কাল্পনিক কমান্ড ব্যবহার না করে, সর্বশেষ অফিসিয়াল প্যাকেজ ও সোর্স কোডের জন্য সর্বদা shurjoPay-এর অফিসিয়াল পোর্টাল <strong className="text-amber-400 font-mono">shurjopay.com.bd</strong> অথবা তাদের মার্চেন্ট সাপোর্ট হেল্পলাইনে সরাসরি যোগাযোগ করার পরামর্শ দেওয়া হচ্ছে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://shurjopay.com.bd/#contacts"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>shurjopay.com.bd ভিজিট করুন</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="tel:09612748756"
              className="px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>09612-748756</span>
            </a>
          </div>
        </div>
      </div>

      {/* Showcase of Original Interactive Work */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              এই পোর্টালে আমাদের নিজস্ব তৈরিকৃত ইন্টারঅ্যাক্টিভ ডেভেলপার টুলস
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">নিচে সরাসরি ট্রাই করুন</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => onNavigateToView && onNavigateToView('sandbox')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-amber-400" />
                স্যান্ডবক্স সিমুলেটর
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              bKash, Nagad, Rocket ও কার্ড পেমেন্ট সিমুলেশন এবং তাৎক্ষণিক কলব্যাক ভেরিফিকেশন।
            </p>
          </button>

          <button
            onClick={() => onNavigateToView && onNavigateToView('credentials')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                মার্চেন্ট ক্রেডেনশিয়াল হাব
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              .env কনফিগ জেনারেটর, অটো-ডিটেক্টেড ক্লায়েন্ট আইপি এবং সিকিউর লোকাল স্টোরেজ।
            </p>
          </button>

          <button
            onClick={() => onNavigateToView && onNavigateToView('workspace')}
            className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                জিমেইল &amp; ড্রাইভ অটোমেশন
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              স্বয়ংক্রিয় পেমেন্ট নিশ্চিতকরণ ইমেল প্রেরণ ও ক্লাউড ড্রাইভ রসিদ ব্যাকআপ এজেন্ট।
            </p>
          </button>
        </div>
      </div>

      {/* Architecture Diagram Spotlight Feature */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Architecture Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">End-to-End Payment Flow</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              shurjoPay মাল্টি-প্ল্যাটফর্ম SDK ও গেটওয়ে আর্কিটেকচার
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ওয়েব স্টোর, মোবাইল অ্যাপস এবং বিভিন্ন সিএমএস থেকে গ্রাহকের পেমেন্ট রিকোয়েস্ট কিভাবে নিরাপদে shurjoPay REST ইঞ্জিন, ব্যাংক নেটওয়ার্ক এবং MFS গেটওয়ের মাধ্যমে সম্পন্ন হয় তার প্রযুক্তিগত আর্কিটেকচার ব্লুপ্রিন্ট।
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <button
                onClick={() => setIsArchModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>ডায়াগ্রাম পূর্ণাকারে দেখুন (Full HD)</span>
              </button>
              <span className="text-[11px] text-slate-400">
                • এন্ড-টু-এন্ড ট্রানজেকশন প্রসেসিং ফ্রেমওয়ার্ক
              </span>
            </div>
          </div>

          {/* Picture Thumbnail with Zoom Overlay */}
          <div 
            onClick={() => setIsArchModalOpen(true)}
            className="w-full lg:w-80 h-44 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 relative group cursor-pointer shrink-0 shadow-md transition-all hover:border-amber-500/60"
            title="পূর্ণ রেজুলিউশনে ডায়াগ্রাম দেখতে ক্লিক করুন"
          >
            <img
              src="/images/plugins_architecture_diagram_1789577234202.jpg"
              alt="shurjoPay Architecture Diagram"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-between p-2.5">
              <span className="text-[10px] font-semibold text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60 flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-amber-400" /> ক্লিক করে দেখুন
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                SDK Architecture
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="plugins-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platforms, frameworks, capabilities..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Level Platform Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            id={`plugin-card-${plugin.id}`}
            className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 mb-1.5 border border-slate-700/60">
                    {plugin.language}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {plugin.framework}
                  </h3>
                </div>
                <div>
                  {plugin.badgeType === 'community-concept' ? (
                    <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Demo Suite
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Platform Support
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {plugin.description}
              </p>

              {plugin.sourceNote && (
                <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 mb-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="leading-snug">{plugin.sourceNote}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-400">
                {plugin.packageName}
              </span>

              {plugin.id === 'interactive-concept-hub' ? (
                <button
                  onClick={() => onNavigateToView && onNavigateToView('sandbox')}
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1 hover:bg-amber-400 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  সিমুলেটর খুলুন
                </button>
              ) : (
                <a
                  href="https://shurjopay.com.bd/#contacts"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] font-medium"
                >
                  <span>অফিসিয়াল তথ্য</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          <p className="text-sm">কোনো প্ল্যাটফর্ম বা ফ্রেমওয়ার্ক ফিল্টারের সাথে মিলেনি।</p>
        </div>
      )}

      {/* Architecture Diagram Lightbox */}
      <ImageLightboxModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
        imageSrc="/images/plugins_architecture_diagram_1789577234202.jpg"
        title="shurjoPay Multi-Platform SDK & Gateway Architecture"
        description="কমপ্লিট আর্কিটেকচার ডায়াগ্রাম: মার্চেন্ট ব্যাকএন্ড, সিক্রেট-পে এপিআই, পিএসও গেটওয়ে ইঞ্জিন, ওটিপি ভেরিফিকেশন এবং আইপিএন কলব্যাক।"
        badge="Architecture Diagram"
      />
    </div>
  );
};
