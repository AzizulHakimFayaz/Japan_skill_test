'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await loginUser(username, password);
      if (data?.user) {
        login(data.user);
        router.push(next);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo.png" alt="Gakkou No Shiken" className="h-16 w-auto mx-auto object-contain filter drop-shadow-xs" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Candidate Sign In</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Sign in to track your exam performance, scores, and rankings.
        </p>
      </div>

      {/* 1-Click Social Sign-In */}
      <GoogleSignInButton text="Continue with Google" enableOneTap={true} />

      <div className="relative flex items-center justify-center my-4">
        <hr className="w-full border-slate-200" />
        <span className="absolute bg-white px-3 text-[11px] font-extrabold uppercase text-slate-400">
          or sign in with password
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl font-semibold animate-fade-in">
          {error}
        </div>
      )}


      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id_username" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Username or Email
          </label>
          <input
            type="text"
            id="id_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
            placeholder="Enter username or email"
          />
        </div>

        <div>
          <label htmlFor="id_password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Password
          </label>
          <input
            type="password"
            id="id_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 mt-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Signing In...' : 'Sign In to Candidate Portal'}
        </button>
      </form>

      <hr className="border-slate-100" />

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm">
        <span className="text-slate-500 font-medium">Don&apos;t have a candidate profile?</span>
        <Link
          href={`/accounts/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-japan-red hover:underline font-bold transition-colors ml-1"
        >
          Register Free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 animate-fade-in">
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
