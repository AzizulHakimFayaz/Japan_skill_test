'use client';

import React from 'react';
import Link from 'next/link';
import { formatTimeLimit, getCategoryLabel } from '@/lib/utils';
import { useAuth } from './AuthContext';
import ScrollReveal from './ScrollReveal';
import { Lock, Clock, Sparkles, ArrowRight, CheckCircle2, Zap, PlusCircle } from 'lucide-react';

export default function PracticeTestGrid({
  practiceTests = [],
  title = 'Practice Mock Exams',
  subtitle = 'Official-style online practice tests with immediate scoring.',
  catKey = 'basic',
}) {
  const { user } = useAuth();
  const [tests, setTests] = React.useState(practiceTests || []);

  React.useEffect(() => {
    if (practiceTests && practiceTests.length > 0) {
      setTests(practiceTests);
    }
  }, [practiceTests]);

  React.useEffect(() => {
    // Client-side real-time fetch to guarantee live data
    import('@/lib/api').then(({ getTests }) => {
      getTests(catKey)
        .then((res) => {
          const list = res?.tests || (Array.isArray(res) ? res : []);
          if (list && list.length > 0) {
            setTests(list);
          }
        })
        .catch(() => {});
    });
  }, [catKey]);

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
              <h2 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">{subtitle}</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-sm text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            {tests.length} {tests.length === 1 ? 'Available Test' : 'Tests'}
          </span>
        </div>
      </ScrollReveal>

      {tests.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {tests.map((test, idx) => (
            <ScrollReveal
              key={test.id}
              variant="up"
              delay={Math.min(idx * 75, 400)}
              duration={700}
              className="h-full"
            >
              <div className="group bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl hover:border-japan-red/40 dark:hover:border-rose-500/50 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.15)] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover-lift hover-shine-container mobile-app-card h-full">
                {/* Top Decor Accent Bar */}
                <div
                  className={`h-1.5 sm:h-2 bg-gradient-to-r ${
                    test.requires_account ? 'from-indigo-600 to-blue-500' : 'from-emerald-500 to-teal-400'
                  } animate-shimmer-bar`}
                ></div>

                <div className="p-3 sm:p-6 flex-grow flex flex-col justify-between space-y-2.5 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    {/* Card Header: Title & Access Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2.5">
                      <h3 className="text-xs sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                        {test.title}
                      </h3>

                      {/* Account / Access Badges */}
                      <div className="flex items-center gap-1 self-start flex-shrink-0">
                        {test.is_published === false && (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Draft (Staff)</span>
                          </span>
                        )}
                        {test.requires_account ? (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800 shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Req. Login</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Free &amp; Open</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Pill */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-extrabold ${
                          test.category === 'skill'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60'
                        }`}
                      >
                        {getCategoryLabel(test.category)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {test.description || 'Official-style practice test with timed sections & scoring.'}
                    </p>
                  </div>

                  {/* Card Footer: Time & Action Button */}
                  <div className="space-y-2 sm:space-y-3 pt-2.5 sm:pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    {/* Test Metadata */}
                    <div className="flex items-center justify-end text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-extrabold">
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                        <span>{formatTimeLimit(test.time_limit_seconds)}</span>
                      </div>
                    </div>

                    {/* Start Exam Button */}
                    <Link
                      href={`/test/${test.id}`}
                      className={`w-full flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-sm transition-all duration-300 active:scale-95 btn-touch-active group-hover:shadow-lg ${
                        test.requires_account
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-red-700 text-white shadow-md shadow-red-500/20 glow-red'
                      }`}
                    >
                      <span>Start Exam</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        /* Modern Coming Soon Empty State */
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-japan-navy to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest animate-pulse">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Coming Soon</span>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {catKey === 'skill'
                ? 'SSW Skill Evaluation Practice Exams — Coming Soon'
                : 'JFT-Basic Practice Mock Exams — Coming Soon'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Online practice exams for{' '}
              {catKey === 'skill'
                ? 'Specified Skilled Worker sector evaluation'
                : 'JFT-Basic examination'}{' '}
              are currently under preparation. New official-style mock test sets will be published here soon.
            </p>
          </div>

          {user?.is_staff && (
            <div className="pt-2">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/tests/test/add/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl transition-all text-xs shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New Test in Admin Panel</span>
              </a>
            </div>
          )}

          {/* Subtle background watermark */}
          <div className="absolute -right-4 -bottom-6 opacity-10 font-black text-8xl text-amber-300 pointer-events-none select-none">
            準備中
          </div>
        </div>
      )}
    </div>
  );
}
