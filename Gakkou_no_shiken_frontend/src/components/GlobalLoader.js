'use client';

import React, { useState, useEffect } from 'react';

const TICKER_MESSAGES = [
  'Processing request...',
  'Evaluating exam performance...',
  'Calculating official score & performance level...',
  'Preparing score report breakdown...',
  'Almost ready...',
];

export default function GlobalLoader({
  visible = false,
  title = 'Evaluating Exam Results...',
  subtitle = 'Submitting your answers, calculating official scale scores and performance breakdown...',
}) {

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Top Loading Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-[10000] pointer-events-none">
        <div className="h-full w-full bg-gradient-to-r from-red-600 via-rose-400 via-amber-400 to-red-600 animate-shimmer-bar"></div>
      </div>

      {/* Full Screen Glassmorphic Loading Screen */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
        {/* Ambient Background Light Orbs */}
        <div className="absolute w-72 h-72 rounded-full bg-red-600/20 blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl animate-pulse pointer-events-none"></div>

        <div className="relative z-10 max-w-sm w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl shadow-slate-950 text-center backdrop-blur-md flex flex-col items-center">
          {/* Animated Badge with Spinning Ring */}
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            {/* Pulsing outer ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 blur-md opacity-60 animate-pulse-ring"></div>

            {/* Spinning outer gradient border */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-red-600 via-amber-500 to-rose-500 animate-spin-ring opacity-80"></div>

            {/* Center Icon Box with Official Logo */}
            <div className="relative w-16 h-16 rounded-2xl bg-white/95 border border-slate-700/80 flex items-center justify-center p-2.5 shadow-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/logo.png"
                alt="Gakkou No Shiken Logo"
                className="w-full h-full object-contain filter drop-shadow-xs scale-105"
              />
            </div>

          </div>

          {/* Dynamic Title & Subtitle */}
          <h3 className="text-xl font-black text-white tracking-tight mb-2">{title}</h3>

          <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6 px-2">{subtitle}</p>

          {/* Shimmering Progress Bar */}
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden mb-4 border border-slate-700/50">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-red-600 via-rose-400 via-amber-400 to-red-600 animate-shimmer-bar"></div>
          </div>

          {/* Status Ticker & Pulse Dots */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{TICKER_MESSAGES[tickerIndex]}</span>
          </div>
        </div>
      </div>
    </>
  );
}
