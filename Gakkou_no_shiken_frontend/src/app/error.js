'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, Home, AlertTriangle } from 'lucide-react';

export default function GlobalPageError({ error, reset }) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error('App Router Caught Error:', error);

    // If error is caused by a deployment chunk mismatch, auto-reload once to fetch fresh chunks
    const isChunkLoadError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch RSC payload') ||
      error?.message?.includes('could not load');

    if (isChunkLoadError) {
      const storageKey = 'last_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();

      // Only auto-reload if we haven't done so in the last 15 seconds (prevents reload loop)
      if (now - lastReload > 15000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
      <div className="max-w-md w-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-2xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
        {/* Animated Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-japan-red dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Page Update in Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A new version of the portal has just been published, or your connection was momentarily interrupted. Please reload to sync the latest questions and test data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-red-700 hover:to-red-800 text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-red-500/20 active:scale-95 text-xs cursor-pointer"
          >
            <RotateCw className="w-4 h-4 animate-spin-once" />
            <span>Reload Page</span>
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-6 py-3.5 rounded-2xl transition-colors text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
