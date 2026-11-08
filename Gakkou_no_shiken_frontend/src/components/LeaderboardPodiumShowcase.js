'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import CountryFlag from './CountryFlag';
import ScrollReveal from './ScrollReveal';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  ArrowRight,
  Sparkles,
  Swords,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';

const FALLBACK_TOP_THREE = [
  {
    rank: 1,
    full_name: 'Kenji Tanaka',
    username: 'kenji_tanaka',
    highest_score: 245,
    avg_score: 236,
    passed_attempts: 8,
    country: 'Bangladesh',
    country_flag: '🇧🇩',
    target_exam_display: 'JFT-Basic (A2 Standard)',
  },
  {
    rank: 2,
    full_name: 'Rahim Ahmed',
    username: 'rahim_ahmed',
    highest_score: 238,
    avg_score: 228,
    passed_attempts: 6,
    country: 'Bangladesh',
    country_flag: '🇧🇩',
    target_exam_display: 'SSW Nursing Care',
  },
  {
    rank: 3,
    full_name: 'Aung Min',
    username: 'aung_min',
    highest_score: 228,
    avg_score: 220,
    passed_attempts: 5,
    country: 'Myanmar',
    country_flag: '🇲🇲',
    target_exam_display: 'SSW Food Service',
  },
];

export default function LeaderboardPodiumShowcase() {
  const [topThree, setTopThree] = useState(FALLBACK_TOP_THREE);
  const [totalCandidates, setTotalCandidates] = useState(480);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getLeaderboard()
      .then((data) => {
        if (!isMounted) return;
        if (data?.top_three && Array.isArray(data.top_three) && data.top_three.length > 0) {
          const formatted = data.top_three.map((c, idx) => ({
            rank: c.rank || idx + 1,
            full_name: c.full_name || c.username || `Candidate #${idx + 1}`,
            username: c.username || `candidate_${idx + 1}`,
            highest_score: c.highest_score || c.avg_score || 200,
            avg_score: c.avg_score || 190,
            passed_attempts: c.passed_attempts || 1,
            country: c.country || 'Bangladesh',
            country_flag: c.country_flag || '🇧🇩',
            target_exam_display: c.target_exam_display || 'JFT-Basic',
          }));
          setTopThree(formatted);
        }
        if (data?.total_candidates) {
          setTotalCandidates(data.total_candidates);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch leaderboard podium on home:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const firstPlace = topThree.find((c) => c.rank === 1) || topThree[0];
  const secondPlace = topThree.find((c) => c.rank === 2) || topThree[1];
  const thirdPlace = topThree.find((c) => c.rank === 3) || topThree[2];

  const handleGrindScroll = (e) => {
    e.preventDefault();
    const target = document.getElementById('practice-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/tests';
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-slate-900/95 dark:via-slate-950/90 dark:to-slate-900/95 border border-amber-200/80 dark:border-amber-500/20 p-4 sm:p-6 lg:p-8 shadow-xl shadow-amber-900/5 dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-400/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Badge, Title & Grind Callout */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 sm:pb-6 mb-5 sm:mb-8">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40 dark:border-amber-500/30 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs">
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
            <span>National CBT Leaderboard • Top 3 Champions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-japan-red animate-ping" />
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Prometric CBT Hall of Fame
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Think you have what it takes to break onto the national podium? Take authentic JFT-Basic &amp; SSW mock tests, grind for perfection, and claim your place among {totalCandidates}+ ranked candidates!
          </p>
        </div>

        {/* Quick Action Header CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleGrindScroll}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-rose-600 hover:to-red-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 active:scale-95 transition-all cursor-pointer group"
          >
            <Swords className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Give Mock Test &amp; Grind!</span>
          </button>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-black text-xs sm:text-sm transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Full Standings ↗</span>
          </Link>
        </div>
      </div>

      {/* 2. Olympic Podium Grid: 2nd Silver (Left on Desktop, 2nd on Mobile), 1st Gold (Center Elevated on Desktop, 1st on Mobile), 3rd Bronze */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 items-end mb-6">
        {/* 2nd Place: Silver Medalist (order-2 on mobile, sm:order-1 on desktop) */}
        {secondPlace && (
          <ScrollReveal variant="up" delay={100} duration={600} className="w-full order-2 sm:order-1">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/90 border-2 border-slate-300/80 dark:border-slate-700/90 hover:border-slate-400 dark:hover:border-slate-500 p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between text-center transition-all duration-300 hover-lift group h-full">
              {/* Metallic Silver Watermark #2 */}
              <div className="absolute top-2 right-3 text-2xl font-black text-slate-300 dark:text-slate-700/60 select-none">
                #2
              </div>

              <div className="w-full flex flex-col items-center space-y-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider">
                  <Medal className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>2nd Place Silver</span>
                </span>

                <Link
                  href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                  className="group/item flex flex-col items-center w-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400 text-slate-900 font-black text-xl flex items-center justify-center shadow-md border-2 border-white/80 dark:border-slate-700 group-hover/item:scale-105 transition-transform">
                    {secondPlace.full_name?.slice(0, 1).toUpperCase() || '2'}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">
                    {secondPlace.full_name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate w-full block">
                    @{secondPlace.username}
                  </span>
                </Link>

                {/* Country Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <CountryFlag country={secondPlace.country} flagEmoji={secondPlace.country_flag} width={18} height={12} />
                  <span className="truncate max-w-[120px]">{secondPlace.country}</span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                  {secondPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl py-1.5 px-2 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">Scaled Score</span>
                  <strong className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                    {secondPlace.highest_score} <span className="text-[10px] text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-semibold">
                  <span>Passed: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{secondPlace.passed_attempts}</strong></span>
                  <span>Avg: <strong className="text-slate-800 dark:text-slate-200 font-bold">{secondPlace.avg_score}</strong></span>
                </div>

                <Link
                  href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* 1st Place: Gold Champion (order-1 on mobile, sm:order-2 — ELEVATED CENTERPIECE) */}
        {firstPlace && (
          <ScrollReveal variant="up" delay={0} duration={700} className="w-full order-1 sm:order-2 sm:-translate-y-2 lg:-translate-y-3 z-20">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/70 dark:via-slate-900/95 dark:to-slate-950 border-2 border-amber-400 dark:border-amber-400 shadow-2xl shadow-amber-500/20 dark:shadow-amber-500/25 p-5 sm:p-6 flex flex-col items-center justify-between text-center transition-all duration-300 hover:scale-[1.02] group h-full">
              {/* Golden Ambient Crown Watermark #1 */}
              <div className="absolute top-2 right-3 text-3xl font-black text-amber-400/40 dark:text-amber-400/30 select-none">
                #1
              </div>

              <div className="w-full flex flex-col items-center space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border border-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                  <Crown className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>Gold Champion 👑</span>
                </span>

                <Link
                  href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                  className="group/item flex flex-col items-center w-full"
                >
                  <div className="relative">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white dark:border-amber-300 group-hover/item:scale-105 transition-transform">
                      {firstPlace.full_name?.slice(0, 1).toUpperCase() || '1'}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm border border-white dark:border-slate-900">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-500 transition-colors">
                    {firstPlace.full_name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate w-full block">
                    @{firstPlace.username}
                  </span>
                </Link>

                {/* Country Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-xs font-black text-amber-900 dark:text-amber-200 shadow-2xs">
                  <CountryFlag country={firstPlace.country} flagEmoji={firstPlace.country_flag} width={20} height={14} />
                  <span className="truncate max-w-[130px]">{firstPlace.country}</span>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/70 rounded-md text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 truncate max-w-full">
                  {firstPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-700/60 space-y-2">
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 dark:bg-slate-950 rounded-xl py-2 px-3 border border-amber-300 dark:border-amber-600/70 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[9px] text-amber-800 dark:text-amber-300 uppercase font-black block">Best Score</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Top 1% Percentile</span>
                  </div>
                  <strong className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {firstPlace.highest_score} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 px-1 font-semibold">
                  <span>Passed: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{firstPlace.passed_attempts}</strong></span>
                  <span>Avg: <strong className="text-slate-900 dark:text-white font-black">{firstPlace.avg_score}</strong></span>
                </div>

                <Link
                  href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <span>View Champion Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* 3rd Place: Bronze Medalist (order-3 on mobile, sm:order-3 on desktop) */}
        {thirdPlace && (
          <ScrollReveal variant="up" delay={200} duration={600} className="w-full order-3 sm:order-3">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/90 border-2 border-amber-700/30 dark:border-amber-800/50 hover:border-amber-600/60 p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between text-center transition-all duration-300 hover-lift group h-full">
              {/* Bronze Watermark #3 */}
              <div className="absolute top-2 right-3 text-2xl font-black text-amber-700/30 dark:text-amber-700/40 select-none">
                #3
              </div>

              <div className="w-full flex flex-col items-center space-y-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-700/30 dark:border-amber-800/60 text-[10px] font-black uppercase tracking-wider">
                  <Award className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>3rd Place Bronze</span>
                </span>

                <Link
                  href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                  className="group/item flex flex-col items-center w-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white font-black text-xl flex items-center justify-center shadow-md border-2 border-white/80 dark:border-slate-700 group-hover/item:scale-105 transition-transform">
                    {thirdPlace.full_name?.slice(0, 1).toUpperCase() || '3'}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">
                    {thirdPlace.full_name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate w-full block">
                    @{thirdPlace.username}
                  </span>
                </Link>

                {/* Country Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <CountryFlag country={thirdPlace.country} flagEmoji={thirdPlace.country_flag} width={18} height={12} />
                  <span className="truncate max-w-[120px]">{thirdPlace.country}</span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                  {thirdPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl py-1.5 px-2 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">Scaled Score</span>
                  <strong className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                    {thirdPlace.highest_score} <span className="text-[10px] text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-semibold">
                  <span>Passed: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{thirdPlace.passed_attempts}</strong></span>
                  <span>Avg: <strong className="text-slate-800 dark:text-slate-200 font-bold">{thirdPlace.avg_score}</strong></span>
                </div>

                <Link
                  href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* 3. Promotional "Grind & Take A Place" Banner Ribbon */}
      <div className="relative z-10 rounded-2xl bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white p-3.5 sm:p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-xs sm:text-sm font-black text-amber-300">
                Want to claim your name on the podium?
              </strong>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-black uppercase">
                Live Rating
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-medium">
              Every completed CBT exam calculates your CEFR scaled score (10–250) in real-time. Give mock tests, grind daily, and rise above the competition!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handleGrindScroll}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4 fill-current shrink-0" />
            <span>Give Mock Test &amp; Grind Now!</span>
          </button>

          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors whitespace-nowrap"
          >
            <span>All Ranks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
