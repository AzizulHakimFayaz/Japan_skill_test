'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Languages,
  Sparkles,
  Search,
  Volume2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Layers,
  GraduationCap,
  VolumeX,
  X,
  Filter,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { getCurriculumLessons, searchCurriculum } from '@/lib/api';

export default function CurriculumHubPage() {
  const [activeType, setActiveType] = useState('vocabulary'); // 'vocabulary' | 'kanji'
  const [activeLevel, setActiveLevel] = useState('ALL');       // 'ALL' | 'N5' | 'N4'
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  // Fetch Lessons from Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const params = {};
        if (activeType) params.type = activeType;
        if (activeLevel !== 'ALL') params.level = activeLevel;

        const data = await getCurriculumLessons(params);
        if (isMounted) {
          setLessons(data.lessons || []);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load curriculum lessons:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeType, activeLevel]);

  // Debounced Global Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchCurriculum(q);
        setSearchResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Audio Pronunciation Helper (Web Speech API)
  const playSpeech = (text, id) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/tools" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
          Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">Curriculum Lessons</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 dark:from-black dark:via-[#0c1020] dark:to-black text-white p-6 sm:p-10 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-japan-red" />
              <span>Minna no Nihongo &amp; JLPT N5/N4 Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Japanese Vocabulary &amp; Kanji Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Master all lesson-wise vocabulary and Kanji characters with audio pronunciation, Furigana, Romaji, and complete dual <span className="text-rose-300 font-bold">English</span> &amp; <span className="text-emerald-300 font-bold">Bengali (বাংলা)</span> translations. Powered by our cloud backend database for instant, lightning-fast study.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Vocab Lessons</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {stats?.total_vocab_lessons || 50} <span className="text-xs font-semibold text-rose-400">Lessons</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">1,802 Words</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Kanji Lessons</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {stats?.total_kanji_lessons || 30} <span className="text-xs font-semibold text-amber-400">Lessons</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">888 Characters</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">JLPT Levels</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">N5 &amp; N4</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">Beginner to A2</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Bilingual Support</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">EN + বাংলা</div>
              <div className="text-[11px] text-slate-400 mt-1">Native Audio TTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Type Tabs, Level Filters, Live Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Category Tabs: Vocabulary vs Kanji */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setActiveType('vocabulary')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeType === 'vocabulary'
                  ? 'bg-white dark:bg-slate-800 text-japan-red dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Vocabulary (語彙)</span>
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 font-mono">
                {stats?.total_vocab_lessons || 50}
              </span>
            </button>
            <button
              onClick={() => setActiveType('kanji')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeType === 'kanji'
                  ? 'bg-white dark:bg-slate-800 text-japan-red dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Kanji (漢字)</span>
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                {stats?.total_kanji_lessons || 30}
              </span>
            </button>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Levels' },
              { id: 'N5', label: 'JLPT N5' },
              { id: 'N4', label: 'JLPT N4' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setActiveLevel(lvl.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeLevel === lvl.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Instant Search 2,690+ Words & Kanji in English, Romaji, Hiragana or Bengali (যেমন: 'আমি', 'sensei', '先生')..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-japan-red/40 focus:border-japan-red transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Results Overlay (If user is searching) */}
      {searchQuery.trim().length >= 2 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Search Results for &ldquo;{searchQuery}&rdquo;
              </span>
              {searching ? (
                <span className="text-xs text-slate-400 animate-pulse">Searching database...</span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-japan-red">
                  {(searchResults?.vocab_count || 0) + (searchResults?.kanji_count || 0)} matches found
                </span>
              )}
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-500 hover:text-japan-red transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {/* Vocab Matches */}
          {searchResults?.vocabularies?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vocabulary Matches ({searchResults.vocabularies.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.vocabularies.map((v) => (
                  <div
                    key={`search-v-${v.id}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-japan-red/50 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-slate-900 dark:text-white font-japanese">
                            {v.word}
                          </span>
                          {v.furigana && v.furigana !== v.word && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({v.furigana})
                            </span>
                          )}
                        </div>
                        {v.romaji && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{v.romaji}</div>
                        )}
                      </div>
                      <button
                        onClick={() => playSpeech(v.speech || v.word, `search-${v.id}`)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-japan-red hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Listen to Japanese pronunciation"
                      >
                        <Volume2 className={`w-4 h-4 ${speakingId === `search-${v.id}` ? 'text-japan-red animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {v.meaning_en}
                      </div>
                      {v.meaning_bn && (
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 font-bengali">
                          {v.meaning_bn}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                        {v.level} L{v.lesson_number}
                      </span>
                      <Link
                        href={`/lessons/${v.lesson_id}`}
                        className="font-bold text-japan-red dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Lesson</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kanji Matches */}
          {searchResults?.kanjis?.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kanji Matches ({searchResults.kanjis.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.kanjis.map((k) => (
                  <div
                    key={`search-k-${k.id}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-japanese">
                          {k.character}
                        </span>
                        <div className="text-xs space-y-0.5">
                          {k.onyomi && (
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              On: <span className="font-semibold text-slate-800 dark:text-slate-200">{k.onyomi}</span>
                            </div>
                          )}
                          {k.kunyomi && (
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              Kun: <span className="font-semibold text-slate-800 dark:text-slate-200">{k.kunyomi}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => playSpeech(k.speech || k.character, `search-k-${k.id}`)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {k.meaning_en}
                      </div>
                      {k.meaning_bn && (
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 font-bengali">
                          {k.meaning_bn}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                        {k.level} L{k.lesson_number}
                      </span>
                      <Link
                        href={`/lessons/${k.lesson_id}`}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Lesson</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!searching && (!searchResults?.vocabularies?.length && !searchResults?.kanjis?.length) && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No vocabulary or Kanji characters matched &ldquo;{searchQuery}&rdquo;. Try another keyword.
            </div>
          )}
        </div>
      )}

      {/* Main Lessons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {activeType === 'vocabulary' ? 'Vocabulary Lessons' : 'Kanji Lessons'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {lessons.length} Available
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Click any lesson card to study words, audio, and Bengali meanings
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-850 animate-pulse p-6"
              />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No lessons found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No curriculum lessons matched the selected level filter. Try selecting &ldquo;All Levels&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const isN5 = lesson.level === 'N5';
              return (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="group relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-japan-red dark:hover:border-rose-500 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-4 overflow-hidden"
                >
                  {/* Accent Top Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                    isN5
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 group-hover:h-1.5'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 group-hover:h-1.5'
                  }`} />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wide ${
                        isN5
                          ? 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40'
                          : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40'
                      }`}>
                        {lesson.level}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Lesson {lesson.lesson_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span>{lesson.items_count}</span>
                      <span>{lesson.lesson_type === 'vocabulary' ? 'words' : 'kanji'}</span>
                    </div>
                  </div>

                  {/* Lesson Title */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>Dual English &amp; বাংলা</span>
                      <span>•</span>
                      <span>Native Audio</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-japan-red dark:group-hover:text-rose-400">
                    <span className="flex items-center gap-1">
                      <span>Start Learning</span>
                    </span>
                    <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/60 group-hover:text-japan-red transition-all">
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
