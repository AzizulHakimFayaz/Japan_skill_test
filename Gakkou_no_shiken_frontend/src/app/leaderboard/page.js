'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  Target,
  MapPin,
  Sparkles,
  AlertCircle,
  ArrowRight,
  User,
  GraduationCap,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';


export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = () => {
    getLeaderboard()
      .then((res) => {
        setError(null);
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load leaderboard rankings');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading Candidate Rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          <AlertCircle className="w-8 h-8 text-japan-red" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchLeaderboard();
            }}
            className="px-6 py-2.5 bg-japan-red hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link href="/" className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl">
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  const top_three = data?.top_three || [];
  const rankings = data?.rankings || [];
  const current_user_rank = data?.current_user_rank || null;
  const total_candidates = data?.total_candidates || (top_three.length + rankings.length);

  const firstPlace = top_three.find((c) => c.rank === 1) || top_three[0];
  const secondPlace = top_three.find((c) => c.rank === 2) || top_three[1];
  const thirdPlace = top_three.find((c) => c.rank === 3) || top_three[2];

  const firstPlaceCountry = firstPlace?.country || firstPlace?.location || 'Global';
  const firstPlaceFlag = firstPlace?.country_flag || getCountryFlag(firstPlaceCountry);

  const secondPlaceCountry = secondPlace?.country || secondPlace?.location || 'Global';
  const secondPlaceFlag = secondPlace?.country_flag || getCountryFlag(secondPlaceCountry);

  const thirdPlaceCountry = thirdPlace?.country || thirdPlace?.location || 'Global';
  const thirdPlaceFlag = thirdPlace?.country_flag || getCountryFlag(thirdPlaceCountry);

  const userCountry = current_user_rank?.country || current_user_rank?.location || (user?.profile?.country) || '';
  const userFlag = current_user_rank?.country_flag || (userCountry ? getCountryFlag(userCountry) : '🌐');

  return (
    <div className="space-y-10 sm:space-y-14 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-japan-navy to-indigo-950 text-white rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl shadow-slate-900/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>National Leaderboard 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Official Candidate{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-rose-400">
                Honor Roll
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Real-time rankings for JFT-Basic &amp; SSW Prometric candidates based on scaled CEFR score performance (10–250) and test completions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Ranked</span>
              <strong className="text-xl sm:text-2xl font-black text-amber-400">{total_candidates}</strong>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Take Mock Exam</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Japanese Watermark */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-8xl sm:text-9xl tracking-tighter text-amber-300 pointer-events-none select-none">
          順位
        </div>
      </div>

      {/* 2. Logged-in Candidate Standing Bar */}
      {user && current_user_rank && (
        <div className="bg-gradient-to-r from-indigo-900/80 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 aspect-square rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md border border-indigo-400/40">
              {current_user_rank.rank ? `#${current_user_rank.rank}` : '—'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs text-indigo-300 font-extrabold uppercase shrink-0">Your Standing:</span>
                <strong className="text-sm sm:text-base font-black text-white truncate">{current_user_rank.full_name}</strong>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-800/70 border border-indigo-500/40 text-[10px] sm:text-xs font-bold text-indigo-200 shrink-0">
                  <span className="text-xs sm:text-sm leading-none">{userFlag}</span>
                  <span className="truncate max-w-[120px]">{userCountry || 'Global'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {current_user_rank.rank
                  ? `Ranked #${current_user_rank.rank} of ${total_candidates} candidates`
                  : 'Complete your first practice test to join the ranked leaderboard!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold self-end sm:self-center shrink-0">
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block uppercase">Passed Tests</span>
              <span className="text-emerald-400 font-black">{current_user_rank.passed_attempts}</span>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
              <span className="text-slate-400 text-[10px] block uppercase">High Score</span>
              <span className="text-amber-400 font-black">{current_user_rank.highest_score} / 250</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Top 3 Highlighted Podium */}
      {top_three.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
              <span>Top Ranked Candidates</span>
            </h2>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">Gold, Silver &amp; Bronze Podium</span>
          </div>

          {/* Desktop Olympic 3-Column Podium (>= 640px sm) */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3 sm:gap-5 items-end">
            {/* 2nd Place (Silver) */}
            {secondPlace ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 border-2 border-slate-400/50 shadow-xl shadow-slate-900/10 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-slate-300 transition-all min-w-0">
                <div className="absolute top-2 right-2 text-lg font-black opacity-30 select-none">#2</div>
                <div className="w-full flex flex-col items-center space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 text-[10px] font-black uppercase">
                    <Medal className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>2nd Place Silver</span>
                  </span>

                  <Link href={`/profile/${encodeURIComponent(secondPlace.username)}`} className="group/item flex flex-col items-center w-full">
                    <div className="w-14 h-14 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-xl flex items-center justify-center shadow-md border-2 border-white/40 group-hover/item:scale-105 transition-transform">
                      {secondPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <h3 className="text-sm font-black text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-300 transition-colors">
                      {secondPlace.full_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono truncate w-full block">@{secondPlace.username}</span>
                  </Link>

                  {/* Country Flag Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-xs">
                    <span className="text-sm leading-none">{secondPlaceFlag}</span>
                    <span className="truncate max-w-[130px]">{secondPlaceCountry}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1 w-full">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-md text-slate-300 border border-slate-700 truncate max-w-full">
                      {secondPlace.target_exam_display}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="bg-slate-950/70 rounded-xl py-1.5 px-2 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">High Score</span>
                    <strong className="text-sm font-black text-amber-400">{secondPlace.highest_score}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Passed: <strong className="text-emerald-400 font-black">{secondPlace.passed_attempts}</strong></span>
                    <span>Avg: <strong className="text-white font-bold">{secondPlace.avg_score}</strong></span>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div></div>
            )}

            {/* 1st Place (Gold - Elevated Centerpiece) */}
            {firstPlace && (
              <div className="bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-400 shadow-2xl shadow-amber-500/25 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:scale-[1.02] transition-all -translate-y-4 min-w-0 z-10">
                <div className="absolute top-2 right-2 text-lg font-black text-amber-400 opacity-60 select-none">#1</div>
                <div className="w-full flex flex-col items-center space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase shadow-xs">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Gold Champion</span>
                  </span>

                  <Link href={`/profile/${encodeURIComponent(firstPlace.username)}`} className="group/item flex flex-col items-center w-full">
                    <div className="w-18 h-18 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/60 group-hover/item:scale-105 transition-transform">
                      {firstPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <h3 className="text-base font-black text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-300 transition-colors">
                      {firstPlace.full_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono truncate w-full block">@{firstPlace.username}</span>
                  </Link>

                  {/* Country Flag Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-xs font-black text-amber-200 shadow-xs">
                    <span className="text-base leading-none">{firstPlaceFlag}</span>
                    <span className="truncate max-w-[140px]">{firstPlaceCountry}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1 w-full">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950/80 rounded-md text-amber-300 border border-amber-700/50 truncate max-w-full">
                      {firstPlace.target_exam_display}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="bg-slate-950/70 rounded-xl py-1.5 px-2 border border-amber-400/30">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">High Score</span>
                    <strong className="text-base font-black text-amber-400">{firstPlace.highest_score}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Passed: <strong className="text-emerald-400 font-black">{firstPlace.passed_attempts}</strong></span>
                    <span>Avg: <strong className="text-white font-bold">{firstPlace.avg_score}</strong></span>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {thirdPlace ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 border-2 border-amber-700/50 shadow-xl shadow-slate-900/10 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-amber-600 transition-all min-w-0">
                <div className="absolute top-2 right-2 text-lg font-black opacity-30 select-none">#3</div>
                <div className="w-full flex flex-col items-center space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/30 text-[10px] font-black uppercase">
                    <Medal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>3rd Place Bronze</span>
                  </span>

                  <Link href={`/profile/${encodeURIComponent(thirdPlace.username)}`} className="group/item flex flex-col items-center w-full">
                    <div className="w-14 h-14 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xl flex items-center justify-center shadow-md border-2 border-white/20 group-hover/item:scale-105 transition-transform">
                      {thirdPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <h3 className="text-sm font-black text-white mt-2 leading-tight truncate w-full group-hover/item:text-amber-300 transition-colors">
                      {thirdPlace.full_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono truncate w-full block">@{thirdPlace.username}</span>
                  </Link>

                  {/* Country Flag Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-xs">
                    <span className="text-sm leading-none">{thirdPlaceFlag}</span>
                    <span className="truncate max-w-[130px]">{thirdPlaceCountry}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1 w-full">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-md text-slate-300 border border-slate-700 truncate max-w-full">
                      {thirdPlace.target_exam_display}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="bg-slate-950/70 rounded-xl py-1.5 px-2 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">High Score</span>
                    <strong className="text-sm font-black text-amber-400">{thirdPlace.highest_score}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Passed: <strong className="text-emerald-400 font-black">{thirdPlace.passed_attempts}</strong></span>
                    <span>Avg: <strong className="text-white font-bold">{thirdPlace.avg_score}</strong></span>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Mobile Redesigned Podium Layout (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {/* Mobile #1 Champion Spotlight Card */}
            {firstPlace && (
              <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 text-white rounded-3xl p-4 border-2 border-amber-400 shadow-xl shadow-amber-500/15">
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-amber-500/20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wide">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>#1 Gold Champion</span>
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                    <span className="text-[10px] text-slate-400 font-normal uppercase">High:</span>
                    <span>{firstPlace.highest_score}</span>
                    <span className="text-[10px] text-slate-400">/ 250</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/60">
                    {firstPlace.full_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-white leading-snug truncate">
                      {firstPlace.full_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono block truncate">
                      @{firstPlace.username}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-[11px] font-black text-amber-200">
                        <span className="text-xs">{firstPlaceFlag}</span>
                        <span className="truncate max-w-[120px]">{firstPlaceCountry}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 truncate max-w-[140px]">
                        {firstPlace.target_exam_display}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/60">
                    <span className="text-[8px] text-slate-400 uppercase block font-bold">High Score</span>
                    <strong className="text-sm font-black text-amber-400">{firstPlace.highest_score}</strong>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/60">
                    <span className="text-[8px] text-slate-400 uppercase block font-bold">Passed</span>
                    <strong className="text-sm font-black text-emerald-400">{firstPlace.passed_attempts}</strong>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/60">
                    <span className="text-[8px] text-slate-400 uppercase block font-bold">Average</span>
                    <strong className="text-sm font-black text-slate-200">{firstPlace.avg_score}</strong>
                  </div>
                </div>

                <Link
                  href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                  className="w-full mt-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98"
                >
                  <span>View Champion Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile #2 Silver Card */}
            {secondPlace && (
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 border border-slate-500/50 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-base flex items-center justify-center border border-white/50 shadow-sm">
                      {secondPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 text-[10px] font-black flex items-center justify-center border border-slate-800">
                      2
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                        Silver
                      </span>
                      <h4 className="text-xs font-black text-white truncate">{secondPlace.full_name}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">@{secondPlace.username}</span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-slate-200 border border-slate-700">
                        <span>{secondPlaceFlag}</span>
                        <span className="truncate max-w-[100px]">{secondPlaceCountry}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[110px]">
                        {secondPlace.target_exam_display}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block leading-tight">{secondPlace.highest_score}</span>
                    <span className="text-[9px] font-bold text-emerald-400 block leading-tight">{secondPlace.passed_attempts} passed</span>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile #3 Bronze Card */}
            {thirdPlace && (
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 border border-amber-700/50 shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-base flex items-center justify-center border border-white/30 shadow-sm">
                      {thirdPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center border border-slate-800">
                      3
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/40">
                        Bronze
                      </span>
                      <h4 className="text-xs font-black text-white truncate">{thirdPlace.full_name}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">@{thirdPlace.username}</span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-slate-200 border border-slate-700">
                        <span>{thirdPlaceFlag}</span>
                        <span className="truncate max-w-[100px]">{thirdPlaceCountry}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[110px]">
                        {thirdPlace.target_exam_display}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block leading-tight">{thirdPlace.highest_score}</span>
                    <span className="text-[9px] font-bold text-emerald-400 block leading-tight">{thirdPlace.passed_attempts} passed</span>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Full Standings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Overall Standings ({rankings.length > 0 ? `Ranks 4 to ${rankings.length + 3}` : 'Top Candidates'})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard ranking</span>
        </div>

        {rankings.length > 0 ? (
          <div>
            {/* Desktop Table View (>= 768px md) */}
            <div className="hidden md:block bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] sm:text-xs">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Country</th>
                      <th className="py-3.5 px-4">Target &amp; Level</th>
                      <th className="py-3.5 px-4 text-center">Passed Exams</th>
                      <th className="py-3.5 px-4 text-center">High Score</th>
                      <th className="py-3.5 px-4 text-center">Avg Score</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {rankings.map((c) => {
                      const isCurrentUser = user && user.id === c.user_id;
                      const countryName = c.country || c.location;
                      const flag = c.country_flag || getCountryFlag(countryName);

                      return (
                        <tr
                          key={c.user_id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors ${
                            isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-950/40 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-4 sm:px-6 text-center font-black text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                            #{c.rank}
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/profile/${encodeURIComponent(c.username)}`}
                              className="flex items-center gap-3 group/cand min-w-0"
                            >
                              <div className="w-9 h-9 shrink-0 aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover/cand:border-japan-red group-hover/cand:bg-red-50 dark:group-hover/cand:bg-slate-700 transition-colors">
                                {c.full_name.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 dark:text-white group-hover/cand:text-japan-red dark:group-hover/cand:text-rose-400 transition-colors truncate">
                                    {c.full_name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded text-[9px] font-extrabold shrink-0">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-mono truncate max-w-[160px] sm:max-w-[220px]">
                                  @{c.username}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            {countryName ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <span className="text-sm leading-none">{flag}</span>
                                <span className="truncate max-w-[120px]">{countryName}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <span className="text-xs text-slate-800 dark:text-slate-200 font-bold block">{c.target_exam_display}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{c.japanese_level_display}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                            {c.passed_attempts} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({c.total_attempts} took)</span>
                          </td>
                          <td className="py-3 px-4 text-center font-black text-slate-900 dark:text-white">
                            {c.highest_score} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">/ 250</span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                            {c.avg_score}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link
                              href={`/profile/${encodeURIComponent(c.username)}`}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-japan-red dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Standings Card List (< 768px md) */}
            <div className="block md:hidden space-y-2.5">
              {rankings.map((c) => {
                const isCurrentUser = user && user.id === c.user_id;
                const countryName = c.country || c.location;
                const flag = c.country_flag || getCountryFlag(countryName);

                return (
                  <Link
                    key={c.user_id}
                    href={`/profile/${encodeURIComponent(c.username)}`}
                    className={`block p-3.5 rounded-2xl border transition-all ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          #{c.rank}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {c.full_name}
                            </strong>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded text-[9px] font-extrabold shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                              @{c.username}
                            </span>
                            {countryName && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                <span>{flag}</span>
                                <span className="truncate max-w-[100px]">{countryName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 block leading-tight">
                            {c.highest_score}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                            {c.passed_attempts} passed
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[200px]">{c.target_exam_display}</span>
                      <span>Avg: <strong className="text-slate-700 dark:text-slate-200 font-bold">{c.avg_score}</strong></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Top candidates are highlighted above. Take more tests to see more candidates appear here!
          </div>
        )}
      </div>
    </div>
  );
}
