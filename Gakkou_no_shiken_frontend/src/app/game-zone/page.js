'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { getInitialGameProgress } from '@/lib/gameStore';

const ARCADE_GAMES = [
  {
    id: 'word-match',
    title: 'Word Match',
    japaneseTitle: '単語マッチ',
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
    desc: 'Rapid-fire speed drill. How many words can you translate in 60 frantic seconds?',
    icon: Zap,
    href: '/game-zone/word-match?mode=rush',
    tag: 'Speed Test',
    gradient: 'from-amber-500 to-orange-600',
    xpReward: '+60 XP',
    time: '1 min',
  },
  {
    id: 'vocab-snake',
    title: 'Vocab Snake',
    japaneseTitle: '蛇ゲーム',
    desc: 'Classic retro snake game. Steer the snake to swallow correct kanji fruits while avoiding traps!',
    icon: Gamepad2,
    href: '/game-zone/word-match?mode=snake',
    tag: 'Arcade Fun',
    gradient: 'from-emerald-500 to-teal-600',
    xpReward: '+75 XP',
    time: '3 min',
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    japaneseTitle: '文法パズル',
    desc: 'Assemble scrambled words and particles (は, が, を, に, で) into grammatically accurate sentences.',
    icon: BookOpen,
    href: '/game-zone/word-match?mode=sentence',
    tag: 'Grammar',
    gradient: 'from-blue-500 to-indigo-600',
    xpReward: '+70 XP',
    time: '3 min',
  },
  {
    id: 'listen-catch',
    title: 'Listen & Catch',
    japaneseTitle: 'リスニングキャッチ',
    desc: 'Listen to native Japanese audio clips and catch the matching word or illustration on screen.',
    icon: Headphones,
    href: '/game-zone/word-match?mode=listen',
    tag: 'Listening',
    gradient: 'from-violet-500 to-purple-600',
    xpReward: '+80 XP',
    time: '2 min',
  },
  {
    id: 'kanji-hunter',
    title: 'Kanji Hunter',
    japaneseTitle: '漢字ハンター',
    desc: 'Sharpen your radical recognition. Hunt target kanji disguised among tricky lookalikes.',
    icon: Crosshair,
    href: '/game-zone/word-match?mode=kanji',
    tag: 'Kanji Drill',
    gradient: 'from-pink-500 to-rose-600',
    xpReward: '+65 XP',
    time: '2 min',
  },
  {
    id: 'situation-quest',
    title: 'Situation Quest',
    japaneseTitle: '場面クエスト',
    desc: 'Roleplay workplace & daily life dialogues (ordering food, nursing care, factory safety) like an RPG.',
    icon: Compass,
    href: '/game-zone/word-match?mode=quest',
    tag: 'Story RPG',
    gradient: 'from-cyan-500 to-blue-600',
    xpReward: '+100 XP',
    time: '5 min',
  },
  {
    id: 'three-lives',
    title: '3 Lives Challenge',
    japaneseTitle: 'サバイバル',
    desc: 'Endless survival mode across all Japanese vocabulary levels. 3 lives, no timer limits!',
    icon: Heart,
    href: '/game-zone/word-match?mode=survival',
    tag: 'Endless',
    gradient: 'from-red-600 to-rose-700',
    xpReward: '+120 XP',
    time: 'Endless',
  },
];

export default function GameZoneHomePage() {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(getInitialGameProgress());

  useEffect(() => {
    const update = () => setProgress(getInitialGameProgress());
    window.addEventListener('game_progress_updated', update);
    return () => window.removeEventListener('game_progress_updated', update);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Hero Feature Banner for Word Match */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="relative h-64 sm:h-80 w-full">
          <Image
            src="/img/game_banner.jpg"
            alt="Japanese Learning Game Zone"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>

          <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-japan-red text-white text-xs font-black tracking-wider uppercase">
                Arcade Zone
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{progress.streak > 0 ? `${progress.streak} Day Streak` : 'Start Your Streak'}</span>
              </span>
              {!isAuthenticated && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                  Guest Mode
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Learn Japanese Through Play
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-200 mt-1 max-w-xl">
              Master high-frequency JFT-Basic &amp; SSW vocabulary, kanji, and grammar through interactive arcade mini-games.
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <Link
                href="/game-zone/word-match"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-red-500/30 flex items-center gap-2 hover:scale-102 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Word Match Now</span>
              </Link>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <Trophy className="w-4 h-4 text-amber-400" />
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

      {/* 2. Leaderboard & Rankings Podium Strip */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/30 dark:to-amber-950/30 border border-amber-300/40 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20 shrink-0">
            🏆
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>National Leaderboard &amp; Top 3</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                Live Podium
              </span>
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Play games, earn XP, maintain your streak and challenge top Japanese learners worldwide!
            </p>
          </div>
        </div>

        <Link
          href="/game-zone/ranks"
          className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#11182c] border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-900 dark:text-white text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>View Rankings &amp; Top 3</span>
          <ArrowRight className="w-4 h-4 text-japan-red" />
        </Link>
      </div>

      {/* 3. Game Arcade Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              All Arcade Mini-Games
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Select any game mode to begin practice drills
            </p>
          </div>
          <span className="text-xs font-black text-japan-red bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/80 dark:border-rose-900/40">
            {ARCADE_GAMES.length} Games
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ARCADE_GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                href={game.href}
                className="group bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-japan-red/40 dark:hover:border-rose-900/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Icon & Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${game.gradient} text-white flex items-center justify-center shadow-md shadow-red-500/10 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {game.tag}
                    </span>
                  </div>

                  {/* Titles */}
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red transition-colors flex items-center justify-between">
                    <span>{game.title}</span>
                    <span className="text-xs font-bold text-slate-400">{game.japaneseTitle}</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {game.desc}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-black">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                    <span>{game.xpReward}</span>
                  </span>
                  <span className="text-japan-red flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Play</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
