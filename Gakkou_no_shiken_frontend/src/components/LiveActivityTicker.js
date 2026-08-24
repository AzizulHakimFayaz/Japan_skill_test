'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, TrendingUp, Users } from 'lucide-react';

const ACTIVITIES = [
  {
    icon: Trophy,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    title: 'Top Score Achieved',
    desc: 'Candidate Kenji scored 240/250 (CEFR A2.2 Pass) in JFT-Basic Mock #1',
    time: '2m ago',
  },
  {
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    title: 'Exam Passed',
    desc: 'Candidate Fatema completed SSW Nursing Care Skills Evaluation (92% Accuracy)',
    time: '5m ago',
  },
  {
    icon: Sparkles,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    title: 'New Mock Exam',
    desc: 'Official 2026-2027 Prometric JFT-Basic Full Diagnostic Test released',
    time: '12m ago',
  },
  {
    icon: TrendingUp,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    title: 'Milestone',
    desc: 'Over 2,850+ candidates preparing for Japan Work Visas on Gakkou No Shiken',
    time: 'Live',
  },
];

export default function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const current = ACTIVITIES[currentIndex];
  const Icon = current.icon;

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl py-2 px-3 sm:px-4 shadow-xs flex items-center justify-between gap-3 text-xs overflow-hidden transition-colors">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-japan-red dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md flex-shrink-0 border border-rose-100 dark:border-rose-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-japan-red dark:bg-rose-400 animate-ping"></span>
          Live Stream
        </span>

        <div
          className={`flex items-center gap-2 truncate transition-all duration-300 ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${current.color}`}>
            <Icon className="w-3 h-3" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white truncate text-[11px] sm:text-xs">
            {current.title}:
          </span>
          <span className="text-slate-600 dark:text-slate-300 truncate text-[11px] sm:text-xs font-medium">
            {current.desc}
          </span>
        </div>
      </div>

      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 hidden sm:inline-block">
        {current.time}
      </span>
    </div>
  );
}
