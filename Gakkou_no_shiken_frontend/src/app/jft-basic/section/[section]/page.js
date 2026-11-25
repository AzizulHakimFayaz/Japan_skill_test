'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { startJftSectionMock, submitJftSectionMock } from '@/lib/api';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Award,
  AlertCircle,
  Shuffle,
  Volume2,
} from 'lucide-react';

function formatTimer(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function JftSectionMockRunnerPage({ params }) {
  const resolved = use(params);
  const sectionKey = resolved?.section;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(720);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadFreshAttempt = useCallback(async () => {
    if (!sectionKey) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});

    let excludeIds = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`gns_jft_section_last_ids_${sectionKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) excludeIds = parsed;
        }
      } catch {}
    }

    try {
      const data = await startJftSectionMock(sectionKey, { excludeIds, count: 10 });
      setQuiz(data);
      setSecondsLeft(data?.time_limit_seconds || 720);
      // Persist immediately so even a refresh gets fresh questions next time
      if (typeof window !== 'undefined' && Array.isArray(data?.question_ids)) {
        try {
          localStorage.setItem(
            `gns_jft_section_last_ids_${sectionKey}`,
            JSON.stringify(data.question_ids)
          );
        } catch {}
      }
    } catch (err) {
      setError(err?.message || 'Could not load randomized questions for this JFT section.');
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => {
    loadFreshAttempt();
  }, [loadFreshAttempt]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || result) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, result]);

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitJftSectionMock(sectionKey, {
        questionIds: quiz.question_ids,
        answers,
      });
      setResult(res);

      // Save latest & best section points in localStorage so /jft-basic shows live per-section points!
      if (typeof window !== 'undefined' && res) {
        try {
          const raw = localStorage.getItem('gns_jft_section_scores');
          const allScores = raw ? JSON.parse(raw) : {};
          const prev = allScores[sectionKey] || {};
          const bestPoints = Math.max(Number(prev.best_points || 0), Number(res.section_points || 0));
          allScores[sectionKey] = {
            latest_points: res.section_points,
            best_points: bestPoints,
            max_points: res.max_points || 62.5,
            score: res.score,
            total_questions: res.total_questions,
            percentage: res.percentage,
            passed: res.passed,
            attempts: (prev.attempts || 0) + 1,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem('gns_jft_section_scores', JSON.stringify(allScores));
          localStorage.setItem(
            `gns_jft_section_last_ids_${sectionKey}`,
            JSON.stringify(res.question_ids || quiz.question_ids || [])
          );
        } catch {}
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Failed to submit section mock test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#DB1A1A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            Generating fresh randomized questions...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#DB1A1A] mx-auto" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Unable to Start Section Mock
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <Link
            href="/jft-basic#section-mocks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DB1A1A] text-white text-sm font-black"
          >
            <ArrowLeft className="w-4 h-4" /> Back to JFT-Basic
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQ = (quiz.questions || []).length;

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      {/* Sticky Exam Topbar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border-b border-[#CBE5E3] dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/jft-basic#section-mocks"
              className="p-2 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 hover:bg-[#CBE5E3] dark:hover:bg-slate-700 transition"
              title="Back to JFT-Basic"
            >
              <ArrowLeft className="w-4 h-4 text-[#2C687B] dark:text-[#8CC7C4]" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#DB1A1A] text-white text-[10px] font-black uppercase">
                  JFT Section Mock
                </span>
                <span className="text-xs font-bold text-[#2C687B] dark:text-[#8CC7C4] truncate">
                  {quiz.section_name_ja}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black truncate">{quiz.section_name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!result ? (
              <>
                <div className="px-3 py-1.5 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 text-xs font-black flex items-center gap-1.5 text-[#2C687B] dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-[#DB1A1A]" />
                  <span>{formatTimer(secondsLeft)}</span>
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-500">
                  {answeredCount}/{totalQ}
                </span>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Grading...' : 'Submit'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={loadFreshAttempt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> New Random Set
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Fresh Random Notice */}
        {!result && (
          <div className="rounded-2xl bg-[#EAF4F4] dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#2C687B] dark:text-[#8CC7C4]">
            <span className="inline-flex items-center gap-1.5">
              <Shuffle className="w-4 h-4 text-[#DB1A1A]" />
              <span>
                Randomized Set: <strong>{totalQ} questions</strong> ({quiz.fresh_questions_count} fresh unseen since your last attempt).
              </span>
            </span>
            <span>Max Section Score: {quiz.max_points} pts</span>
          </div>
        )}

        {/* RESULT CARD */}
        {result && (
          <div className="rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#8CC7C4] dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                    result.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/50 text-[#DB1A1A] dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {result.passed ? 'Section Passed (≥ 80%)' : 'Keep Practicing (< 80%)'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {result.section_points} / {result.max_points} Points{' '}
                  <span className="text-base sm:text-xl font-bold text-[#2C687B] dark:text-[#8CC7C4]">
                    ({result.score}/{result.total_questions} • {result.percentage}%)
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Your <strong>{result.section_name}</strong> score has been saved to your JFT-Basic dashboard! Start a new attempt anytime for fresh randomized questions.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href="/jft-basic#section-mocks"
                  className="px-4 py-2.5 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 hover:bg-[#CBE5E3] text-[#2C687B] dark:text-slate-200 text-xs font-extrabold transition"
                >
                  ← Back to All 4 Sections
                </Link>
                <button
                  type="button"
                  onClick={loadFreshAttempt}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Fresh Random Set</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          {(result ? result.review : quiz.questions || []).map((q, idx) => {
            const userSelected = result ? q.user_option_id : answers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-2xl bg-white dark:bg-[#0f1629] border p-5 sm:p-6 shadow-2xs space-y-4 ${
                  result
                    ? q.is_correct
                      ? 'border-emerald-300 dark:border-emerald-800'
                      : 'border-red-300 dark:border-red-800'
                    : 'border-[#CBE5E3] dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#2C687B] text-white text-xs font-black">
                    Q{idx + 1}
                  </span>
                  {result && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                        q.is_correct
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-50 dark:bg-red-950/60 text-[#DB1A1A] dark:text-red-300'
                      }`}
                    >
                      {q.is_correct ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  )}
                </div>

                {q.instruction && (
                  <p className="text-xs font-bold text-[#2C687B] dark:text-[#8CC7C4]">
                    {q.instruction}
                  </p>
                )}

                {q.audio_url && (
                  <div className="rounded-xl bg-[#EAF4F4] dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 p-3 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#DB1A1A] shrink-0" />
                    <audio controls src={q.audio_url} className="w-full h-9" />
                  </div>
                )}

                {q.image_url && (
                  <div className="rounded-xl overflow-hidden border border-[#CBE5E3] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.image_url}
                      alt={`Question ${idx + 1}`}
                      className="max-h-60 w-auto rounded-lg object-contain"
                    />
                  </div>
                )}

                {q.prompt && (
                  <p className="text-base sm:text-lg font-bold leading-relaxed whitespace-pre-line">
                    {q.prompt}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(q.options || []).map((opt, optIdx) => {
                    const isPicked = userSelected === opt.id;
                    const isCorrectOpt = result && opt.is_correct;
                    const isWrongPick = result && isPicked && !opt.is_correct;

                    let style =
                      'bg-white dark:bg-slate-900 border-[#CBE5E3] dark:border-slate-700 hover:border-[#2C687B]';
                    if (!result && isPicked) {
                      style = 'bg-[#2C687B] text-white border-[#2C687B] shadow-xs';
                    } else if (isCorrectOpt) {
                      style =
                        'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black';
                    } else if (isWrongPick) {
                      style =
                        'bg-red-50 dark:bg-red-950/50 border-[#DB1A1A] text-red-900 dark:text-red-200';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(result)}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-bold transition ${
                          result ? 'cursor-default' : 'cursor-pointer'
                        } ${style}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                            !result && isPicked
                              ? 'bg-[#DB1A1A] text-white'
                              : isCorrectOpt
                              ? 'bg-emerald-600 text-white'
                              : isWrongPick
                              ? 'bg-[#DB1A1A] text-white'
                              : 'bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-slate-300'
                          }`}
                        >
                          {optIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {opt.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={opt.image_url}
                              alt={opt.label || `Option ${optIdx + 1}`}
                              className="max-h-24 rounded-md object-contain"
                            />
                          ) : null}
                          {opt.label && <span>{opt.label}</span>}
                        </div>
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isWrongPick && <XCircle className="w-4 h-4 text-[#DB1A1A] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Submit CTA */}
        {!result && totalQ > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              Answered <strong>{answeredCount}</strong> of <strong>{totalQ}</strong> questions
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-sm font-black shadow-sm cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Grading...' : 'Submit & Check Section Points'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
