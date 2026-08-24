'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Mail, ShieldCheck, ArrowLeft, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { login } = useAuth();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification State
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const otpInputsRef = useRef([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Form Submission -> Send OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await sendRegistrationOTP(username, email, password, passwordConfirm, firstName, lastName);
      setStep('otp');
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 100);
    } catch (err) {
      const msg =
        err.data?.username?.[0] ||
        err.data?.email?.[0] ||
        err.data?.password?.[0] ||
        err.data?.detail ||
        err.message ||
        'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    // Handle pasting 6-digit code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        if (otpInputsRef.current[nextIndex]) {
          otpInputsRef.current[nextIndex].focus();
        }
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (digit && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputsRef.current[index - 1]) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join('').trim();
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const data = await verifyRegistrationOTP(email, code);
      if (data?.user) {
        setOtpSuccess('Email verified successfully! Logging you in...');
        login(data.user);
        setTimeout(() => {
          router.push(next);
        }, 1000);
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired verification code. Please check your inbox.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setOtpError(null);

    try {
      await resendRegistrationOTP(email);
      setResendCooldown(45);
      setOtpSuccess('A new 6-digit verification code has been sent!');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => setOtpSuccess(null), 4000);
      if (otpInputsRef.current[0]) {
        otpInputsRef.current[0].focus();
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ==========================================
  // STEP 2: OTP VERIFICATION SCREEN
  // ==========================================
  if (step === 'otp') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-6 animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-red-50 text-japan-red rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
            <Mail className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Check Your Inbox</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
            We sent a 6-digit verification code to <strong className="text-slate-800 font-bold">{email}</strong>.
          </p>
        </div>

        {/* Alerts */}
        {otpError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl font-semibold animate-fade-in text-center">
            {otpError}
          </div>
        )}
        {otpSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl font-semibold animate-fade-in text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{otpSuccess}</span>
          </div>
        )}

        {/* 6-Digit OTP Segmented Input */}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpInputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-japan-red focus:ring-4 focus:ring-red-100 rounded-2xl transition-all font-mono shadow-xs"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifyingOtp || otpDigits.join('').length < 6}
            className="w-full py-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{verifyingOtp ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
          </button>
        </form>

        {/* Resend & Back options */}
        <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Email / Edit Details</span>
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resending}
            className="text-japan-red hover:underline font-bold flex items-center gap-1.5 cursor-pointer disabled:text-slate-400 disabled:no-underline transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 1: REGISTRATION DETAILS FORM
  // ==========================================
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-100 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo.png" alt="Gakkou No Shiken" className="h-16 w-auto mx-auto object-contain filter drop-shadow-xs" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Candidate Account</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Sign up with 1-click or register with email to start official mock exams.
        </p>
      </div>

      {/* 1-Click Social Sign-Up */}
      <GoogleSignInButton text="Sign up with Google" enableOneTap={true} />

      <div className="relative flex items-center justify-center my-4">
        <hr className="w-full border-slate-200" />
        <span className="absolute bg-white px-3 text-[11px] font-extrabold uppercase text-slate-400">
          or register with details
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl font-semibold animate-fade-in">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="id_first_name" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              id="id_first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
              placeholder="e.g. Kenji"
            />
          </div>
          <div>
            <label htmlFor="id_last_name" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              id="id_last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
              placeholder="e.g. Tanaka"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="id_username" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Candidate Username <span className="text-japan-red">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
            <input
              type="text"
              id="id_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-bold text-slate-900 font-mono text-sm"
              placeholder="e.g. kenji_tanaka"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="id_email" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Email Address <span className="text-japan-red">*</span>
          </label>
          <input
            type="email"
            id="id_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
            placeholder="candidate@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="id_password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Password <span className="text-japan-red">*</span>
          </label>
          <input
            type="password"
            id="id_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
            placeholder="At least 6 characters"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="id_password_confirm" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Confirm Password <span className="text-japan-red">*</span>
          </label>
          <input
            type="password"
            id="id_password_confirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-semibold text-slate-800 text-sm"
            placeholder="Confirm password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{submitting ? 'Sending Verification Code...' : 'Register Candidate Profile'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <hr className="border-slate-100" />

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm">
        <span className="text-slate-500 font-medium">Already have an account?</span>
        <Link
          href={`/accounts/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-japan-red hover:underline font-bold transition-colors ml-1"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 animate-fade-in">
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
