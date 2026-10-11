'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Crosshair,
  Volume2,
  Trophy,
  RotateCw,
  Heart,
  Timer,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  LogIn,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY, CATEGORIES } from '../gameVocabData';

const GAME_DURATION = 45; // 45 seconds rapid target drill

export default function KanjiHunterPage() {
  const { user, isAuthenticated } = useAuth();

  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Targets on screen (6 floating/positioned targets)
  const [currentTarget, setCurrentTarget] = useState(null);
  const [targets, setTargets] = useState([]);
  const [poppedId, setPoppedId] = useState(null);

  const timerRef = useRef(null);

  // Filter vocabulary pool
  const vocabPool = React.useMemo(() => {
    if (selectedCategory === 'all') return GAME_VOCABULARY;
    if (selectedCategory === 'jft' || selectedCategory === 'n5') {
      return GAME_VOCABULARY.filter((w) => w.level === selectedCategory);
    }
    return GAME_VOCABULARY.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  // Spawn targets
  const spawnTargets = useCallback(() => {
    if (vocabPool.length < 6) return;
    const pool = [...vocabPool];

    // Pick 1 target
    const target = pool[Math.floor(Math.random() * pool.length)];
    setCurrentTarget(target);

    // Pick 5 decoys
    const decoys = pool
      .filter((w) => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const roundItems = [target, ...decoys].sort(() => 0.5 - Math.random());
    setTargets(roundItems);
    setPoppedId(null);

    // Audio cue
    if (target?.kanji) {
      playSound.speakJapanese(target.kanji);
    }
  }, [vocabPool]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setEarnedXP(0);
    setShowGuestModal(false);
    spawnTargets();
  }, [spawnTargets]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Game over check
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      setGameState('gameover');
      playSound.gameWon();

      const calculatedXP = Math.max(15, hits * 4 + Math.floor(score / 30));
      setEarnedXP(calculatedXP);

      addGameReward({
        xpGain: calculatedXP,
        wordsMastered: Math.min(hits, 8),
      });

      if (!isAuthenticated) {
        setTimeout(() => setShowGuestModal(true), 800);
      }

      if (score >= 400) {
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  }, [gameState, timeLeft, hits, score, isAuthenticated]);

  // Click target
  const handleTargetClick = (item) => {
    if (gameState !== 'playing' || poppedId !== null) return;

    if (item.id === currentTarget.id) {
      // Hit!
      playSound.cardMatch();
      setPoppedId(item.id);

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setHits((h) => h + 1);

      let mult = 1;
      if (newCombo >= 8) mult = 2.5;
      else if (newCombo >= 4) mult = 1.5;

      setScore((s) => s + Math.round(120 * mult));

      setTimeout(() => {
        spawnTargets();
      }, 350);
    } else {
      // Miss!
      playSound.cardMismatch();
      setCombo(0);
      setMisses((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kanji Hunter
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                Reflex Drill
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Hunt and pop the target kanji before time runs out!
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              showFurigana
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-japan-red'
            }`}
          >
            {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Furigana {showFurigana ? 'ON' : 'OFF'}</span>
          </button>

          <Link
            href="/game-zone"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Hub
          </Link>
        </div>
      </div>

      {/* 2. Ready View */}
      {gameState === 'ready' && (
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#0c1222] dark:to-[#070b14] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center gap-6 min-h-[460px]">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-red-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/30 animate-pulse">
            <Crosshair className="w-12 h-12" />
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Kanji Target Hunter
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Look at the mission target meaning at top. Tap the correct Japanese Kanji target among
              lookalikes to score rapid hits!
            </p>
          </div>

          {/* Category Selector */}
          <div className="w-full max-w-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Vocabulary Set
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-base mb-0.5">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-black text-lg shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crosshair className="w-5 h-5" />
            <span>START HUNT (45s)</span>
          </button>
        </div>
      )}

      {/* 3. Playing View */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Target Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-pink-500/40 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400 text-pink-400 flex items-center justify-center text-xl font-black">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest">
                  HUNT THIS TARGET:
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {currentTarget?.en}
                  </span>
                  <span className="text-sm font-bold text-slate-300">({currentTarget?.bn})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => playSound.speakJapanese(currentTarget?.kanji)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-pink-500/30 text-pink-300 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <Volume2 className="w-4 h-4" />
              <span>Pronounce</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            {/* Timer */}
            <div
              className={`rounded-2xl p-3 border flex items-center gap-3 ${
                timeLeft <= 8
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-600 animate-pulse'
                  : 'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Time</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{timeLeft}s</p>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Streak</p>
                <p className="text-xl font-black text-pink-500">{combo}x</p>
              </div>
            </div>
          </div>

          {/* Target Grid (6 Targets) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {targets.map((item) => {
              const isPopped = poppedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTargetClick(item)}
                  disabled={poppedId !== null}
                  className={`group relative h-32 sm:h-36 rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer shadow-md ${
                    isPopped
                      ? 'scale-105 border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 hover:border-pink-400 dark:hover:border-pink-500 hover:scale-[1.02] active:scale-95 text-slate-800 dark:text-white'
                  }`}
                >
                  {/* Furigana */}
                  {showFurigana && item.kana !== item.kanji && (
                    <span className="text-xs font-bold text-pink-500 dark:text-pink-400 mb-0.5">
                      {item.kana}
                    </span>
                  )}

                  {/* Japanese Kanji */}
                  <span className="text-3xl sm:text-4xl font-black tracking-wider group-hover:scale-105 transition-transform">
                    {item.kanji}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-400 mt-1">
                    {item.romaji}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Game Over View */}
      {gameState === 'gameover' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-red-500 text-white flex items-center justify-center shadow-xl shadow-pink-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Hunt Session Complete!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              You accurately identified {hits} target kanji in 45 seconds!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Hits</p>
              <p className="text-2xl font-black text-emerald-500">{hits}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>HUNT AGAIN</span>
            </button>
            <Link
              href="/game-zone/ranks"
              className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>LEADERBOARD</span>
            </Link>
          </div>
        </div>
      )}

      {/* Guest Rank-Up Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1222] border border-pink-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Hunter Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You scored <span className="font-extrabold text-pink-500">+{earnedXP} XP</span> with a{' '}
              <span className="font-extrabold text-amber-500">{maxCombo}x streak</span>! Log in to save
              your record and appear on the national Top 3 podium.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/login?redirect=/game-zone/kanji-hunter"
                className="w-full py-3 rounded-2xl bg-japan-red hover:bg-red-700 text-white font-extrabold text-sm text-center shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Save Rank</span>
              </Link>
              <button
                onClick={() => setShowGuestModal(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Keep Playing as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
