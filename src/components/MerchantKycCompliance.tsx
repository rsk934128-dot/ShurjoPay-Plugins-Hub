import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Building2, 
  CreditCard, 
  Globe, 
  Calendar, 
  Save, 
  RefreshCw, 
  Eye, 
  Check, 
  ExternalLink,
  Download,
  FileCheck
} from 'lucide-react';
import { 
  MerchantKycData, 
  DEFAULT_KYC_DATA, 
  getUserKycData, 
  saveUserKycData 
} from '../services/userData';
import { getCurrentSessionUser } from '../services/firebaseAuth';

interface MerchantKycComplianceProps {
  onOpenSandbox?: () => void;
}

export const MerchantKycCompliance: React.FC<MerchantKycComplianceProps> = ({ onOpenSandbox }) => {
  const currentUser = getCurrentSessionUser();
  const uid = currentUser?.uid || 'guest_merchant';

  const [kycData, setKycData] = useState<MerchantKycData>(() => getUserKycData(uid));
  const [activeDocPreview, setActiveDocPreview] = useState<'tin' | 'trade' | 'nid' | 'passport' | null>('tin');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const calculateCompletion = () => {
    let count = 0;
    if (kycData.tinNumber && kycData.tinStatus === 'verified') count++;
    if (kycData.tradeLicenseNumber && kycData.tradeLicenseStatus === 'verified') count++;
    if (kycData.nidNumber && kycData.nidStatus === 'verified') count++;
    if (kycData.passportNumber && kycData.passportStatus === 'verified') count++;
    return {
      count,
      total: 4,
      percentage: Math.round((count / 4) * 100)
    };
  };

  const completion = calculateCompletion();

  const handleFieldChange = <K extends keyof MerchantKycData>(field: K, value: MerchantKycData[K]) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      saveUserKycData(uid, kycData);
      setIsVerifying(false);
      setSaveFeedback('কেওয়াইসি ও ব্যবসায়িক নথিসমূহ সফলভাবে সংরক্ষিত ও সিস্টেম দ্বারা যাচাই করা হয়েছে!');
      setTimeout(() => setSaveFeedback(null), 3500);
    }, 600);
  };

  const handleSimulateFileSelect = (docType: 'tin' | 'trade' | 'nid' | 'passport') => {
    const fakeNames = {
      tin: 'e_tin_certificate_verified.pdf',
      trade: 'trade_license_renewed_2026.pdf',
      nid: 'smart_card_front_back_scan.pdf',
      passport: 'bangladesh_epassport_bio_page.pdf'
    };

    if (docType === 'tin') {
      handleFieldChange('tinDocumentName', fakeNames.tin);
      handleFieldChange('tinStatus', 'verified');
    } else if (docType === 'trade') {
      handleFieldChange('tradeLicenseDocumentName', fakeNames.trade);
      handleFieldChange('tradeLicenseStatus', 'verified');
    } else if (docType === 'nid') {
      handleFieldChange('nidDocumentName', fakeNames.nid);
      handleFieldChange('nidStatus', 'verified');
    } else if (docType === 'passport') {
      handleFieldChange('passportDocumentName', fakeNames.passport);
      handleFieldChange('passportStatus', 'verified');
    }

    setSaveFeedback(`${docType.toUpperCase()} ফাইল আপলোড এবং প্রিভিউ সফলভাবে প্রস্তুত করা হয়েছে!`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                বাংলাদেশ ব্যাংক PSO রেগুলেশন কমপ্লায়েন্স
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                Live Gateway Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>মার্চেন্ট KYC ও আইনি নথি ভেরিফিকেশন</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              shurjoPay গেটওয়েতে লাইভ পেমেন্ট চালু করতে বাংলাদেশ ব্যাংকের গাইডলাইন অনুযায়ী প্রতিটি মার্চেন্টের ই-টিআইএন (TIN), ট্রেড লাইসেন্স, জাতীয় পরিচয়পত্র (NID) এবং পাসপোর্টের সঠিক তথ্য যাচাই করা আবশ্যক।
            </p>
          </div>

          {/* Verification Progress Badge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 w-full md:w-64 shrink-0 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">যাচাইকরণের অগ্রগতি</span>
              <span className="font-bold text-amber-400">{completion.percentage}% সম্পন্ন</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>নথি জমা: <strong className="text-slate-200">{completion.count} / {completion.total}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {completion.count === 4 ? 'অনুমোদিত' : 'প্রক্রিয়াধীন'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save feedback toast */}
      {saveFeedback && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium text-sm">{saveFeedback}</span>
          </div>
          <button 
            onClick={() => setSaveFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-1 rounded hover:bg-emerald-500/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 4 Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. e-TIN (Taxpayer Identification Number) Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">১. ই-টিআইএন (e-TIN) সনদ</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> NBR ভেরিফাইড
                  </span>
                </div>
                <p className="text-xs text-slate-400">জাতীয় রাজস্ব বোর্ড (NBR) ট্যাক্সপেয়ার আইডেন্টিফিকেশন নম্বর</p>
              </div>
            </div>

            <button
              onClick={() => setActiveDocPreview(activeDocPreview === 'tin' ? null : 'tin')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeDocPreview === 'tin' ? 'প্রিভিউ বন্ধ' : 'প্রিভিউ দেখুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">১২ ডিজিট ই-টিআইএন নম্বর</label>
              <input
                type="text"
                maxLength={12}
                value={kycData.tinNumber}
                onChange={(e) => handleFieldChange('tinNumber', e.target.value)}
                placeholder="যেমন: 584930192847"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">করদাতার নাম / প্রতিষ্ঠানের নাম</label>
              <input
                type="text"
                value={kycData.tinOwnerName}
                onChange={(e) => handleFieldChange('tinOwnerName', e.target.value)}
                placeholder="করদাতার নাম"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">কর অঞ্চল (Taxes Zone)</label>
              <input
                type="text"
                value={kycData.tinTaxZone}
                onChange={(e) => handleFieldChange('tinTaxZone', e.target.value)}
                placeholder="যেমন: Zone-08 (Dhaka)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ট্যাক্স সার্কেল (Circle)</label>
              <input
                type="text"
                value={kycData.tinTaxCircle}
                onChange={(e) => handleFieldChange('tinTaxCircle', e.target.value)}
                placeholder="যেমন: Circle-165"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Document Upload Simulator */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-mono truncate">{kycData.tinDocumentName || 'কোনো ফাইল আপলোড নেই'}</span>
            </div>
            <button
              onClick={() => handleSimulateFileSelect('tin')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <UploadCloud className="w-3 h-3 text-amber-400" />
              নতুন ফাইল দিন
            </button>
          </div>

          {/* Visual Certificate Mockup */}
          {activeDocPreview === 'tin' && (
            <div className="p-4 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 border border-amber-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span className="font-bold text-amber-300 uppercase tracking-wide text-[10px]">
                  Government of the People's Republic of Bangladesh • National Board of Revenue
                </span>
                <span className="font-mono text-emerald-400 font-semibold">TIN Certificate</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">TIN Number:</span>
                  <strong className="font-mono text-amber-400 tracking-wider">{kycData.tinNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assessee Name:</span>
                  <strong className="text-slate-200">{kycData.tinOwnerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Taxes Zone:</span>
                  <span className="text-slate-300">{kycData.tinTaxZone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Circle:</span>
                  <span className="text-slate-300">{kycData.tinTaxCircle}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Trade License Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">২. ট্রেড লাইসেন্স (Trade License)</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> সক্রিয় ও বৈধ (Valid)
                  </span>
                </div>
                <p className="text-xs text-slate-400">সিটি কর্পোরেশন / পৌরসভা অনুমোদিত ব্যবসার বৈধ লাইসেন্স</p>
              </div>
            </div>

            <button
              onClick={() => setActiveDocPreview(activeDocPreview === 'trade' ? null : 'trade')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeDocPreview === 'trade' ? 'প্রিভিউ বন্ধ' : 'প্রিভিউ দেখুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ট্রেড লাইসেন্স নম্বর</label>
              <input
                type="text"
                value={kycData.tradeLicenseNumber}
                onChange={(e) => handleFieldChange('tradeLicenseNumber', e.target.value)}
                placeholder="যেমন: TRAD/DNCC/049281/2024"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ইস্যুকারী কর্তৃপক্ষ</label>
              <input
                type="text"
                value={kycData.tradeLicenseAuthority}
                onChange={(e) => handleFieldChange('tradeLicenseAuthority', e.target.value)}
                placeholder="যেমন: ঢাকা উত্তর সিটি কর্পোরেশন"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ব্যবসার ধরন / ক্যাটাগরি</label>
              <input
                type="text"
                value={kycData.tradeLicenseCategory}
                onChange={(e) => handleFieldChange('tradeLicenseCategory', e.target.value)}
                placeholder="যেমন: সফটওয়্যার ও ই-কমার্স"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">নবায়নের মেয়াদ (Valid Until)</label>
              <input
                type="date"
                value={kycData.tradeLicenseExpiryDate}
                onChange={(e) => handleFieldChange('tradeLicenseExpiryDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Document Upload Simulator */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-slate-300 font-mono truncate">{kycData.tradeLicenseDocumentName || 'কোনো ফাইল আপলোড নেই'}</span>
            </div>
            <button
              onClick={() => handleSimulateFileSelect('trade')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <UploadCloud className="w-3 h-3 text-amber-400" />
              নতুন ফাইল দিন
            </button>
          </div>

          {/* Trade License Visual Mockup */}
          {activeDocPreview === 'trade' && (
            <div className="p-4 bg-gradient-to-br from-blue-950/20 via-slate-950 to-slate-950 border border-blue-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                <span className="font-bold text-blue-300 text-[10px]">
                  {kycData.tradeLicenseAuthority} • ট্রেড লাইসেন্স নিবন্ধন
                </span>
                <span className="font-mono text-emerald-400 text-[11px] font-semibold">Verified Active</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">লাইসেন্স নম্বর:</span>
                  <strong className="font-mono text-blue-300">{kycData.tradeLicenseNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ব্যবসার ধরন:</span>
                  <span className="text-slate-200">{kycData.tradeLicenseCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ইস্যু তারিখ:</span>
                  <span className="text-slate-300">{kycData.tradeLicenseIssueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">মেয়াদের শেষ দিন:</span>
                  <strong className="text-emerald-400 font-mono">{kycData.tradeLicenseExpiryDate}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. National ID (NID) Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">৩. জাতীয় পরিচয়পত্র (National ID / NID)</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> স্মার্ট কার্ড ভেরিফাইড
                  </span>
                </div>
                <p className="text-xs text-slate-400">বাংলাদেশ নির্বাচন কমিশন অনুমোদিত স্মার্ট জাতীয় পরিচয়পত্র</p>
              </div>
            </div>

            <button
              onClick={() => setActiveDocPreview(activeDocPreview === 'nid' ? null : 'nid')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeDocPreview === 'nid' ? 'প্রিভিউ বন্ধ' : 'প্রিভিউ দেখুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">১০/১৭ ডিজিট এনআইডি নম্বর</label>
              <input
                type="text"
                value={kycData.nidNumber}
                onChange={(e) => handleFieldChange('nidNumber', e.target.value)}
                placeholder="যেমন: 6492019385"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">নাম (ইংরেজিতে - NID অনুযায়ী)</label>
              <input
                type="text"
                value={kycData.nidNameEn}
                onChange={(e) => handleFieldChange('nidNameEn', e.target.value)}
                placeholder="SHEIKH FARID"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">নাম (বাংলায়)</label>
              <input
                type="text"
                value={kycData.nidNameBn}
                onChange={(e) => handleFieldChange('nidNameBn', e.target.value)}
                placeholder="শেখ ফরিদ"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">জন্ম তারিখ (Date of Birth)</label>
              <input
                type="date"
                value={kycData.nidDob}
                onChange={(e) => handleFieldChange('nidDob', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Document Upload Simulator */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-mono truncate">{kycData.nidDocumentName || 'কোনো ফাইল আপলোড নেই'}</span>
            </div>
            <button
              onClick={() => handleSimulateFileSelect('nid')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <UploadCloud className="w-3 h-3 text-amber-400" />
              নতুন ফাইল দিন
            </button>
          </div>

          {/* NID Smart Card Mockup */}
          {activeDocPreview === 'nid' && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-slate-950 to-slate-900 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="font-bold text-emerald-300 text-[10px]">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • জাতীয় পরিচয়পত্র (Smart NID Card)
                </span>
                <span className="font-mono text-emerald-400 font-semibold">EC Verified</span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-14 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl text-slate-400 shrink-0">
                  👤
                </div>
                <div className="space-y-1 text-[11px] flex-1">
                  <div className="text-slate-300 font-bold">{kycData.nidNameBn}</div>
                  <div className="text-slate-400 font-mono text-[10px] uppercase">{kycData.nidNameEn}</div>
                  <div className="text-slate-400 text-[10px]">জন্ম তারিখ: <span className="font-mono text-slate-200">{kycData.nidDob}</span></div>
                  <div className="pt-1 text-[10px]">
                    <span className="text-slate-500">NID NO: </span>
                    <strong className="font-mono text-emerald-400 text-xs tracking-wider">{kycData.nidNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Passport Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">৪. আন্তর্জাতিক পাসপোর্ট (Passport)</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> ই-পাসপোর্ট বৈধ
                  </span>
                </div>
                <p className="text-xs text-slate-400">আন্তর্জাতিক প্রমাণপত্র ও বিকল্প পরিচয়পত্র ভেরিফিকেশন</p>
              </div>
            </div>

            <button
              onClick={() => setActiveDocPreview(activeDocPreview === 'passport' ? null : 'passport')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeDocPreview === 'passport' ? 'প্রিভিউ বন্ধ' : 'প্রিভিউ দেখুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">পাসপোর্ট নম্বর</label>
              <input
                type="text"
                value={kycData.passportNumber}
                onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
                placeholder="যেমন: A04928174"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono tracking-wider uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ইস্যুকারী দেশ</label>
              <input
                type="text"
                value={kycData.passportCountry}
                onChange={(e) => handleFieldChange('passportCountry', e.target.value)}
                placeholder="বাংলাদেশ (Bangladesh)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ইস্যুর তারিখ (Issue Date)</label>
              <input
                type="date"
                value={kycData.passportIssueDate}
                onChange={(e) => handleFieldChange('passportIssueDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">মেয়াদোত্তীর্ণের তারিখ (Expiry Date)</label>
              <input
                type="date"
                value={kycData.passportExpiryDate}
                onChange={(e) => handleFieldChange('passportExpiryDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Document Upload Simulator */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-slate-300 font-mono truncate">{kycData.passportDocumentName || 'কোনো ফাইল আপলোড নেই'}</span>
            </div>
            <button
              onClick={() => handleSimulateFileSelect('passport')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <UploadCloud className="w-3 h-3 text-amber-400" />
              নতুন ফাইল দিন
            </button>
          </div>

          {/* Passport Bio Page Mockup */}
          {activeDocPreview === 'passport' && (
            <div className="p-4 bg-gradient-to-br from-purple-950/20 via-slate-950 to-slate-950 border border-purple-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="font-bold text-purple-300 text-[10px]">
                  PEOPLE'S REPUBLIC OF BANGLADESH • PASSPORT
                </span>
                <span className="font-mono text-emerald-400 font-semibold text-[10px]">ICAO Standard</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Passport No:</span>
                  <strong className="font-mono text-purple-300 uppercase">{kycData.passportNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nationality:</span>
                  <span className="text-slate-200">BANGLADESHI</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Date of Expiry:</span>
                  <strong className="font-mono text-emerald-400">{kycData.passportExpiryDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Issuing Authority:</span>
                  <span className="text-slate-300">DIP, Dhaka</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action Footer & Compliance Declaration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">shurjoPay মার্চেন্ট এগ্রিমেন্ট ও কমপ্লায়েন্স</h4>
            <p className="text-xs text-slate-400">
              সকল নথি বাংলাদেশ ব্যাংক পিএসও সার্কুলার ও অ্যান্টি-মানি লন্ডারিং (AML/CFT) আইন অনুসারে নিরাপদে এনক্রিপ্ট করে সংরক্ষিত হয়।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleSave()}
            disabled={isVerifying}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>সকল নথি সংরক্ষণ ও যাচাই সম্পন্ন করুন</span>
              </>
            )}
          </button>

          {onOpenSandbox && (
            <button
              onClick={onOpenSandbox}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>স্যান্ডবক্সে যান</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
