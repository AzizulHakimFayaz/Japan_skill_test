'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
  Award,
  Trophy,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

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

  // Unified Sakura Cream Card Styling (#FFF5E4, #FFE3E1, #FFD1D1, #FF9494 + Crisp White & Deep Ink)
  const cardBase =
    'group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800 hover:border-[#FF9494] hover:bg-[#FFF5E4]/45 dark:hover:bg-slate-800/80 p-3 sm:p-4 shadow-2xs hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer text-left';
  const badgeBase =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFE3E1] dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-[#FFD1D1] dark:border-slate-700';
  const ctaPrimary =
    'inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-[#D94E5D] group-hover:bg-[#BE3B4A] shadow-2xs transition-colors';
  const ctaInk =
    'inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-2.5 py-1 rounded-lg bg-slate-900 group-hover:bg-[#D94E5D] dark:bg-slate-800 dark:group-hover:bg-[#D94E5D] shadow-2xs transition-colors';
  const pillNav =
    'text-[10px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-[#FFF5E4] hover:bg-[#FFE3E1] dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-[#FFD1D1] dark:border-slate-700 transition-colors whitespace-nowrap';

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800/90 p-3.5 sm:p-6 lg:p-7 shadow-sm transition-all">
      {/* Subtle Sakura Corner Tint */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFE3E1]/60 dark:bg-[#FF9494]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFE3E1] dark:border-slate-800/80 pb-3.5 mb-4 sm:mb-5">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#B83B4A] dark:text-[#FF9494]">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D94E5D]" />
            <span>Interactive Learning &amp; Resource Suite</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            Interactive Practice, Guides &amp; Resource Hub
          </h2>
        </div>

        {/* Unified Quick Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
          <Link
            href="/leaderboard"
            className="text-[10px] sm:text-xs font-black text-[#9F2B39] dark:text-[#FFD1D1] bg-[#FFE3E1] hover:bg-[#FFD1D1] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#FF9494] dark:border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Trophy className="w-3 h-3 text-[#D94E5D]" />
            <span>Leaderboard ↗</span>
          </Link>
          <Link href="/jlpt" className={pillNav}>
            <span>JLPT N5–N1 ↗</span>
          </Link>
          <Link href="/guides" className={pillNav}>
            <span>Guides ↗</span>
          </Link>
          <Link href="/books" className={pillNav}>
            <span>Materials ↗</span>
          </Link>
          <Link href="/notices" className={pillNav}>
            <span>Notices ↗</span>
          </Link>
          <Link href="/game-zone" className={pillNav}>
            <span>Arcade ↗</span>
          </Link>
          <Link href="/lessons" className={pillNav}>
            <span>Lessons ↗</span>
          </Link>
        </div>
      </div>

      {/* 8-Tile Responsive Grid */}
      <div className="relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1.5 scrollbar-none lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
        {/* 1. EXAM GUIDES */}
        <ScrollReveal variant="up" delay={0} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/guides" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 flex items-center justify-center text-[#C94A5A] dark:text-[#FF9494] group-hover:scale-105 transition-transform shrink-0">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <span className={badgeBase}>12 Guides</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Exam Guides
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  30-day study plan, scoring &amp; SSW guides
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Read Guides</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">Plans</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 2. STUDY MATERIALS */}
        <ScrollReveal variant="up" delay={40} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/books" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 flex items-center justify-center text-[#C94A5A] dark:text-[#FF9494] group-hover:scale-105 transition-transform shrink-0">
                  <Library className="w-5 h-5" />
                </div>
                <span className={badgeBase}>
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>26 Books</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Study Materials
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Official JAC textbooks, PDFs &amp; audio
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Browse Books</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">JAC PDF</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 3. EXAM NOTICES */}
        <ScrollReveal variant="up" delay={80} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/notices" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 flex items-center justify-center text-[#C94A5A] dark:text-[#FF9494] group-hover:scale-105 transition-transform shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <span className={badgeBase}>
                  <Zap className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>Circulars</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Exam Notices
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Prometric booking dates, venues &amp; news
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>View Notices</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">Updates</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 4. ABOUT US */}
        <ScrollReveal variant="up" delay={120} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/about" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#D94E5D] flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className={badgeBase}>
                  <Award className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>100% Match</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  About Us
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Prometric fidelity, audio engine &amp; mission
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaPrimary}>
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-[#C94A5A]">Verified</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 5. GAME ZONE */}
        <ScrollReveal variant="up" delay={160} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/game-zone" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/game_zone_icon.png" alt="Japanese Game Zone" className="w-full h-full object-cover" />
                </div>
                <span className={badgeBase}>
                  <Flame className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>8 Games</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Game Zone
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Kanji Hunter, Word Match &amp; 3 Lives
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Play Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">Arcade</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 6. LESSONS HUB */}
        <ScrollReveal variant="up" delay={200} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/lessons" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/lessons_hub_icon.png" alt="Lessons Hub" className="w-full h-full object-cover" />
                </div>
                <span className={badgeBase}>N5 • N4</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Lessons Hub
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  50 Vocab &amp; 30 Kanji units with audio
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Start</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">80 Units</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 7. STUDY TOOLS */}
        <ScrollReveal variant="up" delay={240} duration={400} className="w-[162px] sm:w-[198px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/tools" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/study_tools_icon.png" alt="Study Tools" className="w-full h-full object-cover" />
                </div>
                <span className={badgeBase}>
                  <Compass className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>Free Tools</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Study Tools
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Flashcards, Particle Drills &amp; JAC Books
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">Drills</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 8. DAILY VOCABULARY */}
        <ScrollReveal variant="up" delay={280} duration={400} className="w-[168px] sm:w-[205px] lg:w-auto shrink-0 snap-start h-auto">
          <Link
            href="/lessons"
            className="group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[#FFF5E4]/80 dark:bg-slate-900 border border-[#FF9494]/70 dark:border-slate-700 hover:border-[#D94E5D] p-3 sm:p-4 shadow-2xs hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer text-left"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-white shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/daily_vocab_icon.png" alt="Daily Vocabulary" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleNextWord}
                    aria-label="Next Word"
                    title="Next Word"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-[#FFE3E1] dark:hover:bg-white/10 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSpeakJapanese(e, currentWord.word)}
                    aria-label="Pronounce Word"
                    title="Pronounce Japanese Word"
                    className={`p-1 rounded-md border transition-all ${
                      isSpeaking
                        ? 'bg-[#D94E5D] text-white border-[#D94E5D] animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#FFD1D1] dark:border-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-base font-black text-[#C94A5A] dark:text-[#FF9494] leading-tight">
                    {currentWord.word}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate">
                    ({currentWord.furigana})
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                  {currentWord.meaning_en}
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#B83B4A] dark:text-[#FF9494] font-semibold font-bengali line-clamp-1">
                  বাংলা: {currentWord.meaning_bn}
                </p>
              </div>
            </div>

            <div className="pt-2.5 mt-2 border-t border-[#FFD1D1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaPrimary}>
                <span>Study</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-[#B83B4A]">2,690+ Words</span>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
