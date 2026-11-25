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
  ArrowLeft,
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
import { getLessonsHubText, getLocalizedTopic } from '@/lib/lessonsHubI18n';

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
  // 3 Main Pillars: null (selector) | 'learn' | 'jft' | 'ssw'
  const [activePillar, setActivePillar] = useState(null);
  const [studyLang, setStudyLang] = useState('en');
  const ui = useMemo(() => getLessonsHubText(studyLang), [studyLang]);

  const changeStudyLang = (code) => {
    setStudyLang(code);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('gns_study_lang', code);
      } catch {
        // ignore storage errors
      }
    }
  };

  const selectPillar = (pillar) => {
    setActivePillar(pillar);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (pillar) {
        url.searchParams.set('tab', pillar);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Support deep linking via ?tab=jft|ssw|learn and ?lang=bn|hi|... + saved preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const tab = (sp.get('tab') || '').toLowerCase();
    if (tab === 'jft' || tab === 'ssw' || tab === 'learn') {
      setActivePillar(tab);
    }
    const urlLang = (sp.get('lang') || '').toLowerCase();
    const validCodes = STUDY_LANGUAGES.map((l) => l.code);
    if (validCodes.includes(urlLang)) {
      setStudyLang(urlLang);
    } else {
      try {
        const saved = window.localStorage.getItem('gns_study_lang');
        if (saved && validCodes.includes(saved)) {
          setStudyLang(saved);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Pillar 1: Learn Japanese Topics
  const [learnTopics, setLearnTopics] = useState([]);
  const [learnTotals, setLearnTotals] = useState({ topics: 23, lessons: 115, words: 2237 });
  const [learnCategory, setLearnCategory] = useState('all');
  const [learnSearch, setLearnSearch] = useState('');
  const [learnLoading, setLearnLoading] = useState(false);

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

  // Load Pillar 1 (Learn Japanese Topics) only when user selects 'learn'
  useEffect(() => {
    if (activePillar !== 'learn') return;
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
  }, [activePillar, learnCategory, learnSearch]);

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
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      {/* =====================================================================
          HERO & 3-PILLAR SWITCHER (Learn Japanese | JFT Lessons & Notes | SSW)
         ===================================================================== */}
      <section className="border-b border-[#CBE5E3] dark:border-slate-800 bg-gradient-to-b from-[#EAF4F4]/75 via-[#FFFFFF] to-[#FFFFFF] dark:from-[#120d14] dark:to-[#060913]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                <Sparkles className="w-3.5 h-3.5 text-[#DB1A1A]" />
                <span>{ui.heroBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {ui.heroTitlePrefix} <span className="text-[#DB1A1A]">{ui.heroTitleAccent}</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300">
                {ui.heroSubtitle}
              </p>
            </div>

            {/* 7-Language Meaning Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#DB1A1A]" /> {ui.prefLangLabel}
              </span>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {STUDY_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeStudyLang(lang.code)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap border ${
                      studyLang === lang.code
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700 hover:bg-[#EAF4F4]'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 MAIN PILLAR TABS (Shown once user picks a learning track) */}
          {activePillar && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => selectPillar(null)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2C687B] dark:text-[#8CC7C4] hover:text-[#DB1A1A] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{ui.allTracksBack}</span>
              </button>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => selectPillar('learn')}
                  className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                    activePillar === 'learn'
                      ? 'bg-[#DB1A1A] text-white border-[#DB1A1A] shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activePillar === 'learn'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-base font-black leading-tight truncate">
                      {ui.learnTitle}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-semibold truncate ${
                        activePillar === 'learn' ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
                      {ui.learnStats(learnTotals.topics, learnTotals.lessons)}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPillar('jft')}
                  className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                    activePillar === 'jft'
                      ? 'bg-[#DB1A1A] text-white border-[#DB1A1A] shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activePillar === 'jft'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-base font-black leading-tight truncate">
                      {ui.jftTitle}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-semibold truncate ${
                        activePillar === 'jft' ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
                      {ui.jftStats}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPillar('ssw')}
                  className={`rounded-2xl p-3 sm:p-4 text-left border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                    activePillar === 'ssw'
                      ? 'bg-[#DB1A1A] text-white border-[#DB1A1A] shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activePillar === 'ssw'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EAF4F4] dark:bg-slate-800 text-[#DB1A1A]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-base font-black leading-tight truncate">
                      {ui.sswTitle}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-semibold truncate ${
                        activePillar === 'ssw' ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
                      {ui.sswStats}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ===================================================================
            INITIAL LEARNING TRACK SELECTOR (User chooses what to study first)
           =================================================================== */}
        {!activePillar && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4F4] dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 text-[11px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                {ui.stepBadge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {ui.chooseHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {ui.chooseSubheading}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Track 1: Learn Japanese */}
              <button
                type="button"
                onClick={() => selectPillar('learn')}
                className="group text-left rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#CBE5E3] dark:border-slate-800 hover:border-[#DB1A1A] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#DB1A1A] group-hover:bg-[#DB1A1A] group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 text-[11px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                      {ui.learnStats(learnTotals.topics, learnTotals.lessons)}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors">
                      {ui.learnTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ui.learnDesc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[ui.cats.basics, ui.cats.kanji, ui.cats.conversation, ui.cats.daily_life].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#DB1A1A] group-hover:bg-[#B81515] text-white text-sm font-black transition-colors">
                  <span>{ui.learnCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Track 2: JFT Lessons & Notes */}
              <button
                type="button"
                onClick={() => selectPillar('jft')}
                className="group text-left rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#CBE5E3] dark:border-slate-800 hover:border-[#DB1A1A] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#DB1A1A] group-hover:bg-[#DB1A1A] group-hover:text-white transition-colors">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 text-[11px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                      {ui.jftStats}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors">
                      {ui.jftTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ui.jftDesc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[ui.minnaVocabTab, ui.kanjiUnitsTab, ui.grammarNotesTab].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#DB1A1A] group-hover:bg-[#B81515] text-white text-sm font-black transition-colors">
                  <span>{ui.jftCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Track 3: SSW Lessons */}
              <button
                type="button"
                onClick={() => selectPillar('ssw')}
                className="group text-left rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#CBE5E3] dark:border-slate-800 hover:border-[#DB1A1A] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#DB1A1A] group-hover:bg-[#DB1A1A] group-hover:text-white transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 text-[11px] font-black text-[#2C687B] dark:text-[#8CC7C4]">
                      {ui.sswStats}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors">
                      {ui.sswTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ui.sswDesc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Nursing Care', 'Food Service', 'Agriculture', 'JAC Books'].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#DB1A1A] group-hover:bg-[#B81515] text-white text-sm font-black transition-colors">
                  <span>{ui.sswCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}
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
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700 hover:bg-[#EAF4F4]'
                    }`}
                  >
                    {ui.cats[cat.id] || cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={learnSearch}
                  onChange={(e) => setLearnSearch(e.target.value)}
                  placeholder={ui.searchTopicsPlaceholder}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 focus:border-[#DB1A1A] text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {learnLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-32 rounded-2xl bg-white/80 dark:bg-slate-900 animate-pulse border border-[#CBE5E3]" />
                ))}
              </div>
            ) : learnTopics.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#CBE5E3] p-12 text-center space-y-2">
                <Layers className="w-10 h-10 text-[#8CC7C4] mx-auto" />
                <h3 className="text-base font-black">{ui.noTopicsTitle}</h3>
                <p className="text-xs text-slate-500">{ui.noTopicsDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {learnTopics.map((topic) => {
                  const loc = getLocalizedTopic(topic, studyLang);
                  return (
                  <Link
                    key={topic.slug}
                    href={`/lessons/learn/${topic.slug}?lang=${studyLang}`}
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] hover:bg-[#FFFFFF]/40 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
                  >
                    {/* Japanese Glyph Tile */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-xl sm:text-2xl font-black text-[#2C687B] dark:text-[#8CC7C4] shrink-0 group-hover:bg-[#DB1A1A] group-hover:text-white transition-colors">
                      {topic.icon_text || '日'}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] transition-colors truncate">
                          {loc.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#DB1A1A] group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">
                        {loc.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1.5 text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-[#2C687B] dark:text-[#CBE5E3]">
                          {topic.lesson_count} {topic.lesson_count === 1 ? ui.partSingular : ui.partsPlural}
                        </span>
                        <span>•</span>
                        <span>{topic.word_count} {ui.wordsLabel}</span>
                      </div>
                    </div>
                  </Link>
                  );
                })}
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
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700'
                  }`}
                >
                  {ui.minnaVocabTab}
                </button>
                <button
                  type="button"
                  onClick={() => setJftSubTab('kanji')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    jftSubTab === 'kanji'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700'
                  }`}
                >
                  {ui.kanjiUnitsTab}
                </button>
                <button
                  type="button"
                  onClick={() => setJftSubTab('notes')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    jftSubTab === 'notes'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#CBE5E3] dark:border-slate-700'
                  }`}
                >
                  {ui.grammarNotesTab}
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={jftSearch}
                  onChange={(e) => setJftSearch(e.target.value)}
                  placeholder={ui.searchJftPlaceholder}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 focus:border-[#DB1A1A] text-xs font-semibold outline-none"
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
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#8CC7C4] p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black">
                    Search Results for &ldquo;{searchResults.query}&rdquo; ({(searchResults.vocab_count || 0) + (searchResults.kanji_count || 0)})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(searchResults.vocabularies || []).slice(0, 12).map((v) => (
                    <div
                      key={`v-${v.id}`}
                      className="rounded-xl bg-[#FFFFFF]/70 dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {v.word}{' '}
                          <span className="text-xs font-semibold text-slate-500">({v.furigana})</span>
                        </div>
                        <div className="text-xs text-[#2C687B] dark:text-[#CBE5E3] font-bold truncate">
                          {v.meaning_en} {v.meaning_bn ? `• ${v.meaning_bn}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => playSpeech(v.word, `sv-${v.id}`)}
                        className={`p-2 rounded-lg border shrink-0 cursor-pointer ${
                          speakingId === `sv-${v.id}`
                            ? 'bg-[#DB1A1A] text-white border-[#DB1A1A]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 border-[#CBE5E3]'
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
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-5 flex items-start gap-4 shadow-2xs hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] flex items-center justify-center text-xl font-black text-[#2C687B] shrink-0">
                      {note.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#CBE5E3] text-[10px] font-black text-[#2C687B]">
                        {note.badge}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A]">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{note.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#DB1A1A] shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            ) : curriculumLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-28 rounded-2xl bg-white/80 dark:bg-slate-900 animate-pulse border border-[#CBE5E3]" />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Book I: N5 / JFT-Basic */}
                {n5Lessons.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {jftSubTab === 'vocabulary' ? ui.book1Vocab : ui.book1Kanji}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-black">
                        JLPT N5 • JFT-Basic
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {n5Lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}?lang=${studyLang}`}
                          className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-4 shadow-2xs hover:shadow-md transition flex items-start gap-3.5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-[#DB1A1A] group-hover:text-white transition">
                            {lesson.lesson_number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] truncate">
                              {lesson.title}
                            </div>
                            {lesson.title_ja && (
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {lesson.title_ja}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                              <span className="text-slate-500">
                                {lesson.items_count || 0} {jftSubTab === 'vocabulary' ? ui.wordsLabel : ui.kanjiLabel}
                              </span>
                              <span className="text-[#DB1A1A] font-black">{ui.studyBtn}</span>
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
                        {jftSubTab === 'vocabulary' ? ui.book2Vocab : ui.book2Kanji}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#CBE5E3] border border-[#CBE5E3] text-[10px] font-black">
                        JLPT N4 • SSW Ready
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {n4Lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}?lang=${studyLang}`}
                          className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-4 shadow-2xs hover:shadow-md transition flex items-start gap-3.5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-[#DB1A1A] transition">
                            {lesson.lesson_number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] truncate">
                              {lesson.title}
                            </div>
                            {lesson.title_ja && (
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {lesson.title_ja}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                              <span className="text-slate-500">
                                {lesson.items_count || 0} {jftSubTab === 'vocabulary' ? ui.wordsLabel : ui.kanjiLabel}
                              </span>
                              <span className="text-[#DB1A1A] font-black">{ui.studyBtn}</span>
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
                {ui.sswGuidesHeading}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {SSW_SECTOR_GUIDES.map((g) => (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] font-black text-lg flex items-center justify-center">
                          {g.icon}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#CBE5E3] text-[10px] font-black text-[#2C687B]">
                          {g.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A]">
                        {g.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {g.desc}
                      </p>
                    </div>
                    <span className="text-xs font-black text-[#DB1A1A]">{ui.readGuideBtn}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Official SSW / JAC Textbooks */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {ui.sswBooksHeading}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {ui.sswBooksDesc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: ui.allBooks },
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
                          : 'bg-white dark:bg-slate-900 text-slate-700 border-[#CBE5E3]'
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
                    <div key={n} className="h-32 rounded-2xl bg-white/80 animate-pulse border border-[#CBE5E3]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {sswBooks.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#EAF4F4] text-[#2C687B] text-[10px] font-black uppercase">
                            {book.language_flag} {book.language_name || book.language}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {book.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#DB1A1A] line-clamp-2">
                          {book.title}
                        </h3>
                        {book.title_ja && (
                          <p className="text-[11px] text-slate-500 truncate">{book.title_ja}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#EAF4F4] dark:border-slate-800 text-xs font-black">
                        <span className="text-slate-500 text-[11px]">
                          <FileText className="w-3.5 h-3.5 inline mr-1" />
                          {book.total_pages || 'PDF'} pages
                        </span>
                        <span className="text-[#DB1A1A]">Open Reader →</span>
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
