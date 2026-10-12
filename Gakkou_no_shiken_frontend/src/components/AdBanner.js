'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

/**
 * Responsive Google AdSense Banner Component with Elegant Fallback
 *
 * @param {string} slot - AdSense ad slot ID (e.g. "1234567890")
 * @param {string} format - "auto" | "rectangle" | "horizontal" | "vertical"
 * @param {string} layout - Custom layout class
 * @param {boolean} responsive - Whether ad is responsive
 * @param {string} className - Additional CSS classes
 */
export default function AdBanner({
  slot = '8435487820',
  format = 'auto',
  responsive = true,
  className = '',
  title = 'Sponsored Study Partner',
}) {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return;

    try {
      // Check if adsbygoogle is defined
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (err) {
      // If blocked by adblocker or pending account review, activate elegant fallback
      console.warn('AdSense slot init info:', err?.message || err);
      setAdFailed(true);
    }
  }, [slot]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 p-3 sm:p-4 my-4 shadow-sm transition-all ${className}`}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Advertisement / Sponsored Partner</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          Gakkou No Shiken
        </span>
      </div>

      {/* AdSense Unit */}
      <div className="min-h-[90px] sm:min-h-[120px] flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-8435487820435842"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
          ref={adRef}
        />

        {/* Elegant Fallback for Pending AdSense Approval or Adblock */}
        {(!adLoaded || adFailed) && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-rose-50/80 via-slate-50 to-indigo-50/80 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 text-center sm:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-japan-red/10 dark:bg-rose-950/60 border border-japan-red/20 text-japan-red dark:text-rose-400 text-[10px] font-bold">
                <span>Official Partner</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Preparing for JFT-Basic or SSW Specified Skilled Worker?
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Practice with authentic Prometric CBT computer tests, 26 JAC textbooks, and native listening dialogues.
              </p>
            </div>
            <a
              href="https://www.facebook.com/Gakkou.No.Shiken"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-japan-red hover:bg-japan-redhover text-white text-xs font-black shadow-sm active:scale-95 transition-all"
            >
              <span>Follow Official Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
