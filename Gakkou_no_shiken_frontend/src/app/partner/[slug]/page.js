'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPartnerDashboard, getPartnerDashboardCsvUrl } from '@/lib/api';
import {
  GraduationCap,
  KeyRound,
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Copy,
  Check,
  Search,
  ExternalLink,
  Award,
  AlertTriangle,
  Clock,
  Lock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function PartnerSchoolDashboardPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';

  const [accessKey, setAccessKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyReady, setKeyReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedDays, setSelectedDays] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'attempts'

  // Custom invite link builder
  const [inviteBatchInput, setInviteBatchInput] = useState('');
  const [copiedType, setCopiedType] = useState(''); // 'link' | 'whatsapp' | ''

  // Initialize key from URL (?key=...) or sessionStorage
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const urlKey = (sp.get('key') || '').trim();
    const storageKey = `gns_sensei_key_${slug}`;
    const savedKey = sessionStorage.getItem(storageKey) || '';

    const resolvedKey = urlKey || savedKey;
    if (urlKey) {
      sessionStorage.setItem(storageKey, urlKey);
    }
    setAccessKey(resolvedKey);
    setKeyInput(resolvedKey);
    setKeyReady(true);
  }, [slug]);

  const fetchDashboard = useCallback(
    async (overrideKey) => {
      const effectiveKey = typeof overrideKey === 'string' ? overrideKey : accessKey;
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const res = await getPartnerDashboard(slug, {
          key: effectiveKey,
          batch: selectedBatch === 'all' ? '' : selectedBatch,
          testId: selectedTestId,
          days: selectedDays === 'all' ? '' : selectedDays,
        });
        setData(res);
        if (effectiveKey && typeof window !== 'undefined') {
          sessionStorage.setItem(`gns_sensei_key_${slug}`, effectiveKey);
        }
      } catch (err) {
        setData(null);
        setError(
          err?.message ||
            'Invalid or missing Sensei access key. Please enter the private key provided during school approval.'
        );
      } finally {
        setLoading(false);
      }
    },
    [slug, accessKey, selectedBatch, selectedTestId, selectedDays]
  );

  // Fetch automatically once key is resolved (either present in URL/storage or staff user session)
  useEffect(() => {
    if (!keyReady || !slug) return;
    if (accessKey) {
      fetchDashboard(accessKey);
    }
  }, [keyReady, slug, accessKey, fetchDashboard]);

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError('Please enter your Sensei access key.');
      return;
    }
    setAccessKey(trimmed);
    fetchDashboard(trimmed);
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`gns_sensei_key_${slug}`);
    }
    setAccessKey('');
    setKeyInput('');
    setData(null);
    setError('');
  };

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://gakkou-no-shiken.vercel.app';

  const generatedInviteUrl = useMemo(() => {
    const base = `${origin}/?partner=${encodeURIComponent(slug)}`;
    const trimmedBatch = inviteBatchInput.trim();
    return trimmedBatch ? `${base}&batch=${encodeURIComponent(trimmedBatch)}` : base;
  }, [origin, slug, inviteBatchInput]);

  const handleCopy = async (type) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const schoolName = data?.school?.name || slug;
    const text =
      type === 'whatsapp'
        ? `🏫 *${schoolName} JFT-Basic & SSW CBT Practice Mock Exam*\n\nClick the link below, create a free account with your *Full Name*, and complete your mock exam:\n👉 ${generatedInviteUrl}`
        : generatedInviteUrl;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(''), 2200);
    } catch {}
  };

  const filteredStudents = useMemo(() => {
    const list = data?.students || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (s) =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.username || '').toLowerCase().includes(q) ||
        (s.batch || '').toLowerCase().includes(q) ||
        (s.student_roll_or_id || '').toLowerCase().includes(q)
    );
  }, [data?.students, searchQuery]);

  const filteredAttempts = useMemo(() => {
    const list = data?.recent_attempts || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (a) =>
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.username || '').toLowerCase().includes(q) ||
        (a.batch || '').toLowerCase().includes(q) ||
        (a.test_title || '').toLowerCase().includes(q) ||
        (a.student_roll_or_id || '').toLowerCase().includes(q)
    );
  }, [data?.recent_attempts, searchQuery]);

  const weakestSection = useMemo(() => {
    const sections = data?.section_analytics || [];
    if (!sections.length) return null;
    return sections.reduce((min, cur) => (cur.accuracy_pct < min.accuracy_pct ? cur : min), sections[0]);
  }, [data?.section_analytics]);

  const csvDownloadUrl = getPartnerDashboardCsvUrl(slug, {
    key: accessKey,
    batch: selectedBatch === 'all' ? '' : selectedBatch,
    testId: selectedTestId,
    days: selectedDays === 'all' ? '' : selectedDays,
  });

  // Render Key Lock Screen if no data yet & not actively loading with a key
  if (!data) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Sensei Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Partner Batch Dashboard
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Enter your private Sensei Access Key for <strong>{slug}</strong> to view batch attendance, 1st-attempt vs best scores, section weaknesses, and Excel CSV exports.
          </p>

          <form onSubmit={handleUnlockSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sensei Access Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste secret dashboard key..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-japan-red hover:from-indigo-700 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying Key...' : 'Unlock Sensei Dashboard'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Representing an LPK or School?</span>
            <Link href="/partners" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Apply for Free Access →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { school, kpis, section_analytics = [], batches = [], available_tests = [] } = data;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* 1. School Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Sensei Batch Analytics Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>{school.flag || '🏫'}</span>
              <span>{school.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2">
              {(school.city || school.country) && (
                <span>📍 {[school.city, school.country].filter(Boolean).join(', ')}</span>
              )}
              <span className="text-slate-600">•</span>
              <span className="font-mono text-indigo-300">Code: {school.slug}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchDashboard()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href={csvDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel CSV</span>
            </a>

            <button
              type="button"
              onClick={handleClearKey}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Lock or switch Sensei access key"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {kpis.total_students}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kpis.tested_students} have taken exams
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Mock Attempts</span>
            <BookOpen className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {kpis.total_attempts}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Completed in selected filter
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Average Scaled Score</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {kpis.avg_scaled_score}
            <span className="text-sm font-bold text-slate-400">/250</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            JFT-Basic Pass Target: 200
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Pass Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {kpis.pass_rate_pct}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            CEFR A2 / SSW threshold met
          </p>
        </div>
      </div>

      {/* 3. Custom Batch Invite Generator & 4-Section Class Weakness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Invite Generator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Batch Invite Link Builder</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share on WhatsApp or Telegram so students auto-link to your batch.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Batch Name (Optional)
            </label>
            <input
              type="text"
              value={inviteBatchInput}
              onChange={(e) => setInviteBatchInput(e.target.value)}
              placeholder="e.g. Batch-14-Morning"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-200 break-all">
            {generatedInviteUrl}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => handleCopy('link')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
            >
              {copiedType === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'link' ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy('whatsapp')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'whatsapp' ? 'Message Copied!' : 'Copy WhatsApp Pitch'}</span>
            </button>
          </div>

          <div className="pt-1">
            <Link
              href={`/?partner=${encodeURIComponent(slug)}${inviteBatchInput.trim() ? `&batch=${encodeURIComponent(inviteBatchInput.trim())}` : ''}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Preview Student View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4-Section Class Weakness Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-500" />
                <span>Class Section Weakness Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Spot which JFT-Basic / SSW module needs classroom review next week.
              </p>
            </div>
            {weakestSection && (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] font-black text-rose-700 dark:text-rose-300">
                Focus Area: {weakestSection.label} ({weakestSection.accuracy_pct}%)
              </span>
            )}
          </div>

          {section_analytics.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              Section breakdown will populate automatically after students complete mock exams.
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {section_analytics.map((sec) => {
                const pct = sec.accuracy_pct;
                const barColor =
                  pct >= 80
                    ? 'bg-emerald-500'
                    : pct >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500';
                const textColor =
                  pct >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : pct >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400';

                return (
                  <div key={sec.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{sec.label}</span>
                      <span className={textColor}>
                        {pct}% ({sec.correct}/{sec.total} Qs)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Batches ({batches.length})</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                Batch: {b}
              </option>
            ))}
          </select>

          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[240px] cursor-pointer"
          >
            <option value="">All Mock Exams</option>
            {available_tests.map((testItem) => (
              <option key={testItem.id} value={testItem.id}>
                {testItem.partner_school_id ? '🏫 ' : ''}
                {testItem.title}
              </option>
            ))}
          </select>

          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        <div className="relative flex-1 lg:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, roll ID, or batch..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 5. Tabs: Student Roster vs Recent Attempts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Student Roster ({filteredStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attempts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'attempts'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Recent Attempts ({filteredAttempts.length})
          </button>
        </div>

        {activeTab === 'roster' ? (
          filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                No students found in this filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your invite link above with your class so students appear on this roster automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Batch</th>
                      <th className="py-3.5 px-4 text-center">Attempts</th>
                      <th className="py-3.5 px-4">1st Attempt</th>
                      <th className="py-3.5 px-4">Best Score</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {filteredStudents.map((st) => {
                      const delta =
                        st.best_score !== null && st.first_score !== null
                          ? st.best_score - st.first_score
                          : 0;
                      return (
                        <tr
                          key={st.user_id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {st.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>@{st.username}</span>
                              {st.student_roll_or_id && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                                  ID: {st.student_roll_or_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                              {st.batch || 'General'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {st.attempts_count}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            {st.first_score !== null ? (
                              <span>
                                {st.first_score}/250{' '}
                                <span className="text-[11px] text-slate-400">
                                  ({st.first_pct}%)
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Not Tested</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            {st.best_score !== null ? (
                              <div className="flex items-center gap-1.5">
                                <span>{st.best_score}/250</span>
                                {delta > 0 && (
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    +{delta}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-normal">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {st.passed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>PASSED</span>
                              </span>
                            ) : st.attempts_count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-[11px] font-black text-amber-700 dark:text-amber-300">
                                <Clock className="w-3 h-3" />
                                <span>NEEDS PRACTICE</span>
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500">
                                NOT TESTED
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : filteredAttempts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No completed attempts match your current filters.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Exam</th>
                    <th className="py-3.5 px-4">Scaled Score</th>
                    <th className="py-3.5 px-4">Raw</th>
                    <th className="py-3.5 px-4">Result</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredAttempts.map((att) => (
                    <tr
                      key={att.attempt_id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {att.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {att.batch || 'General'}
                          {att.student_roll_or_id ? ` • ID: ${att.student_roll_or_id}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {att.test_title}
                        </div>
                        {att.is_school_exclusive && (
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                            🏫 School Exclusive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        {att.scaled_score}/250
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {att.raw_score}/{att.total_questions} ({att.percentage}%)
                      </td>
                      <td className="py-3 px-4">
                        {att.passed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                            PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {att.completed_at ? att.completed_at.slice(0, 10) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

