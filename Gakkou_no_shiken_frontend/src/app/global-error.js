'use client';

import React from 'react';
import { RotateCw, Home, AlertCircle } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Portal Sync Error</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              An update was published or the connection timed out. Reloading will sync the latest test platform.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all shadow-md text-xs cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reload Portal</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
