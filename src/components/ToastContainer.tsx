import React from 'react';
import { useToast, ToastMessage, ToastType } from '../context/ToastContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const getThemeDetails = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          borderColor: 'border-emerald-500/40 hover:border-emerald-500/60',
          bgColor: 'bg-slate-900/95 dark:bg-slate-900/95',
          accentBar: 'bg-emerald-500',
          badgeText: 'সফল (Success)',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          glow: 'shadow-emerald-500/10',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          borderColor: 'border-rose-500/40 hover:border-rose-500/60',
          bgColor: 'bg-slate-900/95 dark:bg-slate-900/95',
          accentBar: 'bg-rose-500',
          badgeText: 'ত্রুটি (Error)',
          badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          glow: 'shadow-rose-500/10',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          borderColor: 'border-amber-500/40 hover:border-amber-500/60',
          bgColor: 'bg-slate-900/95 dark:bg-slate-900/95',
          accentBar: 'bg-amber-500',
          badgeText: 'সতর্কতা (Warning)',
          badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          glow: 'shadow-amber-500/10',
        };
      case 'info':
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
          borderColor: 'border-sky-500/40 hover:border-sky-500/60',
          bgColor: 'bg-slate-900/95 dark:bg-slate-900/95',
          accentBar: 'bg-sky-500',
          badgeText: 'বিজ্ঞপ্তি (Info)',
          badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          glow: 'shadow-sky-500/10',
        };
    }
  };

  const details = getThemeDetails(toast.type);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-xl border ${details.borderColor} ${details.bgColor} backdrop-blur-md p-4 text-slate-100 shadow-xl ${details.glow} transition-all duration-300 pointer-events-auto flex items-start gap-3 w-full group animate-in slide-in-from-right-5 fade-in duration-200`}
    >
      {/* Top micro progress/accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${details.accentBar} opacity-80`} />

      {/* Icon */}
      {details.icon}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
          <span
            className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border ${details.badgeColor}`}
          >
            {details.badgeText}
          </span>
        </div>

        {toast.message && (
          <p className="text-xs text-slate-300 dark:text-slate-300 leading-relaxed break-words font-sans">
            {toast.message}
          </p>
        )}

        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors group-hover:underline"
          >
            <span>{toast.action.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
        aria-label="বিজ্ঞপ্তি বন্ধ করুন"
        title="বন্ধ করুন"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, clearAllToasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed z-50 bottom-20 lg:bottom-6 right-3 sm:right-6 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none transition-all duration-300"
    >
      {toasts.length > 2 && (
        <div className="flex justify-end pointer-events-auto pr-1">
          <button
            onClick={clearAllToasts}
            className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-amber-400 bg-slate-900/90 hover:bg-slate-850 px-2.5 py-1 rounded-md border border-slate-800 transition-colors shadow-sm"
          >
            সব নোটিফিকেশন মুছুন ({toasts.length})
          </button>
        </div>
      )}

      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={dismissToast} />
      ))}
    </aside>
  );
};
