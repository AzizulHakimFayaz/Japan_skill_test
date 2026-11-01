'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Native Banner (Responsive Ad Widget)
 * - Container ID: container-b19b348c8197cf11cb9964e37b8c701a
 * - Script URL: https://bauval.org/21/b19b348c8197cf11cb9964e37b8c701a
 * - no-print class ensures clean PDF exports & certificates without ad clutter.
 */
export default function AdsterraNativeBanner({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    // Reset container contents to prevent duplicate elements on client re-renders
    wrapper.innerHTML = '';

    // Create target container expected by Adsterra script
    const adContainer = document.createElement('div');
    adContainer.id = 'container-b19b348c8197cf11cb9964e37b8c701a';
    wrapper.appendChild(adContainer);

    // Create and execute the Adsterra async script
    const script = document.createElement('script');
    script.src = 'https://bauval.org/21/b19b348c8197cf11cb9964e37b8c701a';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    wrapper.appendChild(script);

    return () => {
      if (wrapper) {
        wrapper.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`adsterra-native-card no-print my-6 w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Sponsored Resources</span>
          <span className="text-[9px] text-slate-300 dark:text-slate-600 font-medium">Advertisement</span>
        </div>
        <div
          ref={containerRef}
          className="w-full min-h-[90px] flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}
