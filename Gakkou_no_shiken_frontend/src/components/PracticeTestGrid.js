'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatTimeLimit, getCategoryLabel } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import ScrollReveal from './ScrollReveal';
import { getMyResults } from '@/lib/api';
import {
  Lock,
  Clock,
  ArrowRight,
  CheckCircle2,
  Zap,
  PlusCircle,
  Layers,
  Headphones,
  Bell,
} from 'lucide-react';

const LeadCaptureModal = dynamic(() => import('./LeadCaptureModal'), { ssr: false });

export default function PracticeTestGrid({
  practiceTests = [],
  title = 'Practice Mock Exams',
  subtitle = 'Official-style online practice tests with immediate scoring.',
  catKey = 'basic',
}) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [tests, setTests] = useState(practiceTests || []);
  const [loading, setLoading] = useState(!practiceTests || practiceTests.length === 0);
  const [userAttemptsMap, setUserAttemptsMap] = useState({});

  // Modals state
  const [leadModal, setLeadModal] = useState(false);

  useEffect(() => {
    if (practiceTests && practiceTests.length > 0) {
      setTests(practiceTests);
      setLoading(false);
    }
  }, [practiceTests]);

  useEffect(() => {
    // Client-side real-time fetch to guarantee live data
    import('@/lib/api').then(({ getTests }) => {
      getTests(catKey)
        .then((res) => {
          const list = res?.tests || (Array.isArray(res) ? res : []);
          if (list && list.length > 0) {
            setTests(list);
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    });
  }, [catKey]);

  // Fetch logged in user's attempts to display best score / completed badge
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

  const getCardTheme = (test) => {
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
    if (catKey === 'skill') {
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
    <div className="space-y-3 sm:space-y-6">
      <ScrollReveal variant="up" duration={600}>
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3.5">
            <span
              className={`inline-flex items-center justify-center px-2 sm:px-2.5 h-7 sm:h-10 min-w-[2rem] sm:min-w-[2.5rem] rounded-lg sm:rounded-2xl ${
                catKey === 'skill'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-rose-600 to-japan-red shadow-red-500/20'
              } text-white text-[10px] sm:text-xs font-black shadow-md tracking-wider`}
            >
              {catKey === 'skill' ? 'SSW' : 'JFT'}
            </span>
            <div>
              <h2 className="text-sm sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {loading && tests.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 sm:h-5 w-16 sm:w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 sm:h-5 w-12 sm:w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
              <div className="h-5 sm:h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-3 sm:h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-md"></div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-8 sm:h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {tests.map((test, idx) => {
            const diff = getDifficultyBadge(test, idx);
            const userAttempt = userAttemptsMap[test.id];
            const cardTheme = getCardTheme(test);

            return (
              <ScrollReveal
                key={test.id}
                variant="up"
                delay={Math.min(idx * 60, 300)}
                duration={600}
                className="h-full"
              >
                <div className={`group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl ${cardTheme.cardBorderHover} hover:shadow-xl ${cardTheme.cardGlowHover} transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs h-full`}>
                  {/* Top Clean Brand Accent Strip */}
                  <div className={`h-1 sm:h-1.5 w-full ${cardTheme.topBar}`}></div>

                  <div className="p-2.5 sm:p-6 flex-grow flex flex-col justify-between space-y-2 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Top Badges: Difficulty + Status / Login Requirement */}
                      <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                        {/* Difficulty Pill */}
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black border ${diff.color}`}
                        >
                          {diff.label}
                        </span>

                        {/* User Completion / Access Badge */}
                        <div className="flex items-center gap-1">
                          {userAttempt ? (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{userAttempt.scaled_score}/250</span>
                            </span>
                          ) : test.requires_account ? (
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-extrabold border ${cardTheme.badge}`}>
                              <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              <span className="hidden xs:inline">{t('requires_login')}</span>
                              <span className="xs:hidden">Login</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-extrabold border ${cardTheme.badge}`}>
                              <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-500" />
                              <span>{t('free_open')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3 className={`text-xs sm:text-lg font-black text-slate-900 dark:text-white ${cardTheme.titleHover} transition-colors leading-snug line-clamp-2`}>
                        {test.title}
                      </h3>

                      {/* Test Specs: Time • 4 Sections (Without 47 Qs) */}
                      <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 sm:px-2 rounded-md border border-slate-100 dark:border-slate-700">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                          <span>{formatTimeLimit(test.time_limit_seconds)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 sm:px-2 rounded-md border border-slate-100 dark:border-slate-700">
                          <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500" />
                          <span>4 {t('sections')}</span>
                        </span>
                      </div>

                      {/* Description (desktop view) */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal hidden sm:block">
                        {test.description || 'Authentic Prometric CBT simulator with native listening audio and instant CEFR score report.'}
                      </p>
                    </div>

                    {/* Card Action: Direct Start Exam Link */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/test/${test.id}`}
                        className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-black text-[11px] sm:text-sm transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${cardTheme.button}`}
                      >
                        <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{t('start_exam')}</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        /* Compact, Modern Coming Soon Block with Lead Capture */
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>{t('coming_soon')}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {t('coming_soon_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {t('coming_soon_desc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setLeadModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl transition-all text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{t('get_notified')}</span>
            </button>

            {user?.is_staff && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/tests/test/add/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 sm:py-3 rounded-2xl border border-white/15 text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Admin Add</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Lead Capture Notification Modal */}
      <LeadCaptureModal
        isOpen={leadModal}
        onClose={() => setLeadModal(false)}
        sectorName={catKey === 'skill' ? 'SSW Skill Tests' : 'JFT-Basic Tests'}
      />
    </div>
  );
}
