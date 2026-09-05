'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { confirmCountry, detectVisitorCountry } from '@/lib/api';
import { Globe, Check, X } from 'lucide-react';

const COUNTRIES = [
  'Bangladesh',
  'Nepal',
  'Vietnam',
  'Indonesia',
  'Myanmar',
  'Philippines',
  'Sri Lanka',
  'India',
  'Uzbekistan',
  'Mongolia',
  'Thailand',
  'Pakistan',
  'Japan',
  'Other',
];

export default function CountryConfirmationBanner() {
  const { user, login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('Bangladesh');
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.profile?.country) {
      setSelectedCountry(user.profile.country);
    } else {
      detectVisitorCountry()
        .then((res) => {
          if (res?.country) {
            setSelectedCountry(res.country);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Only show if user is logged in and needs country confirmation
  if (!user || !user.profile?.needs_country_confirmation || dismissed) {
    return null;
  }

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xl animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-japan-red dark:text-rose-400">
          <Globe className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Complete Your Candidate Profile
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please select your country to personalize your national leaderboard and exam alerts.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-japan-red cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-red-500/20 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Confirm'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
