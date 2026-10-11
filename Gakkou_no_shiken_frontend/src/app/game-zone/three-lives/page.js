'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Heart,
  Trophy,
  RotateCw,
  Flame,
  Volume2,
  Sparkles,
  Zap,
  LogIn,
  CheckCircle2,
  XCircle,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY } from '../gameVocabData';

export default function ThreeLivesPage() {
  const { user, isAuthenticated } = useAuth();

  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const timerRef = useRef(null);

  // Time allowed per wave (speeds up in higher waves)
  const getTimeForWave = (w) => Math.max(5, 11 - Math.floor(w / 4));

  // Next Question
  const nextWave = useCallback((currentW = wave) => {
    if (GAME_VOCABULARY.length < 4) return;
    const pool = [...GAME_VOCABULARY];

    const target = pool[Math.floor(Math.random() * pool.length)];
    const decoys = pool
      .filter((w) => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const shuffled = [target, ...decoys].sort(() => 0.5 - Math.random());

    setCurrentWord(target);
    setOptions(shuffled);
    setSelectedId(null);
    setFeedback(null);
    setTimeLeft(getTimeForWave(currentW));

    if (target?.kanji) {
      playSound.speakJapanese(target.kanji);
    }
  }, [wave]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setWave(1);
    setLives(3);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setEarnedXP(0);
    setShowGuestModal(false);
    nextWave(1);
  };

  // Timer Tick
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, feedback]);

  const handleTimeOut = () => {
    playSound.cardMismatch();
    setFeedback('wrong');
    setStreak(0);

    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        handleGameOver();
        return 0;
      }
      setTimeout(() => {
        setWave((w) => w + 1);
        nextWave(wave + 1);
      }, 700);
      return next;
    });
  };

  const handleSelect = (option) => {
    if (feedback !== null) return;
    setSelectedId(option.id);

    if (option.id === currentWord.id) {
      // Correct!
      playSound.cardMatch();
      setFeedback('correct');

      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));

      const points = 100 + wave * 10 + (newStreak >= 5 ? 100 : 0);
      setScore((s) => s + points);

      setTimeout(() => {
        setWave((w) => w + 1);
        nextWave(wave + 1);
      }, 500);
    } else {
      // Wrong!
      playSound.cardMismatch();
      setFeedback('wrong');
      setStreak(0);

      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          handleGameOver();
          return 0;
        }
        setTimeout(() => {
          setWave((w) => w + 1);
          nextWave(wave + 1);
        }, 700);
        return next;
      });
    }
  };

  const handleGameOver = () => {
    setGameState('gameover');
    playSound.gameWon();

    const xp = Math.max(20, Math.floor(score / 20) + wave * 4);
    setEarnedXP(xp);

    addGameReward({
      xpGain: xp,
      wordsMastered: Math.min(15, Math.floor(wave / 2)),
    });

    if (!isAuthenticated) {
      setTimeout(() => setShowGuestModal(true), 800);
    }

    if (score >= 800) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                3 Lives Challenge
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                Endless Survival
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              3 Hearts. Endless vocabulary waves. Survive as long as you can!
            </p>
          </div>
        </div>

        {/* Hearts HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`text-base ${i < lives ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}`}
              >
                ❤️
              </span>
            ))}
          </div>

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
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#0c1222] dark:to-[#070b14] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center gap-6 min-h-[440px]">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-pink-600 text-white flex items-center justify-center shadow-2xl shadow-red-500/30 animate-pulse">
            <Heart className="w-12 h-12 fill-white" />
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Endless Japanese Survival
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Start with 3 Hearts. Waves never stop and speed increases as you survive. How many
              vocabulary waves can you clear?
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black text-lg shadow-xl shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>START SURVIVAL</span>
          </button>
        </div>
      )}

      {/* 3. Playing View */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black">
                W{wave}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Wave</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">Wave {wave}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-3 border flex items-center gap-3 ${
                timeLeft <= 3
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-600 animate-pulse'
                  : 'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Timer</p>
                <p className="text-xl font-black">{timeLeft}s</p>
              </div>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center relative">
            <button
              onClick={() => playSound.speakJapanese(currentWord?.kanji)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-japan-red"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <span className="text-sm font-bold text-japan-red mb-1">
              {currentWord?.kana}
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-wider my-2">
              {currentWord?.kanji}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              {currentWord?.romaji}
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => {
              const isSelected = selectedId === opt.id;
              let style =
                'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 hover:border-red-400 text-slate-900 dark:text-white';

              if (feedback && opt.id === currentWord.id) {
                style = 'bg-emerald-500 text-white border-emerald-500 shadow-md';
              } else if (feedback === 'wrong' && isSelected) {
                style = 'bg-rose-500 text-white border-rose-500 shadow-md';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  disabled={feedback !== null}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${style}`}
                >
                  <div>
                    <span className="text-base font-black block leading-snug">{opt.en}</span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {opt.bn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Game Over View */}
      {gameState === 'gameover' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-4xl shadow-md">
            💔
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Survival Ended on Wave {wave}!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              Incredible endurance run! You pushed your Japanese vocabulary to the limit.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Max Streak</p>
              <p className="text-2xl font-black text-rose-500">{maxStreak}x</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
            <Link
              href="/game-zone/ranks"
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center gap-2 text-center"
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
          <div className="bg-white dark:bg-[#0c1222] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your Wave {wave} Record!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You scored <span className="font-extrabold text-red-500">+{earnedXP} XP</span>! Log in
              to save your record and stand tall in the national Top 3 ranking.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/three-lives"
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
