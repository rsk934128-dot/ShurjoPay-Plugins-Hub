export interface PluginItem {
  id: string;
  category: 'PHP & CMS' | 'Mobile Platform' | 'Java, JavaScript & Others';
  framework: string;
  packageName: string;
  repository: string;
  repoUrl: string;
  packageUrl?: string;
  version?: string;
  popular?: boolean;
  installCommand?: string;
  language: string;
  iconName: string;
  description: string;
}

export interface ApiResponseCode {
  sl: number;
  httpCode: number | string;
  httpMessage: string;
  remarks: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface PaymentRequestData {
  prefix: string;
  currency: 'BDT' | 'USD';
  amount: number;
  order_id: string;
  discount_amount?: number;
  disc_percent?: number;
  client_ip: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_city: string;
  customer_state?: string;
  customer_postcode?: string;
  customer_country?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_country?: string;
  received_person_name?: string;
  shipping_phone_number?: string;
  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  return_url: string;
  cancel_url: string;
}

export interface VerificationResponse {
  id: number;
  order_id: string;
  currency: string;
  amount: string;
  payable_amount: string;
  discount_amount: string;
  disc_percent: number;
  recived_amount: string;
  usd_amt: string;
  usd_rate: number;
  card_holder_name: string | null;
  card_number: string | null;
  phone_no: string | null;
  bank_trx_id: string;
  invoice_no: string;
  bank_status: string;
  customer_order_id: string;
  sp_code: string;
  sp_massage: string;
  sp_message: string;
  name: string;
  email: string;
  address: string;
  city: string;
  value1?: string | null;
  value2?: string | null;
  value3?: string | null;
  value4?: string | null;
  transaction_status: 'Completed' | 'Successful' | 'Cancelled' | 'Failed' | 'Initiated';
  method: string;
  date_time: string;
}

export type OpenBankType = 'commercial' | 'islamic' | 'state_owned' | 'foreign';
export type OpenBankingService = 'A2A' | 'AIS' | 'PIS' | 'DIRECT_DEBIT' | 'BINIMOY' | 'BANGLA_QR';

export interface OpenBankInfo {
  id: string;
  name: string;
  bnName: string;
  shortCode: string;
  routingNumber: string;
  type: OpenBankType;
  status: 'operational' | 'degraded' | 'maintenance';
  latencyMs: number;
  supportedServices: OpenBankingService[];
  logoColor: string;
  apiProtocol: 'REST / JSON' | 'ISO 20022' | 'Finacle Open API';
  binimoyEnabled: boolean;
  npsbEnabled: boolean;
}

export interface BankAccountBalance {
  bankId: string;
  accountNumber: string;
  accountTitle: string;
  currency: 'BDT';
  availableBalance: number;
  ledgerBalance: number;
  lastUpdated: string;
  accountType: 'Current' | 'Savings' | 'SND' | 'Payroll';
}

export interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: 'debit' | 'credit';
  amount: number;
  balanceAfter: number;
}

export interface DirectDebitMandate {
  id: string;
  merchantName: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  maxAmount: number;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  lastDeductionDate?: string;
  lastDeductionAmount?: number;
}

export interface BinimoyTransactionRecord {
  trxId: string;
  senderVid: string;
  receiverVid: string;
  amount: number;
  fee: number;
  purpose: string;
  status: 'Successful' | 'Pending' | 'Rejected';
  timestamp: string;
  clearingRef: string;
}

export interface ApiRequestLogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  endpoint: string;
  fullUrl: string;
  method: 'POST' | 'GET';
  operationName: string;
  status: number;
  statusText: string;
  durationMs: number;
  requestHeaders: Record<string, string>;
  requestPayload: any;
  responseHeaders: Record<string, string>;
  responsePayload: any;
  curlCommand: string;
  orderId?: string;
  spOrderId?: string;
}
