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
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const MOBILE_PRIMARY_EXAMS = [
  {
    href: '/jft-basic',
    title: 'JFT-Basic',
    sub: 'A2 CBT • 4 Sections',
    cta: 'Start',
    icon: BookOpen,
    iconCls: 'bg-[#DB1A1A] text-white',
    ctaCls: 'bg-[#DB1A1A] text-white',
  },
  {
    href: '/jlpt',
    title: 'JLPT N5–N1',
    sub: '1,935 Mock Sets',
    cta: 'Explore',
    icon: GraduationCap,
    iconCls: 'bg-slate-900 dark:bg-slate-800 text-white',
    ctaCls: 'bg-[#DB1A1A] text-white',
  },
  {
    href: '/ssw-skill-test',
    title: 'SSW Skills',
    sub: 'Work Visa • 12 Sectors',
    cta: 'Practice',
    icon: Briefcase,
    iconCls: 'bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] border border-[#CBE5E3] dark:border-slate-700',
    ctaCls: 'bg-slate-900 dark:bg-slate-800 text-white',
  },
];

const MOBILE_SUPPORT_HUBS = [
  { href: '/lessons', title: 'Lessons', sub: '80 Units', img: '/img/lessons_hub_icon.png' },
  { href: '/game-zone', title: 'Game Zone', sub: '8 Games', img: '/img/game_zone_icon.png' },
  { href: '/tools', title: 'Study Tools', sub: 'Free Tools', img: '/img/study_tools_icon.png' },
  { href: '/books', title: 'PDF Books', sub: '26 Books', icon: BookOpen },
];

export default function LearningHubShowcase() {
  const cardBase =
    'group relative h-full flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] hover:bg-[#FFFFFF]/50 dark:hover:bg-slate-800/80 p-5 shadow-2xs hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer text-left';
  const badgeBase =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#CBE5E3] text-[10px] font-black uppercase tracking-wider border border-[#CBE5E3] dark:border-slate-700';
  const ctaPrimary =
    'inline-flex items-center gap-1 text-xs font-black text-white px-3 py-1.5 rounded-lg bg-[#DB1A1A] group-hover:bg-[#B81515] shadow-2xs transition-colors';
  const ctaInk =
    'inline-flex items-center gap-1 text-xs font-black text-white px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-[#DB1A1A] dark:bg-slate-800 dark:group-hover:bg-[#DB1A1A] shadow-2xs transition-colors';
  const pillNav =
    'text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-[#FFFFFF] hover:bg-[#EAF4F4] dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-[#CBE5E3] dark:border-slate-700 transition-colors whitespace-nowrap';

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800/90 p-3 sm:p-6 lg:p-7 shadow-sm transition-all">
      {/* Subtle Corner Glow */}
      <div className="hidden sm:block absolute -top-24 -right-24 w-72 h-72 bg-[#EAF4F4]/60 dark:bg-[#8CC7C4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ===================================================================
          MOBILE COMPACT APP-STYLE SUITE (< sm) — Less than half the height!
         =================================================================== */}
      <div className="sm:hidden space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Exams &amp; Study Suite
          </h2>
          <Link
            href="/about"
            className="text-[11px] font-extrabold text-[#2C687B] dark:text-[#8CC7C4]"
          >
            About Us →
          </Link>
        </div>

        {/* Row 1: Compact Horizontal Swipeable Exam Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-0.5 scrollbar-none">
          {MOBILE_PRIMARY_EXAMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-[162px] shrink-0 snap-start rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-[#CBE5E3] dark:border-slate-700/80 p-2.5 flex flex-col justify-between gap-2 active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconCls}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {item.sub}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[10px] font-black ${item.ctaCls}`}
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Row 2: Compact 2×2 Supporting Hub Tiles */}
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_SUPPORT_HUBS.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link
                key={hub.href}
                href={hub.href}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 active:scale-[0.98] transition"
              >
                {hub.img ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#CBE5E3] dark:border-slate-700 bg-white shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hub.img} alt={hub.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#2C687B] dark:text-[#8CC7C4] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">
                    {hub.title}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {hub.sub}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          TABLET & DESKTOP FULL SUITE (sm+) — Unchanged rich layout
         =================================================================== */}
      <div className="hidden sm:block">
        {/* Header Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF4F4] dark:border-slate-800/80 pb-3.5 mb-5">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
              <Sparkles className="w-3 h-3 text-[#DB1A1A]" />
              <span>Complete Japanese Exam &amp; Study Suite</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              Exams, Lessons, Games &amp; Study Tools
            </h2>
          </div>

          {/* Ordered Quick Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <Link href="/jft-basic" className={pillNav}>
              <span>JFT-Basic ↗</span>
            </Link>
            <Link
              href="/jlpt"
              className="text-xs font-black text-[#2C687B] dark:text-[#CBE5E3] bg-[#EAF4F4] hover:bg-[#CBE5E3] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#8CC7C4] dark:border-slate-700 transition-colors whitespace-nowrap"
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

        {/* ROW 1: 3 PRIMARY EXAM PILLARS */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mb-4">
          {/* 1. JFT-BASIC */}
          <ScrollReveal variant="up" delay={0} duration={400} className="h-auto">
            <Link href="/jft-basic" className={cardBase}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#DB1A1A] flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className={badgeBase}>A1 • A2 CBT</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    JFT-Basic Mock Tests
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                    Authentic Prometric CBT simulator with native listening audio &amp; instant 250-point CEFR score.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaPrimary}>
                  <span>Start JFT-Basic</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-[#2C687B]">4 Sections</span>
              </div>
            </Link>
          </ScrollReveal>

          {/* 2. JLPT (N5–N1) */}
          <ScrollReveal variant="up" delay={50} duration={400} className="h-auto">
            <Link href="/jlpt" className={cardBase}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white group-hover:bg-[#DB1A1A] group-hover:scale-105 transition-all shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className={badgeBase}>N5 – N1 • New</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    JLPT Mock Hub
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                    3-min level checker, N5–N1 difficulty guide &amp; 32,800+ questions with 7-language explanations.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaPrimary}>
                  <span>Explore JLPT</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-[#2C687B]">1,935 Sets</span>
              </div>
            </Link>
          </ScrollReveal>

          {/* 3. SSW SKILL TESTS */}
          <ScrollReveal variant="up" delay={100} duration={400} className="h-auto">
            <Link href="/ssw-skill-test" className={cardBase}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#2C687B] dark:text-[#8CC7C4] group-hover:scale-105 transition-transform shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className={badgeBase}>Specified Skilled</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    SSW Skill Tests
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                    Sector-specific CBT mock exams for Caregiving, Food Service, Agriculture &amp; Construction.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaInk}>
                  <span>Practice SSW</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">Work Visa</span>
              </div>
            </Link>
          </ScrollReveal>
        </div>

        {/* ROW 2: 4 SUPPORTING PILLARS */}
        <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 4. LESSONS */}
          <ScrollReveal variant="up" delay={140} duration={400} className="h-auto">
            <Link href="/lessons" className={cardBase}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#CBE5E3] dark:border-slate-700 bg-[#FFFFFF] group-hover:scale-105 transition-transform shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/lessons_hub_icon.png" alt="Lessons Hub" className="w-full h-full object-cover" />
                  </div>
                  <span className={badgeBase}>80 Units</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    Lessons Hub
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                    50 Vocab &amp; 30 Kanji units with native audio &amp; Bangla meanings
                  </p>
                </div>
              </div>
              <div className="pt-2.5 mt-2 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaInk}>
                  <span>Start Lessons</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">N5 • N4</span>
              </div>
            </Link>
          </ScrollReveal>

          {/* 5. GAME ZONE */}
          <ScrollReveal variant="up" delay={180} duration={400} className="h-auto">
            <Link href="/game-zone" className={cardBase}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#CBE5E3] dark:border-slate-700 bg-[#FFFFFF] group-hover:scale-105 transition-transform shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/game_zone_icon.png" alt="Game Zone" className="w-full h-full object-cover" />
                  </div>
                  <span className={badgeBase}>
                    <Flame className="w-2.5 h-2.5 text-[#DB1A1A]" />
                    <span>8 Games</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    Game Zone
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                    Kanji Hunter, Word Match, Sentence Builder &amp; Arcade Ranks
                  </p>
                </div>
              </div>
              <div className="pt-2.5 mt-2 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaInk}>
                  <span>Play Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">Arcade</span>
              </div>
            </Link>
          </ScrollReveal>

          {/* 6. STUDY TOOLS */}
          <ScrollReveal variant="up" delay={220} duration={400} className="h-auto">
            <Link href="/tools" className={cardBase}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#CBE5E3] dark:border-slate-700 bg-[#FFFFFF] group-hover:scale-105 transition-transform shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/study_tools_icon.png" alt="Study Tools" className="w-full h-full object-cover" />
                  </div>
                  <span className={badgeBase}>
                    <Compass className="w-2.5 h-2.5 text-[#DB1A1A]" />
                    <span>Free Tools</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    Study Tools
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                    Flashcards, Particle Drills, JAC Textbooks &amp; Salary Calculator
                  </p>
                </div>
              </div>
              <div className="pt-2.5 mt-2 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaInk}>
                  <span>Open Tools</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">Utilities</span>
              </div>
            </Link>
          </ScrollReveal>

          {/* 7. ABOUT US */}
          <ScrollReveal variant="up" delay={260} duration={400} className="h-auto">
            <Link href="/about" className={cardBase}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#2C687B] dark:text-[#8CC7C4] group-hover:scale-105 transition-transform shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className={badgeBase}>
                    <Award className="w-2.5 h-2.5 text-[#DB1A1A]" />
                    <span>Verified</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors leading-tight">
                    About Us
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-0.5">
                    Prometric fidelity, audio engine, partner schools &amp; mission
                  </p>
                </div>
              </div>
              <div className="pt-2.5 mt-2 border-t border-[#EAF4F4] dark:border-slate-800 flex items-center justify-between">
                <span className={ctaPrimary}>
                  <span>Learn More</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-[#2C687B]">100% Match</span>
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
