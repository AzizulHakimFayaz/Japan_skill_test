'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import AdBanner from './AdBanner';

/**
 * Pre-Exam Sponsor / Ad Interstitial Modal
 *
 * Rules:
 * 1. Only displays when an ad is available to show.
 * 2. Does NOT open Facebook again (Facebook is opened only once upon initial button click).
 * 3. User can skip directly to the exam without being trapped.
 */
export default function ExamVideoAdModal({
  isOpen,
  onClose,
  examUrl,
  examTitle = 'Prometric CBT Mock Exam',
  adDurationSeconds = 5,
}) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(adDurationSeconds);

  // Countdown timer when open
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(adDurationSeconds);

      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, adDurationSeconds]);

  if (!isOpen) return null;

  const handleStartExam = () => {
    if (onClose) onClose();
    if (examUrl) {
      router.push(examUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
              Exam Partner Sponsor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>
                {secondsRemaining > 0 ? `${secondsRemaining}s` : 'Ready ✓'}
              </span>
            </span>

            {/* Instant Close Button */}
            <button
              type="button"
              onClick={handleStartExam}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Skip to Exam"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ad Container */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Preparing Exam: {examTitle}
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              100% Free JFT-Basic & SSW Prometric CBT Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thank you for supporting Gakkou No Shiken. Sponsored ads keep all practice tests and JAC textbook study tools completely free.
            </p>
          </div>

          {/* AdSense Unit */}
          <div className="min-h-[140px] flex items-center justify-center">
            <AdBanner
              slot="8435487820"
              format="auto"
              className="w-full my-0"
              title="Official Study Partner"
            />
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:px-6 sm:py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Prometric CBT Examination Simulator is loaded and ready.</span>
          </div>

          <button
            type="button"
            onClick={handleStartExam}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{secondsRemaining > 0 ? `Skip Ad & Start Exam (${secondsRemaining}s)` : 'Start Exam Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
