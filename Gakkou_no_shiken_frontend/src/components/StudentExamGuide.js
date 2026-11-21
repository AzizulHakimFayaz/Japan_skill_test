'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import {
  BookOpen,
  MessageSquare,
  Headphones,
  FileCheck2,
  ChevronDown,
  HelpCircle,
  Clock,
  Target,
  Languages,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'script_vocab',
    title_en: 'Script & Vocabulary',
    title_ja: '文字と語彙',
    badge: 'Section 1',
    badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    iconColor: 'bg-rose-500/10 text-japan-red dark:text-rose-400',
    icon: BookOpen,
    questions: '12 Qs',
    timeEst: '~12m',
    desc: 'Everyday kanji reading, contextual vocabulary, and daily signage.',
  },
  {
    id: 'conversation',
    title_en: 'Conversation & Expression',
    title_ja: '会話と表現',
    badge: 'Section 2',
    badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    iconColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    icon: MessageSquare,
    questions: '12 Qs',
    timeEst: '~15m',
    desc: 'Practical grammar, polite expressions, and workplace dialogue.',
  },
  {
    id: 'listening',
    title_en: 'Listening Comprehension',
    title_ja: '聴解',
    badge: 'Section 3',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    iconColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: Headphones,
    questions: '12 Qs',
    timeEst: '~20m',
    desc: 'Spoken Japanese in stores, stations, clinics, and announcements.',
  },
  {
    id: 'reading',
    title_en: 'Reading Comprehension',
    title_ja: '読解',
    badge: 'Section 4',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: FileCheck2,
    questions: '6 Qs',
    timeEst: '~13m',
    desc: 'Flyers, schedules, emails, notices, and workplace instructions.',
  },
];

const FAQS = [
  {
    q: 'What is JFT-Basic vs JLPT N4?',
    a: "JFT-Basic is a 60-minute Computer-Based Test (CBT) with fast results and multilingual instructions, designed specifically for Japan's Specified Skilled Worker (SSW-1) visa.",
  },
  {
    q: 'How is the 10–250 scaled score calculated?',
    a: 'JFT-Basic uses a 10 to 250 scaled score system. The passing benchmark is 200 points (equivalent to CEFR A2 level).',
  },
  {
    q: 'Can I retake mock tests on Gakkou No Shiken?',
    a: 'Yes! You can practice unlimited times and review detailed explanations and performance stats on your dashboard.',
  },
  {
    q: 'Are the practice tests timed like the actual exam?',
    a: 'Yes. Each mock test simulates the 60-minute CBT timer, listening audio playback, and instant scaled practice score reports so you can get familiar with the test interface.',
  },
];

export default function StudentExamGuide() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Compact JFT-Basic 4-Section Overview */}
      <ScrollReveal variant="up" duration={600}>
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                JFT-Basic Exam Format
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                42 questions across 4 CBT sections — target 200/250 to pass.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-japan-red" />
                60 Mins
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                200/250 Pass
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Languages className="w-3.5 h-3.5 text-indigo-500" />
                10 Languages
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={sec.id}
                  href="/tests?category=basic"
                  className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sec.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${sec.badgeColor}`}>
                      {sec.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors leading-snug">
                      {sec.title_en}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">{sec.title_ja}</span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {sec.questions} · {sec.timeEst}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sec.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* 2. Compact FAQ Accordion */}
      <ScrollReveal variant="up" duration={600} delay={60}>
        <section className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden h-fit ${
                    isOpen
                      ? 'border-indigo-300 dark:border-indigo-700/80 bg-indigo-50/30 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-2.5 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                        isOpen
                          ? 'bg-indigo-600 text-white rotate-180'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-indigo-100/60 dark:border-indigo-900/40 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
