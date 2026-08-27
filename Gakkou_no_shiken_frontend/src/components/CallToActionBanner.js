'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function CallToActionBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl lg:rounded-4xl bg-gradient-to-r from-japan-red via-rose-600 to-amber-600 text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-red-500/25 select-none">
      {/* Subtle geometric circles */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-black/15 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>100% Free Practice Tests Available</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Ready to Pass Your JFT-Basic &amp; SSW Exam on the First Attempt?
        </h2>

        <p className="text-rose-100 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
          Join over 15,000 candidates preparing for their Specified Skilled Worker career in Japan. Start your timed diagnostic CBT exam now with no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="#practice-grid"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-japan-red font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <BookOpen className="w-5 h-5" />
            <span>Take Free Mock Test Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            href="/accounts/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black/25 hover:bg-black/35 text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl border border-white/25 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
          >
            <span>Create Free Account</span>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-rose-100 font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yellow-300" />
            <span>Instant CEFR Score Report</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yellow-300" />
            <span>10-Language Explanation Lens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yellow-300" />
            <span>Prometric Listening Audio Included</span>
          </div>
        </div>
      </div>
    </section>
  );
}
