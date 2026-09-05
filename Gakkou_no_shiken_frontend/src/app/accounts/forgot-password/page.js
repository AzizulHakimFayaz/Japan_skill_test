'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 px-4 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center mx-auto text-japan-red dark:text-rose-400 shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Enter the email address registered with your Gakkou No Shiken account to receive a secure password recovery link.
          </p>
        </div>

        {/* Success Confirmation State */}
        {submitted ? (
          <div className="space-y-6 py-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 p-5 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">
                    Password Reset Link Sent!
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300">
                    If an account is registered with <strong className="font-semibold text-emerald-900 dark:text-emerald-100">{email}</strong>, you will receive an email shortly with a one-time password reset link.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
              <p className="font-bold">⏰ Security Expiration Note:</p>
              <p>
                The recovery link is strictly valid for <strong>15 minutes</strong> for your security. If you do not see it in your inbox within 2 minutes, please check your spam/junk folder.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Send to a different email address
              </button>

              <Link
                href="/accounts/login"
                className="w-full py-3.5 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Candidate Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs p-4 rounded-2xl font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="id_email" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  id="id_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-950/40 transition-all font-semibold text-slate-800 dark:text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full py-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-3">
              <Link
                href="/accounts/login"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Remember your password? Sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
