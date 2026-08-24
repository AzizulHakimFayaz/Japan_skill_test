'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthLogin } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';

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

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;

    setLoading(true);
    setError(null);

    try {
      const data = await googleAuthLogin(response.credential);
      if (data?.user) {
        login(data.user);
        router.push(next);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
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
      // Trigger Google account selector prompt
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One-tap is suppressed, render temporary standard button to trigger popup
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
    </div>
  );
}
