'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Home,
  ChevronRight,
  Zap,
  Calculator,
  BookOpen,
  CheckCircle2,
  Headphones,
  Award,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const TOOLS = [
  {
    id: 'flashcards',
    href: '/tools/flashcards',
    title: 'Daily Kanji & Vocab Flashcards',
    title_ja: '単語フラッシュカード',
    badge: 'Study Tool',
    badgeColor: 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: BookOpen,
    iconColor: 'from-rose-500 to-red-600',
    desc: 'Interactive 3D flip flashcards for JFT-Basic A2 high-frequency vocabulary and workplace SSW terms with audio pronunciation and Bengali meanings.',
    features: ['300+ JFT A2 Words', 'Audio Pronunciation', 'Bengali & English Meanings', 'Mastery Tracker'],
  },
  {
    id: 'salary-calculator',
    href: '/tools/salary-calculator',
    title: 'Japan SSW Salary & Cost Calculator',
    title_ja: '特定技能給与シミュレーター',
    badge: 'Career Calculator',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Calculator,
    iconColor: 'from-amber-500 to-yellow-600',
    desc: 'Calculate estimated monthly salary in JPY and BDT (৳), overtime pay, taxes, rent, living expenses, and net savings across 12 SSW sectors and Japanese prefectures.',
    features: ['12 SSW Sectors', 'Prefecture Rates (Tokyo, Osaka, etc.)', 'BDT (৳) Conversion', 'Tax & Rent Breakdown'],
  },
  {
    id: 'particle-quiz',
    href: '/tools/particle-quiz',
    title: 'Grammar Particle Drill Room',
    title_ja: '助詞・文法特訓',
    badge: 'Rapid Quiz',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: Zap,
    iconColor: 'from-emerald-500 to-teal-600',
    desc: 'Rapid 10-question drill room specifically designed for mastering tricky Japanese particles (に, で, を, が, は, へ, と) with instant Bengali grammar explanations.',
    features: ['10-Question Drills', 'Instant Bengali Feedback', 'Score Breakdown', 'All Key Particles'],
  },
];

export default function ToolsHubPage() {
  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">Candidate Tools</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-japan-navy text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-japan-red" />
          <span>Free Examination &amp; Career Tools</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Japanese Practice Tools &amp; Career Calculators
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Interactive tools designed specifically for Bangladeshi candidates preparing for JFT-Basic exams and Specified Skilled Worker careers in Japan.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOOLS.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <ScrollReveal key={tool.id} variant="up" delay={idx * 80} duration={500}>
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-full shadow-md hover:shadow-xl hover-lift transition-all space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.iconColor} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {tool.title_ja}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                      {tool.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="pt-2 space-y-1.5">
                    {tool.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={tool.href}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-japan-red dark:hover:bg-japan-red dark:hover:text-white transition-colors duration-200 shadow-md group"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
