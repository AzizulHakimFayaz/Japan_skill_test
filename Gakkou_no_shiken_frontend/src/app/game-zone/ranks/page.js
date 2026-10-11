'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

const FALLBACK_LEADERBOARD = [
  { rank: 1, username: 'SakuraSenpai', full_name: 'Sakura Tanaka', country: 'Japan', country_flag: '🇯🇵', level: 18, xp: 2450, streak: 14, mastered: 520 },
  { rank: 2, username: 'FayazNinja', full_name: 'Azizul Hakim', country: 'Bangladesh', country_flag: '🇧🇩', level: 15, xp: 1850, streak: 9, mastered: 460 },
  { rank: 3, username: 'KenjiSpeed', full_name: 'Kenji Sato', country: 'Japan', country_flag: '🇯🇵', level: 12, xp: 1200, streak: 6, mastered: 380 },
  { rank: 4, username: 'RahimBD', full_name: 'Rahim Ahmed', country: 'Bangladesh', country_flag: '🇧🇩', level: 10, xp: 950, streak: 5, mastered: 310 },
  { rank: 5, username: 'AungMinMM', full_name: 'Aung Min', country: 'Myanmar', country_flag: '🇲🇲', level: 8, xp: 720, streak: 4, mastered: 240 },
  { rank: 6, username: 'ThiriK', full_name: 'Thiri Khin', country: 'Myanmar', country_flag: '🇲🇲', level: 7, xp: 680, streak: 3, mastered: 210 },
  { rank: 7, username: 'BudiSetiawan', full_name: 'Budi Setiawan', country: 'Indonesia', country_flag: '🇮🇩', level: 6, xp: 590, streak: 3, mastered: 190 },
  { rank: 8, username: 'SomchaiBKK', full_name: 'Somchai Prasert', country: 'Thailand', country_flag: '🇹🇭', level: 5, xp: 510, streak: 2, mastered: 165 },
];

export default function GameZoneRanksPage() {
  const [leaderboard, setLeaderboard] = useState(FALLBACK_LEADERBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanks() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/api/games/leaderboard/`);
        if (res.ok) {
          const data = await res.json();
          if (data?.leaderboard && data.leaderboard.length > 0) {
            setLeaderboard(data.leaderboard);
          }
        }
      } catch {
        // Fallback already set
      } finally {
        setLoading(false);
      }
    }
    fetchRanks();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/game-zone"
              className="text-xs font-bold text-slate-500 hover:text-japan-red flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Games</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
              National Leaderboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Game Zone Rankings</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            Top candidates ranked by Game XP, daily streak, and vocabulary mastery.
          </p>
        </div>

        <Link
          href="/game-zone/word-match"
          className="px-5 py-2.5 rounded-2xl bg-japan-red hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 transition-all flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Play to Rank Up</span>
        </Link>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="order-2 md:order-1 bg-white dark:bg-[#0c1222] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-2xl font-black text-slate-400">#2</div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-800 font-black text-xl flex items-center justify-center shadow-md mb-3">
              🥈
            </div>
            <span className="text-lg mb-1">{top3[1].country_flag}</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate max-w-full">
              {top3[1].full_name}
            </h3>
            <p className="text-xs font-bold text-slate-400">@{top3[1].username}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-japan-red font-black text-xs border border-rose-200/80 dark:border-rose-900/40">
                Lvl {top3[1].level}
              </span>
              <span className="font-black text-amber-500 text-xs">{top3[1].xp} XP</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-2">
              <span>🔥 {top3[1].streak}d Streak</span>
              <span>•</span>
              <span>✅ {top3[1].mastered} Words</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion Podium Center) */}
        {top3[0] && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-[#0c1222] border-2 border-amber-400 dark:border-amber-500/80 rounded-3xl p-6 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center relative overflow-hidden md:-translate-y-2">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 relative">
              <Crown className="w-6 h-6 text-yellow-600 absolute -top-3 drop-shadow-xs" />
              <span>🥇</span>
            </div>
            <span className="text-2xl mb-1">{top3[0].country_flag}</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-full">
              {top3[0].full_name}
            </h3>
            <p className="text-xs font-bold text-slate-400">@{top3[0].username}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-japan-red text-white font-black text-xs shadow-xs">
                Lvl {top3[0].level}
              </span>
              <span className="font-black text-amber-500 text-sm">{top3[0].xp} XP</span>
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-2">
              <span>🔥 {top3[0].streak}d Streak</span>
              <span>•</span>
              <span>✅ {top3[0].mastered} Words</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="order-3 bg-white dark:bg-[#0c1222] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-2xl font-black text-slate-400">#3</div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black text-xl flex items-center justify-center shadow-md mb-3">
              🥉
            </div>
            <span className="text-lg mb-1">{top3[2].country_flag}</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate max-w-full">
              {top3[2].full_name}
            </h3>
            <p className="text-xs font-bold text-slate-400">@{top3[2].username}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-japan-red font-black text-xs border border-rose-200/80 dark:border-rose-900/40">
                Lvl {top3[2].level}
              </span>
              <span className="font-black text-amber-500 text-xs">{top3[2].xp} XP</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-2">
              <span>🔥 {top3[2].streak}d Streak</span>
              <span>•</span>
              <span>✅ {top3[2].mastered} Words</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-japan-red" />
          <span>All Ranked Candidates</span>
        </h2>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                <th className="pb-3 text-center w-12">Rank</th>
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Country</th>
                <th className="pb-3 text-center">Level &amp; XP</th>
                <th className="pb-3 text-center">Streak</th>
                <th className="pb-3 text-center">Mastered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold">
              {leaderboard.map((player) => (
                <tr
                  key={player.username}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 text-center font-black">
                    {player.rank === 1 ? (
                      <span className="text-amber-500 text-base">🥇</span>
                    ) : player.rank === 2 ? (
                      <span className="text-slate-400 text-base">🥈</span>
                    ) : player.rank === 3 ? (
                      <span className="text-amber-700 text-base">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{player.rank}</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-japan-red to-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 dark:text-white truncate">
                          {player.full_name}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 truncate">
                          @{player.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>{player.country_flag}</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{player.country}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-japan-red font-black text-xs">
                      Lvl {player.level} • {player.xp} XP
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-orange-500 font-black">
                    🔥 {player.streak}d
                  </td>
                  <td className="py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-black">
                    ✅ {player.mastered}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
