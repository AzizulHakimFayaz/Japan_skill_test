'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getTests, getMyResults } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import ScrollReveal from '@/components/ScrollReveal';
import { formatTimeLimit } from '@/lib/utils';
import dynamic from 'next/dynamic';
import {
  BookOpen,
  Layers,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Headphones,
  Home,
  ChevronRight,
  Sparkles,
  Zap,
  Hourglass,
  Bell,
} from 'lucide-react';
import ScheduledCountdownBadge from '@/components/ScheduledCountdownBadge';

const LeadCaptureModal = dynamic(() => import('@/components/LeadCaptureModal'), { ssr: false });

function AllTestsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(initialCategory); // 'all' | 'basic' | 'skill' | 'free'
  const [searchQuery, setSearchQuery] = useState('');
  const [userAttemptsMap, setUserAttemptsMap] = useState({});
  const [unlockedMap, setUnlockedMap] = useState({});
  const [leadModal, setLeadModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState('');

  useEffect(() => {
    getTests()
      .then((data) => {
        const all = data?.tests || [
          ...(data?.tests_by_category?.basic || []),
          ...(data?.tests_by_category?.skill || []),
        ];
        setTests(all);
      })
      .catch((err) => {
        console.error('Failed to fetch all tests:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getMyResults()
        .then((data) => {
          if (data?.attempts && Array.isArray(data.attempts)) {
            const map = {};
            data.attempts.forEach((att) => {
              const tid = att.test_id || att.test?.id;
              if (tid) {
                if (!map[tid] || (att.scaled_score || 0) > (map[tid].scaled_score || 0)) {
                  map[tid] = {
                    scaled_score: att.scaled_score,
                    passed: att.passed,
                    cefr_level: att.cefr_level,
                  };
                }
              }
            });
            setUserAttemptsMap(map);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      // Category filter
      if (selectedTab === 'basic' && test.category !== 'basic') return false;
      if (selectedTab === 'skill' && test.category !== 'skill') return false;
      if (selectedTab === 'free' && test.requires_account) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (test.title || '').toLowerCase().includes(query);
        const descMatch = (test.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }, [tests, selectedTab, searchQuery]);

  const getDifficultyBadge = (test, idx) => {
    if (test.is_actual_exam_demo) {
      return {
        label: t('diff_diagnostic'),
        color: 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
      };
    }
    if (idx === 0) {
      return {
        label: t('diff_introductory'),
        color: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
      };
    }
    return {
      label: t('diff_standard'),
      color: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
    };
  };

  const getCardTheme = (test, isScheduled) => {
    if (isScheduled) {
      return {
        isFree: false,
        topBar: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-rose-500',
        cardBorderHover: 'hover:border-amber-500/50 dark:hover:border-amber-400/50',
        cardGlowHover: 'hover:shadow-amber-500/15 dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
        titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
        button: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-amber-500/25',
        badge: 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs',
      };
    }

    const isFree = !test.requires_account;
    if (isFree) {
      return {
        isFree: true,
        topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
        cardBorderHover: 'hover:border-emerald-500/40 dark:hover:border-emerald-400/50',
        cardGlowHover: 'hover:shadow-emerald-500/10 dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
        titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        button: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25',
        badge: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs',
      };
    }
    if (test.category === 'skill') {
      return {
        isFree: false,
        topBar: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600',
        cardBorderHover: 'hover:border-amber-500/40 dark:hover:border-amber-400/50',
        cardGlowHover: 'hover:shadow-amber-500/10 dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
        button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20',
        badge: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      };
    }
    return {
      isFree: false,
      topBar: 'bg-gradient-to-r from-japan-red via-rose-500 to-rose-600',
      cardBorderHover: 'hover:border-japan-red/40 dark:hover:border-rose-500/50',
      cardGlowHover: 'hover:shadow-red-500/10 dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.12)]',
      titleHover: 'group-hover:text-japan-red dark:group-hover:text-rose-400',
      button: 'bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-red-700 text-white shadow-red-500/20',
      badge: 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
    };
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">All Mock Tests</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-japan-navy text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-japan-red" />
          <span>CBT Practice Exam Catalog</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          All CBT Mock Tests (JFT-Basic &amp; SSW Skills)
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Practice official-format Prometric CBT mock tests with native listening audio, 60-minute timers, and instant CEFR score diagnostic reports.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tests ({tests.length})
          </button>

          <button
            onClick={() => setSelectedTab('basic')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === 'basic'
                ? 'bg-japan-red text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>JFT-Basic</span>
          </button>

          <button
            onClick={() => setSelectedTab('skill')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === 'skill'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SSW Skills</span>
          </button>

          <button
            onClick={() => setSelectedTab('free')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === 'free'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Free Tests</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mock tests by name or sector..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-japan-red transition-colors"
          />
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-md"></div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTests.map((test, idx) => {
            const isScheduled = Boolean(
              test.scheduled_release_at &&
              !test.is_released &&
              !unlockedMap[test.id] &&
              (new Date(test.scheduled_release_at).getTime() > Date.now())
            );

            const diff = getDifficultyBadge(test, idx);
            const userAttempt = userAttemptsMap[test.id];
            const cardTheme = getCardTheme(test, isScheduled);

            return (
              <ScrollReveal
                key={test.id}
                variant="up"
                delay={Math.min(idx * 40, 200)}
                duration={500}
                className="h-full"
              >
                <div
                  className={`group bg-white dark:bg-slate-900/90 border ${
                    isScheduled
                      ? 'border-amber-400/60 dark:border-amber-700/60 shadow-amber-500/10'
                      : 'border-slate-200/90 dark:border-slate-800'
                  } rounded-3xl ${cardTheme.cardBorderHover} hover:shadow-xl ${cardTheme.cardGlowHover} transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs h-full`}
                >
                  <div className={`h-1.5 w-full ${cardTheme.topBar}`}></div>

                  <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        {isScheduled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <Hourglass className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                            <span>{t('scheduled_badge')}</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black border ${diff.color}`}
                          >
                            {diff.label}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {userAttempt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{userAttempt.scaled_score}/250</span>
                            </span>
                          ) : isScheduled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Locked</span>
                            </span>
                          ) : test.requires_account ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${cardTheme.badge}`}
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>{t('requires_login')}</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${cardTheme.badge}`}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                              <span>{t('free_open')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-black text-slate-900 dark:text-white ${cardTheme.titleHover} transition-colors leading-snug`}
                      >
                        {test.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{formatTimeLimit(test.time_limit_seconds)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>4 {t('sections')}</span>
                        </span>
                      </div>

                      {/* Description with Blur Preview if Scheduled */}
                      {isScheduled ? (
                        <div className="relative pt-1">
                          <div className="filter blur-[3px] opacity-40 select-none pointer-events-none">
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {test.description ||
                                'Authentic Prometric CBT simulator with native listening audio and instant CEFR score report.'}
                            </p>
                          </div>

                          <div className="mt-2">
                            <ScheduledCountdownBadge
                              targetDate={test.scheduled_release_at}
                              onUnlock={() => {
                                setUnlockedMap((prev) => ({ ...prev, [test.id]: true }));
                              }}
                              size="card"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {test.description ||
                            'Authentic Prometric CBT simulator with native listening audio and instant CEFR score report.'}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      {isScheduled ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSector(test.title);
                              setLeadModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>{t('remind_me_btn')}</span>
                          </button>

                          {user?.is_staff && (
                            <Link
                              href={`/test/${test.id}?preview=admin`}
                              className="w-full flex items-center justify-center gap-1 py-1 px-3 text-[11px] font-bold text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                            >
                              <span>Admin CBT Preview ↗</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={`/test/${test.id}`}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${cardTheme.button}`}
                        >
                          <span>{t('start_exam')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No mock tests found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or selecting a different category tab.
          </p>
          <button
            onClick={() => {
              setSelectedTab('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-japan-red hover:underline pt-1 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Lead Capture Alert Modal */}
      <LeadCaptureModal
        isOpen={leadModal}
        onClose={() => setLeadModal(false)}
        sectorName={selectedSector || 'JFT & SSW Mock Tests'}
      />
    </div>
  );
}

export default function AllTestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Mock Tests Catalog...</p>
      </div>
    }>
      <AllTestsContent />
    </Suspense>
  );
}
