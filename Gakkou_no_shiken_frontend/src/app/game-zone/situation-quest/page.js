'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Compass,
  Volume2,
  Sparkles,
  Trophy,
  RotateCw,
  CheckCircle2,
  XCircle,
  LogIn,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { playSound } from '@/lib/gameAudio';
import { addGameReward } from '@/lib/gameStore';

const SCENARIOS = [
  {
    id: 'q1',
    place: 'Convenience Store (コンビニ)',
    role: 'Store Staff (店員)',
    avatar: '🏪',
    promptJp: 'お弁当、温めますか？',
    promptRomaji: 'Obentou, atatamemasu ka?',
    promptEn: 'Shall I microwave / heat up your bento?',
    promptBn: 'আপনার লাঞ্চ বক্স কি গরম করে দেব?',
    options: [
      {
        id: 'opt1',
        textJp: 'はい、お願いします。',
        textEn: 'Yes, please.',
        isCorrect: true,
        explanation: 'Natural & polite response when accepting heated bento in Japan.',
      },
      {
        id: 'opt2',
        textJp: 'いいえ、食べます。',
        textEn: 'No, I eat.',
        isCorrect: false,
        explanation: 'Grammatically awkward response to an offer.',
      },
      {
        id: 'opt3',
        textJp: '大丈夫です、薬です。',
        textEn: "It's okay, it's medicine.",
        isCorrect: false,
        explanation: 'Irrelevant to heating food.',
      },
    ],
  },
  {
    id: 'q2',
    place: 'Train Station (駅の窓口)',
    role: 'Station Staff (駅員)',
    avatar: '🚆',
    promptJp: 'どちらまで行かれますか？',
    promptRomaji: 'Dochira made ikaremasu ka?',
    promptEn: 'Where are you traveling to?',
    promptBn: 'আপনি কোন স্টেশনে যাবেন?',
    options: [
      {
        id: 'opt1',
        textJp: '新宿まで一枚お願いします。',
        textEn: 'One ticket to Shinjuku, please.',
        isCorrect: true,
        explanation: 'Clear destination and ticket quantity.',
      },
      {
        id: 'opt2',
        textJp: '電車が好きです。',
        textEn: 'I like trains.',
        isCorrect: false,
        explanation: 'Station staff needs your destination station.',
      },
      {
        id: 'opt3',
        textJp: '昨日行きました。',
        textEn: 'I went yesterday.',
        isCorrect: false,
        explanation: 'Past tense when asked about current travel.',
      },
    ],
  },
  {
    id: 'q3',
    place: 'Factory / Workplace (工場の現場)',
    role: 'Supervisor (リーダー)',
    avatar: '🦺',
    promptJp: '作業前に安全確認はしましたか？',
    promptRomaji: 'Sagyō mae ni anzen kakunin wa shimashita ka?',
    promptEn: 'Did you complete safety checks before starting work?',
    promptBn: 'কাজ শুরুর আগে নিরাপত্তা চেক করেছেন কি?',
    options: [
      {
        id: 'opt1',
        textJp: 'はい、確認しました！問題ありません。',
        textEn: 'Yes, confirmed! No problems found.',
        isCorrect: true,
        explanation: 'Crucial SSW safety protocol report in Japanese workplaces.',
      },
      {
        id: 'opt2',
        textJp: 'いいえ、明日買います。',
        textEn: 'No, will buy tomorrow.',
        isCorrect: false,
        explanation: 'Does not address safety check confirmation.',
      },
      {
        id: 'opt3',
        textJp: 'わかりません、帰ります。',
        textEn: "I don't know, going home.",
        isCorrect: false,
        explanation: 'Unprofessional response.',
      },
    ],
  },
  {
    id: 'q4',
    place: 'Nursing Care Facility (介護施設)',
    role: 'Care Recipient (利用者さん)',
    avatar: '👵',
    promptJp: '部屋が少し寒いです...',
    promptRomaji: 'Heya ga sukoshi samui desu...',
    promptEn: 'The room feels a bit cold...',
    promptBn: 'রুমটা কিছুটা ঠান্ডা লাগছে...',
    options: [
      {
        id: 'opt1',
        textJp: '毛布を持ってきましょうか？暖房も確認しますね。',
        textEn: 'Shall I bring a blanket? I will also check the heater.',
        isCorrect: true,
        explanation: 'Empathetic and proactive caregiving (Kaigo) standard response.',
      },
      {
        id: 'opt2',
        textJp: '冷たい水をどうぞ。',
        textEn: 'Here is cold water.',
        isCorrect: false,
        explanation: 'Offering cold water when chilly causes discomfort.',
      },
      {
        id: 'opt3',
        textJp: '窓を開けましょう。',
        textEn: "Let's open the window.",
        isCorrect: false,
        explanation: 'Opening windows makes it colder.',
      },
    ],
  },
  {
    id: 'q5',
    place: 'Restaurant (レストラン)',
    role: 'Waiter (店員)',
    avatar: '🍜',
    promptJp: 'ご注文はお決まりですか？',
    promptRomaji: 'Go-chuumon wa okimari desu ka?',
    promptEn: 'Are you ready to order?',
    promptBn: 'আপনার অর্ডার কি প্রস্তুত?',
    options: [
      {
        id: 'opt1',
        textJp: 'ラーメンを一つ、お願いします。',
        textEn: 'One ramen, please.',
        isCorrect: true,
        explanation: 'Standard order format in Japanese dining.',
      },
      {
        id: 'opt2',
        textJp: 'お会計をお願いします。',
        textEn: 'Bill, please.',
        isCorrect: false,
        explanation: 'Asking for the bill before ordering food.',
      },
      {
        id: 'opt3',
        textJp: 'ごちそうさまでした。',
        textEn: 'Thank you for the meal (finished).',
        isCorrect: false,
        explanation: 'Said after eating, not before ordering.',
      },
    ],
  },
];

export default function SituationQuestPage() {
  const { user, isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won'
  const [earnedXP, setEarnedXP] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const scenario = SCENARIOS[currentIndex];

  const handleSelectOption = (opt) => {
    if (feedback !== null) return;
    setSelectedOptId(opt.id);

    if (opt.isCorrect) {
      playSound.cardMatch();
      setFeedback('correct');
      setScore((s) => s + 200);
      setCorrectAnswers((c) => c + 1);
    } else {
      playSound.cardMismatch();
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < SCENARIOS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOptId(null);
      setFeedback(null);
    } else {
      // Finished all scenarios
      setGameState('won');
      playSound.gameWon();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      const finalXP = Math.max(30, correctAnswers * 25);
      setEarnedXP(finalXP);

      addGameReward({
        xpGain: finalXP,
        wordsMastered: correctAnswers * 4,
      });

      if (!isAuthenticated) {
        setTimeout(() => setShowGuestModal(true), 800);
      }
    }
  };

  const restartQuest = () => {
    setCurrentIndex(0);
    setSelectedOptId(null);
    setFeedback(null);
    setScore(0);
    setCorrectAnswers(0);
    setGameState('playing');
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-12">
      {/* 1. Header Bar */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Situation Quest
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Dialogue RPG
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Interactive workplace &amp; daily life dialogue roleplay scenarios.
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

      {/* 2. Playing View */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
            <span>
              Scenario {currentIndex + 1} of {SCENARIOS.length}
            </span>
            <span className="text-cyan-500 font-black">Score: {score} pts</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / SCENARIOS.length) * 100}%`,
              }}
            />
          </div>

          {/* Dialogue Scene Card */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span>
                <span>{scenario.place}</span>
              </span>
              <button
                onClick={() => playSound.speakJapanese(scenario.promptJp)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                <Volume2 className="w-4 h-4 text-cyan-500" />
                <span>Hear Voice</span>
              </button>
            </div>

            {/* Character speech bubble */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-3xl shadow-xs shrink-0">
                {scenario.avatar}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-[#11182c] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 relative">
                <span className="text-[11px] font-black text-slate-400 block mb-1">
                  {scenario.role} says:
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {scenario.promptJp}
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  {scenario.promptRomaji}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{scenario.promptEn}</span> • <span>{scenario.promptBn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Choose your response:
            </p>
            {scenario.options.map((opt) => {
              const isSelected = selectedOptId === opt.id;
              let style =
                'bg-white dark:bg-[#0c1222] border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-400 text-slate-900 dark:text-white';

              if (feedback && isSelected) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-500 text-white border-emerald-500 shadow-md';
                } else {
                  style = 'bg-rose-500 text-white border-rose-500 shadow-md';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback !== null}
                  className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer shadow-xs ${style}`}
                >
                  <span className="text-base sm:text-lg font-black">{opt.textJp}</span>
                  <span className="text-xs font-bold opacity-80">{opt.textEn}</span>

                  {feedback && isSelected && (
                    <div className="mt-2 pt-2 border-t border-white/30 text-xs font-semibold animate-fadeIn">
                      {opt.explanation}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {feedback !== null && (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer animate-fadeIn"
            >
              <span>{currentIndex + 1 < SCENARIOS.length ? 'NEXT SCENARIO' : 'FINISH QUEST'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. Won View */}
      {gameState === 'won' && (
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/25">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Quest Completed!
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              You navigated real Japanese workplace and daily conversations with confidence!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Correct</p>
              <p className="text-2xl font-black text-emerald-500">
                {correctAnswers}/{SCENARIOS.length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">XP Awarded</p>
              <p className="text-2xl font-black text-indigo-500">+{earnedXP} XP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={restartQuest}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>QUEST AGAIN</span>
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
          <div className="bg-white dark:bg-[#0c1222] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">
              Save Your {score} Quest Points!
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              You earned <span className="font-extrabold text-cyan-500">+{earnedXP} XP</span>! Log in
              to record your quest achievements and claim your spot in the national Top 3.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/accounts/login?redirect=/game-zone/situation-quest"
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
