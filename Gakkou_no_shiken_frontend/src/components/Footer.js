'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass-header border-t border-slate-200/80 mt-auto py-6 sm:py-10 mobile-footer-hide">
      <div className="max-w-[1850px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Gakkou No Shiken" className="h-8 sm:h-9 w-auto object-contain" />
            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
              Gakkou No Shiken (学校の試験)
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-japan-red transition-colors">
              Home
            </Link>
            <Link href="/jft-basic" className="hover:text-japan-red transition-colors">
              JFT-Basic Info
            </Link>
            <Link href="/ssw-skill-test" className="hover:text-japan-red transition-colors">
              SSW Skill Tests
            </Link>
            <a
              href="https://www.facebook.com/Gakkou.No.Shiken"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              Facebook ↗
            </a>
            <a
              href="https://www.instagram.com/gakkou.no.shiken/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors flex items-center gap-1"
            >
              Instagram ↗
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              WhatsApp Channel ↗
            </a>
            <a
              href="https://www.prometric-jp.com/en/jftbasic/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-japan-red transition-colors flex items-center gap-1"
            >
              Prometric Portal ↗
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            System Ready • CBT Next.js v2.4
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400">
            &copy; 2026 Gakkou No Shiken. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
