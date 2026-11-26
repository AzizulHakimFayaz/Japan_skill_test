'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Camera, Megaphone, Sparkles, X, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getActiveSitePopup } from '@/lib/api';

function getTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function SmartPopupNoticeModal() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (authLoading || typeof window === 'undefined') return;
    let active = true;

    const timer = setTimeout(() => {
      getActiveSitePopup()
        .then((res) => {
          if (!active) return;
          const item = res?.popup;
          if (!item || !item.id) return;

          const dismissKey = `gns_popup_forever_${item.id}`;
          const lastShownKey = `gns_popup_day_${item.id}`;
          const today = getTodayIso();

          try {
            if (localStorage.getItem(dismissKey) === '1') return; // User clicked "Don't show again"
            if (localStorage.getItem(lastShownKey) === today) return; // Already shown once today
            localStorage.setItem(lastShownKey, today);
          } catch {
            // ignore storage errors
          }

          setPopup(item);
          setVisible(true);
        })
        .catch(() => {});
    }, 1800);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [authLoading, isAuthenticated]);

  if (!visible || !popup) return null;

  const closeToday = () => {
    setVisible(false);
  };

  const closeForever = () => {
    try {
      localStorage.setItem(`gns_popup_forever_${popup.id}`, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const Icon =
    popup.popup_type === 'profile_update'
      ? Camera
      : popup.popup_type === 'exam_alert'
      ? Bell
      : popup.popup_type === 'feature'
      ? Sparkles
      : Megaphone;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={closeToday}
    >
      <div
        className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0f1629] border-2 border-[#CBE5E3] dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#DB1A1A] via-[#2C687B] to-[#8CC7C4]" />

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 text-[#DB1A1A] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                  {popup.popup_type === 'profile_update'
                    ? 'Profile Update'
                    : popup.popup_type === 'exam_alert'
                    ? 'Exam Alert'
                    : popup.popup_type === 'feature'
                    ? 'New Feature'
                    : 'Notice'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug mt-0.5">
                  {popup.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={closeToday}
              aria-label="Close for today"
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {popup.message}
          </p>

          <div className="flex flex-col gap-2 pt-1">
            {popup.cta_url && (
              <Link
                href={popup.cta_url}
                onClick={closeToday}
                className="w-full py-3 px-4 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1.5 transition"
              >
                <span>{popup.cta_label || 'Open Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={closeToday}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition"
              >
                Remind me tomorrow
              </button>
              <button
                type="button"
                onClick={closeForever}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-[#DB1A1A] text-slate-500 dark:text-slate-400 text-xs font-bold cursor-pointer transition"
              >
                Don&apos;t show again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
