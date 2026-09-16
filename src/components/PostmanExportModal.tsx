import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  SlidersHorizontal, 
  CheckCircle2, 
  FileJson,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  PostmanConfig, 
  generatePostmanCollection, 
  createPostmanDataUri, 
  downloadPostmanCollectionFile 
} from '../utils/postman';

interface PostmanExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: Partial<PostmanConfig>;
  dynamicDocumenterUrl?: string;
}

export const PostmanExportModal: React.FC<PostmanExportModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  dynamicDocumenterUrl
}) => {
  const [config, setConfig] = useState<PostmanConfig>({
    environment: initialConfig?.environment || 'sandbox',
    baseUrl: initialConfig?.baseUrl || 'https://sandbox.shurjopayment.com',
    username: initialConfig?.username || 'sp_sandbox',
    password: initialConfig?.password || 'pyyk97hu&6u6',
    prefix: initialConfig?.prefix || 'sp',
    storeId: initialConfig?.storeId || 1,
    clientIp: initialConfig?.clientIp || '103.101.1.2',
    currency: initialConfig?.currency || 'BDT',
    amount: initialConfig?.amount || 100
  });

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const [previewTab, setPreviewTab] = useState<'url' | 'documenter' | 'json'>('url');

  if (!isOpen) return null;

  const currentCollection = generatePostmanCollection(config);
  const dataUri = createPostmanDataUri(currentCollection);
  const collectionJsonString = JSON.stringify(currentCollection, null, 2);

  const dynamicDocumenterLink = (() => {
    try {
      const base = dynamicDocumenterUrl?.split('?')[0] || 'https://documenter.getpostman.com/view/6335853/U16dS8ig';
      const url = new URL(base);
      url.searchParams.set('merchant_id', String(config.storeId));
      url.searchParams.set('store_id', String(config.storeId));
      url.searchParams.set('username', config.username);
      url.searchParams.set('prefix', config.prefix);
      url.searchParams.set('environment', config.environment);
      url.searchParams.set('base_url', config.baseUrl);
      url.searchParams.set('client_ip', config.clientIp);
      return url.toString();
    } catch {
      return dynamicDocumenterUrl || 'https://documenter.getpostman.com/view/6335853/U16dS8ig';
    }
  })();

  const handleCopyDocUrl = async () => {
    try {
      await navigator.clipboard.writeText(dynamicDocumenterLink);
      setCopiedDocUrl(true);
      setTimeout(() => setCopiedDocUrl(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = dynamicDocumenterLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedDocUrl(true);
      setTimeout(() => setCopiedDocUrl(false), 2500);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(dataUri);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = dataUri;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(collectionJsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const filename = `shurjopay_v2_${config.environment}_collection.json`;
    downloadPostmanCollectionFile(currentCollection, filename);
  };

  const setEnvironmentPreset = (env: 'sandbox' | 'live') => {
    if (env === 'sandbox') {
      setConfig((prev) => ({
        ...prev,
        environment: 'sandbox',
        baseUrl: 'https://sandbox.shurjopayment.com',
        username: 'sp_sandbox',
        password: 'pyyk97hu&6u6',
        prefix: 'sp',
        storeId: 1
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        environment: 'live',
        baseUrl: 'https://engine.shurjopayment.com',
        username: prev.username === 'sp_sandbox' ? 'merchant_live' : prev.username,
        password: prev.password === 'pyyk97hu&6u6' ? 'live_secret_key' : prev.password,
        prefix: prev.prefix === 'sp' ? 'sp' : prev.prefix,
        storeId: prev.storeId || 1
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="postman-export-modal"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6C37]/20 border border-[#FF6C37]/40 text-[#FF6C37] flex items-center justify-center font-black text-lg">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Export to Postman</h3>
                <span className="text-[10px] bg-[#FF6C37]/10 text-[#FF6C37] font-semibold border border-[#FF6C37]/30 px-2 py-0.5 rounded-full">
                  Collection v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dynamically constructed with your active credentials and auto-token scripts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Environment Preset Selector */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Environment:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnvironmentPreset('sandbox')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    config.environment === 'sandbox'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sandbox (Testing)
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironmentPreset('live')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    config.environment === 'live'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live (Production)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showConfigDetails ? 'Hide Credential Inputs' : 'Customize Credentials'}
            </button>
          </div>

          {/* Collapsible Credential Configuration Inputs */}
          {showConfigDetails && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Active Postman Variables Configuration
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Base URL</label>
                  <input
                    type="text"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Password</label>
                  <input
                    type="text"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={config.prefix}
                    onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Store ID</label>
                  <input
                    type="text"
                    value={config.storeId}
                    onChange={(e) => setConfig({ ...config, storeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Client IP</label>
                  <input
                    type="text"
                    value={config.clientIp}
                    onChange={(e) => setConfig({ ...config, clientIp: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Constructed Postman URL / URI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#FF6C37]" />
                Dynamically Constructed Postman Collection URL:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTab('url')}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    previewTab === 'url' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Import Link
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('documenter')}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    previewTab === 'documenter' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Pre-populated Docs URL
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('json')}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    previewTab === 'json' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  JSON Schema
                </button>
              </div>
            </div>

            {previewTab === 'url' ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      readOnly
                      value={dataUri}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 pr-20 select-all overflow-ellipsis focus:outline-none focus:border-[#FF6C37]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                      data:URI
                    </span>
                  </div>
                  <button
                    id="copy-postman-url-btn"
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-[#FF6C37] hover:bg-[#ff581c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        Copied URL!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Postman URL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste directly into Postman via <strong className="text-slate-300 font-semibold">Import &gt; Link</strong>, or use the direct download button below.
                </p>
              </div>
            ) : previewTab === 'documenter' ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      readOnly
                      value={dynamicDocumenterLink}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300/90 pr-20 select-all overflow-ellipsis focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                      Doc URL
                    </span>
                  </div>
                  <button
                    id="copy-dynamic-doc-url-btn"
                    type="button"
                    onClick={handleCopyDocUrl}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                  >
                    {copiedDocUrl ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        Copied Link!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Doc Link
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                  <span>Appends your active credentials (<code className="text-slate-300 font-mono">merchant_id={config.storeId}</code>, etc.) as query parameters.</span>
                  <a
                    href={dynamicDocumenterLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Open in browser</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="max-h-52 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
                  <pre>{collectionJsonString}</pre>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded flex items-center gap-1 transition-colors"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedJson ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="download-postman-json-btn"
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/80 transition-all shadow-sm active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download Collection File (.json)
            </button>

            <a
              href={dynamicDocumenterLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
            >
              <span>Open Pre-populated Postman Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>

          {/* How to import instructions banner */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              How to Import into Postman (Instant 2-Step Flow)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-400">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-400 block">Method 1: Postman Link / URL</span>
                <p className="text-[11px]">
                  1. Click <strong className="text-slate-300">Copy Postman URL</strong> above.
                </p>
                <p className="text-[11px]">
                  2. Open Postman &rarr; Click <strong className="text-slate-300">Import</strong> &rarr; select <strong className="text-slate-300">Link</strong> &rarr; paste the URL.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-400 block">Method 2: File Import</span>
                <p className="text-[11px]">
                  1. Click <strong className="text-slate-300">Download Collection (.json)</strong>.
                </p>
                <p className="text-[11px]">
                  2. In Postman &rarr; Click <strong className="text-slate-300">Import</strong> &rarr; Drag and drop the downloaded file.
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-emerald-400">
              <span>✨</span>
              <span>
                Includes built-in Postman Test scripts that auto-save the generated Bearer Token and Order ID into collection variables!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Config: {config.environment} ({config.username} / store #{config.storeId})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
