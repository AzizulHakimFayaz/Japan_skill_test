'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, TrendingUp, Sparkles, Award, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function ExamScorePredictor() {
  const [studyHours, setStudyHours] = useState(120); // total hours studied
  const [mockScore, setMockScore] = useState(75); // recent accuracy %
  const [targetExam, setTargetExam] = useState('jft_basic');

  // Calculate predicted scale score (10 - 250)
  const baseScaled = Math.min(250, Math.max(10, Math.round(mockScore * 2.35 + studyHours * 0.15)));
  
  let cefrLevel = 'Below A1';
  let passProbability = 'Low';
  let badgeColor = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';

  if (baseScaled >= 200) {
    cefrLevel = 'A2.2 (Official Passing Level)';
    passProbability = '98% High Probability';
    badgeColor = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  } else if (baseScaled >= 175) {
    cefrLevel = 'A2.1 (Near Passing Threshold)';
    passProbability = '82% Moderate Probability';
    badgeColor = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  } else if (baseScaled >= 145) {
    cefrLevel = 'A1 (Beginner Communicative)';
    passProbability = '55% Practice Required';
    badgeColor = 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              AI Readiness Simulator
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              CEFR Score &amp; Pass Predictor
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Prometric Model
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="my-4 space-y-4 text-xs">
        {/* Exam Type Selector */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            Target Japanese Examination:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetExam('jft_basic')}
              className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer ${
                targetExam === 'jft_basic'
                  ? 'bg-japan-red text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              JFT-Basic (A2)
            </button>
            <button
              type="button"
              onClick={() => setTargetExam('ssw_skill')}
              className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer ${
                targetExam === 'ssw_skill'
                  ? 'bg-japan-red text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              SSW Sector Skill
            </button>
          </div>
        </div>

        {/* Slider 1: Total Study Hours */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Total Japanese Study Hours:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{studyHours} hrs</strong>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={studyHours}
            onChange={(e) => setStudyHours(Number(e.target.value))}
            className="w-full accent-japan-red cursor-pointer"
          />
        </div>

        {/* Slider 2: Practice Accuracy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Practice Mock Accuracy:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{mockScore}%</strong>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={mockScore}
            onChange={(e) => setMockScore(Number(e.target.value))}
            className="w-full accent-japan-red cursor-pointer"
          />
        </div>
      </div>

      {/* Output Projected Score Box */}
      <div className="bg-gradient-to-br from-slate-950 via-japan-navy to-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
            Predicted Scaled Score
          </span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {passProbability}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <strong className="text-3xl font-black font-mono text-white leading-none">
            {baseScaled}
          </strong>
          <span className="text-xs text-slate-400 font-bold">/ 250 Scaled Points</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-slate-300">
          <span>Projected Level:</span>
          <strong className="text-amber-300 font-extrabold">{cefrLevel}</strong>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-3">
        <Link
          href="#practice-grid"
          className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-japan-red dark:hover:bg-rose-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <span>Test Your Accuracy Live</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
