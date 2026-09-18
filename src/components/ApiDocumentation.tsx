import React, { useState, useEffect, useMemo } from 'react';
import { RESPONSE_CODES_DATA } from '../data';
import { 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  ExternalLink, 
  ArrowRight, 
  Code,
  FileJson,
  Download,
  Copy,
  Check,
  Sparkles,
  SlidersHorizontal,
  Activity,
  X,
  Filter,
  Layers,
  CornerDownRight,
  Tag,
  ChevronRight,
  Hash
} from 'lucide-react';
import { PostmanExportModal } from './PostmanExportModal';
import { ApiMetricsDashboard } from './ApiMetricsDashboard';
import { ApiLatencyRealtimeChart } from './ApiLatencyRealtimeChart';
import { 
  PostmanConfig, 
  generatePostmanCollection, 
  createPostmanDataUri, 
  downloadPostmanCollectionFile,
  POSTMAN_DOCUMENTER_BASE_URL
} from '../utils/postman';
import { getCurrentSessionUser } from '../services/firebaseAuth';
import { getUserSettings } from '../services/userData';

export { POSTMAN_DOCUMENTER_BASE_URL };

interface EndpointDocItem {
  id: 'gateway_config' | 'realtime_latency' | 'get_token' | 'secret_pay' | 'verification';
  name: string;
  method?: 'POST' | 'CONFIG' | 'METRICS';
  path: string;
  summary: string;
  description: string;
  keywords: string[];
}

const ENDPOINT_DOC_ITEMS: EndpointDocItem[] = [
  {
    id: 'gateway_config',
    name: 'Gateway Configuration & Base URLs',
    method: 'CONFIG',
    path: 'https://sandbox.shurjopayment.com / engine',
    summary: 'Sandbox & Live engine URLs, Postman collection export, and credentials.',
    description: 'Sandbox testing environment and Live production engine endpoints with dynamic Postman export URLs.',
    keywords: ['sandbox', 'engine', 'live', 'production', 'base url', 'postman', 'credentials', 'prefix', 'store_id', 'export', 'store']
  },
  {
    id: 'realtime_latency',
    name: 'Live Response Latency Trends',
    method: 'METRICS',
    path: 'Telemetry / SLA Charts',
    summary: 'Real-time multi-series Recharts line chart streaming endpoint latency & benchmarks.',
    description: 'Live latency monitor with SLA benchmark target lines, P95 ceilings, and performance optimization guides.',
    keywords: ['latency', 'metrics', 'chart', 'recharts', 'benchmark', 'sla', 'p95', 'telemetry', 'reliability', 'speed', 'timeout']
  },
  {
    id: 'get_token',
    name: 'Authentication & Bearer Token',
    method: 'POST',
    path: '/api/get_token',
    summary: 'Initializes session channel and returns Bearer JWT valid for 15 minutes (900s).',
    description: 'Issues alphanumeric Bearer token required for all subsequent merchant API calls. Caches for 900 seconds.',
    keywords: ['token', 'jwt', 'auth', 'authentication', 'bearer', 'username', 'password', 'expires_in', 'get_token', '900', 'header']
  },
  {
    id: 'secret_pay',
    name: 'Payment Initiation & Checkout URL',
    method: 'POST',
    path: '/api/secret-pay',
    summary: 'Generates dynamic hosted checkout_url for cards, bKash, and Nagad.',
    description: 'Binds transaction parameters, calculates payable amounts, and returns sp_order_id and checkout_url.',
    keywords: ['secret-pay', 'secret_pay', 'checkout', 'checkout_url', 'return_url', 'cancel_url', 'order_id', 'amount', 'currency', 'bdt', 'bkash', 'nagad', 'sp_order_id', 'customer_name', 'client_ip']
  },
  {
    id: 'verification',
    name: 'Order Verification & Instant Settlement IPN',
    method: 'POST',
    path: '/api/verification',
    summary: 'Validates bank/MFS approval status, reconciliation data, and sp_code (1000 = Success).',
    description: 'Instant settlement verification endpoint returning bank_trx_id, payable amount, and customer payment details.',
    keywords: ['verification', 'verify', 'bank_trx_id', 'sp_code', '1000', 'success', 'ipn', 'reconcile', 'settlement', 'order_id']
  }
];

export const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'metrics' | 'response_codes' | 'credentials' | 'android_sdk'>('endpoints');
  const [searchQuery, setSearchQuery] = useState('');
  const [codeSearch, setCodeSearch] = useState('');

  // Current Configuration Credentials state for Postman Export
  const [isPostmanModalOpen, setIsPostmanModalOpen] = useState(false);
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>('sandbox');
  const [credentials, setCredentials] = useState({
    username: 'sp_sandbox',
    password: 'pyyk97hu&6u6',
    prefix: 'sp',
    storeId: 1,
    clientIp: '103.101.1.2'
  });
  const [quickCopiedUrl, setQuickCopiedUrl] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);

  // Sync user's saved merchant credentials if logged into Firebase Auth
  useEffect(() => {
    const sessionUser = getCurrentSessionUser();
    if (sessionUser) {
      const userSettings = getUserSettings(sessionUser.uid);
      if (environment === 'sandbox') {
        if (userSettings.sandboxUsername) {
          setCredentials((prev) => ({
            ...prev,
            username: userSettings.sandboxUsername,
            password: userSettings.sandboxPassword || prev.password,
            prefix: userSettings.sandboxPrefix || prev.prefix,
            storeId: userSettings.sandboxStoreId || sessionUser.storeId || prev.storeId,
            clientIp: userSettings.clientIp || prev.clientIp
          }));
        }
      } else {
        if (userSettings.liveUsername) {
          setCredentials((prev) => ({
            ...prev,
            username: userSettings.liveUsername || prev.username,
            password: userSettings.livePassword || prev.password,
            prefix: userSettings.livePrefix || prev.prefix,
            storeId: userSettings.liveStoreId || sessionUser.storeId || prev.storeId,
            clientIp: userSettings.clientIp || prev.clientIp
          }));
        }
      }
    }
  }, [environment]);

  const activeBaseUrl = environment === 'sandbox' 
    ? 'https://sandbox.shurjopayment.com' 
    : 'https://engine.shurjopayment.com';

  const currentPostmanConfig: PostmanConfig = {
    environment,
    baseUrl: activeBaseUrl,
    username: credentials.username,
    password: credentials.password,
    prefix: credentials.prefix,
    storeId: credentials.storeId,
    clientIp: credentials.clientIp,
    currency: 'BDT',
    amount: 100
  };

  /**
   * Constructs a Postman collection URL by appending the merchant's currently configured credentials
   * (like store ID or API key / username / prefix / environment) as query parameters to the Postman base URL.
   */
  const constructPostmanCollectionUrl = (
    baseDocUrl: string = POSTMAN_DOCUMENTER_BASE_URL,
    customParams?: {
      storeId?: string | number;
      username?: string;
      prefix?: string;
      environment?: 'sandbox' | 'live';
      clientIp?: string;
      apiKey?: string;
    }
  ): string => {
    const activeStore = customParams?.storeId !== undefined ? customParams.storeId : credentials.storeId;
    const activeUser = customParams?.username || credentials.username;
    const activeApiKey = customParams?.apiKey || credentials.username;
    const activePrefix = customParams?.prefix || credentials.prefix;
    const activeEnv = customParams?.environment || environment;
    const activeIp = customParams?.clientIp || credentials.clientIp;
    const activeBase = activeEnv === 'sandbox' 
      ? 'https://sandbox.shurjopayment.com' 
      : 'https://engine.shurjopayment.com';

    try {
      const url = new URL(baseDocUrl);
      if (activeStore !== undefined && activeStore !== '') {
        url.searchParams.set('merchant_id', String(activeStore));
        url.searchParams.set('store_id', String(activeStore));
      }
      if (activeUser) {
        url.searchParams.set('username', activeUser);
      }
      if (activeApiKey) {
        url.searchParams.set('api_key', activeApiKey);
      }
      if (activePrefix) {
        url.searchParams.set('prefix', activePrefix);
      }
      if (activeEnv) {
        url.searchParams.set('environment', activeEnv);
      }
      if (activeBase) {
        url.searchParams.set('base_url', activeBase);
      }
      if (activeIp) {
        url.searchParams.set('client_ip', activeIp);
      }
      return url.toString();
    } catch {
      const params = new URLSearchParams();
      if (activeStore !== undefined && activeStore !== '') {
        params.set('merchant_id', String(activeStore));
        params.set('store_id', String(activeStore));
      }
      if (activeUser) params.set('username', activeUser);
      if (activeApiKey) params.set('api_key', activeApiKey);
      if (activePrefix) params.set('prefix', activePrefix);
      if (activeEnv) params.set('environment', activeEnv);
      if (activeBase) params.set('base_url', activeBase);
      if (activeIp) params.set('client_ip', activeIp);
      return `${baseDocUrl}?${params.toString()}`;
    }
  };

  /**
   * Builds a dynamic URL for exporting a Postman collection.
   * Leverages constructPostmanCollectionUrl to ensure seamless compatibility.
   */
  const buildDynamicPostmanExportUrl = (
    customConfig?: Partial<PostmanConfig>,
    baseDocUrl: string = POSTMAN_DOCUMENTER_BASE_URL
  ): string => {
    return constructPostmanCollectionUrl(baseDocUrl, {
      storeId: customConfig?.storeId ?? credentials.storeId,
      username: customConfig?.username ?? credentials.username,
      apiKey: customConfig?.username ?? credentials.username,
      prefix: customConfig?.prefix ?? credentials.prefix,
      environment: customConfig?.environment ?? environment,
      clientIp: customConfig?.clientIp ?? credentials.clientIp
    });
  };

  const [postmanExportNotice, setPostmanExportNotice] = useState<string | null>(null);

  /**
   * Visible action handler to trigger Postman export using the constructed dynamic URL.
   */
  const handleExportToPostman = () => {
    const postmanUrl = constructPostmanCollectionUrl();
    
    // Copy URL with credentials to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postmanUrl).catch(() => {});
    }

    // Open pre-populated Postman collection link directly in a new window/tab
    if (typeof window !== 'undefined') {
      window.open(postmanUrl, '_blank', 'noopener,noreferrer');
    }

    // Also open the export modal for collection download & JSON export
    setIsPostmanModalOpen(true);

    setPostmanExportNotice(`Exported Postman Collection with Store ID #${credentials.storeId} & credentials appended!`);
    setTimeout(() => setPostmanExportNotice(null), 4000);
  };

  const handleCopyDocumenterUrl = async () => {
    const docUrl = buildDynamicPostmanExportUrl();
    try {
      await navigator.clipboard.writeText(docUrl);
      setCopiedDocUrl(true);
      setTimeout(() => setCopiedDocUrl(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = docUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedDocUrl(true);
      setTimeout(() => setCopiedDocUrl(false), 2500);
    }
  };

  const handleQuickCopyPostmanUrl = async () => {
    const col = generatePostmanCollection(currentPostmanConfig);
    const uri = createPostmanDataUri(col);
    try {
      await navigator.clipboard.writeText(uri);
      setQuickCopiedUrl(true);
      setTimeout(() => setQuickCopiedUrl(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = uri;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setQuickCopiedUrl(true);
      setTimeout(() => setQuickCopiedUrl(false), 2500);
    }
  };

  const handleQuickDownloadJson = () => {
    const col = generatePostmanCollection(currentPostmanConfig);
    downloadPostmanCollectionFile(col, `shurjopay_v2_${environment}_collection.json`);
  };

  const handleEnvironmentToggle = (env: 'sandbox' | 'live') => {
    setEnvironment(env);
    if (env === 'sandbox') {
      setCredentials({
        username: 'sp_sandbox',
        password: 'pyyk97hu&6u6',
        prefix: 'sp',
        storeId: 1,
        clientIp: '103.101.1.2'
      });
    } else {
      setCredentials((prev) => ({
        username: prev.username === 'sp_sandbox' ? 'merchant_live' : prev.username,
        password: prev.password === 'pyyk97hu&6u6' ? 'live_secret_key' : prev.password,
        prefix: prev.prefix,
        storeId: prev.storeId || 1,
        clientIp: prev.clientIp
      }));
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const activeCodeFilter = normalizedQuery || codeSearch.trim().toLowerCase();

  // Filtered response codes
  const filteredCodes = useMemo(() => {
    if (!activeCodeFilter) return RESPONSE_CODES_DATA;
    return RESPONSE_CODES_DATA.filter(
      (c) =>
        c.httpCode.toString().toLowerCase().includes(activeCodeFilter) ||
        c.httpMessage.toLowerCase().includes(activeCodeFilter) ||
        c.remarks.toLowerCase().includes(activeCodeFilter) ||
        c.type.toLowerCase().includes(activeCodeFilter)
    );
  }, [activeCodeFilter]);

  // Filtered endpoints
  const matchedEndpoints = useMemo(() => {
    if (!normalizedQuery) return ENDPOINT_DOC_ITEMS;
    return ENDPOINT_DOC_ITEMS.filter(
      (item) =>
        item.path.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  // Section matches
  const matchesAndroidSdk = useMemo(() => {
    if (!normalizedQuery) return true;
    const keywords = ['android', 'sdk', 'kotlin', 'aar', 'retrofit', 'proguard', 'requireddata', 'makepayment', 'listener', 'build.gradle', 'activity'];
    return keywords.some((k) => k.includes(normalizedQuery) || normalizedQuery.includes(k));
  }, [normalizedQuery]);

  const matchesMetrics = useMemo(() => {
    if (!normalizedQuery) return true;
    const keywords = ['latency', 'metrics', 'recharts', 'sla', 'benchmark', 'reliability', 'telemetry', 'ms', 'p95', 'uptime', 'pooling', 'keep-alive', 'timeout', 'graph', 'chart'];
    return keywords.some((k) => k.includes(normalizedQuery) || normalizedQuery.includes(k));
  }, [normalizedQuery]);

  const matchesCredentials = useMemo(() => {
    if (!normalizedQuery) return true;
    const keywords = ['onboarding', 'checklist', 'register', 'credentials', 'rsa', 'merchant', 'whitelist', 'contact', 'support', 'office', 'mohakhali', 'store'];
    return keywords.some((k) => k.includes(normalizedQuery) || normalizedQuery.includes(k));
  }, [normalizedQuery]);

  const sectionCounts = useMemo(() => {
    if (!normalizedQuery) {
      return {
        endpoints: ENDPOINT_DOC_ITEMS.length,
        response_codes: RESPONSE_CODES_DATA.length,
        android_sdk: 1,
        metrics: 1,
        credentials: 1,
        total: 0
      };
    }
    const epCount = matchedEndpoints.length;
    const rcCount = filteredCodes.length;
    const sdkCount = matchesAndroidSdk ? 1 : 0;
    const metCount = matchesMetrics ? 1 : 0;
    const credCount = matchesCredentials ? 1 : 0;
    return {
      endpoints: epCount,
      response_codes: rcCount,
      android_sdk: sdkCount,
      metrics: metCount,
      credentials: credCount,
      total: epCount + rcCount + sdkCount + metCount + credCount
    };
  }, [normalizedQuery, matchedEndpoints, filteredCodes, matchesAndroidSdk, matchesMetrics, matchesCredentials]);

  const isEndpointVisible = (id: 'gateway_config' | 'realtime_latency' | 'get_token' | 'secret_pay' | 'verification') => {
    if (!normalizedQuery) return true;
    return matchedEndpoints.some((ep) => ep.id === id);
  };

  const handleSelectSuggestedQuery = (query: string, targetTab?: 'endpoints' | 'metrics' | 'response_codes' | 'credentials' | 'android_sdk') => {
    setSearchQuery(query);
    setCodeSearch(query);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCodeSearch('');
  };

  return (
    <div id="api-documentation-section" className="space-y-6">
      {/* Top Search Input Bar for API Documentation & Response Codes */}
      <div id="api-doc-top-search-bar" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <input
              id="input-api-doc-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCodeSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClearSearch();
                }
              }}
              placeholder="Search documentation, endpoints (/api/get_token), Android SDK, or response codes (1000, 1002, 1064)..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                id="btn-clear-api-search"
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-10 flex items-center pr-2 text-slate-400 hover:text-slate-100 text-xs transition-colors cursor-pointer"
                title="Clear search query (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                ESC
              </span>
            </div>
          </div>

          {searchQuery && (
            <button
              id="btn-reset-filter"
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Dynamic Filter Pills / Quick Suggestions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {normalizedQuery ? (
              <>
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3 text-amber-400" />
                  <span>Filtered sections:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setActiveTab('endpoints')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === 'endpoints'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : sectionCounts.endpoints > 0
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-750'
                      : 'bg-slate-900 text-slate-500 opacity-60'
                  }`}
                >
                  <span>REST Endpoints</span>
                  <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-black/25">
                    {sectionCounts.endpoints}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('response_codes')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === 'response_codes'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : sectionCounts.response_codes > 0
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-750'
                      : 'bg-slate-900 text-slate-500 opacity-60'
                  }`}
                >
                  <span>Response Codes</span>
                  <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-black/25">
                    {sectionCounts.response_codes}
                  </span>
                </button>

                {matchesAndroidSdk && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('android_sdk')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                      activeTab === 'android_sdk'
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    <span>Android SDK</span>
                  </button>
                )}

                {matchesMetrics && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('metrics')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                      activeTab === 'metrics'
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    <span>Latency &amp; Benchmarks</span>
                  </button>
                )}

                {matchesCredentials && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('credentials')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                      activeTab === 'credentials'
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    <span>Onboarding</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Quick filter:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('1000', 'response_codes')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  1000 (Success)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('1002', 'response_codes')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  1002 (Cancelled)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('1064', 'response_codes')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  1064 (Unauthorized)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('/api/get_token', 'endpoints')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  /api/get_token
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('/api/secret-pay', 'endpoints')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  /api/secret-pay
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('/api/verification', 'endpoints')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  /api/verification
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('android', 'android_sdk')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                >
                  Android SDK
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestedQuery('latency', 'metrics')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                >
                  Latency SLA
                </button>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            {normalizedQuery ? (
              <span>
                Found <strong className="text-amber-400">{sectionCounts.total}</strong> results
              </span>
            ) : (
              <span>Type code or keyword to search</span>
            )}
          </div>
        </div>

        {/* Quick Results Instant Preview Drawer when typing */}
        {normalizedQuery && (sectionCounts.response_codes > 0 || sectionCounts.endpoints > 0) && (
          <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                Instant Match Preview:
              </span>
              <span className="text-[10px] text-slate-400">Click any result to view details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Top matching response codes (up to 3) */}
              {filteredCodes.slice(0, 3).map((code) => (
                <div
                  key={code.sl}
                  onClick={() => {
                    setActiveTab('response_codes');
                    setCodeSearch(String(code.httpCode));
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                      Code {code.httpCode}
                    </span>
                    <span className="text-xs text-slate-200 font-medium truncate">
                      {code.httpMessage}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 uppercase ${
                      code.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                      code.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                      code.type === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800/60' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {code.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 flex items-center gap-0.5">
                    <span>View code</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              ))}

              {/* Matching endpoints (up to 3) */}
              {matchedEndpoints.filter(e => e.method === 'POST').slice(0, 3).map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setActiveTab('endpoints')}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded shrink-0">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-slate-100 font-semibold truncate">
                      {ep.path}
                    </span>
                    <span className="text-xs text-slate-400 truncate hidden sm:inline">
                      - {ep.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 flex items-center gap-0.5">
                    <span>View spec</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation & Postman Export Action Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 gap-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="tab-endpoints"
            onClick={() => setActiveTab('endpoints')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'endpoints'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>RESTful API Endpoints</span>
            {normalizedQuery && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'endpoints' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {sectionCounts.endpoints}
              </span>
            )}
          </button>

          <button
            id="tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Latency &amp; Reliability Trends</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              99.9% SLA
            </span>
          </button>

          <button
            id="tab-android-sdk"
            onClick={() => setActiveTab('android_sdk')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'android_sdk'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Android V2 SDK Guide</span>
            {normalizedQuery && matchesAndroidSdk && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            id="tab-response-codes"
            onClick={() => setActiveTab('response_codes')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'response_codes'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Response Codes (1000–1068)</span>
            {normalizedQuery && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'response_codes' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {sectionCounts.response_codes}
              </span>
            )}
          </button>

          <button
            id="tab-credentials"
            onClick={() => setActiveTab('credentials')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Onboarding &amp; Architecture</span>
            {normalizedQuery && matchesCredentials && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Dynamic Postman Export Buttons in Header */}
        <div className="flex items-center gap-2">
          {/* Pre-populated Postman Documenter Link */}
          <a
            id="header-postman-doc-dynamic-link"
            href={buildDynamicPostmanExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700/80 shadow-sm transition-all"
            title="Open shurjoPay Postman collection pre-populated with current configuration credentials"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pre-populated Docs</span>
            <span className="sm:hidden">Docs Link</span>
          </a>

          {/* Visible Export to Postman Button */}
          <button
            id="header-export-postman-btn"
            onClick={handleExportToPostman}
            className="px-3.5 py-1.5 bg-[#FF6C37] hover:bg-[#ff581c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#FF6C37]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Construct and export a Postman collection based on current credentials"
          >
            <span className="text-sm">🚀</span>
            <span>Export to Postman</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-bold">v2.1</span>
          </button>
        </div>
      </div>

      {/* Postman Export Notification Toast / Feedback */}
      {postmanExportNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{postmanExportNotice}</span>
          </div>
          <button
            onClick={() => setPostmanExportNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-0.5 rounded hover:bg-emerald-500/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* ENDPOINTS TAB */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          {/* Fallback when search has no matching endpoints */}
          {normalizedQuery && !isEndpointVisible('gateway_config') && !isEndpointVisible('realtime_latency') && !isEndpointVisible('get_token') && !isEndpointVisible('secret_pay') && !isEndpointVisible('verification') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                No REST endpoints match "{searchQuery}"
              </h4>
              {sectionCounts.response_codes > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Found <strong className="text-amber-400">{sectionCounts.response_codes}</strong> matching response code(s) in the Response Codes reference.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('response_codes')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>View {sectionCounts.response_codes} Response Codes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    Try searching for <code className="text-amber-300 font-mono">/api/get_token</code>, <code className="text-amber-300 font-mono">/api/secret-pay</code>, or <code className="text-amber-300 font-mono">/api/verification</code>.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Clear Search Filter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Configuration & Postman Export Banner */}
          {isEndpointVisible('gateway_config') && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 rounded-2xl p-4.5 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      Active Gateway Configuration &amp; Credentials
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      environment === 'sandbox'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {environment.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>Base URL: <code className="text-slate-200 font-mono text-[11px]">{activeBaseUrl}</code></span>
                    <span>Username: <code className="text-amber-300 font-mono text-[11px]">{credentials.username}</code></span>
                    <span>Merchant / Store ID: <code className="text-slate-300 font-mono text-[11px]">{credentials.storeId}</code></span>
                    <span>Prefix: <code className="text-slate-300 font-mono text-[11px]">{credentials.prefix}</code></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Environment Selector */}
                  <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleEnvironmentToggle('sandbox')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        environment === 'sandbox'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnvironmentToggle('live')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        environment === 'live'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Live Engine
                    </button>
                  </div>

                  {/* Direct Quick Copy URL */}
                  <button
                    id="quick-copy-postman-url"
                    onClick={handleQuickCopyPostmanUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700/80 transition-colors"
                    title="Copy Postman collection data URL to clipboard for direct import"
                  >
                    {quickCopiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">URL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Collection URL</span>
                      </>
                    )}
                  </button>

                  {/* Primary Export to Postman Button */}
                  <button
                    id="endpoints-export-postman-btn"
                    onClick={handleExportToPostman}
                    className="px-3.5 py-1.5 bg-[#FF6C37] hover:bg-[#ff581c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#FF6C37]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    title="Construct Postman collection URL with current credentials and export"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Export to Postman</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Postman Documenter Link Section with Pre-populated Query Parameters */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-300 shrink-0 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    Dynamic Pre-populated Postman URL:
                  </span>
                  <div className="truncate bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-[11px] text-amber-300/90 select-all flex-1">
                    {buildDynamicPostmanExportUrl()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="copy-postman-doc-url-btn"
                    type="button"
                    onClick={handleCopyDocumenterUrl}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium flex items-center gap-1.5 border border-slate-700/80 transition-colors shadow-xs"
                    title="Copy pre-populated Postman documenter link with current Merchant ID & credentials"
                  >
                    {copiedDocUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Pre-populated Link</span>
                      </>
                    )}
                  </button>

                  <a
                    id="open-postman-doc-dynamic-link"
                    href={buildDynamicPostmanExportUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Open shurjoPay Postman collection pre-populated with current Merchant ID & credentials"
                  >
                    <span>Open Postman Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time API Response Latency Trends (Recharts) */}
          {isEndpointVisible('realtime_latency') && (
            <ApiLatencyRealtimeChart onViewFullTelemetry={() => setActiveTab('metrics')} />
          )}

          {/* Base URLs */}
          {isEndpointVisible('gateway_config') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-xl p-4 transition-all ${
                environment === 'sandbox' 
                  ? 'bg-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-sm' 
                  : 'bg-slate-900 border-slate-800 opacity-80'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    Sandbox Environment
                    {environment === 'sandbox' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Active</span>
                    )}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Testing</span>
                </div>
                <code className="text-xs font-mono text-slate-200 block bg-slate-950 p-2 rounded border border-slate-800/80">
                  https://sandbox.shurjopayment.com
                </code>
              </div>

              <div className={`border rounded-xl p-4 transition-all ${
                environment === 'live' 
                  ? 'bg-slate-900/90 border-amber-500/40 ring-1 ring-amber-500/20 shadow-sm' 
                  : 'bg-slate-900 border-slate-800 opacity-80'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    Live Production Engine
                    {environment === 'live' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">Active</span>
                    )}
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">Production</span>
                </div>
                <code className="text-xs font-mono text-slate-200 block bg-slate-950 p-2 rounded border border-slate-800/80">
                  https://engine.shurjopayment.com
                </code>
              </div>
            </div>
          )}

          {/* Endpoint 1: get_token */}
          {isEndpointVisible('get_token') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-100">/api/get_token</span>
                </div>
                <span className="text-xs text-slate-400">Token Validity: 15 minutes (900 seconds)</span>
              </div>

              <p className="text-xs text-slate-400">
                Initializes session channel and returns an alphanumeric token with <code className="text-amber-300 font-mono">token_type: "Bearer"</code>, which must be passed in the Authorization header for all subsequent calls.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Request Body (JSON):</p>
                  <pre className="text-slate-300">
{`{
  "username": "sp_sandbox",
  "password": "pyyk97hu&6u6"
}`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Response (JSON):</p>
                  <pre className="text-emerald-400">
{`{
  "token": "eyJ0eXAiOiJKV1QiLC...",
  "store_id": 1,
  "execute_url": "https://sandbox.../api/secret-pay",
  "token_type": "Bearer",
  "sp_code": "200",
  "message": "Ok",
  "expires_in": 900
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint 2: secret-pay */}
          {isEndpointVisible('secret_pay') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-100">/api/secret-pay</span>
                </div>
                <span className="text-xs text-amber-400 font-mono">Header: Bearer &lt;TOKEN&gt;</span>
              </div>

              <p className="text-xs text-slate-400">
                Generates a dynamic <code className="text-amber-300 font-mono">checkout_url</code> for the customer to finalize their payment via card, bKash, Nagad, or Internet banking. Returns an internal <code className="text-amber-300 font-mono">sp_order_id</code> that must be retained.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Request Body Parameters:</p>
                  <pre className="text-slate-300 text-[11px] leading-relaxed">
{`{
  "prefix": "sp",
  "token": "<BEARER TOKEN>",
  "return_url": "https://merchant.com/response",
  "cancel_url": "https://merchant.com/cancel",
  "store_id": 1,
  "amount": 100,
  "order_id": "ORD_99421",
  "currency": "BDT",
  "customer_name": "Maharab Kibria",
  "customer_address": "Dhaka",
  "customer_phone": "01766615677",
  "customer_city": "Dhaka",
  "client_ip": "103.101.1.2"
}`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Response (JSON):</p>
                  <pre className="text-emerald-400 text-[11px] leading-relaxed">
{`{
  "checkout_url": "https://sandbox.securepay...",
  "amount": "100",
  "currency": "BDT",
  "sp_order_id": "sp6214d7056e83a",
  "customer_order_id": "ORD_99421",
  "intent": "sale",
  "transactionStatus": "Initiated"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint 3: verification */}
          {isEndpointVisible('verification') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-100">/api/verification</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono">Header: Bearer &lt;TOKEN&gt;</span>
              </div>

              <p className="text-xs text-slate-400">
                Validates whether the transaction was approved by bank/MFS. Returns complete reconciliation records including <code className="text-amber-300 font-mono">bank_trx_id</code>, <code className="text-amber-300 font-mono">sp_code (1000 = Success)</code>, payable amount, and customer details.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Verification Request:</p>
                  <pre className="text-slate-300">
{`{
  "order_id": "sp6405c8f848b27"
}`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-sans text-slate-400 mb-1.5 font-semibold">Verification Response:</p>
                  <pre className="text-emerald-400 text-[11px]">
{`[
  {
    "id": 1109600,
    "order_id": "sp6405c8f848b27",
    "sp_code": "1000",
    "sp_message": "Success",
    "bank_trx_id": "TXN9218204",
    "amount": "100.0000",
    "currency": "BDT",
    "method": "bKash"
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE LATENCY & RELIABILITY METRICS TAB (RECHARTS) */}
      {activeTab === 'metrics' && (
        <ApiMetricsDashboard onSelectEndpoint={() => setActiveTab('endpoints')} />
      )}

      {/* ANDROID SDK GUIDE TAB */}
      {activeTab === 'android_sdk' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-400" />
              shurjoPay V2 Android SDK Integration (v2.0)
            </h3>
            <p className="text-xs text-slate-400">
              The shurjoMukhi V2 Android SDK allows native Android apps to launch checkout dialogues and receive asynchronous payment callbacks.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. Dependencies (app/build.gradle)
              </h4>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300">
                <pre>{`implementation files('libs/sdk-v2-release.aar')
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'`}</pre>
              </div>

              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pt-2">
                2. ProGuard Configuration (proguard-rules.pro)
              </h4>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                <code>-keep class com.shurjopay.sdk.v2.model.* &#123;*;&#125;</code>
              </div>

              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pt-2">
                3. Kotlin RequiredData &amp; makePayment Call
              </h4>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre>{`val data = RequiredData(
    "paypointDigital",     // username
    "paypsy6q#jm#5jx5",    // password
    "PPD",                 // prefix
    "BDT",                 // currency
    1000.0,                // amount
    "PPD123456",           // order id
    null, null,            // discount amount & percentage
    "Mr. X",               // customer name
    "0123456789",          // customer phone number
    "x@y.com",             // customer email
    "Mohakhali, Dhaka",    // customer address
    "Dhaka", "Dhaka",      // city, state
    "1212", "Bangladesh",  // post code, country
    null, null, null, null // value 1, 2, 3, 4
)

ShurjoPaySDK.instance?.makePayment(
    this, // Activity context
    Constants.SDK_TYPE_TEST, // SDK_TYPE_TEST or SDK_TYPE_LIVE
    data,
    object : PaymentResultListener {
        override fun onSuccess(transactionInfo: TransactionInfo?) {
            Toast.makeText(this@MainActivity, transactionInfo.toString(), Toast.LENGTH_SHORT).show()
        }
        override fun onFailed(message: String?) {
            Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
        }
    }
)`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSE CODES TAB */}
      {activeTab === 'response_codes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>shurjoPay Error &amp; Status Reference</span>
                {activeCodeFilter && (
                  <span className="text-[11px] font-normal text-amber-400 font-mono">
                    ({filteredCodes.length} match{filteredCodes.length === 1 ? '' : 'es'})
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">All status and failure codes returned in <code className="text-amber-400">sp_code</code></p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery || codeSearch}
                onChange={(e) => {
                  setCodeSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Filter code e.g. 1000, 1002, 1064..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              {(searchQuery || codeSearch) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Description / Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map((c) => (
                      <tr key={c.sl} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-400">{c.httpCode}</td>
                        <td className="py-3 px-4 text-slate-200 font-sans font-medium">{c.httpMessage}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            c.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            c.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            c.type === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {c.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{c.remarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                        <p className="text-sm font-medium text-slate-300">No response codes matched "{activeCodeFilter}"</p>
                        <p className="text-xs text-slate-500 mt-1">Try searching by numeric code (1000, 1002, 1064) or keyword (e.g., success, cancel, pin, timeout).</p>
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Clear Filter
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS & ONBOARDING TAB */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Merchant Onboarding Checklist
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 font-bold">1</span>
                <span><strong>Register as Merchant:</strong> Submit business documents to shurjoMukhi key customer manager.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 font-bold">2</span>
                <span><strong>Receive Credentials:</strong> Obtain Merchant ID, Password, and RSA Public Key via secure onboarding email.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 font-bold">3</span>
                <span><strong>Configure Stores:</strong> Manage up to 4 custom stores and white-listed server IPs via the merchant portal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 font-bold">4</span>
                <span><strong>Integrate API &amp; Test Sandbox:</strong> Run end-to-end payment simulations prior to requesting live keys.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                shurjoPay Gateway Support &amp; Office (Reference)
              </span>
              <button
                type="button"
                onClick={() => setIsPostmanModalOpen(true)}
                className="px-2.5 py-1 bg-[#FF6C37]/10 hover:bg-[#FF6C37]/20 text-[#FF6C37] border border-[#FF6C37]/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <FileJson className="w-3 h-3" />
                Export to Postman
              </button>
            </h3>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-normal">
                <strong>Important Note:</strong> This Developer Hub is an independent developer concept &amp; proposal prototype created to demonstrate modern developer tooling for shurjoPay merchants. For actual production merchant account opening or commercial inquiries, contact shurjoMukhi Ltd. directly below.
              </div>
              <p className="text-slate-200 font-medium">Gateway Operator: shurjoMukhi Limited (shurjoPay)</p>
              <p>Head Office: Haque Tower (10th Floor), JA-28/8/D, Mohakhali C/A, Dhaka-1212, Bangladesh</p>
              <p>
                Website &amp; Support: <a href="https://shurjopay.com.bd/#contacts" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">shurjopay.com.bd</a>
              </p>
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Postman Pre-populated Link:</span>
                  <a
                    id="support-postman-prepopulated-link"
                    href={buildDynamicPostmanExportUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Open Pre-populated Collection</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Export JSON / Data URI:</span>
                  <button
                    type="button"
                    onClick={() => setIsPostmanModalOpen(true)}
                    className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                  >
                    <span>Open Postman Exporter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Postman Export Modal */}
      <PostmanExportModal
        isOpen={isPostmanModalOpen}
        onClose={() => setIsPostmanModalOpen(false)}
        initialConfig={currentPostmanConfig}
        dynamicDocumenterUrl={buildDynamicPostmanExportUrl(currentPostmanConfig)}
      />
    </div>
  );
};
