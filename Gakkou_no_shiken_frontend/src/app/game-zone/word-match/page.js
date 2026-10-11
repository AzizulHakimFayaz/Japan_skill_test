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

  // Start / Load a round
  const loadRound = useCallback(() => {
    const shuffled = [...vocabPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, ROUND_SIZE);

    setBoardItems(selected);
    setMeaningItems([...selected].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setSelectedWordId(null);
    setSelectedMeaningId(null);
    setCombo(0);
    setTimeLeft(INITIAL_TIME_SECONDS);
    setIsGameOver(false);
    setIsRoundWon(false);
  }, [vocabPool]);

  // Initial load
  useEffect(() => {
    loadRound();
  }, [loadRound]);

  // Update line positions dynamically
  const updateConnectionLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines = [];

    // Helper to calculate line between word card and meaning card
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

    // Matched pairs lines
    matchedPairs.forEach((id) => {
      const line = calculateLine(id, id, 'matched');
      if (line) lines.push(line);
    });

    // Active selected pair line
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

  // Countdown Timer
  useEffect(() => {
    if (isGameOver || isRoundWon) return;
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
  }, [isGameOver, isRoundWon]);

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
    if (matchedPairs.includes(item.id)) return;
    playSound.click();
    playSound.speakJapanese(item.kana || item.kanji);

    setSelectedWordId(item.id);

    // If meaning already selected, evaluate match
    if (selectedMeaningId) {
      evaluateMatch(item.id, selectedMeaningId);
    }
  };

  // Click on Meaning Card
  const handleMeaningClick = (item) => {
    if (matchedPairs.includes(item.id)) return;
    playSound.click();

    setSelectedMeaningId(item.id);

    // If word already selected, evaluate match
    if (selectedWordId) {
      evaluateMatch(selectedWordId, item.id);
    }
  };

  // Evaluate pair
  const evaluateMatch = (wordId, meaningId) => {
    if (wordId === meaningId) {
      // Correct Match!
      playSound.match();
      setCombo((prev) => prev + 1);
      const updatedMatches = [...matchedPairs, wordId];
      setMatchedPairs(updatedMatches);
      setSelectedWordId(null);
      setSelectedMeaningId(null);

      // Check if round won
      if (updatedMatches.length === boardItems.length) {
        handleRoundWin();
      }
    } else {
      // Wrong Match!
      playSound.error();
      setCombo(0);
      setShakingCard(meaningId);
      setTimeout(() => setShakingCard(null), 500);

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

  // Round Won
  const handleRoundWin = () => {
    setIsRoundWon(true);
    playSound.fanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    addGameReward({ xpGain: 50, wordsMastered: boardItems.length });

    // If guest or not logged in, trigger the guest login & rank-up pop-up
    if (!isAuthenticated) {
      setTimeout(() => {
        setShowGuestModal(true);
      }, 700);
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

    // Auto complete after short preview
    setTimeout(() => {
      evaluateMatch(unmatched.id, unmatched.id);
    }, 600);
  };

  // Inline alert toast
  const [matchAlert, setMatchAlert] = useState(null);

  // Check Answer Button
  const handleCheckAnswer = () => {
    if (selectedWordId && selectedMeaningId) {
      evaluateMatch(selectedWordId, selectedMeaningId);
    } else if (selectedWordId && !selectedMeaningId) {
      setMatchAlert('👉 Now tap the matching English/Bengali meaning on the right!');
      setTimeout(() => setMatchAlert(null), 2500);
    } else if (!selectedWordId && selectedMeaningId) {
      setMatchAlert('👈 Now tap the matching Japanese word on the left!');
      setTimeout(() => setMatchAlert(null), 2500);
    } else {
      setMatchAlert('👆 Tap 1 Japanese word and 1 Meaning card to connect them!');
      setTimeout(() => setMatchAlert(null), 2500);
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
      {/* 1. Kawaii Anime Mascot Header Banner (Matching mockup) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        {/* Background Graphic */}
        <div className="relative h-44 sm:h-56 md:h-64 w-full">
          <Image
            src="/img/game_banner.jpg"
            alt="Word Match - Japanese Learning Game"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/70 via-sky-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Banner Text & Details */}
          <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-japan-red/90 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-xs">
                Featured Game
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold backdrop-blur-xs">
                Interactive Pairs
              </span>

              {/* Top 3 Quick Preview Badge */}
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

            {/* Category / Filter Tags (Matching mockup tags) */}
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

      {/* 2. Main Game Arena Card (Matching Mockup White Area) */}
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-5"
      >
        {/* Dynamic SVG Connection Lines Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          {connectionLines.map((line, idx) => {
            const isMatched = line.status === 'matched';
            const strokeColor = isMatched ? '#10b981' : '#34d399';
            // Smooth horizontal bezier curve
            const dx = Math.abs(line.x2 - line.x1) * 0.5;
            const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <g key={`line-${idx}`}>
                {/* Outer Glow */}
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isMatched ? '4' : '3'}
                  strokeOpacity={isMatched ? '0.85' : '0.6'}
                  strokeDasharray={isMatched ? 'none' : '4 4'}
                  className={!isMatched ? 'animate-pulse' : ''}
                />
                {/* Origin Dot */}
                <circle cx={line.x1} cy={line.y1} r="4" fill={strokeColor} />
                {/* Target Dot */}
                <circle cx={line.x2} cy={line.y2} r="4" fill={strokeColor} />
              </g>
            );
          })}
        </svg>

        {/* Top HUD Bar (Question, Furigana Toggle, Combo, Timer, Hearts) */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex-wrap">
          {/* Question Counter + Progress Bar */}
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
            {combo > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] sm:text-xs font-black animate-pulse shadow-xs">
                🔥 {combo}x Combo!
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
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 font-mono font-black text-xs sm:text-sm">
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

        {/* 2-Columns Matching Board (Side-by-side on all screens without spoiler emojis) */}
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
              {boardItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedWordId === item.id;

                return (
                  <button
                    key={`word-${item.id}`}
                    onClick={() => handleWordClick(item)}
                    disabled={isMatched}
                    className={`relative p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between group cursor-pointer h-full ${
                      isMatched
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/80 shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700 scale-102 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#11182c] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80'
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

                    {/* Pronunciation Audio icon */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Volume2 className="w-3.5 h-3.5 text-japan-red opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Connecting anchor node for SVG line */}
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
              {meaningItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedMeaningId === item.id;
                const isShaking = shakingCard === item.id;

                return (
                  <button
                    key={`meaning-${item.id}`}
                    onClick={() => handleMeaningClick(item)}
                    disabled={isMatched}
                    className={`relative p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between group cursor-pointer h-full ${
                      isShaking
                        ? 'animate-shake bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-300'
                        : isMatched
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/80 shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700 scale-102 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#11182c] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    {/* Connecting anchor node for SVG line */}
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

                    {/* Meaning (English & Bangla - No spoilers!) */}
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

        {/* Alert Tip Banner */}
        {matchAlert && (
          <div className="mx-auto my-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold animate-fadeIn text-center">
            {matchAlert}
          </div>
        )}

        {/* Bottom Action Bar (Shuffle, Check Answer, Hint) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 flex-wrap relative z-20">
          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs"
          >
            <Shuffle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden xs:inline">Shuffle</span>
          </button>

          {/* Large Red Primary Check Answer Button (Matching Mockup) */}
          <button
            onClick={handleCheckAnswer}
            className="flex-1 max-w-sm flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-japan-red via-rose-600 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white text-xs sm:text-sm md:text-base font-black shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 transition-all transform active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span>Check Answer</span>
          </button>

          {/* Hint Button */}
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

      {/* Round Won Modal */}
      {isRoundWon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-md">
              🎉
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Subarashii! (素晴らしい)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
              You matched all {ROUND_SIZE} Japanese words perfectly!
            </p>

            <div className="flex items-center justify-center gap-3 my-5 w-full">
              <div className="px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Reward</span>
                <span className="text-base font-black text-japan-red">+50 XP</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Streak</span>
                <span className="text-base font-black text-amber-600">+1 Day</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={loadRound}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                Replay Set
              </button>
              <button
                onClick={nextQuestion}
                className="flex-1 py-3 rounded-2xl bg-japan-red hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mb-3 shadow-md">
              💔
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Don&apos;t Give Up! (諦めないで)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
              You ran out of hearts. Mistakes are the best way to learn vocabulary!
            </p>

            <div className="flex items-center gap-3 my-5 w-full">
              <button
                onClick={() => {
                  setLives(3);
                  loadRound();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 text-white text-sm font-black shadow-md shadow-red-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Try Again with 3 Hearts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest / Not Logged-in Rank-Up & Save Progress Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1222] border-2 border-amber-400/90 dark:border-amber-500/80 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden animate-fade-in my-auto">
            {/* Top golden decorative ambient blur */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Close button */}
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge & Title */}
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <Link
                href="/accounts/signup"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-japan-red via-rose-600 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
