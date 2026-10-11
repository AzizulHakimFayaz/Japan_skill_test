'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Shuffle,
  Lightbulb,
  CheckCircle2,
  RotateCw,
  Heart,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  ArrowRight,
  Check,
  X,
  HelpCircle,
  Trophy,
  Crown,
  Medal,
  LogIn,
  Star,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY, CATEGORIES } from '../gameVocabData';

const ROUND_SIZE = 6;
const TOTAL_QUESTIONS = 10;
const INITIAL_TIME_SECONDS = 45;

export default function WordMatchPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const [lives, setLives] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showFurigana, setShowFurigana] = useState(true);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRoundWon, setIsRoundWon] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [top3Gamers, setTop3Gamers] = useState([
    { rank: 1, username: 'SakuraSenpai', full_name: 'Sakura Tanaka', country: 'Japan', country_flag: '🇯🇵', xp: 2450, level: 18, streak: 14, mastered: 520 },
    { rank: 2, username: 'FayazNinja', full_name: 'Azizul Hakim', country: 'Bangladesh', country_flag: '🇧🇩', xp: 1850, level: 15, streak: 9, mastered: 460 },
    { rank: 3, username: 'KenjiSpeed', full_name: 'Kenji Sato', country: 'Japan', country_flag: '🇯🇵', xp: 1200, level: 12, streak: 6, mastered: 380 },
  ]);

  // Card selections & matches
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [shakingCard, setShakingCard] = useState(null);
  const [speakingWordId, setSpeakingWordId] = useState(null);

  // Modern Language Platform Game Animations State
  const [countdownStep, setCountdownStep] = useState('ready'); // 'ready' | 'go' | null
  const [floatingScores, setFloatingScores] = useState([]); // [{ id, text, color }]
  const [comboBanner, setComboBanner] = useState(null); // 'NICE!' | 'EXCELLENT!' | 'FEVER!'
  const [displayXpCount, setDisplayXpCount] = useState(0); // Animated counter in victory modal
  const [revealedStars, setRevealedStars] = useState(0); // Animated star slam in victory modal

  // Fetch real top 3 leaderboard from backend API
  useEffect(() => {
    async function fetchTop3() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gakkounoshiken.site';
        const res = await fetch(`${apiUrl}/api/games/leaderboard/`);
        if (res.ok) {
          const data = await res.json();
          if (data?.top_3 && data.top_3.length > 0) {
            setTop3Gamers(data.top_3);
          }
        }
      } catch {
        // Fallback seed top 3 preserved
      }
    }
    fetchTop3();
  }, []);

  // Cards on board
  const [boardItems, setBoardItems] = useState([]);
  const [meaningItems, setMeaningItems] = useState([]);

  // Connecting line coordinates
  const containerRef = useRef(null);
  const [connectionLines, setConnectionLines] = useState([]);

  // Filter vocabulary pool
  const vocabPool = useMemo(() => {
    if (selectedCategory === 'all') return GAME_VOCABULARY;
    if (selectedCategory === 'jft' || selectedCategory === 'n5') {
      return GAME_VOCABULARY.filter((w) => w.level === selectedCategory);
    }
    return GAME_VOCABULARY.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  // Start / Load a round with snappy arcade countdown
  const loadRound = useCallback(() => {
    const shuffled = [...vocabPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, ROUND_SIZE);

    setBoardItems(selected);
    setMeaningItems([...selected].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setSelectedWordId(null);
    setSelectedMeaningId(null);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(INITIAL_TIME_SECONDS);
    setIsGameOver(false);
    setIsRoundWon(false);
    setFloatingScores([]);
    setComboBanner(null);
    setRevealedStars(0);
    setDisplayXpCount(0);

    // Trigger high-energy 1.2s "Ready... GO!" arcade intro
    setCountdownStep('ready');
    playSound.countdown();

    const timer1 = setTimeout(() => {
      setCountdownStep('go');
      playSound.countdownGo();
    }, 600);

    const timer2 = setTimeout(() => {
      setCountdownStep(null);
    }, 1150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [vocabPool]);

  // Initial load
  useEffect(() => {
    loadRound();
  }, [loadRound]);

  // Skip countdown on tap
  const skipCountdown = () => {
    setCountdownStep(null);
    playSound.countdownGo();
  };

  // Update line positions dynamically
  const updateConnectionLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines = [];

    const calculateLine = (wordId, meaningId, status) => {
      const wordEl = document.getElementById(`word-anchor-${wordId}`);
      const meaningEl = document.getElementById(`meaning-anchor-${meaningId}`);
      if (!wordEl || !meaningEl) return null;

      const wRect = wordEl.getBoundingClientRect();
      const mRect = meaningEl.getBoundingClientRect();

      const x1 = wRect.left + wRect.width / 2 - containerRect.left;
      const y1 = wRect.top + wRect.height / 2 - containerRect.top;
      const x2 = mRect.left + mRect.width / 2 - containerRect.left;
      const y2 = mRect.top + mRect.height / 2 - containerRect.top;

      return { wordId, meaningId, x1, y1, x2, y2, status };
    };

    matchedPairs.forEach((id) => {
      const line = calculateLine(id, id, 'matched');
      if (line) lines.push(line);
    });

    if (selectedWordId && selectedMeaningId) {
      const line = calculateLine(selectedWordId, selectedMeaningId, 'active');
      if (line) lines.push(line);
    }

    setConnectionLines(lines);
  }, [matchedPairs, selectedWordId, selectedMeaningId]);

  useEffect(() => {
    updateConnectionLines();
    window.addEventListener('resize', updateConnectionLines);
    return () => window.removeEventListener('resize', updateConnectionLines);
  }, [updateConnectionLines]);

  // Countdown Timer (Paused during intro countdown)
  useEffect(() => {
    if (isGameOver || isRoundWon || countdownStep !== null) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isRoundWon, countdownStep]);

  const handleTimeOut = () => {
    playSound.error();
    setLives((l) => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
      }
      return Math.max(0, newLives);
    });
  };

  // Click on Japanese Word Card
  const handleWordClick = (item) => {
    if (matchedPairs.includes(item.id) || countdownStep !== null) return;
    playSound.click();

    // Trigger visual speaking ripple & audio
    setSpeakingWordId(item.id);
    setTimeout(() => setSpeakingWordId(null), 1200);
    playSound.speakJapanese(item.kana || item.kanji);

    setSelectedWordId(item.id);

    if (selectedMeaningId) {
      evaluateMatch(item.id, selectedMeaningId);
    }
  };

  // Click on Meaning Card
  const handleMeaningClick = (item) => {
    if (matchedPairs.includes(item.id) || countdownStep !== null) return;
    playSound.click();

    setSelectedMeaningId(item.id);

    if (selectedWordId) {
      evaluateMatch(selectedWordId, item.id);
    }
  };

  // Evaluate pair with floating scores & combo multipliers
  const evaluateMatch = (wordId, meaningId) => {
    if (wordId === meaningId) {
      // Correct Match!
      playSound.match();

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      // Calculate Floating XP
      const baseGain = 50;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 10 : 0;
      const totalScoreText = newCombo > 1 ? `+${baseGain + comboBonus} XP 🔥 x${newCombo}` : `+${baseGain} XP ⚡`;

      const scoreId = Date.now() + Math.random();
      const newFloatingScore = {
        id: scoreId,
        text: totalScoreText,
        color: newCombo >= 3 ? 'text-amber-400' : 'text-emerald-500',
      };
      setFloatingScores((prev) => [...prev.slice(-3), newFloatingScore]);
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((s) => s.id !== scoreId));
      }, 1000);

      // Combo Banner Notification
      if (newCombo >= 4) {
        setComboBanner('FEVER MODE! 👑 (完璧!)');
      } else if (newCombo === 3) {
        setComboBanner('EXCELLENT! ⚡ (その調子!)');
      } else if (newCombo === 2) {
        setComboBanner('COMBO x2! 🔥 (すばらしい!)');
      } else {
        setComboBanner('MATCH! ✨');
      }
      setTimeout(() => setComboBanner(null), 1200);

      const updatedMatches = [...matchedPairs, wordId];
      setMatchedPairs(updatedMatches);
      setSelectedWordId(null);
      setSelectedMeaningId(null);

      // Check if round won
      if (updatedMatches.length === boardItems.length) {
        handleRoundWin(newCombo);
      }
    } else {
      // Wrong Match!
      playSound.error();
      setCombo(0);
      setShakingCard(meaningId);
      setTimeout(() => setShakingCard(null), 500);

      setComboBanner('MISS! ❌ -1 Heart');
      setTimeout(() => setComboBanner(null), 1200);

      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
        }
        return Math.max(0, next);
      });
      setSelectedMeaningId(null);
    }
  };

  // Calculate earned stars based on performance
  const earnedStars = useMemo(() => {
    let stars = 1; // 1 star always for completing all pairs
    if (timeLeft >= 15) stars += 1; // Speed Star: finished with >= 15s left
    if (lives === 3) stars += 1; // Flawless Star: 0 errors
    return stars;
  }, [timeLeft, lives]);

  // Round Won with Duolingo-style celebration
  const handleRoundWin = (finalCombo = 0) => {
    setIsRoundWon(true);
    playSound.fanfare();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });

    const xpEarned = 50 + (earnedStars >= 3 ? 20 : earnedStars === 2 ? 10 : 0);
    addGameReward({ xpGain: xpEarned, wordsMastered: boardItems.length });

    // Animate Stars slam down sequentially
    setTimeout(() => {
      setRevealedStars(1);
      playSound.star(0);
    }, 250);

    if (earnedStars >= 2) {
      setTimeout(() => {
        setRevealedStars(2);
        playSound.star(1);
      }, 600);
    }

    if (earnedStars >= 3) {
      setTimeout(() => {
        setRevealedStars(3);
        playSound.star(2);
      }, 950);
    }

    // Animate XP count-up ticker
    let currentXp = 0;
    const interval = setInterval(() => {
      currentXp += 5;
      if (currentXp >= xpEarned) {
        currentXp = xpEarned;
        clearInterval(interval);
      }
      setDisplayXpCount(currentXp);
    }, 40);

    // If guest, show rank-up modal after celebration
    if (!isAuthenticated) {
      setTimeout(() => {
        setShowGuestModal(true);
      }, 2200);
    }
  };

  // Shuffle button
  const handleShuffle = () => {
    playSound.click();
    setMeaningItems((prev) => [...prev].sort(() => 0.5 - Math.random()));
    setSelectedWordId(null);
    setSelectedMeaningId(null);
  };

  // Hint button
  const handleHint = () => {
    if (hintsRemaining <= 0) return;
    const unmatched = boardItems.find((w) => !matchedPairs.includes(w.id));
    if (!unmatched) return;

    playSound.hint();
    setHintsRemaining((h) => h - 1);
    setSelectedWordId(unmatched.id);
    setSelectedMeaningId(unmatched.id);

    setTimeout(() => {
      evaluateMatch(unmatched.id, unmatched.id);
    }, 600);
  };

  // Check Answer Button
  const handleCheckAnswer = () => {
    if (selectedWordId && selectedMeaningId) {
      evaluateMatch(selectedWordId, selectedMeaningId);
    } else if (selectedWordId && !selectedMeaningId) {
      setComboBanner('👉 Tap matching Meaning on the right!');
      setTimeout(() => setComboBanner(null), 2000);
    } else if (!selectedWordId && selectedMeaningId) {
      setComboBanner('👈 Tap matching Japanese word on the left!');
      setTimeout(() => setComboBanner(null), 2000);
    } else {
      setComboBanner('👆 Tap 1 Japanese word and 1 Meaning card!');
      setTimeout(() => setComboBanner(null), 2000);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < TOTAL_QUESTIONS) {
      setQuestionIndex((prev) => prev + 1);
      loadRound();
    } else {
      setQuestionIndex(1);
      loadRound();
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto pb-28 sm:pb-12">
      {/* ── 1. Anime Mascot Header Banner ── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="relative h-44 sm:h-56 md:h-64 w-full">
          <Image
            src="/img/game_banner.jpg"
            alt="Word Match - Japanese Learning Game"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/70 via-sky-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-japan-red/90 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-xs">
                Featured Game
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold backdrop-blur-xs">
                Interactive Pairs
              </span>

              <Link
                href="/game-zone/ranks"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/30 hover:bg-amber-400/40 text-amber-100 border border-amber-300/40 text-[10px] sm:text-xs font-black backdrop-blur-xs transition-all"
              >
                <Trophy className="w-3 h-3 text-amber-300" />
                <span>Top 3: {top3Gamers.slice(0, 3).map((g) => g.username).join(', ')}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-md text-white">
              Word Match
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-bold text-white/95 mt-1 drop-shadow-xs max-w-xl">
              Match Japanese words with the correct meaning! Tap to hear native pronunciation.
            </p>

            {/* Category / Filter Tags */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      loadRound();
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-md scale-105'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Game Arena Card ── */}
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 overflow-hidden"
      >
        {/* ── A. Arcade Countdown Screen Overlay ("READY... GO!") ── */}
        {countdownStep && (
          <div
            onClick={skipCountdown}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 cursor-pointer transition-opacity"
          >
            <div className="flex flex-col items-center text-center animate-combo-bounce">
              <span className="text-xs sm:text-sm font-black text-amber-400 tracking-widest uppercase mb-1">
                ROUND {questionIndex} OF {TOTAL_QUESTIONS}
              </span>

              {countdownStep === 'ready' ? (
                <div className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-2">
                  <span>READY...</span>
                  <span className="text-japan-red">準備!</span>
                </div>
              ) : (
                <div className="text-4xl sm:text-6xl font-black text-amber-300 tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center gap-2 animate-pulse">
                  <span>🔥 START!</span>
                  <span>はじめ!</span>
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-3 font-bold">
                Tap anywhere to start
              </span>
            </div>
          </div>
        )}

        {/* ── B. Floating XP Scores Layer ── */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingScores.map((score) => (
            <div
              key={score.id}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg sm:text-2xl font-black drop-shadow-md ${score.color} animate-float-score`}
            >
              {score.text}
            </div>
          ))}
        </div>

        {/* Dynamic SVG Connection Lines Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          {connectionLines.map((line, idx) => {
            const isMatched = line.status === 'matched';
            const strokeColor = isMatched ? '#10b981' : '#34d399';
            const dx = Math.abs(line.x2 - line.x1) * 0.5;
            const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <g key={`line-${idx}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isMatched ? '4' : '3'}
                  strokeOpacity={isMatched ? '0.85' : '0.6'}
                  strokeDasharray={isMatched ? 'none' : '4 4'}
                  className={!isMatched ? 'animate-pulse' : ''}
                />
                <circle cx={line.x1} cy={line.y1} r="4" fill={strokeColor} />
                <circle cx={line.x2} cy={line.y2} r="4" fill={strokeColor} />
              </g>
            );
          })}
        </svg>

        {/* Top HUD Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex-wrap">
          {/* Round Counter & Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-japan-red" />
              <span>Round {questionIndex} / {TOTAL_QUESTIONS}</span>
            </div>
            <div className="w-16 sm:w-28 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }}
              ></div>
            </div>

            {/* Dynamic Combo Flame Badge */}
            {combo > 1 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] sm:text-xs font-black shadow-xs animate-combo-bounce flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>{combo}x Combo!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Furigana Toggle */}
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red text-[10px] sm:text-[11px] font-black transition-colors cursor-pointer"
            >
              Furigana: {showFurigana ? 'ON' : 'OFF'}
            </button>

            {/* Center Timer */}
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-2xl border font-mono font-black text-xs sm:text-sm transition-colors ${
              timeLeft <= 10
                ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/40'
            }`}>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>00:{String(timeLeft).padStart(2, '0')}</span>
            </div>

            {/* Right Lives (Hearts) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => {
                const isFilled = heartIndex <= lives;
                return (
                  <Heart
                    key={heartIndex}
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      isFilled
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-300 dark:text-slate-700 fill-slate-200 dark:fill-slate-800 scale-90'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── In-game Combo & Notification Toast ── */}
        {comboBanner && (
          <div className="mx-auto px-4 py-1.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/50 text-xs sm:text-sm font-black shadow-lg animate-combo-bounce text-center z-20">
            {comboBanner}
          </div>
        )}

        {/* ── 2-Columns Matching Board (With Staggered Card Deal Animations) ── */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 relative z-20">
          {/* Column 1: Japanese Words */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-1">
              <span className="text-base sm:text-lg">🌸</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Japanese Words
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden xs:block">
                  Click a word, then click meaning!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {boardItems.map((item, index) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedWordId === item.id;
                const isSpeaking = speakingWordId === item.id;

                return (
                  <button
                    key={`word-${item.id}`}
                    onClick={() => handleWordClick(item)}
                    disabled={isMatched}
                    style={{ animationDelay: `${index * 55}ms` }}
                    className={`animate-card-deal relative p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between group cursor-pointer h-full ${
                      isMatched
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/80 shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700 scale-102 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#11182c] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 hover:scale-101'
                    }`}
                  >
                    {/* Word text & Furigana */}
                    <div className="min-w-0 pr-1 sm:pr-2">
                      <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white font-japanese leading-tight truncate">
                        {item.kanji}
                      </div>
                      {showFurigana && item.kana !== item.kanji && (
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 font-japanese mt-0.5 truncate">
                          {item.kana}
                        </div>
                      )}
                    </div>

                    {/* Pronunciation Audio Icon with Voice Ripple */}
                    <div className="relative flex items-center gap-1 shrink-0">
                      {isSpeaking && (
                        <span className="absolute -inset-1 rounded-full bg-japan-red/30 animate-ping"></span>
                      )}
                      <Volume2 className={`w-3.5 h-3.5 transition-colors ${
                        isSpeaking ? 'text-japan-red scale-110' : 'text-slate-400 group-hover:text-japan-red'
                      }`} />
                    </div>

                    {/* Connecting anchor node */}
                    <div
                      id={`word-anchor-${item.id}`}
                      className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                        isMatched
                          ? 'bg-emerald-500 border-white'
                          : isSelected
                          ? 'bg-emerald-500 border-white scale-125'
                          : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                      }`}
                    ></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Meanings */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-1">
              <span className="text-base sm:text-lg">📖</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Meanings
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden xs:block">
                  Match with the correct meaning!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {meaningItems.map((item, index) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedMeaningId === item.id;
                const isShaking = shakingCard === item.id;

                return (
                  <button
                    key={`meaning-${item.id}`}
                    onClick={() => handleMeaningClick(item)}
                    disabled={isMatched}
                    style={{ animationDelay: `${index * 55}ms` }}
                    className={`animate-card-deal relative p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between group cursor-pointer h-full ${
                      isShaking
                        ? 'animate-shake bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-300'
                        : isMatched
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/80 shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700 scale-102 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#11182c] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 hover:scale-101'
                    }`}
                  >
                    <div
                      id={`meaning-anchor-${item.id}`}
                      className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                        isMatched
                          ? 'bg-emerald-500 border-white'
                          : isSelected
                          ? 'bg-emerald-500 border-white scale-125'
                          : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                      }`}
                    ></div>

                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                          {item.en}
                        </div>
                        <div className="text-[9.5px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {item.bn}
                        </div>
                      </div>
                    </div>

                    {isMatched && (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex-wrap relative z-20">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs"
          >
            <Shuffle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden xs:inline">Shuffle</span>
          </button>

          <button
            onClick={handleCheckAnswer}
            className="flex-1 max-w-sm flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-japan-red via-rose-600 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white text-xs sm:text-sm md:text-base font-black shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all transform active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span>Check Answer</span>
          </button>

          <button
            onClick={handleHint}
            disabled={hintsRemaining <= 0}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              hintsRemaining > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40 hover:bg-amber-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-60 cursor-not-allowed'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="hidden xs:inline">Hint</span>
            <span className="w-5 h-5 rounded-full bg-japan-red text-white text-[10px] font-black flex items-center justify-center">
              {hintsRemaining}
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. Duolingo-Style 3-Star Celebration Victory Modal ── */}
      {isRoundWon && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0c1222] border-2 border-amber-400 dark:border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-combo-bounce relative overflow-hidden">
            {/* Ambient celebration lighting */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* 3-Star Rating Slam Animation */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3].map((starIdx) => {
                const isEarned = starIdx <= revealedStars;
                return (
                  <div
                    key={starIdx}
                    className={`transition-all duration-300 ${
                      isEarned ? 'animate-star-slam text-amber-400' : 'text-slate-200 dark:text-slate-800 scale-90'
                    }`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${
                        isEarned
                          ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                          : 'fill-current text-current'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              STAGE CLEAR!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              すばらしい! You mastered all {ROUND_SIZE} Japanese words!
            </p>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-2 my-4 w-full">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Reward</span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-500" />
                  <span>+{displayXpCount} XP</span>
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Time</span>
                <span className="text-base sm:text-lg font-black text-japan-red">
                  {INITIAL_TIME_SECONDS - timeLeft}s
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Hearts</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {lives}/3 ❤️
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={nextQuestion}
                className="w-full py-3.5 rounded-2xl bg-japan-red hover:bg-rose-700 text-white text-sm font-black shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
              >
                <span>NEXT ROUND</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={loadRound}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Replay Set
                </button>
                <Link
                  href="/game-zone/ranks"
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-center"
                >
                  Leaderboard 🏆
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Game Over Modal with Mistakes Review ── */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-3xl mb-3 shadow-md">
              💔
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Don&apos;t Give Up! (諦めないで)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
              You ran out of hearts. In Japan they say: &quot;七転び八起き&quot; (Fall seven times, stand up eight)!
            </p>

            <div className="flex items-center gap-3 my-5 w-full">
              <button
                onClick={() => {
                  setLives(3);
                  loadRound();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 text-white text-sm font-black shadow-md shadow-red-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
              >
                <RotateCw className="w-4 h-4" />
                <span>Try Again with 3 Hearts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Guest / Not Logged-in Rank-Up & Save Progress Modal ── */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1222] border-2 border-amber-400/90 dark:border-amber-500/80 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden animate-fade-in my-auto">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-black mb-3">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Save Progress &amp; Rank Up</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Save Your Progress &amp; Rank Up!
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                You earned <span className="text-japan-red font-black">+50 XP</span>! Please <strong className="text-slate-900 dark:text-white">log in or sign up</strong> to save your progress permanently and compete on the national leaderboard!
              </p>
            </div>

            {/* Currently Top 3 in Game Leaderboard Preview */}
            <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#11182c] border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Currently Top 3 in Game</span>
                </div>
                <Link
                  href="/game-zone/ranks"
                  onClick={() => setShowGuestModal(false)}
                  className="text-[11px] font-bold text-japan-red hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {top3Gamers.slice(0, 3).map((player, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                  const borderCol =
                    idx === 0
                      ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-300 dark:ring-amber-800'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]';
                  return (
                    <div
                      key={player.username || idx}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center text-xs ${borderCol}`}
                    >
                      <span className="text-lg mb-0.5">{medal}</span>
                      <div className="font-black text-slate-900 dark:text-white truncate max-w-full text-[11px] sm:text-xs">
                        {player.username}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <span>{player.country_flag || '🇯🇵'}</span>
                        <span>Lvl {player.level}</span>
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-japan-red text-[10px] font-black">
                        {player.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Link
                href="/accounts/signup"
                className="w-full py-3 rounded-2xl bg-japan-red hover:bg-rose-700 text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Sign Up Free to Save &amp; Rank Up</span>
              </Link>

              <Link
                href="/accounts/login"
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Already have an account? Log In</span>
              </Link>

              <button
                onClick={() => setShowGuestModal(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center py-1 mt-1 transition-colors cursor-pointer"
              >
                Continue playing as guest (saved on this device)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
