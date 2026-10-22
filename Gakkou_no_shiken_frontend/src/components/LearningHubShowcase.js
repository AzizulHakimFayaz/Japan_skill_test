'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  GraduationCap,
  Sparkles,
  BookOpen,
  Volume2,
  RotateCw,
  ArrowRight,
  Flame,
  CheckCircle2,
  Compass,
  Zap,
  BookOpenCheck,
  Library,
  BellRing,
  ShieldCheck,
  FileText,
  Building2,
  Layers,
  Award,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

// Curated daily high-frequency Japanese vocabulary for quick interactive learning
const DAILY_VOCAB_LIST = [
  {
    word: '約束',
    furigana: 'やくそく',
    romaji: 'yakusoku',
    type: 'N5',
    meaning_en: 'Promise / Appointment',
    meaning_bn: 'প্রতিশ্রুতি / সাক্ষাতের সময়',
  },
  {
    word: '準備',
    furigana: 'じゅんび',
    romaji: 'junbi',
    type: 'N5',
    meaning_en: 'Preparation / Setup',
    meaning_bn: 'প্রস্তুতি / আয়োজন',
  },
  {
    word: '安全',
    furigana: 'あんぜん',
    romaji: 'anzen',
    type: 'SSW',
    meaning_en: 'Safety / Security',
    meaning_bn: 'নিরাপত্তা / সুরক্ষিত',
  },
  {
    word: '挨拶',
    furigana: 'あいさつ',
    romaji: 'aisatsu',
    type: 'N5',
    meaning_en: 'Greeting / Salutation',
    meaning_bn: 'অভিবাদন / সালাম',
  },
  {
    word: '合格',
    furigana: 'ごうかく',
    romaji: 'goukaku',
    type: 'N5',
    meaning_en: 'Exam Pass / Success',
    meaning_bn: 'পরীক্ষায় উত্তীর্ণ / পাস',
  },
];

export default function LearningHubShowcase() {
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentWord = DAILY_VOCAB_LIST[vocabIndex];

  const handleNextWord = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVocabIndex((prev) => (prev + 1) % DAILY_VOCAB_LIST.length);
  };

  const handleSpeakJapanese = (e, text) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3 sm:p-6 lg:p-7 shadow-lg shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3.5 sm:mb-5">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-japan-red dark:text-rose-400">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
            <span>Interactive Learning &amp; Resource Suite</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            Interactive Practice, Guides &amp; Resource Hub
          </h2>
        </div>

        {/* Quick Navigation Pills with Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
          <Link
            href="/guides"
            className="text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors whitespace-nowrap"
          >
            <span>Guides ↗</span>
          </Link>
          <Link
            href="/books"
            className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap"
          >
            <span>Materials ↗</span>
          </Link>
          <Link
            href="/notices"
            className="text-[10px] sm:text-xs font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors whitespace-nowrap"
          >
            <span>Notices ↗</span>
          </Link>
          <Link
            href="/about"
            className="text-[10px] sm:text-xs font-black text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors whitespace-nowrap"
          >
            <span>About Us ↗</span>
          </Link>
          <Link
            href="/game-zone"
            className="text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors whitespace-nowrap"
          >
            <span>Arcade ↗</span>
          </Link>
          <Link
            href="/lessons"
            className="text-[10px] sm:text-xs font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800 transition-colors whitespace-nowrap"
          >
            <span>Lessons ↗</span>
          </Link>
        </div>
      </div>

      {/* ============================================================
          RESPONSIVE 8-TILE GRID:
          - 2 Columns on Mobile Screens (4 rows of 2 compact tiles)
          - 4 Columns on Desktop Screens (2 rows of 4 balanced tiles)
          - Covering: Guides, Materials, Notices, About Us, Game Zone,
            Lessons Hub, Study Tools, and Daily Vocab!
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* ─── CARD 1: EXAM GUIDES ─── */}
        <ScrollReveal variant="up" delay={0} duration={400} className="h-full">
          <Link
            href="/guides"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-amber-200/90 dark:border-amber-900/60 hover:border-amber-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-amber-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-amber-600/30 group-hover:scale-110 transition-transform shrink-0 border border-amber-300/60 dark:border-amber-800 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                  <BookOpenCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-amber-200/80 dark:border-amber-800">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>12 Guides</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                  Exam Guides
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  30-day study plan, scoring &amp; SSW guides
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-amber-100 dark:border-amber-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-amber-600 group-hover:bg-amber-700 shadow-xs transition-colors">
                <span>Read Guides</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-amber-600 dark:text-amber-400">Plans</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 2: STUDY MATERIALS & JAC TEXTBOOKS ─── */}
        <ScrollReveal variant="up" delay={50} duration={400} className="h-full">
          <Link
            href="/books"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-emerald-200/90 dark:border-emerald-900/60 hover:border-emerald-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform shrink-0 border border-emerald-300/60 dark:border-emerald-800 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                  <Library className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-emerald-200/80 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span>26 Books</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  Study Materials
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Official JAC textbooks, PDFs &amp; audio
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-emerald-100 dark:border-emerald-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-emerald-600 group-hover:bg-emerald-700 shadow-xs transition-colors">
                <span>Browse Books</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-emerald-600 dark:text-emerald-400">JAC PDF</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 3: EXAM NOTICES & CIRCULARS ─── */}
        <ScrollReveal variant="up" delay={100} duration={400} className="h-full">
          <Link
            href="/notices"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-sky-200/90 dark:border-sky-900/60 hover:border-sky-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-sky-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-sky-600/30 group-hover:scale-110 transition-transform shrink-0 border border-sky-300/60 dark:border-sky-800 bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                  <BellRing className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-sky-200/80 dark:border-sky-800">
                  <Zap className="w-2.5 h-2.5 text-sky-500" />
                  <span>Circulars</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                  Exam Notices
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Prometric booking dates, venues &amp; news
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-sky-100 dark:border-sky-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-sky-600 group-hover:bg-sky-700 shadow-xs transition-colors">
                <span>View Notices</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-sky-600 dark:text-sky-400">Official</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 4: ABOUT OUR CBT SIMULATOR ─── */}
        <ScrollReveal variant="up" delay={150} duration={400} className="h-full">
          <Link
            href="/about"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-rose-50/80 via-white to-rose-50/40 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-rose-200/90 dark:border-rose-900/60 hover:border-rose-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-rose-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform shrink-0 border border-rose-300/60 dark:border-rose-800 bg-gradient-to-br from-japan-red to-rose-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-japan-red dark:text-rose-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-rose-200/80 dark:border-rose-800">
                  <Award className="w-2.5 h-2.5 text-amber-500" />
                  <span>100% Match</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors leading-tight">
                  About Us
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Prometric fidelity, audio engine &amp; mission
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-rose-100 dark:border-rose-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-japan-red group-hover:bg-japan-redhover shadow-xs transition-colors">
                <span>Learn More</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-japan-red dark:text-rose-400">Verified</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 5: GAME ZONE ─── */}
        <ScrollReveal variant="up" delay={200} duration={400} className="h-full">
          <Link
            href="/game-zone"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-purple-50/80 via-white to-purple-50/40 dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-purple-200/90 dark:border-purple-900/60 hover:border-purple-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-purple-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform shrink-0 border border-purple-300/60 dark:border-purple-800 bg-purple-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/game_zone_icon.png"
                    alt="Japanese Game Zone"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-purple-200/80 dark:border-purple-800">
                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                  <span>8 Games</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                  Game Zone
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Kanji Hunter, Word Match &amp; 3 Lives
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-purple-100 dark:border-purple-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-purple-600 group-hover:bg-purple-700 shadow-xs transition-colors">
                <span>Play Now</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-purple-600 dark:text-purple-400">Arcade</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 6: STRUCTURED LESSONS ─── */}
        <ScrollReveal variant="up" delay={250} duration={400} className="h-full">
          <Link
            href="/lessons"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-cyan-50/80 via-white to-cyan-50/40 dark:from-cyan-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-cyan-200/90 dark:border-cyan-900/60 hover:border-cyan-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-cyan-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-cyan-600/30 group-hover:scale-110 transition-transform shrink-0 border border-cyan-300/60 dark:border-cyan-800 bg-cyan-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/lessons_hub_icon.png"
                    alt="Lessons Hub"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-cyan-200/80 dark:border-cyan-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span>N5 • N4</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                  Lessons Hub
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  50 Vocab &amp; 30 Kanji units with audio
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-cyan-100 dark:border-cyan-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-cyan-600 group-hover:bg-cyan-700 shadow-xs transition-colors">
                <span>Start</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-cyan-600 dark:text-cyan-400">80 Units</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 7: INTERACTIVE STUDY TOOLS ─── */}
        <ScrollReveal variant="up" delay={300} duration={400} className="h-full">
          <Link
            href="/tools"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-indigo-200/90 dark:border-indigo-900/60 hover:border-indigo-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-indigo-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-indigo-600/30 group-hover:scale-110 transition-transform shrink-0 border border-indigo-300/60 dark:border-indigo-800 bg-indigo-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/study_tools_icon.png"
                    alt="Study Tools"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-indigo-200/80 dark:border-indigo-800">
                  <Compass className="w-2.5 h-2.5 text-indigo-500" />
                  <span>Free Tools</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                  Study Tools
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Flashcards, Particle Drills &amp; JAC Books
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-indigo-100 dark:border-indigo-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 shadow-xs transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Drills</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* ─── CARD 8: DAILY VOCABULARY & WORD OF THE DAY (INTERACTIVE) ─── */}
        <ScrollReveal variant="up" delay={350} duration={400} className="h-full">
          <Link
            href="/lessons"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-gradient-to-b from-rose-50/80 via-white to-rose-50/40 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-rose-200/90 dark:border-rose-900/60 hover:border-rose-500 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:shadow-rose-500/15 active:scale-95 transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform shrink-0 border border-rose-300/60 dark:border-rose-800 bg-rose-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/daily_vocab_icon.png"
                    alt="Daily Vocabulary"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {/* Shuffle Button */}
                  <button
                    type="button"
                    onClick={handleNextWord}
                    aria-label="Next Word"
                    title="Next Word"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  {/* Audio Speaker Button */}
                  <button
                    type="button"
                    onClick={(e) => handleSpeakJapanese(e, currentWord.word)}
                    aria-label="Pronounce Word"
                    title="Pronounce Japanese Word"
                    className={`p-1 rounded-md border transition-all ${
                      isSpeaking
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-base font-black text-japan-red dark:text-rose-400 leading-tight">
                    {currentWord.word}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate">
                    ({currentWord.furigana})
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                  {currentWord.meaning_en}
                </p>
                <p className="text-[9px] sm:text-[10px] text-rose-600 dark:text-rose-400 font-semibold font-bengali line-clamp-1">
                  বাংলা: {currentWord.meaning_bn}
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 mt-1.5 border-t border-rose-100 dark:border-rose-950/80 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-japan-red group-hover:bg-japan-redhover shadow-xs transition-colors">
                <span>Study</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-rose-600 dark:text-rose-400">2,690+ Words</span>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
