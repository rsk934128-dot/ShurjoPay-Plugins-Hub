import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRightLeft, 
  Wallet, 
  ShieldCheck, 
  Repeat, 
  QrCode, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Zap, 
  Search, 
  Filter, 
  Lock, 
  Check, 
  Copy, 
  Clock, 
  CreditCard, 
  Sliders, 
  Plus, 
  Play,
  BadgeCheck,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { 
  CONNECTED_OPEN_BANKS, 
  MOCK_BALANCES, 
  MOCK_STATEMENTS, 
  DEFAULT_MANDATES 
} from '../data/openBankingData';
import { 
  OpenBankInfo, 
  OpenBankType, 
  DirectDebitMandate, 
  BankAccountBalance, 
  BankStatementItem,
  BinimoyTransactionRecord 
} from '../types';

interface OpenBankingHubProps {
  onOpenSandbox?: () => void;
}

export const OpenBankingHub: React.FC<OpenBankingHubProps> = ({ onOpenSandbox }) => {
  const [activeTab, setActiveTab] = useState<'a2a' | 'ais' | 'binimoy' | 'mandates' | 'banks' | 'api'>('a2a');
  
  // A2A Payment Form State
  const [a2aBank, setA2aBank] = useState<string>('city_bank');
  const [a2aSourceAccount, setA2aSourceAccount] = useState<string>('1102948192001');
  const [a2aAmount, setA2aAmount] = useState<number>(5000);
  const [a2aRemarks, setA2aRemarks] = useState<string>('shurjoPay Merchant Invoice #SP8492');
  const [a2aChannel, setA2aChannel] = useState<'NPSB' | 'BINIMOY' | 'RTGS'>('NPSB');
  const [a2aOtp, setA2aOtp] = useState<string>('');
  const [a2aStep, setA2aStep] = useState<'input' | 'otp' | 'success'>('input');
  const [a2aLoading, setA2aLoading] = useState<boolean>(false);
  const [a2aTxResult, setA2aTxResult] = useState<any>(null);

  // AIS State (Account Information)
  const [aisBank, setAisBank] = useState<string>('city_bank');
  const [aisBalances, setAisBalances] = useState<Record<string, BankAccountBalance>>(MOCK_BALANCES);
  const [aisStatements, setAisStatements] = useState<Record<string, BankStatementItem[]>>(MOCK_STATEMENTS);
  const [aisRefreshing, setAisRefreshing] = useState<boolean>(false);

  // Binimoy State
  const [binimoySenderVid, setBinimoySenderVid] = useState<string>('farid.tech@shurjopay');
  const [binimoyReceiverVid, setBinimoyReceiverVid] = useState<string>('merchant.store@citytouch');
  const [binimoyAmount, setBinimoyAmount] = useState<number>(2500);
  const [binimoyPin, setBinimoyPin] = useState<string>('948192');
  const [binimoyPurpose, setBinimoyPurpose] = useState<string>('Product Purchase');
  const [binimoyLoading, setBinimoyLoading] = useState<boolean>(false);
  const [binimoyHistory, setBinimoyHistory] = useState<BinimoyTransactionRecord[]>([
    {
      trxId: 'IDTP-2026-9481920',
      senderVid: 'farid.tech@shurjopay',
      receiverVid: 'merchant.store@citytouch',
      amount: 15000,
      fee: 10,
      purpose: 'B2B Software License',
      status: 'Successful',
      timestamp: '2026-09-16 11:20:15',
      clearingRef: 'BB-IDTP-CLR-49182'
    },
    {
      trxId: 'IDTP-2026-8819241',
      senderVid: 'customer.rahim@bkash',
      receiverVid: 'farid.tech@shurjopay',
      amount: 4200,
      fee: 5,
      purpose: 'Online Order #8491',
      status: 'Successful',
      timestamp: '2026-09-15 16:45:00',
      clearingRef: 'BB-IDTP-CLR-39184'
    }
  ]);

  // Mandates State
  const [mandates, setMandates] = useState<DirectDebitMandate[]>(DEFAULT_MANDATES);
  const [showNewMandateModal, setShowNewMandateModal] = useState<boolean>(false);
  const [newMandateForm, setNewMandateForm] = useState({
    merchantName: '',
    bankId: 'city_bank',
    accountNumber: '1102948192001',
    maxAmount: 5000,
    frequency: 'Monthly' as const
  });

  // Bank directory search & filter
  const [bankSearch, setBankSearch] = useState<string>('');
  const [bankTypeFilter, setBankTypeFilter] = useState<OpenBankType | 'all'>('all');

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<'pis' | 'ais' | 'binimoy' | 'mandate'>('pis');
  const [apiLang, setApiLang] = useState<'curl' | 'nodejs' | 'python' | 'php'>('nodejs');
  const [apiExecuting, setApiExecuting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  // Copied feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Process A2A Payment Simulation
  const handleA2aSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setA2aLoading(true);
    setTimeout(() => {
      setA2aLoading(false);
      setA2aStep('otp');
    }, 600);
  };

  const handleA2aVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setA2aLoading(true);
    setTimeout(() => {
      const bank = CONNECTED_OPEN_BANKS.find(b => b.id === a2aBank);
      const generatedTrx = {
        transactionId: `OB-A2A-${Date.now().toString().slice(-8)}`,
        sourceBank: bank?.name || 'City Bank',
        channel: a2aChannel,
        amount: a2aAmount,
        currency: 'BDT',
        senderAccount: a2aSourceAccount,
        beneficiaryAccount: 'shurjoPay Central Escrow (CBL-8492019)',
        clearingRef: `BB-${a2aChannel}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: 'Successful',
        settlementMode: 'Instant Real-time Settlement (24x7)',
        timestamp: new Date().toLocaleString('en-BD')
      };
      setA2aTxResult(generatedTrx);
      setA2aLoading(false);
      setA2aStep('success');

      // Also deduct from simulated balance
      if (aisBalances[a2aBank]) {
        setAisBalances(prev => ({
          ...prev,
          [a2aBank]: {
            ...prev[a2aBank],
            availableBalance: Math.max(0, prev[a2aBank].availableBalance - a2aAmount),
            ledgerBalance: Math.max(0, prev[a2aBank].ledgerBalance - a2aAmount),
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    }, 800);
  };

  // Refresh AIS balance simulation
  const handleRefreshBalance = () => {
    setAisRefreshing(true);
    setTimeout(() => {
      setAisRefreshing(false);
    }, 500);
  };

  // Binimoy Submit Simulation
  const handleBinimoySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBinimoyLoading(true);
    setTimeout(() => {
      const newRecord: BinimoyTransactionRecord = {
        trxId: `IDTP-${Date.now().toString().slice(-8)}`,
        senderVid: binimoySenderVid,
        receiverVid: binimoyReceiverVid,
        amount: binimoyAmount,
        fee: Math.round(binimoyAmount * 0.001) + 2,
        purpose: binimoyPurpose,
        status: 'Successful',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        clearingRef: `BB-IDTP-CLR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };
      setBinimoyHistory(prev => [newRecord, ...prev]);
      setBinimoyLoading(false);
      alert(`বিনিয়োগ আইডিটিপি (Binimoy IDTP) সফল! ট্রানজ্যাকশন আইডি: ${newRecord.trxId} (টাকা ${binimoyAmount})`);
    }, 700);
  };

  // Mandates create simulation
  const handleCreateMandate = (e: React.FormEvent) => {
    e.preventDefault();
    const bank = CONNECTED_OPEN_BANKS.find(b => b.id === newMandateForm.bankId);
    const newMandate: DirectDebitMandate = {
      id: `MANDATE-${Date.now().toString().slice(-6)}`,
      merchantName: newMandateForm.merchantName || 'Subscription Billing',
      bankId: newMandateForm.bankId,
      bankName: bank?.name || 'Selected Bank',
      accountNumber: newMandateForm.accountNumber,
      maxAmount: newMandateForm.maxAmount,
      frequency: newMandateForm.frequency,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2028-12-31',
      status: 'Active'
    };
    setMandates(prev => [newMandate, ...prev]);
    setShowNewMandateModal(false);
    setNewMandateForm({
      merchantName: '',
      bankId: 'city_bank',
      accountNumber: '1102948192001',
      maxAmount: 5000,
      frequency: 'Monthly'
    });
  };

  // Toggle Mandate Status
  const handleToggleMandateStatus = (id: string) => {
    setMandates(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: m.status === 'Active' ? 'Paused' : 'Active'
        };
      }
      return m;
    }));
  };

  // Filtered Banks
  const filteredBanks = CONNECTED_OPEN_BANKS.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(bankSearch.toLowerCase()) || 
                          b.bnName.includes(bankSearch) || 
                          b.shortCode.toLowerCase().includes(bankSearch.toLowerCase()) ||
                          b.routingNumber.includes(bankSearch);
    const matchesType = bankTypeFilter === 'all' || b.type === bankTypeFilter;
    return matchesSearch && matchesType;
  });

  // API Code Snippets
  const getApiSnippet = () => {
    if (apiEndpoint === 'pis') {
      if (apiLang === 'curl') {
        return `curl -X POST https://api.shurjopay.com.bd/open-banking/v1/payments/initiate \\
  -H "Authorization: Bearer <API_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -H "X-Client-Signature: <HMAC_SHA256>" \\
  -d '{
    "channel": "NPSB",
    "source_bank_code": "CBL",
    "source_account": "1102948192001",
    "amount": 5000.00,
    "currency": "BDT",
    "beneficiary_account": "SP_MERCHANT_ESCROW_01",
    "remarks": "Order Payment #84920",
    "return_url": "https://merchant.com/callback"
  }'`;
      } else if (apiLang === 'nodejs') {
        return `import { ShurjoOpenBanking } from 'shurjopay-openbanking-sdk';

const client = new ShurjoOpenBanking({
  apiKey: process.env.SHURJOPAY_KEY,
  secretKey: process.env.SHURJOPAY_SECRET,
  sandbox: true
});

// Initiate Instant Bank-to-Bank (A2A) Payment
const payment = await client.payments.initiateA2A({
  channel: 'NPSB', // or 'BINIMOY', 'RTGS'
  sourceBankCode: 'CBL',
  sourceAccount: '1102948192001',
  amount: 5000.00,
  currency: 'BDT',
  remarks: 'Order Payment #84920'
});

console.log('Payment Initiated:', payment.transactionId, payment.otpRequired);`;
      } else if (apiLang === 'python') {
        return `import requests

url = "https://api.shurjopay.com.bd/open-banking/v1/payments/initiate"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "channel": "NPSB",
    "source_bank_code": "CBL",
    "source_account": "1102948192001",
    "amount": 5000.00,
    "currency": "BDT",
    "remarks": "Order Payment #84920"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      } else {
        return `<?php
$ch = curl_init('https://api.shurjopay.com.bd/open-banking/v1/payments/initiate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_ACCESS_TOKEN',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'channel' => 'NPSB',
    'source_bank_code' => 'CBL',
    'source_account' => '1102948192001',
    'amount' => 5000.00,
    'currency' => 'BDT',
    'remarks' => 'Order Payment #84920'
]));
$response = curl_exec($ch);
curl_close($ch);
print_r(json_decode($response, true));
?>`;
      }
    } else if (apiEndpoint === 'ais') {
      return `// AIS: Live Bank Balance Inquiry
const balance = await client.accounts.getBalance({
  bankId: 'city_bank',
  accountId: '1102948192001'
});

// Response:
// {
//   "status": "success",
//   "available_balance": 245850.75,
//   "ledger_balance": 250000.00,
//   "currency": "BDT",
//   "holder_name": "SHEIKH FARID (TECH SOL)"
// }`;
    } else if (apiEndpoint === 'binimoy') {
      return `// Binimoy IDTP: Virtual ID to Virtual ID Instant Settlement
const binimoyTransfer = await client.binimoy.transfer({
  senderVid: 'farid.tech@shurjopay',
  receiverVid: 'merchant.store@citytouch',
  amount: 2500.00,
  purpose: 'B2B Software Purchase'
});`;
    } else {
      return `// Direct Debit / e-Mandate Creation
const mandate = await client.mandates.create({
  merchantName: 'shurjoPay Pro Subscription',
  bankId: 'city_bank',
  accountNumber: '1102948192001',
  maxAmount: 5000.00,
  frequency: 'Monthly'
});`;
    }
  };

  const handleExecuteApi = () => {
    setApiExecuting(true);
    setTimeout(() => {
      setApiExecuting(false);
      if (apiEndpoint === 'pis') {
        setApiResponse(JSON.stringify({
          status: "SUCCESS",
          code: 200,
          message: "A2A Payment initiated successfully via NPSB",
          data: {
            transaction_id: `OB-NPSB-${Date.now().toString().slice(-8)}`,
            clearing_ref: `BB-NPSB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            source_bank: "The City Bank Ltd",
            beneficiary: "shurjoPay Escrow Payout",
            amount: 5000.00,
            currency: "BDT",
            fee: 0.00,
            settlement_status: "REAL_TIME_CLEARED",
            cleared_at: new Date().toISOString()
          },
          protocol: "ISO 20022 pain.001.001.09"
        }, null, 2));
      } else if (apiEndpoint === 'ais') {
        setApiResponse(JSON.stringify({
          status: "SUCCESS",
          code: 200,
          account_info: {
            bank_code: "CBL",
            account_number: "1102948192001",
            account_title: "SHEIKH FARID (TECH SOL)",
            available_balance: 245850.75,
            ledger_balance: 250000.00,
            currency: "BDT",
            kyc_status: "VERIFIED_COMPLIANT"
          }
        }, null, 2));
      } else if (apiEndpoint === 'binimoy') {
        setApiResponse(JSON.stringify({
          status: "SUCCESS",
          code: 200,
          idtp_clearing_code: "CLR-IDTP-2026-9812",
          sender_vid: "farid.tech@shurjopay",
          receiver_vid: "merchant.store@citytouch",
          amount: 2500.00,
          currency: "BDT",
          channel: "BINIMOY_IDTP",
          completed_at: new Date().toISOString()
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          status: "SUCCESS",
          code: 201,
          mandate_id: `MANDATE-${Date.now().toString().slice(-6)}`,
          mandate_status: "ACTIVE",
          max_amount_per_cycle: 5000.00,
          frequency: "MONTHLY",
          direct_debit_token: "dd_tok_948192018471"
        }, null, 2));
      }
    }, 650);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                বাংলাদেশ ব্যাংক ওপেন ব্যাংকিং ফ্রেমওয়ার্ক
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                NPSB • Binimoy (IDTP) • BEFTN • RTGS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ৫০+ তফসিলি ব্যাংক লাইভ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>shurjoPay অল-ইন-অল ওপেন ব্যাংকিং প্ল্যাটফর্ম</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              সরাসরি ব্যাংক টু ব্যাংক ইনস্ট্যান্ট ফান্ড ট্রান্সফার (A2A), রিয়েল-টাইম একাউন্ট ব্যালেন্স ও স্টেটমেন্ট ফেচ (AIS), বিনিময় (Binimoy IDTP), অটো-ডেবিট রিকারিং ম্যান্ডেট এবং বাংলা কিউআর পেমেন্ট সুবিধা — সব এক উন্মুক্ত এপিআই প্ল্যাটফর্মে।
            </p>
          </div>

          {/* Quick Ecosystem Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 w-full lg:w-auto shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-amber-400">১০০% Instant</div>
              <div className="text-[10px] text-slate-400">A2A রিয়েল-টাইম সেটেলমেন্ট</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-emerald-400">~৩৮ ms</div>
              <div className="text-[10px] text-slate-400">গড় ব্যাংক এপিআই রেসপন্স</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-sky-400">ISO 20022</div>
              <div className="text-[10px] text-slate-400">আন্তর্জাতিক ফিনটেক প্রোটোকল</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-indigo-400">০.০% ফি</div>
              <div className="text-[10px] text-slate-400">মার্চেন্ট ডিরেক্ট ক্রেডিট</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('a2a')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'a2a'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>১. ডিরেক্ট ব্যাংক ট্রান্সফার (A2A Payment)</span>
        </button>

        <button
          onClick={() => setActiveTab('ais')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'ais'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>২. একাউন্ট ব্যালেন্স ও স্টেটমেন্ট (AIS)</span>
        </button>

        <button
          onClick={() => setActiveTab('binimoy')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'binimoy'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>৩. বিনিময় প্ল্যাটফর্ম (Binimoy IDTP)</span>
        </button>

        <button
          onClick={() => setActiveTab('mandates')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'mandates'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>৪. অটো-ডেবিট ও e-Mandate</span>
        </button>

        <button
          onClick={() => setActiveTab('banks')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'banks'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>৫. সংযুক্ত ব্যাংকসমূহ ({CONNECTED_OPEN_BANKS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'api'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>৬. ওপেন ব্যাংকিং এপিআই টেস্ট</span>
        </button>
      </div>

      {/* TAB 1: PIS - Instant Bank-to-Bank Transfer (A2A Payment) */}
      {activeTab === 'a2a' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transfer Form Panel */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wide">
                  Payment Initiation Service (PIS)
                </span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>ইনস্ট্যান্ট একাউন্ট-টু-একাউন্ট (A2A) ব্যাংক ট্রান্সফার</span>
                </h3>
              </div>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> বাংলাদেশ ব্যাংক NPSB ভেরিফাইড
              </span>
            </div>

            {a2aStep === 'input' && (
              <form onSubmit={handleA2aSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">১. প্রেরকের ব্যাংক নির্বাচন করুন</label>
                  <select
                    value={a2aBank}
                    onChange={(e) => setA2aBank(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {CONNECTED_OPEN_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.shortCode}) — রাউটিং: {b.routingNumber} [{b.apiProtocol}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">প্রেরকের ব্যাংক একাউন্ট / কার্ড নম্বর</label>
                    <input
                      type="text"
                      value={a2aSourceAccount}
                      onChange={(e) => setA2aSourceAccount(e.target.value)}
                      placeholder="যেমন: 1102948192001"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono tracking-wider focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">লেনদেনের পরিমাণ (টাকা / BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={a2aAmount}
                        onChange={(e) => setA2aAmount(Number(e.target.value))}
                        min={10}
                        required
                        className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">সুইচিং চ্যানেল / প্রোটোকল</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setA2aChannel('NPSB')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        a2aChannel === 'NPSB'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">NPSB IBFT</div>
                      <div className="text-[10px] opacity-75">তাত্ক্ষণিক (০-৫ সেকেন্ড)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setA2aChannel('BINIMOY')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        a2aChannel === 'BINIMOY'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">বিনিময় (IDTP)</div>
                      <div className="text-[10px] opacity-75">ইন্টারঅপারেবল গেটওয়ে</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setA2aChannel('RTGS')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        a2aChannel === 'RTGS'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">BD-RTGS</div>
                      <div className="text-[10px] opacity-75">উচ্চমূল্য রিয়েল-টাইম</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">লেনদেনের উদ্দেশ্য / ইনভয়েস রেফারেন্স</label>
                  <input
                    type="text"
                    value={a2aRemarks}
                    onChange={(e) => setA2aRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>প্রাপক:</span>
                    <strong className="text-slate-200">shurjoPay Merchant Settlement Escrow</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ব্যাংক গেটওয়ে চার্জ:</span>
                    <strong className="text-emerald-400">৳ ০.০০ (ফ্রি ডিরেক্ট ডেবিট)</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={a2aLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {a2aLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ব্যাংকের সাথে নিরাপদ সংযোগ তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>পরবর্তী ধাপে যান (২FA ওটিপি ভেরিফিকেশন)</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {a2aStep === 'otp' && (
              <form onSubmit={handleA2aVerifyOtp} className="space-y-4 text-xs">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>টু-ফ্যাক্টর অথেনটিকেশন (2FA Bank Security)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    আপনার ব্যাংক নিবন্ধিত মোবাইল নম্বরে একটি ৬ ডিজিটের ওয়ান-টাইম পাসওয়ার্ড (OTP) পাঠানো হয়েছে। 
                    (টেস্টিংয়ের জন্য যেকোনো ৬ ডিজিট যেমন <strong className="text-amber-400 font-mono">123456</strong> দিন)।
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">সিকিউর ওটিপি প্রবেশ করান</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={a2aOtp}
                    onChange={(e) => setA2aOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono tracking-widest text-lg text-center focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setA2aStep('input')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    ← ফিরে যান
                  </button>
                  <button
                    type="submit"
                    disabled={a2aLoading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {a2aLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>NPSB সুইচে লেনদেন সম্পন্ন হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>পেমেন্ট নিশ্চিত করুন (৳{a2aAmount})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Success Step */}
            {a2aStep === 'success' && a2aTxResult && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-100">ইনস্ট্যান্ট ব্যাংক ট্রান্সফার সফল হয়েছে!</h4>
                  <p className="text-emerald-400 font-bold text-xl">৳ {a2aTxResult.amount.toLocaleString()} BDT</p>
                  <p className="text-[11px] text-slate-400">
                    বাংলাদেশ ব্যাংক ন্যাশনাল পেমেন্ট সুইচে (NPSB) সরাসরি ক্লিয়ারিং সম্পন্ন হয়েছে।
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">ট্রানজ্যাকশন আইডি:</span>
                    <span className="text-amber-400 font-bold">{a2aTxResult.transactionId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">উৎস ব্যাংক:</span>
                    <span className="text-slate-200">{a2aTxResult.sourceBank}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">ক্লিয়ারিং রেফারেন্স:</span>
                    <span className="text-emerald-400">{a2aTxResult.clearingRef}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans">সময়:</span>
                    <span className="text-slate-300">{a2aTxResult.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setA2aStep('input');
                    setA2aOtp('');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl"
                >
                  আরেকটি ব্যাংক ট্রান্সফার করুন
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Features & Protocol Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>ওপেন ব্যাংকিং PIS এর বিশেষ সুবিধাসমূহ</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>কার্ডলেস পেমেন্ট:</strong> ডেবিট বা ক্রেডিট কার্ড ছাড়াই সরাসরি ব্যাংক হিসাবের ব্যালেন্স দিয়ে অনলাইন পেমেন্ট।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>তাত্ক্ষণিক সেটেলমেন্ট:</strong> টি+১ (T+1) বা টি+২ (T+2) অপেক্ষা ছাড়াই রিয়েল-টাইমে মার্চেন্টের ব্যাংক হিসাবে ফান্ড জমা।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>কমপ্লিট চার্জব্যাক সুরক্ষা:</strong> ব্যাংক টু ব্যাংক প্রমাণপত্র ও এনবিআর/বাংলাদেশ ব্যাংক ট্র্যাকারের সাথে সম্পূর্ণ সুরক্ষিত।</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>উচ্চ লেনদেন সীমা:</strong> সাধারণ এমএফএস সীমার চেয়ে বড় অঙ্কের বিটুবি (B2B) পেমেন্ট করার সুবিধা।</span>
                </li>
              </ul>
            </div>

            {/* Live Clearing Switch Map */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide font-mono">
                Clearing Architecture
              </span>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Customer Bank Account</span>
                  <span className="text-amber-400">Debit (-)</span>
                </div>
                <div className="text-center text-slate-500">↓ NPSB / Binimoy IDTP Switch ↓</div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">shurjoPay Settlement Engine</span>
                  <span className="text-emerald-400">Verified ✓</span>
                </div>
                <div className="text-center text-slate-500">↓ Core Banking Direct Post ↓</div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Merchant Business Account</span>
                  <span className="text-emerald-400">Credit (+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AIS (Account Information & Live Balance) */}
      {activeTab === 'ais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.values(aisBalances) as BankAccountBalance[]).map((acc) => {
              const bank = CONNECTED_OPEN_BANKS.find(b => b.id === acc.bankId);
              const isSelected = aisBank === acc.bankId;
              return (
                <div
                  key={acc.bankId}
                  onClick={() => setAisBank(acc.bankId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-200">{bank?.name || acc.bankId}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {acc.accountType}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] text-slate-400">ব্যবহারযোগ্য ব্যালেন্স (Available):</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      ৳ {acc.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>A/C: ••••{acc.accountNumber.slice(-4)}</span>
                    <span className="text-emerald-400 font-sans flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> লাইভ কানেক্টেড
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statement View for Selected Bank */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wide">
                  Account Information Service (AIS)
                </span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>ব্যাংক অ্যাকাউন্ট মিনি স্টেটমেন্ট ও লেনদেন হিস্ট্রি</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  অ্যাকাউন্ট টাইটেল: <strong className="text-slate-200">{aisBalances[aisBank]?.accountTitle || 'SHEIKH FARID'}</strong> • 
                  একাউন্ট নম্বর: <span className="font-mono text-amber-300">{aisBalances[aisBank]?.accountNumber}</span>
                </p>
              </div>

              <button
                onClick={handleRefreshBalance}
                disabled={aisRefreshing}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aisRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span>ব্যালেন্স রিফ্রেশ করুন</span>
              </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">তারিখ ও সময়</th>
                    <th className="py-3 px-4">লেনদেনের বিবরণ</th>
                    <th className="py-3 px-4">ক্লিয়ারিং রেফারেন্স</th>
                    <th className="py-3 px-4 text-right">পরিমাণ (BDT)</th>
                    <th className="py-3 px-4 text-right">অবশিষ্ট ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {(aisStatements[aisBank] || aisStatements['city_bank']).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{tx.description}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{tx.reference}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {tx.type === 'credit' ? (
                          <span className="text-emerald-400">+ ৳{tx.amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-rose-400">- ৳{tx.amount.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        ৳{tx.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Binimoy IDTP (বিনিময় ইন্টারঅপারেবল প্ল্যাটফর্ম) */}
      {activeTab === 'binimoy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-yellow-400 uppercase tracking-wide">
                  ICT Division &amp; Bangladesh Bank IDTP
                </span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>বিনিময় (Binimoy) ভার্চুয়াল আইডি (VID) লেনদেন</span>
                </h3>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full">
                Interoperable Switch
              </span>
            </div>

            <form onSubmit={handleBinimoySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">প্রেরকের ভার্চুয়াল আইডি (Sender VID)</label>
                <input
                  type="text"
                  value={binimoySenderVid}
                  onChange={(e) => setBinimoySenderVid(e.target.value)}
                  placeholder="যেমন: farid.tech@shurjopay"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">প্রাপকের ভার্চুয়াল আইডি (Receiver VID)</label>
                <input
                  type="text"
                  value={binimoyReceiverVid}
                  onChange={(e) => setBinimoyReceiverVid(e.target.value)}
                  placeholder="যেমন: merchant.store@citytouch"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">টাকার পরিমাণ (BDT)</label>
                  <input
                    type="number"
                    value={binimoyAmount}
                    onChange={(e) => setBinimoyAmount(Number(e.target.value))}
                    min={10}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">বিনিময় পিন (Binimoy PIN)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={binimoyPin}
                    onChange={(e) => setBinimoyPin(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-center tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">উদ্দেশ্য (Purpose of Payment)</label>
                <input
                  type="text"
                  value={binimoyPurpose}
                  onChange={(e) => setBinimoyPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={binimoyLoading}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {binimoyLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>আইডিটিপি (IDTP) সেন্ট্রাল সুইচে প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>বিনিময় ট্রান্সফার নিশ্চিত করুন (৳{binimoyAmount})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Binimoy History & Bangla QR */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>বাংলা কিউআর (Bangla QR) ও বিনিময় কিউআর</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold">EMVCo Interoperable</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="w-24 h-24 bg-white p-1.5 rounded-lg flex items-center justify-center shrink-0">
                  {/* Generated QR Placeholder */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BINIMOY%3Afype%3Ashurjopay%3Amerchant.store%40citytouch%3Aamt%3D2500"
                    alt="Bangla QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="font-bold text-white">মার্চেন্ট বাংলা কিউআর পেমেন্ট</p>
                  <p className="text-[11px] text-slate-400">
                    যেকোনো ব্যাংক অ্যাপ (Citytouch, Astha, CellFin, NexusPay) বা এমএফএস দিয়ে স্ক্যান করে পেমেন্ট করার সমন্বিত কিউআর।
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] rounded border border-amber-500/20">
                    VID: {binimoyReceiverVid}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h4 className="text-sm font-bold text-slate-100">সাম্প্রতিক বিনিময় লেনদেনের হিস্ট্রি</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {binimoyHistory.map((tx) => (
                  <div key={tx.trxId} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-bold text-[11px]">{tx.trxId}</span>
                      <span className="font-bold text-emerald-400 font-mono">৳ {tx.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>{tx.senderVid} → {tx.receiverVid}</span>
                      <span className="text-emerald-400">সফল</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Direct Debit & e-Mandate (অটো-ডেবিট রিকারিং) */}
      {activeTab === 'mandates' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-amber-400" />
                <span>ডিরেক্ট ডেবিট ও e-Mandate ম্যানেজমেন্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                গ্রাহকের ব্যাংক অ্যাকাউন্ট থেকে সাবস্ক্রিপশন, ইউটিলিটি বিল বা নিয়মিত পেমেন্ট অটো-কাটার কেন্দ্রীয় অনুমোদন ব্যবস্থা।
              </p>
            </div>

            <button
              onClick={() => setShowNewMandateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ই-ম্যান্ডেট তৈরি করুন</span>
            </button>
          </div>

          {/* Mandates Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mandates.map((m) => (
              <div key={m.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">{m.id}</span>
                    <h4 className="text-sm font-bold text-slate-100">{m.merchantName}</h4>
                    <p className="text-xs text-slate-400">{m.bankName}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    m.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {m.status === 'Active' ? 'সক্রিয় (Active)' : 'স্থগিত (Paused)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">সর্বোচ্চ সীমা (Max Cap):</span>
                    <strong className="text-amber-400 font-mono text-sm">৳ {m.maxAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">ফ্রিকোয়েন্সি:</span>
                    <span className="text-slate-200 font-semibold">{m.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">অ্যাকাউন্ট নম্বর:</span>
                    <span className="font-mono text-slate-300">••••{m.accountNumber.slice(-4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">মেয়াদ:</span>
                    <span className="text-slate-400 font-mono text-[11px]">{m.startDate} হতে {m.endDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleMandateStatus(m.id)}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {m.status === 'Active' ? 'সাময়িক স্থগিত করুন' : 'পুনরায় সক্রিয় করুন'}
                  </button>

                  <button
                    onClick={() => alert(`ম্যান্ডেট ${m.id} অনুযায়ী টেস্ট ডেবিট সফল হয়েছে!`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>টেস্ট অটো-ডেবিট রান করুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Creating New Mandate */}
          {showNewMandateModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-amber-400" />
                    <span>নতুন ডিরেক্ট ডেবিট ম্যান্ডেট নিবন্ধন</span>
                  </h3>
                  <button onClick={() => setShowNewMandateModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleCreateMandate} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">মার্চেন্ট / বিলের নাম</label>
                    <input
                      type="text"
                      value={newMandateForm.merchantName}
                      onChange={(e) => setNewMandateForm({ ...newMandateForm, merchantName: e.target.value })}
                      placeholder="যেমন: shurjoPay Cloud API Pro"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">গ্রাহকের ব্যাংক</label>
                    <select
                      value={newMandateForm.bankId}
                      onChange={(e) => setNewMandateForm({ ...newMandateForm, bankId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {CONNECTED_OPEN_BANKS.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">সর্বোচ্চ সীমা (টাকা)</label>
                      <input
                        type="number"
                        value={newMandateForm.maxAmount}
                        onChange={(e) => setNewMandateForm({ ...newMandateForm, maxAmount: Number(e.target.value) })}
                        min={500}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">ফ্রিকোয়েন্সি</label>
                      <select
                        value={newMandateForm.frequency}
                        onChange={(e) => setNewMandateForm({ ...newMandateForm, frequency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Weekly">Weekly (সাপ্তাহিক)</option>
                        <option value="Monthly">Monthly (মাসিক)</option>
                        <option value="Quarterly">Quarterly (ত্রৈমাসিক)</option>
                        <option value="Yearly">Yearly (বাৎসরিক)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewMandateModal(false)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold rounded-lg"
                    >
                      ম্যান্ডেট অনুমোদন করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Connected Banks & Network Directory */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>সংযুক্ত বাণিজ্যিক ও তফসিলি ব্যাংকসমূহ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                বাংলাদেশ ব্যাংকের NPSB ও ওপেন ব্যাংকিং গেটওয়ের সাথে সরাসরি সংযুক্ত ব্যাংক ও তাদের এপিআই লেটেন্সি স্ট্যাটাস।
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="ব্যাংক খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={bankTypeFilter}
                onChange={(e) => setBankTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">সকল ধরন</option>
                <option value="commercial">Commercial</option>
                <option value="islamic">Islamic</option>
                <option value="state_owned">State-Owned</option>
                <option value="foreign">Foreign</option>
              </select>
            </div>
          </div>

          {/* Banks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.logoColor} flex items-center justify-center font-bold text-white shadow-md text-xs`}>
                      {b.shortCode}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{b.name}</h4>
                      <p className="text-[11px] text-slate-400">{b.bnName}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {b.latencyMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">রাউটিং নম্বর:</span>
                    <strong className="font-mono text-slate-300">{b.routingNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">এপিআই প্রোটোকল:</span>
                    <span className="text-amber-400 font-mono text-[10px]">{b.apiProtocol}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {b.supportedServices.map((srv) => (
                    <span key={srv} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[9px] rounded font-mono">
                      {srv}
                    </span>
                  ))}
                  {b.binimoyEnabled && (
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[9px] rounded font-semibold">
                      বিনিময় ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Open Banking Developer API Tester */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">ওপেন ব্যাংকিং API ইন্টিগ্রেশন ও রিকোয়েস্ট কোড</h3>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                {(['nodejs', 'curl', 'python', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setApiLang(lang)}
                    className={`px-2.5 py-1 rounded font-mono transition-colors ${
                      apiLang === lang
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Switcher */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => { setApiEndpoint('pis'); setApiResponse(null); }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                  apiEndpoint === 'pis' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                POST /payments/initiate (A2A)
              </button>
              <button
                onClick={() => { setApiEndpoint('ais'); setApiResponse(null); }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                  apiEndpoint === 'ais' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                GET /accounts/balance (AIS)
              </button>
              <button
                onClick={() => { setApiEndpoint('binimoy'); setApiResponse(null); }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                  apiEndpoint === 'binimoy' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                POST /binimoy/transfer (IDTP)
              </button>
              <button
                onClick={() => { setApiEndpoint('mandate'); setApiResponse(null); }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                  apiEndpoint === 'mandate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                POST /mandates/create
              </button>
            </div>

            {/* Code Block Container */}
            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-80">
                <code>{getApiSnippet()}</code>
              </pre>

              <button
                onClick={() => handleCopy(getApiSnippet())}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-md flex items-center gap-1 transition-colors"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>কোড কপি</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">
                mTLS &amp; OAuth 2.0 Client Credentials Authentication Supported
              </span>
              <button
                onClick={handleExecuteApi}
                disabled={apiExecuting}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                {apiExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>কল পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>টেস্ট কল পাঠান (Execute API)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Live API Response Inspector */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200">লাইভ রেসপন্স কনসোল (Live Inspector)</span>
              {apiResponse && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HTTP 200 OK (ISO 20022)
                </span>
              )}
            </div>

            {apiResponse ? (
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96">
                <code>{apiResponse}</code>
              </pre>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-500 text-xs space-y-2">
                <Terminal className="w-6 h-6 mx-auto opacity-50 text-slate-400" />
                <p>বামে "টেস্ট কল পাঠান" বাটনে ক্লিক করলে রেসপন্স এখানে দেখা যাবে।</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
