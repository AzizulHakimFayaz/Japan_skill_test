'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Layers,
  BookOpen,
  Headphones,
  Crosshair,
  Compass,
  Heart,
  Flame,
  ArrowRight,
  Play,
  Trophy,
  Star,
  CheckCircle2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { getInitialGameProgress } from '@/lib/gameStore';

const ARCADE_GAMES = [
  {
    id: 'word-match',
    title: 'Word Match',
    japaneseTitle: '単語マッチ',
    category: 'featured',
    desc: 'Match Japanese kanji/hiragana with meanings. Interactive pair board with native audio pronunciation.',
    icon: Layers,
    href: '/game-zone/word-match',
    tag: 'Hot & Featured',
    gradient: 'from-rose-500 to-red-600',
    xpReward: '+50 XP',
    time: '2-3 min',
  },
  {
    id: 'word-rush',
    title: 'Word Rush',
    japaneseTitle: 'スピード単語',
    category: 'speed',
    desc: 'Rapid-fire speed drill. How many words can you translate in 60 frantic seconds?',
    icon: Zap,
    href: '/game-zone/word-rush',
    tag: 'Speed Test',
    gradient: 'from-amber-500 to-orange-600',
    xpReward: '+60 XP',
    time: '1 min',
  },
  {
    id: 'vocab-snake',
    title: 'Vocab Snake',
    japaneseTitle: '蛇ゲーム',
    category: 'arcade',
    desc: 'Classic retro snake game. Steer the snake to swallow correct kanji fruits while avoiding traps!',
    icon: Gamepad2,
    href: '/game-zone/vocab-snake',
    tag: 'Arcade Fun',
    gradient: 'from-emerald-500 to-teal-600',
    xpReward: '+75 XP',
    time: '3 min',
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    japaneseTitle: '文法パズル',
    category: 'grammar',
    desc: 'Assemble scrambled words and particles (は, が, を, に, で) into grammatically accurate sentences.',
    icon: BookOpen,
    href: '/game-zone/sentence-builder',
    tag: 'Grammar',
    gradient: 'from-blue-500 to-indigo-600',
    xpReward: '+70 XP',
    time: '3 min',
  },
  {
    id: 'listen-catch',
    title: 'Listen & Catch',
    japaneseTitle: 'リスニング',
    category: 'audio',
    desc: 'Listen to native Japanese audio clips and catch the matching word or illustration on screen.',
    icon: Headphones,
    href: '/game-zone/listen-catch',
    tag: 'Listening',
    gradient: 'from-violet-500 to-purple-600',
    xpReward: '+80 XP',
    time: '2 min',
  },
  {
    id: 'kanji-hunter',
    title: 'Kanji Hunter',
    japaneseTitle: '漢字ハンター',
    category: 'reflex',
    desc: 'Sharpen your radical recognition. Hunt target kanji disguised among tricky lookalikes.',
    icon: Crosshair,
    href: '/game-zone/kanji-hunter',
    tag: 'Kanji Drill',
    gradient: 'from-pink-500 to-rose-600',
    xpReward: '+65 XP',
    time: '2 min',
  },
  {
    id: 'situation-quest',
    title: 'Situation Quest',
    japaneseTitle: '場面クエスト',
    category: 'rpg',
    desc: 'Roleplay workplace & daily life dialogues (ordering food, nursing care, factory safety) like an RPG.',
    icon: Compass,
    href: '/game-zone/situation-quest',
    tag: 'Story RPG',
    gradient: 'from-cyan-500 to-blue-600',
    xpReward: '+100 XP',
    time: '5 min',
  },
  {
    id: 'three-lives',
    title: '3 Lives Challenge',
    japaneseTitle: 'サバイバル',
    category: 'survival',
    desc: 'Endless survival mode across all Japanese vocabulary levels. 3 lives, no timer limits!',
    icon: Heart,
    href: '/game-zone/three-lives',
    tag: 'Endless',
    gradient: 'from-red-600 to-rose-700',
    xpReward: '+120 XP',
    time: 'Endless',
  },
];

const FILTER_TAGS = [
  { id: 'all', label: 'All Games', icon: '🎮' },
  { id: 'featured', label: 'Hot & Featured', icon: '🔥' },
  { id: 'speed', label: 'Speed Blitz', icon: '⚡' },
  { id: 'arcade', label: 'Arcade Classic', icon: '🕹️' },
  { id: 'grammar', label: 'Grammar', icon: '📚' },
  { id: 'audio', label: 'Audio Drills', icon: '🎧' },
  { id: 'rpg', label: 'Dialogue RPG', icon: '🧭' },
  { id: 'survival', label: 'Survival', icon: '❤️' },
];

export default function GameZoneHomePage() {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(getInitialGameProgress());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const update = () => setProgress(getInitialGameProgress());
    window.addEventListener('game_progress_updated', update);
    return () => window.removeEventListener('game_progress_updated', update);
  }, []);

  const filteredGames = useMemo(() => {
    if (activeFilter === 'all') return ARCADE_GAMES;
    return ARCADE_GAMES.filter((g) => g.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Hero Feature Banner for Word Match (Mobile Responsive) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="relative h-52 sm:h-72 md:h-80 w-full">
          <Image
            src="/img/game_banner.jpg"
            alt="Japanese Learning Game Zone"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>

          <div className="absolute inset-0 p-4 sm:p-7 md:p-9 flex flex-col justify-end text-white">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-japan-red text-white text-[10px] sm:text-xs font-black tracking-wider uppercase">
                Arcade Zone
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 fill-orange-400" />
                <span>{progress.streak > 0 ? `${progress.streak} Day Streak` : 'Start Streak'}</span>
              </span>
              {!isAuthenticated && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black shadow-xs">
                  Guest Mode
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md leading-tight">
              Learn Japanese Through Play
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-200 mt-0.5 sm:mt-1 max-w-xl line-clamp-2 sm:line-clamp-none">
              Master high-frequency JFT-Basic &amp; SSW vocabulary, kanji, and grammar through interactive arcade mini-games.
            </p>

            <div className="mt-3 sm:mt-5 flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link
                href="/game-zone/word-match"
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-500/30 flex items-center gap-1.5 sm:gap-2 hover:scale-102 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                <span>Play Word Match</span>
              </Link>
              <div suppressHydrationWarning className="text-[11px] sm:text-xs font-bold text-slate-300 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {progress.xp > 0
                    ? `Level ${progress.level} • ${progress.xp} XP`
                    : 'Level 1 (0 XP)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Leaderboard & Rankings Podium Strip (Cyber Arcade Style) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0c1328] via-[#090e1c] to-[#0c1328] border border-cyan-500/30 p-3 sm:p-5 flex items-center justify-between gap-3 flex-wrap shadow-xl">
        <div className="absolute top-0 right-1/4 w-40 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-amber-500/30 shrink-0 font-black">
            🏆
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1.5 truncate">
              <span className="bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
                Hall of Champions &amp; Top 3
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 shrink-0">
                Live League
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs font-bold text-slate-300 mt-0.5 truncate">
              Compete with top candidates, earn XP, maintain daily streaks, and take the crown!
            </p>
          </div>
        </div>

        <Link
          href="/game-zone/ranks"
          className="relative px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer hover:scale-103"
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
          <span>View Champions Podium</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
        </Link>
      </div>

      {/* 3. Game Arcade Section Header with Grid/List Toggle & Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              All Arcade Mini-Games
            </h2>
            <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Select any game mode to begin practice drills
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Grid (2-col mobile) vs List */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-japan-red shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View (Recommended for Mobile)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-japan-red shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px]">List</span>
              </button>
            </div>

            <span className="text-xs font-black text-japan-red bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/80 dark:border-rose-900/40 shrink-0">
              {filteredGames.length} Games
            </span>
          </div>
        </div>

        {/* Mobile-friendly Horizontal Filter Chips Bar */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 pb-2 mb-2 -mx-1 px-1">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveFilter(tag.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === tag.id
                  ? 'bg-japan-red text-white shadow-xs'
                  : 'bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* 4. GAMES VIEWPORT: Responsive Grid or List */}
        {viewMode === 'grid' ? (
          /* GRID VIEW: 2 columns on mobile, 3 on tablet, 4 on desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.id}
                  href={game.href}
                  className="group bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 shadow-xs hover:shadow-md hover:border-japan-red/40 dark:hover:border-rose-900/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Icon & Tag */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${game.gradient} text-white flex items-center justify-center shadow-md shadow-red-500/10 group-hover:scale-105 transition-transform shrink-0`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[85px] sm:max-w-none text-right">
                        {game.tag}
                      </span>
                    </div>

                    {/* Titles */}
                    <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red transition-colors leading-snug">
                      <span className="block truncate">{game.title}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 block mt-0.5">
                        {game.japaneseTitle}
                      </span>
                    </h3>

                    {/* Description: 2 lines max */}
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5 leading-relaxed line-clamp-2">
                      {game.desc}
                    </p>
                  </div>

                  {/* Card Footer: XP Reward & Play CTA */}
                  <div className="flex items-center justify-between pt-2.5 sm:pt-4 mt-2 sm:mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] sm:text-xs font-black">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                      <span>{game.xpReward}</span>
                    </span>
                    <span className="text-japan-red flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Play</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW: Horizontal Cards across screen */
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.id}
                  href={game.href}
                  className="group bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-md hover:border-japan-red/40 dark:hover:border-rose-900/60 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${game.gradient} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red transition-colors truncate">
                          {game.title}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 hidden xs:inline">
                          {game.japaneseTitle}
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {game.tag}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xl">
                        {game.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 hidden sm:flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      <span>{game.xpReward}</span>
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-japan-red font-black text-xs flex items-center gap-1 group-hover:bg-japan-red group-hover:text-white transition-colors">
                      <span>Play</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
