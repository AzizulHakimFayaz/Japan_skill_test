'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  List,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import VOCAB_DATA from './vocabData';

const CATEGORY_TABS = [
  { key: 'all', label: 'All Words', emoji: '📚' },
  { key: 'daily', label: 'Everyday & Station', emoji: '🚃' },
  { key: 'care', label: 'Caregiving (介護)', emoji: '🏥' },
  { key: 'food', label: 'Food & Restaurant', emoji: '🍱' },
  { key: 'work', label: 'Workplace & Safety', emoji: '⚙️' },
  { key: 'health', label: 'Health & Body', emoji: '💊' },
  { key: 'jlpt', label: 'JLPT Study', emoji: '📖' },
  { key: 'visa', label: 'Visa & Immigration', emoji: '🛂' },
];

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [masteredIds, setMasteredIds] = useState([]);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedListItem, setExpandedListItem] = useState(null);

  const filteredCards = useMemo(() => {
    let cards = VOCAB_DATA.filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    });

    if (viewMode === 'list' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      cards = cards.filter(
        (item) =>
          item.kanji.toLowerCase().includes(q) ||
          item.kana.toLowerCase().includes(q) ||
          item.romaji.toLowerCase().includes(q) ||
          item.meaning_en.toLowerCase().includes(q) ||
          item.meaning_bn.toLowerCase().includes(q)
      );
    }

    return cards;
  }, [selectedCategory, viewMode, searchQuery]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setExpandedListItem(null);
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

  const toggleMastered = (cardKanji) => {
    const cardId = cardKanji || currentCard?.kanji;
    if (!cardId) return;
    if (masteredIds.includes(cardId)) {
      setMasteredIds((prev) => prev.filter((id) => id !== cardId));
    } else {
      setMasteredIds((prev) => [...prev, cardId]);
      if (viewMode === 'card') handleNext();
    }
  };

  const isCurrentMastered = masteredIds.includes(currentCard?.kanji);

  const getCategoryCount = (catKey) => {
    if (catKey === 'all') return VOCAB_DATA.length;
    return VOCAB_DATA.filter((v) => v.category === catKey).length;
  };

  const getCategoryColor = (cat) => {
    const colors = {
      daily: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      care: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      food: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      work: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      health: 'text-red-400 bg-red-500/10 border-red-500/20',
      jlpt: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      visa: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    };
    return colors[cat] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getCategoryLabel = (cat) => {
    const found = CATEGORY_TABS.find((t) => t.key === cat);
    return found ? `${found.emoji} ${found.label}` : cat;
  };

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
          Master {VOCAB_DATA.length} high-frequency JFT-Basic words and workplace SSW terms with native audio pronunciation, Furigana toggle, and Bengali meanings.
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg">📚 {VOCAB_DATA.length} Words</span>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg">✅ {masteredIds.length} Mastered</span>
          <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg">🎯 {VOCAB_DATA.length - masteredIds.length} Remaining</span>
        </div>
      </div>

      {/* Filter Tabs, Options & View Toggle */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === tab.key
                    ? 'bg-japan-red text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  selectedCategory === tab.key
                    ? 'bg-white/20'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {getCategoryCount(tab.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Furigana</span>
            </button>

            {viewMode === 'card' && (
              <button
                onClick={handleShuffle}
                className="p-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Shuffle Cards"
              >
                <Shuffle className="w-4 h-4 text-amber-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== CARD VIEW ========== */}
      {viewMode === 'card' && currentCard && (
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

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${getCategoryColor(currentCard.category)}`}>
                    {getCategoryLabel(currentCard.category)}
                  </span>

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
              onClick={() => toggleMastered()}
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

      {/* ========== LIST VIEW ========== */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kanji, kana, romaji, English or Bengali..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-japan-red/50 focus:border-japan-red/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {filteredCards.length} of {VOCAB_DATA.length} words
            </span>
            <span className="text-xs font-bold text-emerald-500">
              {masteredIds.length} mastered
            </span>
          </div>

          {/* Word List */}
          <div className="space-y-2">
            {filteredCards.map((item, index) => {
              const isMastered = masteredIds.includes(item.kanji);
              const isExpanded = expandedListItem === `${item.kanji}-${index}`;

              return (
                <div
                  key={`${item.kanji}-${index}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isMastered
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                  }`}
                >
                  {/* Collapsed Row */}
                  <div
                    onClick={() => setExpandedListItem(isExpanded ? null : `${item.kanji}-${index}`)}
                    className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Index */}
                    <span className="text-[10px] font-mono font-bold text-slate-400 w-7 text-right shrink-0">
                      {index + 1}
                    </span>

                    {/* Kanji */}
                    <div className="w-16 sm:w-20 shrink-0 text-center">
                      <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {item.kanji}
                      </div>
                      {showFurigana && (
                        <div className="text-[10px] font-bold text-japan-red dark:text-rose-400 font-mono">
                          {item.kana}
                        </div>
                      )}
                    </div>

                    {/* Meaning */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.meaning_en}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.meaning_bn}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${getCategoryColor(item.category)}`}>
                      {CATEGORY_TABS.find((t) => t.key === item.category)?.emoji}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(item.kanji);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-japan-red dark:text-rose-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Play Audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMastered(item.kanji);
                        }}
                        className={`p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'
                        }`}
                        title={isMastered ? 'Unmark Mastered' : 'Mark as Mastered'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        {/* Pronunciation */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pronunciation</div>
                          <div className="text-sm font-bold text-japan-red dark:text-rose-400 font-mono">
                            {item.kana} ({item.romaji})
                          </div>
                        </div>

                        {/* Category */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</div>
                          <div className={`text-sm font-bold ${getCategoryColor(item.category).split(' ')[0]}`}>
                            {getCategoryLabel(item.category)}
                          </div>
                        </div>

                        {/* Example Sentence */}
                        <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Example Sentence</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.example_ja}
                          </div>
                          <div className="text-xs text-japan-red dark:text-rose-300 font-medium">
                            {item.example_bn}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.example_en}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🔍</div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                No words found matching &quot;{searchQuery}&quot;
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-japan-red hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Mastered Counter (List View) */}
          <div className="text-center pt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Mastered {masteredIds.length} of {VOCAB_DATA.length} words ({Math.round((masteredIds.length / VOCAB_DATA.length) * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
