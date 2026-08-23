'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyResults } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';

export default function MyResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/accounts/login?next=/accounts/my-results');
      return;
    }

    if (isAuthenticated) {
      getMyResults()
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load test history');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">Loading Candidate Statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          ⚠
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link href="/" className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl">
          Back to Portal
        </Link>
      </div>
    );
  }

  const {
    total_attempts = 0,
    passed_attempts = 0,
    pass_rate = 0,
    highest_scaled_score = 0,
    avg_scaled_score = 0,
    highest_level = 'Below A1',
    section_stats = [],
    attempts = [],
  } = data || {};

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Candidate Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-japan-navy to-slate-900 text-white p-6 sm:p-12 shadow-2xl shadow-slate-900/20 border border-slate-800/80 mobile-app-card">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 flex items-center justify-center text-white text-2xl sm:text-4xl font-black shadow-xl shadow-red-500/30 border-2 sm:border-4 border-white/20 flex-shrink-0">
              {user?.username?.slice(0, 1).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{user?.username}</h1>
                {user?.is_staff && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    Staff Admin
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Candidate Profile</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate max-w-xs">
                {user?.email || 'No registered email'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/20 text-xs sm:text-sm active:scale-95 btn-touch-active"
            >
              Take Exam
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 btn-touch-active cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-8xl sm:text-9xl tracking-tighter text-rose-300 pointer-events-none select-none">
          成績
        </div>
      </div>

      {total_attempts > 0 ? (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-700 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Exams</span>
                <strong className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block">{total_attempts}</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Completed CBT</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Pass Rate</span>
                <strong className="text-2xl sm:text-3xl font-black text-emerald-600 leading-none block">{pass_rate}%</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">{passed_attempts} of {total_attempts} passed</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4m6 12v4m-2-2h4m4-16l-4 4m0 0l-4-4m4 4v12" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Max Score</span>
                <strong className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block">
                  {highest_scaled_score} <span className="text-xs text-slate-400 font-normal">/ 250</span>
                </strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Avg: {avg_scaled_score} pts</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 btn-touch-active mobile-app-card">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-japan-red flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-japan-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">CEFR Level</span>
                <strong className="text-xl sm:text-2xl font-black text-japan-red leading-none block">{highest_level}</strong>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">JFT Standard</span>
              </div>
            </div>
          </div>

          {/* Section Competency Breakdown Bars */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-slate-200/80 p-4 sm:p-8 shadow-2xs space-y-4 sm:space-y-6 mobile-app-card">
            <div>
              <span className="text-[11px] sm:text-xs font-extrabold text-japan-red uppercase tracking-wider block mb-0.5">
                Diagnostic Analysis
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cumulative Section Performance</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Accuracy breakdown across all 4 JFT exam sections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {section_stats.map((sec) => (
                <div key={sec.key} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">{sec.name_en}</strong>
                      <span className="text-[11px] text-slate-400 font-medium">{sec.name_ja}</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-900">{sec.pct}%</span>
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        sec.color === 'rose'
                          ? 'bg-rose-500'
                          : sec.color === 'indigo'
                          ? 'bg-indigo-500'
                          : sec.color === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${sec.pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
                    <span>
                      {sec.correct} of {sec.total} correct
                    </span>
                    <span className="font-bold text-slate-700">Pass: 80%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Attempt History List */}
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-slate-200/80 shadow-2xs overflow-hidden mobile-app-card">
            <div className="p-4 sm:p-8 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Exam Attempt History</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Record of completed practice tests.</p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-4">Exam Title</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Scaled Score</th>
                    <th className="px-6 py-4">CEFR Level</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{attempt.test_title}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold font-mono text-slate-900">
                        {attempt.scaled_score} <span className="text-xs text-slate-400 font-normal">/ 250</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-japan-red text-xs">{attempt.assessment_level}</td>
                      <td className="px-6 py-4">
                        {attempt.passed ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            NO PASS
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/attempt/${attempt.id}`}
                          className="text-xs font-bold text-japan-red hover:underline py-1 px-2 rounded hover:bg-red-50"
                        >
                          View Scorecard →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="p-4 space-y-3 btn-touch-active">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900 block leading-snug">{attempt.test_title}</strong>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {attempt.passed ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        ✓ PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                        NO PASS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400">Score: </span>
                      <strong className="text-slate-900 font-mono">{attempt.scaled_score} / 250</strong>
                    </div>
                    <Link href={`/attempt/${attempt.id}`} className="text-xs font-extrabold text-japan-red">
                      View Scorecard →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-japan-red flex items-center justify-center text-2xl font-black mx-auto">
            📝
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">No Exam Attempts Recorded Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Take your first JFT-Basic or SSW Skill practice mock exam to generate your score report and analyze your strengths.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md shadow-red-500/20 active:scale-95"
            >
              Browse Practice Exams →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
