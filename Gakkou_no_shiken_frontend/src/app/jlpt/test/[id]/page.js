'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getJlptSetDetail, submitJlptSet } from '@/lib/api';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Globe,
  RotateCcw,
  BookOpen,
  Award,
  Send,
  AlertCircle,
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

function renderHighlighted(text, underline) {
  if (!text) return null;
  if (!underline || !text.includes(underline)) return <span>{text}</span>;
  const parts = text.split(underline);
  return (
    <>
      {parts.map((p, idx) => (
        <React.Fragment key={idx}>
          {p}
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

function formatTimer(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function JlptTestRunnerPage({ params }) {
  const resolvedParams = use(params);
  const setId = resolvedParams?.id;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [openHints, setOpenHints] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(1080);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [expLang, setExpLang] = useState('en');

  useEffect(() => {
    if (!setId) return;
    let active = true;
    setLoading(true);
    setError('');
    getJlptSetDetail(setId)
      .then((data) => {
        if (!active) return;
        setExam(data);
        setSecondsLeft(data?.time_limit_seconds || 1080);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Could not load this JLPT mock test.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setId]);

  // Countdown timer while taking test
  useEffect(() => {
    if (!exam || result) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, result]);

  const handleSubmit = async () => {
    if (!exam || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitJlptSet(exam.id, answers);
      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setOpenHints({});
    setResult(null);
    setSecondsLeft(exam?.time_limit_seconds || 1080);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            Loading JLPT Mock Test...
          </p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Unable to Load JLPT Set
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <Link
            href="/jlpt"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black"
          >
            <ArrowLeft className="w-4 h-4" /> Back to JLPT Hub
          </Link>
        </div>
      </div>
    );
  }

  const passagesById = {};
  (exam.passages || []).forEach((p) => {
    passagesById[p.id] = p;
  });

  const answeredCount = Object.keys(answers).length;
  const totalQ = (exam.questions || []).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      {/* Sticky Exam Topbar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/jlpt"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Back to JLPT Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black">
                  JLPT {exam.level}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {exam.category}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black truncate">{exam.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <>
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>{formatTimer(secondsLeft)}</span>
                </div>
                <div className="hidden sm:block text-xs font-bold text-slate-500 dark:text-slate-400">
                  {answeredCount}/{totalQ} Answered
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Grading...' : 'Submit Exam'}</span>
                </button>
              </>
            )}
            {result && (
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Test
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Notice if set is practice preview (no answer keys uploaded yet) */}
        {!exam.is_ready && !result && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-800 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Practice Preview Mode:</strong> Official answer keys and 7-language explanations for this set are currently being added. You can still practice all {totalQ} questions right now!
            </div>
          </div>
        )}

        {/* ================================================================
            RESULT SUMMARY + 7-LANGUAGE EXPLANATION SWITCHER (POST-SUBMISSION)
           ================================================================ */}
        {result && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                      result.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {result.is_ready
                      ? result.passed
                        ? 'Passed (≥ 60%)'
                        : 'Keep Practicing (< 60%)'
                      : 'Practice Completed'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    Score: {result.score} / {result.total_questions}{' '}
                    <span className="text-amber-300">({result.percentage}%)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Review every question below and switch explanations into your preferred language!
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/jlpt"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                  >
                    ← More JLPT Tests
                  </Link>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition cursor-pointer"
                  >
                    Retake This Set
                  </button>
                </div>
              </div>
            </div>

            {/* 7-Language Explanation Bar */}
            <div className="rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Explanation Language:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXPLANATION_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setExpLang(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      expLang === lang.code
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            QUESTIONS LIST (EXAM MODE OR POST-SUBMISSION REVIEW MODE)
           ================================================================ */}
        <div className="space-y-5">
          {(result ? result.review : exam.questions || []).map((q, idx) => {
            const passage = q.passage_id ? passagesById[q.passage_id] : null;
            const prevPassageId =
              idx > 0
                ? (result ? result.review : exam.questions)[idx - 1]?.passage_id
                : null;
            const showPassage = passage && passage.id !== prevPassageId;
            const userSelected = result ? q.user_answer_index : answers[q.id];
            const hintText = q.hints?.[expLang] || q.hints?.en || Object.values(q.hints || {})[0];
            const explanationText =
              q.explanation?.[expLang] ||
              q.explanation?.en ||
              Object.values(q.explanation || {}).find((v) => v && String(v).trim());

            return (
              <div key={q.id} className="space-y-3">
                {showPassage && (
                  <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-700 dark:text-indigo-300 mb-2">
                      <BookOpen className="w-4 h-4" /> Reading Passage
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium text-slate-800 dark:text-slate-200">
                      {passage.body_ja}
                    </p>
                  </div>
                )}

                <div
                  className={`rounded-2xl bg-white dark:bg-[#0f1629] border p-5 sm:p-6 shadow-xs ${
                    result
                      ? q.is_gradable
                        ? q.is_correct
                          ? 'border-emerald-300 dark:border-emerald-700/70'
                          : 'border-rose-300 dark:border-rose-700/70'
                        : 'border-slate-200 dark:border-slate-800'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black">
                        Q{idx + 1}
                      </span>
                      {q.section && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {q.section}
                        </span>
                      )}
                    </div>

                    {result && q.is_gradable && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                          q.is_correct
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
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

                    {!result && hintText && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{openHints[q.id] ? 'Hide Hint' : 'Hint'}</span>
                      </button>
                    )}
                  </div>

                  {q.instruction && (
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      {q.instruction}
                    </p>
                  )}

                  <p className="text-base sm:text-lg font-bold leading-relaxed mb-4">
                    {renderHighlighted(q.question, q.underline)}
                  </p>

                  {!result && openHints[q.id] && hintText && (
                    <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 text-xs text-amber-900 dark:text-amber-200">
                      <strong>💡 Hint:</strong> {hintText}
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(q.options || []).map((opt, optIdx) => {
                      const optNum = optIdx + 1;
                      const isPicked = userSelected === optNum;
                      const isCorrectOpt = result && q.answer_index === optNum;
                      const isWrongPick = result && isPicked && q.answer_index && q.answer_index !== optNum;

                      let btnStyle =
                        'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400';
                      if (!result && isPicked) {
                        btnStyle = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
                      } else if (isCorrectOpt) {
                        btnStyle =
                          'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black';
                      } else if (isWrongPick) {
                        btnStyle =
                          'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200';
                      }

                      return (
                        <button
                          key={optNum}
                          type="button"
                          disabled={Boolean(result)}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: optNum,
                            }))
                          }
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-bold transition ${
                            result ? 'cursor-default' : 'cursor-pointer'
                          } ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                              !result && isPicked
                                ? 'bg-white/20 text-white'
                                : isCorrectOpt
                                ? 'bg-emerald-600 text-white'
                                : isWrongPick
                                ? 'bg-rose-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {optNum}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isWrongPick && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Submission Explanation Box */}
                  {result && (
                    <div className="mt-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 p-4 space-y-2 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-black text-indigo-800 dark:text-indigo-300">
                        <span>
                          📖 Explanation (
                          {EXPLANATION_LANGUAGES.find((l) => l.code === expLang)?.label})
                        </span>
                        {q.answer_index ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Correct Answer: #{q.answer_index}{' '}
                            {q.answer_text || q.options?.[q.answer_index - 1] || ''}
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300 font-bold">
                            Answer key coming soon
                          </span>
                        )}
                      </div>

                      {explanationText ? (
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          {explanationText}
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {hintText && (
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                              <strong className="text-indigo-700 dark:text-indigo-300">
                                Sentence Meaning:
                              </strong>{' '}
                              {hintText}
                            </p>
                          )}
                          <p className="text-slate-500 dark:text-slate-400 italic text-xs">
                            {q.answer_index
                              ? 'Detailed explanation for this question is not uploaded yet — check back soon!'
                              : 'Official answer key & detailed explanation for this question are being updated soon.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Submit CTA */}
        {!result && totalQ > 0 && (
          <div className="pt-4 flex items-center justify-between rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              You have answered <strong>{answeredCount}</strong> of <strong>{totalQ}</strong> questions.
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-sm font-black shadow-lg cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Grading...' : 'Submit & View Explanations'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
