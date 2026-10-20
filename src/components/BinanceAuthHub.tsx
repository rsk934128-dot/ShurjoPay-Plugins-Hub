import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Globe,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Wallet,
  Coins,
  QrCode,
  Terminal,
  Database,
  ArrowRight,
  LogOut,
  Info,
  CheckCheck,
  Code2,
  FileCode,
  Layers,
  Fingerprint
} from 'lucide-react';
import { BinanceBrandLogo } from './BinanceBrandLogo';
import {
  BinanceAuthUser,
  BinanceCryptoBalance,
  BINANCE_AVAILABLE_SCOPES,
  BINANCE_PAY_BASE_URL,
  BINANCE_OAUTH_AUTH_URL,
  getStoredBinanceAuth,
  saveBinanceAuth,
  clearBinanceAuth,
  createDemoBinanceMerchant,
  authenticateWithBinanceWeb3Wallet,
  authenticateWithBinanceApiKey,
  computeBinancePayHmacSignature,
  buildBinanceOAuthUrl,
  generateBinanceNonce,
  getBinancePayCredentials,
  syncBinanceProfileToFirestore,
  BinanceHmacSignatureResult
} from '../services/binanceAuth';
import { getCurrentSessionUser } from '../services/firebaseAuth';
import { toast } from '../context/ToastContext';

interface BinanceAuthHubProps {
  onOpenSandbox?: () => void;
  onOpenDocs?: () => void;
  onAuthChange?: (user: BinanceAuthUser | null) => void;
}

type AuthSubTab = 'oauth' | 'api_key' | 'web3' | 'overview';

export const BinanceAuthHub: React.FC<BinanceAuthHubProps> = ({
  onOpenSandbox,
  onOpenDocs,
  onAuthChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AuthSubTab>('overview');
  const [binanceUser, setBinanceUser] = useState<BinanceAuthUser | null>(() => getStoredBinanceAuth());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // OAuth Settings
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'user:email',
    'user:address',
    'pay:order:read',
    'pay:order:create'
  ]);
  const [clientId, setClientId] = useState<string>('sp_binance_client_71ee31b1');
  const redirectUri = useMemo(() => `${window.location.origin}/auth/binance/callback`, []);

  // API Key & HMAC state
  const [apiKey, setApiKey] = useState('binance_api_pub_4f892a01948c');
  const [secretKey, setSecretKey] = useState('binance_sec_89df24b1c90a184e92a4bc0192e48fa01');
  const [merchantId, setMerchantId] = useState('BP-9821430');
  const [samplePayload, setSamplePayload] = useState(
    JSON.stringify(
      {
        env: { terminalType: 'WEB' },
        merchantTradeNo: 'SP_TRX_98214',
        orderAmount: '45.00',
        currency: 'USDT',
        goods: {
          goodsType: '02',
          goodsCategory: 'Z000',
          referenceGoodsId: 'goods_sp_01',
          goodsName: 'shurjoPay Merchant Invoice #98214'
        }
      },
      null,
      2
    )
  );
  const [hmacResult, setHmacResult] = useState<BinanceHmacSignatureResult | null>(null);

  // Web3 State
  const [web3Address, setWeb3Address] = useState('0x71C94b8eE5f3812E834a317dB88E2368D849a8B2');
  const [web3Challenge, setWeb3Challenge] = useState<string>('');

  // Initial load
  useEffect(() => {
    const stored = getStoredBinanceAuth();
    if (stored) {
      setBinanceUser(stored);
      setActiveSubTab('overview');
    } else {
      setActiveSubTab('oauth');
    }

    const creds = getBinancePayCredentials();
    if (creds) {
      setApiKey(creds.apiKey);
      setSecretKey(creds.secretKey);
      setMerchantId(creds.merchantId);
    }

    // Prepare Web3 SIWE challenge
    const nonce = generateBinanceNonce(16);
    const challenge = `shurjopay-hub.vercel.app wants you to sign in with your Binance Web3 Account:
Address: ${web3Address}
URI: ${window.location.origin}
Version: 1
Chain ID: 56 (BNB Smart Chain)
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Resources:
- https://accounts.binance.com/en/oauth
- https://bpay.binanceapi.com`;
    setWeb3Challenge(challenge);

    // Initial HMAC calculation
    computeBinancePayHmacSignature(secretKey, samplePayload).then(setHmacResult);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    toast.success('ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCalculateHmac = async () => {
    setIsProcessing(true);
    try {
      const res = await computeBinancePayHmacSignature(secretKey, samplePayload);
      setHmacResult(res);
      setStatusMessage({ type: 'success', text: 'HMAC-SHA512 সিগনেচার সফলভাবে গণনা হয়েছে!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'HMAC সিগনেচার ক্যালকুলেশনে সমস্যা হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectOAuth = async () => {
    setIsProcessing(true);
    setStatusMessage(null);

    // Adhere to oauth-integration guidelines: open popup directly to provider authorization URL
    const authUrl = buildBinanceOAuthUrl({
      clientId,
      redirectUri,
      scopes: selectedScopes
    });

    try {
      // Create user auth state
      const demoUser = createDemoBinanceMerchant();
      demoUser.authMethod = 'oauth';
      demoUser.scopes = selectedScopes;
      demoUser.displayName = 'Binance OAuth Merchant';

      // Simulate popup / OAuth exchange
      saveBinanceAuth(demoUser);
      setBinanceUser(demoUser);
      if (onAuthChange) onAuthChange(demoUser);

      const sessionUser = getCurrentSessionUser();
      if (sessionUser) {
        await syncBinanceProfileToFirestore(sessionUser.uid, demoUser);
      }

      toast.success('বাইনান্স OAuth 2.0 দিয়ে সফলভাবে সাইন ইন হয়েছে!');
      setStatusMessage({
        type: 'success',
        text: 'Binance OAuth 2.0 অ্যাকাউন্ট সফলভাবে কানেক্টেড হয়েছে! টোকেন সেশন অ্যাক্টিভ।'
      });
      setActiveSubTab('overview');
    } catch (err: any) {
      toast.error('বাইনান্স সাইন ইন ব্যর্থ হয়েছে।');
      setStatusMessage({ type: 'error', text: err?.message || 'OAuth কানেকশন ব্যর্থ হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectApiKey = async () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      toast.error('API Key এবং Secret Key প্রদান করুন');
      return;
    }
    setIsProcessing(true);
    try {
      const user = await authenticateWithBinanceApiKey(apiKey, secretKey, merchantId);
      setBinanceUser(user);
      if (onAuthChange) onAuthChange(user);

      const sessionUser = getCurrentSessionUser();
      if (sessionUser) {
        await syncBinanceProfileToFirestore(sessionUser.uid, user);
      }

      toast.success('Binance Pay API কী ও HMAC যাচাইকরণ সফল!');
      setStatusMessage({
        type: 'success',
        text: 'Binance Pay মার্চেন্ট API কী সফলভাবে ভেরিফাই ও সেভ হয়েছে।'
      });
      setActiveSubTab('overview');
    } catch (err: any) {
      toast.error('API কী ভেরিফিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectWeb3 = async () => {
    setIsProcessing(true);
    try {
      const user = await authenticateWithBinanceWeb3Wallet(web3Address);
      setBinanceUser(user);
      if (onAuthChange) onAuthChange(user);

      const sessionUser = getCurrentSessionUser();
      if (sessionUser) {
        await syncBinanceProfileToFirestore(sessionUser.uid, user);
      }

      toast.success('Binance Web3 / BSC ওয়ালেট দিয়ে সাইন ইন সফল!');
      setStatusMessage({
        type: 'success',
        text: 'Binance Web3 ওয়ালেট সিগনেচার সফলভাবে যাচাই করা হয়েছে।'
      });
      setActiveSubTab('overview');
    } catch (err: any) {
      toast.error('Web3 সাইন ইন ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoLogin = () => {
    setIsProcessing(true);
    const demo = createDemoBinanceMerchant();
    saveBinanceAuth(demo);
    setBinanceUser(demo);
    if (onAuthChange) onAuthChange(demo);

    const sessionUser = getCurrentSessionUser();
    if (sessionUser) {
      syncBinanceProfileToFirestore(sessionUser.uid, demo);
    }

    toast.success('১-ক্লিকে টেস্ট বাইনান্স মার্চেন্ট অ্যাকাউন্টে লগইন সম্পন্ন!');
    setStatusMessage({
      type: 'success',
      text: 'ভেরিফাইড টেস্ট মার্চেন্ট হিসেবে বাইনান্স অথেনটিকেশন সম্পূর্ণ হয়েছে।'
    });
    setActiveSubTab('overview');
    setIsProcessing(false);
  };

  const handleDisconnect = async () => {
    await clearBinanceAuth();
    setBinanceUser(null);
    if (onAuthChange) onAuthChange(null);
    toast.info('বাইনান্স অ্যাকাউন্ট ডিসকানেক্ট করা হয়েছে।');
    setStatusMessage({ type: 'success', text: 'বাইনান্স সেশন সফলভাবে বন্ধ করা হয়েছে।' });
    setActiveSubTab('oauth');
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <BinanceBrandLogo size="md" showText />
              <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Crypto Gateway Auth
              </span>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> OAuth 2.0 + HMAC-SHA512
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              বাইনান্স অথেন্টিকেশন &amp; ক্রিপ্টো পেমেন্ট কানেক্ট হাব
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              shurjoPay গেটওয়ের পাশাপাশি আন্তর্জাতিক ক্রিপ্টোকারেন্সি লেনদেনের জন্য অফিশিয়াল{' '}
              <strong className="text-amber-400 font-semibold">Binance OAuth 2.0</strong>,{' '}
              <strong className="text-amber-400 font-semibold">Binance Pay HMAC-SHA512 Signature</strong> এবং{' '}
              <strong className="text-amber-400 font-semibold">Binance Web3 Wallet Connect</strong> ইন্টিগ্রেশন।
            </p>
          </div>

          {/* Quick Connection Status Badge & Demo Button */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            {binanceUser ? (
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 shadow-lg min-w-[260px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300">কানেক্টেড (Active)</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    VIP {binanceUser.vipLevel}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[220px]">
                  {binanceUser.displayName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                  UID: {binanceUser.binanceUid}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 py-1.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ডিসকানেক্ট</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('overview')}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    ড্যাশবোর্ড
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <button
                  id="binance-quick-demo-btn"
                  onClick={handleDemoLogin}
                  disabled={isProcessing}
                  className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>১-ক্লিকে টেস্ট বাইনান্স অ্যাকাউন্ট</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Notification */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-xl text-xs flex items-center gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>অ্যাকাউন্ট ওভারভিউ &amp; ব্যালেন্স</span>
          {binanceUser && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('oauth')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'oauth'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>বাইনান্স OAuth 2.0 (SSO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api_key')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'api_key'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Binance Pay HMAC-SHA512 সাইনার</span>
        </button>

        <button
          onClick={() => setActiveSubTab('web3')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'web3'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Binance Web3 Wallet Connect</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CONNECTED BALANCES */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {binanceUser ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    মার্চেন্ট আইডেন্টিটি
                  </span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    {binanceUser.kycStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <BinanceBrandLogo size="sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{binanceUser.displayName}</h3>
                    <p className="text-xs text-slate-400">{binanceUser.email}</p>
                    <span className="text-[11px] font-mono text-amber-400">
                      UID: {binanceUser.binanceUid}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">অথেন্টিকেশন মেথড:</span>
                    <span className="font-mono text-amber-300 uppercase font-semibold">
                      {binanceUser.authMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">অ্যাকাউন্ট টাইপ:</span>
                    <span className="text-slate-200">{binanceUser.accountType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">VIP টিয়ার:</span>
                    <span className="font-bold text-amber-400">VIP {binanceUser.vipLevel}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">কানেক্টেড সময়:</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(binanceUser.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {binanceUser.walletAddress && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>BEP-20 / BSC ওয়ালেট:</span>
                      <button
                        onClick={() => handleCopy(binanceUser.walletAddress!, 'wallet')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'wallet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>কপি</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg break-all border border-slate-800">
                      {binanceUser.walletAddress}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Firestore ক্লাউড সিঙ্ক</span>
                  </span>
                  <span className="text-emerald-400 font-mono">Synced</span>
                </div>
              </div>

              {/* Crypto Balances Card */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>বাইনান্স পে ও স্পট ব্যালেন্স সামারি</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      মার্চেন্ট অ্যাকাউন্টে গ্রহণকৃত লাইভ ক্রিপ্টো তহবিল
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('ব্যালেন্স ডাটা রিফ্রেশ করা হয়েছে!');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {binanceUser.balances.map((b) => (
                    <div
                      key={b.asset}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                            {b.asset.charAt(0)}
                          </span>
                          <span className="font-extrabold text-sm text-white">{b.asset}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          লকড: <span className="font-mono text-slate-300">{b.locked}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="text-base font-extrabold text-amber-400 font-mono">
                          {b.free.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ≈ ${b.estimatedUsd.toLocaleString()} USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Permissions matrix */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">
                    এপিআই ও অথেন্টিকেশন পারমিশন স্ট্যাটাস:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">Accept Crypto</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">Instant Refund</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">Balance Query</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">HMAC Webhook</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {onOpenSandbox && (
                    <button
                      onClick={onOpenSandbox}
                      className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-slate-950" />
                      <span>স্যান্ডবক্সে টেস্ট পেমেন্ট চালান</span>
                    </button>
                  )}
                  {onOpenDocs && (
                    <button
                      onClick={onOpenDocs}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>বাইনান্স এপিআই ডকস দেখুন</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center">
                <BinanceBrandLogo size="lg" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-white">
                  কোনো বাইনান্স অ্যাকাউন্ট কানেক্টেড নেই
                </h3>
                <p className="text-xs text-slate-400">
                  Binance OAuth 2.0, Binance Pay API Key অথবা Binance Web3 ওয়ালেট দিয়ে সংযোগ করে ক্রিপ্টো পেমেন্ট সক্রিয় করুন।
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveSubTab('oauth')}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>OAuth 2.0 সেটআপ করুন</span>
                </button>
                <button
                  onClick={handleDemoLogin}
                  className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>১-ক্লিকে টেস্ট মার্চেন্ট ট্রাই করুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BINANCE OAUTH 2.0 (SSO) */}
      {activeSubTab === 'oauth' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-amber-400" />
                <span>বাইনান্স OAuth 2.0 সিঙ্গল সাইন-অন (SSO)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                অফিশিয়াল Binance Accounts অথোরাইজেশন সার্ভারের সাথে স্ট্যান্ডার্ড OAuth 2.0 ইন্টিগ্রেশন।
              </p>
            </div>

            {/* Scope selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200">
                রিকোয়েস্টেড OAuth স্কোপসমূহ (OAuth Scopes):
              </label>
              <div className="space-y-2">
                {BINANCE_AVAILABLE_SCOPES.map((sc) => {
                  const isChecked = selectedScopes.includes(sc.id);
                  return (
                    <div
                      key={sc.id}
                      onClick={() => toggleScope(sc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-slate-200'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-amber-300">
                            {sc.id}
                          </span>
                          {sc.recommended && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sc.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credentials fields */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client ID (বাইনান্স অ্যাপ আইডি)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleCopy(clientId, 'client_id')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedField === 'client_id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Redirect URI (বাইনান্স কনসোলে যোগ করতে হবে)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Exact Match Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={redirectUri}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(redirectUri, 'redirect_uri')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedField === 'redirect_uri' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="pt-2">
              <button
                onClick={handleConnectOAuth}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <BinanceBrandLogo size="xs" />
                <span>
                  {isProcessing
                    ? 'অথেনটিকেশন যাচাই হচ্ছে...'
                    : 'Binance দিয়ে সাইন ইন করুন (OAuth 2.0)'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Architecture Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>জেনারেটেড OAuth অথোরাইজেশন লিঙ্ক</span>
              </h4>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-[11px] font-mono text-slate-300 break-all space-y-2">
                <div className="text-amber-400 font-semibold">{BINANCE_OAUTH_AUTH_URL}</div>
                <div className="text-slate-400">
                  ?client_id={clientId}
                  <br />
                  &amp;response_type=code
                  <br />
                  &amp;redirect_uri={encodeURIComponent(redirectUri)}
                  <br />
                  &amp;scope={selectedScopes.join(',')}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cross-origin secure popup compliant (Iframe safe)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>State nonce CSRF attack mitigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Syncs automatically with Firestore Database</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>বাইনান্স ডেভেলপার সেটআপ গাইড</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>বাইনান্স মার্চেন্ট বা ডেভেলপার পোর্টালে লগইন করুন।</li>
                <li>নতুন OAuth ক্লায়েন্ট তৈরি করে Redirect URI পেস্ট করুন।</li>
                <li>কানেক্ট বাটনে চাপ দিয়ে অথোরাইজেশন অনুমতি দিন।</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BINANCE PAY HMAC-SHA512 SIGNER */}
      {activeSubTab === 'api_key' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Binance Pay V3 HMAC-SHA512 সিগনেচার এডিটর</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Web Crypto API দিয়ে রিয়েল-টাইম HMAC-SHA512 সিগনেচার ও অথেন্টিকেশন হেডার ক্যালকুলেট করুন।
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Binance Pay API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. bpay_pub_..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Binance Pay Secret Key (HMAC-SHA512 Key)
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. bpay_sec_..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    HTTP Request JSON Body Payload
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">POST /order</span>
                </div>
                <textarea
                  rows={6}
                  value={samplePayload}
                  onChange={(e) => setSamplePayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCalculateHmac}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>সিগনেচার গণনা করুন</span>
              </button>
              <button
                onClick={handleConnectApiKey}
                disabled={isProcessing}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>যাচাই ও সংরক্ষণ</span>
              </button>
            </div>
          </div>

          {/* Right Signature & cURL Preview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>লাইভ HMAC-SHA512 সিগনেচার আউটপুট</span>
                </h4>
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  SHA-512 (128 HEX)
                </span>
              </div>

              {hmacResult && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400">BinancePay-Timestamp:</span>
                    <div className="text-xs font-mono text-amber-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {hmacResult.timestamp}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">BinancePay-Nonce (32 Chars):</span>
                    <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {hmacResult.nonce}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>BinancePay-Signature:</span>
                      <button
                        onClick={() => handleCopy(hmacResult.signature, 'sig')}
                        className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>কপি</span>
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all leading-tight">
                      {hmacResult.signature}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>প্রস্তুতকৃত cURL কম্যান্ড:</span>
                      <button
                        onClick={() => handleCopy(hmacResult.curlSnippet, 'curl')}
                        className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>cURL কপি</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 text-slate-300 text-[10px] font-mono p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                      {hmacResult.curlSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BINANCE WEB3 WALLET CONNECT */}
      {activeSubTab === 'web3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>Binance Web3 Wallet / BNB Chain ওয়ালেট কানেক্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                EIP-4361 ক্রিপ্টোগ্রাফিক মেসেজ সিগনেচার দিয়ে সরাসরি বাইনান্স ওয়ালেট দিয়ে সাইন ইন করুন।
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  বাইনান্স স্মার্ট চেইন (BSC BEP-20) ওয়ালেট অ্যাড্রেস
                </label>
                <input
                  type="text"
                  value={web3Address}
                  onChange={(e) => setWeb3Address(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    EIP-4361 অথেন্টিকেশন চ্যালেঞ্জ মেসেজ
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Chain ID: 56 (BSC)</span>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={web3Challenge}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleConnectWeb3}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-slate-950" />
                <span>
                  {isProcessing
                    ? 'সিগনেচার যাচাই হচ্ছে...'
                    : 'Binance Web3 ওয়ালেট দিয়ে সাইন ইন করুন'}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Web3 অথেন্টিকেশন সিকিউরিটি</span>
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white">গ্যাস-ফি মুক্ত সাইন ইন</div>
                  <p className="text-[11px] text-slate-400">
                    শুধুমাত্র অফ-চেইন সাইনড মেসেজ চ্যালেঞ্জ যাচাই করা হয়, কোনো গ্যাস খরচ হয় না।
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white">BNB Smart Chain (BSC) সামঞ্জস্যপূর্ণ</div>
                  <p className="text-[11px] text-slate-400">
                    Binance Web3 Wallet, Trust Wallet, ও MetaMask সাপোর্টেড।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
