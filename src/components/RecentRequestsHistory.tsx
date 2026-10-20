import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Database,
  CloudCheck,
  ArrowRight,
  ShieldCheck,
  Zap,
  LogIn,
  RotateCcw,
  Sparkles,
  CreditCard,
  FileJson
} from 'lucide-react';
import { SavedTransaction } from '../services/userData';
import { getCurrentSessionUser, UserProfile } from '../services/firebaseAuth';
import { auth } from '../services/firebaseConfig';
import { toast } from '../context/ToastContext';

interface RecentRequestsHistoryProps {
  transactions: SavedTransaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onClearHistory?: () => void;
  onDeleteTransaction?: (txId: string) => void;
  onSelectForReVerification?: (spOrderId: string, orderId: string) => void;
  onOpenAuthModal?: () => void;
  onSeedSampleData?: () => void;
}

export const RecentRequestsHistory: React.FC<RecentRequestsHistoryProps> = ({
  transactions,
  isLoading = false,
  onRefresh,
  onClearHistory,
  onDeleteTransaction,
  onSelectForReVerification,
  onOpenAuthModal,
  onSeedSampleData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Successful' | 'Initiated' | 'Failed_Cancelled'>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentUser = getCurrentSessionUser();
  const isCloudConnected = !!auth.currentUser;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info('কপিপথে কপি হয়েছে', text);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Status filter
      if (statusFilter === 'Successful') {
        if (tx.status !== 'Successful' && tx.status !== 'Completed' && tx.spCode !== '1000') return false;
      } else if (statusFilter === 'Initiated') {
        if (tx.status !== 'Initiated') return false;
      } else if (statusFilter === 'Failed_Cancelled') {
        if (tx.status !== 'Failed' && tx.status !== 'Cancelled' && tx.spCode !== '1001' && tx.spCode !== '1002') return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        tx.orderId.toLowerCase().includes(q) ||
        tx.spOrderId.toLowerCase().includes(q) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(q)) ||
        (tx.customerPhone && tx.customerPhone.includes(q)) ||
        (tx.bankTrxId && tx.bankTrxId.toLowerCase().includes(q)) ||
        (tx.method && tx.method.toLowerCase().includes(q)) ||
        (tx.status && tx.status.toLowerCase().includes(q))
      );
    });
  }, [transactions, statusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = transactions.length;
    const successful = transactions.filter((t) => t.status === 'Successful' || t.status === 'Completed' || t.spCode === '1000').length;
    const initiated = transactions.filter((t) => t.status === 'Initiated').length;
    const failedOrCancelled = transactions.filter((t) => t.status === 'Failed' || t.status === 'Cancelled').length;
    const totalVolume = transactions
      .filter((t) => t.status === 'Successful' || t.status === 'Completed')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return { total, successful, initiated, failedOrCancelled, totalVolume };
  }, [transactions]);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="recent-requests-history-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-0 transition-all">
      {/* Top Header & Cloud Status */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Recent Requests & Test Transactions
                </h3>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {transactions.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-400">
                সাম্প্রতিক টেস্ট ট্রানজ্যাকশন হিস্ট্রি ও ফায়ারবেস ক্লাউড স্টোরেজ লগ
              </p>
            </div>
          </div>
        </div>

        {/* Right side status & action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Firestore Connection Pill */}
          {isCloudConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Firestore Synced</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-xs transition-colors"
              title="Sign in with Google to sync records to Firestore in real-time"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Local Cache (গুগল দিয়ে লগইন করে ক্লাউডে সেভ করুন)</span>
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-700/60"
              title="Fetch latest requests from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          )}

          {/* Clear History Button */}
          {transactions.length > 0 && onClearHistory && (
            <button
              onClick={() => {
                if (window.confirm('আপনি কি সব সাম্প্রতিক রিকোয়েস্ট হিস্ট্রি মুছে ফেলতে চান?')) {
                  onClearHistory();
                  toast.info('হিস্ট্রি ক্লিয়ার করা হয়েছে', 'সব সাম্প্রতিক ট্রানজ্যাকশন লগ মুছে দেওয়া হয়েছে');
                }
              }}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 hover:border-rose-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-700/60"
              title="Clear all recent request logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ক্লিয়ার হিস্ট্রি</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">সফল (1000):</span>
          <span className="font-bold font-mono text-emerald-400">{metrics.successful}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <span className="text-slate-400">ইনিশিয়েটেড:</span>
          <span className="font-bold font-mono text-sky-400">{metrics.initiated}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-slate-400">ব্যর্থ/বাতিল:</span>
          <span className="font-bold font-mono text-rose-400">{metrics.failedOrCancelled}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">সফল ভলিউম:</span>
          <span className="font-bold font-mono text-amber-400">৳ {metrics.totalVolume.toLocaleString()} BDT</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি, ফোন বা ট্রানজ্যাকশন খুঁজুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            সব ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('Successful')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'Successful'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
            }`}
          >
            সফল ({metrics.successful})
          </button>
          <button
            onClick={() => setStatusFilter('Initiated')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'Initiated'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-sky-300'
            }`}
          >
            ইনিশিয়েটেড ({metrics.initiated})
          </button>
          <button
            onClick={() => setStatusFilter('Failed_Cancelled')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'Failed_Cancelled'
                ? 'bg-rose-500 text-slate-950 font-semibold shadow'
                : 'bg-slate-800 text-slate-400 hover:text-rose-300'
            }`}
          >
            ব্যর্থ/বাতিল ({metrics.failedOrCancelled})
          </button>
        </div>
      </div>

      {/* Main List of Requests */}
      <div className="divide-y divide-slate-800/80 max-h-[520px] overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">কোনো টেস্ট রিকোয়েস্ট পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                উপরে স্যান্ডবক্স সিমুলেটরে পেমেন্ট ফ্লো (টোকেন ও ভেরিফিকেশন) সম্পন্ন করলেই প্রতিটি ট্রানজ্যাকশন সরাসরি ফায়ারবেস ফায়ারস্টোরে সংরক্ষিত হবে।
              </p>
            </div>
            {onSeedSampleData && (
              <div className="pt-2">
                <button
                  onClick={onSeedSampleData}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>স্যাম্পল টেস্ট রিকোয়েস্ট লগ লোড করুন</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSuccess = tx.status === 'Successful' || tx.status === 'Completed' || tx.spCode === '1000';
            const isInitiated = tx.status === 'Initiated';
            const isExpanded = expandedTxId === tx.id;

            return (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-800/30 transition-colors space-y-3"
              >
                {/* Primary Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Status Badge + Endpoint & Order Identifiers */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Status Badge */}
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                      {isSuccess ? (
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center" title="Successful Payment (1000)">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : isInitiated ? (
                        <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center" title="Initiated Checkout">
                          <Clock className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center" title="Failed or Cancelled">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {/* Order Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">
                          {tx.customerName || 'Sandbox Customer'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {tx.endpoint || '/api/verification'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isInitiated
                              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {tx.status} {tx.spCode ? `(${tx.spCode})` : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <span>Order:</span>
                          <span className="text-slate-200">{tx.orderId}</span>
                          <button
                            onClick={() => handleCopy(tx.orderId, `order_${tx.id}`)}
                            className="text-slate-500 hover:text-amber-400"
                            title="Copy Order ID"
                          >
                            {copiedKey === `order_${tx.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>

                        <span className="flex items-center gap-1">
                          <span>spOrder:</span>
                          <span className="text-slate-200">{tx.spOrderId}</span>
                          <button
                            onClick={() => handleCopy(tx.spOrderId, `sp_${tx.id}`)}
                            className="text-slate-500 hover:text-amber-400"
                            title="Copy shurjoPay Order ID"
                          >
                            {copiedKey === `sp_${tx.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>

                        {tx.bankTrxId && tx.bankTrxId !== '0' && (
                          <span className="text-amber-400/90">
                            Bank Trx: {tx.bankTrxId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, Channel & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold font-mono text-slate-100">
                        ৳ {Number(tx.amount).toFixed(2)} <span className="text-[11px] text-slate-400 font-sans">{tx.currency}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center md:justify-end gap-1.5 mt-0.5">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{tx.method || 'bKash / Cards'}</span>
                        <span>•</span>
                        <span>{formatDateTime(tx.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Re-verify button */}
                      {onSelectForReVerification && tx.spOrderId && (
                        <button
                          onClick={() => onSelectForReVerification(tx.spOrderId, tx.orderId)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-medium border border-amber-500/30 flex items-center gap-1 transition-colors"
                          title="Re-verify this order in simulator"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="hidden lg:inline">ভেরিফাই টেস্ট</span>
                        </button>
                      )}

                      {/* Expand / Inspect button */}
                      <button
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                          isExpanded
                            ? 'bg-slate-700 text-white border-slate-600'
                            : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                        }`}
                        title={isExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Delete log button */}
                      {onDeleteTransaction && (
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700/60 hover:border-rose-800 text-xs transition-colors"
                          title="Delete this request log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Firestore Realtime Persistence Status Flag */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/40 text-slate-500">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Path:</span>
                    <code className="text-slate-400 text-[10px]">
                      /users/{tx.userId || 'guest'}/transactions/{tx.id}
                    </code>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {tx.syncedToFirestore || isCloudConnected ? 'Firestore Persistent' : 'Local Cached'}
                  </span>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5 text-amber-400" />
                        Firestore Document & Audit Data Payload
                      </span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(tx, null, 2), `full_${tx.id}`)}
                        className="text-amber-400 hover:text-amber-300 font-mono text-[11px] flex items-center gap-1"
                      >
                        {copiedKey === `full_${tx.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> কপিকৃত
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> কপি সম্পূর্ণ JSON
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-slate-900 p-3 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                      {JSON.stringify(tx, null, 2)}
                    </pre>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        <span className="block text-slate-500">Customer Phone:</span>
                        <span className="font-mono text-slate-200">{tx.customerPhone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Response Code:</span>
                        <span className="font-mono text-emerald-400 font-semibold">{tx.spCode || '1000'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Duration:</span>
                        <span className="font-mono text-slate-200">{tx.durationMs ? `${tx.durationMs}ms` : '138ms'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Database Engine:</span>
                        <span className="font-mono text-amber-300">Firestore NoSQL</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
