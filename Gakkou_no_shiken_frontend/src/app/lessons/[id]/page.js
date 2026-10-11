'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  Shuffle,
  Grid,
  List,
  Home,
  GraduationCap,
  Play,
  Pause,
} from 'lucide-react';
import { getCurriculumLessonDetail } from '@/lib/api';

export default function LessonStudyPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Study Display Options
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [languageMode, setLanguageMode] = useState('both'); // 'both' | 'en' | 'bn'
  const [viewMode, setViewMode] = useState('grid');         // 'grid' | 'table' | 'flashcards'
  const [speechRate, setSpeechRate] = useState(0.85);        // 0.85 or 1.0
  const [searchFilter, setSearchFilter] = useState('');

  // Audio State
  const [speakingId, setSpeakingId] = useState(null);

  // Bookmarks (Saved in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load Bookmarks from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('gakkou_curriculum_bookmarks');
      if (saved) setBookmarkedIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleBookmark = (itemId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      try {
        localStorage.setItem('gakkou_curriculum_bookmarks', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  // Fetch Lesson Detail
  useEffect(() => {
    if (!lessonId) return;
    let isMounted = true;
    async function loadLesson() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCurriculumLessonDetail(lessonId);
        if (isMounted) {
          setLesson(data);
          setFlashcardIndex(0);
          setIsFlipped(false);
        }
      } catch (err) {
        if (isMounted) setError('Unable to load lesson details. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLesson();
    return () => { isMounted = false; };
  }, [lessonId]);

  // Items list (Vocabulary or Kanji)
  const isVocab = lesson?.lesson_type === 'vocabulary';
  const rawItems = isVocab ? (lesson?.vocabularies || []) : (lesson?.kanjis || []);

  // Filtered items based on in-lesson search
  const items = useMemo(() => {
    if (!searchFilter.trim()) return rawItems;
    const q = searchFilter.toLowerCase().trim();
    return rawItems.filter((item) => {
      if (isVocab) {
        return (
          (item.word && item.word.toLowerCase().includes(q)) ||
          (item.furigana && item.furigana.toLowerCase().includes(q)) ||
          (item.romaji && item.romaji.toLowerCase().includes(q)) ||
          (item.meaning_en && item.meaning_en.toLowerCase().includes(q)) ||
          (item.meaning_bn && item.meaning_bn.toLowerCase().includes(q))
        );
      } else {
        return (
          (item.character && item.character.toLowerCase().includes(q)) ||
          (item.onyomi && item.onyomi.toLowerCase().includes(q)) ||
          (item.kunyomi && item.kunyomi.toLowerCase().includes(q)) ||
          (item.romaji && item.romaji.toLowerCase().includes(q)) ||
          (item.meaning_en && item.meaning_en.toLowerCase().includes(q)) ||
          (item.meaning_bn && item.meaning_bn.toLowerCase().includes(q))
        );
      }
    });
  }, [rawItems, searchFilter, isVocab]);

  // Audio Pronunciation Helper (Web Speech API ja-JP)
  const playSpeech = (text, id) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = speechRate;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Keyboard navigation for Flashcard Mode
  useEffect(() => {
    if (viewMode !== 'flashcards' || items.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setFlashcardIndex((prev) => (prev + 1) % items.length);
        setIsFlipped(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFlashcardIndex((prev) => (prev - 1 + items.length) % items.length);
        setIsFlipped(false);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, items.length]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 sm:h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-japan-red mx-auto flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lesson Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This lesson could not be found or has not been loaded.'}</p>
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-japan-red text-white text-sm font-bold shadow-md hover:bg-red-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum Hub</span>
        </Link>
      </div>
    );
  }

  const currentFlashcard = items[flashcardIndex] || null;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-japan-red transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/lessons" className="hover:text-japan-red transition-colors">
            Curriculum
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
            {lesson.level} Lesson {lesson.lesson_number}
          </span>
        </nav>

        {/* Previous & Next Lesson Quick Jump Buttons */}
        <div className="flex items-center gap-2">
          {lesson.prev_lesson_id ? (
            <Link
              href={`/lessons/${lesson.prev_lesson_id}`}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red hover:border-japan-red text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Lesson</span>
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 text-slate-400 text-xs font-bold opacity-50 cursor-not-allowed flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </span>
          )}

          {lesson.next_lesson_id ? (
            <Link
              href={`/lessons/${lesson.next_lesson_id}`}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red hover:border-japan-red text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 text-slate-400 text-xs font-bold opacity-50 cursor-not-allowed flex items-center gap-1">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 dark:from-black dark:via-[#0b1022] dark:to-black text-white p-5 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider uppercase ${
                lesson.level === 'N5'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {lesson.level} • {isVocab ? 'Vocabulary' : 'Kanji'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lesson #{lesson.lesson_number}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {isVocab
                ? `Containing ${items.length} words with Furigana, native Japanese audio, English, and Bengali meanings.`
                : `Containing ${items.length} Kanji characters with Onyomi, Kunyomi, Romaji, and Bengali translations.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xs text-slate-300 font-medium">Total Items</div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {items.length} <span className="text-xs font-normal text-rose-300">{isVocab ? 'words' : 'kanji'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Study Controls & Toggles Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Modes */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-japan-red shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>
            <button
              onClick={() => setViewMode('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'flashcards'
                  ? 'bg-white dark:bg-slate-800 text-japan-red shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flashcard Mode</span>
            </button>
          </div>

          {/* Furigana & Romaji Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {isVocab && (
              <button
                onClick={() => setShowFurigana(!showFurigana)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showFurigana
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                    : 'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
                title="Toggle Furigana reading above words"
              >
                {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Furigana: {showFurigana ? 'ON' : 'OFF'}</span>
              </button>
            )}

            <button
              onClick={() => setShowRomaji(!showRomaji)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showRomaji
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Romaji: {showRomaji ? 'ON' : 'OFF'}</span>
            </button>

            {/* Language Meaning Filter */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLanguageMode('both')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  languageMode === 'both' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Both EN + বাংলা
              </button>
              <button
                onClick={() => setLanguageMode('bn')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  languageMode === 'bn' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                বাংলা Only
              </button>
              <button
                onClick={() => setLanguageMode('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  languageMode === 'en' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                English Only
              </button>
            </div>
          </div>
        </div>

        {/* In-lesson search filter */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Filter ${items.length} words in this lesson (Japanese, English, or বাংলা)...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-japan-red/40"
          />
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Flashcard Flip Mode */}
      {viewMode === 'flashcards' && currentFlashcard && (
        <div className="space-y-6 max-w-2xl mx-auto py-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              Card {flashcardIndex + 1} of {items.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Space/Click to Flip • Left/Right to Navigate
              </span>
              <button
                onClick={() => {
                  const rand = Math.floor(Math.random() * items.length);
                  setFlashcardIndex(rand);
                  setIsFlipped(false);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-japan-red transition-colors cursor-pointer"
                title="Shuffle card"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[300px] sm:min-h-[360px] p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-japan-red/60 shadow-xl cursor-pointer flex flex-col items-center justify-center text-center relative transition-all group select-none"
          >
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(currentFlashcard.id);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-japan-red transition-colors cursor-pointer"
            >
              {bookmarkedIds.has(currentFlashcard.id) ? (
                <BookmarkCheck className="w-5 h-5 text-japan-red fill-japan-red" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            {/* Audio Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSpeech(
                  isVocab
                    ? (currentFlashcard.speech || currentFlashcard.word)
                    : (currentFlashcard.speech || currentFlashcard.character),
                  `fc-${currentFlashcard.id}`
                );
              }}
              className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
              title="Play Japanese Audio"
            >
              <Volume2 className={`w-5 h-5 ${speakingId === `fc-${currentFlashcard.id}` ? 'text-japan-red animate-pulse' : ''}`} />
            </button>

            {!isFlipped ? (
              /* Front of Flashcard */
              <div className="space-y-4 my-auto">
                {isVocab ? (
                  <>
                    {showFurigana && currentFlashcard.furigana && currentFlashcard.furigana !== currentFlashcard.word && (
                      <div className="text-base text-rose-500 font-japanese font-semibold">
                        {currentFlashcard.furigana}
                      </div>
                    )}
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-japanese tracking-tight">
                      {currentFlashcard.word}
                    </div>
                    {showRomaji && currentFlashcard.romaji && (
                      <div className="text-sm font-mono text-slate-400 mt-1">
                        {currentFlashcard.romaji}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white font-japanese tracking-tight">
                      {currentFlashcard.character}
                    </div>
                    {currentFlashcard.onyomi && (
                      <div className="text-sm text-slate-400 font-japanese">
                        On: <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentFlashcard.onyomi}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="text-xs text-slate-400 font-semibold pt-4 flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click anywhere to reveal meaning</span>
                </div>
              </div>
            ) : (
              /* Back of Flashcard */
              <div className="space-y-4 my-auto animate-fade-in">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-japanese">
                  {isVocab ? currentFlashcard.word : currentFlashcard.character}
                </div>

                <div className="space-y-3 pt-2">
                  {(languageMode === 'both' || languageMode === 'en') && (
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {currentFlashcard.meaning_en}
                    </div>
                  )}

                  {(languageMode === 'both' || languageMode === 'bn') && currentFlashcard.meaning_bn && (
                    <div className="inline-block px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-base font-bengali">
                      {currentFlashcard.meaning_bn}
                    </div>
                  )}

                  {!isVocab && (
                    <div className="text-xs space-y-1 text-slate-400 pt-2">
                      {currentFlashcard.kunyomi && (
                        <div>Kun: <span className="font-semibold text-slate-700 dark:text-slate-300 font-japanese">{currentFlashcard.kunyomi}</span></div>
                      )}
                      {currentFlashcard.romaji && (
                        <div className="font-mono">{currentFlashcard.romaji}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-japan-red font-semibold pt-4 flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to flip back</span>
                </div>
              </div>
            )}
          </div>

          {/* Flashcard Next / Previous Navigation Bar */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev - 1 + items.length) % items.length);
                setIsFlipped(false);
              }}
              className="flex-1 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isFlipped ? 'Show Word' : 'Show Meaning'}
            </button>
            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev + 1) % items.length);
                setIsFlipped(false);
              }}
              className="flex-1 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Card Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {items.map((item, idx) => {
              const isFav = bookmarkedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-japan-red/60 dark:hover:border-rose-500/60 transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between gap-2.5 sm:gap-4 group"
                >
                  {/* Top card row: order number, audio button, bookmark */}
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
                      #{String(item.order_index || idx + 1).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() =>
                          playSpeech(
                            isVocab ? (item.speech || item.word) : (item.speech || item.character),
                            `item-${item.id}`
                          )
                        }
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:text-japan-red hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Listen to Japanese pronunciation"
                      >
                        <Volume2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${speakingId === `item-${item.id}` ? 'text-japan-red animate-pulse' : ''}`} />
                      </button>

                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-japan-red hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Bookmark this word"
                      >
                        {isFav ? (
                          <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-japan-red fill-japan-red" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Japanese Character / Word Display */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {isVocab ? (
                      <>
                        <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-japanese tracking-tight leading-tight">
                          {item.word}
                        </div>
                        {showFurigana && item.furigana && item.furigana !== item.word && (
                          <div className="text-[11px] sm:text-xs font-japanese font-semibold text-rose-500 dark:text-rose-400">
                            {item.furigana}
                          </div>
                        )}
                        {showRomaji && item.romaji && (
                          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                            {item.romaji}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 sm:gap-3">
                          <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-japanese">
                            {item.character}
                          </span>
                          {showRomaji && item.romaji && (
                            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                              {item.romaji}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs space-y-0.5 pt-1">
                          {item.onyomi && (
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-japanese">
                              On: <span className="font-semibold text-slate-800 dark:text-slate-200">{item.onyomi}</span>
                            </div>
                          )}
                          {item.kunyomi && (
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-japanese">
                              Kun: <span className="font-semibold text-slate-800 dark:text-slate-200">{item.kunyomi}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Meanings: English & Bengali */}
                  <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    {(languageMode === 'both' || languageMode === 'en') && (
                      <div className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {item.meaning_en}
                      </div>
                    )}
                    {(languageMode === 'both' || languageMode === 'bn') && item.meaning_bn && (
                      <div className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 font-bengali leading-snug">
                        {item.meaning_bn}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No items in this lesson matched &ldquo;{searchFilter}&rdquo;.
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation: Return to Hub or Go to Next Lesson */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-japan-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Lessons Overview</span>
        </Link>

        {lesson.next_lesson_id && (
          <Link
            href={`/lessons/${lesson.next_lesson_id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-japan-red text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all self-start sm:self-auto"
          >
            <span>Proceed to Next Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
