import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Filter,
  Maximize2,
  AlertTriangle,
  AlertOctagon,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  SlidersHorizontal,
  Bell,
  BellRing,
  History,
  Trash2,
  Target,
  Gauge,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface EndpointBenchmarkMeta {
  key: 'getToken' | 'secretPay' | 'verification' | 'paymentStatus';
  name: string;
  method: 'POST';
  path: string;
  targetLatency: number;
  p95Latency: number;
  recommendedTimeout: string;
  retryPolicy: string;
  description: string;
  developerTip: string;
  strokeColor: string;
}

export const ENDPOINT_BENCHMARKS: EndpointBenchmarkMeta[] = [
  {
    key: 'getToken',
    name: 'Authentication & Token',
    method: 'POST',
    path: '/api/get_token',
    targetLatency: 120,
    p95Latency: 180,
    recommendedTimeout: '3000ms',
    retryPolicy: 'Max 2 retries (jittered backoff)',
    description: 'Issues 900s Bearer JWT for authorized merchant sessions.',
    developerTip: 'Cache the token in server memory/Redis for 14 minutes to avoid repeat round-trips.',
    strokeColor: '#10b981'
  },
  {
    key: 'secretPay',
    name: 'Payment Initiation',
    method: 'POST',
    path: '/api/secret-pay',
    targetLatency: 170,
    p95Latency: 240,
    recommendedTimeout: '5000ms',
    retryPolicy: 'Non-retryable without idempotent order_id',
    description: 'Binds transaction parameters and generates hosted checkout URL.',
    developerTip: 'Pass client_ip matching your whitelist and a globally unique order_id.',
    strokeColor: '#f59e0b'
  },
  {
    key: 'verification',
    name: 'Order Verification & IPN',
    method: 'POST',
    path: '/api/verification',
    targetLatency: 140,
    p95Latency: 200,
    recommendedTimeout: '4000ms',
    retryPolicy: 'Retry up to 3 times (5s, 15s, 30s)',
    description: 'Instant settlement & bank authorization verification.',
    developerTip: 'Always verify on your backend before releasing products or services.',
    strokeColor: '#0ea5e9'
  },
  {
    key: 'paymentStatus',
    name: 'Status Reconciliation',
    method: 'POST',
    path: '/api/payment-status',
    targetLatency: 130,
    p95Latency: 175,
    recommendedTimeout: '3000ms',
    retryPolicy: 'Safe to poll periodically in background',
    description: 'Query status of transactions (initiated, completed, failed).',
    developerTip: 'Ideal for background workers reconciling stranded customer sessions.',
    strokeColor: '#a855f7'
  }
];

export interface LatencyDataPoint {
  time: string;
  timestamp: number;
  getToken: number;
  secretPay: number;
  verification: number;
  paymentStatus: number;
  avgLatency: number;
}

export interface LatencyAlert {
  id: string;
  timestamp: number;
  time: string;
  endpoint: string;
  endpointPath: string;
  latency: number;
  threshold: number;
  difference: number;
  severity: 'warning' | 'critical';
}

const INITIAL_POINTS_COUNT = 16;

function generateInitialData(): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];
  const now = Date.now();
  const stepMs = 30 * 1000; // 30s intervals

  for (let i = INITIAL_POINTS_COUNT - 1; i >= 0; i--) {
    const ts = now - i * stepMs;
    const date = new Date(ts);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    const jitter = Math.sin(i * 0.7) * 12 + Math.cos(i * 0.3) * 8;
    const getToken = Math.round(112 + jitter * 0.7 + (Math.random() * 8 - 4));
    const secretPay = Math.round(162 + jitter * 1.2 + (Math.random() * 12 - 6));
    const verification = Math.round(135 + jitter * 0.9 + (Math.random() * 10 - 5));
    const paymentStatus = Math.round(124 + jitter * 0.8 + (Math.random() * 8 - 4));
    const avg = Math.round((getToken + secretPay + verification + paymentStatus) / 4);

    points.push({
      time: timeStr,
      timestamp: ts,
      getToken,
      secretPay,
      verification,
      paymentStatus,
      avgLatency: avg
    });
  }
  return points;
}

// Safe Web Audio chime for threshold alert
function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio errors silently in strict iframe sandbox
  }
}

interface ApiLatencyRealtimeChartProps {
  onViewFullTelemetry?: () => void;
}

export const ApiLatencyRealtimeChart: React.FC<ApiLatencyRealtimeChartProps> = ({
  onViewFullTelemetry
}) => {
  const { isDark } = useTheme();
  const [data, setData] = useState<LatencyDataPoint[]>(generateInitialData);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'getToken' | 'secretPay' | 'verification' | 'paymentStatus'>('all');
  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);

  // Latency alert threshold (ms)
  const [threshold, setThreshold] = useState<number>(200);
  const [activeToast, setActiveToast] = useState<LatencyAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<LatencyAlert[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [showBenchmarksOnChart, setShowBenchmarksOnChart] = useState<boolean>(true);
  const [isBestPracticesOpen, setIsBestPracticesOpen] = useState<boolean>(false);

  const toastTimerRef = useRef<any>(null);

  // Real-time tick generator (mock streaming data updates)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // If spike simulation is triggered, add high latency then cool down
      const spikeMultiplier = isSimulatingSpike ? 1.85 : 1.0;
      const noise = (Math.random() - 0.5) * 14;

      const getToken = Math.round((110 + noise * 0.8) * spikeMultiplier);
      const secretPay = Math.round((160 + noise * 1.3) * spikeMultiplier);
      const verification = Math.round((132 + noise * 1.0) * spikeMultiplier);
      const paymentStatus = Math.round((122 + noise * 0.9) * spikeMultiplier);
      const avg = Math.round((getToken + secretPay + verification + paymentStatus) / 4);

      const newPoint: LatencyDataPoint = {
        time: timeStr,
        timestamp: now.getTime(),
        getToken,
        secretPay,
        verification,
        paymentStatus,
        avgLatency: avg
      };

      setData((prev) => [...prev.slice(1), newPoint]);

      // Check if any endpoint or average latency exceeds the threshold
      const endpointValues = [
        { name: 'Payment Initiation (Secret Pay)', path: 'POST /api/secret-pay', val: secretPay },
        { name: 'Order Verification & IPN', path: 'POST /api/verification', val: verification },
        { name: 'Authentication & Bearer Token', path: 'POST /api/get_token', val: getToken },
        { name: 'Payment Status Reconciliation', path: 'POST /api/payment-status', val: paymentStatus },
        { name: 'Aggregate Gateway Latency', path: 'Average All Endpoints', val: avg }
      ];

      // Find the highest latency endpoint that breached the threshold
      const breached = endpointValues
        .filter((ep) => ep.val > threshold)
        .sort((a, b) => b.val - a.val)[0];

      if (breached) {
        const difference = breached.val - threshold;
        const severity: 'warning' | 'critical' = breached.val >= threshold + 40 ? 'critical' : 'warning';
        const newAlert: LatencyAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now.getTime(),
          time: timeStr,
          endpoint: breached.name,
          endpointPath: breached.path,
          latency: breached.val,
          threshold,
          difference,
          severity
        };

        setActiveToast(newAlert);
        setAlertHistory((prev) => [newAlert, ...prev.slice(0, 19)]); // Keep last 20

        if (soundEnabled) {
          playAlertChime();
        }

        // Auto-dismiss toast after 6.5s
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 6500);
      }

      if (isSimulatingSpike) {
        setIsSimulatingSpike(false);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [isRunning, isSimulatingSpike, threshold, soundEnabled]);

  // Live metrics calculations
  const stats = useMemo(() => {
    if (!data.length) {
      return { currentAvg: 132, minLatency: 98, maxLatency: 215, slaRate: 99.94 };
    }
    const latest = data[data.length - 1];
    const allAverages = data.map((d) => d.avgLatency);
    const min = Math.min(...allAverages);
    const max = Math.max(...allAverages);

    return {
      currentAvg: latest.avgLatency,
      minLatency: min,
      maxLatency: max,
      slaRate: 99.94
    };
  }, [data]);

  // Real-time endpoint benchmark calculations
  const endpointStats = useMemo(() => {
    if (!data.length) {
      return {
        getToken: { current: 112, avg: 114, delta: -8, status: 'optimal' },
        secretPay: { current: 162, avg: 163, delta: -8, status: 'optimal' },
        verification: { current: 135, avg: 136, delta: -5, status: 'optimal' },
        paymentStatus: { current: 124, avg: 123, delta: -6, status: 'optimal' }
      };
    }
    const latest = data[data.length - 1];
    const calc = (key: 'getToken' | 'secretPay' | 'verification' | 'paymentStatus', target: number, p95: number) => {
      const vals = data.map((d) => d[key]);
      const current = latest[key];
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      const delta = current - target;
      const status: 'optimal' | 'acceptable' | 'breach' =
        current <= target ? 'optimal' : current <= p95 ? 'acceptable' : 'breach';
      return { current, avg, delta, status };
    };

    return {
      getToken: calc('getToken', 120, 180),
      secretPay: calc('secretPay', 170, 240),
      verification: calc('verification', 140, 200),
      paymentStatus: calc('paymentStatus', 130, 175)
    };
  }, [data]);

  const triggerSpikeSimulation = () => {
    setIsSimulatingSpike(true);
  };

  const handleResetData = () => {
    setData(generateInitialData());
    setActiveToast(null);
  };

  const handleDismissToast = () => {
    setActiveToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  };

  const handleClearAlertHistory = () => {
    setAlertHistory([]);
    setActiveToast(null);
  };

  return (
    <div
      id="shurjopay-realtime-latency-card"
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 relative"
    >
      {/* Proactive Toast Alert Notification */}
      {activeToast && (
        <div
          id="toast-latency-alert"
          role="alert"
          className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 shadow-lg ${
            activeToast.severity === 'critical'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/40'
              : 'bg-amber-950/90 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  activeToast.severity === 'critical'
                    ? 'bg-rose-900 text-rose-300 animate-bounce'
                    : 'bg-amber-900 text-amber-300 animate-pulse'
                }`}
              >
                {activeToast.severity === 'critical' ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {activeToast.severity === 'critical' ? 'Critical Latency Spike' : 'Latency Warning'}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {activeToast.time}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold font-mono">
                    +{activeToast.difference}ms above threshold
                  </span>
                </div>

                <p className="text-sm font-semibold text-white">
                  High response latency detected on <code className="font-mono text-amber-300 bg-black/30 px-1 py-0.5 rounded">{activeToast.endpointPath}</code>
                </p>

                <p className="text-xs text-slate-300">
                  Recorded latency was <strong className="text-rose-300 font-mono font-bold text-sm">{activeToast.latency}ms</strong> (Configured threshold: <span className="font-mono text-slate-200">{activeToast.threshold}ms</span>). We recommend inspecting gateway network traffic or verifying API retry configurations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-toast-view-history"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="text-xs px-2.5 py-1 rounded bg-black/30 hover:bg-black/50 text-white font-medium border border-white/15 transition-colors"
              >
                Log History
              </button>
              <button
                id="btn-dismiss-latency-toast"
                onClick={handleDismissToast}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-black/40 transition-colors"
                title="Dismiss alert toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Telemetry Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Real-Time API Response Latency Trends</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live (3s ticks)
                </span>
              </h3>

              {/* Notification Badge */}
              {alertHistory.length > 0 ? (
                <button
                  id="btn-notification-badge-active"
                  onClick={() => setIsHistoryDrawerOpen((prev) => !prev)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                  title="Click to view latency alert history"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{alertHistory.length} Latency Alert{alertHistory.length > 1 ? 's' : ''}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </button>
              ) : (
                <span
                  id="badge-latency-nominal"
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Latency Nominal (&lt;{threshold}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Proactive performance monitoring with automated SLA threshold breach detection (Recharts)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            id="btn-toggle-latency-sound"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Alert chime enabled (click to mute)' : 'Enable alert chime'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Stream Pause / Play Toggle */}
          <button
            id="btn-latency-toggle-stream"
            onClick={() => setIsRunning((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              isRunning
                ? 'bg-slate-950 border-emerald-700/70 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isRunning ? 'Pause incoming mock telemetry' : 'Resume mock telemetry stream'}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stream Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Simulate Traffic Spike (Triggers Alert) */}
          <button
            id="btn-latency-simulate-spike"
            onClick={triggerSpikeSimulation}
            disabled={!isRunning}
            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            title="Simulate high traffic peak to test latency alert toast"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Test Alert Spike</span>
          </button>

          {/* Reset Baseline Data */}
          <button
            id="btn-latency-reset"
            onClick={handleResetData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Reset telemetry series"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Link to Full Metrics Tab */}
          {onViewFullTelemetry && (
            <button
              id="btn-view-full-telemetry"
              onClick={onViewFullTelemetry}
              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Open full SLA & Analytics dashboard"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Current Avg Latency</span>
            <Clock className="w-3 h-3 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold font-mono ${
                stats.currentAvg > threshold ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {stats.currentAvg}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Window Min / Max</span>
            <TrendingUp className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5 font-mono text-xs">
            <span className="text-emerald-400 font-semibold">{stats.minLatency}ms</span>
            <span className="text-slate-600">/</span>
            <span
              className={`font-semibold ${
                stats.maxLatency > threshold ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {stats.maxLatency}ms
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Active Threshold</span>
            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold font-mono text-amber-400">{threshold}</span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>SLA Health</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold font-mono text-emerald-400">{stats.slaRate}%</span>
          </div>
        </div>
      </div>

      {/* Threshold Selector & Endpoint Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        {/* Endpoint Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3 h-3 text-amber-400" />
            Filter:
          </span>
          <button
            id="chart-filter-all"
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Endpoints
          </button>
          <button
            id="chart-filter-get-token"
            onClick={() => setActiveFilter('getToken')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              activeFilter === 'getToken'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            /get_token
          </button>
          <button
            id="chart-filter-secret-pay"
            onClick={() => setActiveFilter('secretPay')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              activeFilter === 'secretPay'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            /secret-pay
          </button>
          <button
            id="chart-filter-verification"
            onClick={() => setActiveFilter('verification')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              activeFilter === 'verification'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            /verification
          </button>
          <button
            id="chart-filter-payment-status"
            onClick={() => setActiveFilter('paymentStatus')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              activeFilter === 'paymentStatus'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            /payment-status
          </button>
        </div>

        {/* Latency Threshold Selector & Alert Log Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              Alert Threshold:
            </span>
            <select
              id="select-latency-threshold"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-400 font-mono"
            >
              <option value={170}>170 ms (Strict)</option>
              <option value={200}>200 ms (Standard)</option>
              <option value={220}>220 ms (Recommended)</option>
              <option value={250}>250 ms (SLA Ceiling)</option>
              <option value={300}>300 ms (Relaxed)</option>
            </select>
          </div>

          {/* Toggle Benchmark Lines on Chart */}
          <button
            id="btn-toggle-benchmark-lines"
            onClick={() => setShowBenchmarksOnChart((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-colors ${
              showBenchmarksOnChart
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle performance benchmark target guide lines on the chart"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Benchmark Lines:</span>
            <span>{showBenchmarksOnChart ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="btn-toggle-alert-history-drawer"
            onClick={() => setIsHistoryDrawerOpen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
            title="Toggle recent threshold breach logs"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Alert Log</span>
            {alertHistory.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {alertHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Alert Log History Drawer */}
      {isHistoryDrawerOpen && (
        <div
          id="drawer-latency-alert-history"
          className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200">Recent Latency Breach Logs ({alertHistory.length})</h4>
              <span className="text-[10px] text-slate-500 font-mono">Threshold: {threshold}ms</span>
            </div>
            <div className="flex items-center gap-2">
              {alertHistory.length > 0 && (
                <button
                  id="btn-clear-alert-logs"
                  onClick={handleClearAlertHistory}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {alertHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No threshold breaches logged. All responses have remained below {threshold}ms.
            </p>
          ) : (
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {alertHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <span className="font-mono font-medium text-slate-200">{alert.endpointPath}</span>
                      <span className="text-[10px] text-slate-500 ml-2 font-mono">{alert.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-rose-400 font-bold">{alert.latency}ms</span>
                    <span className="text-[10px] text-slate-500">(&gt;{alert.threshold}ms)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Recharts Line Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
            <XAxis
              dataKey="time"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
            />
            <YAxis
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              unit="ms"
              domain={[60, 'dataMax + 40']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#090d16' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: any) => [
                `${value} ms`,
                name === 'getToken'
                  ? 'POST /api/get_token'
                  : name === 'secretPay'
                  ? 'POST /api/secret-pay'
                  : name === 'verification'
                  ? 'POST /api/verification'
                  : name === 'paymentStatus'
                  ? 'POST /api/payment-status'
                  : 'Aggregate Average'
              ]}
              labelFormatter={(label) => `Timestamp: ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              formatter={(val) => {
                if (val === 'getToken') return 'Get Token';
                if (val === 'secretPay') return 'Secret Pay';
                if (val === 'verification') return 'Verification';
                if (val === 'paymentStatus') return 'Payment Status';
                if (val === 'avgLatency') return 'Average Latency';
                return val;
              }}
            />

            {/* Dynamic Alert Threshold Reference Line */}
            <ReferenceLine
              y={threshold}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Alert Threshold (${threshold}ms)`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'top'
              }}
            />

            {/* SLA Target Ceiling Line at 250ms if different from threshold */}
            {threshold !== 250 && (
              <ReferenceLine
                y={250}
                stroke="#ef4444"
                strokeDasharray="2 2"
                strokeWidth={1}
                label={{
                  value: 'SLA Ceiling (250ms)',
                  fill: '#ef4444',
                  fontSize: 9,
                  position: 'bottom'
                }}
              />
            )}

            {/* Benchmark Target & P95 Reference Lines */}
            {showBenchmarksOnChart && (
              <>
                {activeFilter === 'all' && (
                  <ReferenceLine
                    y={140}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: 'Target SLA Avg (≤140ms)',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'insideBottomLeft'
                    }}
                  />
                )}
                {activeFilter === 'getToken' && (
                  <>
                    <ReferenceLine
                      y={120}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'get_token Target (≤120ms)',
                        fill: '#10b981',
                        fontSize: 10,
                        position: 'top'
                      }}
                    />
                    <ReferenceLine
                      y={180}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{
                        value: 'P95 Ceiling (180ms)',
                        fill: '#f59e0b',
                        fontSize: 9,
                        position: 'bottom'
                      }}
                    />
                  </>
                )}
                {activeFilter === 'secretPay' && (
                  <>
                    <ReferenceLine
                      y={170}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'secret-pay Target (≤170ms)',
                        fill: '#f59e0b',
                        fontSize: 10,
                        position: 'top'
                      }}
                    />
                    <ReferenceLine
                      y={240}
                      stroke="#ef4444"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{
                        value: 'P95 Ceiling (240ms)',
                        fill: '#ef4444',
                        fontSize: 9,
                        position: 'bottom'
                      }}
                    />
                  </>
                )}
                {activeFilter === 'verification' && (
                  <>
                    <ReferenceLine
                      y={140}
                      stroke="#0ea5e9"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'verification Target (≤140ms)',
                        fill: '#0ea5e9',
                        fontSize: 10,
                        position: 'top'
                      }}
                    />
                    <ReferenceLine
                      y={200}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{
                        value: 'P95 Ceiling (200ms)',
                        fill: '#f59e0b',
                        fontSize: 9,
                        position: 'bottom'
                      }}
                    />
                  </>
                )}
                {activeFilter === 'paymentStatus' && (
                  <>
                    <ReferenceLine
                      y={130}
                      stroke="#a855f7"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'payment-status Target (≤130ms)',
                        fill: '#a855f7',
                        fontSize: 10,
                        position: 'top'
                      }}
                    />
                    <ReferenceLine
                      y={175}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      label={{
                        value: 'P95 Ceiling (175ms)',
                        fill: '#f59e0b',
                        fontSize: 9,
                        position: 'bottom'
                      }}
                    />
                  </>
                )}
              </>
            )}

            {/* Line Series depending on selected filter */}
            {(activeFilter === 'all' || activeFilter === 'getToken') && (
              <Line
                type="monotone"
                dataKey="getToken"
                name="getToken"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
                isAnimationActive={false}
              />
            )}

            {(activeFilter === 'all' || activeFilter === 'secretPay') && (
              <Line
                type="monotone"
                dataKey="secretPay"
                name="secretPay"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b' }}
                isAnimationActive={false}
              />
            )}

            {(activeFilter === 'all' || activeFilter === 'verification') && (
              <Line
                type="monotone"
                dataKey="verification"
                name="verification"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0ea5e9' }}
                isAnimationActive={false}
              />
            )}

            {(activeFilter === 'all' || activeFilter === 'paymentStatus') && (
              <Line
                type="monotone"
                dataKey="paymentStatus"
                name="paymentStatus"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                activeDot={{ r: 4, fill: '#a855f7' }}
                isAnimationActive={false}
              />
            )}

            {activeFilter === 'all' && (
              <Line
                type="monotone"
                dataKey="avgLatency"
                name="avgLatency"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Endpoint Performance Benchmarks & SLA Guidelines Grid */}
      <div className="pt-2 border-t border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200">
              Endpoint Performance Benchmarks vs Real-Time Stream
            </h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
              Live Mock Stream
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Click any card to isolate that endpoint on the Recharts line chart
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ENDPOINT_BENCHMARKS.map((bm) => {
            const stat = endpointStats[bm.key];
            const isSelected = activeFilter === bm.key;

            return (
              <div
                key={bm.key}
                id={`benchmark-card-${bm.key}`}
                onClick={() => setActiveFilter((prev) => (prev === bm.key ? 'all' : bm.key))}
                className={`border rounded-xl p-3.5 transition-all cursor-pointer select-none relative group ${
                  isSelected
                    ? 'bg-slate-850 border-amber-500/80 ring-1 ring-amber-500/40 shadow-md'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
                title={`Click to ${isSelected ? 'show all endpoints' : `isolate ${bm.name}`}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded">
                      {bm.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                      {bm.path}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                      Filtered
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-medium truncate mb-2.5">
                  {bm.name}
                </div>

                {/* Benchmark Metrics Comparison */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 rounded-lg p-2 border border-slate-800/60 mb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Target Benchmark
                    </span>
                    <div className="font-mono text-xs font-semibold text-emerald-400">
                      &le; {bm.targetLatency}ms
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">P95: &le;{bm.p95Latency}ms</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Live Measured
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-100 flex items-baseline gap-1">
                      <span>{stat.current}ms</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        (avg {stat.avg}ms)
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-medium ${
                        stat.delta <= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {stat.delta <= 0 ? `⚡ ${Math.abs(stat.delta)}ms faster` : `+${stat.delta}ms above`}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Recommendations */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Benchmark Status:</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        stat.status === 'optimal'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : stat.status === 'acceptable'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {stat.status === 'optimal' ? 'Optimal (Target)' : stat.status === 'acceptable' ? 'Standard (P95)' : 'High Latency'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 flex items-start gap-1">
                    <Clock className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                    <span>Timeout: <strong className="text-slate-300 font-mono">{bm.recommendedTimeout}</strong></span>
                  </div>

                  <p className="text-[10px] text-slate-500 italic line-clamp-2">
                    {bm.developerTip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable Developer Latency Optimization Guide */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden">
          <button
            id="btn-toggle-latency-best-practices"
            onClick={() => setIsBestPracticesOpen((prev) => !prev)}
            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Developer Optimization Guidelines for Minimal API Latency</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Connection Pooling, Token Caching, Timeouts)
              </span>
            </div>
            {isBestPracticesOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isBestPracticesOpen && (
            <div className="p-4 pt-1 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  1. Keep-Alive / TCP Connection Pooling
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Establish an HTTP connection pool with Keep-Alive enabled in your server runtime (e.g. Node.js <code className="text-slate-200">https.Agent({'{'} keepAlive: true {'}'})</code> or cURL connection re-use in PHP/Laravel). This saves <strong>35–60ms</strong> TLS handshake latency per request.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  2. 14-Minute Token Caching Strategy
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bearer tokens issued by <code className="text-slate-200">/api/get_token</code> are valid for <strong>900 seconds (15 minutes)</strong>. Store this token in server memory or Redis and re-use it across customer checkout flows instead of requesting a new token for every customer transaction.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  3. Asynchronous Verification & Webhooks (IPN)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Avoid blocking the customer's browser in a synchronous verification loop. Use ShurjoPay's instant IPN post-back and execute the <code className="text-slate-200">/api/verification</code> call in a fast background worker or webhook handler to provide sub-second receipt rendering.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  4. Recommended Timeout & Jittered Retries
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Configure HTTP connection timeout to <strong>3000ms</strong> and read timeout to <strong>5000ms</strong>. If a transient network glitch occurs, retry with exponential backoff (e.g. 1s, 2s, 4s) with randomized jitter to prevent thundering herd spikes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
