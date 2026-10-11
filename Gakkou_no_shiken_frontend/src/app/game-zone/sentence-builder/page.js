'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  Check,
  RotateCw,
  Trophy,
  Heart,
  Sparkles,
  Flame,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';

const SENTENCE_DATA = [
  {
    id: 's1',
    en: 'I eat rice every day.',
    bn: 'আমি প্রতিদিন ভাত খাই।',
    fullJapanese: '私は毎日ご飯を食べます。',
    correctOrder: ['私は', '毎日', 'ご飯を', '食べます'],
    distractors: ['パンを', '飲みます'],
    level: 'N5',
  },
  {
    id: 's2',
    en: 'I go to school by train.',
    bn: 'আমি ট্রেনে করে স্কুলে যাই।',
    fullJapanese: '電車で学校へ行きます。',
    correctOrder: ['電車で', '学校へ', '行きます'],
    distractors: ['バスで', '来ます'],
    level: 'N5',
  },
  {
    id: 's3',
    en: 'Please show me the ticket.',
    bn: 'দয়া করে টিকিটটি দেখান।',
    fullJapanese: '切符を見せてください。',
    correctOrder: ['切符を', '見せて', 'ください'],
    distractors: ['薬を', '買います'],
    level: 'JFT',
  },
  {
    id: 's4',
    en: 'Today is very cold.',
    bn: 'আজকে খুব ঠান্ডা।',
    fullJapanese: '今日はとても寒いです。',
    correctOrder: ['今日は', 'とても', '寒いです'],
    distractors: ['暑いです', '昨日は'],
    level: 'N5',
  },
  {
    id: 's5',
    en: 'Where is the hospital?',
    bn: 'হাসপাতালটি কোথায়?',
    fullJapanese: '病院はどこですか。',
    correctOrder: ['病院は', 'どこ', 'ですか'],
    distractors: ['駅は', 'だれ'],
    level: 'JFT',
  },
  {
    id: 's6',
    en: 'I drink green tea with friends.',
    bn: 'আমি বন্ধুদের সাথে সবুজ চা পান করি।',
    fullJapanese: '友達とお茶を飲みます。',
    correctOrder: ['友達と', 'お茶を', '飲みます'],
    distractors: ['水に', '食べます'],
    level: 'N5',
  },
  {
    id: 's7',
    en: 'Please put on safety gloves.',
    bn: 'দয়া করে নিরাপত্তা গ্লাভস পরিধান করুন।',
    fullJapanese: '安全手袋をしてください。',
    correctOrder: ['安全手袋を', 'して', 'ください'],
    distractors: ['靴を', '脱ぎます'],
    level: 'SSW',
  },
  {
    id: 's8',
    en: 'The meeting starts at 2 o\'clock.',
    bn: 'মিটিং ২টায় শুরু হবে।',
    fullJapanese: '会議は２時に始まります。',
    correctOrder: ['会議は', '２時に', '始まります'],
    distractors: ['仕事は', '終わります'],
    level: 'JFT',
  },
];

export default function SentenceBuilderPage() {
  const { user, isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'gameover' | 'won'
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const currentSentence = SENTENCE_DATA[currentIndex];

  // Setup current sentence question
  const loadSentence = useCallback((index) => {
    const s = SENTENCE_DATA[index];
    if (!s) return;
    const all = [...s.correctOrder, ...s.distractors]
      .map((text, idx) => ({ id: `${text}-${idx}-${Math.random()}`, text }))
      .sort(() => 0.5 - Math.random());

    setActiveSlot([]);
    setAvailableTiles(all);
    setFeedback(null);
  }, []);

  useEffect(() => {
    loadSentence(currentIndex);
  }, [currentIndex, loadSentence]);

  // Tap tile in pool -> move to slot
  const handleSelectTile = (tile) => {
    if (feedback) return;
    playSound.click();
    playSound.speakJapanese(tile.text);
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setActiveSlot((prev) => [...prev, tile]);
  };

  // Tap tile in slot -> send back to pool
  const handleRemoveTile = (tile) => {
    if (feedback) return;
    playSound.click();
    setActiveSlot((prev) => prev.filter((t) => t.id !== tile.id));
    setAvailableTiles((prev) => [...prev, tile]);
  };

  // Check sentence
  const handleCheckSentence = () => {
    if (feedback || activeSlot.length === 0) return;

    const userSentence = activeSlot.map((t) => t.text).join('');
    const targetSentence = currentSentence.correctOrder.join('');

    if (userSentence === targetSentence) {
      // Correct!
      playSound.cardMatch();
      playSound.speakJapanese(currentSentence.fullJapanese);
      setFeedback('correct');

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setScore((s) => s + 150 * (newCombo >= 3 ? 1.5 : 1));

      setTimeout(() => {
        if (currentIndex + 1 < SENTENCE_DATA.length) {
          setCurrentIndex((idx) => idx + 1);
        } else {
          // Completed all sentences
          handleGameWin();
        }
      }, 1200);
    } else {
      // Incorrect!
      playSound.cardMismatch();
      setFeedback('wrong');
      setCombo(0);

      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setGameState('gameover');
        }
        return Math.max(0, next);
      });

      setTimeout(() => {
        setFeedback(null);
      }, 1200);
    }
  };

  const handleGameWin = () => {
    setGameState('won');
    playSound.gameWon();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const totalXP = Math.max(25, 70 + combo * 5);
    setEarnedXP(totalXP);

    addGameReward({
      xpGain: totalXP,
      wordsMastered: SENTENCE_DATA.length * 3,
    });

    if (!isAuthenticated) {
      setTimeout(() => setShowGuestModal(true), 800);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setGameState('playing');
    loadSentence(0);
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Sentence Builder
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Grammar Puzzle
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Assemble scrambled Japanese words into grammatically accurate sentences.
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < lives ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}`}
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

      {/* 2. Main Game Body */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Progress & Stats */}
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
            <span>
              Sentence {currentIndex + 1} of {SENTENCE_DATA.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-amber-500 font-black">Score: {score}</span>
              {combo > 1 && <span className="text-rose-500 font-black">🔥 {combo}x Combo</span>}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / SENTENCE_DATA.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Prompt Card */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-3 relative">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
              {currentSentence.level} Prompt
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {currentSentence.en}
            </h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {currentSentence.bn}
            </p>
          </div>

          {/* Target Workspace (Assembled Slots) */}
          <div
            className={`min-h-[100px] sm:min-h-[120px] rounded-3xl border-2 p-4 sm:p-6 flex flex-wrap items-center justify-center gap-2.5 transition-all duration-300 ${
              feedback === 'correct'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                : feedback === 'wrong'
                ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                : activeSlot.length > 0
                ? 'border-indigo-400/80 bg-indigo-50/20 dark:bg-indigo-950/10'
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
            }`}
          >
            {activeSlot.length === 0 ? (
              <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 select-none">
                Tap words below in order to assemble the sentence
              </p>
            ) : (
              activeSlot.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleRemoveTile(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base sm:text-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {tile.text}
                </button>
              ))
            )}
          </div>

          {/* Feedback Status */}
          {feedback && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm font-black animate-fadeIn">
              {feedback === 'correct' ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Subarashii! Correct grammar!
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-5 h-5" /> Incorrect order, try again!
                </span>
              )}
            </div>
          )}

          {/* Available Word Tiles Bank */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Available Tiles
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {availableTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleSelectTile(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-base sm:text-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {tile.text}
                </button>
              ))}
            </div>
          </div>

          {/* Action Check Button */}
          <button
            onClick={handleCheckSentence}
            disabled={activeSlot.length === 0 || feedback !== null}
            className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
              activeSlot.length > 0
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>CHECK SENTENCE</span>
          </button>
        </div>
      )}

      {/* 3. Game Over View */}
      {gameState === 'gameover' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl shadow-md">
            💔
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
              Out of Hearts!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Japanese word order takes practice. Try again with 3 full hearts!
            </p>
          </div>
          <button
            onClick={restartGame}
            className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
        </div>
      )}

      {/* 4. Won View */}
      {gameState === 'won' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Grammar Master!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              You constructed all {SENTENCE_DATA.length} sentences with high grammatical accuracy!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Score</p>
              <p className="text-2xl font-black text-amber-500">{score}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP Awarded</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={restartGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
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
          <div className="bg-white dark:bg-[#0c1222] border border-blue-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Grammar Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You earned <span className="font-extrabold text-indigo-500">+{earnedXP} XP</span>! Log in
              or register to record your grammar streak and rank on the national Top 3 podium.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/sentence-builder"
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
