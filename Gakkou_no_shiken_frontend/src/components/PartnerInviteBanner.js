'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { getPartnerSchoolInfo, joinPartnerSchool } from '@/lib/api';
import { GraduationCap, CheckCircle2, ArrowRight, X, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

const PENDING_PARTNER_KEY = 'gns_pending_partner';
const DISMISSED_PARTNER_KEY = 'gns_partner_banner_dismissed';

export default function PartnerInviteBanner() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, login, refreshUser } = useAuth();

  const [pending, setPending] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  // Join form state for authenticated students
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [batch, setBatch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinedStatus, setJoinedStatus] = useState('approved');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [joinedSuccess, setJoinedSuccess] = useState(null);

  const isSuppressedRoute =
    pathname?.startsWith('/test/') ||
    pathname?.startsWith('/ssw-test/') ||
    pathname?.startsWith('/partner/');

  // 1. Capture ?partner=<slug>&batch=<batch> from URL on navigation & sync localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = (params.get('partner') || '').trim().toLowerCase();
      const urlBatch = (params.get('batch') || '').trim();

      if (urlSlug) {
        const nextPending = { slug: urlSlug, batch: urlBatch };
        localStorage.setItem(PENDING_PARTNER_KEY, JSON.stringify(nextPending));
        sessionStorage.removeItem(DISMISSED_PARTNER_KEY);
        setDismissed(false);
        setJoinedSuccess(null);
        setPending(nextPending);
        return;
      }

      const raw = localStorage.getItem(PENDING_PARTNER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.slug) {
          setPending(parsed);
        }
      }

      if (sessionStorage.getItem(DISMISSED_PARTNER_KEY) === 'true') {
        setDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [pathname]);

  // 2. Fetch school info when pending partner changes
  useEffect(() => {
    if (!pending?.slug) {
      setSchoolInfo(null);
      return;
    }

    let cancelled = false;
    getPartnerSchoolInfo(pending.slug)
      .then((info) => {
        if (cancelled) return;
        if (info?.slug) {
          setSchoolInfo(info);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Clear invalid/inactive invite link
        try {
          localStorage.removeItem(PENDING_PARTNER_KEY);
        } catch {}
        setPending(null);
        setSchoolInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pending?.slug]);

  // 3. Pre-fill form fields from authenticated user & pending batch
  useEffect(() => {
    if (user) {
      setFirstName((prev) => prev || user.first_name || '');
      setLastName((prev) => prev || user.last_name || '');
      setStudentId((prev) => prev || user.profile?.student_roll_or_id || '');
    }
    if (pending?.batch) {
      setBatch(pending.batch);
    } else if (user?.profile?.partner_batch && !batch) {
      setBatch(user.profile.partner_batch);
    }
  }, [user, pending?.batch]);

  // 4. If user is already enrolled in the exact pending school & batch (with a real name), clear pending automatically
  useEffect(() => {
    if (!isAuthenticated || !user || !pending?.slug || !schoolInfo) return;
    const activeSchool = user.profile?.partner_school;
    const sameSchool = activeSchool?.slug === pending.slug;
    const sameBatch = !pending.batch || (user.profile?.partner_batch || '') === pending.batch;
    const hasName = Boolean((user.first_name || '').trim());

    if (sameSchool && sameBatch && hasName && !joinedSuccess) {
      try {
        localStorage.removeItem(PENDING_PARTNER_KEY);
      } catch {}
      setPending(null);
    }
  }, [isAuthenticated, user, pending, schoolInfo, joinedSuccess]);

  const handleDismiss = () => {
    setDismissed(true);
    setJoinedSuccess(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(DISMISSED_PARTNER_KEY, 'true');
      } catch {}
    }
  };

  const handleDeclineInvite = () => {
    setDismissed(true);
    setPending(null);
    setSchoolInfo(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(PENDING_PARTNER_KEY);
      } catch {}
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedFirst = firstName.trim();
    if (!trimmedFirst) {
      setError('Please enter your Full / First Name so your teacher can identify your score.');
      return;
    }

    if (schoolInfo?.require_join_pin && !joinCode.trim()) {
      setError('Please enter the 6-digit Class Join PIN provided by your Sensei.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await joinPartnerSchool({
        slug: pending.slug,
        batch: batch.trim(),
        student_id: studentId.trim(),
        first_name: trimmedFirst,
        last_name: lastName.trim(),
        join_code: joinCode.trim(),
      });

      if (res?.user) {
        login(res.user);
      } else {
        await refreshUser();
      }

      try {
        localStorage.removeItem(PENDING_PARTNER_KEY);
        sessionStorage.removeItem(DISMISSED_PARTNER_KEY);
      } catch {}

      setJoinedStatus(res?.partner_status || 'approved');
      setJoinedSuccess(res?.partner_school || schoolInfo);
      setPending(null);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('gns-partner-updated'));
      }
    } catch (err) {
      setError(err?.message || 'Failed to link account to school. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuppressedRoute) return null;

  // Render brief success confirmation after linking
  if (joinedSuccess) {
    return (
      <div className="fixed z-[75] inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/80 rounded-3xl p-5 shadow-2xl animate-fade-in-up">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Linked to {joinedSuccess.flag} {joinedSuccess.name}!
              </h4>
              <button
                type="button"
                onClick={() => setJoinedSuccess(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {joinedStatus === 'pending'
                ? 'Your enrollment request is now waiting for Sensei approval. Once approved, your school-exclusive exams, study notes, and notifications will unlock.'
                : "Your mock exam scores will now appear on your Sensei's batch tracker, and your classroom exams, notes & notifications are unlocked."}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {joinedStatus === 'approved' && (
                <Link
                  href={`/partner/${encodeURIComponent(joinedSuccess.slug)}?mode=classroom`}
                  onClick={() => setJoinedSuccess(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  <span>Open My Classroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <Link
                href="/tests"
                onClick={() => setJoinedSuccess(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <span>Open Mock Tests</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dismissed || !pending?.slug || !schoolInfo) {
    return null;
  }

  const currentSchool = user?.profile?.partner_school;
  const switchingSchool =
    isAuthenticated && currentSchool && currentSchool.slug !== schoolInfo.slug;

  return (
    <>
      <div
        className="fixed inset-0 z-[72] bg-black/55 backdrop-blur-xs sm:hidden animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div className="fixed z-[75] inset-x-4 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md max-w-sm w-full mx-auto sm:mx-0 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl animate-fade-in-up max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-rose-500/15 dark:from-indigo-500/25 dark:to-rose-500/25 border border-indigo-200 dark:border-indigo-700/60 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-300">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Partner Training Center Invite</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                  {schoolInfo.flag} {schoolInfo.name}
                </h4>
                {(schoolInfo.city || schoolInfo.country) && (
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {[schoolInfo.city, schoolInfo.country].filter(Boolean).join(', ')}
                    {pending.batch ? ` • Batch: ${pending.batch}` : ''}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer -mr-1"
                aria-label="Minimize invite"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {schoolInfo.welcome_message && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl px-3 py-2">
                {schoolInfo.welcome_message}
              </p>
            )}

            {authLoading ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                Checking account status...
              </p>
            ) : isAuthenticated ? (
              <form onSubmit={handleJoinSubmit} className="pt-1 space-y-2.5">
                {switchingSchool && (
                  <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-xl px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Currently enrolled in <strong>{currentSchool.name}</strong>. Linking here will switch your active school.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Budi"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Santoso"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      Batch / Class
                    </label>
                    <input
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. Batch-12"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                      Roll / Student ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {schoolInfo.require_join_pin && (
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800">
                    <label className="block text-[10px] font-black uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-1">
                      🔐 6-Digit Class Join PIN (Required by Sensei) *
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      required
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter 6-digit PIN from your Sensei..."
                      className="w-full px-3 py-2 text-xs font-mono font-black tracking-widest rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {schoolInfo.enrollment_locked && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                    🔒 New student enrollment is currently locked by Sensei.
                  </div>
                )}

                {error && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-japan-red hover:from-indigo-700 hover:to-rose-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Linking...' : `Link Account to ${schoolInfo.name}`}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <button
                    type="button"
                    onClick={handleDeclineInvite}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Not from this school
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-1 space-y-2.5">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Create a free student account or sign in to unlock your school&apos;s mock exams and send your scores directly to your Sensei.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Link
                    href="/accounts/signup"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white text-xs font-extrabold text-center shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/accounts/login"
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center"
                  >
                    Sign In
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={handleDeclineInvite}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer"
                >
                  Dismiss invite
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

