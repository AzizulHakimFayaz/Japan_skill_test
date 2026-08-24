'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthLogin, updateUserProfile } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { User, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

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

  // Modal state for first-time Google sign-ups
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUserObj, setNewUserObj] = useState(null);
  const [chosenUsername, setChosenUsername] = useState('');
  const [chosenTargetExam, setChosenTargetExam] = useState('jft_basic');
  const [savingUsername, setSavingUsername] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;

    setLoading(true);
    setError(null);

    try {
      const data = await googleAuthLogin(response.credential);
      if (data?.user) {
        if (data.is_new_user) {
          // First time user: Prompt to confirm or choose username
          setNewUserObj(data.user);
          setChosenUsername(data.user.username || '');
          setShowUsernameModal(true);
          setLoading(false);
        } else {
          // Existing user: Log in immediately
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
    if (!chosenUsername.trim()) {
      setModalError('Please enter a username.');
      return;
    }

    setSavingUsername(true);
    setModalError(null);

    try {
      const res = await updateUserProfile({
        username: chosenUsername.trim(),
        target_exam: chosenTargetExam,
      });

      const updatedUser = res?.user || { ...newUserObj, username: chosenUsername.trim() };
      login(updatedUser);
      setShowUsernameModal(false);
      router.push(next);
    } catch (err) {
      setModalError(err.message || 'Username might already be taken. Please choose another.');
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

      {/* New Candidate Username Selection Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 text-japan-red rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Choose Candidate Username</h3>
              <p className="text-slate-500 text-xs">
                Welcome, <strong>{newUserObj?.first_name || newUserObj?.email}</strong>! Please choose your candidate username for leaderboards and scorecards.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold text-center animate-fade-in">
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmUsername} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
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
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-japan-red focus:ring-4 focus:ring-red-100 transition-all font-mono"
                    placeholder="e.g. kenji_tanaka"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Letters, numbers, and underscores only. You can change this later.
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                  Target Exam
                </label>
                <select
                  value={chosenTargetExam}
                  onChange={(e) => setChosenTargetExam(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-japan-red transition-all"
                >
                  <option value="jft_basic">JFT-Basic (A2 Standard)</option>
                  <option value="ssw_nursing">SSW: Nursing Care (介護)</option>
                  <option value="ssw_food">SSW: Food Service (外食業)</option>
                  <option value="ssw_agriculture">SSW: Agriculture (農業)</option>
                  <option value="ssw_construction">SSW: Construction (建設業)</option>
                  <option value="ssw_manufacturing">SSW: Manufacturing (製造業)</option>
                  <option value="ssw_accommodation">SSW: Accommodation (宿泊業)</option>
                  <option value="jlpt_n4">JLPT N4</option>
                  <option value="jlpt_n3">JLPT N3</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={savingUsername}
                className="w-full py-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                <span>{savingUsername ? 'Setting up Profile...' : 'Complete & Start Practice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
