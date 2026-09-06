'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { confirmCountry, detectVisitorCountry } from '@/lib/api';
import { Globe, Check, X, MapPin } from 'lucide-react';

const COUNTRIES = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'OTHER', name: 'Other', flag: '🌐' },
];

export default function CountryConfirmationBanner() {
  const { user, login } = useAuth();
  const pathname = usePathname();
  const [selectedCountry, setSelectedCountry] = useState(
    () => user?.profile?.country || 'Bangladesh'
  );
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('country_banner_dismissed') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (!user?.profile?.country) {
      detectVisitorCountry()
        .then((res) => {
          if (res?.country) {
            setSelectedCountry(res.country);
            setDetectedCountry(res.country);
          }
        })
        .catch(() => {});
    }
  }, [user?.profile?.country]);

  // Hide during active exams
  if (pathname?.startsWith('/test/') || pathname?.startsWith('/ssw-test/')) {
    return null;
  }

  // Only show if user is logged in and needs country confirmation
  if (!user || !user.profile?.needs_country_confirmation || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('country_banner_dismissed', 'true');
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const updated = await confirmCountry(selectedCountry);
      if (updated?.user) {
        login(updated.user);
      }
    } catch (err) {
      console.error('Failed to confirm country:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop on mobile to focus attention and prevent bottom dock clash */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs sm:hidden animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Responsive Container: Centered Modal on Mobile, Floating Card on Desktop */}
      <div className="fixed z-[70] inset-x-4 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md max-w-sm w-full mx-auto sm:mx-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl animate-fade-in-up max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-japan-red dark:text-rose-400 shadow-xs">
            <Globe className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                Complete Your Candidate Profile
              </h4>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Please select your country to personalize your national leaderboard rankings, mock test alerts, and venue guides.
            </p>

            {detectedCountry && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>Detected: {detectedCountry}</span>
              </div>
            )}

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-japan-red focus:ring-2 focus:ring-japan-red/20 transition-all cursor-pointer pr-8"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-red-500/25 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{submitting ? 'Saving...' : 'Confirm'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
              >
                Decide later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
