import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  id?: string;
  variant?: 'header' | 'mobile-header' | 'sidebar-item';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  id = 'global-theme-toggle-btn',
  variant = 'header',
  className = ''
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'sidebar-item') {
    return (
      <button
        id={id}
        onClick={toggleTheme}
        className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all border ${
          isDark
            ? 'bg-slate-950/60 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
        } ${className}`}
        aria-label={isDark ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
        title={isDark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg shrink-0 transition-colors ${
              isDark
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </div>
          <div>
            <span className="font-semibold text-xs block">
              {isDark ? 'থিম: ডার্ক মোড (সক্রিয়)' : 'থিম: লাইট মোড (সক্রিয়)'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {isDark ? 'লাইট মোডে পরিবর্তন করতে ট্যাপ করুন' : 'ডার্ক মোডে পরিবর্তন করতে ট্যাপ করুন'}
            </span>
          </div>
        </div>

        {/* Toggle Pill Indicator */}
        <div
          className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors border ${
            isDark
              ? 'bg-slate-800 border-slate-700 justify-start'
              : 'bg-amber-500 border-amber-400 justify-end'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
              isDark ? 'bg-slate-900 text-amber-400' : 'bg-white text-slate-900 shadow-xs'
            }`}
          >
            {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-600" />}
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'mobile-header') {
    return (
      <button
        id={id}
        onClick={toggleTheme}
        className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
          isDark
            ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border-slate-700/80 hover:border-amber-500/40 shadow-xs'
            : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-indigo-400 shadow-xs'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'লাইট মোডে পরিবর্তন করুন (Switch to Light Mode)' : 'ডার্ক মোডে পরিবর্তন করুন (Switch to Dark Mode)'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-200" />
        )}
      </button>
    );
  }

  // Default: Header button with icon and text pill
  return (
    <button
      id={id}
      onClick={toggleTheme}
      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80 hover:border-amber-500/40'
          : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-200 hover:border-slate-300'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (লাইট মোড)' : 'Switch to Dark Mode (ডার্ক মোড)'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
          <span className="text-[11px] font-medium text-slate-300">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-200" />
          <span className="text-[11px] font-medium text-slate-700">Dark</span>
        </>
      )}
    </button>
  );
};
