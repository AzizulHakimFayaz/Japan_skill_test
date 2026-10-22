'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-[#060913]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 mt-auto py-6 sm:py-10 mobile-footer-hide transition-colors duration-300">
      <div className="max-w-[1850px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Gakkou No Shiken" className="h-8 sm:h-9 w-auto object-contain filter drop-shadow-sm" />
            <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              Gakkou No Shiken (学校の試験)
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors font-bold">
              About Us
            </Link>
            <Link href="/how-it-works" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors font-bold">
              How It Works
            </Link>
            <Link href="/tools" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Study Tools
            </Link>
            <Link href="/jft-basic" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              JFT-Basic Info
            </Link>
            <Link href="/ssw-skill-test" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              SSW Skill Tests
            </Link>
            <Link href="/books" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors font-bold">
              JAC Books (26)
            </Link>
            <Link href="/guides" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors font-bold text-japan-red dark:text-rose-400">
              Exam Guides (12)
            </Link>
            <Link href="/guides/jft-basic-exam-guide" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              JFT Guide
            </Link>
            <Link href="/guides/ssw-skill-test-guide" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              SSW Blueprint
            </Link>
            <Link href="/guides/jac-textbooks-guide" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Textbooks Guide
            </Link>
            <Link href="/leaderboard" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="/privacy" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
              Disclaimer
            </Link>
            <Link href="/contact" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors font-bold">
              Contact Us
            </Link>
            <a
              href="https://www.facebook.com/Gakkou.No.Shiken"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <span>Facebook</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://www.instagram.com/gakkou.no.shiken/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>WhatsApp Channel</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://www.prometric-jp.com/en/jftbasic/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-japan-red dark:hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <span>Prometric Official</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Prominent Non-Affiliation and Educational Attribution Notice */}
        <div className="w-full pt-4 mt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed max-w-5xl mx-auto space-y-1">
          <p>
            <strong>Non-Affiliation Notice:</strong> Gakkou No Shiken (学校の試験) is an independent educational platform operated by Bangladeshi educators. We are not affiliated with, sponsored by, authorized by, or endorsed by The Japan Foundation, Prometric Inc., JAC (建設技能人材機構), OTIT, JITCO, or any Japanese governmental agency. All CBT mock tests and study materials are developed independently for self-study purposes.
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            JAC training textbooks referenced on this platform are authored by the Japan Association for Construction Human Resources and used under educational fair use for candidate preparation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-900 gap-2 sm:gap-4 text-center">
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Prometric CBT Simulation Engine Live</span>
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
            &copy; 2026 Gakkou No Shiken. Independent Educational Platform. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
