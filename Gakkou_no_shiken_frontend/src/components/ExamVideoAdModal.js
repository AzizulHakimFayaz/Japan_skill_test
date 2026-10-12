'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Award,
} from 'lucide-react';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/Gakkou.No.Shiken';

/**
 * Mandatory Pre-Exam Video Ad Interstitial Modal
 *
 * Requirements satisfied:
 * 1. Users must watch a mandatory sponsor video ad before starting an exam session.
 * 2. Opening the exam simultaneously opens the official Facebook page in another tab.
 * 3. Shows countdown timer, progress bar, audio toggle, and unlock CTA.
 */
export default function ExamVideoAdModal({
  isOpen,
  onClose,
  examUrl,
  examTitle = 'Prometric CBT Mock Exam',
  adDurationSeconds = 10,
}) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(adDurationSeconds);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(adDurationSeconds);
      setCanSkip(false);
      setIsPlaying(true);

      // Countdown interval
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, adDurationSeconds]);

  if (!isOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round(((adDurationSeconds - secondsRemaining) / adDurationSeconds) * 100)
  );

  const handleStartExam = () => {
    if (!canSkip && secondsRemaining > 0) return;
    try {
      window.open(FACEBOOK_PAGE_URL, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Popup action handled:', err);
    }
    if (onClose) onClose();
    if (examUrl) {
      router.push(examUrl);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-japan-navy to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-japan-red animate-ping" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-300">
              Mandatory Sponsor Video Ad
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>
                {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Ad Completed ✓'}
              </span>
            </span>
          </div>
        </div>

        {/* Video / Interactive Sponsor Showcase Player */}
        <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden group">
          {/* Authentic Video Player with Fallback Video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            loop
            className="w-full h-full object-cover"
            src="https://assets.mixkit.co/videos/preview/mixkit-tokyo-night-traffic-and-neon-lights-4228-large.mp4"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Frosted Video Overlay with Sponsor Branding */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-japan-red/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-black shadow-lg">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Gakkou No Shiken Official Partner</span>
              </div>

              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold shadow-lg transition-all"
              >
                <span>Visit Facebook Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1 text-white">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                Exam Loading: {examTitle}
              </span>
              <h3 className="text-sm sm:text-lg font-black tracking-tight drop-shadow-md">
                100% Free JFT-Basic & SSW Prometric CBT Practice for all Candidates
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium drop-shadow-sm max-w-lg">
                Thank you for watching our sponsor video. Your support keeps all 26 JAC textbooks, native listening audio, and CEFR mock exams completely free.
              </p>
            </div>
          </div>

          {/* Video Control Buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-japan-red via-rose-500 to-emerald-500 transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/90 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Official Prometric CBT Examination Simulator environment is ready.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {canSkip ? (
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Exam Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed"
                >
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Watching Video Ad ({secondsRemaining}s remaining)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
