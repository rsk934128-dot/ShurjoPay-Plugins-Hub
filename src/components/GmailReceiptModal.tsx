import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, FileText, Cloud, HardDrive } from 'lucide-react';
import { sendPaymentNotificationEmail } from '../services/gmailNotificationAgent';
import { uploadBackupToGoogleDrive } from '../services/googleDriveBackupAgent';

export const GmailReceiptModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [recipient, setRecipient] = useState('customer@example.com');
  const [subject, setSubject] = useState('[shurjoPay Receipt] Payment Confirmation for Order #sp6214d');
  const [amount, setAmount] = useState('1000.00');
  const [customerName, setCustomerName] = useState('Sheikh Farid');
  const [autoSaveDrive, setAutoSaveDrive] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setStatusMessage('জিমেইল এজেন্টের মাধ্যমে রসিদ প্রস্তুত ও প্রেরণ হচ্ছে...');

    try {
      const res = await sendPaymentNotificationEmail({
        to: recipient,
        orderId: 'sp6214d',
        spOrderId: 'SP_LIVE_882914',
        amount: amount,
        currency: 'BDT',
        customerName: customerName,
        customerPhone: '+880 1712-345678',
        bankTrxId: 'TXN_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        paymentMethod: 'bKash / Open Banking (A2A)',
        status: 'Successful'
      });

      if (autoSaveDrive) {
        // Simultaneously archive to Google Drive
        await uploadBackupToGoogleDrive(
          `receipt_sp6214d_${Date.now()}.json`,
          'transactions_ledger',
          {
            orderId: 'sp6214d',
            amount,
            recipient,
            customerName,
            status: 'Successful',
            dispatchedAt: new Date().toISOString()
          }
        );
      }

      setStatus('sent');
      setStatusMessage('রসিদ সফলভাবে প্রেরিত ও গুগল ড্রাইভে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1600);
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">Send Payment Receipt via Gmail Agent</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer / Recipient Email</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount (BDT)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Preview</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono space-y-1">
              <p>Dear {customerName},</p>
              <p className="text-slate-400">Your payment of BDT {amount} via shurjoPay was successfully processed.</p>
              <p className="text-slate-400">Order ID: SP-2026-99214</p>
              <p className="text-slate-400">Transaction Status: Success (Code: 1000)</p>
              <p className="text-emerald-400 pt-1">Thank you for transacting with us!</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              id="auto-drive-check"
              checked={autoSaveDrive}
              onChange={(e) => setAutoSaveDrive(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
            />
            <label htmlFor="auto-drive-check" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>গুগল ড্রাইভেও লেনদেনের কপি অটো-ব্যাকআপ সংরক্ষণ করুন</span>
            </label>
          </div>

          {statusMessage && (
            <p className={`text-xs text-center font-medium ${status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {statusMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {status === 'sending' ? (
                <span>Dispatching via Agent...</span>
              ) : status === 'sent' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Customer Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
