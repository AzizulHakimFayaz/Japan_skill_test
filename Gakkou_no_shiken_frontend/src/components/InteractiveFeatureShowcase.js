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
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);

  useEffect(() => {
    const langInterval = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % LANG_LIST.length);
    }, 2000);
    return () => clearInterval(langInterval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* 1. Animated Running Feature Ticker Pill Strip */}
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-2 sm:p-2.5 shadow-lg shadow-slate-950/20">
        <div className="flex items-center justify-between gap-3">
          {/* Static Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-japan-red/20 text-rose-300 border border-japan-red/30 text-[11px] font-black uppercase tracking-wider flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-japan-red animate-ping"></span>
            <span className="hidden xs:inline">Engine Highlights</span>
            <span className="xs:hidden">CBT Live</span>
          </div>

          {/* Marquee Ticker */}
          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="flex items-center gap-6 sm:gap-8 whitespace-nowrap animate-marquee">
              {LIVE_TICKER_ITEMS.concat(LIVE_TICKER_ITEMS).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${item.color}`}>
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{item.text}</span>
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

      {/* 2. Three Interactive Animated Glassmorphic Feature Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Hub 1: Audio Listening Simulator with Equalizer */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-rose-50/40 rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between space-y-4 hover-lift group">
          {/* Top Decorative Graphic */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-japan-red to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/80 text-japan-red border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                <Volume2 className="w-3 h-3 animate-pulse text-japan-red" />
                <span>HD Audio Engine</span>
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                Authentic Prometric Audio
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Practice native listening dialogues with 1-play exam simulation constraints and crystal clear Japanese pronunciation.
              </p>
            </div>
          </div>

          {/* Interactive Animated Waveform Bar Graphic */}
          <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-japan-red text-white flex items-center justify-center shadow-sm">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-200">Listening Track 03</span>
            </div>

            {/* Equalizer bars animation */}
            <div className="flex items-end gap-1 h-5">
              <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms] h-3"></span>
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-5"></span>
              <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms] h-2.5"></span>
              <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:100ms] h-4"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:250ms] h-3.5"></span>
            </div>
          </div>
        </div>

        {/* Hub 2: 10-Language Instant Lens with Rotating Indicator */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/40 rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between space-y-4 hover-lift group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <Languages className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>10 Languages</span>
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                Instant Translation Lens
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Click any question helper during the test to view contextual instruction translations in your native tongue.
              </p>
            </div>
          </div>

          {/* Interactive Rotating Language Badge Carousel */}
          <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
            <span className="text-[11px] font-medium text-slate-400">Supported Native:</span>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs shadow-md animate-pulse">
                {LANG_LIST[activeLangIndex]}
              </div>
              <span className="text-[10px] font-mono text-indigo-300">
                {activeLangIndex + 1}/{LANG_LIST.length}
              </span>
            </div>
          </div>
        </div>

        {/* Hub 3: CEFR-J Scaled Score & Instant Diagnostic Radar */}
        <div className="relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/40 rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between space-y-4 hover-lift group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                <Activity className="w-3 h-3 text-emerald-600" />
                <span>Scaled 10–250 IRT</span>
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                Instant Scorecard &amp; Diagnostics
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                Receive instantaneous official CEFR-J A2 scaled scoring with precision diagnostic radar across all 4 exam sections.
              </p>
            </div>
          </div>

          {/* Interactive Scaled Score Gauge Indicator */}
          <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Passing Benchmark:</span>
              <strong className="text-xs font-black text-emerald-400 font-mono">200 / 250</strong>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
              <span>A2 QUALIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
