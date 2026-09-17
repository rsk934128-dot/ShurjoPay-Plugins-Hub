import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Code2,
  FileJson,
  ListOrdered,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { ApiRequestLogEntry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ApiRequestLogConsoleProps {
  logs: ApiRequestLogEntry[];
  onClearLogs: () => void;
  onSelectLog?: (log: ApiRequestLogEntry) => void;
}

export const ApiRequestLogConsole: React.FC<ApiRequestLogConsoleProps> = ({
  logs,
  onClearLogs,
  onSelectLog
}) => {
  const { isDark } = useTheme();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'headers' | 'curl'>('request');
  const [filterEndpoint, setFilterEndpoint] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isFormattedView, setIsFormattedView] = useState<boolean>(true);

  // Filtered log list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesEndpoint = filterEndpoint === 'all' || log.endpoint === filterEndpoint;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesEndpoint;

      const matchesSearch =
        log.endpoint.toLowerCase().includes(q) ||
        log.operationName.toLowerCase().includes(q) ||
        (log.orderId && log.orderId.toLowerCase().includes(q)) ||
        (log.spOrderId && log.spOrderId.toLowerCase().includes(q)) ||
        log.status.toString().includes(q) ||
        JSON.stringify(log.requestPayload).toLowerCase().includes(q) ||
        JSON.stringify(log.responsePayload).toLowerCase().includes(q);

      return matchesEndpoint && matchesSearch;
    });
  }, [logs, filterEndpoint, searchQuery]);

  // Selected Log (fallback to first filtered if current selected isn't in list)
  const currentLog = useMemo(() => {
    if (selectedLogId) {
      const found = logs.find((l) => l.id === selectedLogId);
      if (found) return found;
    }
    return filteredLogs.length > 0 ? filteredLogs[0] : null;
  }, [logs, filteredLogs, selectedLogId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shurjopay_api_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      id="sandbox-api-request-log-console"
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md space-y-0 transition-all"
    >
      {/* Console Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 tracking-wide uppercase">
                <span>API Request Log &amp; Debug Console</span>
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                {logs.length} {logs.length === 1 ? 'event' : 'events'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              স্যান্ডবক্স সিমুলেশনের লাইভ JSON পে-লোড ও রেসপন্স হেডার ডিবাগার
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-export-api-logs"
            onClick={handleExportJson}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export full log history as JSON"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            id="btn-clear-api-logs"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 hover:border-rose-700 hover:text-rose-300 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear current log history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            id="btn-toggle-minimize-console"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isMinimized ? 'Expand console' : 'Minimize console'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-0">
          {/* Filter Bar */}
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-amber-400" />
                Endpoint:
              </span>
              {[
                { label: 'All Endpoints', value: 'all' },
                { label: '/api/get_token', value: '/api/get_token' },
                { label: '/api/secret-pay', value: '/api/secret-pay' },
                { label: '/api/verification', value: '/api/verification' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  id={`filter-log-endpoint-${filter.value.replace(/[^a-zA-Z0-9]/g, '_')}`}
                  onClick={() => setFilterEndpoint(filter.value)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    filterEndpoint === filter.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-api-logs"
                type="text"
                placeholder="Search payload, order ID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* LEFT PANE: Log Entries Stream (4 cols on lg) */}
            <div className="lg:col-span-4 max-h-[420px] overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800/60 text-slate-500 flex items-center justify-center mx-auto">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">কোনো লগ পাওয়া যায়নি</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    উপরের সিমুলেটর থেকে টোকেন তৈরি করুন বা চেকআউট ইনিশিয়েট করুন। প্রতিটি রিকোয়েস্টের আসল JSON পে-লোড এখানে ধরা পড়বে।
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = currentLog?.id === log.id;
                  const isSuccess = log.status >= 200 && log.status < 300;

                  return (
                    <button
                      key={log.id}
                      id={`log-item-${log.id}`}
                      onClick={() => {
                        setSelectedLogId(log.id);
                        if (onSelectLog) onSelectLog(log);
                      }}
                      className={`w-full text-left p-3 transition-colors flex flex-col gap-1.5 relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-l-4 border-amber-400 text-slate-100'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {log.method}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {log.status} {log.statusText}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {log.timeFormatted}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold truncate text-slate-200">
                          {log.endpoint}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {log.durationMs}ms
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="truncate max-w-[200px] text-slate-400">
                          {log.operationName}
                        </span>
                        {log.orderId && (
                          <span className="font-mono text-amber-400/90 font-medium">
                            {log.orderId}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* RIGHT PANE: Detailed Payload & Header Inspector (8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col bg-slate-900/50">
              {currentLog ? (
                <>
                  {/* Inspector Header & Tab Switcher */}
                  <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                        <span className="text-sky-400">{currentLog.method}</span>
                        <span>{currentLog.endpoint}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                        ({currentLog.durationMs}ms)
                      </span>
                    </div>

                    {/* Inspector Tabs */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                      <button
                        id="tab-inspect-request"
                        onClick={() => setActiveTab('request')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                          activeTab === 'request'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3 text-sky-400" />
                        <span>Request Body</span>
                      </button>

                      <button
                        id="tab-inspect-response"
                        onClick={() => setActiveTab('response')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                          activeTab === 'response'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                        <span>Response Body</span>
                      </button>

                      <button
                        id="tab-inspect-headers"
                        onClick={() => setActiveTab('headers')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                          activeTab === 'headers'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Layers className="w-3 h-3 text-amber-400" />
                        <span>Headers</span>
                      </button>

                      <button
                        id="tab-inspect-curl"
                        onClick={() => setActiveTab('curl')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                          activeTab === 'curl'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Code2 className="w-3 h-3 text-purple-400" />
                        <span>cURL</span>
                      </button>
                    </div>
                  </div>

                  {/* Inspector Body Content */}
                  <div className="p-4 flex-1 overflow-y-auto max-h-[360px] space-y-3">
                    {/* TAB 1: REQUEST BODY */}
                    {activeTab === 'request' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono">Payload format: application/json</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                              {Object.keys(currentLog.requestPayload || {}).length} fields
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              id="btn-copy-request-payload"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(currentLog.requestPayload, null, 2),
                                  'req-payload'
                                )
                              }
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors font-mono"
                            >
                              {copiedKey === 'req-payload' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Copy JSON</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <pre
                          id="pre-request-payload"
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed selection:bg-amber-500/30"
                        >
                          {JSON.stringify(currentLog.requestPayload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* TAB 2: RESPONSE BODY */}
                    {activeTab === 'response' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono">Status:</span>
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                currentLog.status >= 200 && currentLog.status < 300
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {currentLog.status} {currentLog.statusText}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              Time: {currentLog.durationMs}ms
                            </span>
                          </div>

                          <button
                            id="btn-copy-response-payload"
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(currentLog.responsePayload, null, 2),
                                'res-payload'
                              )
                            }
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors font-mono"
                          >
                            {copiedKey === 'res-payload' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-amber-400" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre
                          id="pre-response-payload"
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed selection:bg-emerald-500/30"
                        >
                          {JSON.stringify(currentLog.responsePayload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* TAB 3: HEADERS (REQ & RES) */}
                    {activeTab === 'headers' && (
                      <div className="space-y-4 text-xs">
                        {/* Request Headers */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                            <span className="flex items-center gap-1.5 text-sky-300">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              HTTP Request Headers
                            </span>
                            <button
                              id="btn-copy-req-headers"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(currentLog.requestHeaders, null, 2),
                                  'req-headers'
                                )
                              }
                              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              {copiedKey === 'req-headers' ? 'Copied!' : 'Copy Headers'}
                            </button>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <table className="w-full text-left font-mono text-[11px]">
                              <tbody>
                                {Object.entries(currentLog.requestHeaders).map(([k, v]) => (
                                  <tr key={k} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/60">
                                    <td className="py-1.5 px-3 text-amber-400/90 font-medium w-48 shrink-0">{k}</td>
                                    <td className="py-1.5 px-3 text-slate-300 break-all">{v}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Response Headers */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                            <span className="flex items-center gap-1.5 text-emerald-300">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              HTTP Response Headers (from shurjoPay Engine)
                            </span>
                            <button
                              id="btn-copy-res-headers"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(currentLog.responseHeaders, null, 2),
                                  'res-headers'
                                )
                              }
                              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              {copiedKey === 'res-headers' ? 'Copied!' : 'Copy Headers'}
                            </button>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <table className="w-full text-left font-mono text-[11px]">
                              <tbody>
                                {Object.entries(currentLog.responseHeaders).map(([k, v]) => (
                                  <tr key={k} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/60">
                                    <td className="py-1.5 px-3 text-emerald-400/90 font-medium w-48 shrink-0">{k}</td>
                                    <td className="py-1.5 px-3 text-slate-300 break-all">{v}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: CURL COMMAND */}
                    {activeTab === 'curl' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono">
                            Terminal / Command Line Debugger:
                          </span>
                          <button
                            id="btn-copy-curl-command"
                            onClick={() => handleCopy(currentLog.curlCommand, 'curl-cmd')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors font-mono"
                          >
                            {copiedKey === 'curl-cmd' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-amber-400" />
                                <span>Copy cURL</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre
                          id="pre-curl-command"
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed whitespace-pre-wrap selection:bg-purple-500/30"
                        >
                          {currentLog.curlCommand}
                        </pre>
                        <p className="text-[11px] text-slate-400">
                          💡 আপনি এই cURL কমান্ডটি সরাসরি আপনার টার্মিনাল, বাশ (Bash), অথবা Postman-এ ইম্পোর্ট করে হুবহু একই রিকোয়েস্ট টেস্ট করতে পারেন।
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  লগ নির্বাচন করুন বিস্তারিত পে-লোড এবং রেসপন্স হেডার দেখার জন্য।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
