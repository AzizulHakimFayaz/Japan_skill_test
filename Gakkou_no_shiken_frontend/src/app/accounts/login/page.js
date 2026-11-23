'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser, setupPartnerSchoolForUser } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  Eye,
  EyeOff,
  User,
  GraduationCap,
  KeyRound,
  Building2,
  MapPin,
  Phone,
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
  // For School tab: 'account' (Username/Email + Password) | 'key' (School Code + Sensei Key)
  const [schoolAuthMethod, setSchoolAuthMethod] = useState('account');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Direct School Code + Sensei Key fields
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [senseiKeyInput, setSenseiKeyInput] = useState('');

  // Quick 1-step school onboarding if an existing user logs in on the School tab without a school yet
  const [needsSchoolSetup, setNeedsSchoolSetup] = useState(false);
  const [setupSchoolName, setSetupSchoolName] = useState('');
  const [setupCountry, setSetupCountry] = useState('Bangladesh');
  const [setupCity, setSetupCity] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupRequirePin, setSetupRequirePin] = useState(true);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSchool = role === 'school';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // If School tab + Sensei Key mode
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
      const data = await loginUser(username, password);
      if (data?.user) {
        login(data.user);

        if (isSchool) {
          const ownedSlug = data.user.owned_partner_school?.slug;
          if (ownedSlug) {
            router.push(`/partner/${encodeURIComponent(ownedSlug)}`);
            return;
          }
          // Account succeeded, but hasn't created a PartnerSchool yet -> show 10-second inline school setup!
          setNeedsSchoolSetup(true);
          return;
        }

        router.push(next);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSchoolSetup = async (e) => {
    e.preventDefault();
    setError(null);
    if (!setupSchoolName.trim() || !setupCity.trim() || !setupPhone.trim()) {
      setError('Please fill in School Name, City, and WhatsApp/Phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await setupPartnerSchoolForUser({
        school_name: setupSchoolName.trim(),
        country: setupCountry,
        city: setupCity.trim(),
        whatsapp_or_phone: setupPhone.trim(),
        require_join_pin: setupRequirePin,
      });
      if (res?.user) {
        login(res.user);
      }
      const slug = res?.partner_school?.slug || res?.user?.owned_partner_school?.slug;
      if (slug) {
        router.push(`/partner/${encodeURIComponent(slug)}`);
      }
    } catch (err) {
      setError(err.message || 'Could not create school profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Inline School Setup Step for Existing Accounts
  if (needsSchoolSetup) {
    return (
      <div className="bg-white dark:bg-slate-900/90 border border-violet-200 dark:border-violet-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Activate Your School / LPK Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your training center details below to launch your Schoooli Sensei LMS Dashboard &amp; generate your 6-digit Class Join PIN.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs p-4 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleCompleteSchoolSetup} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              School / LPK / Training Center Name *
            </label>
            <input
              type="text"
              required
              value={setupSchoolName}
              onChange={(e) => setSetupSchoolName(e.target.value)}
              placeholder="e.g. LPK Sakura Nusantara / Dhaka Nihongo Center"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Country *
              </label>
              <select
                value={setupCountry}
                onChange={(e) => setSetupCountry(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              >
                <option value="Bangladesh">🇧🇩 Bangladesh</option>
                <option value="Indonesia">🇮🇩 Indonesia</option>
                <option value="Nepal">🇳🇵 Nepal</option>
                <option value="Vietnam">🇻🇳 Vietnam</option>
                <option value="Philippines">🇵🇭 Philippines</option>
                <option value="Myanmar">🇲🇲 Myanmar</option>
                <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                <option value="India">🇮🇳 India</option>
                <option value="Japan">🇯🇵 Japan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={setupCity}
                  onChange={(e) => setSetupCity(e.target.value)}
                  placeholder="e.g. Dhaka, Jakarta"
                  className="w-full pl-9 pr-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Official WhatsApp / Contact Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={setupPhone}
                onChange={(e) => setSetupPhone(e.target.value)}
                placeholder="+880 17... / +62 812..."
                className="w-full pl-9 pr-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={setupRequirePin}
              onChange={(e) => setSetupRequirePin(e.target.checked)}
            />
            <span>🔐 Require 6-Digit Class Join PIN for students</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-violet-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Creating School Portal...' : 'Launch My Sensei LMS Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
      {/* 1. Candidate vs School Role Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70">
        <button
          type="button"
          onClick={() => {
            setRole('candidate');
            setError(null);
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
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSchool
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
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
            ? 'Sign in with your School Account or Sensei Access Key to assign tests, share notes & manage your batch.'
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
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
              schoolAuthMethod === 'account'
                ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
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
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
              schoolAuthMethod === 'key'
                ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
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

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs p-4 rounded-2xl font-semibold animate-fade-in">
          {error}
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
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-violet-600 font-mono font-bold text-slate-800 dark:text-white text-sm"
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
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-violet-600 font-mono font-bold text-slate-800 dark:text-white text-sm"
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
                {isSchool ? 'Sensei Username or School Email' : 'Username or Email'}
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
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/20'
              : 'bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 shadow-red-500/20'
          }`}
        >
          {submitting
            ? 'Signing In...'
            : isSchool
            ? 'Open Sensei LMS Dashboard'
            : 'Sign In to Candidate Portal'}
        </button>
      </form>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {isSchool ? "Haven't registered your school or LPK yet?" : "Don't have a candidate profile?"}
        </span>
        <Link
          href={`/accounts/signup?role=${role}${next && next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`}
          className={`hover:underline font-bold transition-colors ml-1 ${
            isSchool ? 'text-violet-600 dark:text-violet-400' : 'text-japan-red dark:text-rose-400'
          }`}
        >
          {isSchool ? 'Register School Free →' : 'Register Free'}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 animate-fade-in-up">
      <Suspense fallback={<div className="text-center p-8 text-slate-500">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
