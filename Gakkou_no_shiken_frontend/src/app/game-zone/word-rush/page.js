'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Zap,
  Timer,
  Flame,
  Volume2,
  RotateCw,
  Trophy,
  ArrowRight,
  Sparkles,
  Award,
  LogIn,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Keyboard,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY, CATEGORIES } from '../gameVocabData';

const RUSH_TIME_LIMIT = 60; // 60 seconds

export default function WordRushPage() {
  const { user, isAuthenticated } = useAuth();

  // Game States
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState(RUSH_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);

  // Current Question
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  // Summary / Rewards
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const timerRef = useRef(null);

  // Filter vocabulary pool
  const vocabPool = React.useMemo(() => {
    if (selectedCategory === 'all') return GAME_VOCABULARY;
    if (selectedCategory === 'jft' || selectedCategory === 'n5') {
      return GAME_VOCABULARY.filter((w) => w.level === selectedCategory);
    }
    return GAME_VOCABULARY.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  // Generate next question
  const nextQuestion = useCallback(() => {
    if (vocabPool.length < 4) return;
    const pool = [...vocabPool];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const target = pool[randomIndex];

    // Pick 3 decoys
    const decoys = pool
      .filter((w) => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const shuffledOptions = [target, ...decoys].sort(() => 0.5 - Math.random());

    setCurrentWord(target);
    setOptions(shuffledOptions);
    setSelectedOptionId(null);
    setFeedback(null);

    // Speak native pronunciation
    if (target?.kanji) {
      playSound.speakJapanese(target.kanji);
    }
  }, [vocabPool]);

  // Start Game
  const startGame = useCallback(() => {
    setGameState('playing');
    setTimeLeft(RUSH_TIME_LIMIT);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setEarnedXP(0);
    setShowGuestModal(false);
    nextQuestion();
  }, [nextQuestion]);

  // Timer Tick
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

  // End Game handler when time runs out
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      setGameState('gameover');
      playSound.gameWon();

      // Calculate XP
      const baseXP = Math.floor(score / 20) + correctCount * 3;
      const finalXP = Math.max(15, baseXP);
      setEarnedXP(finalXP);

      // Save to store
      addGameReward({
        xpGain: finalXP,
        wordsMastered: Math.min(correctCount, 8),
      });

      // Show Guest prompt if not authenticated
      if (!isAuthenticated) {
        setTimeout(() => setShowGuestModal(true), 800);
      }

      // Fire confetti if high score
      if (score >= 300) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  }, [gameState, timeLeft, score, correctCount, isAuthenticated]);

  // Answer handler
  const handleAnswer = useCallback(
    (option) => {
      if (gameState !== 'playing' || feedback !== null) return;

      setSelectedOptionId(option.id);

      if (option.id === currentWord.id) {
        // Correct!
        playSound.cardMatch();
        setFeedback('correct');

        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo((prev) => Math.max(prev, newCombo));
        setCorrectCount((prev) => prev + 1);

        // Multiplier: 1x, 1.5x, 2x, 3x (Fever)
        let multiplier = 1;
        if (newCombo >= 10) multiplier = 3;
        else if (newCombo >= 5) multiplier = 2;
        else if (newCombo >= 3) multiplier = 1.5;

        // Points + Time Bonus for combo
        const pointsGained = Math.round(100 * multiplier);
        setScore((prev) => prev + pointsGained);

        // Add 1.5s time bonus on high streak
        if (newCombo % 5 === 0) {
          setTimeLeft((prev) => Math.min(RUSH_TIME_LIMIT, prev + 2));
        }

        setTimeout(() => {
          nextQuestion();
        }, 400);
      } else {
        // Wrong!
        playSound.cardMismatch();
        setFeedback('wrong');
        setCombo(0);
        setWrongCount((prev) => prev + 1);

        setTimeout(() => {
          nextQuestion();
        }, 650);
      }
    },
    [gameState, feedback, currentWord, combo, nextQuestion]
  );

  // Keyboard shortcut listeners (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (options[index]) {
          handleAnswer(options[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, options, handleAnswer]);

  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const isFever = combo >= 5;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300 ${
              isFever
                ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 animate-pulse shadow-amber-500/30'
                : 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-orange-500/20'
            }`}
          >
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Word Rush
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Speed Blitz
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              60-Second rapid fire vocabulary drill. Test your instant recall!
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

      {/* 2. GAME VIEWPORT */}
      {gameState === 'ready' && (
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#0c1222] dark:to-[#070b14] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center gap-6 min-h-[460px]">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-bounce">
              <Zap className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-black border border-amber-400/40 flex items-center gap-1 shadow-md">
              <Timer className="w-3.5 h-3.5" /> 60s
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Ready for the Rush?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              A Japanese word appears. Quickly pick the right translation. Build consecutive combos to trigger{' '}
              <span className="text-amber-500 font-extrabold">FEVER MODE 3x</span> and rack up massive XP!
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
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-base mb-0.5">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={startGame}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-lg shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-5 h-5" />
            <span>START 60s BLITZ</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" /> Desktop keys: 1, 2, 3, 4
            </span>
            <span>•</span>
            <span>Mobile: Instant Tap</span>
          </div>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Active Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            {/* Timer */}
            <div
              className={`rounded-2xl p-3 border flex items-center gap-3 transition-colors ${
                timeLeft <= 10
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-600 animate-pulse'
                  : 'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  timeLeft <= 10 ? 'bg-red-500 text-white' : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Time Left
                </p>
                <p className="text-xl font-black">{timeLeft}s</p>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Score
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
            </div>

            {/* Combo Meter */}
            <div
              className={`rounded-2xl p-3 border flex items-center gap-3 transition-all ${
                combo >= 5
                  ? 'bg-gradient-to-r from-amber-500/15 to-red-500/15 border-amber-500/40 shadow-xs'
                  : 'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  combo >= 5
                    ? 'bg-gradient-to-tr from-amber-500 to-red-500 text-white animate-bounce'
                    : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Streak
                </p>
                <p
                  className={`text-xl font-black ${
                    combo >= 5 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {combo}x {combo >= 10 ? '⚡FEVER!' : combo >= 5 ? '🔥HOT' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 10
                  ? 'bg-red-500'
                  : timeLeft <= 25
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${(timeLeft / RUSH_TIME_LIMIT) * 100}%` }}
            />
          </div>

          {/* Active Question Box */}
          <div
            className={`relative bg-white dark:bg-[#0c1222] border rounded-3xl p-6 sm:p-10 shadow-md text-center flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${
              feedback === 'correct'
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-emerald-500/10'
                : feedback === 'wrong'
                ? 'border-rose-500/80 bg-rose-50/20 dark:bg-rose-950/20 shadow-rose-500/10'
                : isFever
                ? 'border-amber-400/80 shadow-amber-500/20'
                : 'border-slate-200/90 dark:border-slate-800/90'
            }`}
          >
            {/* Sound Icon Button */}
            <button
              onClick={() => playSound.speakJapanese(currentWord?.kanji)}
              className="absolute top-4 right-4 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-japan-red hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-xs"
              title="Pronounce again"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Furigana */}
            {showFurigana && currentWord?.kana !== currentWord?.kanji && (
              <span className="text-sm sm:text-base font-extrabold text-japan-red mb-1 tracking-wider animate-fadeIn">
                {currentWord?.kana}
              </span>
            )}

            {/* Kanji Display */}
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-wider my-1 drop-shadow-xs">
              {currentWord?.kanji}
            </h2>

            {/* Romaji */}
            <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">
              {currentWord?.romaji}
            </p>

            {/* Quick feedback indicator */}
            {feedback && (
              <div className="absolute inset-0 rounded-3xl flex items-center justify-center backdrop-blur-xs bg-white/40 dark:bg-slate-950/40 pointer-events-none animate-fadeIn">
                {feedback === 'correct' ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-lg">
                    <CheckCircle2 className="w-6 h-6" /> CORRECT!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-lg shadow-lg">
                    <XCircle className="w-6 h-6" /> MISSED
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4 Multi-Choice Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              let btnStyle =
                'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 hover:scale-[1.01]';

              if (feedback && option.id === currentWord.id) {
                btnStyle =
                  'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20';
              } else if (feedback === 'wrong' && isSelected) {
                btnStyle = 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  className={`group relative p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-xs font-black transition-colors">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-base font-extrabold tracking-tight leading-snug">
                        {option.en}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold group-hover:text-slate-200 transition-colors">
                        {option.bn}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME OVER SUMMARY */}
      {gameState === 'gameover' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Time&apos;s Up! Round Finished
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              Fantastic speed training session. Here are your stats:
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Final Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Accuracy</p>
              <p className="text-2xl font-black text-emerald-500">{accuracy}%</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Max Combo</p>
              <p className="text-2xl font-black text-rose-500">{maxCombo}x</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP Awarded</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          {/* Play Again Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
            <Link
              href="/game-zone/ranks"
              className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>VIEW LEADERBOARD</span>
            </Link>
          </div>
        </div>
      )}

      {/* Guest Rank-Up Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1222] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You just earned{' '}
              <span className="font-extrabold text-amber-500">+{earnedXP} XP</span> and a{' '}
              <span className="font-extrabold text-rose-500">{maxCombo}x combo</span>! Login to save your record on the national leaderboard and climb to Top 3.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/word-rush"
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
