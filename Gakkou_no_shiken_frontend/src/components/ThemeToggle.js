'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabel = false, size = 'default' }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse ${className}`}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (日中モード)' : 'Switch to Dark Mode (夜間モード)'}
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 group focus:outline-none focus:ring-2 focus:ring-japan-red/40 ${
        isDark
          ? 'bg-slate-900/90 text-amber-300 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:border-amber-400'
          : 'bg-white text-slate-700 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:text-japan-red'
      } ${
        size === 'compact'
          ? 'p-2 w-8 h-8 sm:w-9 sm:h-9'
          : 'p-2 sm:p-2.5 min-w-[38px] sm:min-w-[42px] h-[38px] sm:h-[42px]'
      } ${className}`}
    >
      {/* Animated Glowing Ring in Dark Mode */}
      {isDark && (
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none"></span>
      )}

      {/* Morphing Sun / Moon Icon with Spring Spin Animation */}
      <div className="relative flex items-center justify-center w-5 h-5">
        <Sun
          className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-500 transition-all duration-500 transform ${
            isDark
              ? 'opacity-0 rotate-90 scale-0 absolute'
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-300 transition-all duration-500 transform ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-300 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
              : 'opacity-0 -rotate-90 scale-0 absolute'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
