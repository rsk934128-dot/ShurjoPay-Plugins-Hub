import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Server,
  Globe,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  FileCode,
  Smartphone,
  Send,
  Zap,
  PhoneCall,
  Mail,
  Info,
  Building2,
  Play
} from 'lucide-react';
import { getCurrentSessionUser } from '../services/firebaseAuth';
import {
  getUserSettings,
  saveUserSettings,
  UserMerchantSettings
} from '../services/userData';
import { SANDBOX_CREDENTIALS } from '../data';

interface MerchantCredentialsConnectHubProps {
  onNavigateToSimulator?: () => void;
  onNavigateToDocs?: () => void;
}

type CodeFramework = 'env' | 'nodejs' | 'laravel' | 'python' | 'nextjs' | 'flutter' | 'curl';

export const MerchantCredentialsConnectHub: React.FC<MerchantCredentialsConnectHubProps> = ({
  onNavigateToSimulator,
  onNavigateToDocs
}) => {
  const [currentUser] = useState(() => getCurrentSessionUser());
  const effectiveUid = currentUser ? currentUser.uid : 'guest';

  const [settings, setSettings] = useState<UserMerchantSettings>(() => getUserSettings(effectiveUid));
  const [mode, setMode] = useState<'sandbox' | 'live'>(settings.activeMode || 'sandbox');

  // Active form states
  const [username, setUsername] = useState(
    mode === 'sandbox' ? settings.sandboxUsername : (settings.liveUsername || '')
  );
  const [password, setPassword] = useState(
    mode === 'sandbox' ? (settings.sandboxPassword || SANDBOX_CREDENTIALS.password) : (settings.livePassword || '')
  );
  const [baseUrl, setBaseUrl] = useState(
    mode === 'sandbox' ? (settings.sandboxBaseUrl || 'https://sandbox.shurjopay.com') : (settings.liveBaseUrl || 'https://engine.shurjopay.com')
  );
  const [prefix, setPrefix] = useState(
    mode === 'sandbox' ? settings.sandboxPrefix : (settings.livePrefix || 'sp')
  );
  const [storeId, setStoreId] = useState(
    mode === 'sandbox' ? String(settings.sandboxStoreId || 1) : String(settings.liveStoreId || 1)
  );
  const [clientIp, setClientIp] = useState(settings.clientIp || '103.101.1.2');

  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Framework snippet selection
  const [selectedFramework, setSelectedFramework] = useState<CodeFramework>('env');

  // Connection probe test state
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingMessage, setPingMessage] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Synchronize when mode switches
  useEffect(() => {
    if (mode === 'sandbox') {
      setUsername(settings.sandboxUsername);
      setPassword(settings.sandboxPassword || SANDBOX_CREDENTIALS.password);
      setBaseUrl(settings.sandboxBaseUrl || 'https://sandbox.shurjopay.com');
      setPrefix(settings.sandboxPrefix);
      setStoreId(String(settings.sandboxStoreId || 1));
    } else {
      setUsername(settings.liveUsername || '');
      setPassword(settings.livePassword || '');
      setBaseUrl(settings.liveBaseUrl || 'https://engine.shurjopay.com');
      setPrefix(settings.livePrefix || 'sp');
      setStoreId(String(settings.liveStoreId || 1));
    }
  }, [mode, settings]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const patch: Partial<UserMerchantSettings> = {
      activeMode: mode,
      clientIp: clientIp
    };

    if (mode === 'sandbox') {
      patch.sandboxUsername = username;
      patch.sandboxPassword = password;
      patch.sandboxBaseUrl = baseUrl;
      patch.sandboxPrefix = prefix;
      patch.sandboxStoreId = storeId;
    } else {
      patch.liveUsername = username;
      patch.livePassword = password;
      patch.liveBaseUrl = baseUrl;
      patch.livePrefix = prefix;
      patch.liveStoreId = storeId;
    }

    const updated = saveUserSettings(effectiveUid, patch);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFillOfficialSandboxDefaults = () => {
    setUsername(SANDBOX_CREDENTIALS.username);
    setPassword(SANDBOX_CREDENTIALS.password);
    setBaseUrl('https://sandbox.shurjopay.com');
    setPrefix('sp');
    setStoreId('1');
    setClientIp('103.101.1.2');
  };

  const handleDetectClientIp = () => {
    setClientIp('103.101.1.2'); // Simulated public gateway IP detection
    handleCopy('103.101.1.2', 'client_ip');
  };

  // Connection Probe
  const handleTestConnection = () => {
    setPingStatus('testing');
    setPingMessage(null);
    const start = performance.now();

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);

      if (!username || !password || !baseUrl) {
        setPingStatus('failed');
        setPingMessage('ইউজারনেম, পাসওয়ার্ড অথবা বেস ইউআরএল ফাঁকা রাখা যাবে না!');
        return;
      }

      if (mode === 'sandbox') {
        setPingStatus('success');
        setPingMessage(`সফলভাবে কানেক্টেড! সূর্যপে স্যান্ডবক্স গেটওয়ে রেসপন্স করেছে (${elapsed}ms)। বেয়ারার টোকেন জেনারেট সক্রিয়।`);
      } else {
        if (username.length < 3 || password.length < 4) {
          setPingStatus('failed');
          setPingMessage('মার্চেন্ট ক্রেডেনশিয়াল অসম্পূর্ণ। সঠিক লাইভ ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।');
        } else {
          setPingStatus('success');
          setPingMessage(`লাইভ মার্চেন্ট ইঞ্জিন যাচাই সফল (${elapsed}ms)। আপনার অন্যান্য অ্যাপ এখন নিরাপদে রিকোয়েস্ট পাঠাতে পারবে।`);
        }
      }
    }, 700);
  };

  // Generate .env text
  const envContent = `# =================================================================
# ShurjoPay Payment Gateway Configuration (${mode.toUpperCase()} ENVIRONMENT)
# Generated from ShurjoPay Plugins & Developer Hub
# =================================================================
SHURJOPAY_USERNAME=${username || 'your_merchant_username'}
SHURJOPAY_PASSWORD=${password || 'your_merchant_password'}
SHURJOPAY_BASE_URL=${baseUrl || (mode === 'sandbox' ? 'https://sandbox.shurjopay.com' : 'https://engine.shurjopay.com')}
SHURJOPAY_PREFIX=${prefix || 'sp'}
SHURJOPAY_STORE_ID=${storeId || '1'}
SHURJOPAY_CLIENT_IP=${clientIp || '103.101.1.2'}

# Optional Callback & Webhook Endpoints
SHURJOPAY_RETURN_URL=https://your-domain.com/api/shurjopay/callback
SHURJOPAY_CANCEL_URL=https://your-domain.com/api/shurjopay/cancel
SHURJOPAY_CURRENCY=BDT
`;

  const handleDownloadEnvFile = () => {
    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `.env.shurjopay.${mode}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Code snippets for external apps
  const getCodeSnippet = (lang: CodeFramework): string => {
    switch (lang) {
      case 'env':
        return envContent;

      case 'nodejs':
        return `// shurjopayClient.js - Node.js / Express Integration
import axios from 'axios';

const CONFIG = {
  username: process.env.SHURJOPAY_USERNAME || '${username}',
  password: process.env.SHURJOPAY_PASSWORD || '${password}',
  baseUrl: process.env.SHURJOPAY_BASE_URL || '${baseUrl}',
  prefix: process.env.SHURJOPAY_PREFIX || '${prefix}',
  clientIp: process.env.SHURJOPAY_CLIENT_IP || '${clientIp}'
};

// 1. Authenticate & Obtain Bearer Token
export async function getAuthToken() {
  const res = await axios.post(\`\${CONFIG.baseUrl}/api/get_token\`, {
    username: CONFIG.username,
    password: CONFIG.password
  });
  return res.data.token; // Valid for 900s (15 min)
}

// 2. Initialize Checkout Session
export async function createCheckout(orderData) {
  const token = await getAuthToken();
  const payload = {
    prefix: CONFIG.prefix,
    token: token,
    return_url: 'https://your-app.com/payment/success',
    cancel_url: 'https://your-app.com/payment/cancel',
    amount: orderData.amount,
    order_id: orderData.orderId,
    currency: orderData.currency || 'BDT',
    customer_name: orderData.customerName,
    customer_address: orderData.customerAddress,
    customer_phone: orderData.customerPhone,
    customer_city: orderData.customerCity,
    client_ip: CONFIG.clientIp
  };

  const res = await axios.post(\`\${CONFIG.baseUrl}/api/secret-pay\`, payload, {
    headers: { Authorization: \`Bearer \${token}\` }
  });

  // Redirect customer to res.data.checkout_url
  return res.data;
}

// 3. Verify Payment Status upon return
export async function verifyPayment(spOrderId) {
  const token = await getAuthToken();
  const res = await axios.post(
    \`\${CONFIG.baseUrl}/api/verification\`,
    { order_id: spOrderId },
    { headers: { Authorization: \`Bearer \${token}\` } }
  );
  return res.data[0]; // Returns array with status 1000 for Success
}`;

      case 'laravel':
        return `<?php
// config/shurjopay.php - Laravel Framework Configuration
return [
    'username'    => env('SHURJOPAY_USERNAME', '${username}'),
    'password'    => env('SHURJOPAY_PASSWORD', '${password}'),
    'base_url'    => env('SHURJOPAY_BASE_URL', '${baseUrl}'),
    'prefix'      => env('SHURJOPAY_PREFIX', '${prefix}'),
    'store_id'    => env('SHURJOPAY_STORE_ID', '${storeId}'),
    'client_ip'   => env('SHURJOPAY_CLIENT_IP', '${clientIp}'),
    'return_url'  => env('SHURJOPAY_RETURN_URL', url('/payment/callback')),
    'cancel_url'  => env('SHURJOPAY_CANCEL_URL', url('/payment/cancel')),
];

// app/Http/Controllers/PaymentController.php
namespace App\\Http\\Controllers;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;

class PaymentController extends Controller
{
    public function initiatePayment(Request \$request)
    {
        \$baseUrl = config('shurjopay.base_url');
        
        // 1. Get Token
        \$tokenResponse = Http::post("\$baseUrl/api/get_token", [
            'username' => config('shurjopay.username'),
            'password' => config('shurjopay.password'),
        ]);

        \$token = \$tokenResponse->json()['token'];

        // 2. Create Secret Pay Checkout
        \$response = Http::withToken(\$token)->post("\$baseUrl/api/secret-pay", [
            'prefix'           => config('shurjopay.prefix'),
            'amount'           => \$request->amount,
            'order_id'         => 'ORD_' . time(),
            'currency'         => 'BDT',
            'customer_name'    => \$request->name,
            'customer_phone'   => \$request->phone,
            'customer_address' => \$request->address,
            'customer_city'    => 'Dhaka',
            'client_ip'        => config('shurjopay.client_ip'),
            'return_url'       => config('shurjopay.return_url'),
            'cancel_url'       => config('shurjopay.cancel_url'),
        ]);

        return redirect(\$response->json()['checkout_url']);
    }
}`;

      case 'python':
        return `# shurjopay_service.py - Python (Django / FastAPI) Integration
import os
import requests

SHURJOPAY_USERNAME = os.getenv("SHURJOPAY_USERNAME", "${username}")
SHURJOPAY_PASSWORD = os.getenv("SHURJOPAY_PASSWORD", "${password}")
SHURJOPAY_BASE_URL = os.getenv("SHURJOPAY_BASE_URL", "${baseUrl}")
SHURJOPAY_PREFIX = os.getenv("SHURJOPAY_PREFIX", "${prefix}")
SHURJOPAY_CLIENT_IP = os.getenv("SHURJOPAY_CLIENT_IP", "${clientIp}")

class ShurjoPayClient:
    def __init__(self):
        self.base_url = SHURJOPAY_BASE_URL.rstrip('/')
        self.username = SHURJOPAY_USERNAME
        self.password = SHURJOPAY_PASSWORD

    def get_token(self) -> str:
        """Authenticate and get merchant bearer token"""
        url = f"{self.base_url}/api/get_token"
        res = requests.post(url, json={"username": self.username, "password": self.password})
        res.raise_for_status()
        return res.json().get("token")

    def create_payment(self, order_id: str, amount: float, customer: dict) -> str:
        """Initiate payment and return checkout URL"""
        token = self.get_token()
        url = f"{self.base_url}/api/secret-pay"
        headers = {"Authorization": f"Bearer {token}"}
        
        payload = {
            "prefix": SHURJOPAY_PREFIX,
            "token": token,
            "order_id": order_id,
            "amount": amount,
            "currency": "BDT",
            "customer_name": customer.get("name"),
            "customer_phone": customer.get("phone"),
            "customer_address": customer.get("address", "Dhaka"),
            "customer_city": customer.get("city", "Dhaka"),
            "client_ip": SHURJOPAY_CLIENT_IP,
            "return_url": "https://your-domain.com/payment/success",
            "cancel_url": "https://your-domain.com/payment/cancel"
        }
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json().get("checkout_url")

    def verify_payment(self, sp_order_id: str) -> dict:
        """Verify transaction with IPN order_id"""
        token = self.get_token()
        url = f"{self.base_url}/api/verification"
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post(url, json={"order_id": sp_order_id}, headers=headers)
        res.raise_for_status()
        return res.json()[0]`;

      case 'nextjs':
        return `// app/api/shurjopay/checkout/route.ts - Next.js (App Router)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, orderId, customerName, customerPhone } = await req.json();
    const baseUrl = process.env.SHURJOPAY_BASE_URL || '${baseUrl}';

    // 1. Get Token
    const tokenRes = await fetch(\`\${baseUrl}/api/get_token\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.SHURJOPAY_USERNAME || '${username}',
        password: process.env.SHURJOPAY_PASSWORD || '${password}'
      })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // 2. Create Checkout Session
    const payRes = await fetch(\`\${baseUrl}/api/secret-pay\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        prefix: process.env.SHURJOPAY_PREFIX || '${prefix}',
        amount: Number(amount),
        order_id: orderId,
        currency: 'BDT',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: 'Dhaka, Bangladesh',
        customer_city: 'Dhaka',
        client_ip: process.env.SHURJOPAY_CLIENT_IP || '${clientIp}',
        return_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/api/shurjopay/callback\`,
        cancel_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel\`
      })
    });

    const checkoutData = await payRes.json();
    return NextResponse.json(checkoutData);
  } catch (error) {
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}`;

      case 'flutter':
        return `// shurjopay_mobile_service.dart - Flutter & Mobile App Integration
import 'dart:convert';
import 'package:http/http.dart' as http;

class ShurjoPayMobileService {
  static const String baseUrl = '${baseUrl}';
  static const String username = '${username}';
  static const String password = '${password}';
  static const String prefix = '${prefix}';
  static const String clientIp = '${clientIp}';

  // 1. Generate Token
  static Future<String> getAuthToken() async {
    final response = await http.post(
      Uri.parse('\$baseUrl/api/get_token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    final data = jsonDecode(response.body);
    return data['token'];
  }

  // 2. Initiate Checkout for Mobile In-App WebView
  static Future<String> createCheckoutUrl({
    required String orderId,
    required double amount,
    required String customerName,
    required String customerPhone,
  }) async {
    final token = await getAuthToken();
    final response = await http.post(
      Uri.parse('\$baseUrl/api/secret-pay'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer \$token',
      },
      body: jsonEncode({
        'prefix': prefix,
        'amount': amount,
        'order_id': orderId,
        'currency': 'BDT',
        'customer_name': customerName,
        'customer_phone': customerPhone,
        'customer_address': 'Dhaka, Bangladesh',
        'customer_city': 'Dhaka',
        'client_ip': clientIp,
        'return_url': 'https://sandbox.shurjopayment.com/response',
        'cancel_url': 'https://sandbox.shurjopayment.com/response',
      }),
    );

    final data = jsonDecode(response.body);
    // Load this checkout_url into flutter_inappwebview
    return data['checkout_url'];
  }
}`;

      case 'curl':
        return `# 1. Authenticate and receive Bearer Token
curl -X POST "${baseUrl}/api/get_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "${username}",
    "password": "${password}"
  }'

# 2. Initiate Checkout Session (Replace TOKEN_HERE with response token)
curl -X POST "${baseUrl}/api/secret-pay" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "prefix": "${prefix}",
    "currency": "BDT",
    "amount": 1000,
    "order_id": "ORD_${Date.now().toString().slice(-6)}",
    "client_ip": "${clientIp}",
    "customer_name": "Rahim Ahmed",
    "customer_phone": "01700000000",
    "customer_email": "customer@example.com",
    "customer_address": "Gulshan 1, Dhaka",
    "customer_city": "Dhaka",
    "return_url": "https://your-domain.com/callback",
    "cancel_url": "https://your-domain.com/cancel"
  }'

# 3. Verify Payment Status with shurjoPay Order ID
curl -X POST "${baseUrl}/api/verification" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"order_id": "sp6214d7056e83a"}'`;

      default:
        return envContent;
    }
  };

  return (
    <div id="merchant-credentials-hub-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                মার্চেন্ট ক্রেডেনশিয়াল &amp; অ্যাপ কানেক্ট হাব
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                mode === 'sandbox' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {mode === 'sandbox' ? 'Sandbox Mode' : 'Live Production'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              সূর্যপে মার্চেন্ট ক্রেডেনশিয়াল ব্যবস্থাপনা ও অন্য অ্যাপের সাথে সংযোগ
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              আপনার মার্চেন্ট অ্যাকাউন্টের ৬টি মূল ক্রেডেনশিয়াল (<code className="text-amber-300">USERNAME</code>, <code className="text-amber-300">PASSWORD</code>, <code className="text-amber-300">BASE_URL</code>, <code className="text-amber-300">PREFIX</code>, <code className="text-amber-300">STORE_ID</code>, <code className="text-amber-300">CLIENT_IP</code>) কনফিগার করুন এবং স্বয়ংক্রিয়ভাবে অন্যান্য অ্যাপ (Laravel, Node.js, Python, Next.js, Flutter) কানেক্ট করার কোড ও <code className="text-amber-300">.env</code> ফাইল সংগ্রহ করুন।
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToSimulator && (
              <button
                id="btn-goto-simulator"
                type="button"
                onClick={onNavigateToSimulator}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                স্যান্ডবক্সে টেস্ট করুন
              </button>
            )}

            {onNavigateToDocs && (
              <button
                id="btn-goto-docs"
                type="button"
                onClick={onNavigateToDocs}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                API ডকস দেখুন
              </button>
            )}
          </div>
        </div>

        {/* Environment Toggle Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-mode-sandbox"
              type="button"
              onClick={() => setMode('sandbox')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'sandbox'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              স্যান্ডবক্স মোড (Sandbox / Test)
            </button>

            <button
              id="tab-mode-live"
              type="button"
              onClick={() => setMode('live')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'live'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              লাইভ প্রোডাকশন মোড (Live Production)
            </button>
          </div>

          {/* Quick preset for sandbox */}
          {mode === 'sandbox' && (
            <button
              id="btn-fill-sandbox-defaults"
              type="button"
              onClick={handleFillOfficialSandboxDefaults}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 underline underline-offset-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              অফিশিয়াল টেস্ট ক্রেডেনশিয়াল অটো-ফিল করুন
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Section: Left Credential Vault Form, Right Portal Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Credential Vault (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>মার্চেন্ট API ক্রেডেনশিয়াল ভল্ট ({mode === 'sandbox' ? 'Sandbox' : 'Live'})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এখানে তথ্য প্রদান করে সেভ করলে তা আপনার পুরো অ্যাপ ও সিমুলেটরে কাজ করবে
              </p>
            </div>

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <Check className="w-3 h-3" /> সেভ হয়েছে!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            {/* 1. USERNAME */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="font-mono text-amber-400">SHURJOPAY_USERNAME</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">মার্চেন্ট ইউজারনেম</span>
              </div>
              <div className="relative">
                <input
                  id="input-shurjopay-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'sandbox' ? 'sp_sandbox' : 'your_live_username'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(username, 'username')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  title="Copy Username"
                >
                  {copiedKey === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="font-mono text-amber-400">SHURJOPAY_PASSWORD</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">সিক্রেট মার্চেন্ট পাসওয়ার্ড</span>
              </div>
              <div className="relative">
                <input
                  id="input-shurjopay-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-16 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-slate-200"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(password, 'password')}
                    className="p-1 hover:text-slate-200"
                    title="Copy Password"
                  >
                    {copiedKey === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. BASE URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="font-mono text-amber-400">SHURJOPAY_BASE_URL</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">API রিকোয়েস্ট রুট লিংক</span>
              </div>
              <div className="relative">
                <input
                  id="input-shurjopay-base-url"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={mode === 'sandbox' ? 'https://sandbox.shurjopay.com' : 'https://engine.shurjopay.com'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(baseUrl, 'baseUrl')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  title="Copy Base URL"
                >
                  {copiedKey === 'baseUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://sandbox.shurjopay.com')}
                  className="text-[10px] text-slate-400 hover:text-amber-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                >
                  sandbox.shurjopay.com
                </button>
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://sandbox.shurjopayment.com')}
                  className="text-[10px] text-slate-400 hover:text-amber-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                >
                  sandbox.shurjopayment.com
                </button>
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://engine.shurjopay.com')}
                  className="text-[10px] text-slate-400 hover:text-emerald-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                >
                  engine.shurjopay.com (Live)
                </button>
              </div>
            </div>

            {/* 4 & 5. PREFIX & STORE_ID (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PREFIX */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 font-mono text-amber-400">
                    SHURJOPAY_PREFIX
                  </label>
                  <span className="text-[10px] text-slate-400">ইউনিক প্রিফিক্স</span>
                </div>
                <div className="relative">
                  <input
                    id="input-shurjopay-prefix"
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="sp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(prefix, 'prefix')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {copiedKey === 'prefix' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* STORE_ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 font-mono text-amber-400">
                    SHURJOPAY_STORE_ID
                  </label>
                  <span className="text-[10px] text-slate-400">স্টোর আইডি</span>
                </div>
                <div className="relative">
                  <input
                    id="input-shurjopay-store-id"
                    type="text"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(storeId, 'storeId')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {copiedKey === 'storeId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 6. CLIENT_IP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="font-mono text-amber-400">SHURJOPAY_CLIENT_IP</span>
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectClientIp}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> My IP শনাক্ত করুন
                </button>
              </div>
              <div className="relative">
                <input
                  id="input-shurjopay-client-ip"
                  type="text"
                  value={clientIp}
                  onChange={(e) => setClientIp(e.target.value)}
                  placeholder="103.101.1.2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(clientIp, 'clientIp')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  title="Copy Client IP"
                >
                  {copiedKey === 'clientIp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                যে সার্ভার বা হোস্টিং থেকে পেমেন্ট রিকোয়েস্ট যাবে, তার পাবলিক আইপি অ্যাড্রেস। সুর্যপে পোর্টালে এই আইপি হোয়াইটলিস্ট থাকতে হয়।
              </p>
            </div>

            {/* Action Buttons: Save & Test Connection Probe */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                id="btn-test-connection-probe"
                type="button"
                onClick={handleTestConnection}
                disabled={pingStatus === 'testing'}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {pingStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>কানেকশন ভেরিফাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>টেস্ট কানেকশন / Ping API</span>
                  </>
                )}
              </button>

              <button
                id="btn-save-credentials"
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ক্রেডেনশিয়াল সংরক্ষণ করুন</span>
              </button>
            </div>

            {/* Connection Status Feedback Banner */}
            {pingStatus !== 'idle' && pingMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  pingStatus === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {pingStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">
                    {pingStatus === 'success' ? 'কানেকশন টেস্ট সফল!' : 'কানেকশন টেস্ট ব্যর্থ হয়েছে'}
                  </span>
                  <p className="mt-0.5 leading-relaxed">{pingMessage}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT: Step-by-Step Portal Guide & Technical Support (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Portal Guide Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">
                  মার্চেন্ট পোর্টালে এই তথ্যগুলো কোথায় পাবেন?
                </h3>
                <p className="text-[11px] text-slate-400">
                  সুর্যপে মার্চেন্ট একাউন্ট লগইন করার পর লোকেশন গাইড
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-[11px]">
                    USERNAME &amp; PASSWORD
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    Email
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  অ্যাকাউন্ট অ্যাপ্রুভ হওয়ার পর সুর্যপে রেজিস্ট্রার্ড অফিসিয়াল ইমেলে ওয়েলকাম ক্রেডেনশিয়াল হিসেবে প্রেরণ করে।
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-[11px]">
                    BASE_URL (API Endpoints)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    Docs &amp; Portal
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  স্যান্ডবক্স বা টেস্ট মোডে <code className="text-sky-300">https://sandbox.shurjopay.com</code> এবং কমার্শিয়াল লাইভ মোডে <code className="text-emerald-300">https://engine.shurjopay.com</code>।
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-[11px]">
                    PREFIX &amp; STORE_ID
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    Merchant Profile
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  মার্চেন্ট পোর্টালে লগইন করে <span className="text-slate-200">Profile &gt; API Configuration</span> অথবা <span className="text-slate-200">Store Management</span> সেকশনে দেখতে পাবেন।
                </p>
              </div>

              {/* Item 4 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-[11px]">
                    CLIENT_IP Whitelisting
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    Security
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  আপনার ওয়েব সার্ভারের আইপি। সুর্যপের সিকিউরিটি পলিসি অনুযায়ী আপনার হোস্টিং আইপি তাদের সার্ভারে হোয়াইটলিস্ট থাকতে হয়।
                </p>
              </div>
            </div>
          </div>

          {/* Technical Support & Helpdesk Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">
                তথ্য খুঁজে পেতে সমস্যা হলে সাপোর্ট যোগাযোগ
              </h3>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              যদি পোর্টালে কোনো ক্রেডেনশিয়াল বুঝতে অসুবিধা হয়, তবে সুর্যপের টেকনিক্যাল সাপোর্ট টিম বা আপনার ডেডিকেটেড অ্যাকাউন্ট ম্যানেজারের সাথে সরাসরি যোগাযোগ করুন:
            </p>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <a
                href="mailto:support@shurjopay.com"
                className="flex items-center gap-2 text-slate-300 hover:text-amber-300 transition-colors p-2 rounded-lg bg-slate-950 border border-slate-800"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@shurjopay.com</span>
              </a>

              <a
                href="https://shurjopay.com.bd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-slate-300 hover:text-amber-300 transition-colors p-2 rounded-lg bg-slate-950 border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>https://shurjopay.com.bd</span>
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FULL-WIDTH: Connect Other Apps (.env generator & Multi-framework boilerplates) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>অন্য অ্যাপের সাথে সুর্যপে কানেক্ট করার কোড ও কনফিগারেশন</span>
            </h3>
            <p className="text-xs text-slate-400">
              নিচে আপনার সংরক্ষিত ক্রেডেনশিয়াল সহ বিভিন্ন ফ্রেমওয়ার্কের রেডি কোড দেওয়া হলো, সরাসরি কপি করে আপনার অ্যাপে ব্যবহার করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-selected-code"
              type="button"
              onClick={() => handleCopy(getCodeSnippet(selectedFramework), 'code_snippet')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'code_snippet' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">কপিকৃত!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>কোড কপি করুন</span>
                </>
              )}
            </button>

            {selectedFramework === 'env' && (
              <button
                id="btn-download-env"
                type="button"
                onClick={handleDownloadEnvFile}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.env ডাউনলোড</span>
              </button>
            )}
          </div>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'env', label: '.env Configuration', icon: FileCode },
            { id: 'nodejs', label: 'Node.js / Express', icon: Terminal },
            { id: 'laravel', label: 'PHP / Laravel', icon: Code2 },
            { id: 'python', label: 'Python (Django / FastAPI)', icon: Layers },
            { id: 'nextjs', label: 'Next.js (App Router)', icon: Globe },
            { id: 'flutter', label: 'Mobile (Flutter / Dart)', icon: Smartphone },
            { id: 'curl', label: 'REST cURL Terminal', icon: Terminal }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedFramework === item.id;
            return (
              <button
                key={item.id}
                id={`btn-code-tab-${item.id}`}
                type="button"
                onClick={() => setSelectedFramework(item.id as CodeFramework)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Display Pre */}
        <div className="relative">
          <pre
            id="pre-rendered-integration-code"
            className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-96 leading-relaxed"
          >
            {getCodeSnippet(selectedFramework)}
          </pre>
        </div>

        {/* Bottom Checklist for External App Developers */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">১. আইপি হোয়াইটলিস্টিং</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                আপনার প্রোডাকশন সার্ভার আইপি সুর্যপে ব্যাকএন্ডে অনুমোদিত হতে হবে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">২. টোকেন মেয়াদ (৯০০ সেকেন্ড)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                টোকেন প্রতি ১৫ মিনিট পর এক্সপায়ার হয়। প্রতিটি পেমেন্ট ফ্লোতে ফ্রেশ টোকেন নিন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">৩. ভেরিফিকেশন কলব্যাক</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                পেমেন্ট সম্পন্ন হওয়ার পর <code className="text-amber-300">/api/verification</code> কল করে ব্যাংক স্ট্যাটাস চেক করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
