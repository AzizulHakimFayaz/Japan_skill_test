'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Search,
  ChevronRight,
  ArrowRight,
  Volume2,
  Globe,
  Layers,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  getLearnTopics,
  getCurriculumLessons,
  searchCurriculum,
  getBooks,
} from '@/lib/api';

const STUDY_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

const LEARN_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'basics', label: 'Basics & Scripts' },
  { id: 'kanji', label: 'Kanji' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'daily_life', label: 'Daily Life' },
  { id: 'travel', label: 'Travel & Places' },
];

const JFT_NOTES_CARDS = [
  {
    title: 'Essential Japanese Particles (A2)',
    desc: 'は vs が, に vs で, を, へ, から/まで with clear JFT examples.',
    href: '/guides/essential-japanese-particles-guide-a2',
    badge: 'Grammar Note',
    icon: '文',
  },
  {
    title: '30-Day JFT-Basic Study Plan',
    desc: 'Day-by-day preparation roadmap to score 200/250+ on CBT.',
    href: '/guides/jft-basic-30-day-study-plan',
    badge: 'Study Plan',
    icon: '計',
  },
  {
    title: 'Listening Comprehension Strategy',
    desc: 'How to catch key Japanese keywords on the first audio playback.',
    href: '/guides/jft-basic-listening-comprehension-strategy',
    badge: 'Listening',
    icon: '聞',
  },
  {
    title: 'Interactive Particle Quiz & Flashcards',
    desc: 'Drill particles and review daily vocabulary interactively.',
    href: '/tools/particle-quiz',
    badge: 'Practice Drill',
    icon: '練',
  },
];

const SSW_SECTOR_GUIDES = [
  {
    title: 'Nursing Care (Kaigo) Exam Guide',
    desc: 'Key caregiving terminology, Japanese nursing care concepts & CBT prep.',
    href: '/guides/ssw-nursing-care-kaigo-exam-guide',
    badge: 'Kaigo • 介護',
    icon: '介',
  },
  {
    title: 'Food Service & Restaurant Guide',
    desc: 'Hygiene control (HACCP), kitchen safety & customer service Japanese.',
    href: '/guides/ssw-food-service-restaurant-exam-guide',
    badge: 'Food • 外食',
    icon: '食',
  },
  {
    title: 'Agriculture & Farming Exam Guide',
    desc: 'Crop cultivation, livestock care & agricultural machinery terminology.',
    href: '/guides/ssw-agriculture-farming-exam-guide',
    badge: 'Agri • 農業',
    icon: '農',
  },
  {
    title: 'SSW Skill Test Complete Overview',
    desc: 'All 14 SSW sectors, Prometric booking & exam pass criteria.',
    href: '/guides/ssw-skill-test-guide',
    badge: 'All Sectors',
    icon: '技',
  },
];

export default function LessonsHubPage() {
  // 3 Main Pillars: 'learn' | 'jft' | 'ssw'
  const [activePillar, setActivePillar] = useState('learn');
  const [studyLang, setStudyLang] = useState('en');

  // Pillar 1: Learn Japanese Topics
  const [learnTopics, setLearnTopics] = useState([]);
  const [learnTotals, setLearnTotals] = useState({ topics: 23, lessons: 115, words: 2237 });
  const [learnCategory, setLearnCategory] = useState('all');
  const [learnSearch, setLearnSearch] = useState('');
  const [learnLoading, setLearnLoading] = useState(true);

  // Pillar 2: JFT-Basic Lessons & Notes (Minna no Nihongo Vocab + Kanji)
  const [jftSubTab, setJftSubTab] = useState('vocabulary'); // 'vocabulary' | 'kanji' | 'notes'
  const [curriculumLessons, setCurriculumLessons] = useState([]);
  const [curriculumStats, setCurriculumStats] = useState(null);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [jftSearch, setJftSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  // Pillar 3: SSW Related Lessons & JAC Books
  const [sswBooks, setSswBooks] = useState([]);
  const [sswCategory, setSswCategory] = useState('all');
  const [sswLoading, setSswLoading] = useState(false);

  // Load Pillar 1 (Learn Japanese Topics)
  useEffect(() => {
    let active = true;
    setLearnLoading(true);
    getLearnTopics({ category: learnCategory, search: learnSearch.trim() })
      .then((data) => {
        if (!active) return;
        setLearnTopics(data?.topics || []);
        if (data?.totals) setLearnTotals(data.totals);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLearnLoading(false);
      });
    return () => {
      active = false;
    };
  }, [learnCategory, learnSearch]);

  // Load Pillar 2 (JFT Curriculum Lessons) when switched to JFT
  useEffect(() => {
    if (activePillar !== 'jft' || jftSubTab === 'notes') return;
    let active = true;
    setCurriculumLoading(true);
    getCurriculumLessons({ type: jftSubTab })
      .then((data) => {
        if (!active) return;
        setCurriculumLessons(data?.lessons || []);
        if (data?.stats) setCurriculumStats(data.stats);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCurriculumLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activePillar, jftSubTab]);

  // Debounced Curriculum Search
  useEffect(() => {
    if (activePillar !== 'jft') return;
    const q = jftSearch.trim();
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(() => {
      searchCurriculum(q)
        .then((res) => setSearchResults(res))
        .catch(() => {});
    }, 280);
    return () => clearTimeout(t);
  }, [activePillar, jftSearch]);

  // Load Pillar 3 (SSW Books) when switched to SSW
  useEffect(() => {
    if (activePillar !== 'ssw') return;
    let active = true;
    setSswLoading(true);
    getBooks({ category: sswCategory })
      .then((data) => {
        if (!active) return;
        setSswBooks(data?.books || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSswLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activePillar, sswCategory]);

  const playSpeech = (text, id) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(id);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };

  const n5Lessons = useMemo(
    () => curriculumLessons.filter((l) => l.level === 'N5'),
    [curriculumLessons]
  );
  const n4Lessons = useMemo(
    () => curriculumLessons.filter((l) => l.level === 'N4'),
    [curriculumLessons]
  );

  return (
    <div className="min-h-screen bg-[#F9F5F6] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      {/* =====================================================================
          HERO & 3-PILLAR SWITCHER (Learn Japanese | JFT Lessons & Notes | SSW)
         ===================================================================== */}
      <section className="border-b border-[#FDCEDF] dark:border-slate-800 bg-gradient-to-b from-[#F8E8EE]/75 via-[#F9F5F6] to-[#F9F5F6] dark:from-[#120d14] dark:to-[#060913]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900 border border-[#FDCEDF] dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-[#9E2B54] dark:text-[#F2BED1]">
                <Sparkles className="w-3.5 h-3.5 text-[#C23B6B]" />
                <span>Structured Japanese Curriculum • 7 Languages</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Gakkou <span className="text-[#C23B6B]">Lessons Hub</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300">
                Learn Japanese step-by-step by topic and day, master JFT-Basic Minna no Nihongo lessons &amp; study notes, or prepare for SSW sector exams.
              </p>
            </div>

            {/* 7-Language Meaning Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#C23B6B]" /> Preferred Meaning Language
              </span>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {STUDY_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setStudyLang(lang.code)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap border ${
                      studyLang === lang.code
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 MAIN PILLAR TABS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActivePillar('learn')}
              className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                activePillar === 'learn'
                  ? 'bg-[#C23B6B] text-white border-[#C23B6B] shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1]'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activePillar === 'learn'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F8E8EE] dark:bg-slate-800 text-[#C23B6B]'
                }`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black leading-tight truncate">
                  Learn Japanese
                </div>
                <div
                  className={`text-[10px] sm:text-xs font-semibold truncate ${
                    activePillar === 'learn' ? 'text-white/85' : 'text-slate-500'
                  }`}
                >
                  {learnTotals.topics} Topics • {learnTotals.lessons} Parts
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar('jft')}
              className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                activePillar === 'jft'
                  ? 'bg-[#C23B6B] text-white border-[#C23B6B] shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1]'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activePillar === 'jft'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F8E8EE] dark:bg-slate-800 text-[#C23B6B]'
                }`}
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black leading-tight truncate">
                  JFT Lessons &amp; Notes
                </div>
                <div
                  className={`text-[10px] sm:text-xs font-semibold truncate ${
                    activePillar === 'jft' ? 'text-white/85' : 'text-slate-500'
                  }`}
                >
                  80 Units • Grammar Notes
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActivePillar('ssw')}
              className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                activePillar === 'ssw'
                  ? 'bg-[#C23B6B] text-white border-[#C23B6B] shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1]'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activePillar === 'ssw'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F8E8EE] dark:bg-slate-800 text-[#C23B6B]'
                }`}
              >
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black leading-tight truncate">
                  SSW Lessons
                </div>
                <div
                  className={`text-[10px] sm:text-xs font-semibold truncate ${
                    activePillar === 'ssw' ? 'text-white/85' : 'text-slate-500'
                  }`}
                >
                  26 Textbooks &amp; Guides
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ===================================================================
            PILLAR 1: LEARN JAPANESE (23 TOPICS -> DAY/PART LESSONS)
           =================================================================== */}
        {activePillar === 'learn' && (
          <div className="space-y-6">
            {/* Category Filter Strip + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {LEARN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setLearnCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap border ${
                      learnCategory === cat.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={learnSearch}
                  onChange={(e) => setLearnSearch(e.target.value)}
                  placeholder="Search topics (Hiragana, Food...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#FDCEDF] dark:border-slate-700 focus:border-[#C23B6B] text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {learnLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-32 rounded-2xl bg-white/80 dark:bg-slate-900 animate-pulse border border-[#FDCEDF]" />
                ))}
              </div>
            ) : learnTopics.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#FDCEDF] p-12 text-center space-y-2">
                <Layers className="w-10 h-10 text-[#F2BED1] mx-auto" />
                <h3 className="text-base font-black">No topics found</h3>
                <p className="text-xs text-slate-500">Try clearing your search or selecting All Topics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {learnTopics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/lessons/learn/${topic.slug}?lang=${studyLang}`}
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] hover:bg-[#F9F5F6]/40 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
                  >
                    {/* Japanese Glyph Tile */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F8E8EE] dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 flex items-center justify-center text-xl sm:text-2xl font-black text-[#B53562] dark:text-[#F2BED1] shrink-0 group-hover:bg-[#C23B6B] group-hover:text-white transition-colors">
                      {topic.icon_text || '日'}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] transition-colors truncate">
                          {topic.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#C23B6B] group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1.5 text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-[#F9F5F6] dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 text-[#8A2247] dark:text-[#FDCEDF]">
                          {topic.lesson_count} {topic.lesson_count === 1 ? 'Part' : 'Parts / Days'}
                        </span>
                        <span>•</span>
                        <span>{topic.word_count} words</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PILLAR 2: JFT-BASIC LESSONS & STUDY NOTES (Minna no Nihongo + Kanji + Notes)
           =================================================================== */}
        {activePillar === 'jft' && (
          <div className="space-y-6">
            {/* Sub-Tabs + Global Word Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="grid grid-cols-3 sm:flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setJftSubTab('vocabulary')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    jftSubTab === 'vocabulary'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700'
                  }`}
                >
                  Minna Vocab (50)
                </button>
                <button
                  type="button"
                  onClick={() => setJftSubTab('kanji')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    jftSubTab === 'kanji'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700'
                  }`}
                >
                  Kanji Units (30)
                </button>
                <button
                  type="button"
                  onClick={() => setJftSubTab('notes')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    jftSubTab === 'notes'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700'
                  }`}
                >
                  Grammar &amp; Notes
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jftSearch}
                  onChange={(e) => setJftSearch(e.target.value)}
                  placeholder="Search word, kanji, or meaning..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#FDCEDF] dark:border-slate-700 focus:border-[#C23B6B] text-xs font-semibold outline-none"
                />
                {jftSearch && (
                  <button
                    type="button"
                    onClick={() => setJftSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Instant Word Search Results */}
            {searchResults && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#F2BED1] p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black">
                    Search Results for &ldquo;{searchResults.query}&rdquo; ({(searchResults.vocab_count || 0) + (searchResults.kanji_count || 0)})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(searchResults.vocabularies || []).slice(0, 12).map((v) => (
                    <div
                      key={`v-${v.id}`}
                      className="rounded-xl bg-[#F9F5F6]/70 dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {v.word}{' '}
                          <span className="text-xs font-semibold text-slate-500">({v.furigana})</span>
                        </div>
                        <div className="text-xs text-[#8A2247] dark:text-[#FDCEDF] font-bold truncate">
                          {v.meaning_en} {v.meaning_bn ? `• ${v.meaning_bn}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => playSpeech(v.word, `sv-${v.id}`)}
                        className={`p-2 rounded-lg border shrink-0 cursor-pointer ${
                          speakingId === `sv-${v.id}`
                            ? 'bg-[#C23B6B] text-white border-[#C23B6B]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 border-[#FDCEDF]'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Sub-Tab */}
            {jftSubTab === 'notes' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {JFT_NOTES_CARDS.map((note) => (
                  <Link
                    key={note.href}
                    href={note.href}
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] p-5 flex items-start gap-4 shadow-2xs hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#F8E8EE] dark:bg-slate-800 border border-[#FDCEDF] flex items-center justify-center text-xl font-black text-[#B53562] shrink-0">
                      {note.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#F9F5F6] border border-[#FDCEDF] text-[10px] font-black text-[#8A2247]">
                        {note.badge}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B]">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{note.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#C23B6B] shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            ) : curriculumLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-28 rounded-2xl bg-white/80 dark:bg-slate-900 animate-pulse border border-[#FDCEDF]" />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Book I: N5 / JFT-Basic */}
                {n5Lessons.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {jftSubTab === 'vocabulary' ? 'Book I • Minna no Nihongo (Lessons 1–25)' : 'N5 Essential Kanji (Lessons 1–10)'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-black">
                        JLPT N5 • JFT-Basic
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {n5Lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] p-4 shadow-2xs hover:shadow-md transition flex items-start gap-3.5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#F8E8EE] dark:bg-slate-800 text-[#9E2B54] dark:text-[#F2BED1] font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-[#C23B6B] group-hover:text-white transition">
                            {lesson.lesson_number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] truncate">
                              {lesson.title}
                            </div>
                            {lesson.title_ja && (
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {lesson.title_ja}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                              <span className="text-slate-500">
                                {lesson.items_count || 0} {jftSubTab === 'vocabulary' ? 'words' : 'kanji'}
                              </span>
                              <span className="text-[#C23B6B] font-black">Study →</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book II: N4 */}
                {n4Lessons.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {jftSubTab === 'vocabulary' ? 'Book II • Minna no Nihongo (Lessons 26–50)' : 'N4 Essential Kanji (Lessons 11–30)'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-[#FDCEDF] border border-[#FDCEDF] text-[10px] font-black">
                        JLPT N4 • SSW Ready
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {n4Lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] p-4 shadow-2xs hover:shadow-md transition flex items-start gap-3.5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-[#C23B6B] transition">
                            {lesson.lesson_number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] truncate">
                              {lesson.title}
                            </div>
                            {lesson.title_ja && (
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {lesson.title_ja}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                              <span className="text-slate-500">
                                {lesson.items_count || 0} {jftSubTab === 'vocabulary' ? 'words' : 'kanji'}
                              </span>
                              <span className="text-[#C23B6B] font-black">Study →</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PILLAR 3: SSW RELATED LESSONS & OFFICIAL JAC TEXTBOOKS
           =================================================================== */}
        {activePillar === 'ssw' && (
          <div className="space-y-8">
            {/* SSW Sector Study Guides */}
            <div className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                SSW Sector Study Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {SSW_SECTOR_GUIDES.map((g) => (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#F8E8EE] dark:bg-slate-800 text-[#B53562] font-black text-lg flex items-center justify-center">
                          {g.icon}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#F9F5F6] border border-[#FDCEDF] text-[10px] font-black text-[#8A2247]">
                          {g.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B]">
                        {g.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {g.desc}
                      </p>
                    </div>
                    <span className="text-xs font-black text-[#C23B6B]">Read Guide →</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Official SSW / JAC Textbooks */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Official SSW / JAC Study Textbooks &amp; Audio Reader
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive PDF textbooks with Japanese audio explanations across multiple languages.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Books' },
                    { id: 'civil', label: 'Civil Eng.' },
                    { id: 'architecture', label: 'Architecture' },
                    { id: 'lifeline', label: 'Lifeline' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSswCategory(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer whitespace-nowrap border ${
                        sswCategory === c.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                          : 'bg-white dark:bg-slate-900 text-slate-700 border-[#FDCEDF]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {sswLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-32 rounded-2xl bg-white/80 animate-pulse border border-[#FDCEDF]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {sswBooks.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#F8E8EE] text-[#8A2247] text-[10px] font-black uppercase">
                            {book.language_flag} {book.language_name || book.language}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {book.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] line-clamp-2">
                          {book.title}
                        </h3>
                        {book.title_ja && (
                          <p className="text-[11px] text-slate-500 truncate">{book.title_ja}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F8E8EE] dark:border-slate-800 text-xs font-black">
                        <span className="text-slate-500 text-[11px]">
                          <FileText className="w-3.5 h-3.5 inline mr-1" />
                          {book.total_pages || 'PDF'} pages
                        </span>
                        <span className="text-[#C23B6B]">Open Reader →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
