'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ShieldCheck, Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import AdsterraBanner300x250 from './AdsterraBanner300x250';

/**
 * Helper to mark Pre-Exam Ad Gate as cleared in sessionStorage
 * so the target exam page knows the candidate already watched the pre-exam ad
 * while allowing a full clean browser navigation (`window.location.href`) that
 * completely unloads all ad scripts before the timed CBT exam starts.
 */
export function markPreExamAdCleared() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('gns_pre_ad_cleared', String(Date.now()));
    } catch {
      // ignore storage errors
    }
  }
}

export function hasRecentPreExamAdClearance() {
  if (typeof window === 'undefined') return false;
  try {
    const ts = Number(sessionStorage.getItem('gns_pre_ad_cleared') || '0');
    return Boolean(ts && Date.now() - ts < 120000);
  } catch {
    return false;
  }
}

export function clearPreExamAdToken() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('gns_pre_ad_cleared');
    } catch {
      // ignore
    }
  }
}

/**
 * Pre-Exam & Post-Exam Sponsor Interstitial Gate
 * - Displays 16:9 Sponsor Stage + Adsterra 300x250 frame
 * - Enforces a mandatory countdown before viewing official exam results (`phase="post"`).
 */
export default function ExamAdGateModal({
  isOpen,
  phase = 'pre', // 'pre' | 'post'
  testTitle = '',
  durationSeconds = 10,
  isReadyToProceed = true,
  statusMessage = '',
  onComplete,
  onCancel,
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSecondsLeft(durationSeconds);
    }
  }
  const completedRef = useRef(false);
  const videoUrl = process.env.NEXT_PUBLIC_SPONSOR_VIDEO_URL || '';

  const triggerComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Start countdown interval whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      return;
    }

    completedRef.current = false;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, durationSeconds]);

  // Auto-advance once countdown finishes and destination is ready
  useEffect(() => {
    if (!isOpen) return;
    if (secondsLeft > 0 || !isReadyToProceed) return;

    // For Pre-Exam: do not auto-start a timed exam in a hidden background tab
    // if the candidate clicked an ad that opened in a new tab; wait until tab is visible.
    if (phase === 'pre' && typeof document !== 'undefined' && document.hidden) {
      const handleVisibility = () => {
        if (!document.hidden) {
          setTimeout(() => triggerComplete(), 500);
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    }

    const timer = setTimeout(() => {
      triggerComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [isOpen, secondsLeft, isReadyToProceed, phase, triggerComplete]);

  if (!isOpen) return null;

  const isPre = phase === 'pre';
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((durationSeconds - secondsLeft) / durationSeconds) * 100))
  );
  const canProceedNow = secondsLeft === 0 && isReadyToProceed;

  const formattedCountdown = `0:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div
      className="no-print fixed inset-0 z-[9990] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={isPre ? 'Pre-Exam Sponsored Break' : 'Post-Exam Evaluation & Sponsored Break'}
    >
      {/* Optional Cancel Button (Pre-Exam only, before entering exam) */}
      {isPre && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      )}

      {/* Main Cinema Player Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        {/* Top Video Ad Chrome Bar */}
        <div className="bg-black/90 px-4 py-2.5 border-b border-slate-800/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">
              <Play className="w-2.5 h-2.5 fill-slate-950" />
              <span>Ad</span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">
              {isPre
                ? 'Sponsored Break • Preparing Free CBT Simulator'
                : 'Sponsored Break • Generating Practice Scorecard'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-amber-300">
              {secondsLeft > 0 ? formattedCountdown : 'Ready'}
            </span>
          </div>
        </div>

        {/* 16:9 Video / Sponsor Stage */}
        <div className="relative bg-gradient-to-br from-slate-950 via-[#0B1120] to-slate-900 min-h-[310px] sm:min-h-[340px] flex flex-col md:flex-row items-center justify-center gap-5 p-4 sm:p-6">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              playsInline
              className="w-full max-h-[320px] rounded-xl object-contain bg-black"
              onEnded={() => setSecondsLeft(0)}
            />
          ) : (
            <>
              {/* Left / Top Info Panel */}
              <div className="flex-1 space-y-3 text-center md:text-left max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  {isPre ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Ads During Your Live Exam</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>IRT Scaled Score &amp; CEFR Report</span>
                    </>
                  )}
                </div>

                <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                  {isPre
                    ? testTitle
                      ? `Loading "${testTitle}"`
                      : 'Preparing Your Prometric CBT Session'
                    : statusMessage || 'Evaluating Your Exam Answers...'}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPre
                    ? 'Watch this short sponsor message to unlock your full distraction-free mock exam. Your exam timer has NOT started yet.'
                    : 'Your answers are securely saved. Calculating section breakdown and practice pass/fail status after this brief sponsor message.'}
                </p>

                {/* Live Sub-status Pill */}
                <div className="pt-1 flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold text-slate-300">
                  {canProceedNow ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isPre ? 'Exam environment ready!' : 'Practice scorecard ready!'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-amber-300">
                      <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>
                        {secondsLeft > 0
                          ? isPre
                            ? `Starting exam in ${secondsLeft}s...`
                            : `Opening results in ${secondsLeft}s...`
                          : 'Finalizing score calculation...'}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right / Center Sponsor Ad Unit (300x250 Multimedia Frame) */}
              <div className="shrink-0 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-1.5 shadow-xl">
                <AdsterraBanner300x250 className="my-0!" />
              </div>
            </>
          )}
        </div>

        {/* Video Player Progress Scrubber Bar */}
        <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Player Controls & Skip / Continue CTA */}
        <div className="bg-black/95 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-medium text-center sm:text-left">
            {isPre
              ? '100% free Japanese CBT mock exams supported by sponsors'
              : 'Thank you for practicing on Gakkou No Shiken'}
          </p>

          <button
            type="button"
            disabled={!canProceedNow}
            onClick={triggerComplete}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              canProceedNow
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {canProceedNow ? (
              <>
                <span>{isPre ? 'Start Exam Now' : 'View Practice Result'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : secondsLeft > 0 ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>
                  {isPre ? `Exam unlocks in ${secondsLeft}s` : `Result unlocks in ${secondsLeft}s`}
                </span>
              </>
            ) : (
              <>
                <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Grading Answers...</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
