'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  MessageSquare,
  Headphones,
  FileCheck2,
  ChevronDown,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Zap,
  Target,
  Clock,
  ShieldCheck,
  Languages,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'script_vocab',
    title_en: 'Script & Vocabulary',
    title_ja: '文字と語彙',
    short_name: 'Vocab',
    badge: 'Section 1',
    badgeColor: 'bg-rose-50 text-japan-red border-rose-200',
    iconColor: 'bg-rose-500/10 text-japan-red',
    icon: BookOpen,
    questions: '12 Questions',
    timeEst: '~12 Mins',
    desc: 'Tests everyday kanji reading, contextual vocabulary, and supermarket & station signage words.',
    keyPoints: [
      'Underlined kanji to hiragana reading',
      'Contextual word selection for daily life',
      'Signs, transportation & food labels',
    ],
  },
  {
    id: 'conversation',
    title_en: 'Conversation & Expression',
    title_ja: '会話と表現',
    short_name: 'Dialogue',
    badge: 'Section 2',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconColor: 'bg-indigo-500/10 text-indigo-600',
    icon: MessageSquare,
    questions: '12 Questions',
    timeEst: '~15 Mins',
    desc: 'Evaluates practical grammar, polite expressions (desu/masu), and conversational workplace etiquette.',
    keyPoints: [
      'Natural dialogue replies in workplace & shops',
      'Fill-in particles (に, で, を, が, は)',
      'Giving requests and asking permission',
    ],
  },
  {
    id: 'listening',
    title_en: 'Listening Comprehension',
    title_ja: '聴解',
    badge: 'Section 3',
    short_name: 'Audio',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconColor: 'bg-amber-500/10 text-amber-600',
    icon: Headphones,
    questions: '12 Questions',
    timeEst: '~20 Mins',
    desc: 'Assesses ability to understand authentic spoken Japanese in stores, train stations, and clinics.',
    keyPoints: [
      'Short announcements & phone messages',
      'Illustration matching with audio dialogue',
      '1-play authentic CBT Prometric audio',
    ],
  },
  {
    id: 'reading',
    title_en: 'Reading Comprehension',
    title_ja: '読解',
    badge: 'Section 4',
    short_name: 'Reading',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconColor: 'bg-emerald-500/10 text-emerald-600',
    icon: FileCheck2,
    questions: '6 Questions',
    timeEst: '~13 Mins',
    desc: 'Tests reading informational flyers, schedules, apartment notices, emails, and instructions.',
    keyPoints: [
      'Flyers, clinic schedules, memos',
      'Email communications & workplace guides',
      'Extracting numerical & time information',
    ],
  },
];

const FAQS = [
  {
    q: 'What is JFT-Basic vs JLPT N4?',
    a: 'JFT-Basic is a 60-minute Computer-Based Test (CBT) with instant results and 10-language translations, designed specifically for Japan\'s Specified Skilled Worker (SSW-1) visa.',
  },
  {
    q: 'How is the 10–250 scaled score calculated?',
    a: 'JFT-Basic uses official Prometric IRT scaling (10 to 250 points). The passing mark is 200 points (approx. 80%), equivalent to CEFR A2 level competency.',
  },
  {
    q: 'Can I retake mock tests on Gakkou No Shiken?',
    a: 'Yes! You can take practice tests unlimited times with personalized diagnostic analysis tracked on your Candidate Dashboard.',
  },
  {
    q: 'Are the practice tests timed like the actual exam?',
    a: 'Yes. All mock tests feature our authentic 60-minute countdown timer with automatic audio players and instant Prometric scorecards.',
  },
];

export default function StudentExamGuide() {
  const [activeSectionTab, setActiveSectionTab] = useState(0);
  const [activeBottomTab, setActiveBottomTab] = useState('rules'); // 'rules' or 'faq'
  const [openFaq, setOpenFaq] = useState(0);

  const activeSec = SECTIONS[activeSectionTab];
  const ActiveIcon = activeSec.icon;

  return (
    <div className="space-y-8 sm:space-y-16 animate-fade-in-up">
      {/* 1. JFT-Basic 4-Section Exam Blueprint */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-japan-red text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Exam Structure &amp; Syllabus</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Master the 4 JFT-Basic Sections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              42 questions across 4 core competencies. Target 200+ points to achieve CEFR A2 qualification.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-japan-red" />
            <span>Total Time: 60 Minutes</span>
          </div>
        </div>

        {/* --- MOBILE VIEW: Interactive Clean Segmented Tab Switcher (< md) --- */}
        <div className="block md:hidden space-y-3">
          {/* Segmented Pill Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            {SECTIONS.map((sec, idx) => {
              const TabIcon = sec.icon;
              const isActive = activeSectionTab === idx;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionTab(idx)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-japan-red' : 'text-slate-400'}`} />
                  <span className="truncate">{sec.short_name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Single Card Display on Mobile */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSec.iconColor}`}>
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {activeSec.title_en}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-bold">{activeSec.title_ja}</span>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${activeSec.badgeColor}`}>
                {activeSec.badge}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">{activeSec.questions}</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">{activeSec.timeEst}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeSec.desc}
            </p>

            <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              {activeSec.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- DESKTOP VIEW: 4-Column Grid (>= md) --- */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between space-y-5 hover-lift group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sec.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${sec.badgeColor}`}>
                      {sec.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-japan-red transition-colors">
                      {sec.title_en}
                    </h3>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">{sec.title_ja}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                      {sec.questions}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-500">
                      {sec.timeEst}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {sec.desc}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {sec.keyPoints.map((pt, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-500 font-bold text-xs mt-0.5">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-extrabold text-japan-red group-hover:underline flex items-center gap-1">
                    <span>Practice section</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Study Strategy & Candidate FAQ Toolkit */}
      <section className="space-y-4">
        {/* Mobile View Toggle Switcher (< lg) */}
        <div className="flex lg:hidden items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveBottomTab('rules')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeBottomTab === 'rules'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Exam Rules
          </button>
          <button
            onClick={() => setActiveBottomTab('faq')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeBottomTab === 'faq'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ❓ Common FAQs
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          {/* Left Column: Prometric CBT Test-Day Strategy Checklist */}
          <div
            className={`lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-800 shadow-xl space-y-4 sm:space-y-6 relative overflow-hidden ${
              activeBottomTab === 'rules' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="space-y-1 sm:space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>Test Rules</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Test-Day Guidelines &amp; Rules
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-normal">
                Essential knowledge to maximize your scaled score on exam day.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 relative z-10">
              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-japan-red/20 text-rose-300 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <strong className="text-xs sm:text-sm font-extrabold text-white block">200 / 250 Passing Standard</strong>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Scaled score of 200+ (80%) qualifies for Japan SSW certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <strong className="text-xs sm:text-sm font-extrabold text-white block">60-Minute Non-Stop Timer</strong>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    The timer runs continuously without pauses across all 4 sections.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                  <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <strong className="text-xs sm:text-sm font-extrabold text-white block">10 Native Language Helpers</strong>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Use in-test translations in English, Bengali, Vietnamese, etc.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 sm:pt-2 relative z-10">
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                <span>View Candidate Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Frequently Asked Questions Accordion */}
          <div
            className={`lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-xs space-y-4 sm:space-y-6 ${
              activeBottomTab === 'faq' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>FAQ</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                Quick answers about JFT-Basic exam rules and mock features.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full p-3 sm:p-4 text-left flex items-center justify-between gap-2.5 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {faq.q}
                      </span>
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                          isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal animate-fade-in border-t border-indigo-100/60 pt-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
