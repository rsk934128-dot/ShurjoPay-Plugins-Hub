import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Key, ShieldCheck, FileText, Send, Sparkles, UserCheck, HardDrive, Mail } from 'lucide-react';
import { SANDBOX_CREDENTIALS } from '../data';
import { PaymentRequestData, VerificationResponse } from '../types';
import { getCurrentSessionUser } from '../services/firebaseAuth';
import { saveUserTransaction, getUserSettings } from '../services/userData';
import { sendPaymentNotificationEmail } from '../services/gmailNotificationAgent';
import { uploadBackupToGoogleDrive } from '../services/googleDriveBackupAgent';

export const SandboxSimulator: React.FC = () => {
  const [step, setStep] = useState<'token' | 'checkout' | 'payment_gateway' | 'verification' | 'completed'>('token');
  const [credentials, setCredentials] = useState(SANDBOX_CREDENTIALS);
  const [currentUser, setCurrentUser] = useState(getCurrentSessionUser());
  const [txSavedNotice, setTxSavedNotice] = useState(false);

  useEffect(() => {
    const user = getCurrentSessionUser();
    setCurrentUser(user);
    if (user) {
      const userConfig = getUserSettings(user.uid);
      if (userConfig.sandboxUsername) {
        setCredentials({
          username: userConfig.sandboxUsername,
          password: userConfig.sandboxPassword || SANDBOX_CREDENTIALS.password
        });
      }
      if (userConfig.sandboxPrefix) {
        setPaymentForm((prev) => ({
          ...prev,
          prefix: userConfig.sandboxPrefix,
          client_ip: userConfig.clientIp || prev.client_ip
        }));
      }
    }
  }, []);
  
  // Simulated responses
  const [token, setToken] = useState<string | null>('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.sp_mock_token_sandbox_900s');
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number>(900);
  const [loading, setLoading] = useState(false);

  // Payment creation payload
  const [paymentForm, setPaymentForm] = useState<PaymentRequestData>({
    prefix: 'sp',
    currency: 'BDT',
    amount: 1000,
    order_id: `sp_${Date.now().toString().slice(-6)}`,
    client_ip: '103.101.1.2',
    customer_name: 'Maharab Kibria',
    customer_phone: '01766615677',
    customer_email: 'customer@example.com',
    customer_address: 'Mohakhali, Dhaka',
    customer_city: 'Dhaka',
    return_url: 'https://sandbox.shurjopayment.com/response',
    cancel_url: 'https://sandbox.shurjopayment.com/response',
    value1: 'Order ref #4928'
  });

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [spOrderId, setSpOrderId] = useState<string>('sp6214d7056e83a');
  const [gatewayStatus, setGatewayStatus] = useState<'Success' | 'Failed' | 'Cancel'>('Success');
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string>('Open Banking (NPSB / Binimoy)');

  // Email Notification & Drive Backup agent state
  const [emailReceiptSent, setEmailReceiptSent] = useState(false);
  const [isDispatchingAgent, setIsDispatchingAgent] = useState(false);
  const [driveBackupDone, setDriveBackupDone] = useState(false);

  const handleGenerateToken = () => {
    setLoading(true);
    setTimeout(() => {
      const generated = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      setToken(generated);
      setTokenExpiresIn(900);
      setLoading(false);
      setStep('checkout');
    }, 600);
  };

  const handleCreateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const generatedSpId = `sp${Math.random().toString(36).substring(2, 12)}`;
      setSpOrderId(generatedSpId);
      setCheckoutUrl(`https://sandbox.securepay.shurjopayment.com/spaycheckout/?token=${token}`);
      setLoading(false);
      setStep('payment_gateway');
    }, 700);
  };

  const handleProcessPayment = (status: 'Success' | 'Failed' | 'Cancel') => {
    setGatewayStatus(status);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verification');
    }, 500);
  };

  const handleVerifyPayment = () => {
    setLoading(true);
    setTimeout(() => {
      const isSuccess = gatewayStatus === 'Success';
      const isCancel = gatewayStatus === 'Cancel';

      const mockVerification: VerificationResponse = {
        id: 1109600 + Math.floor(Math.random() * 5000),
        order_id: spOrderId,
        currency: paymentForm.currency,
        amount: Number(paymentForm.amount).toFixed(4),
        payable_amount: Number(paymentForm.amount).toFixed(4),
        discount_amount: '0.0000',
        disc_percent: 0,
        recived_amount: isSuccess ? Number(paymentForm.amount).toFixed(4) : '0.0000',
        usd_amt: '0.0000',
        usd_rate: 0,
        card_holder_name: isSuccess ? paymentForm.customer_name : null,
        card_number: isSuccess ? '4532XXXXXXXX1234' : null,
        phone_no: paymentForm.customer_phone,
        bank_trx_id: isSuccess ? `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}` : '0',
        invoice_no: spOrderId,
        bank_status: isSuccess ? 'Success' : isCancel ? 'Cancel' : 'Failed',
        customer_order_id: paymentForm.order_id,
        sp_code: isSuccess ? '1000' : isCancel ? '1002' : '1001',
        sp_massage: isSuccess ? 'Success' : isCancel ? 'Cancel' : 'Failed',
        sp_message: isSuccess ? 'Success' : isCancel ? 'Cancel' : 'Failed',
        name: paymentForm.customer_name,
        email: paymentForm.customer_email,
        address: paymentForm.customer_address,
        city: paymentForm.customer_city,
        value1: paymentForm.value1,
        transaction_status: isSuccess ? 'Successful' : isCancel ? 'Cancelled' : 'Failed',
        method: isSuccess ? selectedPaymentChannel : 'N/A',
        date_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      setVerificationResult(mockVerification);
      setLoading(false);
      setStep('completed');
      setEmailReceiptSent(false);
      setDriveBackupDone(false);

      // Auto-trigger Drive Backup Agent in background for the newly created transaction
      uploadBackupToGoogleDrive(
        `shurjopay_tx_${mockVerification.customer_order_id}.json`,
        'transactions_ledger',
        mockVerification
      ).then(() => setDriveBackupDone(true)).catch(() => {});

      const activeUser = getCurrentSessionUser();
      if (activeUser) {
        saveUserTransaction(activeUser.uid, {
          id: `tx_${Date.now()}`,
          orderId: paymentForm.order_id,
          spOrderId: spOrderId,
          amount: Number(paymentForm.amount),
          currency: paymentForm.currency,
          customerName: paymentForm.customer_name,
          customerPhone: paymentForm.customer_phone,
          bankTrxId: mockVerification.bank_trx_id,
          spCode: mockVerification.sp_code,
          status: mockVerification.transaction_status,
          method: mockVerification.method,
          createdAt: new Date().toISOString()
        });
        setTxSavedNotice(true);
      }
    }, 800);
  };

  const handleReset = () => {
    setPaymentForm({
      ...paymentForm,
      order_id: `sp_${Date.now().toString().slice(-6)}`
    });
    setStep('token');
    setCheckoutUrl(null);
    setVerificationResult(null);
    setEmailReceiptSent(false);
  };

  return (
    <div id="sandbox-simulator-section" className="space-y-6">
      {/* Workflow Step Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ${
            step === 'token' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">1</span>
            Token Generation
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ${
            step === 'checkout' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">2</span>
            Secret Pay (Create Checkout)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ${
            step === 'payment_gateway' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">3</span>
            Gateway Redirection
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 ${
            step === 'verification' || step === 'completed' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px]">4</span>
            Verify Status (Callback)
          </div>
        </div>
      </div>

      {/* STEP 1: TOKEN GENERATION */}
      {step === 'token' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Step 1: Merchant Token Generation (/api/get_token)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a secure Bearer token valid for 15 minutes (900 seconds) required for all subsequent operations.
              </p>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded">
              POST /api/get_token
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sandbox Username</label>
              <input
                id="sandbox-input-username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sandbox Password</label>
              <input
                id="sandbox-input-password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Endpoint: https://sandbox.shurjopayment.com/api/get_token</span>
              <span className="text-amber-400">Content-Type: application/json</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              id="generate-token-btn"
              onClick={handleGenerateToken}
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Request Bearer Token
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CREATE CHECKOUT */}
      {step === 'checkout' && (
        <form onSubmit={handleCreateCheckout} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Step 2: Create Payment / Checkout (/api/secret-pay)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch order details, customer information, and callback redirect targets to initialize the checkout URL.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded block">
                Token Active (Bearer)
              </span>
              <span className="text-[10px] text-slate-400">Expires in 900s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prefix (Store ID tag)</label>
              <input
                type="text"
                maxLength={3}
                value={paymentForm.prefix}
                onChange={(e) => setPaymentForm({ ...paymentForm, prefix: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
              <select
                value={paymentForm.currency}
                onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value as 'BDT' | 'USD' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
              >
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                min={1}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Order ID (Unique)</label>
              <input
                type="text"
                value={paymentForm.order_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, order_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Client IP Address</label>
              <input
                type="text"
                value={paymentForm.client_ip}
                onChange={(e) => setPaymentForm({ ...paymentForm, client_ip: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                value={paymentForm.customer_name}
                onChange={(e) => setPaymentForm({ ...paymentForm, customer_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Phone (≥ 9 digits)</label>
              <input
                type="text"
                value={paymentForm.customer_phone}
                onChange={(e) => setPaymentForm({ ...paymentForm, customer_phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Email (Recommended)</label>
              <input
                type="email"
                value={paymentForm.customer_email}
                onChange={(e) => setPaymentForm({ ...paymentForm, customer_email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Address</label>
              <input
                type="text"
                value={paymentForm.customer_address}
                onChange={(e) => setPaymentForm({ ...paymentForm, customer_address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer City</label>
              <input
                type="text"
                value={paymentForm.customer_city}
                onChange={(e) => setPaymentForm({ ...paymentForm, customer_city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep('token')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← Back to Token Step
            </button>

            <button
              id="submit-secret-pay-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Calling /api/secret-pay...
                </>
              ) : (
                <>
                  Initialize Checkout <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: SIMULATED SHURJOPAY HOSTED PAYMENT GATEWAY */}
      {step === 'payment_gateway' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                Simulated Hosted Gateway Interface
              </span>
              <h3 className="text-lg font-semibold text-slate-100 mt-1.5">
                ShurjoPay Secure Checkout Page
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">shurjoPay Order ID:</span>
              <code className="text-xs font-mono text-amber-300 font-semibold">{spOrderId}</code>
            </div>
          </div>

          {/* Checkout simulated frame */}
          <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Merchant Store: Point of Sale</h4>
                <p className="text-xs text-slate-400">Order: {paymentForm.order_id}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Payable Amount:</span>
                <p className="text-lg font-bold text-amber-400">{paymentForm.amount} {paymentForm.currency}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              In production, the customer is redirected to <code className="text-amber-300 font-mono text-[11px]">{checkoutUrl}</code> to choose payment methods:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div 
                onClick={() => setSelectedPaymentChannel('bKash Direct')}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all border ${
                  selectedPaymentChannel === 'bKash Direct'
                    ? 'bg-pink-500/15 border-pink-500 text-pink-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-pink-400">bKash</span>
                <span className="text-[10px] text-slate-400">MFS Wallet</span>
              </div>

              <div 
                onClick={() => setSelectedPaymentChannel('Nagad / Rocket')}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all border ${
                  selectedPaymentChannel === 'Nagad / Rocket'
                    ? 'bg-orange-500/15 border-orange-500 text-orange-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-orange-400">Nagad / Rocket</span>
                <span className="text-[10px] text-slate-400">Postal MFS</span>
              </div>

              <div 
                onClick={() => setSelectedPaymentChannel('Visa / Mastercard')}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all border ${
                  selectedPaymentChannel === 'Visa / Mastercard'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-sky-400">Visa / Master</span>
                <span className="text-[10px] text-slate-400">Debit / Credit</span>
              </div>

              <div 
                onClick={() => setSelectedPaymentChannel('Open Banking (NPSB / Binimoy)')}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all border ${
                  selectedPaymentChannel === 'Open Banking (NPSB / Binimoy)'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="block text-xs font-bold text-amber-400">Open Banking</span>
                <span className="text-[10px] text-slate-400">NPSB &amp; Binimoy</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-xs font-medium text-slate-300 mb-2">Simulate Customer Action:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="simulate-success-btn"
                  onClick={() => handleProcessPayment('Success')}
                  disabled={loading}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Simulate Success (1000)
                </button>

                <button
                  id="simulate-cancel-btn"
                  onClick={() => handleProcessPayment('Cancel')}
                  disabled={loading}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Cancel (1002)
                </button>

                <button
                  id="simulate-fail-btn"
                  onClick={() => handleProcessPayment('Failed')}
                  disabled={loading}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Bank Decline (1001)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: VERIFICATION & FINAL STATUS */}
      {step === 'verification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Step 4: Verify Payment Status (/api/verification)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The gateway has posted back to the return URL with <code className="text-amber-300 font-mono">order_id={spOrderId}</code>. Now query the verification endpoint with the Bearer token to prevent spoofing.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>POST https://sandbox.shurjopayment.com/api/verification</span>
              <span className="text-amber-400">Authorization: Bearer {token?.slice(0, 16)}...</span>
            </div>
            <pre className="text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded">
{`{
  "order_id": "${spOrderId}"
}`}
            </pre>
          </div>

          <div className="flex justify-end">
            <button
              id="execute-verify-btn"
              onClick={handleVerifyPayment}
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Order Status...
                </>
              ) : (
                <>
                  Verify Order with ShurjoPay <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED STATE */}
      {step === 'completed' && verificationResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {verificationResult.sp_code === '1000' ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Transaction {verificationResult.sp_message} (Code: {verificationResult.sp_code})
                  </h3>
                  {txSavedNotice && (
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Saved to Account (সেভ হয়েছে)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Customer Order ID: <span className="font-mono text-slate-200">{verificationResult.customer_order_id}</span> • shurjoPay Order ID: <span className="font-mono text-slate-200">{verificationResult.order_id}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start New Test Flow
            </button>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Amount</span>
              <span className="text-sm font-semibold text-slate-100">{verificationResult.amount} {verificationResult.currency}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Bank / Trx ID</span>
              <span className="text-sm font-semibold font-mono text-slate-100">{verificationResult.bank_trx_id}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Payment Method</span>
              <span className="text-sm font-semibold text-slate-100">{verificationResult.method}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Timestamp</span>
              <span className="text-xs font-mono text-slate-300">{verificationResult.date_time}</span>
            </div>
          </div>

          {/* JSON Payload viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Verification Response Payload:</span>
              <span className="text-emerald-400 font-mono">200 OK</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-56">
              {JSON.stringify([verificationResult], null, 2)}
            </pre>
          </div>

          {/* Customer Receipt Dispatch & Drive Backup via Agent */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  অটোমেটিক জিমেইল নোটিফিকেশন এজেন্ট
                </h4>
                <p className="text-[11px] text-slate-400">
                  গ্রাহকের ইমেইলে ইনভয়েস: <span className="text-slate-300 font-mono">{verificationResult.email}</span>
                </p>
              </div>

              <button
                id="btn-dispatch-simulator-email"
                onClick={async () => {
                  setIsDispatchingAgent(true);
                  await sendPaymentNotificationEmail({
                    to: verificationResult.email,
                    orderId: verificationResult.customer_order_id,
                    spOrderId: verificationResult.order_id,
                    amount: verificationResult.amount,
                    currency: verificationResult.currency,
                    customerName: verificationResult.name,
                    customerPhone: verificationResult.phone_no,
                    bankTrxId: verificationResult.bank_trx_id,
                    paymentMethod: verificationResult.method,
                    status: verificationResult.transaction_status
                  });
                  setIsDispatchingAgent(false);
                  setEmailReceiptSent(true);
                }}
                disabled={emailReceiptSent || isDispatchingAgent}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  emailReceiptSent
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold'
                }`}
              >
                {isDispatchingAgent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> জিমেইলে পাঠানো হচ্ছে...
                  </>
                ) : emailReceiptSent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> জিমেইল রসিদ প্রেরিত
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> সেন্ড জিমেইল রসিদ
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                গুগল ড্রাইভ ব্যাকআপ: <code className="text-slate-200">shurjopay_tx_{verificationResult.customer_order_id}.json</code>
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {driveBackupDone ? 'Synced to Google Drive' : 'Auto-Sync Active'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
