'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { Headphones, Volume2, Play, Pause, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreExamAudioCheck({ isOpen, onClose, testId, testTitle, targetUrl, isFree = false, catKey = 'basic' }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  const stopAudioTest = useCallback(() => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudioTest = useCallback(() => {
    try {
      if (isPlaying) {
        stopAudioTest();
        return;
      }

      const AudioCtxClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.3); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.6); // G5
      osc1.frequency.setValueAtTime(1046.50, now + 0.9); // C6

      osc1.connect(gain);
      osc1.start(now);
      osc1.stop(now + 1.8);
      oscillatorRef.current = osc1;

      setIsPlaying(true);

      osc1.onended = () => {
        setIsPlaying(false);
      };
    } catch (err) {
      console.warn('Audio context error:', err);
      setIsPlaying(false);
    }
  }, [isPlaying, stopAudioTest, volume]);

  useEffect(() => {
    return () => {
      stopAudioTest();
    };
  }, [stopAudioTest]);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
    }
  };

  const handleConfirmAndProceed = () => {
    stopAudioTest();
    if (onClose) onClose();
    if (targetUrl) {
      router.push(targetUrl);
    } else if (testId) {
      router.push(`/test/${testId}`);
    }
  };

  if (!isOpen) return null;

  const getModalTheme = () => {
    if (isFree) {
      return {
        badge: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
        waveActive: 'bg-gradient-to-t from-emerald-500 to-teal-400',
        playBtn: isPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-600 hover:bg-emerald-700 text-white',
        sliderAccent: 'accent-emerald-500',
        proceedBtn: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25',
      };
    }
    if (catKey === 'skill') {
      return {
        badge: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
        waveActive: 'bg-gradient-to-t from-amber-500 to-amber-300',
        playBtn: isPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-amber-500 hover:bg-amber-600 text-slate-950',
        sliderAccent: 'accent-amber-500',
        proceedBtn: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/25',
      };
    }
    return {
      badge: 'bg-rose-50 dark:bg-rose-950/80 text-japan-red dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80',
      waveActive: 'bg-gradient-to-t from-japan-red to-amber-400',
      playBtn: isPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-japan-red hover:bg-rose-700 text-white',
      sliderAccent: 'accent-japan-red',
      proceedBtn: 'bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-red-700 text-white shadow-red-500/25',
    };
  };

  const modalTheme = getModalTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAudioTest();
            if (onClose) onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${modalTheme.badge}`}>
            <Headphones className="w-3.5 h-3.5" />
            <span>Official CBT Readiness Check</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('audio_check_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('audio_check_subtitle')}
          </p>
        </div>

        {/* Audio Test Interactive Box */}
        <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Prometric Listening Chime Sample
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tests speaker / headphone output fidelity.
              </span>
            </div>

            <button
              type="button"
              onClick={playAudioTest}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${modalTheme.playBtn}`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{t('pause_sample')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('play_sample')}</span>
                </>
              )}
            </button>
          </div>

          {/* Simulated Sound Wave Visualizer */}
          <div className="h-10 bg-slate-900/90 rounded-xl px-4 flex items-center justify-center gap-1.5 overflow-hidden">
            {[14, 28, 45, 20, 60, 35, 75, 40, 85, 30, 70, 25, 50, 20, 35].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (volume + 0.2)) % 90)}%` : '15%',
                  transition: 'height 150ms ease-in-out',
                }}
                className={`w-1 rounded-full ${
                  isPlaying ? modalTheme.waveActive : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 pt-1">
            <Volume2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className={`w-full cursor-pointer ${modalTheme.sliderAccent}`}
            />
            <span className="text-[11px] font-mono font-bold text-slate-500 w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Checklist reminders */}
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Important Prometric Listening Rule:</strong>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              During the actual JFT-Basic CBT exam, listening audio plays <strong>only once</strong> per question. Make sure your headphones are properly plugged in.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              stopAudioTest();
              if (onClose) onClose();
            }}
            className="w-full sm:w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAndProceed}
            className={`w-full sm:w-2/3 py-3 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${modalTheme.proceedBtn}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('audio_confirmed')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
