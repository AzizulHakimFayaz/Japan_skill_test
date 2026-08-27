'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  Sparkles,
  Laptop,
  Headphones,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Volume2,
  Flag,
  UserCheck,
  Zap,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-12 sm:space-y-20 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">How It Works</span>
      </nav>

      {/* =========================================================================
          SECTION 1: HERO & 3 STAT CARDS ON GLOWING CURVED HORIZON (Video 00:01-00:04)
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-[#070913] border border-slate-800/90 p-6 sm:p-12 lg:p-16 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center">
        {/* Ambient Top Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none"></div>

        {/* Top Social Proof Avatar Bubble Stack */}
        <div className="relative z-10 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg mb-6 backdrop-blur-md">
          <div className="flex -space-x-2">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-slate-900">
              FA
            </span>
            <span className="w-6 h-6 rounded-full bg-indigo-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-slate-900">
              RH
            </span>
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-slate-900">
              MK
            </span>
            <span className="w-6 h-6 rounded-full bg-amber-500 text-[10px] font-black text-slate-950 flex items-center justify-center ring-2 ring-slate-900">
              +1k
            </span>
          </div>
          <span className="text-xs font-bold text-slate-200">
            1,200+ Examinees already testing their skills
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="relative z-10 text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Pass Your Japanese CBT Exam &amp; Get Certified in 3 Simple Steps!
        </h1>

        <p className="relative z-10 text-xs sm:text-base text-slate-400 font-medium max-w-xl mx-auto mt-3 leading-relaxed">
          Sign up for free, experience authentic Prometric Computer-Based Testing, and get your instant CEFR A2 score diagnostic.
        </p>

        {/* 3 Metric Cards with Ambient Backlight Glow */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 max-w-4xl mx-auto text-left">
          {/* Left Card: 250 Scale */}
          <div className="relative bg-[#0c1020]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                250 Pts
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full CBT Scale
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span>Authentic Prometric</span>
              <span className="font-mono text-indigo-400 font-bold">4 Sections</span>
            </div>
          </div>

          {/* Center Featured Card: 200+ Target with Glow */}
          <div className="relative bg-gradient-to-b from-[#161430] to-[#0c0d1c] border-2 border-purple-500/60 rounded-3xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col justify-between space-y-4 transform md:-translate-y-2 transition-all">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Passing Benchmark
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-200 font-mono tracking-tight">
                200+ Pts
              </div>
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Pass Mark (80%)
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-purple-900/50">
              <span className="text-purple-300 font-bold">CEFR A2 Level</span>
              <span className="font-mono text-white font-bold">Official</span>
            </div>
          </div>

          {/* Right Card: 100% Free Start */}
          <div className="relative bg-[#0c1020]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                100% Free
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Instant Access
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span>Free Diagnostics</span>
              <span className="font-mono text-emerald-400 font-bold">No Card Req</span>
            </div>
          </div>
        </div>

        {/* Curved Glowing Horizon Arch with Floating CTA Button (Video 00:04) */}
        <div className="relative mt-12 pt-8">
          {/* Curved glowing neon light beam */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-indigo-500/20 via-purple-600/10 to-transparent rounded-[100%] blur-xl pointer-events-none"></div>
          <div className="absolute inset-x-12 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-xs"></div>
          <div className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>

          <Link
            href="/accounts/signup"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95 transition-all cursor-pointer"
          >
            <span>Create Free Account &rarr;</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: 3-STEP USER JOURNEY CARDS WITH UI PREVIEWS (Video 00:06-00:09)
         ========================================================================= */}
      <div className="space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider">
            <span>How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How To Test Your Skill in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign up, take the authentic CBT examination, and get your CEFR diagnostic score.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STEP 0.1: SIGN UP & PICK YOUR EXAM */}
          <ScrollReveal variant="up" delay={50} duration={500}>
            <div className="bg-[#080b18] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-slate-700 transition-all space-y-6">
              {/* Step Number Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>0.1</span>
                </span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded-full uppercase">
                  Step 1
                </span>
              </div>

              {/* Top Interactive UI Preview Box */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-[#0e142e] to-[#0a0d1e] border border-slate-800/90 p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden shadow-inner">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl pointer-events-none"></div>

                <div className="w-full max-w-[200px] p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-center space-y-1 shadow-md">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">1-Click Fast Access</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-950 text-[11px] font-black shadow-xs">
                    <span>Sign in with Google</span>
                    <ArrowRight className="w-3 h-3 text-japan-red" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-black">
                  <BookOpen className="w-3 h-3 text-japan-red" />
                  <span>JFT-Basic A2 Mock 01</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Sign Up &amp; Pick Your Exam
                </h3>
                <p className="text-xs text-japan-red font-bold">
                  ফ্রি সাইন-আপ করুন ও পরীক্ষা নির্বাচন করুন
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign up for free in 1 click with Google or email. Choose between JFT-Basic A2 Japanese language or SSW skill tests for Caregiving, Food Service, Agriculture, and more.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* STEP 0.2: TAKE EXAM & TEST YOUR SKILL */}
          <ScrollReveal variant="up" delay={120} duration={500}>
            <div className="bg-[#080b18] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-slate-700 transition-all space-y-6">
              {/* Step Number Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>0.2</span>
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded-full uppercase">
                  Step 2
                </span>
              </div>

              {/* Top Interactive UI Preview Box: CBT HUD */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-[#140e2e] to-[#0a0d1e] border border-slate-800/90 p-4 flex flex-col items-center justify-center space-y-2.5 relative overflow-hidden shadow-inner">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-purple-500/5 blur-xl pointer-events-none"></div>

                {/* Prometric Timer & HUD */}
                <div className="w-full max-w-[210px] flex items-center justify-between bg-slate-900/90 border border-slate-700/90 px-3 py-1.5 rounded-xl text-[10px] font-mono shadow-md">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>59:42</span>
                  </span>
                  <span className="text-purple-300 font-bold">Section 3 / 4</span>
                </div>

                {/* Animated Audio Player */}
                <div className="w-full max-w-[210px] p-2 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2 shadow-xs">
                  <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
                  <div className="flex items-center gap-1 h-3 flex-1 justify-center">
                    <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-3 bg-purple-300 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300">Listening Q14</span>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1"><Flag className="w-2.5 h-2.5 text-rose-400" /> Flag</span>
                  <span>•</span>
                  <span>Keyboard: Alt+N</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Take Exam &amp; Test Your Skill
                </h3>
                <p className="text-xs text-japan-red font-bold">
                  আসল CBT ইন্টারফেসে পরীক্ষা দিন ও দক্ষতা যাচাই করুন
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the 60-minute Prometric CBT simulator. Practice timed sections (Vocabulary, Conversation, Native Audio Listening, and Reading) with headphones.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* STEP 0.3: GET INSTANT SCORE & RANK */}
          <ScrollReveal variant="up" delay={180} duration={500}>
            <div className="bg-[#080b18] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-full shadow-xl hover:border-slate-700 transition-all space-y-6">
              {/* Step Number Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>0.3</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full uppercase">
                  Step 3
                </span>
              </div>

              {/* Top Interactive UI Preview Box: Floating Reward Badges */}
              <div className="h-44 rounded-2xl bg-gradient-to-b from-[#0e2e1c] to-[#0a0d1e] border border-slate-800/90 p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden shadow-inner">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none"></div>

                {/* Score Pill Badge */}
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>218 / 250 • PASSED!</span>
                </div>

                {/* CEFR Level Tag */}
                <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-[10px] font-black text-emerald-300 flex items-center gap-1 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>CEFR A2 Certified Level</span>
                </div>

                {/* Leaderboard Rank */}
                <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Ranked #3 on National Leaderboard</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Get Instant Score &amp; Review
                </h3>
                <p className="text-xs text-japan-red font-bold">
                  তাৎক্ষণিক ফলাফল, বাংলা ব্যাখ্যা ও র‍্যাংকিং
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Immediately receive your 250-point score breakdown, correct answers with Bengali grammar explanations, and see your rank on the Bangladesh Leaderboard.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: GIANT OBSIDIAN GLASS CARD WITH GLOWING NEON BORDER (Video 00:11-00:14)
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0d1c] via-[#070914] to-[#120e24] border-2 border-indigo-500/40 p-8 sm:p-14 shadow-[0_0_60px_rgba(99,102,241,0.2)] text-center space-y-6">
        {/* Corner & Perimeter Ambient Neon Flares */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        <div className="relative z-10 space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-purple-400">
            Start Your Journey to Japan Today
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Test Your Japanese Skills?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Take a 100% free official-format JFT-Basic CBT mock test right now. No credit card required.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-red-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Laptop className="w-4 h-4" />
            <span>Start Free Mock Exam Now &rarr;</span>
          </Link>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/15 text-xs sm:text-sm transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Practice Tools (Flashcards &amp; Salary)</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ)
         ========================================================================= */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase text-japan-red dark:text-rose-400">FAQ</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Common Questions
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How do I take my first mock exam?',
              q_bn: 'আমি কীভাবে প্রথম পরীক্ষাটি দেব?',
              a: 'Simply go to the Mock Tests catalog or click "Start Exam" on Mock Test 01. It is 100% free with no sign-up required. If you sign in with Google, your scores will be saved on your profile.',
            },
            {
              q: 'What is the passing score for JFT-Basic A2?',
              q_bn: 'পাস মার্ক কত?',
              a: 'The official JFT-Basic exam is scored out of 250 points. A score of 200 or above (80%) is required to pass and receive the CEFR A2 certificate.',
            },
            {
              q: 'Can I practice on mobile or do I need a computer?',
              q_bn: 'মোবাইলে পরীক্ষা দেওয়া যাবে কি?',
              a: 'You can practice on smartphones, tablets, or computers. For the authentic Prometric test center simulation, taking it on a computer with headphones is recommended.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {faq.q}
                  </h4>
                  <span className="text-[11px] text-japan-red dark:text-rose-400 font-bold block mt-0.5">
                    {faq.q_bn}
                  </span>
                </div>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3 font-medium leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
