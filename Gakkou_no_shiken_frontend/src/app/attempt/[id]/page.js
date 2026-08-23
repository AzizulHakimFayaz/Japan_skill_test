'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getAttemptResults } from '@/lib/api';
import { formatPrompt, renderUnderline, getCategoryLabel, getCategoryChipClass } from '@/lib/utils';
import confetti from 'canvas-confetti';

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
        <p className="text-sm font-bold text-slate-600">Calculating your official score report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-japan-red rounded-full flex items-center justify-center text-2xl font-black">
          ⚠
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Score report not available'}</h2>
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Action Bar & Retake Options */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              Exam Completed
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryChipClass(test.category)}`}>
              {getCategoryLabel(test.category)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-japan-navy mt-1">{test.title} Results</h1>
          {formattedDate && <p className="text-xs text-slate-500 mt-0.5">Submitted on {formattedDate}</p>}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/test/${test.id}`}
            className="inline-flex items-center gap-2 py-2 px-4 bg-japan-red hover:bg-japan-redhover text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
            </svg>
            Retake Exam
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            All Tests
          </Link>
        </div>
      </div>

      {/* OFFICIAL JAPAN FOUNDATION JFT-BASIC TEST RESULT SCORE CARD REPORT */}
      <div className="bg-white border-2 border-slate-800 rounded-2xl p-4 sm:p-10 shadow-xl font-sans text-slate-900 space-y-8 overflow-hidden">
        {/* Top Summary Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-4 border-b border-slate-200">
          {/* Left: Total Score & Assessment Result */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-6">
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                総合得点 :<br />
                <span className="text-xs text-slate-500 font-normal">Total Score</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
                {attempt.scaled_score}
              </div>
            </div>

            <div className="flex items-baseline gap-6">
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                判定結果 :<br />
                <span className="text-xs text-slate-500 font-normal">Assessment Results</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900">
                {attempt.assessment_level}
              </div>
            </div>
          </div>

          {/* Right: Range of Scores & Passing Score Criteria */}
          <div className="text-xs sm:text-sm space-y-2.5 text-slate-900 font-sans md:text-right">
            <div>
              <span className="font-bold text-xs sm:text-sm">得点範囲 : 10-250</span>
              <br />
              <span className="text-slate-500 text-[11px] sm:text-xs">Range of Scores</span>
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm leading-snug block">
                判定基準点 A1 : 145, A2.1 : 175, A2.2（A2）:200
              </span>
              <span className="text-slate-500 text-[11px] sm:text-xs">Passing Score</span>
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
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900">{attempt.scaled_score}</span>
              <div className="w-4 h-4 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center shadow-2xs mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              </div>
            </div>
          </div>

          {/* Multi-color Gradient Scale Bar */}
          <div className="w-full h-3 bg-slate-200 flex rounded-none relative overflow-hidden border border-slate-900">
            <div className="h-full bg-gradient-to-r from-pink-200 via-pink-400 to-pink-600" style={{ width: '56.25%' }}></div>
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '12.5%' }}></div>
            <div className="h-full bg-gradient-to-r from-yellow-300 to-lime-400" style={{ width: '10.41%' }}></div>
            <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-600" style={{ width: '20.84%' }}></div>
          </div>

          {/* Scale Ticks and Labels */}
          <div className="relative w-full text-xs font-sans text-slate-900 pt-1">
            <div className="absolute left-0 top-0 w-0.5 h-3 bg-black"></div>
            <div className="absolute left-[56.25%] top-0 w-0.5 h-3 bg-black"></div>
            <div className="absolute left-[68.75%] top-0 w-0.5 h-3 bg-black"></div>
            <div className="absolute left-[79.16%] top-0 w-0.5 h-3 bg-black"></div>
            <div className="absolute right-0 top-0 w-0.5 h-3 bg-black"></div>

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
        <div className="space-y-6 pt-8 border-t border-slate-300">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">セクション毎の正答率：</h2>
            <p className="text-xs text-slate-600 font-normal">The percentage of correct answers for each section</p>
          </div>

          <div className="space-y-6">
            {Object.entries(section_breakdown).map(([secKey, secData]) => (
              <div key={secKey} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-6">
                <div className="text-xs sm:text-sm leading-snug">
                  <div className="font-bold text-slate-900">{secData.name_ja}</div>
                  <div className="text-slate-600 text-xs">{secData.name_en}</div>
                </div>
                <div className="sm:col-span-2 relative py-3 px-3 sm:px-0">
                  <div className="w-full h-3 bg-[#E5E7EB] rounded-none"></div>
                  <div
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `calc(0.75rem + (100% - 1.5rem) * (${secData.pct} / 100))` }}
                  >
                    <span className="text-xs font-bold text-slate-900 mb-0.5">{secData.pct}%</span>
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
        <h2 className="text-xl font-bold text-japan-navy border-b border-slate-200 pb-2">Detailed Question Review</h2>

        {questions.map((question, qIdx) => (
          <div
            key={question.id}
            className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 ${
              question.is_answered_correctly ? 'border-green-200 bg-green-50/10' : 'border-red-200 bg-red-50/10'
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <span
                className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-xs font-semibold ${
                  question.is_answered_correctly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {question.is_answered_correctly ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Correct
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Incorrect
                  </>
                )}
              </span>
              <span className="text-xs font-bold font-mono text-slate-400">Question {qIdx + 1}</span>
            </div>

            <div className="text-base font-bold text-slate-800">
              {question.resolved_instruction && (
                <div
                  className="text-xs text-slate-500 font-normal mb-1"
                  dangerouslySetInnerHTML={{ __html: renderUnderline(question.resolved_instruction) }}
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: formatPrompt(question.prompt) }} />
            </div>

            {question.image_url && (
              <div className="inline-block bg-slate-50 border border-slate-200/60 rounded-xl p-2 max-w-sm">
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

                let optionStyles = 'bg-slate-50 border-slate-200 text-slate-700';
                if (isSelected && isCorrect) {
                  optionStyles = 'bg-green-100 border-green-300 text-green-900 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyles = 'bg-red-100 border-red-300 text-red-900 font-bold';
                } else if (isCorrect) {
                  optionStyles = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold';
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
                          className="max-h-20 sm:max-h-24 w-auto object-contain rounded border border-slate-300 bg-white p-1"
                        />
                      )}
                      {option.label && <span>{option.label}</span>}
                    </div>

                    {isSelected && isCorrect && (
                      <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded self-start sm:self-auto">
                        Your Answer (Correct)
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded self-start sm:self-auto">
                        Your Answer (Incorrect)
                      </span>
                    )}
                    {!isSelected && isCorrect && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded self-start sm:self-auto">
                        Correct Answer
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
