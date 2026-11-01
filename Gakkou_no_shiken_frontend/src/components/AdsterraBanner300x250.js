'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Adsterra 300x250 Box Display Banner
 * Key: e918c25f2752c4916e10cb8237956352
 * Script: https://bauval.org/22/e918c25f2752c4916e10cb8237956352
 * Uses an isolated sandbox iframe to cleanly execute atOptions without React DOM interference.
 */
export default function AdsterraBanner300x250({ className = '' }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '300';
    iframe.height = '250';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('scrolling', 'no');
    container.appendChild(iframe);

    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <base target="_blank">
            <style>
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; background: transparent; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : 'e918c25f2752c4916e10cb8237956352',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bauval.org/22/e918c25f2752c4916e10cb8237956352"></script>
          </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.warn('Adsterra iframe initialization error:', e);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`adsterra-300x250-wrapper no-print my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
        Sponsored
      </span>
      <div
        ref={bannerRef}
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs"
      />
    </div>
  );
}
