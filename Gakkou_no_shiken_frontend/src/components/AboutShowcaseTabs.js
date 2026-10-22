'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function AboutShowcaseTabs({ tabs = [] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'jft_runner');
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  if (!currentTab) return null;

  return (
    <div className="space-y-6">
      {/* Interactive Showcase Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[140px] sm:min-w-[170px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 text-center cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Showcase View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* Left Column: Description & Checkmarks */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black uppercase">
              <CheckCircle2 className="w-3 h-3" />
              <span>{currentTab.badge}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentTab.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentTab.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Key Prometric CBT Features:
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {currentTab.features.map((feat, fIdx) => (
                <li key={fIdx} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </span>
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3">
            <Link
              href="/#mock-tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <span>Launch This Exam Live</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Right Column: Actual Website Screenshot with Interactive Device Frame */}
        <div className="lg:col-span-7">
          <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-300/80 dark:border-slate-700 bg-slate-950 shadow-2xl transition-all duration-300 hover:shadow-red-500/10 hover:border-japan-red/50">
            {/* Device Window Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-300 hidden sm:inline">
                  gakkounoshiken.site/test/preview
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Verified Prometric Environment</span>
              </div>
            </div>

            {/* Real Screenshot Preview */}
            <div className="relative overflow-hidden bg-slate-900 max-h-[420px] sm:max-h-[500px] flex items-center justify-center p-1 sm:p-2">
              <img
                src={currentTab.screenshot}
                alt={currentTab.title}
                className="w-full h-auto max-h-[460px] object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
