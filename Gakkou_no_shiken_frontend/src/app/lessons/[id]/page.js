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
import { getCurriculumLessonDetail, getCurriculumLessons } from '@/lib/api';

export default function LessonStudyPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id;

  const [lesson, setLesson] = useState(null);
  const [allSiblingLessons, setAllSiblingLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Study Display Options
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [languageMode, setLanguageMode] = useState('bn'); // 'en' | 'id' | 'bn' | 'ne' | 'vi' | 'tl' | 'hi'
  const STUDY_LANGS = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'id', label: 'ID', flag: '🇮🇩' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
    { code: 'vi', label: 'VI', flag: '🇻🇳' },
    { code: 'tl', label: 'TL', flag: '🇵🇭' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];
  const getLocalizedMeaning = (item) => {
    if (!item) return '';
    if (languageMode === 'en') return item.translations?.en || item.meaning_en || '';
    if (languageMode === 'bn') return item.translations?.bn || item.meaning_bn || item.meaning_en || '';
    return item.translations?.[languageMode] || item.meaning_en || '';
  };
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
          if (data?.lesson_type) {
            getCurriculumLessons({ type: data.lesson_type })
              .then((listRes) => {
                if (isMounted && Array.isArray(listRes?.lessons)) {
                  setAllSiblingLessons(listRes.lessons);
                }
              })
              .catch(() => {});
          }
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
    <div className="min-h-screen bg-[#FFF5E4] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Prev/Next Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#FFD1D1] dark:border-slate-800 pb-3.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-[#D94E5D] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/lessons" className="hover:text-[#D94E5D] transition-colors">
            Lessons Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-black truncate max-w-[160px] sm:max-w-none">
            {lesson.level} Lesson {lesson.lesson_number}
          </span>
        </nav>

        {/* Previous & Next Lesson Quick Jump Buttons */}
        <div className="flex items-center gap-1.5">
          {lesson.prev_lesson_id ? (
            <Link
              href={`/lessons/${lesson.prev_lesson_id}`}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#D94E5D] hover:border-[#FF9494] text-xs font-bold transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </Link>
          ) : (
            <span className="px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-[#FFD1D1]/50 dark:border-slate-800 text-slate-400 text-xs font-bold opacity-50 cursor-not-allowed flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </span>
          )}

          {lesson.next_lesson_id ? (
            <Link
              href={`/lessons/${lesson.next_lesson_id}`}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#D94E5D] hover:bg-[#BE3B4A] text-white text-xs font-black transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-[#FFD1D1]/50 dark:border-slate-800 text-slate-400 text-xs font-bold opacity-50 cursor-not-allowed flex items-center gap-1">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Light Sakura / Rich Dark Mode Header Card + 1-Tap Lesson Switcher */}
      <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#FFD1D1] dark:border-slate-800 p-4 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-wider uppercase bg-[#FFE3E1] dark:bg-slate-800 text-[#9F2B39] dark:text-[#FF9494] border border-[#FFD1D1] dark:border-slate-700">
                {lesson.level} • {isVocab ? 'Vocabulary' : 'Kanji'}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Lesson #{lesson.lesson_number}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isVocab
                ? `${items.length} words with Furigana, native Japanese audio & 7-language meanings.`
                : `${items.length} Kanji with Onyomi, Kunyomi, Romaji & 7-language meanings.`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-[#FFF5E4] dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-700 text-center">
              <div className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400">Total</div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {items.length}{' '}
                <span className="text-xs font-bold text-[#D94E5D]">{isVocab ? 'words' : 'kanji'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1-TAP HORIZONTAL LESSON SWITCHER (Jump directly to any lesson from here!) */}
        {allSiblingLessons.length > 1 && (
          <div className="pt-3 border-t border-[#FFE3E1] dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Jump to Any Lesson ({allSiblingLessons.length})</span>
              <Link href="/lessons" className="text-[#D94E5D] hover:underline">
                View All Hub →
              </Link>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {allSiblingLessons.map((sib) => {
                const isCurrent = String(sib.id) === String(lesson.id);
                return (
                  <Link
                    key={sib.id}
                    href={`/lessons/${sib.id}`}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap shrink-0 border ${
                      isCurrent
                        ? 'bg-[#D94E5D] text-white border-[#D94E5D] shadow-xs'
                        : 'bg-[#FFF5E4]/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-[#FFD1D1] dark:border-slate-700 hover:bg-[#FFE3E1] dark:hover:bg-slate-700'
                    }`}
                  >
                    {sib.level} L{sib.lesson_number}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Friendly & Dark-Mode Crisp Study Controls Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FFD1D1] dark:border-slate-800 shadow-xs space-y-3">
        {/* Row 1: View Mode + Reading Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#FFF5E4] dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-[#D94E5D] dark:text-[#FF9494] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('flashcards')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'flashcards'
                  ? 'bg-white dark:bg-slate-800 text-[#D94E5D] dark:text-[#FF9494] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isVocab && (
              <button
                onClick={() => setShowFurigana(!showFurigana)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  showFurigana
                    ? 'bg-[#FFE3E1] dark:bg-slate-800 text-[#9F2B39] dark:text-[#FF9494] border-[#FFD1D1] dark:border-slate-700'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Furigana</span>
              </button>
            )}

            <button
              onClick={() => setShowRomaji(!showRomaji)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                showRomaji
                  ? 'bg-[#FFE3E1] dark:bg-slate-800 text-[#9F2B39] dark:text-[#FF9494] border-[#FFD1D1] dark:border-slate-700'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>Romaji</span>
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Swipeable 7-Language Switcher + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5">
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-[#FFF5E4] dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800 text-xs font-bold scrollbar-none">
            {STUDY_LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguageMode(l.code)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  languageMode === l.code
                    ? 'bg-[#D94E5D] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#FFE3E1] dark:hover:bg-slate-800'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${items.length} items...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF5E4]/60 dark:bg-slate-900 border border-[#FFD1D1] dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#D94E5D]"
            />
          </div>
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
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {currentFlashcard.meaning_en}
                  </div>

                  {languageMode !== 'en' && getLocalizedMeaning(currentFlashcard) && (
                    <div className="inline-block px-4 py-2 rounded-2xl bg-[#FFE3E1] dark:bg-slate-800 border border-[#FFD1D1] dark:border-slate-700 text-[#9F2B39] dark:text-[#FFD1D1] font-bold text-base">
                      {getLocalizedMeaning(currentFlashcard)}
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
                  className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f1629] border border-[#FFD1D1] dark:border-slate-800 hover:border-[#FF9494] dark:hover:border-slate-600 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between gap-2.5 sm:gap-4 group"
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

                  {/* Meanings: English + Selected Language */}
                  <div className="pt-2 sm:pt-3 border-t border-[#FFE3E1] dark:border-slate-800/80 space-y-1">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {item.meaning_en}
                    </div>
                    {languageMode !== 'en' && getLocalizedMeaning(item) && (
                      <div className="text-[11px] sm:text-xs font-bold text-[#B83B4A] dark:text-[#FF9494] leading-snug">
                        {getLocalizedMeaning(item)}
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
      <div className="pt-6 border-t border-[#FFD1D1] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D94E5D] hover:bg-[#BE3B4A] text-white text-xs font-black shadow-sm transition-all self-start sm:self-auto"
          >
            <span>Proceed to Next Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
    </div>
  );
}
