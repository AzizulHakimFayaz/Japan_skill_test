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
  Trophy,
  Swords,
  Headphones,
  Zap,
  Flame,
  CheckCircle2,
  Layers,
  Calculator,
  Compass,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

// Curated daily high-frequency Japanese vocabulary for quick interactive learning
const DAILY_VOCAB_LIST = [
  {
    word: '約束',
    furigana: 'やくそく',
    romaji: 'yakusoku',
    type: 'Noun • N5',
    meaning_en: 'Promise / Appointment',
    meaning_bn: 'প্রতিশ্রুতি / সাক্ষাতের সময়',
    sentence_ja: '友達と約束があります。',
    sentence_en: 'I have an appointment with a friend.',
  },
  {
    word: '準備',
    furigana: 'じゅんび',
    romaji: 'junbi',
    type: 'Noun / Suru • N5',
    meaning_en: 'Preparation / Setup',
    meaning_bn: 'প্রস্তুতি / আয়োজন',
    sentence_ja: '試験の準備をします。',
    sentence_en: 'I will prepare for the examination.',
  },
  {
    word: '安全',
    furigana: 'あんぜん',
    romaji: 'anzen',
    type: 'Na-Adj • SSW',
    meaning_en: 'Safety / Security',
    meaning_bn: 'নিরাপত্তা / সুরক্ষিত',
    sentence_ja: 'ヘルメットをかぶって安全に作業します。',
    sentence_en: 'Wear a helmet and work safely.',
  },
  {
    word: '挨拶',
    furigana: 'あいさつ',
    romaji: 'aisatsu',
    type: 'Noun / Suru • N5',
    meaning_en: 'Greeting / Salutation',
    meaning_bn: 'অভিবাদন / সালাম',
    sentence_ja: '職場では明るい挨拶が大切です。',
    sentence_en: 'Bright greetings are essential in the workplace.',
  },
  {
    word: '道具',
    furigana: 'どうぐ',
    romaji: 'dougu',
    type: 'Noun • SSW',
    meaning_en: 'Tool / Instrument',
    meaning_bn: 'যন্ত্রপাতি / হাতিয়ার',
    sentence_ja: '使った道具を元の場所に戻してください。',
    sentence_en: 'Please return used tools to their original place.',
  },
  {
    word: '合格',
    furigana: 'ごうかく',
    romaji: 'goukaku',
    type: 'Noun / Suru • N5',
    meaning_en: 'Passing an Exam / Success',
    meaning_bn: 'পরীক্ষায় উত্তীর্ণ / পাস করা',
    sentence_ja: 'JFT試験に合格しました！',
    sentence_en: 'I passed the JFT-Basic exam!',
  },
];

export default function LearningHubShowcase() {
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentWord = DAILY_VOCAB_LIST[vocabIndex];

  const handleNextWord = () => {
    setVocabIndex((prev) => (prev + 1) % DAILY_VOCAB_LIST.length);
  };

  const handleSpeakJapanese = (text) => {
    if (typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85; // Natural speaking pace for learners
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
    <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-7 lg:p-8 shadow-xl shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5 sm:mb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-[10px] font-black uppercase tracking-wider text-japan-red dark:text-rose-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Interactive Learning &amp; Game Suite</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Master Japanese Beyond Mock Exams
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            Level up your vocabulary, grammar, and listening with arcade games, structured JLPT lessons, interactive flashcards, and daily Kanji practice.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <Link
            href="/game-zone"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>All Games</span>
          </Link>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-bold transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>All Lessons</span>
          </Link>
        </div>
      </div>

      {/* 4 Feature Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* ============================================================
            MODULE 1: ARCADE GAME ZONE
            ============================================================ */}
        <ScrollReveal variant="up" delay={0} duration={500} className="h-full">
          <div className="group relative h-full flex flex-col justify-between rounded-2xl bg-gradient-to-b from-purple-50/70 via-white to-slate-50 dark:from-purple-950/25 dark:via-slate-900 dark:to-slate-900/80 border border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                  <span>8 Games</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Japanese Game Zone
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Learn Japanese vocabulary and Kanji while playing! Features retro sound effects and score tracking.
                </p>
              </div>

              {/* Game Chips */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <Swords className="w-3 h-3 text-pink-500 flex-shrink-0" />
                  <span className="truncate">Kanji Hunter</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <Layers className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="truncate">Word Match</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <Headphones className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                  <span className="truncate">Listen &amp; Catch</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">3 Lives Arcade</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between">
              <Link
                href="/game-zone"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/25 active:scale-95 transition-all"
              >
                <span>Play Games Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ============================================================
            MODULE 2: STRUCTURED LESSONS (N5 & N4)
            ============================================================ */}
        <ScrollReveal variant="up" delay={50} duration={500} className="h-full">
          <div className="group relative h-full flex flex-col justify-between rounded-2xl bg-gradient-to-b from-cyan-50/70 via-white to-slate-50 dark:from-cyan-950/25 dark:via-slate-900 dark:to-slate-900/80 border border-cyan-200/80 dark:border-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-500 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-200 dark:border-cyan-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span>N5 • N4</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Structured Lessons
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Minna no Nihongo &amp; JLPT syllabus with Kanji stroke orders, audio pronunciation &amp; Bengali meanings.
                </p>
              </div>

              {/* Lesson Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-black text-[10px] flex items-center justify-center">
                      N5
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Core Units 1–25</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">1,250+ Words</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-600 dark:text-teal-300 font-black text-[10px] flex items-center justify-center">
                      N4
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Core Units 26–50</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">1,440+ Words</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between">
              <Link
                href="/lessons"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs shadow-md shadow-cyan-600/25 active:scale-95 transition-all"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ============================================================
            MODULE 3: INTERACTIVE STUDY TOOLS
            ============================================================ */}
        <ScrollReveal variant="up" delay={100} duration={500} className="h-full">
          <div className="group relative h-full flex flex-col justify-between rounded-2xl bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/25 dark:via-slate-900 dark:to-slate-900/80 border border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                  <Compass className="w-2.5 h-2.5 text-indigo-500" />
                  <span>Free Tools</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Interactive Tools
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Specialized utilities built for Prometric CBT students to drill tricky grammar, flashcards &amp; salaries.
                </p>
              </div>

              {/* Tools list */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Link
                  href="/tools/flashcards"
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-rose-500 flex-shrink-0" />
                  <span className="truncate">3D Flashcards</span>
                </Link>

                <Link
                  href="/tools/particle-quiz"
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">Particle Drill</span>
                </Link>

                <Link
                  href="/tools/salary-calculator"
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Calculator className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">Salary Calc</span>
                </Link>

                <Link
                  href="/books"
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Layers className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                  <span className="truncate">26 JAC Books</span>
                </Link>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between">
              <Link
                href="/tools"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <span>Explore Tools</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ============================================================
            MODULE 4: DAILY VOCABULARY & WORD OF THE DAY (INTERACTIVE)
            ============================================================ */}
        <ScrollReveal variant="up" delay={150} duration={500} className="h-full">
          <div className="group relative h-full flex flex-col justify-between rounded-2xl bg-gradient-to-b from-rose-50/70 via-white to-slate-50 dark:from-rose-950/25 dark:via-slate-900 dark:to-slate-900/80 border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-japan-red text-white flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-japan-red dark:text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                    Daily Vocab
                  </span>
                  <button
                    type="button"
                    onClick={handleNextWord}
                    aria-label="Next Word"
                    title="Shuffle Next Word"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Daily Word Card */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">{currentWord.furigana}</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
                      {currentWord.word}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{currentWord.romaji}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeakJapanese(currentWord.word)}
                    aria-label="Speak pronunciation"
                    title="Listen to Japanese pronunciation"
                    className={`p-2 rounded-xl border transition-all ${
                      isSpeaking
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-slate-50 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-rose-50 hover:text-japan-red dark:hover:bg-rose-950/60'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 space-y-0.5 text-xs">
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {currentWord.meaning_en}
                  </div>
                  <div className="font-medium text-rose-600 dark:text-rose-400 text-[11px] line-clamp-1 font-bengali">
                    বাংলা: {currentWord.meaning_bn}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between">
              <Link
                href="/lessons"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-japan-red hover:bg-japan-redhover text-white font-black text-xs shadow-md shadow-red-600/25 active:scale-95 transition-all"
              >
                <span>Study 2,690+ Words</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
