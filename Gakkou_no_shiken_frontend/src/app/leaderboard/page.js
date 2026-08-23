'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">Loading Candidate Rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          ⚠
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link href="/" className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl">
          Back to Portal
        </Link>
      </div>
    );
  }

  const { top_three = [], rankings = [], current_user_rank = null, total_candidates = 0 } = data || {};

  const firstPlace = top_three.find((c) => c.rank === 1);
  const secondPlace = top_three.find((c) => c.rank === 2);
  const thirdPlace = top_three.find((c) => c.rank === 3);

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#131d33] to-slate-900 text-white p-6 sm:p-12 shadow-2xl border border-slate-800/80">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase">
              🏆 Official Candidate Standings
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              CBT Exam Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Rankings updated in real time based on passed mock tests, high scores, and examination consistency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Ranked</span>
              <strong className="text-xl sm:text-2xl font-black text-amber-400">{total_candidates}</strong>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-red-500/25 active:scale-95 transition-all"
            >
              Take Mock Exam →
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
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md border border-indigo-400/40">
              {current_user_rank.rank ? `#${current_user_rank.rank}` : '—'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300 font-extrabold uppercase">Your Standing:</span>
                <strong className="text-sm sm:text-base font-black text-white">{current_user_rank.full_name}</strong>
              </div>
              <p className="text-xs text-slate-300">
                {current_user_rank.rank
                  ? `Ranked #${current_user_rank.rank} of ${total_candidates} candidates`
                  : 'Complete your first practice test to join the ranked leaderboard!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold self-end sm:self-center">
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>👑</span> Top Ranked Candidates
            </h2>
            <span className="text-xs text-slate-500 font-bold">Gold, Silver &amp; Bronze Podium</span>
          </div>

          {/* 3-Column Olympic Podium Layout: [2nd Silver] [1st Gold (Center Elevated)] [3rd Bronze] */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
            {/* 🥈 2nd Place (Silver) */}

            {secondPlace ? (

              <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border-2 border-slate-400/50 shadow-xl shadow-slate-900/10 flex flex-col justify-between order-2 md:order-1 relative overflow-hidden group hover:border-slate-300 transition-all">
                <div className="absolute top-3 right-3 text-2xl font-black opacity-30">#2</div>
                <div className="space-y-4">
                  <Link href={`/profile/${encodeURIComponent(secondPlace.username)}`} className="flex items-center gap-3 group/item">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/40 group-hover/item:scale-105 transition-transform">
                      {secondPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 text-[10px] font-black uppercase">
                        🥈 2nd Place
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-tight line-clamp-1 group-hover/item:text-amber-300 transition-colors">
                        {secondPlace.full_name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">@{secondPlace.username}</span>
                    </div>
                  </Link>

                  {secondPlace.bio && (
                    <p className="text-xs text-slate-300 italic line-clamp-2">"{secondPlace.bio}"</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                      {secondPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                      {secondPlace.japanese_level_display}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Passed</span>
                      <strong className="text-sm font-black text-emerald-400">{secondPlace.passed_attempts}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">High Score</span>
                      <strong className="text-sm font-black text-amber-400">{secondPlace.highest_score}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Score</span>
                      <strong className="text-sm font-black text-white">{secondPlace.avg_score}</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(secondPlace.username)}`}
                    className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-colors"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}

            {/* 🥇 1st Place (Gold - Elevated Centerpiece) */}
            {firstPlace && (
              <div className="bg-gradient-to-b from-amber-950/80 via-slate-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-2xl shadow-amber-500/25 flex flex-col justify-between order-1 md:order-2 md:-translate-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all">
                {/* Crown Glow Accent */}
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 animate-shimmer-bar"></div>
                <div className="absolute top-3 right-3 text-3xl font-black text-amber-400/40">👑 #1</div>

                <div className="space-y-4">
                  <Link href={`/profile/${encodeURIComponent(firstPlace.username)}`} className="flex items-center gap-3.5 group/item">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/40 border-2 border-white group-hover/item:scale-105 transition-transform">
                      {firstPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[11px] font-black uppercase tracking-wide">
                        🥇 1st Champion
                      </span>
                      <h3 className="text-lg font-black text-white mt-1 leading-tight line-clamp-1 group-hover/item:text-amber-300 transition-colors">
                        {firstPlace.full_name}
                      </h3>
                      <span className="text-xs text-amber-300/80 font-mono">@{firstPlace.username}</span>
                    </div>
                  </Link>

                  {firstPlace.bio ? (
                    <p className="text-xs sm:text-sm text-amber-100/90 italic line-clamp-2">"{firstPlace.bio}"</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Top scoring candidate on Gakkou No Shiken</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-500/20 rounded-lg text-amber-200 border border-amber-500/30">
                      🎯 {firstPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-500/20 rounded-lg text-emerald-200 border border-emerald-500/30">
                      🌸 {firstPlace.japanese_level_display}
                    </span>
                    {firstPlace.location && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                        📍 {firstPlace.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-500/30 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 p-4 bg-amber-500/10 rounded-b-3xl flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center flex-1">
                    <div>
                      <span className="text-[10px] text-amber-300/80 block uppercase font-bold">Passed</span>
                      <strong className="text-base font-black text-emerald-400">{firstPlace.passed_attempts}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-300/80 block uppercase font-bold">High Score</span>
                      <strong className="text-base font-black text-amber-300">{firstPlace.highest_score}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-300/80 block uppercase font-bold">Pass Rate</span>
                      <strong className="text-base font-black text-white">{firstPlace.pass_rate}%</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(firstPlace.username)}`}
                    className="ml-3 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            )}

            {/* 🥉 3rd Place (Bronze) */}
            {thirdPlace ? (
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-700/50 shadow-xl shadow-slate-900/10 flex flex-col justify-between order-3 relative overflow-hidden group hover:border-amber-600 transition-all">
                <div className="absolute top-3 right-3 text-2xl font-black opacity-30">#3</div>
                <div className="space-y-4">
                  <Link href={`/profile/${encodeURIComponent(thirdPlace.username)}`} className="flex items-center gap-3 group/item">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/20 group-hover/item:scale-105 transition-transform">
                      {thirdPlace.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/30 text-[10px] font-black uppercase">
                        🥉 3rd Place
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-tight line-clamp-1 group-hover/item:text-amber-300 transition-colors">
                        {thirdPlace.full_name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">@{thirdPlace.username}</span>
                    </div>
                  </Link>

                  {thirdPlace.bio && (
                    <p className="text-xs text-slate-300 italic line-clamp-2">"{thirdPlace.bio}"</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                      {thirdPlace.target_exam_display}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                      {thirdPlace.japanese_level_display}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Passed</span>
                      <strong className="text-sm font-black text-emerald-400">{thirdPlace.passed_attempts}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">High Score</span>
                      <strong className="text-sm font-black text-amber-400">{thirdPlace.highest_score}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Score</span>
                      <strong className="text-sm font-black text-white">{thirdPlace.avg_score}</strong>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${encodeURIComponent(thirdPlace.username)}`}
                    className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition-colors"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}
          </div>
        </div>
      )}

      {/* 4. Full Standings Table (4th Place Onwards - Unhighlighted) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Overall Standings ({rankings.length > 0 ? `Ranks 4 to ${rankings.length + 3}` : 'Top Candidates'})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Standard ranking</span>
        </div>

        {rankings.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] sm:text-xs">
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
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {rankings.map((c) => {
                    const isCurrentUser = user && user.id === c.user_id;
                    return (
                      <tr
                        key={c.user_id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCurrentUser ? 'bg-indigo-50/50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 sm:px-6 text-center font-black text-slate-500 text-xs sm:text-sm">
                          #{c.rank}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/profile/${encodeURIComponent(c.username)}`}
                            className="flex items-center gap-3 group/cand"
                          >
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0 border border-slate-200 group-hover/cand:border-japan-red group-hover/cand:bg-red-50 transition-colors">
                              {c.full_name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 group-hover/cand:text-japan-red transition-colors">
                                  {c.full_name}
                                </span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded text-[9px] font-extrabold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block font-mono">@{c.username}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <span className="text-xs text-slate-800 font-bold block">{c.target_exam_display}</span>
                            <span className="text-[10px] text-slate-400 block">{c.japanese_level_display}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {c.passed_attempts} <span className="text-[10px] text-slate-400 font-normal">({c.total_attempts} took)</span>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-900">
                          {c.highest_score} <span className="text-[10px] text-slate-400 font-normal">/ 250</span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600 hidden sm:table-cell">
                          {c.avg_score}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/profile/${encodeURIComponent(c.username)}`}
                            className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-japan-red hover:bg-slate-100 rounded-lg transition-colors inline-block"
                          >
                            View →
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
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 text-center text-slate-500 text-xs sm:text-sm">
            Top candidates are highlighted above. Take more tests to see more candidates appear here!
          </div>
        )}
      </div>

    </div>
  );
}
