'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getAttemptResults } from '@/lib/api';
import { formatPrompt, renderUnderline, getCategoryLabel, getCategoryChipClass } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AttemptResultsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAttemptResults(params.id)
      .then((res) => {
        setData(res);
        if (res.attempt?.passed) {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore if confetti fails
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load results');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-japan-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Calculating your official score report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          <AlertCircle className="w-8 h-8 text-japan-red" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || 'Score report not available'}</h2>
        <Link href="/" className="px-6 py-2.5 bg-japan-red text-white text-xs font-bold rounded-xl">
          Back to Portal
        </Link>
      </div>
    );
  }

  const { attempt, test, section_breakdown, questions } = data;

  const formattedDate = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Action Bar & Retake Options */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Exam Completed</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryChipClass(test.category)}`}>
              {getCategoryLabel(test.category)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-japan-navy dark:text-white mt-1">{test.title} Results</h1>
          {formattedDate && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submitted on {formattedDate}</p>}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/test/${test.id}`}
            className="inline-flex items-center gap-2 py-2 px-4 bg-japan-red hover:bg-japan-redhover text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Exam</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>All Tests</span>
          </Link>
        </div>
      </div>

      {/* OFFICIAL JAPAN FOUNDATION JFT-BASIC TEST RESULT SCORE CARD REPORT */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-700 rounded-2xl p-4 sm:p-10 shadow-xl font-sans text-slate-900 dark:text-white space-y-8 overflow-hidden">
        {/* Top Summary Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Left: Total Score & Assessment Result */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-6">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                総合得点 :<br />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Total Score</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white">
                {attempt.scaled_score}
              </div>
            </div>

            <div className="flex items-baseline gap-6">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                判定結果 :<br />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Assessment Results</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900 dark:text-white">
                {attempt.assessment_level}
              </div>
            </div>
          </div>

          {/* Right: Range of Scores & Passing Score Criteria */}
          <div className="text-xs sm:text-sm space-y-2.5 text-slate-900 dark:text-slate-200 font-sans md:text-right">
            <div>
              <span className="font-bold text-xs sm:text-sm">得点範囲 : 10-250</span>
              <br />
              <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">Range of Scores</span>
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm leading-snug block">
                判定基準点 A1 : 145, A2.1 : 175, A2.2（A2）:200
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">Passing Score</span>
            </div>
          </div>
        </div>

        {/* Total Score Gauge / Scale Slider Bar */}
        <div className="space-y-1 pt-2 pb-6">
          <div className="relative w-full h-8">
            <div
              className="absolute transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${attempt.scaled_score_percent}%` }}
            >
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">{attempt.scaled_score}</span>
              <div className="w-4 h-4 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center shadow-2xs mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              </div>
            </div>
          </div>

          {/* Multi-color Gradient Scale Bar */}
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 flex rounded-none relative overflow-hidden border border-slate-900 dark:border-slate-600">
            <div className="h-full bg-gradient-to-r from-pink-200 via-pink-400 to-pink-600" style={{ width: '56.25%' }}></div>
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '12.5%' }}></div>
            <div className="h-full bg-gradient-to-r from-yellow-300 to-lime-400" style={{ width: '10.41%' }}></div>
            <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-600" style={{ width: '20.84%' }}></div>
          </div>

          {/* Scale Ticks and Labels */}
          <div className="relative w-full text-xs font-sans text-slate-900 dark:text-slate-200 pt-1">
            <div className="absolute left-0 top-0 w-0.5 h-3 bg-black dark:bg-white"></div>
            <div className="absolute left-[56.25%] top-0 w-0.5 h-3 bg-black dark:bg-white"></div>
            <div className="absolute left-[68.75%] top-0 w-0.5 h-3 bg-black dark:bg-white"></div>
            <div className="absolute left-[79.16%] top-0 w-0.5 h-3 bg-black dark:bg-white"></div>
            <div className="absolute right-0 top-0 w-0.5 h-3 bg-black dark:bg-white"></div>

            <div className="flex justify-between items-start pt-3">
              <span className="text-[10px] sm:text-xs font-semibold">10</span>

              <div className="absolute left-[56.25%] transform -translate-x-1/2 text-center">
                <span className="font-bold text-[10px] sm:text-sm block">145</span>
                <span className="font-black text-xs sm:text-base">A1</span>
              </div>

              <div className="absolute left-[68.75%] transform -translate-x-1/2 text-center">
                <span className="font-bold text-[10px] sm:text-sm block">175</span>
                <span className="font-black text-xs sm:text-base">A2.1</span>
              </div>

              <div className="absolute left-[79.16%] transform -translate-x-1/2 text-center">
                <span className="font-bold text-[10px] sm:text-sm block">200</span>
                <span className="font-black text-xs sm:text-base">
                  <span className="sm:hidden">A2.2</span>
                  <span className="hidden sm:inline">A2.2（A2）</span>
                </span>
              </div>

              <span className="text-[10px] sm:text-xs font-semibold">250</span>
            </div>
          </div>
        </div>

        {/* Section Performance Percentages */}
        <div className="space-y-6 pt-8 border-t border-slate-300 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">セクション毎の正答率：</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">The percentage of correct answers for each section</p>
          </div>

          <div className="space-y-6">
            {Object.entries(section_breakdown).map(([secKey, secData]) => (
              <div key={secKey} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-6">
                <div className="text-xs sm:text-sm leading-snug">
                  <div className="font-bold text-slate-900 dark:text-white">{secData.name_ja}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs">{secData.name_en}</div>
                </div>
                <div className="sm:col-span-2 relative py-3 px-3 sm:px-0">
                  <div className="w-full h-3 bg-[#E5E7EB] dark:bg-slate-800 rounded-none"></div>
                  <div
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `calc(0.75rem + (100% - 1.5rem) * (${secData.pct} / 100))` }}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{secData.pct}%</span>
                    <div className="w-4 h-4 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-bold text-japan-navy dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Detailed Question Review</h2>

        {questions.map((question, qIdx) => (
          <div
            key={question.id}
            className={`border rounded-3xl p-6 shadow-xs space-y-4 ${
              question.is_answered_correctly
                ? 'border-green-200 dark:border-green-800/70 bg-white dark:bg-slate-900/90'
                : 'border-red-200 dark:border-red-800/70 bg-white dark:bg-slate-900/90'
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span
                className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-xs font-semibold ${
                  question.is_answered_correctly
                    ? 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                }`}
              >
                {question.is_answered_correctly ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span>Correct</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span>Incorrect</span>
                  </>
                )}
              </span>
              <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500">Question {qIdx + 1}</span>
            </div>

            <div className="text-base font-bold text-slate-800 dark:text-slate-100">
              {question.resolved_instruction && (
                <div
                  className="text-xs text-slate-500 dark:text-slate-400 font-normal mb-1"
                  dangerouslySetInnerHTML={{ __html: renderUnderline(question.resolved_instruction) }}
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: formatPrompt(question.prompt) }} />
            </div>

            {question.image_url && (
              <div className="inline-block bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl p-2 max-w-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={question.image_url} alt="Question illustration" className="max-h-48 w-auto rounded-lg object-contain" />
              </div>
            )}

            {question.audio_url && (
              <div className="p-3 bg-slate-900 text-white max-w-md rounded-xl">
                <audio controls src={question.audio_url} className="w-full"></audio>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2">
              {question.options.map((option) => {
                const isSelected = option.id === question.selected_option_id;
                const isCorrect = option.is_correct;

                let optionStyles = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                if (isSelected && isCorrect) {
                  optionStyles = 'bg-green-100 dark:bg-green-950/80 border-green-300 dark:border-green-700 text-green-900 dark:text-green-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyles = 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 font-bold';
                } else if (isCorrect) {
                  optionStyles = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold';
                }

                return (
                  <div
                    key={option.id}
                    className={`p-3 rounded-xl border text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      {option.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={option.image_url}
                          alt="Option illustration"
                          className="max-h-20 sm:max-h-24 w-auto object-contain rounded border border-slate-300 dark:border-slate-700 bg-white p-1"
                        />
                      )}
                      {option.label && <span>{option.label}</span>}
                    </div>

                    {isSelected && isCorrect && (
                      <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900/60 px-2 py-0.5 rounded self-start sm:self-auto flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-700 dark:text-green-300" />
                        <span>Your Answer (Correct)</span>
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-900/60 px-2 py-0.5 rounded self-start sm:self-auto flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-700 dark:text-red-300" />
                        <span>Your Answer (Incorrect)</span>
                      </span>
                    )}
                    {!isSelected && isCorrect && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded self-start sm:self-auto flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
                        <span>Correct Answer</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
