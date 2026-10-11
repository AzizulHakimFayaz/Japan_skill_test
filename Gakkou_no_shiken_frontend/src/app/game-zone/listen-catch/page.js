'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Headphones,
  Volume2,
  Sparkles,
  Trophy,
  RotateCw,
  Flame,
  Timer,
  CheckCircle2,
  XCircle,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY } from '../gameVocabData';

const TOTAL_ROUNDS = 10;
const TIME_PER_QUESTION = 8; // 8 seconds per listening drill

export default function ListenCatchPage() {
  const { user, isAuthenticated } = useAuth();

  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover' | 'won'
  const [currentRound, setCurrentRound] = useState(1);
  const [targetWord, setTargetWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [selectedId, setSelectedId] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const timerRef = useRef(null);

  // Pick question
  const nextQuestion = useCallback(() => {
    if (GAME_VOCABULARY.length < 4) return;
    const pool = [...GAME_VOCABULARY];

    const target = pool[Math.floor(Math.random() * pool.length)];
    const decoys = pool
      .filter((w) => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const shuffled = [target, ...decoys].sort(() => 0.5 - Math.random());

    setTargetWord(target);
    setOptions(shuffled);
    setSelectedId(null);
    setFeedback(null);
    setTimeLeft(TIME_PER_QUESTION);

    // Auto-play audio pronunciation after short delay
    setTimeout(() => {
      playSound.speakJapanese(target.kana || target.kanji);
    }, 250);
  }, []);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setCurrentRound(1);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setEarnedXP(0);
    setShowGuestModal(false);
    nextQuestion();
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
    setCombo(0);

    setTimeout(() => {
      if (currentRound >= TOTAL_ROUNDS) {
        endGame();
      } else {
        setCurrentRound((r) => r + 1);
        nextQuestion();
      }
    }, 900);
  };

  // Answer selection
  const handleSelect = (option) => {
    if (feedback !== null) return;
    setSelectedId(option.id);

    if (option.id === targetWord.id) {
      // Correct!
      playSound.cardMatch();
      setFeedback('correct');

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setScore((s) => s + 100 * (newCombo >= 3 ? 1.5 : 1));

      setTimeout(() => {
        if (currentRound >= TOTAL_ROUNDS) {
          endGame();
        } else {
          setCurrentRound((r) => r + 1);
          nextQuestion();
        }
      }, 700);
    } else {
      // Wrong!
      playSound.cardMismatch();
      setFeedback('wrong');
      setCombo(0);

      setTimeout(() => {
        if (currentRound >= TOTAL_ROUNDS) {
          endGame();
        } else {
          setCurrentRound((r) => r + 1);
          nextQuestion();
        }
      }, 900);
    }
  };

  const endGame = () => {
    setGameState('won');
    playSound.gameWon();

    const xp = Math.max(20, Math.floor(score / 15));
    setEarnedXP(xp);

    addGameReward({
      xpGain: xp,
      wordsMastered: Math.min(8, Math.floor(score / 100)),
    });

    if (!isAuthenticated) {
      setTimeout(() => setShowGuestModal(true), 800);
    }

    if (score >= 600) {
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Listen &amp; Catch
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Listening Drill
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Listen to native Japanese audio and tap the matching word before time runs out!
            </p>
          </div>
        </div>

        <Link
          href="/game-zone"
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
        >
          Hub
        </Link>
      </div>

      {/* 2. Ready State */}
      {gameState === 'ready' && (
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#0c1222] dark:to-[#070b14] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center gap-6 min-h-[440px]">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
            <Volume2 className="w-12 h-12" />
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Train Your Japanese Ears
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              A Japanese native voice speaks. Catch the matching meaning or Kanji within 8 seconds!
              Sharpens listening comprehension for JFT-Basic &amp; SSW exams.
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-black text-lg shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Headphones className="w-5 h-5" />
            <span>START LISTENING DRILL</span>
          </button>
        </div>
      )}

      {/* 3. Playing State */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Time</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{timeLeft}s</p>
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

            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Streak</p>
                <p className="text-xl font-black text-rose-500">{combo}x</p>
              </div>
            </div>
          </div>

          {/* Central Audio Play Pulse Button */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 sm:p-12 shadow-md flex flex-col items-center justify-center text-center gap-4">
            <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
              Round {currentRound} of {TOTAL_ROUNDS}
            </span>

            <button
              onClick={() => playSound.speakJapanese(targetWord?.kana || targetWord?.kanji)}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-violet-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-25" />
              <Volume2 className="w-12 h-12 drop-shadow-md group-hover:scale-110 transition-transform" />
            </button>

            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Tap speaker to repeat audio pronunciation
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => {
              const isSelected = selectedId === opt.id;
              let style =
                'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 hover:border-purple-400 dark:hover:border-purple-500 text-slate-900 dark:text-white';

              if (feedback && opt.id === targetWord.id) {
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
                    <span className="text-xl sm:text-2xl font-black block tracking-wider mb-0.5">
                      {opt.kanji}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {opt.en} • {opt.bn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Won / Summary State */}
      {gameState === 'won' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Listening Drill Complete!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              Outstanding ear training! Here is your performance summary:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Max Streak</p>
              <p className="text-2xl font-black text-rose-500">{maxCombo}x</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>LISTEN AGAIN</span>
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
          <div className="bg-white dark:bg-[#0c1222] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Audio Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You scored <span className="font-extrabold text-purple-500">+{earnedXP} XP</span>! Log in
              to save your record and take your place among the Top 3 candidates on the podium.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/listen-catch"
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
