'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthLogin, updateUserProfile } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { User, CheckCircle2, Sparkles, ArrowRight, Calendar, ChevronDown } from 'lucide-react';

function addDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const EXAM_GUESS_PRESETS = [
  { id: '1m', label: 'Next Month', days: 30 },
  { id: '3m', label: 'In 2–3 Months', days: 75 },
  { id: '6m', label: 'In 6 Months', days: 180 },
  { id: '9m', label: '9+ Months', days: 270 },
];

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '990813648631-ck67gllph2cdlofbg3t4bdb7drjiba5n.apps.googleusercontent.com';

export default function GoogleSignInButton({
  text = 'Continue with Google',
  className = '',
  enableOneTap = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/';
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);

  // Modal state for first-time Google sign-ups (or returning Google users missing exam date)
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(true);
  const [newUserObj, setNewUserObj] = useState(null);
  const [chosenUsername, setChosenUsername] = useState('');
  const [chosenTargetExam, setChosenTargetExam] = useState('jft_basic');
  const [chosenExamDate, setChosenExamDate] = useState('');
  const [activePreset, setActivePreset] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;

    setLoading(true);
    setError(null);

    try {
      const data = await googleAuthLogin(response.credential);
      if (data?.user) {
        const missingExamDate =
          !data.user.profile?.planned_exam_date &&
          !data.user.owned_partner_school?.slug &&
          !data.user.is_staff;

        if (data.is_new_user || missingExamDate) {
          setIsNewGoogleUser(Boolean(data.is_new_user));
          setNewUserObj(data.user);
          setChosenUsername(data.user.username || '');
          setChosenTargetExam(data.user.profile?.target_exam || 'jft_basic');
          setChosenExamDate(data.user.profile?.planned_exam_date || '');
          setActivePreset('');
          setShowUsernameModal(true);
          setLoading(false);
        } else {
          // Existing user with exam date set: Log in immediately
          login(data.user);
          router.push(next);
        }
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleConfirmUsername = async (e) => {
    e.preventDefault();
    if (isNewGoogleUser && !chosenUsername.trim()) {
      setModalError('Please enter a username.');
      return;
    }
    if (!chosenExamDate) {
      setModalError('Please choose your expected exam date or pick a quick estimate below.');
      return;
    }

    setSavingUsername(true);
    setModalError(null);

    try {
      const payload = {
        target_exam: chosenTargetExam,
        planned_exam_date: chosenExamDate,
      };
      if (isNewGoogleUser) {
        payload.username = chosenUsername.trim();
      }
      const res = await updateUserProfile(payload);

      const updatedUser = res?.user || { ...newUserObj, username: chosenUsername.trim() };
      login(updatedUser);
      setShowUsernameModal(false);
      router.push(next);
    } catch (err) {
      setModalError(err.message || 'Could not save your profile. Please check your details.');
    } finally {
      setSavingUsername(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeGoogle = () => {
      if (!window.google || !window.google.accounts) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (enableOneTap) {
        window.google.accounts.id.prompt();
      }
    };

    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    }
  }, [enableOneTap]);

  const handleManualClick = () => {
    if (loading) return;

    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          if (buttonRef.current) {
            window.google.accounts.id.renderButton(buttonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: buttonRef.current.offsetWidth || 300,
            });
            const actualBtn = buttonRef.current.querySelector('div[role=button]');
            if (actualBtn) actualBtn.click();
          }
        }
      });
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl animate-fade-in">
          {error}
        </div>
      )}

      {/* Hidden container to fallback Google standard button if required */}
      <div ref={buttonRef} className="hidden" />

      <button
        type="button"
        onClick={handleManualClick}
        disabled={loading}
        className={`w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300/90 hover:border-slate-400 rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow-md flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loading ? 'Verifying with Google...' : text}</span>
      </button>

      {/* Google Onboarding Modal: Username (new users) + Required Exam Date / Quick Estimate */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up max-h-[92dvh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 dark:bg-rose-950/60 text-japan-red rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                {isNewGoogleUser ? <Sparkles className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isNewGoogleUser ? 'Complete Your Candidate Setup' : 'When Is Your Target Exam?'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Welcome, <strong className="text-slate-800 dark:text-slate-200">{newUserObj?.first_name || newUserObj?.email}</strong>!{' '}
                {isNewGoogleUser
                  ? 'Confirm your username and tell us roughly when you plan to take your Japanese exam.'
                  : 'Pick your exact exam date or a quick estimate so we can personalize your countdown & study plan.'}
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-center animate-fade-in">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmUsername} className="space-y-4">
              {isNewGoogleUser && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Candidate Username <span className="text-japan-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={chosenUsername}
                      onChange={(e) => setChosenUsername(e.target.value)}
                      required
                      autoFocus
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/15 focus:border-japan-red transition-all font-mono"
                      placeholder="e.g. kenji_tanaka"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Exam Track <span className="text-japan-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={chosenTargetExam}
                    onChange={(e) => setChosenTargetExam(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/15 focus:border-japan-red appearance-none cursor-pointer transition-all"
                  >
                    <option value="jft_basic">JFT-Basic (A2 Standard)</option>
                    <option value="jlpt_n4">JLPT N4</option>
                    <option value="jlpt_n3">JLPT N3</option>
                    <option value="ssw_nursing">SSW: Nursing Care</option>
                    <option value="ssw_food">SSW: Food Service</option>
                    <option value="ssw_agriculture">SSW: Agriculture</option>
                    <option value="ssw_construction">SSW: Construction</option>
                    <option value="ssw_manufacturing">SSW: Manufacturing</option>
                    <option value="ssw_accommodation">SSW: Accommodation</option>
                    <option value="other">Other Examination</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Required Exam Date or 1-Tap Estimate */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAFA] dark:bg-slate-800/60 border border-[#CBE5E3] dark:border-slate-700 space-y-2.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                  Expected Exam Date (or Best Guess) <span className="text-japan-red">*</span>
                </label>

                {/* 1-Tap Quick Estimate Pills */}
                <div className="grid grid-cols-2 gap-1.5">
                  {EXAM_GUESS_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePreset(p.id);
                        setChosenExamDate(addDaysIso(p.days));
                        setModalError(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold border transition cursor-pointer ${
                        activePreset === p.id
                          ? 'bg-[#2C687B] text-white border-[#2C687B] shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#2C687B]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={chosenExamDate}
                    onChange={(e) => {
                      setChosenExamDate(e.target.value);
                      setActivePreset('');
                      setModalError(null);
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C687B]/20 focus:border-[#2C687B] transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Not sure of the exact day? Just tap an estimate above — you can update it anytime in your Profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingUsername}
                className="w-full py-3.5 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{savingUsername ? 'Saving Profile...' : 'Save & Start Practice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
