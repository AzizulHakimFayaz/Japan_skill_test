'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Home,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Award,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    sentence_ja: '日曜日、図書館___本を読みました。',
    sentence_romaji: 'Nichiyoubi, toshokan ___ hon wo yomimashita.',
    sentence_bn: 'রবিবার পাঠাগারে বই পড়েছিলাম।',
    options: ['で', 'に', 'へ', 'を'],
    correct: 'で',
    explanation_bn: 'কাজের স্থান বোঝাতে 「で」 পার্টিকেল বসে। পাঠাগারে পড়াশোনার কাজ করা হয়েছে। (Action location requires で).',
  },
  {
    id: 2,
    sentence_ja: '来週の金曜日、東京___行きます。',
    sentence_romaji: 'Raishuu no kinyoubi, Toukyou ___ ikimasu.',
    sentence_bn: 'আগামী সপ্তাহের শুক্রবার টোকিও যাব।',
    options: ['へ', 'で', 'を', 'から'],
    correct: 'へ',
    explanation_bn: 'যাওয়ার দিক বা গন্তব্য নির্দেশ করতে 「へ」 বা 「に」 পার্টিকেল বসে। (Direction/destination requires へ).',
  },
  {
    id: 3,
    sentence_ja: '部屋の机の上に、時計___あります。',
    sentence_romaji: 'Heya no tsukue no ue ni, tokei ___ arimasu.',
    sentence_bn: 'ঘরের টেবিলের ওপর ঘড়ি আছে।',
    options: ['が', 'を', 'で', 'に'],
    correct: 'が',
    explanation_bn: 'জিনিসের অস্তিত্ব (あります / います) বোঝাতে বস্তুর পরে 「が」 পার্টিকেল বসে। (Subject of existence takes が).',
  },
  {
    id: 4,
    sentence_ja: '毎朝、7時___起きます。',
    sentence_romaji: 'Maiasa, shichiji ___ okimasu.',
    sentence_bn: 'প্রতিদিন সকাল ৭টায় ঘুম থেকে উঠি।',
    options: ['に', 'で', 'を', 'は'],
    correct: 'に',
    explanation_bn: 'নির্দিষ্ট সময় বা ঘণ্টার পর 「に」 পার্টিকেল বসে। (Specific time point takes に).',
  },
  {
    id: 5,
    sentence_ja: '友達___一緒に昼ご飯を食べました。',
    sentence_romaji: 'Tomodachi ___ issho ni hirugohan wo tabemashita.',
    sentence_bn: 'বন্ধুর সাথে একসাথে দুপুরের খাবার খেয়েছিলাম।',
    options: ['と', 'に', 'で', 'を'],
    correct: 'と',
    explanation_bn: 'কারো সাথে (with) বোঝাতে 「と」 পার্টিকেল বসে। (Doing something with someone takes と).',
  },
  {
    id: 6,
    sentence_ja: '私は日本語___上手になりたいです。',
    sentence_romaji: 'Watashi wa nihongo ___ jouzu ni naritai desu.',
    sentence_bn: 'আমি জাপানি ভাষায় দক্ষ হতে চাই।',
    options: ['が', 'を', 'で', 'に'],
    correct: 'が',
    explanation_bn: 'দক্ষতা বা পছন্দ (上手 / 好き / 分かる) বোঝাতে লক্ষ্যের পরে 「が」 বসে। (Target of ability takes が).',
  },
  {
    id: 7,
    sentence_ja: '箸___ラーメンを食べます。',
    sentence_romaji: 'Hashi ___ raamen wo tabemasu.',
    sentence_bn: 'চপস্টিক দিয়ে রামেন খাই।',
    options: ['で', 'に', 'を', 'と'],
    correct: 'で',
    explanation_bn: 'কোনো মাধ্যম বা যন্ত্র (by means of) বোঝাতে 「で」 পার্টিকেল বসে। (Tool/means takes で).',
  },
  {
    id: 8,
    sentence_ja: 'バス___降りて、電車に乗り換えました。',
    sentence_romaji: 'Basu ___ orite, densha ni norikaemashita.',
    sentence_bn: 'বাস থেকে নেমে ট্রেনে চড়েছিলাম।',
    options: ['を', 'で', 'に', 'から'],
    correct: 'を',
    explanation_bn: 'যানবাহন থেকে নামার স্থান বোঝাতে 「を (降りる)」 বসে। (Leaving a vehicle takes を).',
  },
  {
    id: 9,
    sentence_ja: '会社は9時___5時までです。',
    sentence_romaji: 'Kaisha wa kuji ___ goji made desu.',
    sentence_bn: 'অফিস সকাল ৯টা থেকে বিকেল ৫টা পর্যন্ত।',
    options: ['から', 'まで', 'に', 'で'],
    correct: 'から',
    explanation_bn: 'শুরুর সময় ("থেকে") বোঝাতে 「から」 বসে। (Starting time "from" takes から).',
  },
  {
    id: 10,
    sentence_ja: 'スーパーでりんご___みかんを買いました。',
    sentence_romaji: 'Suupaa de ringo ___ mikan wo kaimashita.',
    sentence_bn: 'সুপারশপে আপেল এবং কমলা কিনেছিলাম।',
    options: ['と', 'で', 'に', 'を'],
    correct: 'と',
    explanation_bn: 'দুটি বিশেষ্য যুক্ত করার জন্য ("এবং / and") 「と」 পার্টিকেল বসে। (Connecting nouns with "and" takes と).',
  },
];

export default function ParticleQuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (option) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(option);

    const isCorrect = option === question.correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: { option, isCorrect },
    }));
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setAnswers({});
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/tools" className="hover:text-japan-red dark:hover:text-rose-400">
          Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">Particle Drill</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>JFT-Basic A2 Japanese Grammar</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Japanese Particle Drill Room (助詞特訓)
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
          Test your mastery of essential Japanese particles (で, に, を, が, は, へ, と) with instant Bengali explanations.
        </p>
      </div>

      {!quizFinished ? (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">Score: {score}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                {question.sentence_ja}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono">
                {question.sentence_romaji}
              </div>
              <div className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                বাংলা অর্থ: {question.sentence_bn}
              </div>
            </div>

            {/* Particle Options Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === question.correct;
                let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-japan-red';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-md shadow-emerald-500/10';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-700 dark:text-rose-300 font-black';
                  } else {
                    btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={selectedOption !== null}
                    className={`py-4 px-6 rounded-2xl border text-xl sm:text-2xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Bengali Grammar Explanation */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>গ্রামার ব্যাখ্যা (Grammar Rule)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {question.explanation_bn}
                </p>
              </div>
            )}

            {/* Next Button */}
            {selectedOption !== null && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-japan-red to-rose-600 text-white font-black text-xs sm:text-sm shadow-md hover:from-japan-redhover hover:to-rose-700 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Results Card */
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              You scored <strong className="text-emerald-500 text-base">{score}</strong> out of {QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:bg-japan-red dark:hover:bg-japan-red dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Drill</span>
            </button>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Explore More Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
