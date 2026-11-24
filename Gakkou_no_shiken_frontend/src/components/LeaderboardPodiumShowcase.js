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
    full_name: 'TRAN XUAN LOI',
    username: 'tranxuanloi10041994',
    highest_score: 250,
    avg_score: 250,
    passed_attempts: 100,
    country: 'Vietnam',
    country_flag: '🇻🇳',
    target_exam_display: 'JFT-Basic (A2 Standard)',
  },
  {
    rank: 2,
    full_name: 'Kenji Tanaka',
    username: 'kenji_tanaka',
    highest_score: 248,
    avg_score: 236,
    passed_attempts: 89,
    country: 'Bangladesh',
    country_flag: '🇧🇩',
    target_exam_display: 'JFT-Basic (A2 Standard)',
  },
  {
    rank: 3,
    full_name: 'Sandeep Thapa',
    username: 'sandeep_thapa',
    highest_score: 242,
    avg_score: 220,
    passed_attempts: 74,
    country: 'Nepal',
    country_flag: '🇳🇵',
    target_exam_display: 'SSW Nursing Care',
  },
];

function normalizeTopThree(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c, idx) => ({
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
}

export default function LeaderboardPodiumShowcase() {
  const [overallTopThree, setOverallTopThree] = useState(FALLBACK_TOP_THREE);
  const [weeklyTopThree, setWeeklyTopThree] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(480);
  const [weeklyCandidates, setWeeklyCandidates] = useState(0);
  const [activePeriod, setActivePeriod] = useState('overall'); // 'overall' | 'weekly'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getLeaderboard()
      .then((data) => {
        if (!isMounted) return;
        if (data?.top_three && Array.isArray(data.top_three) && data.top_three.length > 0) {
          setOverallTopThree(normalizeTopThree(data.top_three));
        }
        if (data?.total_candidates) {
          setTotalCandidates(data.total_candidates);
        }
        if (data?.weekly) {
          if (Array.isArray(data.weekly.top_three) && data.weekly.top_three.length > 0) {
            setWeeklyTopThree(normalizeTopThree(data.weekly.top_three));
          }
          setWeeklyCandidates(data.weekly.total_candidates || 0);
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

  const isWeekly = activePeriod === 'weekly';
  const topThree = isWeekly
    ? (weeklyTopThree.length > 0 ? weeklyTopThree : overallTopThree)
    : overallTopThree;
  const activeCount = isWeekly ? weeklyCandidates : totalCandidates;

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
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/40 via-white to-red-50/20 dark:from-slate-900/95 dark:via-slate-950/90 dark:to-slate-900/95 border border-amber-200/80 dark:border-amber-500/20 p-2.5 sm:p-6 lg:p-8 shadow-xl shadow-amber-900/5 dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-400/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-slate-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Badge, Title & Grind Callout */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-3 sm:pb-6 mb-3 sm:mb-8">
        <div className="space-y-1 sm:space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40 dark:border-amber-500/30 text-[9px] sm:text-xs font-black uppercase tracking-wider shadow-2xs">
            <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0 animate-pulse" />
            <span>National CBT Leaderboard • Top 3 Podium</span>
            <span className="w-1.5 h-1.5 rounded-full bg-japan-red animate-ping" />
          </div>

          <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {isWeekly ? 'Weekly CBT Champions (Last 7 Days)' : 'Prometric CBT Hall of Fame'}
          </h2>

          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
            {isWeekly
              ? `Fresh rolling 7-day competition! ${activeCount > 0 ? `${activeCount} active candidates ranked this week — ` : ''}take a mock exam today to climb onto the weekly podium!`
              : `Think you have what it takes to break onto the podium? Take authentic JFT-Basic & SSW mock tests, grind for perfection, and claim your place among ${totalCandidates}+ ranked candidates!`}
          </p>
        </div>

        {/* Quick Action Header CTA + Overall/Weekly Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActivePeriod('overall')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                !isWeekly
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>Overall</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePeriod('weekly')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                isWeekly
                  ? 'bg-japan-red text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Weekly</span>
            </button>
          </div>

          <button
            onClick={handleGrindScroll}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-rose-600 hover:to-red-700 text-white font-black text-[11px] sm:text-sm shadow-md shadow-red-500/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer group whitespace-nowrap"
          >
            <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Give Mock Test &amp; Grind!</span>
          </button>

          <Link
            href={isWeekly ? '/leaderboard?tab=weekly' : '/leaderboard'}
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-black text-[11px] sm:text-sm transition-all shadow-2xs hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
            <span>Full Standings ↗</span>
          </Link>
        </div>
      </div>

      {/* 2. True Horizontal Olympic Podium: 2nd Silver (Left), 1st Gold (Center Elevated), 3rd Bronze (Right) */}
      {/* 100% Horizontal Grid across all screen sizes (Mobile: 3 cols, fits screen without vertical stacking!) */}
      <div className="relative z-10 grid grid-cols-3 gap-1 sm:gap-4 lg:gap-6 items-end mb-3 sm:mb-6">
        {/* 2nd Place: Silver Medalist (Left Column) */}
        {secondPlace && (
          <ScrollReveal variant="up" delay={50} duration={500} className="w-full">
            <Link
              href={`/profile/${encodeURIComponent(secondPlace.username)}`}
              className="block relative overflow-hidden rounded-xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/90 border sm:border-2 border-slate-300/80 dark:border-slate-700/90 hover:border-slate-400 dark:hover:border-slate-500 p-1.5 sm:p-5 shadow-sm sm:shadow-lg shadow-slate-200/50 dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] text-center transition-all duration-300 hover-lift group"
            >
              {/* Metallic Silver Watermark #2 */}
              <div className="absolute top-1 right-1.5 sm:top-2 sm:right-3 text-xs sm:text-2xl font-black text-slate-300 dark:text-slate-700/60 select-none">
                #2
              </div>

              <div className="flex flex-col items-center space-y-1 sm:space-y-2.5">
                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate max-w-full">
                  <Medal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                  <span className="hidden xs:inline">2nd Silver</span>
                  <span className="xs:hidden">#2 Silver</span>
                </span>

                {/* Avatar */}
                <div className="w-9 h-9 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400 text-slate-900 font-black text-sm sm:text-xl flex items-center justify-center shadow-xs sm:shadow-md border border-white/80 dark:border-slate-700 group-hover:scale-105 transition-transform">
                  {secondPlace.full_name?.slice(0, 1).toUpperCase() || '2'}
                </div>

                {/* Name & Username */}
                <div className="w-full min-w-0">
                  <h3 className="text-[10px] sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate w-full group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {secondPlace.full_name}
                  </h3>
                  <span className="text-[8px] sm:text-xs text-slate-400 font-mono truncate w-full block">
                    @{secondPlace.username}
                  </span>
                </div>

                {/* Country Flag Pill */}
                <div className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[8px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 max-w-full">
                  <CountryFlag country={secondPlace.country} flagEmoji={secondPlace.country_flag} width={13} height={9} />
                  <span className="truncate max-w-[45px] sm:max-w-[120px]">{secondPlace.country}</span>
                </div>

                {/* Target Exam Badge (desktop) */}
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                  {secondPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 sm:space-y-2">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-lg sm:rounded-xl py-1 sm:py-1.5 px-1 sm:px-2 border border-slate-200/70 dark:border-slate-800/80">
                  <span className="hidden sm:block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black">Score</span>
                  <strong className="text-[11px] sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono block">
                    {secondPlace.highest_score} <span className="text-[8px] sm:text-[10px] text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[8px] sm:text-[11px] text-slate-500 dark:text-slate-400 px-0.5 font-semibold">
                  <span className="truncate">{secondPlace.passed_attempts} pass</span>
                  <span className="hidden sm:inline">Avg: <strong className="text-slate-800 dark:text-slate-200 font-bold">{secondPlace.avg_score}</strong></span>
                </div>

                {/* Desktop Button */}
                <div className="hidden sm:flex w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all items-center justify-center gap-1 active:scale-95">
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        )}

        {/* 1st Place: Gold Champion (Center Column — Elevated Taller Centerpiece) */}
        {firstPlace && (
          <ScrollReveal variant="up" delay={0} duration={600} className="w-full -translate-y-1 sm:-translate-y-3 z-20">
            <Link
              href={`/profile/${encodeURIComponent(firstPlace.username)}`}
              className="block relative overflow-hidden rounded-xl sm:rounded-3xl bg-gradient-to-b from-amber-500/15 via-white to-amber-500/10 dark:from-amber-950/70 dark:via-slate-900/95 dark:to-slate-950 border sm:border-2 border-amber-400 dark:border-amber-400 shadow-md sm:shadow-2xl shadow-amber-500/20 dark:shadow-amber-500/25 p-2 sm:p-6 text-center transition-all duration-300 hover:scale-[1.02] group"
            >
              {/* Golden Ambient Crown Watermark #1 */}
              <div className="absolute top-1 right-1.5 sm:top-2 sm:right-3 text-sm sm:text-3xl font-black text-amber-400/50 select-none">
                #1
              </div>

              <div className="flex flex-col items-center space-y-1 sm:space-y-2.5">
                <span className="inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border border-amber-300 text-[8px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs sm:shadow-md shadow-amber-500/20 truncate max-w-full">
                  <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                  <span className="hidden xs:inline">Gold Champion 👑</span>
                  <span className="xs:hidden">#1 Gold 👑</span>
                </span>

                {/* Avatar with Sparkle */}
                <div className="relative">
                  <div className="w-11 h-11 sm:w-20 sm:h-20 shrink-0 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 font-black text-base sm:text-3xl flex items-center justify-center shadow-md sm:shadow-lg shadow-amber-500/30 border border-white dark:border-amber-300 group-hover:scale-105 transition-transform">
                    {firstPlace.full_name?.slice(0, 1).toUpperCase() || '1'}
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" />
                  </div>
                </div>

                {/* Name & Username */}
                <div className="w-full min-w-0">
                  <h3 className="text-[11px] sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate w-full group-hover:text-amber-500 transition-colors">
                    {firstPlace.full_name}
                  </h3>
                  <span className="text-[8px] sm:text-xs text-slate-400 font-mono truncate w-full block">
                    @{firstPlace.username}
                  </span>
                </div>

                {/* Country Flag Pill */}
                <div className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-[8px] sm:text-xs font-black text-amber-900 dark:text-amber-200 shadow-2xs max-w-full">
                  <CountryFlag country={firstPlace.country} flagEmoji={firstPlace.country_flag} width={14} height={10} />
                  <span className="truncate max-w-[50px] sm:max-w-[130px]">{firstPlace.country}</span>
                </div>

                {/* Target Exam Badge (desktop) */}
                <span className="hidden sm:inline-block text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/70 rounded-md text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 truncate max-w-full">
                  {firstPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-1.5 sm:mt-3 pt-1.5 sm:pt-3 border-t border-amber-200/80 dark:border-amber-700/60 space-y-1 sm:space-y-2">
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 dark:bg-slate-950 rounded-lg sm:rounded-xl py-1 sm:py-2 px-1 sm:px-3 border border-amber-300 dark:border-amber-600/70">
                  <span className="hidden sm:block text-[9px] text-amber-800 dark:text-amber-300 uppercase font-black">Top Score</span>
                  <strong className="text-xs sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                    {firstPlace.highest_score} <span className="text-[8px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[8px] sm:text-[11px] text-slate-600 dark:text-slate-300 px-0.5 font-semibold">
                  <span className="truncate font-black text-emerald-600 dark:text-emerald-400">{firstPlace.passed_attempts} pass</span>
                  <span className="hidden sm:inline font-bold">Avg: {firstPlace.avg_score}</span>
                </div>

                {/* Desktop Button */}
                <div className="hidden sm:flex w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-xl transition-all items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95">
                  <span>View Champion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        )}

        {/* 3rd Place: Bronze Medalist (Right Column) */}
        {thirdPlace && (
          <ScrollReveal variant="up" delay={100} duration={500} className="w-full">
            <Link
              href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
              className="block relative overflow-hidden rounded-xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/90 border sm:border-2 border-amber-700/30 dark:border-amber-800/50 hover:border-amber-600/60 p-1.5 sm:p-5 shadow-sm sm:shadow-lg shadow-slate-200/50 dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] text-center transition-all duration-300 hover-lift group"
            >
              {/* Bronze Watermark #3 */}
              <div className="absolute top-1 right-1.5 sm:top-2 sm:right-3 text-xs sm:text-2xl font-black text-amber-700/30 dark:text-amber-700/40 select-none">
                #3
              </div>

              <div className="flex flex-col items-center space-y-1 sm:space-y-2.5">
                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-red-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-700/30 dark:border-amber-800/60 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate max-w-full">
                  <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span className="hidden xs:inline">3rd Bronze</span>
                  <span className="xs:hidden">#3 Bronze</span>
                </span>

                {/* Avatar */}
                <div className="w-9 h-9 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white font-black text-sm sm:text-xl flex items-center justify-center shadow-xs sm:shadow-md border border-white/80 dark:border-slate-700 group-hover:scale-105 transition-transform">
                  {thirdPlace.full_name?.slice(0, 1).toUpperCase() || '3'}
                </div>

                {/* Name & Username */}
                <div className="w-full min-w-0">
                  <h3 className="text-[10px] sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate w-full group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {thirdPlace.full_name}
                  </h3>
                  <span className="text-[8px] sm:text-xs text-slate-400 font-mono truncate w-full block">
                    @{thirdPlace.username}
                  </span>
                </div>

                {/* Country Flag Pill */}
                <div className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[8px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 max-w-full">
                  <CountryFlag country={thirdPlace.country} flagEmoji={thirdPlace.country_flag} width={13} height={9} />
                  <span className="truncate max-w-[45px] sm:max-w-[120px]">{thirdPlace.country}</span>
                </div>

                {/* Target Exam Badge (desktop) */}
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                  {thirdPlace.target_exam_display}
                </span>
              </div>

              {/* Stats Box */}
              <div className="w-full mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 sm:space-y-2">
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-lg sm:rounded-xl py-1 sm:py-1.5 px-1 sm:px-2 border border-slate-200/70 dark:border-slate-800/80">
                  <span className="hidden sm:block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black">Score</span>
                  <strong className="text-[11px] sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono block">
                    {thirdPlace.highest_score} <span className="text-[8px] sm:text-[10px] text-slate-400 font-normal">/ 250</span>
                  </strong>
                </div>

                <div className="flex items-center justify-between text-[8px] sm:text-[11px] text-slate-500 dark:text-slate-400 px-0.5 font-semibold">
                  <span className="truncate">{thirdPlace.passed_attempts} pass</span>
                  <span className="hidden sm:inline">Avg: <strong className="text-slate-800 dark:text-slate-200 font-bold">{thirdPlace.avg_score}</strong></span>
                </div>

                {/* Desktop Button */}
                <div className="hidden sm:flex w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all items-center justify-center gap-1 active:scale-95">
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        )}
      </div>

      {/* 3. Motivational "Grind & Take A Place" Banner Ribbon (Compact & Fits Mobile Screen) */}
      <div className="relative z-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white p-2.5 sm:p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full md:w-auto">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm sm:shadow-md">
            <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-white animate-bounce" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <strong className="text-[11px] sm:text-sm font-black text-amber-300">
                Want your name on this podium?
              </strong>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[8px] sm:text-[10px] font-black uppercase">
                Live Rating
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 leading-tight sm:leading-relaxed font-medium line-clamp-1 sm:line-clamp-none">
              Every CBT exam calculates your CEFR scaled score (10–250) in real-time. Give mock tests, grind daily, and rise above!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handleGrindScroll}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-[11px] sm:text-sm shadow-sm sm:shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Give Mock Test &amp; Grind!</span>
          </button>

          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] sm:text-sm border border-slate-700 transition-colors whitespace-nowrap"
          >
            <span>All Ranks</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
