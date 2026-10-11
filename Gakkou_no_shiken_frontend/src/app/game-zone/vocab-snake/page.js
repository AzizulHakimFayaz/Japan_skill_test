'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Heart,
  Trophy,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Volume2,
  Sparkles,
  Zap,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';
import { GAME_VOCABULARY, CATEGORIES } from '../gameVocabData';

const GRID_SIZE = 18; // 18x18 grid
const CELL_SIZE = 26; // 26px per cell = ~468px canvas
const INITIAL_SPEED = 140; // ms per tick

export default function VocabSnakePage() {
  const { user, isAuthenticated } = useAuth();

  // Canvas ref
  const canvasRef = useRef(null);

  // Game States
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [score, setScore] = useState(0);
  const [wordsEaten, setWordsEaten] = useState(0);
  const [lives, setLives] = useState(3);
  const [showFurigana, setShowFurigana] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Active Target Word & Foods
  const [currentTarget, setCurrentTarget] = useState(null);

  // Internal Game Engine Refs (so loop runs at exact timing without stale closures)
  const snakeRef = useRef([
    { x: 9, y: 9 },
    { x: 9, y: 10 },
    { x: 9, y: 11 },
  ]);
  const directionRef = useRef({ x: 0, y: -1 }); // Moving UP initially
  const nextDirectionRef = useRef({ x: 0, y: -1 });
  const foodsRef = useRef([]); // [{ x, y, word, isCorrect }]
  const gameLoopRef = useRef(null);
  const flashRef = useRef(0); // For red/green hit flashes

  // Filter vocabulary pool
  const vocabPool = React.useMemo(() => {
    if (selectedCategory === 'all') return GAME_VOCABULARY;
    if (selectedCategory === 'jft' || selectedCategory === 'n5') {
      return GAME_VOCABULARY.filter((w) => w.level === selectedCategory);
    }
    return GAME_VOCABULARY.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  // Spawn new target and food pellets
  const spawnFoodCluster = useCallback(
    (customTarget = null) => {
      if (vocabPool.length < 4) return;
      const pool = [...vocabPool];

      // Pick target word
      const target =
        customTarget || pool[Math.floor(Math.random() * pool.length)];
      setCurrentTarget(target);

      // Pick 3 decoys
      const decoys = pool
        .filter((w) => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const items = [
        { word: target, isCorrect: true },
        ...decoys.map((d) => ({ word: d, isCorrect: false })),
      ].sort(() => 0.5 - Math.random());

      // Find free grid cells
      const snake = snakeRef.current;
      const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));

      const placedFoods = [];
      for (const item of items) {
        let x, y, key;
        let attempts = 0;
        do {
          x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          key = `${x},${y}`;
          attempts++;
        } while (
          (occupied.has(key) || placedFoods.some((f) => f.x === x && f.y === y)) &&
          attempts < 100
        );

        placedFoods.push({
          x,
          y,
          word: item.word,
          isCorrect: item.isCorrect,
        });
      }

      foodsRef.current = placedFoods;

      // Speak native audio
      if (target?.kanji) {
        playSound.speakJapanese(target.kanji);
      }
    },
    [vocabPool]
  );

  // Start / Restart game
  const startGame = useCallback(() => {
    snakeRef.current = [
      { x: 9, y: 9 },
      { x: 9, y: 10 },
      { x: 9, y: 11 },
    ];
    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };
    setScore(0);
    setWordsEaten(0);
    setLives(3);
    setEarnedXP(0);
    setShowGuestModal(false);
    setGameState('playing');
    spawnFoodCluster();
  }, [spawnFoodCluster]);

  // Steer Direction
  const changeDirection = useCallback((dx, dy) => {
    const cur = directionRef.current;
    // Prevent 180 reverse
    if (cur.x + dx === 0 && cur.y + dy === 0) return;
    nextDirectionRef.current = { x: dx, y: dy };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDirection]);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let speed = Math.max(90, INITIAL_SPEED - wordsEaten * 2.5);

    const interval = setInterval(() => {
      directionRef.current = nextDirectionRef.current;
      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      let hitWallOrSelf = false;

      // Wall collision check
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        hitWallOrSelf = true;
      }

      // Self collision
      if (snakeRef.current.some((seg) => seg.x === head.x && seg.y === head.y)) {
        hitWallOrSelf = true;
      }

      if (hitWallOrSelf) {
        playSound.cardMismatch();
        flashRef.current = 10;
        setLives((prevLives) => {
          const next = prevLives - 1;
          if (next <= 0) {
            // Game Over
            setGameState('gameover');
            playSound.gameWon();
            return 0;
          }
          // Reset snake position to center
          snakeRef.current = [
            { x: 9, y: 9 },
            { x: 9, y: 10 },
            { x: 9, y: 11 },
          ];
          directionRef.current = { x: 0, y: -1 };
          nextDirectionRef.current = { x: 0, y: -1 };
          return next;
        });
        return;
      }

      // Check food collisions
      const foods = foodsRef.current;
      const hitFoodIdx = foods.findIndex((f) => f.x === head.x && f.y === head.y);

      let grew = false;

      if (hitFoodIdx !== -1) {
        const hitFood = foods[hitFoodIdx];
        if (hitFood.isCorrect) {
          // Ate correct word!
          playSound.cardMatch();
          flashRef.current = -10; // green flash
          grew = true;
          setScore((s) => s + 100);
          setWordsEaten((w) => w + 1);

          // Spawn new target
          spawnFoodCluster();
        } else {
          // Ate wrong word!
          playSound.cardMismatch();
          flashRef.current = 10; // red flash
          setLives((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState('gameover');
              playSound.gameWon();
              return 0;
            }
            return next;
          });

          // Move the eaten wrong food elsewhere
          const remainingFoods = foods.filter((_, idx) => idx !== hitFoodIdx);
          foodsRef.current = remainingFoods;
        }
      }

      // Update snake body
      const newSnake = [head, ...snakeRef.current];
      if (!grew) {
        newSnake.pop();
      }
      snakeRef.current = newSnake;

      // Draw to canvas
      drawCanvas();
    }, speed);

    gameLoopRef.current = interval;
    return () => clearInterval(interval);
  }, [gameState, wordsEaten, spawnFoodCluster]);

  // Canvas Drawing Function
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0b101e';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (subtle cyberpunk grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Flash hit effect
    if (flashRef.current > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(0, 0, width, height);
      flashRef.current--;
    } else if (flashRef.current < 0) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(0, 0, width, height);
      flashRef.current++;
    }

    // Draw Foods (Kanji Pellets)
    foodsRef.current.forEach((food) => {
      const px = food.x * CELL_SIZE;
      const py = food.y * CELL_SIZE;

      // Pellet pill background
      ctx.fillStyle = food.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.15)';
      ctx.strokeStyle = food.isCorrect ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
      ctx.fill();
      ctx.stroke();

      // Kanji text inside cell
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.word.kanji, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
    });

    // Draw Snake
    const snake = snakeRef.current;
    snake.forEach((seg, index) => {
      const px = seg.x * CELL_SIZE;
      const py = seg.y * CELL_SIZE;

      if (index === 0) {
        // Head (Bright Emerald Green)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4, 7);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      } else {
        // Body segment
        const gradientRatio = index / snake.length;
        ctx.fillStyle = gradientRatio > 0.6 ? '#059669' : '#34d399';
        ctx.beginPath();
        ctx.roundRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, 5);
        ctx.fill();
      }
    });
  };

  // Game over state triggers
  useEffect(() => {
    if (gameState === 'gameover') {
      const finalXP = Math.max(15, wordsEaten * 8 + Math.floor(score / 25));
      setEarnedXP(finalXP);

      addGameReward({
        xpGain: finalXP,
        wordsMastered: Math.min(wordsEaten, 10),
      });

      if (!isAuthenticated) {
        setTimeout(() => setShowGuestModal(true), 800);
      }

      if (score >= 400) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  }, [gameState, wordsEaten, score, isAuthenticated]);

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Vocab Snake
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Retro Arcade
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Eat the target kanji fruit to grow! Avoid decoy kanji and walls.
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
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
            <Gamepad2 className="w-12 h-12" />
          </div>

          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Vocab Snake Arcade
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              A target English/Bengali meaning is shown at the top. Steer the snake to eat the
              matching Japanese Kanji fruit! Eating the wrong fruit costs 1 Life ❤️.
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
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
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
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>PLAY SNAKE ARCADE</span>
          </button>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Target Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center font-black">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                  FIND &amp; EAT TARGET:
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {currentTarget?.en}
                  </span>
                  <span className="text-sm font-bold text-slate-400">({currentTarget?.bn})</span>
                </div>
              </div>
            </div>

            {/* Pronunciation audio trigger */}
            <button
              onClick={() => playSound.speakJapanese(currentTarget?.kanji)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio Hint</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            {/* Lives */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Lives
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-base ${i < lives ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Score
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
            </div>

            {/* Kanji Eaten */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Eaten
                </p>
                <p className="text-xl font-black text-emerald-500">{wordsEaten} words</p>
              </div>
            </div>
          </div>

          {/* Canvas Board */}
          <div className="relative flex justify-center items-center bg-[#070b14] border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="rounded-2xl max-w-full aspect-square touch-none"
            />
          </div>

          {/* Mobile On-Screen D-Pad Controls */}
          <div className="flex flex-col items-center gap-2 pt-2 sm:hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Touch D-Pad Controls
            </p>
            <div className="grid grid-cols-3 gap-2 w-56">
              <div />
              <button
                onClick={() => changeDirection(0, -1)}
                className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all text-xl"
              >
                <ArrowUp className="w-7 h-7" />
              </button>
              <div />

              <button
                onClick={() => changeDirection(-1, 0)}
                className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all text-xl"
              >
                <ArrowLeft className="w-7 h-7" />
              </button>
              <div />
              <button
                onClick={() => changeDirection(1, 0)}
                className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all text-xl"
              >
                <ArrowRight className="w-7 h-7" />
              </button>

              <div />
              <button
                onClick={() => changeDirection(0, 1)}
                className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all text-xl"
              >
                <ArrowDown className="w-7 h-7" />
              </button>
              <div />
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SUMMARY */}
      {gameState === 'gameover' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Game Over!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              You navigated the Kanji maze and devoured {wordsEaten} words!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Words</p>
              <p className="text-2xl font-black text-emerald-500">{wordsEaten}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
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
          <div className="bg-white dark:bg-[#0c1222] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Snake Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You earned <span className="font-extrabold text-emerald-500">+{earnedXP} XP</span> and
              mastered <span className="font-extrabold text-amber-500">{wordsEaten} kanji words</span>!
              Log in now so your score is submitted to the leaderboard and ranks you in Top 3.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/vocab-snake"
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
