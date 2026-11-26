'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthSplitShowcase from '@/components/AuthSplitShowcase';
import {
  Eye,
  EyeOff,
  User,
  GraduationCap,
  KeyRound,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const initialRole = searchParams.get('role') === 'school' ? 'school' : 'candidate';
  const { login } = useAuth();

  // Role Switcher: 'candidate' | 'school'
  const [role, setRole] = useState(initialRole);
  // For School tab: 'account' (School Owner Username/Email + Password) | 'key' (School Code + Sensei Key)
  const [schoolAuthMethod, setSchoolAuthMethod] = useState('account');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Direct School Code + Sensei Key fields
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [senseiKeyInput, setSenseiKeyInput] = useState('');

  // Shown when a Candidate account tries to sign in on the School / Sensei tab
  const [candidateAccountNotice, setCandidateAccountNotice] = useState(false);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSchool = role === 'school';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCandidateAccountNotice(false);

    // School tab + Sensei Access Key mode
    if (isSchool && schoolAuthMethod === 'key') {
      const cleanSlug = schoolCodeInput.trim().toLowerCase();
      const cleanKey = senseiKeyInput.trim();
      if (!cleanSlug) {
        setError('Please enter your School Code (e.g. lpk-sakura).');
        return;
      }
      if (!cleanKey) {
        setError('Please enter your Sensei Access Key.');
        return;
      }
      router.push(`/partner/${encodeURIComponent(cleanSlug)}?key=${encodeURIComponent(cleanKey)}`);
      return;
    }

    setSubmitting(true);
    try {
      const data = await loginUser(username, password, {
        role: isSchool ? 'school' : 'candidate',
      });
      if (data?.user) {
        if (isSchool) {
          const ownedSlug = data.user.owned_partner_school?.slug;
          if (ownedSlug) {
            login(data.user);
            router.push(`/partner/${encodeURIComponent(ownedSlug)}`);
            return;
          }
          if (data.user.is_staff || data.user.is_superuser) {
            login(data.user);
            router.push('/partners');
            return;
          }
          // Account does not own a PartnerSchool -> block School login cleanly
          setCandidateAccountNotice(true);
          setError(
            `@${data.user.username} is registered as a Candidate / Student account, not a Partner School.`
          );
          return;
        }

        login(data.user);
        router.push(next);
      }
    } catch (err) {
      if (isSchool && (err?.data?.code === 'not_a_school_account' || err?.status === 403)) {
        setCandidateAccountNotice(true);
      }
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-[30px] p-3 sm:p-4 shadow-2xl dark:shadow-[0_0_45px_rgba(0,0,0,0.55)] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
      <div className="lg:col-span-6 p-3 sm:p-6 xl:p-8 flex flex-col justify-center space-y-5">
        <AuthSplitShowcase role={role} variant="mobile" />
      {/* 1. Candidate vs School Role Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70">
        <button
          type="button"
          onClick={() => {
            setRole('candidate');
            setError(null);
            setCandidateAccountNotice(false);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            !isSchool
              ? 'bg-white dark:bg-slate-900 text-japan-red dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Candidate / Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole('school');
            setError(null);
            setCandidateAccountNotice(false);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSchool
              ? 'bg-gradient-to-r from-slate-900 to-slate-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>School / Sensei</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/logo.png"
          alt="Gakkou No Shiken"
          className="h-14 w-auto mx-auto object-contain filter drop-shadow-xs"
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isSchool ? 'School & Sensei Sign In' : 'Candidate Sign In'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          {isSchool
            ? 'Sign in with your registered Partner School account or Sensei Access Key to manage your classroom.'
            : 'Sign in to track your exam performance, scores, and classroom assignments.'}
        </p>
      </div>

      {/* School Method Toggle (Account vs Access Key) */}
      {isSchool ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSchoolAuthMethod('account');
              setError(null);
              setCandidateAccountNotice(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
              schoolAuthMethod === 'account'
                ? 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            School Account Login
          </button>
          <button
            type="button"
            onClick={() => {
              setSchoolAuthMethod('key');
              setError(null);
              setCandidateAccountNotice(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
              schoolAuthMethod === 'key'
                ? 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Use Sensei Access Key</span>
          </button>
        </div>
      ) : (
        <>
          <GoogleSignInButton text="Continue with Google" enableOneTap={true} />
          <div className="relative flex items-center justify-center my-4">
            <hr className="w-full border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-extrabold uppercase text-slate-400">
              or sign in with password
            </span>
          </div>
        </>
      )}

      {/* Error Alert + Candidate Account Role Mismatch Guidance */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs p-4 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-start gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>

          {candidateAccountNotice && (
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('candidate');
                  setError(null);
                  setCandidateAccountNotice(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs cursor-pointer"
              >
                Switch to Candidate Sign In →
              </button>
              <Link
                href="/accounts/signup?role=school"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-black text-xs text-center flex items-center justify-center gap-1"
              >
                <span>Register School Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSchool && schoolAuthMethod === 'key' ? (
          <>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                School Code (Slug) *
              </label>
              <input
                type="text"
                value={schoolCodeInput}
                onChange={(e) => setSchoolCodeInput(e.target.value)}
                required
                placeholder="e.g. lpk-sakura"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-slate-600 font-mono font-bold text-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Sensei Access Key *
              </label>
              <input
                type="password"
                value={senseiKeyInput}
                onChange={(e) => setSenseiKeyInput(e.target.value)}
                required
                placeholder="Paste private Sensei access key..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-slate-600 font-mono font-bold text-slate-800 dark:text-white text-sm"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="id_username"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                {isSchool ? 'Registered School Username or Email' : 'Username or Email'}
              </label>
              <input
                type="text"
                id="id_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
                placeholder={isSchool ? 'Enter school username or email' : 'Enter username or email'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="id_password"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Password
                </label>
                <Link
                  href="/accounts/forgot-password"
                  className="text-xs text-japan-red dark:text-rose-400 hover:underline font-bold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="id_password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg active:scale-95 mt-2 cursor-pointer disabled:opacity-50 ${
            isSchool
              ? 'bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-900 hover:to-slate-900 shadow-slate-500/20'
              : 'bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 shadow-red-500/20'
          }`}
        >
          {submitting
            ? 'Signing In...'
            : isSchool
            ? 'Sign In to Sensei LMS Portal'
            : 'Sign In to Candidate Portal'}
        </button>
      </form>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm space-y-2">
        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isSchool ? "Haven't registered your school or LPK yet?" : "Don't have a candidate profile?"}
          </span>
          <Link
            href={`/accounts/signup?role=${role}${next && next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`}
            className={`hover:underline font-bold transition-colors ml-1 ${
              isSchool ? 'text-slate-700 dark:text-slate-300' : 'text-japan-red dark:text-rose-400'
            }`}
          >
            {isSchool ? 'Register School Account →' : 'Register Free'}
          </Link>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2 pt-1">
          <span>© Gakkou No Shiken</span>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
      </div>

      {/* RIGHT COLUMN (Desktop): Split-Screen Visual Showcase */}
      <div className="lg:col-span-6">
        <AuthSplitShowcase role={role} variant="desktop" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-1 sm:px-2 animate-fade-in-up">
      <Suspense fallback={<div className="text-center p-8 text-slate-500">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
