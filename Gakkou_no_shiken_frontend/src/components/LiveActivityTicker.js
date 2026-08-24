'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { Sparkles, Trophy, CheckCircle2, Calendar, X } from 'lucide-react';

export default function LiveActivityTicker() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const notices = useMemo(
    () => [
      {
        icon: Calendar,
        color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800',
        tag: 'Test Dates',
        title: 'Prometric BDJ01 & BDJ02 Seat Alert',
        desc: 'Upcoming JFT-Basic & SSW seat booking window is open for Dhaka test centers.',
        time: 'Live',
      },
      {
        icon: Trophy,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
        tag: 'Top Score',
        title: 'New High Score Achieved',
        desc: 'Candidate Kenji scored 240/250 (CEFR A2.2 Pass) on JFT-Basic Mock Exam #1',
        time: '3m ago',
      },
      {
        icon: Sparkles,
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800',
        tag: '2026 CBT',
        title: 'Full Prometric Diagnostic Released',
        desc: 'Official 47-question timed test with instant scale score report is available now.',
        time: 'New',
      },
      {
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
        tag: 'Visa Prep',
        title: '2,900+ Candidates Active',
        desc: 'Candidates in Bangladesh preparing for Japan Specified Skilled Worker (SSW) visas.',
        time: '24/7',
      },
    ],
    []
  );

  useEffect(() => {
    if (isPaused || dismissed) return;

    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notices.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, dismissed, notices.length]);

  if (dismissed || notices.length === 0) return null;

  const current = notices[currentIndex] || notices[0];
  const IconComponent = current.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl py-2 px-3 sm:px-4 shadow-xs flex items-center justify-between gap-3 text-xs overflow-hidden transition-all duration-300 hover:border-japan-red/30 dark:hover:border-rose-500/30"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Latest Notices Badge */}
        <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-japan-red dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-xl flex-shrink-0 border border-rose-200/80 dark:border-rose-800/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-japan-red dark:bg-rose-400 animate-pulse"></span>
          <span>{t('latest_notices')}</span>
        </span>

        {/* Sliding Notice Content */}
        <div
          className={`flex items-center gap-2 truncate transition-all duration-300 ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${current.color}`}>
            <IconComponent className="w-3 h-3" />
          </div>

          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {current.tag}
          </span>

          <strong className="font-extrabold text-slate-900 dark:text-white truncate text-[11px] sm:text-xs">
            {current.title}:
          </strong>

          <span className="text-slate-600 dark:text-slate-300 truncate text-[11px] sm:text-xs font-medium">
            {current.desc}
          </span>
        </div>
      </div>

      {/* Right Controls: Time indicator + Close Button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
          {current.time}
        </span>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss notices"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
