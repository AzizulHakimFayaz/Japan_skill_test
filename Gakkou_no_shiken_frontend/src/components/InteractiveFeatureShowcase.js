'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Languages,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Play,
  Volume2,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

const LIVE_TICKER_ITEMS = [
  { text: 'JFT-Basic 2026 Format', tag: 'OFFICIAL', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { text: 'Prometric 60-Min CBT Timer', tag: 'REALISTIC', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { text: '10-Language Instant Helper', tag: 'IN-TEST', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { text: '200/250 A2 Passing Standard', tag: 'BENCHMARK', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { text: '12 SSW Industry Sectors', tag: 'CAREER', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
];

const LANG_LIST = ['English', 'বাংলা', 'Tiếng Việt', 'Bahasa Indo', 'မြန်မာ', 'नेपाली', 'ภาษาไทย', '中文', 'Монгол', 'ភាសាខ្មែរ'];

export default function InteractiveFeatureShowcase() {
  const [activeLangIndex, setActiveLangIndex] = useState(0);

  useEffect(() => {
    const langInterval = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % LANG_LIST.length);
    }, 2000);
    return () => clearInterval(langInterval);
  }, []);

  return (
    <div className="space-y-3 sm:space-y-6 animate-fade-in-up">
      {/* 1. Animated Running Feature Ticker Pill Strip */}
      <div className="relative overflow-hidden bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-2 sm:p-2.5 shadow-lg shadow-slate-950/20">
        <div className="flex items-center justify-between gap-3">
          {/* Static Live Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-japan-red/20 text-rose-300 border border-japan-red/30 text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex-shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-japan-red animate-ping"></span>
            <span className="hidden xs:inline">Engine Highlights</span>
            <span className="xs:hidden">CBT Live</span>
          </div>

          {/* Marquee Ticker */}
          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="flex items-center gap-4 sm:gap-8 whitespace-nowrap animate-marquee">
              {LIVE_TICKER_ITEMS.concat(LIVE_TICKER_ITEMS).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md border ${item.color}`}>
                    {item.tag}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200">{item.text}</span>
                  <span className="text-slate-600 text-xs">✦</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-400 hover:text-amber-300 transition-colors pr-2 flex-shrink-0 group"
          >
            <span>Live Standings</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Three Interactive Animated Glassmorphic Feature Hubs (Mobile 2-Col Grid, Desktop 3-Col Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {/* Hub 1: Audio Listening Simulator with Equalizer */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-rose-50/40 dark:from-slate-900/90 dark:to-rose-950/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-rose-100 dark:border-rose-900/40 shadow-2xs hover:shadow-xl hover:border-rose-200 dark:hover:border-rose-700/60 transition-all duration-300 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover-lift group">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-japan-red to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-110 transition-transform">
                <Headphones className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse text-japan-red dark:text-rose-400" />
                <span>HD Audio</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                Prometric Audio
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                1-play exam constraints with crystal clear Japanese pronunciation.
              </p>
            </div>
          </div>

          {/* Interactive Animated Waveform Bar Graphic */}
          <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 border border-slate-800 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-japan-red text-white flex items-center justify-center flex-shrink-0">
                <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-200 truncate">Audio 03</span>
            </div>

            {/* Equalizer bars animation */}
            <div className="flex items-end gap-0.5 sm:gap-1 h-3.5 sm:h-5 flex-shrink-0">
              <span className="w-0.5 sm:w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms] h-2 sm:h-3"></span>
              <span className="w-0.5 sm:w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-3.5 sm:h-5"></span>
              <span className="w-0.5 sm:w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms] h-1.5 sm:h-2.5"></span>
              <span className="w-0.5 sm:w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:100ms] h-3 sm:h-4"></span>
              <span className="w-0.5 sm:w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:250ms] h-2 sm:h-3.5"></span>
            </div>
          </div>
        </div>

        {/* Hub 2: 10-Language Instant Lens with Rotating Indicator */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-700/60 transition-all duration-300 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover-lift group">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <Languages className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 dark:text-indigo-400" />
                <span>10 Langs</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                Translation Lens
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
                Instant instruction translations in your native tongue.
              </p>
            </div>
          </div>

          {/* Interactive Rotating Language Badge Carousel */}
          <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Native:</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-[10px] sm:text-xs shadow-md animate-pulse">
                {LANG_LIST[activeLangIndex]}
              </div>
            </div>
          </div>
        </div>

        {/* Hub 3: CEFR-J Scaled Score & Instant Diagnostic Radar (Full Width on Mobile Row 2) */}
        <div className="col-span-2 lg:col-span-1 relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700/60 transition-all duration-300 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover-lift group">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Scaled 10–250</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                Instant Scorecard &amp; Diagnostic Radar
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed font-normal">
                Official CEFR-J A2 scaled scoring with precision 4-section diagnostic breakdown.
              </p>
            </div>
          </div>

          {/* Interactive Scaled Score Gauge Indicator */}
          <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300">Passing Benchmark:</span>
              <strong className="text-[11px] sm:text-xs font-black text-emerald-400 font-mono">200 / 250</strong>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md sm:rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black">
              <span>A2 QUALIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
