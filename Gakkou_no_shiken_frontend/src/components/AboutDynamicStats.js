'use client';

import React, { useEffect, useState } from 'react';
import { CheckCheck, Users, BookOpen, FileText, Globe, Sparkles } from 'lucide-react';
import { getPlatformStats } from '@/lib/api';

export default function AboutDynamicStats({ initialStats }) {
  const [stats, setStats] = useState(
    initialStats || {
      registered_candidates_display: '480+',
      registered_candidates: 480,
      total_books: 26,
      total_guides: 12,
      supported_languages: 10,
      prometric_fidelity: '100%',
      official_scaled_scoring: 250,
    }
  );
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPlatformStats()
      .then((data) => {
        if (mounted && data) {
          setStats((prev) => ({
            ...prev,
            ...data,
            registered_candidates_display:
              data.registered_candidates_display ||
              (data.registered_candidates ? `${data.registered_candidates}+` : prev.registered_candidates_display),
          }));
          setIsLive(true);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Primary Hero Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Prometric CBT Fidelity */}
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-1">
            <span>{stats.prometric_fidelity || '100%'}</span>
            <CheckCheck className="w-5 h-5 text-emerald-400 inline" />
          </div>
          <strong className="text-xs sm:text-sm font-bold text-slate-200 block">Prometric CBT Fidelity</strong>
          <span className="text-[11px] text-slate-400 block">Exact visual &amp; behavioral match</span>
        </div>

        {/* Stat 2: Registered Candidates (Dynamic from backend) */}
        <div className="space-y-1 relative">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{stats.registered_candidates_display || `${stats.registered_candidates}+`}</span>
            {isLive && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                title="Live candidate count synced from backend"
              />
            )}
          </div>
          <strong className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <span>Registered Candidates</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Live
            </span>
          </strong>
          <span className="text-[11px] text-slate-400 block">Across BD, Nepal, Vietnam &amp; Japan</span>
        </div>

        {/* Stat 3: Supported Native Languages */}
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-1">
            <span>{stats.supported_languages || 10}+</span>
          </div>
          <strong className="text-xs sm:text-sm font-bold text-slate-200 block">Supported Native Languages</strong>
          <span className="text-[11px] text-slate-400 block">Instant translation assistance</span>
        </div>

        {/* Stat 4: Official Scaled Scoring */}
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-1">
            <span>{stats.official_scaled_scoring || 250}</span>
          </div>
          <strong className="text-xs sm:text-sm font-bold text-slate-200 block">Official Scaled Scoring</strong>
          <span className="text-[11px] text-slate-400 block">Instant CEFR-J A1/A2 results</span>
        </div>
      </div>

      {/* Secondary Resource Metrics Ribbon */}
      <div className="pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">{stats.total_books || 26}</strong> Official JAC Textbooks
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">{stats.total_guides || 12}</strong> In-Depth Study Guides
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">{stats.total_lessons || 80}</strong> Structured Lessons
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
          <Users className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">100%</strong> Free Practice Mock Tests
          </span>
        </div>
      </div>
    </div>
  );
}
