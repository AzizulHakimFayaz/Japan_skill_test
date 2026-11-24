'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Compass,
  ShieldCheck,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function LearningHubShowcase() {
  const cardBase =
    'group relative h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800 hover:border-[#FF9494] hover:bg-[#FFF5E4]/50 dark:hover:bg-slate-800/80 p-3.5 sm:p-5 shadow-2xs hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer text-left';
  const badgeBase =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFE3E1] dark:bg-slate-800 text-[#9F2B39] dark:text-[#FFD1D1] text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-[#FFD1D1] dark:border-slate-700';
  const ctaPrimary =
    'inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-3 py-1.5 rounded-lg bg-[#D94E5D] group-hover:bg-[#BE3B4A] shadow-2xs transition-colors';
  const ctaInk =
    'inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-white px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-[#D94E5D] dark:bg-slate-800 dark:group-hover:bg-[#D94E5D] shadow-2xs transition-colors';
  const pillNav =
    'text-[10px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-[#FFF5E4] hover:bg-[#FFE3E1] dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-[#FFD1D1] dark:border-slate-700 transition-colors whitespace-nowrap';

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800/90 p-3.5 sm:p-6 lg:p-7 shadow-sm transition-all">
      {/* Subtle Sakura Corner Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFE3E1]/60 dark:bg-[#FF9494]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFE3E1] dark:border-slate-800/80 pb-3.5 mb-4 sm:mb-5">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#B83B4A] dark:text-[#FF9494]">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D94E5D]" />
            <span>Complete Japanese Exam &amp; Study Suite</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            Exams, Lessons, Games &amp; Study Tools
          </h2>
        </div>

        {/* Ordered Quick Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
          <Link href="/jft-basic" className={pillNav}>
            <span>JFT-Basic ↗</span>
          </Link>
          <Link
            href="/jlpt"
            className="text-[10px] sm:text-xs font-black text-[#9F2B39] dark:text-[#FFD1D1] bg-[#FFE3E1] hover:bg-[#FFD1D1] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#FF9494] dark:border-slate-700 transition-colors whitespace-nowrap"
          >
            <span>JLPT N5–N1 ↗</span>
          </Link>
          <Link href="/ssw-skill-test" className={pillNav}>
            <span>SSW ↗</span>
          </Link>
          <Link href="/lessons" className={pillNav}>
            <span>Lessons ↗</span>
          </Link>
          <Link href="/game-zone" className={pillNav}>
            <span>Game Zone ↗</span>
          </Link>
          <Link href="/tools" className={pillNav}>
            <span>Tools ↗</span>
          </Link>
          <Link href="/about" className={pillNav}>
            <span>About Us ↗</span>
          </Link>
        </div>
      </div>

      {/* ROW 1: 3 PRIMARY EXAM PILLARS (1. JFT-Basic, 2. JLPT, 3. SSW) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* 1. JFT-BASIC */}
        <ScrollReveal variant="up" delay={0} duration={400} className="h-full">
          <Link href="/jft-basic" className={cardBase}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#D94E5D] flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className={badgeBase}>A1 • A2 CBT</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  JFT-Basic Mock Tests
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  Authentic Prometric CBT simulator with native listening audio &amp; instant 250-point CEFR score.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaPrimary}>
                <span>Start JFT-Basic</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[10px] font-bold text-[#B83B4A]">4 Sections</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 2. JLPT (N5–N1) */}
        <ScrollReveal variant="up" delay={50} duration={400} className="h-full">
          <Link href="/jlpt" className={cardBase}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white group-hover:bg-[#D94E5D] group-hover:scale-105 transition-all shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className={badgeBase}>N5 – N1 • New</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  JLPT Mock Hub
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  3-min level checker, N5–N1 difficulty guide &amp; 32,800+ questions with 7-language explanations.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaPrimary}>
                <span>Explore JLPT</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[10px] font-bold text-[#B83B4A]">1,935 Sets</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 3. SSW SKILL TESTS */}
        <ScrollReveal variant="up" delay={100} duration={400} className="h-full">
          <Link href="/ssw-skill-test" className={cardBase}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 flex items-center justify-center text-[#C94A5A] dark:text-[#FF9494] group-hover:scale-105 transition-transform shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className={badgeBase}>Specified Skilled</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  SSW Skill Tests
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  Sector-specific CBT mock exams for Caregiving, Food Service, Agriculture &amp; Construction.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Practice SSW</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[10px] font-bold text-slate-500">Work Visa</span>
            </div>
          </Link>
        </ScrollReveal>
      </div>

      {/* ROW 2: 4 SUPPORTING PILLARS (4. Lessons, 5. Game Zone, 6. Study Tools, 7. About Us) */}
      <div className="relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1.5 scrollbar-none lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
        {/* 4. LESSONS */}
        <ScrollReveal variant="up" delay={140} duration={400} className="w-[175px] sm:w-[215px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/lessons" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/lessons_hub_icon.png" alt="Lessons Hub" className="w-full h-full object-cover" />
                </div>
                <span className={badgeBase}>80 Units</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  Lessons Hub
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                  50 Vocab &amp; 30 Kanji units with native audio &amp; Bangla meanings
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Start Lessons</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">N5 • N4</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 5. GAME ZONE */}
        <ScrollReveal variant="up" delay={180} duration={400} className="w-[175px] sm:w-[215px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/game-zone" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/game_zone_icon.png" alt="Game Zone" className="w-full h-full object-cover" />
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
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                  Kanji Hunter, Word Match, Sentence Builder &amp; Arcade Ranks
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

        {/* 6. STUDY TOOLS */}
        <ScrollReveal variant="up" delay={220} duration={400} className="w-[175px] sm:w-[215px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/tools" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#FFD1D1] dark:border-slate-700 bg-[#FFF5E4] group-hover:scale-105 transition-transform shrink-0">
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
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                  Flashcards, Particle Drills, JAC Textbooks &amp; Salary Calculator
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaInk}>
                <span>Open Tools</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500">Utilities</span>
            </div>
          </Link>
        </ScrollReveal>

        {/* 7. ABOUT US */}
        <ScrollReveal variant="up" delay={260} duration={400} className="w-[175px] sm:w-[215px] lg:w-auto shrink-0 snap-start h-auto">
          <Link href="/about" className={cardBase}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 flex items-center justify-center text-[#C94A5A] dark:text-[#FF9494] group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className={badgeBase}>
                  <Award className="w-2.5 h-2.5 text-[#D94E5D]" />
                  <span>Verified</span>
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D94E5D] transition-colors leading-tight">
                  About Us
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                  Prometric fidelity, audio engine, partner schools &amp; mission
                </p>
              </div>
            </div>
            <div className="pt-2.5 mt-2 border-t border-[#FFE3E1] dark:border-slate-800 flex items-center justify-between">
              <span className={ctaPrimary}>
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-[#B83B4A]">100% Match</span>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
