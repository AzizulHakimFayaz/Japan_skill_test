'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Shield,
  Zap,
  Search,
  Target,
  Gamepad2,
  TrendingUp,
  User,
  Star,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { getInitialGameProgress } from '@/lib/gameStore';

// Safe country mapping for high-contrast, beautiful flag badges on all mobile & desktop platforms
const COUNTRY_LOOKUP = {
  japan: { code: 'JP', name: 'Japan', flag: '🇯🇵', accent: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  jp: { code: 'JP', name: 'Japan', flag: '🇯🇵', accent: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  bangladesh: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', accent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  bd: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', accent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  myanmar: { code: 'MM', name: 'Myanmar', flag: '🇲🇲', accent: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  mm: { code: 'MM', name: 'Myanmar', flag: '🇲🇲', accent: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  indonesia: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', accent: 'bg-red-500/20 text-red-300 border-red-500/30' },
  id: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', accent: 'bg-red-500/20 text-red-300 border-red-500/30' },
  thailand: { code: 'TH', name: 'Thailand', flag: '🇹🇭', accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  th: { code: 'TH', name: 'Thailand', flag: '🇹🇭', accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  nepal: { code: 'NP', name: 'Nepal', flag: '🇳🇵', accent: 'bg-red-500/20 text-red-300 border-red-500/30' },
  np: { code: 'NP', name: 'Nepal', flag: '🇳🇵', accent: 'bg-red-500/20 text-red-300 border-red-500/30' },
  vietnam: { code: 'VN', name: 'Vietnam', flag: '🇻🇳', accent: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  vn: { code: 'VN', name: 'Vietnam', flag: '🇻🇳', accent: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  philippines: { code: 'PH', name: 'Philippines', flag: '🇵🇭', accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  ph: { code: 'PH', name: 'Philippines', flag: '🇵🇭', accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  india: { code: 'IN', name: 'India', flag: '🇮🇳', accent: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  in: { code: 'IN', name: 'India', flag: '🇮🇳', accent: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
};

function getCountryMeta(countryStr) {
  if (!countryStr) return { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', accent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  const key = String(countryStr).trim().toLowerCase();
  return (
    COUNTRY_LOOKUP[key] || {
      code: countryStr.length === 2 ? countryStr.toUpperCase() : 'GL',
      name: countryStr,
      flag: '🌐',
      accent: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
    }
  );
}

function getTierBadge(level) {
  if (level >= 15) {
    return { name: 'GRANDMASTER', style: 'bg-purple-950/80 text-purple-300 border-purple-500/50' };
  }
  if (level >= 10) {
    return { name: 'DIAMOND', style: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50' };
  }
  if (level >= 6) {
    return { name: 'PLATINUM', style: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' };
  }
  return { name: 'CONTENDER', style: 'bg-amber-950/80 text-amber-300 border-amber-500/50' };
}

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
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState(FALLBACK_LEADERBOARD);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'streak' | 'words'
  const [searchQuery, setSearchQuery] = useState('');
  const [userProgress, setUserProgress] = useState(getInitialGameProgress());

  useEffect(() => {
    setUserProgress(getInitialGameProgress());
    const onProgress = () => setUserProgress(getInitialGameProgress());
    window.addEventListener('game_progress_updated', onProgress);
    return () => window.removeEventListener('game_progress_updated', onProgress);
  }, []);

  useEffect(() => {
    async function fetchRanks() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/api/games/leaderboard/`);
        if (res.ok) {
          const data = await res.json();
          if (data?.leaderboard && data.leaderboard.length > 0) {
            // Keep real candidates and fill up to 8 with seed candidates if needed for competitive arena vibe
            const combined = [...data.leaderboard];
            FALLBACK_LEADERBOARD.forEach((fallback) => {
              if (
                combined.length < 8 &&
                !combined.some((p) => p.username.toLowerCase() === fallback.username.toLowerCase())
              ) {
                combined.push({
                  ...fallback,
                  rank: combined.length + 1,
                });
              }
            });
            setLeaderboard(combined);
          }
        }
      } catch {
        // Fallback already active
      } finally {
        setLoading(false);
      }
    }
    fetchRanks();
  }, []);

  // Sorted and filtered list
  const processedList = useMemo(() => {
    let list = [...leaderboard];
    if (activeTab === 'streak') {
      list.sort((a, b) => (b.streak || 0) - (a.streak || 0) || (b.xp || 0) - (a.xp || 0));
    } else if (activeTab === 'words') {
      list.sort((a, b) => (b.mastered || 0) - (a.mastered || 0) || (b.xp || 0) - (a.xp || 0));
    } else {
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.streak || 0) - (a.streak || 0));
    }

    const ranked = list.map((item, idx) => ({ ...item, displayRank: idx + 1 }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return ranked.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          (p.full_name && p.full_name.toLowerCase().includes(q)) ||
          (p.country && p.country.toLowerCase().includes(q))
      );
    }
    return ranked;
  }, [leaderboard, activeTab, searchQuery]);

  const top3 = useMemo(() => processedList.slice(0, 3), [processedList]);

  // Find user's ranking
  const myRank = useMemo(() => {
    if (!isAuthenticated || !user?.username) return null;
    return processedList.find((p) => p.username.toLowerCase() === user.username.toLowerCase());
  }, [processedList, isAuthenticated, user]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto pb-24 sm:pb-16 px-1 sm:px-0">
      {/* ── 1. Cyber Arcade Top Banner ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1328] via-[#090e1c] to-[#060a14] border border-cyan-500/30 p-4 sm:p-7 shadow-2xl">
        {/* Neon Glow Radiance */}
        <div className="absolute -top-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-44 sm:w-60 h-44 sm:h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb & Live Status */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link
                href="/game-zone"
                className="text-[11px] font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ARCADE HUB</span>
              </Link>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/50 text-[10px] font-black text-rose-300 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>SEASON 1 LIVE</span>
              </div>
            </div>

            {/* Title with Gaming Neon Gradient */}
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5 drop-shadow-md">
              <Trophy className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 fill-amber-400/25 shrink-0 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]" />
              <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
                HALL OF CHAMPIONS
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-300 mt-1 max-w-xl">
              Climb the ranks by playing Japanese arcade games. Earn XP, maintain daily streaks, and secure your place on the podium!
            </p>

            {/* Quick Stat Counter Pills */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-black text-amber-400">
                <Crown className="w-3.5 h-3.5" />
                <span>{leaderboard[0]?.full_name || 'Champion'} #1</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-black text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>{leaderboard[0]?.xp || 2450} Max XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-black text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{leaderboard[0]?.streak || 14}d Streak</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0">
            <Link
              href="/game-zone/word-match"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-japan-red via-rose-600 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-500/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 border border-red-400/40 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>PLAY &amp; RANK UP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Top 3 Championship Podium (True 3-Tier Esports Stage) ── */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0b1226] via-[#080d1d] to-[#050811] border border-cyan-500/25 p-3 sm:p-6 shadow-xl overflow-hidden">
        {/* Neon Stage Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-28 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-3">
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHAMPIONSHIP PODIUM</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 3-Tier Side-by-Side Podium */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 items-end max-w-xl mx-auto pt-2">
          {/* 🥈 #2 Silver Runner-Up (Left) */}
          {top3[1] && (
            <div className="flex flex-col items-center text-center">
              {/* Badge & Avatar */}
              <div className="mb-1.5 flex flex-col items-center">
                <span className="text-[11px] sm:text-xs font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)] mb-1">
                  #2
                </span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-300 via-cyan-200 to-slate-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#0c1429] flex items-center justify-center text-base sm:text-xl font-black">
                    🥈
                  </div>
                </div>
              </div>

              {/* Player Info Card */}
              <div className="w-full px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-slate-800/90 border border-slate-700 text-[9px] font-black text-slate-300 mb-0.5">
                  <span>{getCountryMeta(top3[1].country).flag}</span>
                  <span className="truncate max-w-[50px] sm:max-w-none">{getCountryMeta(top3[1].country).name}</span>
                </div>
                <h3 className="text-[11px] sm:text-xs font-black text-white truncate max-w-[90px] sm:max-w-[130px]">
                  {top3[1].full_name}
                </h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate max-w-[85px] sm:max-w-[120px]">
                  @{top3[1].username}
                </p>

                <div className="mt-1 flex items-center justify-center gap-1 flex-wrap">
                  <span className="px-1.5 py-0.2 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-black">
                    Lv. {top3[1].level}
                  </span>
                  <span className="text-amber-400 font-black text-[10px] sm:text-xs">
                    {top3[1].xp} XP
                  </span>
                </div>
                <div className="text-[9px] text-orange-400 font-bold mt-0.5">
                  🔥 {top3[1].streak}d
                </div>
              </div>

              {/* Pedestal Base */}
              <div className="w-full h-16 sm:h-24 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-cyan-950/70 via-slate-900 to-[#050811] border-t-2 border-x border-cyan-400/60 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-cyan-300/70">2</span>
                <span className="text-[8px] sm:text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                  SILVER
                </span>
              </div>
            </div>
          )}

          {/* 🥇 #1 Gold Champion (Center - Elevated & Crowned) */}
          {top3[0] && (
            <div className="flex flex-col items-center text-center -translate-y-2">
              {/* Crown & Avatar */}
              <div className="mb-1.5 flex flex-col items-center">
                <div className="animate-bounce">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] mb-1">
                  CHAMPION
                </span>
                <div className="w-15 h-15 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 p-0.5 shadow-xl shadow-amber-500/40 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] sm:rounded-[22px] bg-[#0c1429] flex items-center justify-center text-xl sm:text-2xl font-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-400/15 pointer-events-none"></div>
                    🥇
                  </div>
                </div>
              </div>

              {/* Player Info Card */}
              <div className="w-full px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-950/90 border border-amber-500/60 text-[9px] font-black text-amber-300 mb-0.5">
                  <span>{getCountryMeta(top3[0].country).flag}</span>
                  <span className="truncate max-w-[60px] sm:max-w-none">{getCountryMeta(top3[0].country).name}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-[100px] sm:max-w-[140px] drop-shadow-xs">
                  {top3[0].full_name}
                </h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 truncate max-w-[95px] sm:max-w-[130px]">
                  @{top3[0].username}
                </p>

                <div className="mt-1 flex items-center justify-center gap-1 flex-wrap">
                  <span className="px-1.5 py-0.2 rounded-md bg-japan-red text-white text-[9px] font-black shadow-xs">
                    Lv. {top3[0].level}
                  </span>
                  <span className="text-amber-400 font-black text-[11px] sm:text-sm drop-shadow-xs">
                    ⚡ {top3[0].xp} XP
                  </span>
                </div>
                <div className="text-[9px] text-orange-400 font-black mt-0.5 flex items-center justify-center gap-1">
                  <span>🔥 {top3[0].streak}d</span>
                  <span>•</span>
                  <span>✅ {top3[0].mastered}w</span>
                </div>
              </div>

              {/* Pedestal Base */}
              <div className="w-full h-24 sm:h-32 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-amber-600/35 via-amber-950/80 to-[#050811] border-t-2 border-x border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl font-black text-amber-400/90 drop-shadow-md">1</span>
                <span className="text-[8px] sm:text-[10px] font-black text-amber-300 uppercase tracking-widest drop-shadow-xs">
                  GOLD
                </span>
              </div>
            </div>
          )}

          {/* 🥉 #3 Bronze Contender (Right) */}
          {top3[2] && (
            <div className="flex flex-col items-center text-center">
              {/* Badge & Avatar */}
              <div className="mb-1.5 flex flex-col items-center">
                <span className="text-[11px] sm:text-xs font-black text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] mb-1">
                  #3
                </span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-700 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#0c1429] flex items-center justify-center text-base sm:text-xl font-black">
                    🥉
                  </div>
                </div>
              </div>

              {/* Player Info Card */}
              <div className="w-full px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-slate-800/90 border border-slate-700 text-[9px] font-black text-slate-300 mb-0.5">
                  <span>{getCountryMeta(top3[2].country).flag}</span>
                  <span className="truncate max-w-[50px] sm:max-w-none">{getCountryMeta(top3[2].country).name}</span>
                </div>
                <h3 className="text-[11px] sm:text-xs font-black text-white truncate max-w-[90px] sm:max-w-[130px]">
                  {top3[2].full_name}
                </h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate max-w-[85px] sm:max-w-[120px]">
                  @{top3[2].username}
                </p>

                <div className="mt-1 flex items-center justify-center gap-1 flex-wrap">
                  <span className="px-1.5 py-0.2 rounded-md bg-orange-950/80 border border-orange-500/40 text-orange-300 text-[9px] font-black">
                    Lv. {top3[2].level}
                  </span>
                  <span className="text-amber-400 font-black text-[10px] sm:text-xs">
                    {top3[2].xp} XP
                  </span>
                </div>
                <div className="text-[9px] text-orange-400 font-bold mt-0.5">
                  🔥 {top3[2].streak}d
                </div>
              </div>

              {/* Pedestal Base */}
              <div className="w-full h-12 sm:h-20 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-orange-950/70 via-slate-900 to-[#050811] border-t-2 border-x border-orange-500/60 flex flex-col items-center justify-center shadow-inner">
                <span className="text-xl sm:text-3xl font-black text-orange-400/70">3</span>
                <span className="text-[8px] sm:text-[9px] font-black text-orange-400 uppercase tracking-widest">
                  BRONZE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Candidate Arena Status Bar (Integrated, Never Covers Navigation) ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d162e] via-[#091024] to-[#0c1630] border-2 border-cyan-500/35 p-3 sm:p-4 shadow-xl flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            🎮
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
              <span>{isAuthenticated ? `@${user?.username}` : 'Guest Arena Pilot'}</span>
              {myRank ? (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
                  Rank #{myRank.displayRank}
                </span>
              ) : (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                  Unranked
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-300 truncate mt-0.5">
              Level {userProgress.level} • {userProgress.xp} XP • {userProgress.streak}d Streak
            </p>
          </div>
        </div>

        <Link
          href="/game-zone/word-match"
          className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-japan-red via-rose-600 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/30 flex items-center gap-1.5 shrink-0 hover:scale-103 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span className="hidden min-[360px]:inline">Play Word Match</span>
          <span className="min-[360px]:hidden">Play</span>
        </Link>
      </div>

      {/* ── 4. League Filters & Instant Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* League Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0b1124] rounded-2xl border border-cyan-500/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All-Time XP</span>
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'streak'
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Streak Masters</span>
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'words'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vocab Kings</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or country..."
            className="w-full pl-8.5 pr-3 py-1.5 sm:py-2 rounded-xl bg-[#0b1124] border border-cyan-500/20 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* ── 5. Ranking Contenders (Mobile-First Gaming Card Rows) ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-xs font-black text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-amber-400" />
            <span>Leaderboard Standings ({processedList.length})</span>
          </span>
          <span className="text-[11px] text-cyan-400 font-bold">Auto-Ranked</span>
        </div>

        {/* Player Gaming Cards */}
        {processedList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0b1124] border border-slate-800 text-slate-400 text-sm font-bold">
            No candidate found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          processedList.map((player) => {
            const country = getCountryMeta(player.country);
            const tier = getTierBadge(player.level);
            const isMe = isAuthenticated && user?.username && player.username.toLowerCase() === user.username.toLowerCase();

            const rankBorder =
              player.displayRank === 1
                ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/15 via-[#0d162e] to-[#070b14] shadow-md shadow-amber-500/10'
                : player.displayRank === 2
                ? 'border-cyan-400/50 bg-gradient-to-r from-cyan-500/15 via-[#0d162e] to-[#070b14] shadow-sm shadow-cyan-500/10'
                : player.displayRank === 3
                ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-[#0d162e] to-[#070b14] shadow-sm shadow-orange-500/10'
                : isMe
                ? 'border-cyan-400/70 bg-[#0d1836]'
                : 'border-slate-800/80 bg-[#0a0f20] hover:border-cyan-500/40 hover:bg-[#0d142c]';

            return (
              <div
                key={player.username}
                className={`relative rounded-2xl p-2.5 sm:p-3.5 border transition-all flex flex-col gap-2 ${rankBorder}`}
              >
                {/* Top Row: Rank Badge, Avatar, Player Info, Big XP */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 font-black text-xs sm:text-sm">
                      {player.displayRank === 1 ? (
                        <span className="text-base sm:text-lg">🥇</span>
                      ) : player.displayRank === 2 ? (
                        <span className="text-base sm:text-lg">🥈</span>
                      ) : player.displayRank === 3 ? (
                        <span className="text-base sm:text-lg">🥉</span>
                      ) : (
                        <span className="text-slate-300 font-extrabold">#{player.displayRank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-japan-red via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[10px] leading-none">
                        {country.flag}
                      </span>
                    </div>

                    {/* Name & Handle */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-black text-white text-xs sm:text-sm truncate">
                          {player.full_name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-cyan-400 text-slate-950 shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">
                        @{player.username}
                      </div>
                    </div>
                  </div>

                  {/* Primary XP Score */}
                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{player.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Tier Tag, Level, Streak, Mastered, Country */}
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] font-black flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Country Badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-black ${country.accent}`}>
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>

                    {/* Tier Badge */}
                    <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black ${tier.style}`}>
                      {tier.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Level Pill */}
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-950/70 border border-rose-500/40 text-japan-red text-[10px] font-black">
                      Lv. {player.level}
                    </span>

                    {/* Daily Streak */}
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-950/60 border border-orange-500/40 text-orange-400 text-[10px] font-black">
                      <Flame className="w-3 h-3 fill-orange-400" />
                      <span>{player.streak}d</span>
                    </span>

                    {/* Words Mastered */}
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-black">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{player.mastered}w</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
