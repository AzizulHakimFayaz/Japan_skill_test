'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { formatTimeLimit, getCategoryLabel } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import ScrollReveal from './ScrollReveal';
import { getMyResults } from '@/lib/api';

const PreExamAudioCheck = dynamic(() => import('./PreExamAudioCheck'), { ssr: false });
const SectionPracticeModal = dynamic(() => import('./SectionPracticeModal'), { ssr: false });
const LeadCaptureModal = dynamic(() => import('./LeadCaptureModal'), { ssr: false });
import {
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  PlusCircle,
  Award,
  Layers,
  BookOpen,
  Headphones,
  Bell,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

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
  const [audioCheckModal, setAudioCheckModal] = useState({ isOpen: false, testId: null, testTitle: '' });
  const [sectionModal, setSectionModal] = useState({ isOpen: false, testId: null, testTitle: '' });
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

  const openAudioCheck = (test) => {
    setAudioCheckModal({
      isOpen: true,
      testId: test.id,
      testTitle: test.title,
    });
  };

  const openSectionDrills = (test) => {
    setSectionModal({
      isOpen: true,
      testId: test.id,
      testTitle: test.title,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <ScrollReveal variant="up" duration={600}>
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span
              className={`inline-flex items-center justify-center px-2.5 h-8 sm:h-10 min-w-[2.2rem] sm:min-w-[2.5rem] rounded-xl sm:rounded-2xl ${
                catKey === 'skill'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-rose-600 to-japan-red shadow-red-500/20'
              } text-white text-[11px] sm:text-xs font-black shadow-md tracking-wider`}
            >
              {catKey === 'skill' ? 'SSW' : 'JFT'}
            </span>
            <div>
              <h2 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>
          <span className="text-[10px] sm:text-sm text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            {tests.length} {t('available_tests')}
          </span>
        </div>
      </ScrollReveal>

      {loading && tests.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((n) => (
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
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tests.map((test, idx) => {
            const diff = getDifficultyBadge(test, idx);
            const userAttempt = userAttemptsMap[test.id];

            return (
              <ScrollReveal
                key={test.id}
                variant="up"
                delay={Math.min(idx * 75, 400)}
                duration={700}
                className="h-full"
              >
                <div className="group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl hover:border-japan-red/40 dark:hover:border-rose-500/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs h-full">
                  {/* Top Clean Brand Accent Strip */}
                  <div
                    className={`h-1.5 w-full ${
                      catKey === 'skill'
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600'
                        : 'bg-gradient-to-r from-japan-red via-rose-500 to-rose-600'
                    }`}
                  ></div>

                  <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Top Badges: Difficulty + Status / Login Requirement */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Difficulty Pill */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black border ${diff.color}`}
                        >
                          {diff.label}
                        </span>

                        {/* User Completion / Access Badge */}
                        <div className="flex items-center gap-1.5">
                          {userAttempt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                {t('best_score')}: {userAttempt.scaled_score}/250
                              </span>
                            </span>
                          ) : test.requires_account ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{t('requires_login')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                              <span>{t('free_open')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                        {test.title}
                      </h3>

                      {/* Test Specs: Time • Questions • 4 Sections */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{formatTimeLimit(test.time_limit_seconds)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>4 {t('sections')} (47 Qs)</span>
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {test.description || 'Authentic Prometric CBT simulator with native listening audio and instant CEFR score report.'}
                      </p>
                    </div>

                    {/* Card Actions: Start Exam & Section Practice */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        type="button"
                        onClick={() => openAudioCheck(test)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${
                          catKey === 'skill'
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
                            : 'bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-red-700 text-white shadow-red-500/20'
                        }`}
                      >
                        <Headphones className="w-4 h-4" />
                        <span>{t('start_exam')}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Secondary Section-wise practice button */}
                      <button
                        type="button"
                        onClick={() => openSectionDrills(test)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('practice_section')} (10–15m)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        /* Compact, Modern Coming Soon Block with Lead Capture */
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>{t('coming_soon')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('coming_soon_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {t('coming_soon_desc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setLeadModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl transition-all text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{t('get_notified')}</span>
            </button>

            {user?.is_staff && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/tests/test/add/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-2xl border border-white/15 text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Admin Add</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Pre-Exam Audio Check Modal */}
      <PreExamAudioCheck
        isOpen={audioCheckModal.isOpen}
        onClose={() => setAudioCheckModal({ isOpen: false, testId: null, testTitle: '' })}
        testId={audioCheckModal.testId}
        testTitle={audioCheckModal.testTitle}
      />

      {/* Section-Wise Practice Selection Modal */}
      <SectionPracticeModal
        isOpen={sectionModal.isOpen}
        onClose={() => setSectionModal({ isOpen: false, testId: null, testTitle: '' })}
        testId={sectionModal.testId}
        testTitle={sectionModal.testTitle}
      />

      {/* Lead Capture Notification Modal */}
      <LeadCaptureModal
        isOpen={leadModal}
        onClose={() => setLeadModal(false)}
        sectorName={catKey === 'skill' ? 'SSW Skill Tests' : 'JFT-Basic Tests'}
      />
    </div>
  );
}
