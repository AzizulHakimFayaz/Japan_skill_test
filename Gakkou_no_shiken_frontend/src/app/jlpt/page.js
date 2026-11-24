'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  getJlptOverview,
  getJlptSets,
  getJlptPlacementTest,
  submitJlptPlacementTest,
} from '@/lib/api';
import {
  Sparkles,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowDown,
  Clock,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Globe,
  RotateCcw,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

const EXPLANATION_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

const JLPT_LEVEL_GUIDE = [
  {
    level: 'N5',
    rank: 1,
    stepHeight: 'h-16',
    label: 'Beginner',
    difficultyTag: 'Easiest • Start Here',
    cefr: 'CEFR A1',
    kanji: '~100 Kanji',
    vocab: '~800 Words',
    hours: '150 hrs',
    goal: 'Basic phrases, Hiragana, Katakana & everyday greetings',
    badgeBg: 'bg-emerald-500',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/35',
    border: 'border-emerald-300/80 dark:border-emerald-700/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    level: 'N4',
    rank: 2,
    stepHeight: 'h-24',
    label: 'Elementary',
    difficultyTag: 'Basic • JFT / SSW Level',
    cefr: 'CEFR A2',
    kanji: '~300 Kanji',
    vocab: '~1,500 Words',
    hours: '300 hrs',
    goal: 'Daily conversations, SSW visa & JFT-Basic equivalent',
    badgeBg: 'bg-sky-500',
    softBg: 'bg-sky-50 dark:bg-sky-950/35',
    border: 'border-sky-300/80 dark:border-sky-700/60',
    text: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-500',
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    level: 'N3',
    rank: 3,
    stepHeight: 'h-32',
    label: 'Intermediate',
    difficultyTag: 'Moderate • Bridge Level',
    cefr: 'CEFR B1',
    kanji: '~650 Kanji',
    vocab: '~3,750 Words',
    hours: '450 hrs',
    goal: 'Natural workplace Japanese, news summaries & daily reading',
    badgeBg: 'bg-amber-500',
    softBg: 'bg-amber-50 dark:bg-amber-950/35',
    border: 'border-amber-300/80 dark:border-amber-700/60',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-500',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    level: 'N2',
    rank: 4,
    stepHeight: 'h-40',
    label: 'Pre-Advanced',
    difficultyTag: 'Hard • Business & Uni',
    cefr: 'CEFR B2',
    kanji: '~1,000 Kanji',
    vocab: '~6,000 Words',
    hours: '600 hrs',
    goal: 'Japanese companies, university admission & full articles',
    badgeBg: 'bg-orange-500',
    softBg: 'bg-orange-50 dark:bg-orange-950/35',
    border: 'border-orange-300/80 dark:border-orange-700/60',
    text: 'text-orange-700 dark:text-orange-300',
    ring: 'ring-orange-500',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    level: 'N1',
    rank: 5,
    stepHeight: 'h-48',
    label: 'Advanced Master',
    difficultyTag: 'Hardest • Near-Native',
    cefr: 'CEFR C1',
    kanji: '~2,000+ Kanji',
    vocab: '~10,000+ Words',
    hours: '900+ hrs',
    goal: 'Academic papers, legal/editorial Japanese & top career roles',
    badgeBg: 'bg-rose-600',
    softBg: 'bg-rose-50 dark:bg-rose-950/35',
    border: 'border-rose-300/80 dark:border-rose-700/60',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-600',
    gradient: 'from-rose-600 to-fuchsia-600',
  },
];

function renderHighlightedQuestion(text, underline) {
  if (!text) return null;
  if (!underline || !text.includes(underline)) {
    return <span>{text}</span>;
  }
  const parts = text.split(underline);
  return (
    <>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part}
          {idx < parts.length - 1 && (
            <span className="underline decoration-2 decoration-rose-500 underline-offset-4 font-black text-rose-600 dark:text-rose-400 px-0.5">
              {underline}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export default function JlptHubPage() {
  const mockSectionRef = useRef(null);

  // Overview stats
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Section 1: Short Placement Test state
  const [placementState, setPlacementState] = useState('idle'); // idle | taking | submitting | done
  const [placementQuestions, setPlacementQuestions] = useState([]);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState({});
  const [placementResult, setPlacementResult] = useState(null);
  const [placementLang, setPlacementLang] = useState('en');
  const [showPlacementReview, setShowPlacementReview] = useState(false);

  // Section 3: Proper Mock Tests state
  const [selectedLevel, setSelectedLevel] = useState('N1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [setsData, setSetsData] = useState({ count: 0, total_pages: 1, results: [] });
  const [setsLoading, setSetsLoading] = useState(true);

  // Load overview on mount
  useEffect(() => {
    let active = true;
    setOverviewLoading(true);
    getJlptOverview()
      .then((data) => {
        if (!active) return;
        setOverview(data);
        // Default to N1 if N1 has ready sets so visitors can immediately take a graded test
        const levels = data?.levels || [];
        const firstReady = levels.find((l) => l.ready_sets > 0);
        if (firstReady) {
          setSelectedLevel(firstReady.level);
          setReadyOnly(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setOverviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load sets whenever filters change
  const fetchSets = useCallback(async () => {
    setSetsLoading(true);
    try {
      const data = await getJlptSets({
        level: selectedLevel,
        category: selectedCategory,
        readyOnly,
        search: searchTerm.trim(),
        page,
        pageSize: 18,
      });
      setSetsData(data || { count: 0, total_pages: 1, results: [] });
    } catch {
      setSetsData({ count: 0, total_pages: 1, results: [] });
    } finally {
      setSetsLoading(false);
    }
  }, [selectedLevel, selectedCategory, readyOnly, searchTerm, page]);

  useEffect(() => {
    const t = setTimeout(fetchSets, 150);
    return () => clearTimeout(t);
  }, [fetchSets]);

  const jumpToLevelMocks = (level) => {
    setSelectedLevel(level);
    setSelectedCategory('all');
    setPage(1);
    // If this level has ready sets, show readyOnly by default; otherwise show all sets so it's never empty
    const lvlInfo = overview?.levels?.find((l) => l.level === level);
    setReadyOnly(Boolean(lvlInfo && lvlInfo.ready_sets > 0));
    setTimeout(() => {
      mockSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Start placement test
  const handleStartPlacement = async () => {
    setPlacementState('taking');
    setPlacementIndex(0);
    setPlacementAnswers({});
    setPlacementResult(null);
    setShowPlacementReview(false);
    if (placementQuestions.length === 0) {
      try {
        const data = await getJlptPlacementTest();
        setPlacementQuestions(data?.questions || []);
      } catch {
        setPlacementState('idle');
      }
    }
  };

  const handleSubmitPlacement = async () => {
    setPlacementState('submitting');
    try {
      const res = await submitJlptPlacementTest(placementAnswers);
      setPlacementResult(res);
      setPlacementState('done');
    } catch {
      setPlacementState('taking');
    }
  };

  const levelMap = {};
  (overview?.levels || []).forEach((l) => {
    levelMap[l.level] = l;
  });

  const activeLevelInfo = levelMap[selectedLevel];
  const activeCategories = activeLevelInfo?.categories || [];
  const currentPlacementQ = placementQuestions[placementIndex];
  const answeredPlacementCount = Object.keys(placementAnswers).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-20">
      {/* =====================================================================
          SECTION 1 (TOP): HERO + SHORT JLPT LEVEL CHECKER MOCK TEST
         ===================================================================== */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-950 via-indigo-950 to-rose-950 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#f43f5e,transparent_45%),radial-gradient(circle_at_80%_30%,#6366f1,transparent_45%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Intro */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold tracking-wide uppercase text-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>JLPT N5 – N1 Official Mock Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-pink-400">JLPT Level</span> &amp; Master Real Mock Tests
              </h1>
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
                Not sure whether to start at <strong>N5, N4, N3, N2, or N1</strong>? Take our <strong>3-minute diagnostic test</strong> right here, compare every level&apos;s difficulty at a glance, and practice real JLPT mock tests with <strong>7-language explanations</strong> after submission.
              </p>

              {/* Live Platform Totals */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {overview?.totals?.total_questions
                      ? overview.totals.total_questions.toLocaleString()
                      : '32,899'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300">JLPT Questions</div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">
                    {overview?.totals?.total_sets
                      ? overview.totals.total_sets.toLocaleString()
                      : '1,935'}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300">Mock Test Sets</div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                  <div className="text-xl sm:text-2xl font-black text-sky-300">7 Langs</div>
                  <div className="text-[11px] font-semibold text-slate-300">Post-Exam Guide</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="#jlpt-level-guide"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold transition"
                >
                  <span>Compare N5 → N1 Difficulty</span>
                  <ArrowDown className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => jumpToLevelMocks(selectedLevel)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-900/40 transition cursor-pointer"
                >
                  <span>Browse Mock Tests</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Short Level Checker Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white dark:bg-[#0f1629] text-slate-900 dark:text-slate-100 border border-white/20 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
                {/* IDLE STATE */}
                {placementState === 'idle' && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-black uppercase">
                          <Target className="w-3.5 h-3.5" /> Step 1 • Quick Level Check
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black mt-2">
                          Check Your Current JLPT Level in 3 Minutes
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          10 carefully graded questions (2 from each level: N5, N4, N3, N2, N1). Instant level recommendation + 7-language explanations.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {JLPT_LEVEL_GUIDE.map((g) => (
                        <div
                          key={g.level}
                          className={`rounded-xl p-2.5 text-center border ${g.softBg} ${g.border}`}
                        >
                          <div className={`text-sm font-black ${g.text}`}>{g.level}</div>
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            2 Qs
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4 text-rose-500" /> ~3 Mins
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-4 h-4 text-indigo-500" /> 7-Lang Explanations
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500" /> Free &amp; Instant
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartPlacement}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-rose-600/25 transition cursor-pointer"
                      >
                        <span>Start Level Check Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAKING / SUBMITTING STATE */}
                {(placementState === 'taking' || placementState === 'submitting') && (
                  <div className="space-y-5">
                    {!currentPlacementQ ? (
                      <div className="py-12 text-center text-sm font-semibold text-slate-500">
                        Loading diagnostic questions...
                      </div>
                    ) : (
                      <>
                        {/* Top Progress Bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black">
                              Q{placementIndex + 1} / {placementQuestions.length}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold">
                              {currentPlacementQ.level} • {currentPlacementQ.section}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {answeredPlacementCount}/{placementQuestions.length} answered
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 transition-all duration-300"
                            style={{
                              width: `${((placementIndex + 1) / placementQuestions.length) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Question Body */}
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                            {currentPlacementQ.instruction}
                          </p>
                          <p className="text-lg sm:text-xl font-bold leading-relaxed">
                            {renderHighlightedQuestion(
                              currentPlacementQ.question,
                              currentPlacementQ.underline
                            )}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(currentPlacementQ.options || []).map((opt, idx) => {
                            const optNum = idx + 1;
                            const isSelected = placementAnswers[currentPlacementQ.id] === optNum;
                            return (
                              <button
                                key={optNum}
                                type="button"
                                onClick={() =>
                                  setPlacementAnswers((prev) => ({
                                    ...prev,
                                    [currentPlacementQ.id]: optNum,
                                  }))
                                }
                                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left font-bold text-sm transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {optNum}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            disabled={placementIndex === 0}
                            onClick={() => setPlacementIndex((i) => Math.max(0, i - 1))}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" /> Previous
                          </button>

                          {placementIndex < placementQuestions.length - 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPlacementIndex((i) =>
                                  Math.min(placementQuestions.length - 1, i + 1)
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black cursor-pointer"
                            >
                              Next Question <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={placementState === 'submitting'}
                              onClick={handleSubmitPlacement}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg cursor-pointer disabled:opacity-60"
                            >
                              {placementState === 'submitting'
                                ? 'Calculating Level...'
                                : 'See My JLPT Level →'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* DONE STATE */}
                {placementState === 'done' && placementResult && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Diagnostic Complete • Score {placementResult.score}/{placementResult.total_questions}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black mt-1">
                          Recommended Level:{' '}
                          <span className="text-rose-600 dark:text-rose-400">
                            JLPT {placementResult.recommended_level}
                          </span>
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartPlacement}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {placementResult.summary}
                    </p>

                    {/* 5-Level Accuracy Bars */}
                    <div className="grid grid-cols-5 gap-2">
                      {(placementResult.breakdown || []).map((b) => {
                        const pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
                        const isRec = b.level === placementResult.recommended_level;
                        return (
                          <div
                            key={b.level}
                            className={`rounded-xl p-2.5 border text-center ${
                              isRec
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/30'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="text-xs font-black">{b.level}</div>
                            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              {b.correct}/{b.total}
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowPlacementReview((v) => !v)}
                        className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {showPlacementReview
                          ? 'Hide Answer Explanations ▲'
                          : 'View 7-Language Answer Explanations ▼'}
                      </button>
                      <button
                        type="button"
                        onClick={() => jumpToLevelMocks(placementResult.recommended_level)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black shadow-lg cursor-pointer"
                      >
                        <span>
                          Go to JLPT {placementResult.recommended_level} Mock Tests
                        </span>
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {showPlacementReview && (
                      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto pr-1">
                        <div className="flex flex-wrap gap-1.5">
                          {EXPLANATION_LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setPlacementLang(lang.code)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                placementLang === lang.code
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {lang.flag} {lang.label}
                            </button>
                          ))}
                        </div>
                        {(placementResult.review || []).map((item, idx) => (
                          <div
                            key={item.id}
                            className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>
                                Q{idx + 1} ({item.level}) — {item.question}
                              </span>
                              {item.is_correct ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                              Correct Answer: {item.answer_index}. {item.answer_text}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">
                              {item.explanation?.[placementLang] || item.explanation?.en}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2 (MIDDLE): VISUAL JLPT DIFFICULTY LADDER & LEVEL GUIDE (N5 -> N1)
         ===================================================================== */}
      <section
        id="jlpt-level-guide"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-orange-500" /> Step 2 • JLPT Difficulty Guide
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-3 tracking-tight">
            Which JLPT Level Is Harder?{' '}
            <span className="text-rose-600 dark:text-rose-400">N5 (Easiest) → N1 (Hardest)</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            JLPT counts <strong>backwards</strong>: <strong>N5</strong> is the beginner entry point, while <strong>N1</strong> is the most difficult near-native summit. <strong>Click any level card below</strong> to jump straight to its mock tests!
          </p>
        </div>

        {/* Visual Difficulty Gradient Ruler */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2 px-1">
            <span className="text-emerald-600 dark:text-emerald-400">
              🌱 Easiest — Start Here (N5)
            </span>
            <span className="hidden sm:inline text-amber-600 dark:text-amber-400">
              ⚡ Intermediate Bridge (N3)
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              🔥 Hardest — Near-Native Summit (N1)
            </span>
          </div>
          <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 via-amber-500 via-orange-500 to-rose-600 shadow-inner" />
        </div>

        {/* 5 Ascending Interactive Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {JLPT_LEVEL_GUIDE.map((item) => {
            const stats = levelMap[item.level];
            const isSelected = selectedLevel === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => jumpToLevelMocks(item.level)}
                className={`group text-left rounded-3xl bg-white dark:bg-[#0f1629] border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${item.border} ring-2 ${item.ring} shadow-lg`
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Ascending Visual Difficulty Bar Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-end justify-between gap-2 mb-3">
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-white text-lg font-black bg-gradient-to-r ${item.gradient} shadow-sm`}
                      >
                        {item.level}
                      </span>
                      <div className="text-xs font-black mt-1.5 text-slate-900 dark:text-white">
                        {item.label}
                      </div>
                    </div>
                    {/* Visual Mini Staircase Height Pillar */}
                    <div className="flex items-end gap-1 h-12">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          style={{ height: `${bar * 20}%` }}
                          className={`w-2 rounded-t-sm transition-all ${
                            bar <= item.rank
                              ? item.badgeBg
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Meter Label */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${item.softBg} ${item.text}`}
                  >
                    <span>Difficulty {item.rank}/5</span>
                    <span>•</span>
                    <span>{item.cefr}</span>
                  </div>
                </div>

                {/* Specs Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    {item.goal}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Kanji</span>
                      <span>{item.kanji}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 px-2 py-1.5 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Vocab</span>
                      <span>{item.vocab}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {overviewLoading
                        ? 'Loading...'
                        : `${(stats?.total_sets || 0).toLocaleString()} Sets`}
                    </span>
                    {stats?.ready_sets > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        {stats.ready_sets} Graded Live
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {stats?.total_questions?.toLocaleString() || 0} Qs
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-full py-2 px-3 rounded-xl text-center text-xs font-black text-white bg-gradient-to-r ${item.gradient} group-hover:opacity-95 transition flex items-center justify-center gap-1.5`}
                  >
                    <span>Explore {item.level} Tests</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 (BOTTOM): JLPT PROPER MOCK TEST SECTION
         ===================================================================== */}
      <section
        id="jlpt-mock-tests"
        ref={mockSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 scroll-mt-20"
      >
        <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-8">
          {/* Header & Level Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-black uppercase">
                <Trophy className="w-3.5 h-3.5" /> Step 3 • JLPT Proper Mock Tests
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                JLPT {selectedLevel} Mock Test Library
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Complete timed mock sets and unlock detailed explanations in 7 languages right after submission.
              </p>
            </div>

            {/* Level Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {JLPT_LEVEL_GUIDE.map((g) => {
                const info = levelMap[g.level];
                const active = selectedLevel === g.level;
                return (
                  <button
                    key={g.level}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(g.level);
                      setSelectedCategory('all');
                      setPage(1);
                      setReadyOnly(Boolean(info && info.ready_sets > 0));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
                      active
                        ? `bg-gradient-to-r ${g.gradient} text-white shadow-md`
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{g.level}</span>
                    {info?.ready_sets > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {info.ready_sets} Ready
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar: Categories + Search + Ready-Only Toggle */}
          <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Categories ({activeLevelInfo?.total_sets || 0})
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    selectedCategory === cat.category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.category} ({readyOnly ? cat.ready_sets : cat.total_sets})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={readyOnly}
                  onChange={(e) => {
                    setReadyOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Graded &amp; Explained Only</span>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={`Search ${selectedLevel} sets...`}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold outline-none w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Grid of Mock Sets */}
          {setsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : setsData.results.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-black">No matching JLPT {selectedLevel} sets found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {readyOnly
                  ? `Translations and answer keys for ${selectedLevel} are being uploaded progressively. Turn off "Graded & Explained Only" to preview all ${activeLevelInfo?.total_sets || 0} ${selectedLevel} practice sets!`
                  : 'Try clearing your search or switching category.'}
              </p>
              {readyOnly && (
                <button
                  type="button"
                  onClick={() => setReadyOnly(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer"
                >
                  Show All {selectedLevel} Practice Sets
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {setsData.results.map((s) => {
                  const mins = Math.max(1, Math.round((s.time_limit_seconds || 1080) / 60));
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black">
                              {s.level}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                              {s.category}
                            </span>
                          </div>
                          {s.is_ready ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" /> Graded + 7 Langs
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              Practice Preview
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {s.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                            {s.question_count} Questions
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {mins} Mins
                          </span>
                          {s.user_best_score !== null && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                              <Award className="w-3.5 h-3.5" />
                              Best: {s.user_best_score}/{s.question_count}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/jlpt/test/${s.id}`}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-1.5 ${
                          s.is_ready
                            ? 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{s.is_ready ? 'Start Mock Exam' : 'Preview Questions'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {setsData.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Page {setsData.page || page} of {setsData.total_pages} ({setsData.count} sets)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= setsData.total_pages}
                      onClick={() => setPage((p) => Math.min(setsData.total_pages, p + 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
