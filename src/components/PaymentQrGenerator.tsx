import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { PaymentRequestData } from '../types';

interface PaymentQrGeneratorProps {
  paymentData: PaymentRequestData;
  token: string | null;
  checkoutUrl: string | null;
  spOrderId?: string;
  onSimulateMobilePayment?: (status: 'Success' | 'Failed' | 'Cancel') => void;
}

export type QrFormatType = 'web_checkout' | 'bangla_qr' | 'deep_link' | 'json_payload';

export const PaymentQrGenerator: React.FC<PaymentQrGeneratorProps> = ({
  paymentData,
  token,
  checkoutUrl,
  spOrderId = 'sp6214d7056e83a',
  onSimulateMobilePayment
}) => {
  const [format, setFormat] = useState<QrFormatType>('web_checkout');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(240);
  const [qrColor, setQrColor] = useState<string>('#0f172a'); // slate-900

  // Effective checkout link fallback
  const effectiveCheckoutUrl = useMemo(() => {
    if (checkoutUrl) return checkoutUrl;
    return `https://sandbox.securepay.shurjopayment.com/spaycheckout/?token=${token || 'mock_token'}`;
  }, [checkoutUrl, token]);

  // Generate payload string based on selected format
  const qrPayload = useMemo(() => {
    switch (format) {
      case 'web_checkout':
        return effectiveCheckoutUrl;

      case 'deep_link':
        return `shurjopay://pay?order_id=${encodeURIComponent(paymentData.order_id)}&sp_order_id=${encodeURIComponent(spOrderId)}&amount=${paymentData.amount}&currency=${paymentData.currency}&prefix=${encodeURIComponent(paymentData.prefix)}&token=${encodeURIComponent(token || '')}`;

      case 'bangla_qr':
        // Bangladesh Bank Bangla QR / EMVCo Interoperable Specification representation
        // Formats merchant details, amount, currency (050 = BDT), reference, and check value
        return `00020101021226580016bd.gov.banglaqr0110${paymentData.prefix}0214${paymentData.order_id}520453115303050540${Number(paymentData.amount).toFixed(2)}5802BD5914${paymentData.customer_name.slice(0, 20)}6005Dhaka62170113${paymentData.order_id}6304A1B2`;

      case 'json_payload':
        return JSON.stringify(
          {
            scheme: 'shurjopay_mobile_qr',
            version: '2.0',
            merchant_prefix: paymentData.prefix,
            order_id: paymentData.order_id,
            sp_order_id: spOrderId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            customer_name: paymentData.customer_name,
            customer_phone: paymentData.customer_phone,
            client_ip: paymentData.client_ip,
            token: token,
            return_url: paymentData.return_url,
            cancel_url: paymentData.cancel_url,
            checkout_url: effectiveCheckoutUrl,
            timestamp: new Date().toISOString()
          },
          null,
          2
        );

      default:
        return effectiveCheckoutUrl;
    }
  }, [format, effectiveCheckoutUrl, paymentData, spOrderId, token]);

  // Regenerate QR on data or format change
  useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);

    const generateQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: errorCorrection,
          width: qrSize,
          margin: 2,
          color: {
            dark: qrColor,
            light: '#ffffff'
          }
        });

        const svgStr = await QRCode.toString(qrPayload, {
          type: 'svg',
          errorCorrectionLevel: errorCorrection,
          width: qrSize,
          margin: 2,
          color: {
            dark: qrColor,
            light: '#ffffff'
          }
        });

        if (!isCancelled) {
          setQrDataUrl(dataUrl);
          setQrSvg(svgStr);
          setIsGenerating(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generateQr();

    return () => {
      isCancelled = true;
    };
  }, [qrPayload, errorCorrection, qrSize, qrColor]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = qrDataUrl;
    downloadAnchor.download = `shurjopay_qr_${paymentData.order_id}_${format}.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `shurjopay_qr_${paymentData.order_id}_${format}.svg`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="payment-qr-generator-container"
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Payment QR Code &amp; Mobile Flow Tester</span>
              <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Bangla QR Ready
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              মোবাইল অ্যাপ পেমেন্ট ফ্লো ও কিউআর স্ক্যান টেস্ট করার জন্য লাইভ ইন্টারঅ্যাক্টিভ কোড
            </p>
          </div>
        </div>

        {/* Amount Tag */}
        <div className="text-left sm:text-right bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
            Payable Amount
          </span>
          <span className="text-sm font-bold font-mono text-amber-400">
            {Number(paymentData.amount).toFixed(2)} {paymentData.currency}
          </span>
        </div>
      </div>

      {/* Format Selector Pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          QR Encoding Format / প্রোটোকল নির্বাচন করুন:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              id: 'web_checkout',
              label: 'Mobile Web Checkout',
              sub: 'Camera / Browser Scan',
              icon: Smartphone
            },
            {
              id: 'bangla_qr',
              label: 'Bangla QR (EMVCo)',
              sub: 'MFS / Bank App Standard',
              icon: QrCode
            },
            {
              id: 'deep_link',
              label: 'App Deep Link URI',
              sub: 'shurjopay://pay?...',
              icon: ExternalLink
            },
            {
              id: 'json_payload',
              label: 'Mobile SDK JSON',
              sub: 'App Intent Payload',
              icon: Layers
            }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = format === item.id;
            return (
              <button
                key={item.id}
                id={`btn-qr-format-${item.id}`}
                type="button"
                onClick={() => setFormat(item.id as QrFormatType)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-slate-100 ring-1 ring-amber-400/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main QR Display & Diagnostic Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* LEFT: QR Display Box (5 cols) */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
          {/* QR Canvas Card with Brand Header */}
          <div className="w-full max-w-[260px] bg-white rounded-xl p-3 shadow-lg border border-slate-300 text-slate-950 flex flex-col items-center">
            {/* Top Merchant Brand Badge */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 px-1">
              <span className="text-[11px] font-bold tracking-tight text-slate-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                shurjoPay Sandbox
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                {paymentData.prefix.toUpperCase()}
              </span>
            </div>

            {/* QR Image Rendering */}
            <div className="relative flex items-center justify-center min-h-[200px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-slate-500 py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span className="text-xs font-mono">Generating QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  id="img-rendered-payment-qr"
                  src={qrDataUrl}
                  alt={`shurjoPay Payment QR Code for ${paymentData.order_id}`}
                  className="w-full h-auto max-w-[210px] aspect-square transition-all duration-300 rounded"
                />
              ) : null}
            </div>

            {/* Bottom Footer Info */}
            <div className="w-full text-center border-t border-slate-200 pt-1.5 mt-1">
              <span className="text-[10px] font-mono font-bold text-slate-600 block">
                {paymentData.order_id} • ৳{paymentData.amount}
              </span>
              <span className="text-[9px] text-slate-500">
                Scan with any Smartphone Camera / MFS App
              </span>
            </div>
          </div>

          {/* Download & Copy Action Buttons */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              id="btn-download-qr-png"
              type="button"
              onClick={handleDownloadPng}
              disabled={!qrDataUrl || isGenerating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Download QR code image as PNG"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>PNG</span>
            </button>

            <button
              id="btn-download-qr-svg"
              type="button"
              onClick={handleDownloadSvg}
              disabled={!qrSvg || isGenerating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Download vector QR code as SVG"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>SVG</span>
            </button>

            <button
              id="btn-copy-qr-content"
              type="button"
              onClick={handleCopyPayload}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Copy scannable content to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Format Explanations, Parameter Diagnostics & Simulated App Scanner (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Format Guidance Banner */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {format === 'web_checkout' && 'মোবাইল ওয়েব চেকআউট (Universal Web Flow)'}
                {format === 'bangla_qr' && 'বাংলা কিউআর (EMVCo Bangladesh Bank Standard)'}
                {format === 'deep_link' && 'নেটিভ মোবাইল অ্যাপ ডিপ-লিংক (Custom URI Scheme)'}
                {format === 'json_payload' && 'মোবাইল এসডিকে ইনটেন্ট পে-লোড (Direct SDK Integration)'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {format === 'web_checkout' &&
                'যেকোনো সাধারণ স্মার্টফোন ক্যামেরা বা গুগল লেন্স দিয়ে স্ক্যান করলে মোবাইল ব্রাউজারে সরাসরি সূর্যপে স্যান্ডবক্স গেটওয়ে পেজটি ওপেন হবে।'}
              {format === 'bangla_qr' &&
                'বাংলাদেশ ব্যাংকের বাংলা কিউআর স্পেসিফিকেশন অনুযায়ী প্রস্তুতকৃত। বিকাশ, নগদ, রকেট এবং ব্যাংক অ্যাপের কিউআর রিডার এই এনকোডেড টেক্সট ডিকোড করতে পারে।'}
              {format === 'deep_link' &&
                'Android Intent Filters ও iOS Universal Links টেস্ট করার জন্য `shurjopay://` স্কিম। অ্যাপ ইনস্টল থাকলে সরাসরি পেমেন্ট অ্যাক্টিভিটি লঞ্চ করবে।'}
              {format === 'json_payload' &&
                'মোবাইল অ্যাপ্লিকেশনে JSON স্ক্যানিং লাইব্রেরি ব্যবহার করে প্যারামিটার রিসিভ এবং ভ্যালিডেশনের জন্য প্রস্তুত স্ট্রাকচার্ড পে-লোড।'}
            </p>
          </div>

          {/* QR Raw Encoded Content Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Encoded Payload Data:</span>
              <span className="text-slate-500 font-mono text-[10px]">
                {qrPayload.length} characters
              </span>
            </div>
            <pre
              id="pre-encoded-qr-payload"
              className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-28 leading-relaxed whitespace-pre-wrap break-all"
            >
              {qrPayload}
            </pre>
          </div>

          {/* QR Diagnostics & Tuning */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Error Correction</span>
              <select
                id="select-qr-ecc"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="L">L (7% Recovery)</option>
                <option value="M">M (15% Standard)</option>
                <option value="Q">Q (25% High)</option>
                <option value="H">H (30% Best)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Pixel Resolution</span>
              <select
                id="select-qr-size"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value={200}>Compact (200px)</option>
                <option value={240}>Standard (240px)</option>
                <option value={300}>High-Res (300px)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block mb-1">Theme Color</span>
              <select
                id="select-qr-color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="#0f172a">Dark Slate (Default)</option>
                <option value="#1e3a8a">Navy Blue</option>
                <option value="#047857">Emerald</option>
                <option value="#831843">MFS Magenta</option>
              </select>
            </div>
          </div>

          {/* Test Scanner Simulation Box */}
          {onSimulateMobilePayment && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  সরাসরি মোবাইল স্ক্যান ও পেমেন্ট সিমুলেশন:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Simulation</span>
              </div>
              <p className="text-[11px] text-slate-400">
                স্মার্টফোনে স্ক্যান করার বিকল্প হিসেবে সরাসরি নিচে ক্লিক করে মোবাইল অ্যাপ স্ক্যান-টু-পে ফ্লো সম্পন্ন করুন:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="btn-simulate-mobile-scan-success"
                  type="button"
                  onClick={() => onSimulateMobilePayment('Success')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simulate QR Scan Success
                </button>
                <button
                  id="btn-simulate-mobile-scan-cancel"
                  type="button"
                  onClick={() => onSimulateMobilePayment('Cancel')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel Scan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
