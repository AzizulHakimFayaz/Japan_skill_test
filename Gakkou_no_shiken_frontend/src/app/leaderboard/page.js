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
} from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = () => {
    setLoading(true);
    setError(null);
    getLeaderboard()
      .then((res) => {
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
            onClick={fetchLeaderboard}
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-indigo-300 font-extrabold uppercase shrink-0">Your Standing:</span>
                <strong className="text-sm sm:text-base font-black text-white truncate">{current_user_rank.full_name}</strong>
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

          {/* 3-Column Olympic Podium Layout: [2nd Silver] [1st Gold (Center Elevated)] [3rd Bronze] */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
            {/* 2nd Place (Silver) */}
            {secondPlace ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-slate-400/50 shadow-xl shadow-slate-900/10 flex flex-col justify-between order-2 md:order-1 relative overflow-hidden group hover:border-slate-300 transition-all">
                <div className="absolute top-3.5 right-4 text-2xl font-black opacity-30 select-none">#2</div>
                <div className="space-y-3.5">
                  <Link href={`/profile/${encodeURIComponent(secondPlace.username)}`} className="flex items-start gap-3 group/item">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-lg sm:text-xl flex items-center justify-center shadow-lg border-2 border-white/40 group-hover/item:scale-105 transition-transform">
                      {secondPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 text-[9px] sm:text-[10px] font-black uppercase">
                        <Medal className="w-3 h-3 text-slate-300 shrink-0" />
                        <span>2nd Place</span>
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-tight truncate group-hover/item:text-amber-300 transition-colors">
                        {secondPlace.full_name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono truncate block max-w-full">@{secondPlace.username}</span>
                    </div>
                  </Link>

                  {secondPlace.bio && (
                    <p className="text-xs text-slate-300 italic line-clamp-2">"{secondPlace.bio}"</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-lg text-slate-300 border border-slate-700">
                      {secondPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-lg text-slate-300 border border-slate-700">
                      {secondPlace.japanese_level_display}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center flex-1">
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Passed</span>
                      <strong className="text-xs sm:text-sm font-black text-emerald-400">{secondPlace.passed_attempts}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">High Score</span>
                      <strong className="text-xs sm:text-sm font-black text-amber-400">{secondPlace.highest_score}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Avg Score</span>
                      <strong className="text-xs sm:text-sm font-black text-white">{secondPlace.avg_score}</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                    className="shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}

            {/* 1st Place (Gold - Elevated Centerpiece) */}
            {firstPlace && (
              <div className="bg-gradient-to-b from-amber-950/80 via-slate-950 to-slate-950 text-white rounded-3xl p-5 sm:p-7 border-2 border-amber-400 shadow-2xl shadow-amber-500/25 flex flex-col justify-between order-1 md:order-2 md:-translate-y-4 relative overflow-hidden group hover:scale-[1.01] transition-all">
                <div className="absolute top-3.5 right-4 text-2xl font-black text-amber-400 opacity-60 select-none">#1</div>
                <div className="space-y-3.5">
                  <Link href={`/profile/${encodeURIComponent(firstPlace.username)}`} className="flex items-start gap-3.5 group/item">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white/60 group-hover/item:scale-105 transition-transform">
                      {firstPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>National Champion</span>
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-tight truncate group-hover/item:text-amber-300 transition-colors">
                        {firstPlace.full_name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono truncate block max-w-full">@{firstPlace.username}</span>
                    </div>
                  </Link>

                  {firstPlace.bio && (
                    <p className="text-xs text-slate-300 italic line-clamp-2">"{firstPlace.bio}"</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-950/60 rounded-lg text-amber-300 border border-amber-700/50">
                      {firstPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-950/60 rounded-lg text-amber-300 border border-amber-700/50">
                      {firstPlace.japanese_level_display}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center flex-1">
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Passed</span>
                      <strong className="text-sm sm:text-base font-black text-emerald-400">{firstPlace.passed_attempts}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">High Score</span>
                      <strong className="text-sm sm:text-base font-black text-amber-400">{firstPlace.highest_score}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Avg Score</span>
                      <strong className="text-sm sm:text-base font-black text-white">{firstPlace.avg_score}</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                    className="shrink-0 px-3 py-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {thirdPlace ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-amber-700/50 shadow-xl shadow-slate-900/10 flex flex-col justify-between order-3 md:order-3 relative overflow-hidden group hover:border-amber-600 transition-all">
                <div className="absolute top-3.5 right-4 text-2xl font-black opacity-30 select-none">#3</div>
                <div className="space-y-3.5">
                  <Link href={`/profile/${encodeURIComponent(thirdPlace.username)}`} className="flex items-start gap-3 group/item">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 aspect-square rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-lg border-2 border-white/20 group-hover/item:scale-105 transition-transform">
                      {thirdPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/30 text-[9px] sm:text-[10px] font-black uppercase">
                        <Medal className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>3rd Place</span>
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-tight truncate group-hover/item:text-amber-300 transition-colors">
                        {thirdPlace.full_name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono truncate block max-w-full">@{thirdPlace.username}</span>
                    </div>
                  </Link>

                  {thirdPlace.bio && (
                    <p className="text-xs text-slate-300 italic line-clamp-2">"{thirdPlace.bio}"</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-lg text-slate-300 border border-slate-700">
                      {thirdPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800/90 rounded-lg text-slate-300 border border-slate-700">
                      {thirdPlace.japanese_level_display}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center flex-1">
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Passed</span>
                      <strong className="text-xs sm:text-sm font-black text-emerald-400">{thirdPlace.passed_attempts}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">High Score</span>
                      <strong className="text-xs sm:text-sm font-black text-amber-400">{thirdPlace.highest_score}</strong>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl py-1.5 px-1 border border-slate-800/80">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-bold">Avg Score</span>
                      <strong className="text-xs sm:text-sm font-black text-white">{thirdPlace.avg_score}</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                    className="shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}
          </div>
        </div>
      )}

      {/* 4. Full Standings Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Overall Standings ({rankings.length > 0 ? `Ranks 4 to ${rankings.length + 3}` : 'Top Candidates'})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard ranking</span>
        </div>

        {rankings.length > 0 ? (
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] sm:text-xs">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Target &amp; Level</th>
                    <th className="py-3.5 px-4 text-center">Passed Exams</th>
                    <th className="py-3.5 px-4 text-center">High Score</th>
                    <th className="py-3.5 px-4 text-center hidden sm:table-cell">Avg Score</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {rankings.map((c) => {
                    const isCurrentUser = user && user.id === c.user_id;
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
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-mono truncate max-w-[160px] sm:max-w-[220px]">@{c.username}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
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
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400 hidden sm:table-cell">
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
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Top candidates are highlighted above. Take more tests to see more candidates appear here!
          </div>
        )}
      </div>
    </div>
  );
}
