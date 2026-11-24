'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  detectVisitorCountry,
  joinPartnerSchool,
} from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  User,
  Phone,
  MapPin,
  Users,
  KeyRound,
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const initialRole = searchParams.get('role') === 'school' ? 'school' : 'candidate';
  const { login } = useAuth();

  // Role Switcher: 'candidate' | 'school'
  const [role, setRole] = useState(initialRole);

  // Common Account Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [customCountry, setCustomCountry] = useState('');
  const [detectedLocation, setDetectedLocation] = useState(null);

  // School / Sensei Specific State (Required when role === 'school')
  const [schoolName, setSchoolName] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState('50');
  const [examFocus, setExamFocus] = useState('JFT-Basic A2 & SSW Sector Skills');
  const [requireJoinPin, setRequireJoinPin] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  // Candidate Optional School Join State (when role === 'candidate')
  const [showStudentSchoolBox, setShowStudentSchoolBox] = useState(false);
  const [studentSchoolSlug, setStudentSchoolSlug] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentJoinPin, setStudentJoinPin] = useState('');

  // Auto-detect visitor's country from IP trace
  useEffect(() => {
    let isMounted = true;
    detectVisitorCountry()
      .then((res) => {
        if (isMounted && res?.country) {
          setCountry(res.country);
          if (res.is_detected) {
            setDetectedLocation(res.country);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalCountry = country === 'Other' ? customCountry.trim() : country;
    if (!finalCountry) {
      setError('Please select or specify your country.');
      return;
    }

    if (role === 'school') {
      if (!schoolName.trim()) {
        setError('Please enter your School / LPK / Training Center Name.');
        return;
      }
      if (!schoolCity.trim()) {
        setError('Please enter your School City / Campus Location.');
        return;
      }
      if (!schoolPhone.trim()) {
        setError('Please enter an Official WhatsApp or Contact Phone Number for your school.');
        return;
      }
      if (!firstName.trim()) {
        setError('Please enter the Sensei / Coordinator Name.');
        return;
      }
    }

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
      await sendRegistrationOTP(
        username,
        email,
        password,
        passwordConfirm,
        firstName,
        lastName,
        finalCountry,
        role === 'school'
          ? {
              role: 'school',
              school_name: schoolName.trim(),
              city: schoolCity.trim(),
              whatsapp_or_phone: schoolPhone.trim(),
            }
          : { role: 'candidate' }
      );
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

  const handleOtpChange = (index, value) => {
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

    if (digit && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputsRef.current[index - 1]) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join('').trim();
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    const finalCountry = country === 'Other' ? customCountry.trim() : country;

    try {
      const extraPayload =
        role === 'school'
          ? {
              role: 'school',
              school_name: schoolName.trim(),
              city: schoolCity.trim(),
              country: finalCountry,
              whatsapp_or_phone: schoolPhone.trim(),
              estimated_students: Number(estimatedStudents) || 50,
              exam_focus: examFocus,
              require_join_pin: requireJoinPin,
              require_approval: requireApproval,
            }
          : { role: 'candidate' };

      const data = await verifyRegistrationOTP(email, code, extraPayload);
      if (data?.user) {
        login(data.user);

        // If School registration, redirect directly to the new Schoooli Sensei LMS Portal
        const createdSlug =
          data?.partner_school?.slug || data?.user?.owned_partner_school?.slug;
        if (role === 'school' && createdSlug) {
          setOtpSuccess(`School verified! Launching ${schoolName} Sensei LMS Portal...`);
          setTimeout(() => {
            router.push(`/partner/${encodeURIComponent(createdSlug)}`);
          }, 900);
          return;
        }

        // If Candidate entered an optional School Code + Join PIN during signup, auto-join
        if (role === 'candidate' && studentSchoolSlug.trim()) {
          try {
            const joinRes = await joinPartnerSchool({
              slug: studentSchoolSlug.trim().toLowerCase(),
              batch: studentBatch.trim(),
              join_code: studentJoinPin.trim(),
              first_name: firstName.trim() || username,
              last_name: lastName.trim(),
            });
            if (joinRes?.user) login(joinRes.user);
            setOtpSuccess('Email verified & linked to your school classroom!');
            setTimeout(() => {
              router.push(`/partner/${encodeURIComponent(studentSchoolSlug.trim().toLowerCase())}?mode=classroom`);
            }, 900);
            return;
          } catch {
            // Continue to normal redirect if optional school join failed
          }
        }

        setOtpSuccess('Email verified successfully! Logging you in...');
        setTimeout(() => {
          router.push(next);
        }, 900);
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired verification code. Please check your inbox.');
    } finally {
      setVerifyingOtp(false);
    }
  };

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
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6 animate-scale-up">
        <div className="text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs border ${
              role === 'school'
                ? 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                : 'bg-red-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 border-red-100 dark:border-rose-800/60'
            }`}
          >
            <Mail className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {role === 'school' ? 'Verify School Email' : 'Check Your Inbox'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
            We sent a 6-digit verification code to{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{email}</strong>
            {role === 'school' ? ` to activate ${schoolName} Sensei LMS.` : '.'}
          </p>
        </div>

        {otpError && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs p-4 rounded-2xl font-semibold animate-fade-in text-center">
            {otpError}
          </div>
        )}
        {otpSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs p-4 rounded-2xl font-semibold animate-fade-in text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{otpSuccess}</span>
          </div>
        )}

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
                className="w-10 h-12 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-600 dark:focus:border-slate-400 rounded-2xl transition-all font-mono shadow-xs"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifyingOtp || otpDigits.join('').length < 6}
            className={`w-full py-4 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              role === 'school'
                ? 'bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-900 hover:to-slate-900 shadow-slate-500/20'
                : 'bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 shadow-red-500/20'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {verifyingOtp
                ? 'Verifying & Creating Portal...'
                : role === 'school'
                ? 'Verify & Launch Sensei LMS Portal'
                : 'Verify & Activate Account'}
            </span>
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Email / Edit Details</span>
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resending}
            className="text-japan-red dark:text-rose-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline transition-colors"
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
  const isSchool = role === 'school';

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
      {/* 1. Candidate vs School Role Switcher Tabs */}
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
          {isSchool ? 'Register School & Sensei LMS' : 'Create Candidate Account'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
          {isSchool
            ? 'Set up your Japanese Training Center / LPK portal to assign mock tests, share study notes, send notices, and protect classes with a 6-digit Join PIN.'
            : 'Sign up in seconds to practice JFT-Basic & SSW CBT mock exams or join your training center classroom.'}
        </p>
      </div>

      {!isSchool && (
        <>
          <GoogleSignInButton text="Sign up with Google" enableOneTap={true} />
          <div className="relative flex items-center justify-center my-3">
            <hr className="w-full border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-extrabold uppercase text-slate-400">
              or register with email
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
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* ============================================================ */}
        {/* REQUIRED SCHOOL / LPK DETAILS SECTION (WHEN ROLE === SCHOOL) */}
        {/* ============================================================ */}
        {isSchool && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/70 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
              <span>1. Training Center / School Information (Required)</span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                School / LPK / Japanese Institute Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. LPK Sakura Nusantara / Dhaka Nihongo Academy"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  City / Campus Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolCity}
                    onChange={(e) => setSchoolCity(e.target.value)}
                    placeholder="e.g. Dhaka, Jakarta, Kathmandu"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Official WhatsApp / Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                    placeholder="+880 17... / +62 812..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Students per Batch
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    value={estimatedStudents}
                    onChange={(e) => setEstimatedStudents(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Exam Track
                </label>
                <select
                  value={examFocus}
                  onChange={(e) => setExamFocus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="JFT-Basic A2 & SSW Sector Skills">JFT-Basic A2 &amp; SSW Skills</option>
                  <option value="JFT-Basic A2 Standard Only">JFT-Basic A2 Standard Only</option>
                  <option value="SSW Caregiving / Food / Agriculture">SSW Caregiving / Food / Agri</option>
                </select>
              </div>
            </div>

            {/* Anti-Leak Security Checkboxes */}
            <div className="pt-1 space-y-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireJoinPin}
                  onChange={(e) => setRequireJoinPin(e.target.checked)}
                  className="mt-0.5 rounded text-slate-700"
                />
                <span>
                  <strong className="font-black text-slate-800 dark:text-slate-300">
                    🔐 Enable 6-Digit Class Join PIN
                  </strong>{' '}
                  — Prevents outsiders from joining if a student shares your link.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="mt-0.5 rounded text-slate-700"
                />
                <span>
                  <strong className="font-black text-slate-800 dark:text-slate-300">
                    🛡️ Require Sensei Approval Queue
                  </strong>{' '}
                  — Hold new students in Pending until you approve them.
                </span>
              </label>
            </div>
          </div>
        )}

        {isSchool && (
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
            <User className="w-4 h-4 text-slate-700" />
            <span>2. Sensei / Coordinator Login Credentials</span>
          </div>
        )}

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="id_first_name"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {isSchool ? 'Sensei First Name *' : 'First Name'}
            </label>
            <input
              type="text"
              id="id_first_name"
              required={isSchool}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
              placeholder={isSchool ? 'e.g. Budi / Rahim' : 'e.g. Kenji'}
            />
          </div>
          <div>
            <label
              htmlFor="id_last_name"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {isSchool ? 'Title / Last Name' : 'Last Name'}
            </label>
            <input
              type="text"
              id="id_last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
              placeholder={isSchool ? 'e.g. Sensei' : 'e.g. Tanaka'}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="id_username"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            {isSchool ? 'Sensei Login Username' : 'Candidate Username'}{' '}
            <span className="text-japan-red">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              @
            </span>
            <input
              type="text"
              id="id_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-bold text-slate-900 dark:text-white font-mono text-sm"
              placeholder={isSchool ? 'e.g. sakura_sensei' : 'e.g. kenji_tanaka'}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="id_email"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            {isSchool ? 'Official School / Sensei Email' : 'Email Address'}{' '}
            <span className="text-japan-red">*</span>
          </label>
          <input
            type="email"
            id="id_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
            placeholder={isSchool ? 'sensei@yourschool.com' : 'candidate@example.com'}
          />
        </div>

        {/* Country */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="id_country"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Country / Exam Region <span className="text-japan-red">*</span>
            </label>
            {detectedLocation && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Auto-detected: {detectedLocation}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Globe className="w-4 h-4" />
            </span>
            <select
              id="id_country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm appearance-none cursor-pointer"
            >
              <option value="Bangladesh">🇧🇩 Bangladesh</option>
              <option value="Nepal">🇳🇵 Nepal</option>
              <option value="Vietnam">🇻🇳 Vietnam</option>
              <option value="Indonesia">🇮🇩 Indonesia</option>
              <option value="Myanmar">🇲🇲 Myanmar</option>
              <option value="Philippines">🇵🇭 Philippines</option>
              <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
              <option value="India">🇮🇳 India</option>
              <option value="Uzbekistan">🇺🇿 Uzbekistan</option>
              <option value="Mongolia">🇲🇳 Mongolia</option>
              <option value="Thailand">🇹🇭 Thailand</option>
              <option value="Pakistan">🇵🇰 Pakistan</option>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="Other">🌍 Other / Global</option>
            </select>
          </div>

          {country === 'Other' && (
            <input
              type="text"
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              required
              placeholder="Enter your country name"
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm animate-fade-in"
            />
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="id_password"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Password <span className="text-japan-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="id_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
                placeholder="Min 6 chars"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="id_password_confirm"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Confirm Password <span className="text-japan-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="id_password_confirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 focus:outline-none focus:border-japan-red dark:focus:border-rose-500 transition-all font-semibold text-slate-800 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Student School Join Box (When Candidate Role is selected) */}
        {!isSchool && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowStudentSchoolBox(!showStudentSchoolBox)}
              className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>
                {showStudentSchoolBox
                  ? 'Hide Partner School / Classroom Link'
                  : '🎒 Joining a Partner School or Training Center? Enter School Code & PIN (Optional)'}
              </span>
            </button>

            {showStudentSchoolBox && (
              <div className="mt-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    School Code
                  </label>
                  <input
                    type="text"
                    value={studentSchoolSlug}
                    onChange={(e) => setStudentSchoolSlug(e.target.value)}
                    placeholder="e.g. lpk-sakura"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={studentBatch}
                    onChange={(e) => setStudentBatch(e.target.value)}
                    placeholder="e.g. Batch-14"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Join PIN
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={studentJoinPin}
                    onChange={(e) => setStudentJoinPin(e.target.value)}
                    placeholder="e.g. 482910"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-black tracking-widest"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg active:scale-95 mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
            isSchool
              ? 'bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-900 hover:to-slate-900 shadow-slate-500/20'
              : 'bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 shadow-red-500/20'
          }`}
        >
          <span>
            {submitting
              ? 'Sending Verification Code...'
              : isSchool
              ? 'Create School & Launch Sensei Portal'
              : 'Register Candidate Profile'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {isSchool ? 'Already registered your school?' : 'Already have an account?'}
        </span>
        <Link
          href={`/accounts/login?role=${role}${next && next !== '/' ? `&next=${encodeURIComponent(next)}` : ''}`}
          className={`hover:underline font-bold transition-colors ml-1 ${
            isSchool ? 'text-slate-700 dark:text-slate-300' : 'text-japan-red dark:text-rose-400'
          }`}
        >
          {isSchool ? 'Sign In to Sensei Portal' : 'Sign In'}
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="max-w-lg mx-auto py-6 sm:py-10 animate-fade-in-up">
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading registration portal...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
