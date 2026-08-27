'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Home,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const VOCAB_DATA = [
  // Everyday & Station
  {
    kanji: '歩いて',
    kana: 'あるいて',
    romaji: 'aruite',
    meaning_bn: 'হেঁটে (on foot)',
    meaning_en: 'on foot / walking',
    category: 'daily',
    example_ja: '毎日、駅まで歩いて行きます。',
    example_bn: 'প্রতিদিন হেঁটে স্টেশনে যাই।',
    example_en: 'I walk to the station every day.',
  },
  {
    kanji: '乗り場',
    kana: 'のりば',
    romaji: 'noriba',
    meaning_bn: 'বাস বা ট্রেনের প্ল্যাটফর্ম / স্টপ',
    meaning_en: 'boarding place / bus stop / platform',
    category: 'daily',
    example_ja: 'バスの乗り場はどこですか。',
    example_bn: 'বাসের প্ল্যাটফর্ম কোথায়?',
    example_en: 'Where is the bus boarding place?',
  },
  {
    kanji: '両替',
    kana: 'りょうがえ',
    romaji: 'ryougae',
    meaning_bn: 'টাকা ভাঙানো / মুদ্রা বিনিময়',
    meaning_en: 'money exchange / changing money',
    category: 'daily',
    example_ja: '千円札を両替してください。',
    example_bn: '১০০০ ইয়েন নোট ভাঙিয়ে দিন।',
    example_en: 'Please change this 1,000 yen bill.',
  },
  {
    kanji: '階段',
    kana: 'かいだん',
    romaji: 'kaidan',
    meaning_bn: 'সিঁড়ি',
    meaning_en: 'stairs / staircase',
    category: 'daily',
    example_ja: '階段を上がって右にあります。',
    example_bn: 'সিঁড়ি দিয়ে উঠে ডানে আছে।',
    example_en: 'Go up the stairs and it is on the right.',
  },
  {
    kanji: '禁煙',
    kana: 'きんえん',
    romaji: 'kin-en',
    meaning_bn: 'ধূমপান নিষেধ',
    meaning_en: 'no smoking',
    category: 'daily',
    example_ja: 'この部屋は禁煙です。',
    example_bn: 'এই রুমে ধূমপান নিষেধ।',
    example_en: 'No smoking is allowed in this room.',
  },

  // Caregiving & Nursing (SSW Care)
  {
    kanji: '介助',
    kana: 'かいじょ',
    romaji: 'kaijo',
    meaning_bn: 'সেবা সহায়তা / সাহায্য করা',
    meaning_en: 'assistance / caregiving help',
    category: 'care',
    example_ja: '食事の介助を行います。',
    example_bn: 'খাওয়ানোর সহায়তা প্রদান করছি।',
    example_en: 'I will assist with the meal.',
  },
  {
    kanji: '車いす',
    kana: 'くるまいす',
    romaji: 'kurumaisu',
    meaning_bn: 'হুইলচেয়ার',
    meaning_en: 'wheelchair',
    category: 'care',
    example_ja: '車いすのブレーキをかけます。',
    example_bn: 'হুইলচেয়ারের ব্রেক লাগাচ্ছি।',
    example_en: 'I am locking the wheelchair brakes.',
  },
  {
    kanji: '体調',
    kana: 'たいちょう',
    romaji: 'taichou',
    meaning_bn: 'শারীরিক অবস্থা',
    meaning_en: 'physical condition / health status',
    category: 'care',
    example_ja: '今日の体調はいかがですか。',
    example_bn: 'আজ আপনার শরীর কেমন লাগছে?',
    example_en: 'How are you feeling today?',
  },
  {
    kanji: '水分補給',
    kana: 'すいぶんほきゅう',
    romaji: 'suibun hokyuu',
    meaning_bn: 'পর্যাপ্ত পানি পান / হাইড্রেশন',
    meaning_en: 'hydration / fluid intake',
    category: 'care',
    example_ja: 'こまめに水分補給をしてください。',
    example_bn: 'নিয়মিত পর্যাপ্ত পানি পান করুন।',
    example_en: 'Please stay hydrated regularly.',
  },

  // Food Service & Restaurant (SSW Food)
  {
    kanji: '賞味期限',
    kana: 'しょうみきげん',
    romaji: 'shoumi kigen',
    meaning_bn: 'সেরা স্বাদের মেয়াদ (Best Before Date)',
    meaning_en: 'best-before date / expiration',
    category: 'food',
    example_ja: '賞味期限を確認してください。',
    example_bn: 'মেয়াদ শেষের তারিখটি যাচাই করুন।',
    example_en: 'Please check the best-before date.',
  },
  {
    kanji: '衛生',
    kana: 'えいせい',
    romaji: 'eisei',
    meaning_bn: 'স্বাস্থ্যবিধি / পরিচ্ছন্নতা',
    meaning_en: 'hygiene / sanitation',
    category: 'food',
    example_ja: '調理場の衛生管理を徹底します。',
    example_bn: 'রান্নাঘরের পরিচ্ছন্নতা কঠোরভাবে বজায় রাখুন।',
    example_en: 'Maintain strict hygiene in the kitchen.',
  },
  {
    kanji: '手袋',
    kana: 'てぶくろ',
    romaji: 'tebukuro',
    meaning_bn: 'হ্যান্ড গ্লাভস / দস্তানা',
    meaning_en: 'gloves',
    category: 'food',
    example_ja: '盛り付けのときは手袋をつけます。',
    example_bn: 'খাবার সাজানোর সময় গ্লাভস পরুন।',
    example_en: 'Wear gloves when plating food.',
  },
  {
    kanji: '消毒',
    kana: 'しょうどく',
    romaji: 'shoudoku',
    meaning_bn: 'জীবাণুমুক্তকরণ / স্যানিটাইজেশন',
    meaning_en: 'disinfection / sterilization',
    category: 'food',
    example_ja: '手洗いのあと、アルコールで消毒します。',
    example_bn: 'হাত ধোয়ার পর অ্যালকোহল দিয়ে জীবাণুমুক্ত করুন।',
    example_en: 'Disinfect with alcohol after washing hands.',
  },

  // Workplace & Agriculture
  {
    kanji: '点検',
    kana: 'てんけん',
    romaji: 'tenken',
    meaning_bn: 'যান্ত্রিক পরীক্ষা ও নিরীক্ষা',
    meaning_en: 'inspection / checkup',
    category: 'work',
    example_ja: '作業前に機械の点検をします。',
    example_bn: 'কাজ শুরুর আগে মেশিন চেক করুন।',
    example_en: 'Inspect the machine before work.',
  },
  {
    kanji: '指示',
    kana: 'しじ',
    romaji: 'shiji',
    meaning_bn: 'কাজের নির্দেশ / নির্দেশনা',
    meaning_en: 'instruction / directions',
    category: 'work',
    example_ja: 'リーダーの指示に従ってください。',
    example_bn: 'দলনেতার নির্দেশনা অনুসরণ করুন।',
    example_en: 'Please follow the leader instructions.',
  },
  {
    kanji: '安全靴',
    kana: 'あんぜんぐつ',
    romaji: 'anzengutsu',
    meaning_bn: 'নিরাপত্তা জুতো (Safety Shoes)',
    meaning_en: 'safety shoes / steel-toe boots',
    category: 'work',
    example_ja: '現場では安全靴を履いてください。',
    example_bn: 'কাজের জায়গায় নিরাপত্তা জুতো পরুন।',
    example_en: 'Wear safety shoes at the worksite.',
  },
];

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [masteredIds, setMasteredIds] = useState([]);

  const filteredCards = VOCAB_DATA.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory]);

  const speakJapanese = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(randomIndex);
  };

  const toggleMastered = () => {
    const cardId = currentCard.kanji;
    if (masteredIds.includes(cardId)) {
      setMasteredIds((prev) => prev.filter((id) => id !== cardId));
    } else {
      setMasteredIds((prev) => [...prev, cardId]);
    }
    handleNext();
  };

  const isCurrentMastered = masteredIds.includes(currentCard?.kanji);

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumbs */}
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
        <span className="text-slate-900 dark:text-white font-bold">Vocab Flashcards</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-japan-red" />
          <span>JFT-Basic A2 &amp; SSW Vocabulary</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Daily Kanji &amp; Vocabulary Flashcards (単語特訓)
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Master high-frequency JFT-Basic words and workplace SSW terms with native audio pronunciation, Furigana toggle, and Bengali meanings.
        </p>
      </div>

      {/* Filter Tabs & Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All Words' },
            { key: 'daily', label: 'Everyday & Station' },
            { key: 'care', label: 'Caregiving (介護)' },
            { key: 'food', label: 'Food & Restaurant' },
            { key: 'work', label: 'Workplace & Safety' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === tab.key
                  ? 'bg-japan-red text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Furigana</span>
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Shuffle Cards"
          >
            <Shuffle className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Flashcard Main Area */}
      {currentCard && (
        <div className="space-y-6">
          {/* Card Container (Click to Flip) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[320px] sm:min-h-[380px] w-full"
          >
            <div
              className={`w-full h-full min-h-[320px] sm:min-h-[380px] rounded-3xl p-6 sm:p-10 border transition-all duration-500 shadow-2xl flex flex-col justify-between relative ${
                isFlipped
                  ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-japan-navy text-white border-slate-700'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Card Top Meta Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Card {currentIndex + 1} / {filteredCards.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentCard.kanji);
                    }}
                    className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-japan-red dark:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Play Audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {isFlipped ? 'Meaning Side' : 'Kanji Side'}
                  </span>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="text-center py-6 sm:py-8 space-y-4">
                {!isFlipped ? (
                  /* FRONT: Kanji & Furigana */
                  <div className="space-y-3">
                    {showFurigana && (
                      <div className="text-sm sm:text-lg font-bold text-japan-red dark:text-rose-400 tracking-widest font-mono">
                        {currentCard.kana} ({currentCard.romaji})
                      </div>
                    )}
                    <h2 className="text-4xl sm:text-7xl font-black tracking-tight font-sans">
                      {currentCard.kanji}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pt-2">
                      Click anywhere on card or press Space to flip ↺
                    </p>
                  </div>
                ) : (
                  /* BACK: Meaning in Bangla & English + Example Sentence */
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <div className="text-xl sm:text-3xl font-black text-amber-400">
                        {currentCard.meaning_bn}
                      </div>
                      <div className="text-sm sm:text-base text-slate-300 font-semibold">
                        {currentCard.meaning_en}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 max-w-lg mx-auto">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Sentence</div>
                      <div className="text-sm sm:text-base font-bold text-white">
                        {currentCard.example_ja}
                      </div>
                      <div className="text-xs text-rose-300 font-medium">
                        {currentCard.example_bn}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Bottom Progress Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1 font-bold">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap to flip</span>
                </span>

                {isCurrentMastered && (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mastered ✓</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={toggleMastered}
              className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                isCurrentMastered
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentMastered ? 'Mark Unmastered' : 'I Know This Word'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mastered Counter Pill */}
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Mastered {masteredIds.length} of {VOCAB_DATA.length} words ({Math.round((masteredIds.length / VOCAB_DATA.length) * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
