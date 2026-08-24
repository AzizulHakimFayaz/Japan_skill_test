'use client';

import React, { useState } from 'react';
import { Volume2, RotateCw, Sparkles, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const KANJI_DATA = [
  {
    kanji: '合格',
    hiragana: 'ごうかく',
    romaji: 'Goukaku',
    meaning: 'Passing an Examination / Eligibility',
    exampleJa: 'JFT-Basic試験に合格しました！',
    exampleEn: 'I passed the JFT-Basic examination!',
    level: 'JFT-Basic / N4',
    category: 'General Exam',
  },
  {
    kanji: '介護',
    hiragana: 'かいご',
    romaji: 'Kaigo',
    meaning: 'Nursing Care / Caregiving',
    exampleJa: '高齢者の介護サポートを行います。',
    exampleEn: 'Providing nursing care support for the elderly.',
    level: 'SSW Nursing Care',
    category: 'SSW Sector',
  },
  {
    kanji: '案内',
    hiragana: 'あんない',
    romaji: 'Annai',
    meaning: 'Guidance / Information / Showing around',
    exampleJa: '駅の案内板を確認してください。',
    exampleEn: 'Please check the information board at the station.',
    level: 'JFT-Basic / A2',
    category: 'Daily Living',
  },
  {
    kanji: '受付',
    hiragana: 'うけつけ',
    romaji: 'Uketsuke',
    meaning: 'Reception Desk / Information Counter',
    exampleJa: 'テストセンターの受付でパスポートを見せます。',
    exampleEn: 'Show your passport at the test center reception.',
    level: 'JFT-Basic / A2',
    category: 'Test Center',
  },
  {
    kanji: '外食',
    hiragana: 'がいしょく',
    romaji: 'Gaishoku',
    meaning: 'Food Service / Dining Out Industry',
    exampleJa: '外食業の特定技能試験の準備をしています。',
    exampleEn: 'Preparing for the SSW Food Service skill test.',
    level: 'SSW Food Service',
    category: 'SSW Sector',
  },
  {
    kanji: '注意',
    hiragana: 'ちゅうい',
    romaji: 'Chuui',
    meaning: 'Caution / Attention / Warning',
    exampleJa: '足元に注意して作業してください。',
    exampleEn: 'Please pay attention to your footing while working.',
    level: 'JFT-Basic / N4',
    category: 'Workplace Safety',
  },
  {
    kanji: '約束',
    hiragana: 'やくそく',
    romaji: 'Yakusoku',
    meaning: 'Promise / Appointment / Reservation',
    exampleJa: '午後２時に面接の約束があります。',
    exampleEn: 'I have an interview appointment at 2:00 PM.',
    level: 'JFT-Basic / A2',
    category: 'Daily Living',
  },
];

export default function DailyKanjiCard() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const current = KANJI_DATA[index];

  const handleNext = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % KANJI_DATA.length);
    }, 200);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.kanji);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85; // Natural clear pronunciation
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-japan-red/10 dark:bg-rose-950/80 text-japan-red dark:text-rose-400 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-japan-red dark:text-rose-400 block">
              Daily Vocabulary Spark
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">今日の重要漢字 (Daily Kanji)</h3>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {current.level}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="my-5 relative h-48 sm:h-52 w-full cursor-pointer perspective-1000 group select-none"
      >
        <div
          className={`w-full h-full duration-500 transform-style-3d relative transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front: Big Kanji with Hiragana & Audio */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-slate-800/90 dark:via-slate-800 dark:to-slate-900 border border-slate-200/90 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center shadow-xs group-hover:border-japan-red/50 dark:group-hover:border-rose-500/50 transition-colors">
            <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-400 font-mono mb-1">
              {current.hiragana} • {current.romaji}
            </span>

            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {current.kanji}
              </span>
              <button
                type="button"
                onClick={handleSpeak}
                title="Listen to Japanese pronunciation"
                className={`w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/80 text-japan-red dark:text-rose-400 hover:bg-japan-red hover:text-white dark:hover:bg-rose-600 dark:hover:text-white flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer ${
                  isSpeaking ? 'ring-4 ring-rose-200 animate-pulse' : ''
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-1 text-[11px] text-japan-red dark:text-rose-400 font-extrabold bg-red-50/80 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-red-100 dark:border-rose-900/50">
              <span>Tap card to reveal English meaning</span>
              <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>

          {/* Card Back: Meaning & Real Exam Context Sentence */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-slate-900 via-japan-navy to-slate-950 text-white border border-slate-700 p-5 flex flex-col justify-center text-left shadow-lg">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block mb-1">
              Meaning &amp; Exam Usage
            </span>
            <strong className="text-base sm:text-lg font-black text-white block mb-2 leading-snug">
              {current.meaning}
            </strong>

            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-xs space-y-1">
              <p className="font-bold text-slate-100">{current.exampleJa}</p>
              <p className="text-slate-300 text-[11px] font-normal italic">{current.exampleEn}</p>
            </div>

            <span className="text-[10px] text-slate-400 font-semibold mt-2 text-right block">
              Tap again to flip back
            </span>
          </div>
        </div>
      </div>

      {/* Footer Shuffle Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Word <strong className="text-slate-900 dark:text-white">{index + 1}</strong> of {KANJI_DATA.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-japan-red dark:hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span>Next Word (次の単語)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
