import { OpenBankInfo, DirectDebitMandate, BankAccountBalance, BankStatementItem } from '../types';

export const CONNECTED_OPEN_BANKS: OpenBankInfo[] = [
  {
    id: 'city_bank',
    name: 'The City Bank Ltd',
    bnName: 'দি সিটি ব্যাংক লিমিটেড',
    shortCode: 'CBL',
    routingNumber: '225272658',
    type: 'commercial',
    status: 'operational',
    latencyMs: 38,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-amber-600 to-amber-700',
    apiProtocol: 'REST / JSON',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'brac_bank',
    name: 'BRAC Bank PLC',
    bnName: 'ব্র্যাক ব্যাংক পিএলসি',
    shortCode: 'BBL',
    routingNumber: '060261358',
    type: 'commercial',
    status: 'operational',
    latencyMs: 42,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-blue-600 to-blue-700',
    apiProtocol: 'ISO 20022',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'dbbl',
    name: 'Dutch-Bangla Bank PLC',
    bnName: 'ডাচ-বাংলা ব্যাংক পিএলসি',
    shortCode: 'DBBL',
    routingNumber: '090262438',
    type: 'commercial',
    status: 'operational',
    latencyMs: 45,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-emerald-600 to-emerald-700',
    apiProtocol: 'Finacle Open API',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'ibbl',
    name: 'Islami Bank Bangladesh PLC',
    bnName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
    shortCode: 'IBBL',
    routingNumber: '125272485',
    type: 'islamic',
    status: 'operational',
    latencyMs: 49,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-green-600 to-emerald-800',
    apiProtocol: 'REST / JSON',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'ebl',
    name: 'Eastern Bank PLC',
    bnName: 'ইস্টার্ন ব্যাংক পিএলসি',
    shortCode: 'EBL',
    routingNumber: '095261456',
    type: 'commercial',
    status: 'operational',
    latencyMs: 36,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-sky-600 to-blue-800',
    apiProtocol: 'ISO 20022',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'sonali_bank',
    name: 'Sonali Bank PLC',
    bnName: 'সোনালী ব্যাংক পিএলসি',
    shortCode: 'SBL',
    routingNumber: '200262890',
    type: 'state_owned',
    status: 'operational',
    latencyMs: 62,
    supportedServices: ['A2A', 'AIS', 'PIS', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-yellow-600 to-amber-800',
    apiProtocol: 'REST / JSON',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'ucb',
    name: 'United Commercial Bank PLC',
    bnName: 'ইউনাইটেড কমার্শিয়াল ব্যাংক',
    shortCode: 'UCB',
    routingNumber: '245272102',
    type: 'commercial',
    status: 'operational',
    latencyMs: 44,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-indigo-600 to-indigo-800',
    apiProtocol: 'REST / JSON',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'mtb',
    name: 'Mutual Trust Bank PLC',
    bnName: 'মিউচুয়াল ট্রাস্ট ব্যাংক',
    shortCode: 'MTB',
    routingNumber: '145261789',
    type: 'commercial',
    status: 'operational',
    latencyMs: 41,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-purple-600 to-purple-800',
    apiProtocol: 'REST / JSON',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'prime_bank',
    name: 'Prime Bank PLC',
    bnName: 'প্রাইম ব্যাংক পিএলসি',
    shortCode: 'PBL',
    routingNumber: '170262341',
    type: 'commercial',
    status: 'operational',
    latencyMs: 40,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BINIMOY', 'BANGLA_QR'],
    logoColor: 'from-teal-600 to-teal-800',
    apiProtocol: 'ISO 20022',
    binimoyEnabled: true,
    npsbEnabled: true
  },
  {
    id: 'scb',
    name: 'Standard Chartered Bank BD',
    bnName: 'স্ট্যান্ডার্ড চার্টার্ড বাংলাদেশ',
    shortCode: 'SCB',
    routingNumber: '215261001',
    type: 'foreign',
    status: 'operational',
    latencyMs: 34,
    supportedServices: ['A2A', 'AIS', 'PIS', 'DIRECT_DEBIT', 'BANGLA_QR'],
    logoColor: 'from-cyan-600 to-blue-700',
    apiProtocol: 'ISO 20022',
    binimoyEnabled: false,
    npsbEnabled: true
  }
];

export const MOCK_BALANCES: Record<string, BankAccountBalance> = {
  city_bank: {
    bankId: 'city_bank',
    accountNumber: '1102948192001',
    accountTitle: 'SHEIKH FARID (TECH SOL)',
    currency: 'BDT',
    availableBalance: 245850.75,
    ledgerBalance: 250000.00,
    lastUpdated: new Date().toISOString(),
    accountType: 'Current'
  },
  brac_bank: {
    bankId: 'brac_bank',
    accountNumber: '1501204928174001',
    accountTitle: 'SHEIKH FARID',
    currency: 'BDT',
    availableBalance: 88420.50,
    ledgerBalance: 88420.50,
    lastUpdated: new Date().toISOString(),
    accountType: 'Savings'
  },
  dbbl: {
    bankId: 'dbbl',
    accountNumber: '1071510492819',
    accountTitle: 'FARID ENTERPRISE',
    currency: 'BDT',
    availableBalance: 512300.00,
    ledgerBalance: 515000.00,
    lastUpdated: new Date().toISOString(),
    accountType: 'Current'
  },
  ibbl: {
    bankId: 'ibbl',
    accountNumber: '2050184020193847',
    accountTitle: 'SHEIKH FARID MSA',
    currency: 'BDT',
    availableBalance: 124900.25,
    ledgerBalance: 124900.25,
    lastUpdated: new Date().toISOString(),
    accountType: 'Savings'
  }
};

export const MOCK_STATEMENTS: Record<string, BankStatementItem[]> = {
  city_bank: [
    {
      id: 'tx_cbl_01',
      date: '2026-09-16 14:32:10',
      description: 'shurjoPay Merchant Settlement Ref #SP9824',
      reference: 'NPSB-IBFT-948192',
      type: 'credit',
      amount: 45000.00,
      balanceAfter: 245850.75
    },
    {
      id: 'tx_cbl_02',
      date: '2026-09-15 19:14:05',
      description: 'Utility Bill Payment - DESCO Prepaid',
      reference: 'BILL-491028',
      type: 'debit',
      amount: 3200.00,
      balanceAfter: 200850.75
    },
    {
      id: 'tx_cbl_03',
      date: '2026-09-14 11:20:00',
      description: 'Binimoy IDTP Transfer from farid@bkash',
      reference: 'IDTP-TRX-48192',
      type: 'credit',
      amount: 15000.00,
      balanceAfter: 204050.75
    },
    {
      id: 'tx_cbl_04',
      date: '2026-09-12 09:45:12',
      description: 'Cloud Server Infrastructure AWS Billing',
      reference: 'VISA-DIRECT-491',
      type: 'debit',
      amount: 18500.00,
      balanceAfter: 189050.75
    },
    {
      id: 'tx_cbl_05',
      date: '2026-09-10 16:30:22',
      description: 'Corporate Client B2B Payout',
      reference: 'RTGS-CBL-40192',
      type: 'credit',
      amount: 120000.00,
      balanceAfter: 207550.75
    }
  ]
};

export const DEFAULT_MANDATES: DirectDebitMandate[] = [
  {
    id: 'MANDATE-DNCC-2026-01',
    merchantName: 'shurjoPay Cloud Subscription (Pro)',
    bankId: 'city_bank',
    bankName: 'The City Bank Ltd',
    accountNumber: '1102948192001',
    maxAmount: 5000,
    frequency: 'Monthly',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    status: 'Active',
    lastDeductionDate: '2026-09-01',
    lastDeductionAmount: 2500
  },
  {
    id: 'MANDATE-DESCO-9841',
    merchantName: 'DESCO Smart Meter Auto-Recharge',
    bankId: 'brac_bank',
    bankName: 'BRAC Bank PLC',
    accountNumber: '1501204928174001',
    maxAmount: 10000,
    frequency: 'Monthly',
    startDate: '2026-03-15',
    endDate: '2028-03-15',
    status: 'Active',
    lastDeductionDate: '2026-09-10',
    lastDeductionAmount: 4200
  }
];
