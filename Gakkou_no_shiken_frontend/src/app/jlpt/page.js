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
  Trophy,
  Globe,
  RotateCcw,
  Layers,
  Award,
  BarChart3,
  GraduationCap,
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
    jaRank: '初級',
    stepHeight: 'lg:min-h-[128px]',
    label: 'Beginner',
    difficultyTag: 'Level 1/5 • Entry Point',
    cefr: 'CEFR A1',
    kanji: '~100 Kanji',
    kanjiPct: 12,
    vocab: '~800 Words',
    vocabPct: 12,
    hours: '150 hrs',
    hoursPct: 18,
    goal: 'Master Hiragana, Katakana, basic greetings, and simple everyday Japanese phrases.',
    career: 'Travel & Basic Daily Life in Japan',
    stepAccent: 'border-t-[#FDCEDF]',
  },
  {
    level: 'N4',
    rank: 2,
    jaRank: '基礎',
    stepHeight: 'lg:min-h-[156px]',
    label: 'Elementary',
    difficultyTag: 'Level 2/5 • SSW & JFT Level',
    cefr: 'CEFR A2',
    kanji: '~300 Kanji',
    kanjiPct: 24,
    vocab: '~1,500 Words',
    vocabPct: 24,
    hours: '300 hrs',
    hoursPct: 35,
    goal: 'Handle everyday conversations, workplace instructions, and JFT-Basic / SSW visa requirements.',
    career: 'SSW Visa & Entry-Level Work in Japan',
    stepAccent: 'border-t-[#F6C8DA]',
  },
  {
    level: 'N3',
    rank: 3,
    jaRank: '中級',
    stepHeight: 'lg:min-h-[184px]',
    label: 'Intermediate',
    difficultyTag: 'Level 3/5 • Career Bridge',
    cefr: 'CEFR B1',
    kanji: '~650 Kanji',
    kanjiPct: 45,
    vocab: '~3,750 Words',
    vocabPct: 45,
    hours: '450 hrs',
    hoursPct: 52,
    goal: 'Understand natural workplace Japanese, news summaries, and everyday written articles.',
    career: 'Vocational Schools & Japanese Workplaces',
    stepAccent: 'border-t-[#F2BED1]',
  },
  {
    level: 'N2',
    rank: 4,
    jaRank: '上級',
    stepHeight: 'lg:min-h-[212px]',
    label: 'Pre-Advanced',
    difficultyTag: 'Level 4/5 • Business & Uni',
    cefr: 'CEFR B2',
    kanji: '~1,000 Kanji',
    kanjiPct: 70,
    vocab: '~6,000 Words',
    vocabPct: 70,
    hours: '600 hrs',
    hoursPct: 72,
    goal: 'Read newspapers, follow fast native discussions, and qualify for Japanese universities & companies.',
    career: 'Japanese Companies & University Admission',
    stepAccent: 'border-t-[#D96B94]',
  },
  {
    level: 'N1',
    rank: 5,
    jaRank: '最上級',
    stepHeight: 'lg:min-h-[240px]',
    label: 'Advanced Master',
    difficultyTag: 'Level 5/5 • Near-Native Summit',
    cefr: 'CEFR C1',
    kanji: '~2,000+ Kanji',
    kanjiPct: 100,
    vocab: '~10,000+ Words',
    vocabPct: 100,
    hours: '900+ hrs',
    hoursPct: 100,
    goal: 'Comprehend complex academic papers, legal/editorial Japanese, and nuanced native speech effortlessly.',
    career: 'Executive Roles, Translators & Graduate Study',
    stepAccent: 'border-t-[#C23B6B]',
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
            <span className="underline decoration-2 decoration-[#C23B6B] underline-offset-4 font-black text-[#C23B6B] dark:text-[#F2BED1] px-0.5">
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

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Section 1: Short Placement Test state
  const [placementState, setPlacementState] = useState('idle');
  const [placementQuestions, setPlacementQuestions] = useState([]);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState({});
  const [placementResult, setPlacementResult] = useState(null);
  const [placementLang, setPlacementLang] = useState('en');
  const [showPlacementReview, setShowPlacementReview] = useState(false);

  // Section 2: Interactive Difficulty Guide focus
  const [focusedGuideLevel, setFocusedGuideLevel] = useState('N1');

  // Section 3: Proper Mock Tests state
  const [selectedLevel, setSelectedLevel] = useState('N1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [setsData, setSetsData] = useState({ count: 0, total_pages: 1, results: [] });
  const [setsLoading, setSetsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setOverviewLoading(true);
    getJlptOverview()
      .then((data) => {
        if (!active) return;
        setOverview(data);
        const levels = data?.levels || [];
        const firstReady = levels.find((l) => l.ready_sets > 0);
        if (firstReady) {
          setSelectedLevel(firstReady.level);
          setFocusedGuideLevel(firstReady.level);
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
    setFocusedGuideLevel(level);
    setSelectedCategory('all');
    setPage(1);
    setReadyOnly(false);
    setTimeout(() => {
      mockSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

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
  const focusedGuide =
    JLPT_LEVEL_GUIDE.find((g) => g.level === focusedGuideLevel) || JLPT_LEVEL_GUIDE[4];
  const focusedStats = levelMap[focusedGuide.level];

  return (
    <div className="min-h-screen bg-[#F9F5F6] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      {/* =====================================================================
          SECTION 1 (TOP): MODERN LIGHT SAKURA HERO + 3-MIN LEVEL CHECKER
         ===================================================================== */}
      <section className="relative overflow-hidden border-b border-[#FDCEDF] dark:border-slate-800 bg-gradient-to-b from-[#F8E8EE]/75 via-[#F9F5F6] to-[#F9F5F6] dark:from-[#120d14] dark:via-[#0a0d17] dark:to-[#060913]">
        {/* Soft Sakura Ambient Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F2BED1]/20 dark:bg-[#F2BED1]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FDCEDF]/40 dark:bg-[#C23B6B]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Editorial Intro */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900 border border-[#FDCEDF] dark:border-slate-700 text-[11px] font-black tracking-wide uppercase text-[#9E2B54] dark:text-[#F2BED1] shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-[#C23B6B]" />
                <span>JLPT N5 – N1 Official Mock Hub</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-slate-900 dark:text-white">
                Find Your <span className="text-[#C23B6B]">JLPT Level</span> &amp; Master Real Mock Tests
              </h1>

              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Take our <strong>3-minute diagnostic test</strong>, compare <strong>N5 → N1</strong> difficulty at a glance, and practice authentic JLPT mock exams with <strong>7-language explanations</strong>.
              </p>

              {/* Compact Modern Stats Bar (Single Clean Row on Mobile & Desktop) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#FDCEDF] dark:border-slate-800 px-3 py-2.5 sm:p-3.5 shadow-2xs">
                  <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {overview?.totals?.total_questions
                      ? overview.totals.total_questions.toLocaleString()
                      : '32,899'}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Questions
                  </div>
                </div>
                <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#FDCEDF] dark:border-slate-800 px-3 py-2.5 sm:p-3.5 shadow-2xs">
                  <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {overview?.totals?.total_sets
                      ? overview.totals.total_sets.toLocaleString()
                      : '1,935'}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Mock Sets
                  </div>
                </div>
                <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#FDCEDF] dark:border-slate-800 px-3 py-2.5 sm:p-3.5 shadow-2xs">
                  <div className="text-base sm:text-2xl font-black text-[#C23B6B] leading-tight">
                    7 Langs
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Explanations
                  </div>
                </div>
              </div>

              {/* Action Buttons (2-column compact row on mobile) */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 pt-1">
                <a
                  href="#jlpt-level-guide"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-[#F8E8EE]/60 border border-[#FDCEDF] dark:border-slate-700 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 transition"
                >
                  <span>Level Guide</span>
                  <ArrowDown className="w-3.5 h-3.5 text-[#C23B6B]" />
                </a>
                <button
                  type="button"
                  onClick={() => jumpToLevelMocks(selectedLevel)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#C23B6B] dark:bg-[#C23B6B] dark:hover:bg-[#A32D58] text-white text-xs sm:text-sm font-extrabold shadow-sm transition cursor-pointer"
                >
                  <span>Mock Tests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive Short Level Checker Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white dark:bg-[#0f1629] text-slate-900 dark:text-slate-100 border border-[#FDCEDF] dark:border-slate-800 shadow-lg shadow-[#F2BED1]/10 p-5 sm:p-7">
                {/* IDLE STATE */}
                {placementState === 'idle' && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8E8EE] dark:bg-slate-800 text-[#9E2B54] dark:text-[#F2BED1] text-[10px] sm:text-xs font-black uppercase">
                        <Target className="w-3.5 h-3.5" /> Step 1 • Quick Level Check
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black mt-2 text-slate-900 dark:text-white leading-snug">
                        Check Your Current JLPT Level in 3 Minutes
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        10 graded questions (2 per level: N5 → N1) with instant recommendation and 7-language explanations.
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {JLPT_LEVEL_GUIDE.map((g) => (
                        <div
                          key={g.level}
                          className="rounded-xl py-2 px-1 sm:p-2.5 text-center border border-[#FDCEDF] dark:border-slate-800 bg-[#F9F5F6]/70 dark:bg-slate-900/60"
                        >
                          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {g.level}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            2 Qs
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F8E8EE] dark:border-slate-800">
                      <div className="flex items-center justify-between sm:justify-start gap-3 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C23B6B]" /> ~3 Mins
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-[#C23B6B]" /> 7 Langs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C23B6B]" /> Free
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartPlacement}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C23B6B] hover:bg-[#A32D58] text-white font-black text-xs sm:text-sm shadow-md shadow-[#C23B6B]/20 transition cursor-pointer"
                      >
                        <span>Start Level Check Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAKING / SUBMITTING STATE */}
                {(placementState === 'taking' || placementState === 'submitting') && (
                  <div className="space-y-4">
                    {!currentPlacementQ ? (
                      <div className="py-10 text-center text-sm font-semibold text-slate-500">
                        Loading diagnostic questions...
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black">
                              Q{placementIndex + 1}/{placementQuestions.length}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-[#FDCEDF] text-xs font-extrabold">
                              {currentPlacementQ.level} • {currentPlacementQ.section}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {answeredPlacementCount}/{placementQuestions.length}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[#F8E8EE] dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-[#C23B6B] transition-all duration-300"
                            style={{
                              width: `${((placementIndex + 1) / placementQuestions.length) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="rounded-2xl bg-[#F9F5F6]/70 dark:bg-slate-900/70 border border-[#FDCEDF] dark:border-slate-800 p-4 sm:p-5">
                          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            {currentPlacementQ.instruction}
                          </p>
                          <p className="text-base sm:text-xl font-bold leading-relaxed">
                            {renderHighlightedQuestion(
                              currentPlacementQ.question,
                              currentPlacementQ.underline
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left font-bold text-sm transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                    : 'bg-white dark:bg-slate-900 border-[#FDCEDF] dark:border-slate-700 hover:border-[#F2BED1]'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                    isSelected
                                      ? 'bg-[#C23B6B] text-white'
                                      : 'bg-[#F8E8EE] dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {optNum}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F8E8EE] dark:border-slate-800">
                          <button
                            type="button"
                            disabled={placementIndex === 0}
                            onClick={() => setPlacementIndex((i) => Math.max(0, i - 1))}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[#FDCEDF] dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-[#F9F5F6] cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" /> Prev
                          </button>

                          {placementIndex < placementQuestions.length - 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPlacementIndex((i) =>
                                  Math.min(placementQuestions.length - 1, i + 1)
                                )
                              }
                              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black cursor-pointer"
                            >
                              Next <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={placementState === 'submitting'}
                              onClick={handleSubmitPlacement}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C23B6B] hover:bg-[#A32D58] text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-60"
                            >
                              {placementState === 'submitting' ? 'Calculating...' : 'See My Level →'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* DONE STATE */}
                {placementState === 'done' && placementResult && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Score {placementResult.score}/{placementResult.total_questions}
                        </span>
                        <h3 className="text-xl sm:text-3xl font-black mt-0.5">
                          Recommended:{' '}
                          <span className="text-[#C23B6B]">
                            JLPT {placementResult.recommended_level}
                          </span>
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartPlacement}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FDCEDF] dark:border-slate-700 text-xs font-bold hover:bg-[#F9F5F6] cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {placementResult.summary}
                    </p>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {(placementResult.breakdown || []).map((b) => {
                        const pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
                        const isRec = b.level === placementResult.recommended_level;
                        return (
                          <div
                            key={b.level}
                            className={`rounded-xl p-2 border text-center ${
                              isRec
                                ? 'bg-[#F8E8EE] dark:bg-red-950/40 border-[#C23B6B]'
                                : 'bg-[#F9F5F6]/60 dark:bg-slate-900 border-[#FDCEDF] dark:border-slate-800'
                            }`}
                          >
                            <div className="text-[11px] font-black">{b.level}</div>
                            <div className="text-sm sm:text-lg font-black">
                              {b.correct}/{b.total}
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white dark:bg-slate-700 mt-1 overflow-hidden">
                              <div
                                className={`h-full ${isRec ? 'bg-[#C23B6B]' : 'bg-slate-800 dark:bg-slate-300'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F8E8EE] dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowPlacementReview((v) => !v)}
                        className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-[#C23B6B] underline underline-offset-4 cursor-pointer text-left"
                      >
                        {showPlacementReview ? 'Hide Explanations ▲' : 'View 7-Language Explanations ▼'}
                      </button>
                      <button
                        type="button"
                        onClick={() => jumpToLevelMocks(placementResult.recommended_level)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C23B6B] hover:bg-[#A32D58] text-white text-xs sm:text-sm font-black shadow-md cursor-pointer"
                      >
                        <span>Go to JLPT {placementResult.recommended_level} Tests</span>
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {showPlacementReview && (
                      <div className="space-y-3 pt-3 border-t border-[#F8E8EE] dark:border-slate-800 max-h-72 overflow-y-auto pr-1">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {EXPLANATION_LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setPlacementLang(lang.code)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap transition ${
                                placementLang === lang.code
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                  : 'bg-[#F9F5F6] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#FDCEDF] dark:border-slate-700'
                              }`}
                            >
                              {lang.flag} {lang.label}
                            </button>
                          ))}
                        </div>
                        {(placementResult.review || []).map((item, idx) => (
                          <div
                            key={item.id}
                            className="rounded-xl p-3 bg-[#F9F5F6]/60 dark:bg-slate-900 border border-[#FDCEDF] dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold gap-2">
                              <span>
                                Q{idx + 1} ({item.level}) — {item.question}
                              </span>
                              {item.is_correct ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-[#C23B6B] shrink-0" />
                              )}
                            </div>
                            <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                              Answer: {item.answer_index}. {item.answer_text}
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
          SECTION 2 (MIDDLE): SMART MOBILE PILL BAR + DESKTOP ELEVATION STAIRCASE
         ===================================================================== */}
      <section
        id="jlpt-level-guide"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14"
      >
        <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#F8E8EE] dark:border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-[#FDCEDF] text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5 text-[#C23B6B]" /> Step 2 • JLPT Difficulty Roadmap
              </span>
              <h2 className="text-xl sm:text-3xl font-black mt-2.5 tracking-tight text-slate-900 dark:text-white">
                Which Level Is Harder?{' '}
                <span className="text-[#C23B6B]">N5 (Start) → N1 (Summit)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tap any level to compare Kanji, Vocabulary, and study hours, then jump straight into its mock tests.
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              <span>N5 Easiest</span>
              <span className="w-20 h-2 rounded-full bg-gradient-to-r from-[#F9F5F6] via-[#FDCEDF] via-[#F2BED1] to-[#C23B6B] border border-[#FDCEDF] inline-block" />
              <span className="text-[#C23B6B]">N1 Hardest</span>
            </div>
          </div>

          {/* MOBILE & TABLET (< lg): ULTRA-CLEAN HORIZONTAL 5-LEVEL SEGMENTED BAR (No Vertical Stack!) */}
          <div className="lg:hidden px-4 pt-4 pb-3 bg-[#F9F5F6]/70 dark:bg-[#090e1a] border-b border-[#F8E8EE] dark:border-slate-800">
            <div className="grid grid-cols-5 gap-1.5">
              {JLPT_LEVEL_GUIDE.map((item) => {
                const isFocused = focusedGuideLevel === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setFocusedGuideLevel(item.level)}
                    className={`rounded-2xl py-2.5 px-1 text-center transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      isFocused
                        ? 'bg-[#C23B6B] text-white border-[#C23B6B] shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#FDCEDF] dark:border-slate-800'
                    }`}
                  >
                    <span className="text-sm font-black leading-none">{item.level}</span>
                    <span
                      className={`text-[9px] font-bold leading-none ${
                        isFocused ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.cefr.replace('CEFR ', '')}
                    </span>
                    {/* Tiny 5-dot difficulty indicator */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <span
                          key={d}
                          className={`w-1 h-1 rounded-full ${
                            d <= item.rank
                              ? isFocused
                                ? 'bg-white'
                                : 'bg-[#C23B6B]'
                              : isFocused
                              ? 'bg-white/30'
                              : 'bg-[#FDCEDF] dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP (lg+): ARCHITECTURAL ASCENDING 5-STEP STAIRCASE */}
          <div className="hidden lg:block px-8 pt-8 pb-0 bg-[#F9F5F6]/65 dark:bg-[#090e1a] border-b border-[#FDCEDF] dark:border-slate-800">
            <div className="grid grid-cols-5 gap-3 items-end">
              {JLPT_LEVEL_GUIDE.map((item) => {
                const stats = levelMap[item.level];
                const isFocused = focusedGuideLevel === item.level;
                const isSummit = item.level === 'N1';
                return (
                  <button
                    key={item.level}
                    type="button"
                    onMouseEnter={() => setFocusedGuideLevel(item.level)}
                    onClick={() => jumpToLevelMocks(item.level)}
                    className={`group relative text-left rounded-t-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden border-t-4 border-x ${item.stepHeight} ${
                      isFocused
                        ? 'bg-[#171316] text-white border-t-[#C23B6B] border-x-[#171316] shadow-xl'
                        : `bg-white dark:bg-[#11192e] text-slate-900 dark:text-white ${item.stepAccent} border-x-[#FDCEDF] dark:border-x-slate-800 hover:bg-[#F9F5F6]`
                    }`}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                            isFocused ? 'text-[#F2BED1]' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          Step {item.rank} • {item.cefr}
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-black tracking-tight">{item.level}</span>
                          <span
                            className={`text-xs font-bold ${
                              isFocused ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>
                      {isSummit && (
                        <span className="px-2 py-0.5 rounded-md bg-[#C23B6B] text-white text-[9px] font-black uppercase">
                          Peak
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 mt-4 pt-3 border-t border-[#F8E8EE]/40 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            className={`h-1.5 flex-1 rounded-full ${
                              dot <= item.rank
                                ? isFocused || isSummit
                                  ? 'bg-[#F2BED1]'
                                  : 'bg-[#C23B6B]'
                                : isFocused
                                ? 'bg-white/15'
                                : 'bg-[#F8E8EE] dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={isFocused ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                          {overviewLoading ? '...' : `${(stats?.total_sets || 0).toLocaleString()} Sets`}
                        </span>
                        <span className={isFocused ? 'text-[#F2BED1] font-black' : 'text-[#C23B6B] font-black'}>
                          Open →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONNECTED INTERACTIVE LEVEL DOSSIER (Always crisp & compact on both Mobile & Desktop) */}
          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-black">
                  JLPT {focusedGuide.level} — {focusedGuide.label}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-[#FDCEDF] text-[11px] font-extrabold">
                  {focusedGuide.difficultyTag}
                </span>
                {focusedStats?.ready_sets > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black">
                    {focusedStats.ready_sets} Graded Live
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {focusedGuide.goal}
              </p>

              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Best For:{' '}
                <span className="text-slate-900 dark:text-white">{focusedGuide.career}</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => jumpToLevelMocks(focusedGuide.level)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C23B6B] hover:bg-[#A32D58] text-white text-xs sm:text-sm font-black shadow-md shadow-[#C23B6B]/20 transition cursor-pointer"
                >
                  <span>Start JLPT {focusedGuide.level} Mock Tests</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Proportional Mastery Gauges */}
            <div className="lg:col-span-6 space-y-3.5 rounded-2xl bg-[#F9F5F6]/70 dark:bg-slate-900/70 border border-[#FDCEDF] dark:border-slate-800 p-4 sm:p-5">
              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-extrabold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 uppercase">Required Kanji</span>
                  <span className="text-slate-900 dark:text-white">{focusedGuide.kanji}</span>
                </div>
                <div className="h-2 rounded-full bg-white dark:bg-slate-800 border border-[#FDCEDF]/60 dark:border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300"
                    style={{ width: `${focusedGuide.kanjiPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-extrabold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 uppercase">Required Vocabulary</span>
                  <span className="text-slate-900 dark:text-white">{focusedGuide.vocab}</span>
                </div>
                <div className="h-2 rounded-full bg-white dark:bg-slate-800 border border-[#FDCEDF]/60 dark:border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-[#F2BED1] rounded-full transition-all duration-300"
                    style={{ width: `${focusedGuide.vocabPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-extrabold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 uppercase">Estimated Study Time</span>
                  <span className="text-[#C23B6B] font-black">{focusedGuide.hours}</span>
                </div>
                <div className="h-2 rounded-full bg-white dark:bg-slate-800 border border-[#FDCEDF]/60 dark:border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-[#C23B6B] rounded-full transition-all duration-300"
                    style={{ width: `${focusedGuide.hoursPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 (BOTTOM): JLPT PROPER MOCK TEST LIBRARY (SMART MOBILE UX)
         ===================================================================== */}
      <section
        id="jlpt-mock-tests"
        ref={mockSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 scroll-mt-20"
      >
        <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 shadow-sm p-4 sm:p-8">
          {/* Header & Full-Width 5-Pill Level Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#F8E8EE] dark:border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-[#FDCEDF] text-[10px] sm:text-xs font-black uppercase">
                <Trophy className="w-3.5 h-3.5 text-[#C23B6B]" /> Step 3 • JLPT Proper Mock Tests
              </span>
              <h2 className="text-xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
                JLPT {selectedLevel} Mock Test Library
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pick a category below and unlock 7-language explanations right after submitting.
              </p>
            </div>

            {/* 5-Column Full-Width Segmented Level Bar on Mobile, Inline on Desktop */}
            <div className="grid grid-cols-5 lg:flex gap-1.5 sm:gap-2">
              {JLPT_LEVEL_GUIDE.map((g) => {
                const info = levelMap[g.level];
                const active = selectedLevel === g.level;
                return (
                  <button
                    key={g.level}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(g.level);
                      setFocusedGuideLevel(g.level);
                      setSelectedCategory('all');
                      setPage(1);
                      setReadyOnly(false);
                    }}
                    className={`py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex flex-col lg:flex-row items-center justify-center gap-0.5 lg:gap-1.5 border ${
                      active
                        ? 'bg-[#C23B6B] text-white border-[#C23B6B] shadow-sm'
                        : 'bg-[#F9F5F6]/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                    }`}
                  >
                    <span>{g.level}</span>
                    {info?.ready_sets > 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {info.ready_sets}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar: Horizontal Swipeable Category Strip on Mobile + Search & Toggle */}
          <div className="py-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            {/* Horizontal Swipeable Strip (No messy 4-row wrapping on mobile!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 md:flex-wrap scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-[#F9F5F6]/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                }`}
              >
                All ({activeLevelInfo?.total_sets || 0})
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                    selectedCategory === cat.category
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-[#F9F5F6]/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                  }`}
                >
                  {cat.category} ({readyOnly ? cat.ready_sets : cat.total_sets})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-[#F9F5F6] dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 px-2.5 py-2 rounded-xl whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={readyOnly}
                  onChange={(e) => {
                    setReadyOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-[#C23B6B] focus:ring-[#C23B6B]"
                />
                <span>Graded Only</span>
              </label>

              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={`Search ${selectedLevel}...`}
                  className="pl-8 pr-3 py-2 rounded-xl bg-[#F9F5F6]/70 dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 focus:border-[#C23B6B] focus:bg-white dark:focus:bg-slate-900 text-xs font-semibold outline-none w-full sm:w-44"
                />
              </div>
            </div>
          </div>

          {/* Mock Test List (Compact Vertical List on Mobile, Clean 3-Col Grid on Desktop) */}
          {setsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 py-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-32 sm:h-40 rounded-2xl bg-[#F9F5F6] dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : setsData.results.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#F2BED1] mx-auto" />
              <h3 className="text-base sm:text-lg font-black">No matching JLPT {selectedLevel} sets</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {readyOnly
                  ? `Turn off "Graded Only" to browse all ${activeLevelInfo?.total_sets || 0} ${selectedLevel} practice sets.`
                  : 'Try clearing your search or switching category.'}
              </p>
              {readyOnly && (
                <button
                  type="button"
                  onClick={() => setReadyOnly(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black cursor-pointer"
                >
                  Show All {selectedLevel} Sets
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {setsData.results.map((s) => {
                  const mins = Math.max(1, Math.round((s.time_limit_seconds || 1080) / 60));
                  return (
                    <Link
                      key={s.id}
                      href={`/jlpt/test/${s.id}`}
                      className="group rounded-2xl border border-[#FDCEDF] dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#F2BED1] hover:bg-[#F9F5F6]/40 dark:hover:border-slate-600 transition p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-2xs hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black">
                              {s.level}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#F8E8EE] dark:bg-slate-800 text-[#8A2247] dark:text-slate-300 text-[10px] font-extrabold">
                              {s.category}
                            </span>
                          </div>
                          {s.is_ready ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" /> Graded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F9F5F6] dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[#FDCEDF] dark:border-slate-700 text-[10px] font-bold">
                              Preview
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] transition-colors leading-snug">
                          {s.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-[#C23B6B]" />
                            {s.question_count} Qs
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {mins}m
                          </span>
                          {s.user_best_score !== null && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold">
                              <Award className="w-3.5 h-3.5" />
                              Best: {s.user_best_score}/{s.question_count}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-1.5 ${
                          s.is_ready
                            ? 'bg-[#C23B6B] group-hover:bg-[#A32D58] text-white'
                            : 'bg-slate-900 group-hover:bg-[#C23B6B] dark:bg-slate-800 text-white'
                        }`}
                      >
                        <span>{s.is_ready ? 'Start Mock Exam' : 'Preview Questions'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {setsData.total_pages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#F8E8EE] dark:border-slate-800 pt-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Page {setsData.page || page} / {setsData.total_pages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#FDCEDF] dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-[#F9F5F6] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={page >= setsData.total_pages}
                      onClick={() => setPage((p) => Math.min(setsData.total_pages, p + 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#FDCEDF] dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-[#F9F5F6] cursor-pointer"
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
