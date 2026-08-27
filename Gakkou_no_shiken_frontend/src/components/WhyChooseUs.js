'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';
import {
  Monitor,
  Headphones,
  Languages,
  BarChart3,
  Layers,
  Trophy,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Monitor,
    title: '100% Prometric CBT Simulation',
    subtitle: 'Official Exam Environment',
    desc: 'Practicing on our platform feels identical to the actual CBT test screen at Prometric centers in Dhaka & Chittagong. Avoid exam-day anxiety with exact 4-section timed progression.',
    badge: 'Authentic UI',
    color: 'from-rose-500 to-red-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-japan-red dark:text-rose-400',
  },
  {
    icon: Headphones,
    title: 'Native Listening Audio Engine',
    subtitle: 'Single-Play CBT Standard',
    desc: 'Authentic Japanese conversational dialogues recorded with natural cadence, ambient background noise, and Prometric 1-play audio protocols for the Listening section.',
    badge: 'HD Audio',
    color: 'from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400',
  },
  {
    icon: Languages,
    title: '10 Multilingual In-Test Aids',
    subtitle: 'Bangla & English Explanations',
    desc: 'Toggle instant word hints and comprehensive Bangla explanations during study mode to understand kanji, grammatical structures, and cultural nuances faster.',
    badge: '10 Languages',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Instant CEFR Scaled Diagnostics',
    subtitle: 'Pass Benchmark: 200/250 (A2)',
    desc: 'Immediately receive your CEFR A2 diagnostic sheet with Can-Do ability statements, section-wise score breakdown, and targeted suggestions to fix weak areas.',
    badge: 'Instant Results',
    color: 'from-amber-500 to-yellow-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-400',
  },
  {
    icon: Layers,
    title: 'SSW 12 Industry Sectors',
    subtitle: 'Workplace Skills Assessment',
    desc: 'Targeted skill tests for Specified Skilled Worker visa sectors: Nursing Care (介護), Food Service (外食), Agriculture (農業), Building Cleaning, and Construction.',
    badge: '12 Sectors',
    color: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-400',
  },
  {
    icon: Trophy,
    title: 'National Bangladesh Leaderboard',
    subtitle: 'Live Candidate Benchmarking',
    desc: 'Compare your scaled scores with thousands of Bangladeshi examinees nationwide. Track your study consistency, earn merit badges, and get hired faster by Japanese employers.',
    badge: 'National Rank',
    color: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-400',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="space-y-8 sm:space-y-12">
      <ScrollReveal variant="up" duration={600}>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Gakkou No Shiken</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Engineered for Guaranteed Prometric Exam Success
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Everything you need to master the Japanese language and technical skill assessments required for working in Japan under the SSW visa program.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={idx} variant="up" delay={idx * 80} duration={600}>
              <div className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-md hover:shadow-xl hover-lift transition-all duration-300 flex flex-col justify-between h-full hover-shine-container space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${item.lightBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {item.subtitle}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Aligned with 2026 Test Standards</span>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
