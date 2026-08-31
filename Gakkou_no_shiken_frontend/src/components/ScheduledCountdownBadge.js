'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Hourglass, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function ScheduledCountdownBadge({
  targetDate,
  onUnlock = null,
  size = 'card', // 'compact' | 'card' | 'hero' | 'pill'
  showDateLabel = true,
}) {
  const { t, language } = useLanguage();

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const difference = new Date(targetDate).getTime() - new Date().getTime();
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPassed: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [hasUnlocked, setHasUnlocked] = useState(false);

  useEffect(() => {
    // Initial calculation
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.isPassed && !hasUnlocked) {
      setHasUnlocked(true);
      if (onUnlock) onUnlock();
    }

    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);

      if (current.isPassed && !hasUnlocked) {
        setHasUnlocked(true);
        clearInterval(interval);
        if (onUnlock) onUnlock();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, hasUnlocked, onUnlock]);

  if (!targetDate || (timeLeft.isPassed && hasUnlocked)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{t('released_now')}</span>
      </span>
    );
  }

  const formatUnit = (num) => String(num).padStart(2, '0');

  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleString(
        language === 'bn' ? 'bn-BD' : language === 'ja' ? 'ja-JP' : 'en-US',
        {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      )
    : '';

  // Compact Pill Display (for mini card headers)
  if (size === 'pill') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 dark:bg-amber-950/60 border border-amber-400/40 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-[10px] font-black tracking-wide shadow-2xs backdrop-blur-md">
        <Hourglass className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
        <span className="font-mono">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {formatUnit(timeLeft.hours)}:{formatUnit(timeLeft.minutes)}:{formatUnit(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  // Hero Size (for Waiting Room / Exam detail page)
  if (size === 'hero') {
    return (
      <div className="space-y-4 text-center">
        {/* Glow Halo Card */}
        <div className="relative inline-flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-2xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest mb-2.5 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{t('unlocks_in')}</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          {/* Time Segment Boxes */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-4 font-mono">
            <div className="flex flex-col items-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 min-w-[54px] sm:min-w-[85px]">
              <span className="text-lg sm:text-4xl font-black text-amber-400">
                {formatUnit(timeLeft.days)}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">
                Days
              </span>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 min-w-[54px] sm:min-w-[85px]">
              <span className="text-lg sm:text-4xl font-black text-white">
                {formatUnit(timeLeft.hours)}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">
                Hours
              </span>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 min-w-[54px] sm:min-w-[85px]">
              <span className="text-lg sm:text-4xl font-black text-white">
                {formatUnit(timeLeft.minutes)}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">
                Mins
              </span>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 min-w-[54px] sm:min-w-[85px]">
              <span className="text-lg sm:text-4xl font-black text-rose-400 animate-pulse">
                {formatUnit(timeLeft.seconds)}
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">
                Secs
              </span>
            </div>
          </div>

          {showDateLabel && formattedDate && (
            <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-semibold bg-white/5 px-2.5 sm:px-3 py-1 rounded-full border border-white/10">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Release Time: <strong className="text-white">{formattedDate}</strong></span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Card Overlay Widget (for Practice Test Grid / Explorer)
  return (
    <div className="w-full bg-slate-900/95 dark:bg-[#060913]/95 border border-amber-500/35 dark:border-amber-600/40 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-lg backdrop-blur-xl space-y-1.5 sm:space-y-2.5">
      <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 sm:pb-2">
        <div className="flex items-center gap-1 sm:gap-1.5 text-amber-400 text-[10px] sm:text-xs font-black tracking-wider uppercase">
          <Hourglass className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
          <span>{t('unlocks_in')}</span>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-extrabold border border-amber-500/30">
          <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          <span>Scheduled</span>
        </span>
      </div>

      {/* Digits Grid */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 text-center font-mono">
        <div className="bg-white/5 dark:bg-white/5 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-white/5">
          <div className="text-xs sm:text-base font-black text-amber-300">
            {formatUnit(timeLeft.days)}
          </div>
          <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Days</div>
        </div>

        <div className="bg-white/5 dark:bg-white/5 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-white/5">
          <div className="text-xs sm:text-base font-black text-white">
            {formatUnit(timeLeft.hours)}
          </div>
          <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Hours</div>
        </div>

        <div className="bg-white/5 dark:bg-white/5 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-white/5">
          <div className="text-xs sm:text-base font-black text-white">
            {formatUnit(timeLeft.minutes)}
          </div>
          <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Mins</div>
        </div>

        <div className="bg-white/5 dark:bg-white/5 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border border-white/5">
          <div className="text-xs sm:text-base font-black text-rose-400 animate-pulse">
            {formatUnit(timeLeft.seconds)}
          </div>
          <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Secs</div>
        </div>
      </div>

      {showDateLabel && formattedDate && (
        <div className="text-center text-[9px] sm:text-[10px] text-slate-400 font-medium truncate pt-0.5">
          📅 <span>{formattedDate}</span>
        </div>
      )}
    </div>
  );
}
