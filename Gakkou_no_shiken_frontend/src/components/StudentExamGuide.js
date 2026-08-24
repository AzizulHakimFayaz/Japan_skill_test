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
    badge: 'Section 1',
    badgeColor: 'bg-rose-50 text-japan-red border-rose-200',
    iconColor: 'bg-rose-500/10 text-japan-red',
    icon: BookOpen,
    questions: '12 Questions',
    timeEst: '~12 Mins',
    desc: 'Tests everyday kanji reading (hiragana to kanji, kanji to hiragana), contextual vocabulary, and life situation keywords.',
    keyPoints: [
      'Everyday signs, supermarket notices, public transportation',
      'Underlined kanji word reading and matching',
      'Appropriate vocabulary usage in sentences',
    ],
  },
  {
    id: 'conversation',
    title_en: 'Conversation & Expression',
    title_ja: '会話と表現',
    badge: 'Section 2',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconColor: 'bg-indigo-500/10 text-indigo-600',
    icon: MessageSquare,
    questions: '12 Questions',
    timeEst: '~15 Mins',
    desc: 'Evaluates practical grammar, polite expressions (desu/masu), and conversational responses across work and daily life.',
    keyPoints: [
      'Natural dialogue replies and situational etiquette',
      'Fill-in-the-blank particles (に, で, を, が, は)',
      'Giving requests, asking permission, and making schedules',
    ],
  },
  {
    id: 'listening',
    title_en: 'Listening Comprehension',
    title_ja: '聴解',
    badge: 'Section 3',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconColor: 'bg-amber-500/10 text-amber-600',
    icon: Headphones,
    questions: '12 Questions',
    timeEst: '~20 Mins',
    desc: 'Assesses ability to understand authentic spoken Japanese in stores, train stations, workplaces, and medical clinics.',
    keyPoints: [
      'Short announcements, directions, and phone messages',
      'Picture and illustration matching with audio dialogue',
      'Questions with 1-play audio clips simulating CBT Prometric',
    ],
  },
  {
    id: 'reading',
    title_en: 'Reading Comprehension',
    title_ja: '読解',
    badge: 'Section 4',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconColor: 'bg-emerald-500/10 text-emerald-600',
    icon: FileCheck2,
    questions: '6 Questions',
    timeEst: '~13 Mins',
    desc: 'Tests reading short informational texts, flyers, schedules, apartment notices, emails, and instructions.',
    keyPoints: [
      'Flyers, clinic schedules, garbage disposal notices',
      'Email communications and workplace memos',
      'Extracting specific numerical and time information quickly',
    ],
  },
];

const FAQS = [
  {
    q: 'What is JFT-Basic and how does it compare to JLPT N4?',
    a: 'JFT-Basic (Japan Foundation Test for Basic Japanese) is a Computer-Based Test (CBT) designed specifically for foreign workers aiming for Japan\'s Specified Skilled Worker (SSW-1) visa. While JLPT N4 is paper-based, JFT-Basic uses a modern 60-minute Prometric computer interface with instant results and 10-language instruction translations.',
  },
  {
    q: 'How is the 10–250 scaled score calculated?',
    a: 'Rather than raw percentage, JFT-Basic uses official Prometric Item Response Theory (IRT) scaling from 10 to 250 points. The passing score is 200 points (approx. 80% accuracy), corresponding to CEFR A2 level competency.',
  },
  {
    q: 'Can I retake mock tests on Gakkou No Shiken?',
    a: 'Yes! You can take and retake all available practice tests unlimited times. All your attempts are tracked on your Candidate Dashboard with personalized diagnostic analysis across all 4 exam sections.',
  },
  {
    q: 'Are the practice tests timed like the actual exam?',
    a: 'Yes. All mock tests feature our authentic 60-minute countdown timer with automatic question navigation, audio listening players, and instant scorecards matching the real test center environment.',
  },
];

export default function StudentExamGuide() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in-up">
      {/* 1. JFT-Basic 4-Section Exam Blueprint */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-japan-red text-[11px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exam Structure &amp; Syllabus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Master the 4 JFT-Basic Exam Sections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              The official JFT-Basic exam contains 42 questions across 4 core competencies. Target 200+ points out of 250 to achieve A2 qualification.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-japan-red" />
            <span>Total Time: 60 Minutes</span>
          </div>
        </div>

        {/* 4 Clean Modern Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between space-y-5 hover-lift group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sec.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${sec.badgeColor}`}>
                      {sec.badge}
                    </span>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-japan-red transition-colors">
                      {sec.title_en}
                    </h3>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">{sec.title_ja}</span>
                  </div>

                  {/* Question & Time Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                      {sec.questions}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-500">
                      {sec.timeEst}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {sec.desc}
                  </p>

                  {/* Key Points */}
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {sec.keyPoints.map((pt, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-500 font-bold text-xs mt-0.5">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer CTA */}
                <div className="pt-2">
                  <span className="text-xs font-extrabold text-japan-red group-hover:underline flex items-center gap-1">
                    <span>Practice this section</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Study Strategy & Candidate FAQ Toolkit (2-Column Bento) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Prometric CBT Test-Day Strategy Checklist */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-japan-red/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[11px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Success Strategy</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Test-Day Guidelines &amp; Scoring Rules
            </h3>
            <p className="text-xs text-slate-300 font-normal">
              Essential knowledge to maximize your scaled score on the official Prometric exam day.
            </p>
          </div>

          <div className="space-y-3.5 relative z-10">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-japan-red/20 text-rose-300 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-white block">200 / 250 Passing Standard</strong>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  You need a scaled score of 200+ (approx. 80%) to qualify for the Japan Specified Skilled Worker (SSW) certificate.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-white block">60-Minute Non-Stop Timer</strong>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  The clock runs continuously. You can navigate back and forth between questions in the same section before submitting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-white block">10 Native Language Helpers</strong>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Use the in-test translation button to view instructions in English, Bengali, Vietnamese, Indonesian, Myanmar, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-white block">No Penalty for Guessing</strong>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  There is no negative marking. Always choose an answer for every single question before time expires.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 relative z-10">
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-red-500/25 active:scale-95 transition-all"
            >
              <span>View Candidate Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Frequently Asked Questions Accordion */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Candidate Knowledge Base</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Quick answers about JFT-Basic requirements, scoring standards, and mock exam features.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                        isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal animate-fade-in border-t border-indigo-100/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
