'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  ArrowRight,
  AlertCircle,
  Calendar,
  Search,
  Users,
  Target,
  ChevronRight,
  Info,
  TrendingUp,
} from 'lucide-react';
import { getCountryFlag } from '@/lib/utils';
import CountryFlag from '@/components/CountryFlag';

/* ─────────────────────────── Helpers ─────────────────────────── */

const AVATAR_TONES = [
  'from-slate-800 to-slate-800',
  'from-rose-500 to-red-400',
  'from-emerald-500 to-slate-800',
  'from-slate-800 to-slate-800',
  'from-red-600 to-red-400',
  'from-amber-500 to-red-400',
];

function toneFor(str = '') {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

function initialsOf(name = '') {
  const cleaned = String(name)
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/^[^a-zA-Z0-9\u0980-\u09FF\u3040-\u30FF\u4E00-\u9FAF]+/, ''))
    .filter(Boolean);
  if (cleaned.length >= 2) {
    return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
  }
  if (cleaned.length === 1) {
    return cleaned[0].slice(0, 2).toUpperCase();
  }
  return '?';
}

const countryOf = (c) => c?.country || c?.location || 'Global';
const flagOf = (c) => c?.country_flag || getCountryFlag(countryOf(c));

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const PLACE = {
  1: {
    label: 'Champion',
    Icon: Crown,
    strip: 'from-amber-400 via-yellow-300 to-amber-500',
    badge: 'bg-amber-400 text-amber-950',
    ring: 'ring-amber-400/70',
    border: 'border-amber-300/80 dark:border-amber-500/40',
    glow: 'shadow-[0_20px_50px_-15px_rgba(245,158,11,0.45)]',
    numeral: 'text-amber-500/15 dark:text-amber-400/15',
    score: 'text-amber-600 dark:text-amber-400',
  },
  2: {
    label: 'Runner-up',
    Icon: Medal,
    strip: 'from-slate-300 via-slate-200 to-slate-400',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    ring: 'ring-slate-300/80 dark:ring-slate-500/60',
    border: 'border-slate-200 dark:border-slate-800',
    glow: 'shadow-[0_16px_40px_-18px_rgba(15,23,42,0.25)]',
    numeral: 'text-slate-400/15',
    score: 'text-slate-700 dark:text-slate-200',
  },
  3: {
    label: 'Third Place',
    Icon: Award,
    strip: 'from-red-600 via-amber-600 to-red-400',
    badge: 'bg-red-600 text-white',
    ring: 'ring-red-400/70',
    border: 'border-slate-200 dark:border-slate-800',
    glow: 'shadow-[0_16px_40px_-18px_rgba(234,88,12,0.3)]',
    numeral: 'text-red-600/15',
    score: 'text-red-600 dark:text-red-400',
  },
};

/* ─────────────────────────── Sub-components ─────────────────────────── */

function Avatar({ name, seed, size = 'md', ringClass = '' }) {
  const sizes = {
    sm: 'w-9 h-9 text-xs rounded-xl',
    md: 'w-12 h-12 text-sm rounded-2xl',
    lg: 'w-16 h-16 text-lg rounded-2xl',
  };
  return (
    <div
      className={`${sizes[size]} shrink-0 bg-gradient-to-br ${toneFor(seed || name)} text-white font-black flex items-center justify-center shadow-sm ${ringClass}`}
    >
      {initialsOf(name)}
    </div>
  );
}

function StatCell({ label, value, sub, valueClass = 'text-slate-900 dark:text-white' }) {
  return (
    <div className="text-center min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
      <div className={`text-base sm:text-lg font-black tabular-nums leading-tight ${valueClass}`}>
        {value}
        {sub && <span className="text-[10px] font-semibold text-slate-400 ml-0.5">{sub}</span>}
      </div>
    </div>
  );
}

function PodiumCard({ c, place, orderClass }) {
  const s = PLACE[place];
  const isFirst = place === 1;
  const Icon = s.Icon;
  const country = countryOf(c);

  return (
    <div className={`min-w-0 ${orderClass} ${isFirst ? '-translate-y-2 sm:-translate-y-4' : ''}`}>
      <Link
        href={`/profile/${encodeURIComponent(c.username)}`}
        className={`group relative block overflow-hidden rounded-2xl sm:rounded-3xl border ${s.border} bg-white dark:bg-slate-900 ${s.glow} transition-all duration-300 hover:-translate-y-1`}
      >
        <div className={`h-1 sm:h-1.5 w-full bg-gradient-to-r ${s.strip}`} />

        <div className={`hidden sm:block absolute right-3 top-2 select-none text-6xl font-black leading-none ${s.numeral}`}>
          {place}
        </div>

        <div className={`relative px-2 sm:px-5 ${isFirst ? 'pt-3.5 pb-3 sm:pt-7 sm:pb-6' : 'pt-3 pb-2.5 sm:pt-6 sm:pb-5'} flex flex-col items-center text-center min-w-0`}>
          <span className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider max-w-full ${s.badge}`}>
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="sm:hidden">#{place}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </span>

          <div className="mt-2 sm:mt-4">
            <div className="sm:hidden">
              <Avatar name={c.full_name} seed={c.username} size="sm" ringClass={`ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ${s.ring}`} />
            </div>
            <div className="hidden sm:block">
              <Avatar name={c.full_name} seed={c.username} size="lg" ringClass={`ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${s.ring}`} />
            </div>
          </div>

          <h3 className="mt-2 sm:mt-3 w-full truncate text-[11px] sm:text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors">
            {c.full_name}
          </h3>
          <p className="w-full truncate font-mono text-[9px] sm:text-[11px] text-slate-400">@{c.username}</p>

          <div className="mt-1.5 sm:mt-2.5 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 max-w-full">
            <CountryFlag country={country} flagEmoji={flagOf(c)} width={14} height={10} />
            <span className="truncate max-w-[68px] sm:max-w-[120px]">{country}</span>
          </div>

          <div className={`mt-2 sm:mt-4 w-full rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 ${isFirst ? 'py-2 sm:py-4' : 'py-1.5 sm:py-3'}`}>
            <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</div>
            <div className={`font-black tabular-nums leading-none mt-0.5 sm:mt-1 ${isFirst ? 'text-lg sm:text-4xl' : 'text-base sm:text-3xl'} ${s.score}`}>
              {c.highest_score}
              <span className="hidden sm:inline text-xs font-semibold text-slate-400"> / 250</span>
            </div>
          </div>

          {/* Mobile compact pass/avg line */}
          <div className="mt-1.5 sm:hidden flex items-center justify-center gap-1.5 text-[9px] font-bold tabular-nums w-full truncate">
            <span className="text-emerald-600 dark:text-emerald-400">{c.passed_attempts}✓</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">avg {c.avg_score}</span>
          </div>

          {/* Desktop 2-col stats + link */}
          <div className="hidden sm:grid mt-3 w-full grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
            <StatCell label="Passed" value={c.passed_attempts} valueClass="text-emerald-600 dark:text-emerald-400" />
            <StatCell label="Average" value={c.avg_score} />
          </div>

          <span className="hidden sm:inline-flex mt-4 items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors">
            View profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </div>
  );
}

function ScoreBar({ value }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / 250) * 100));
  const passed = Number(value) >= 200;
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 text-right font-black tabular-nums text-slate-900 dark:text-white">{value}</span>
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-y-0 w-px bg-slate-400/60" style={{ left: '80%' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('overall'); // 'overall' | 'weekly'
  const [query, setQuery] = useState('');

  const fetchLeaderboard = () => {
    setLoading(true);
    getLeaderboard()
      .then((res) => {
        setError(null);
        setData(res);
      })
      .catch((err) => setError(err.message || 'Failed to load leaderboard rankings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('tab') === 'weekly' || sp.get('period') === 'weekly') {
        setPeriod('weekly');
      }
    }
    fetchLeaderboard();
  }, []);

  const isWeekly = period === 'weekly';
  const weekly = data?.weekly || null;
  const overallTotal = data?.total_candidates || 0;
  const weeklyTotal = weekly?.total_candidates || 0;

  const board = isWeekly
    ? { top: weekly?.top_three || [], rows: weekly?.rankings || [], me: weekly?.current_user_rank || null, total: weeklyTotal }
    : { top: data?.top_three || [], rows: data?.rankings || [], me: data?.current_user_rank || null, total: overallTotal };

  const otherMe = isWeekly ? data?.current_user_rank : weekly?.current_user_rank;

  const rangeText =
    weekly?.window_start && weekly?.window_end
      ? `${fmtDate(weekly.window_start)} – ${fmtDate(weekly.window_end)}`
      : 'Last 7 days';

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return board.rows;
    return board.rows.filter(
      (c) =>
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q) ||
        countryOf(c).toLowerCase().includes(q)
    );
  }, [board.rows, query]);

  const selectPeriod = (next) => {
    setPeriod(next);
    setQuery('');
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (next === 'weekly') url.searchParams.set('tab', 'weekly');
        else url.searchParams.delete('tab');
        window.history.replaceState(null, '', url.toString());
      } catch {}
    }
  };

  /* ── Loading ── */
  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="h-14 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-japan-red flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{error}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeaderboard}
            className="px-5 py-2.5 bg-japan-red hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link href="/" className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  const [first, second, third] = [1, 2, 3].map(
    (r) => board.top.find((c) => c.rank === r) || board.top[r - 1]
  );

  const me = user ? board.me : null;
  const percentile =
    me?.rank && board.total ? Math.max(1, Math.ceil((me.rank / board.total) * 100)) : null;
  const meCountry = me ? countryOf(me) || user?.profile?.country || 'Global' : 'Global';

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-full overflow-x-hidden">
      {/* ═══════════ 1. Hero ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0B1020] text-white shadow-2xl shadow-slate-900/20">
        <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-slate-900/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard 2026
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              Candidate{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent">
                Honor Roll
              </span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-400">
              Live rankings of JFT-Basic &amp; SSW practice candidates across Asia, scored on a simulated 10–250 CEFR practice scale.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/tests"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-lg transition-all hover:bg-amber-50 active:scale-95"
              >
                Take a Mock Exam
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-slate-500">Every completed exam updates your rank instantly.</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { icon: Users, label: 'Ranked', value: overallTotal.toLocaleString(), tone: 'text-white' },
              { icon: Flame, label: 'This Week', value: weeklyTotal.toLocaleString(), tone: 'text-rose-300' },
              { icon: Target, label: 'Pass Mark', value: '200', tone: 'text-emerald-300' },
            ].map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-slate-500" />
                <div className={`mt-3 text-xl sm:text-3xl font-black tabular-nums ${tone}`}>{value}</div>
                <div className="mt-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 2. Period Switcher ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-grid grid-cols-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-1">
          {[
            { key: 'overall', label: 'All-Time', Icon: Trophy, count: overallTotal },
            { key: 'weekly', label: 'This Week', Icon: Flame, count: weeklyTotal },
          ].map(({ key, label, Icon, count }) => {
            const active = period === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectPeriod(key)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? (key === 'weekly' ? 'text-rose-500' : 'text-amber-500') : ''}`} />
                {label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                    active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isWeekly ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
              <Calendar className="h-3.5 w-3.5" />
              Rolling 7 days · {rangeText}
            </>
          ) : (
            <>
              <TrendingUp className="h-3.5 w-3.5" />
              Ranked by passed exams, then high score
            </>
          )}
        </div>
      </div>

      {/* ═══════════ 3. Your Standing ═══════════ */}
      {me && (
        <section className="rounded-3xl border border-slate-200/70 dark:border-slate-500/20 bg-gradient-to-r from-slate-800 via-white to-white dark:from-slate-900/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="flex h-14 min-w-[3.75rem] px-2.5 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Rank</span>
                <span className={`${me.rank && me.rank >= 1000 ? 'text-sm' : 'text-lg'} font-black leading-none tabular-nums`}>
                  {me.rank ? `#${me.rank}` : '—'}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Your {isWeekly ? 'weekly' : 'all-time'} standing
                  </span>
                  {percentile && (
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                      Top {percentile}%
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  <strong className="truncate text-base sm:text-lg font-black text-slate-900 dark:text-white">{me.full_name}</strong>
                  <CountryFlag country={meCountry} flagEmoji={flagOf(me)} width={18} height={12} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {me.rank
                    ? `${me.rank} of ${board.total} ${isWeekly ? 'active this week' : 'ranked candidates'}`
                    : isWeekly
                    ? 'Complete one exam this week to join the weekly board.'
                    : 'Complete your first exam to get ranked.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-0 md:divide-x divide-slate-200 dark:divide-slate-800 rounded-2xl md:rounded-none bg-white/70 dark:bg-slate-950/40 md:bg-transparent p-3 md:p-0">
              <div className="md:px-5"><StatCell label="Passed" value={me.passed_attempts} valueClass="text-emerald-600 dark:text-emerald-400" /></div>
              <div className="md:px-5"><StatCell label="High" value={me.highest_score} /></div>
              <div className="md:px-5"><StatCell label="Average" value={me.avg_score} /></div>
              <button
                type="button"
                onClick={() => selectPeriod(isWeekly ? 'overall' : 'weekly')}
                className="md:px-5 cursor-pointer hover:opacity-75 transition-opacity"
                title={`Switch to ${isWeekly ? 'All-Time' : 'This Week'}`}
              >
                <StatCell
                  label={isWeekly ? 'All-Time' : 'Weekly'}
                  value={otherMe?.rank ? `#${otherMe.rank}` : '—'}
                  valueClass="text-slate-700 dark:text-slate-300"
                />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ 4. Podium ═══════════ */}
      {board.top.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {isWeekly ? 'This Week’s Top 3' : 'All-Time Top 3'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isWeekly ? `Best performers · ${rangeText}` : 'The highest-ranked candidates on the platform'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-5 items-end pt-3 sm:pt-4">
            {second && <PodiumCard c={second} place={2} orderClass="order-1" />}
            {first && <PodiumCard c={first} place={1} orderClass="order-2" />}
            {third && <PodiumCard c={third} place={3} orderClass="order-3" />}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500">
            <Flame className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
            {isWeekly ? 'The weekly podium is wide open' : 'No ranked candidates yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {isWeekly
              ? 'Complete a mock exam in the next 7 days to claim the #1 spot.'
              : 'Complete a mock exam to appear on the Honor Roll.'}
          </p>
          <Link
            href="/tests"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-black text-white dark:text-slate-900"
          >
            Start a Mock Exam <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      {/* ═══════════ 5. Standings Table ═══════════ */}
      {board.rows.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {isWeekly ? 'Weekly Standings' : 'All-Time Standings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ranks 4 – {board.rows.length + 3}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, username or country"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800/60"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 pl-6 pr-3 w-20">Rank</th>
                  <th className="px-3 py-3.5">Candidate</th>
                  <th className="px-3 py-3.5">Country</th>
                  <th className="px-3 py-3.5">Target</th>
                  <th className="px-3 py-3.5 text-center">Passed</th>
                  <th className="px-3 py-3.5">High Score</th>
                  <th className="px-3 py-3.5 text-center">Avg</th>
                  <th className="py-3.5 pl-3 pr-6 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRows.map((c) => {
                  const mine = user && c.user_id === user.id;
                  const country = countryOf(c);
                  return (
                    <tr
                      key={c.user_id}
                      className={`group transition-colors ${
                        mine ? 'bg-slate-50/70 dark:bg-slate-950/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <span className="font-black tabular-nums text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {String(c.rank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <Link href={`/profile/${encodeURIComponent(c.username)}`} className="flex items-center gap-3 min-w-0">
                          <Avatar name={c.full_name} seed={c.username} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-bold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors max-w-[200px]">
                                {c.full_name}
                              </span>
                              {mine && (
                                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">You</span>
                              )}
                            </div>
                            <span className="block truncate font-mono text-[11px] text-slate-400">@{c.username}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <CountryFlag country={country} flagEmoji={flagOf(c)} width={18} height={12} />
                          <span className="truncate max-w-[110px]">{country}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{c.target_exam_display}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="font-black tabular-nums text-emerald-600 dark:text-emerald-400">{c.passed_attempts}</span>
                        <span className="ml-1 text-[10px] text-slate-400">/ {c.total_attempts}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <ScoreBar value={c.highest_score} />
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold tabular-nums text-slate-600 dark:text-slate-300">{c.avg_score}</td>
                      <td className="py-3.5 pl-3 pr-6">
                        <Link
                          href={`/profile/${encodeURIComponent(c.username)}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all"
                          aria-label={`View ${c.full_name}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">No candidates match “{query}”.</div>
            )}
          </div>

          {/* Mobile list */}
          <div className="md:hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRows.map((c) => {
              const mine = user && c.user_id === user.id;
              const country = countryOf(c);
              return (
                <Link
                  key={c.user_id}
                  href={`/profile/${encodeURIComponent(c.username)}`}
                  className={`flex items-center gap-3 px-4 py-3 ${mine ? 'bg-slate-50/70 dark:bg-slate-950/30' : 'active:bg-slate-50 dark:active:bg-slate-800/50'}`}
                >
                  <span className="w-7 shrink-0 text-center text-xs font-black tabular-nums text-slate-400">{c.rank}</span>
                  <Avatar name={c.full_name} seed={c.username} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.full_name}</span>
                      {mine && <span className="rounded bg-slate-900 px-1 py-0.5 text-[9px] font-black uppercase text-white">You</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CountryFlag country={country} flagEmoji={flagOf(c)} width={14} height={10} />
                      <span className="truncate">{country}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.passed_attempts} passed</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black tabular-nums text-slate-900 dark:text-white">{c.highest_score}</div>
                    <div className="text-[10px] text-slate-400">avg {c.avg_score}</div>
                  </div>
                </Link>
              );
            })}
            {filteredRows.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No candidates match “{query}”.</div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════ 6. Methodology ═══════════ */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <strong className="font-bold text-slate-700 dark:text-slate-300">How ranking works.</strong>{' '}
          Scores use the Prometric JFT-Basic scale (10–250, pass at 200) and the SSW 60% benchmark. Candidates are ranked by
          passed exams, then highest score, average score and total attempts. <em>All-Time</em> covers every attempt;{' '}
          <em>This Week</em> covers the rolling last 7 days. Admin preview attempts are excluded.
        </p>
      </div>
    </div>
  );
}
