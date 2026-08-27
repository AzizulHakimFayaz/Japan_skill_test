'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  MousePointer2,
  CheckCircle2,
  Trophy,
  Laptop,
  Zap,
  MessageCircle,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function HowItWorksPage() {
  const [heroPhase, setHeroPhase] = useState(0); // 0: initial, 1: center card bloom, 2: all settled
  const [activeSlot, setActiveSlot] = useState(1);
  const [cursorTapped, setCursorTapped] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const pinnedSectionRef = useRef(null);

  // 1. Initial Page Load Hero Stagger Sequence
  useEffect(() => {
    // Phase 1: Center promoted card blooms in first alone with bright glow
    const t1 = setTimeout(() => setHeroPhase(1), 150);
    // Phase 2: Left and right cards settle, rays expand, CTA button fades in
    const t2 = setTimeout(() => setHeroPhase(2), 650);

    // Looping Reward Slot Carousel (Runs continuously, independent of scroll)
    const slotInterval = setInterval(() => {
      setActiveSlot((prev) => (prev + 1) % 3);
    }, 2400);

    // Looping Simulated Cursor Tap (Runs continuously, independent of scroll)
    const cursorInterval = setInterval(() => {
      setCursorTapped(true);
      setTimeout(() => setCursorTapped(false), 500);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(slotInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  // 2. Scroll-Jacked / Pinned Section Timeline Driver (Section 7.5 B)
  useEffect(() => {
    const handleScroll = () => {
      if (!pinnedSectionRef.current) return;
      const rect = pinnedSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // Calculate how far we've scrolled inside the pinned track
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slotRewards = [
    { title: '250 Pts Mock Exam', sub: 'Prometric CBT 4 Sections', icon: Laptop, tag: 'Official' },
    { title: '218 / 250 • PASSED!', sub: 'Instant CEFR Scaled Score', icon: Trophy, tag: 'Unlocked 🔓' },
    { title: 'CEFR A2 Certified', sub: 'Japan Visa Ready Score', icon: CheckCircle2, tag: 'Top 3 BD' },
  ];

  // Scrubbed Timeline Calculation for "How It Works"
  // Hairline grid: 0% -> 25%
  const gridOpacity = Math.min(1, Math.max(0.15, scrollProgress * 4));
  // Heading wipe: 15% -> 40%
  const headingProgress = Math.max(0, Math.min(1, (scrollProgress - 0.1) / 0.25));
  // Card 1 (Left): 30% -> 50%
  const c1Progress = Math.max(0, Math.min(1, (scrollProgress - 0.28) / 0.22));
  // Card 2 (Middle): 50% -> 72%
  const c2Progress = Math.max(0, Math.min(1, (scrollProgress - 0.50) / 0.22));
  // Card 3 (Right): 72% -> 95%
  const c3Progress = Math.max(0, Math.min(1, (scrollProgress - 0.72) / 0.23));

  return (
    <div className="space-y-8 max-w-[1360px] mx-auto pb-16">
      {/* Top Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 sm:px-4">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">How It Works &amp; Guide</span>
      </nav>

      {/* =========================================================================
          1. PAGE SHELL: BEZEL-LESS DEVICE FRAME (~24-32px radius, #05060a background)
         ========================================================================= */}
      <div className="relative rounded-[24px] sm:rounded-[32px] bg-[#05060a] border border-slate-800/80 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden p-4 sm:p-8 lg:p-12 space-y-16 sm:space-y-24 text-slate-100 selection:bg-indigo-500 selection:text-white">
        
        {/* =========================================================================
            2. GLOBAL BACKGROUND SYSTEM (Starfield + Radial Nebula Glows + Sunburst Rays)
           ========================================================================= */}
        {/* Sparse Fixed Starfield Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40"></div>

        {/* Soft Radial Nebula Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-indigo-600/25 via-purple-600/15 to-transparent blur-[130px] pointer-events-none"></div>
        <div className="absolute top-[800px] left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[400px] bg-purple-600/15 blur-[140px] pointer-events-none"></div>

        {/* =========================================================================
            3. SECTION: HERO (Headline + Avatar Badge + 3 Hero Cards + Light Horizon)
               Scroll Behavior: Plain Scroll (Moves up together, no parallax)
           ========================================================================= */}
        <section className="relative text-center pt-4 sm:pt-10 space-y-8">
          
          {/* Top Social Avatar Badge */}
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg backdrop-blur-md transition-all duration-700 ${
              heroPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          >
            <div className="flex -space-x-2">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#05060a]">
                FA
              </span>
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#05060a]">
                RH
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#05060a]">
                MK
              </span>
              <span className="w-6 h-6 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 flex items-center justify-center ring-2 ring-[#05060a]">
                +1k
              </span>
            </div>
            <span className="text-xs font-bold text-slate-200">
              1,200+ Examinees already practicing at our live portal
            </span>
          </div>

          {/* Headline */}
          <div
            className={`space-y-4 max-w-3xl mx-auto transition-all duration-700 delay-100 ${
              heroPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Join 1,000+ Examinees Who Already Signed Up &amp; Get Certified!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
              Test your Japanese communicative competence and win top ranks:
            </p>
          </div>

          {/* 3-Card Row with Center Card Visually Promoted */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto text-left items-center pt-4">
            
            {/* Left Card: 250 Scale (Fades & Settles in Phase 2) */}
            <div
              className={`relative bg-[#090b14]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-[230px] transition-all duration-700 ${
                heroPhase >= 2
                  ? 'opacity-100 translate-y-0 scale-100 hover:border-indigo-500/50'
                  : 'opacity-0 translate-y-6 scale-95'
              }`}
            >
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  250 Pts
                </div>
                <div className="text-xs font-bold text-slate-400">
                  full cbt scale
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5">
                <span>For TOP 50 on the leaderboard</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 font-mono text-[10px] text-slate-300">50x</span>
              </div>
            </div>

            {/* Center Card: Promoted with Radiant Purple Glow (Animates in FIRST in Phase 1) */}
            <div
              className={`relative bg-gradient-to-b from-[#141228] via-[#0d0d1e] to-[#070712] border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-[260px] transform md:-translate-y-3 transition-all duration-700 ${
                heroPhase >= 1
                  ? 'opacity-100 scale-100 shadow-[0_0_70px_rgba(168,85,247,0.45)]'
                  : 'opacity-0 scale-90 shadow-none'
              }`}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-purple-500/30 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-1 relative z-10">
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-300 font-mono tracking-tight">
                  200+ Pts
                </div>
                <div className="text-xs font-bold text-purple-300">
                  in passing score (CEFR A2)
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-purple-200 pt-4 border-t border-purple-900/50 relative z-10">
                <span>For TOP 3 rankers</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 font-mono text-[10px] text-purple-300 font-bold border border-purple-500/30">3x</span>
              </div>
            </div>

            {/* Right Card: 100% Free Access (Fades & Settles in Phase 2) */}
            <div
              className={`relative bg-[#090b14]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-[230px] transition-all duration-700 ${
                heroPhase >= 2
                  ? 'opacity-100 translate-y-0 scale-100 hover:border-blue-500/50'
                  : 'opacity-0 translate-y-6 scale-95'
              }`}
            >
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  100%
                </div>
                <div className="text-xs font-bold text-slate-400">
                  free simulator
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5">
                <span>For Everybody on the platform</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 font-mono text-[10px] text-slate-300">Unlimited</span>
              </div>
            </div>
          </div>

          {/* Curved Radiant Horizon Light Arch with Rotating Rays (Fades in in Phase 2) */}
          <div
            className={`relative mt-8 pt-10 transition-all duration-1000 ${
              heroPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Pulsing Sunburst Fanning Rays */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[850px] h-[320px] bg-[radial-gradient(ellipse_at_center,rgba(91,91,240,0.3)_0%,rgba(139,92,246,0.15)_45%,transparent_75%)] rounded-[100%] blur-3xl pointer-events-none animate-ray-pulse"></div>
            
            {/* Crisp Horizon Line Stroke */}
            <div className="absolute inset-x-16 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-xs"></div>
            <div className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

            {/* Primary Pill Button resting on Horizon */}
            <Link
              href="/accounts/signup"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5b5bf0] via-[#4f4fe0] to-[#3b82f6] hover:from-[#4f4fe0] hover:to-[#2563eb] text-white font-black text-xs sm:text-sm shadow-[0_0_40px_rgba(91,91,240,0.6)] active:scale-95 transition-all cursor-pointer"
            >
              <span>Join Practice &rarr;</span>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            4. SECTION: "HOW IT WORKS" SCROLL-JACKED / PINNED TRACK (Section 7.5 B)
               Pins in place; scroll scrubs the internal reveal sequence; reverses if scrolled up
           ========================================================================= */}
        <div ref={pinnedSectionRef} className="relative min-h-[220vh] sm:min-h-[260vh]">
          {/* Sticky Viewport Anchor */}
          <div className="sticky top-6 sm:top-14 min-h-[85vh] flex flex-col justify-center space-y-8">
            
            {/* Scroll-Driven Eyebrow + Character Wipe Heading */}
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <div
                style={{ opacity: gridOpacity }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider transition-opacity duration-300"
              >
                <span>How It Works</span>
              </div>

              {/* Progressive Left-to-Right Wipe Heading */}
              <h2
                style={{
                  opacity: Math.max(0.3, headingProgress),
                  transform: `translateY(${(1 - headingProgress) * 16}px)`,
                  backgroundImage: `linear-gradient(90deg, #ffffff ${headingProgress * 100}%, rgba(255,255,255,0.2) ${headingProgress * 100}%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight transition-all duration-300"
              >
                How To Join &amp; Pass
              </h2>
            </div>

            {/* 3-Column Schematic Grid with Hairline Dividers & Corner Joint Dots */}
            <div
              style={{
                borderColor: `rgba(255, 255, 255, ${0.05 + gridOpacity * 0.15})`,
              }}
              className="relative border rounded-3xl bg-[#080911]/90 backdrop-blur-xl overflow-hidden shadow-2xl transition-colors duration-500"
            >
              {/* Grid Joint Dots at Four Corners */}
              <span
                style={{ opacity: gridOpacity }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-slate-700 bg-slate-900 z-20 transition-opacity duration-300"
              ></span>
              <span
                style={{ opacity: gridOpacity }}
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-slate-700 bg-slate-900 z-20 transition-opacity duration-300"
              ></span>
              <span
                style={{ opacity: gridOpacity }}
                className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full border border-slate-700 bg-slate-900 z-20 transition-opacity duration-300"
              ></span>
              <span
                style={{ opacity: gridOpacity }}
                className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full border border-slate-700 bg-slate-900 z-20 transition-opacity duration-300"
              ></span>

              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                
                {/* --- CARD 1: (Scroll Scrubbed 30% -> 50%) --- */}
                <div
                  style={{
                    opacity: c1Progress,
                    transform: `translateY(${(1 - c1Progress) * 32}px) scale(${0.96 + c1Progress * 0.04})`,
                  }}
                  className="p-6 sm:p-8 flex flex-col justify-between space-y-6 relative group transition-all duration-300"
                >
                  {/* Index Label */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>0.1</span>
                    </span>
                  </div>

                  {/* Inner Demo Box: Dot-Grid + Centered Pill Button + Simulated Cursor */}
                  <div className="h-52 rounded-2xl bg-[#0b0d1a] border border-white/10 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:12px_12px]">
                    <div className="relative">
                      {/* Simulated Pill Button */}
                      <div
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5b5bf0] to-[#3b82f6] text-white text-xs font-black shadow-lg transition-transform duration-200 ${
                          cursorTapped ? 'scale-95 shadow-indigo-500/40' : 'scale-100 shadow-indigo-500/20'
                        }`}
                      >
                        <span>Join Practice &rarr;</span>
                      </div>

                      {/* Simulated Cursor Icon drifting and tapping */}
                      <div className="absolute -right-2 -bottom-3 pointer-events-none animate-cursor-tap">
                        <MousePointer2 className="w-6 h-6 text-white fill-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Body Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Join the practice portal
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Maximize your exam score potential by testing authentic Prometric format CBT mocks with native audio.
                    </p>
                  </div>
                </div>

                {/* --- CARD 2: (Scroll Scrubbed 50% -> 72%) --- */}
                <div
                  style={{
                    opacity: c2Progress,
                    transform: `translateY(${(1 - c2Progress) * 32}px) scale(${0.96 + c2Progress * 0.04})`,
                  }}
                  className="p-6 sm:p-8 flex flex-col justify-between space-y-6 relative group transition-all duration-300"
                >
                  {/* Index Label */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span>0.2</span>
                    </span>
                  </div>

                  {/* Inner Demo Box: Central Node + Secondary Nodes + SVG Bezier Lines + Radar Pulse */}
                  <div className="h-52 rounded-2xl bg-[#0b0d1a] border border-white/10 p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {/* Radar Pulse Wave behind center */}
                    <div className="absolute w-24 h-24 rounded-full border border-purple-500/40 bg-purple-500/10 animate-radar-pulse pointer-events-none"></div>

                    {/* SVG Connecting Bezier Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-purple-500/40 stroke-2 fill-none">
                      <path d="M 120 100 Q 150 40 220 55" strokeDasharray="3 3" />
                      <path d="M 120 100 Q 80 150 50 140" strokeDasharray="3 3" />
                      <path d="M 120 100 Q 170 160 210 145" strokeDasharray="3 3" />
                    </svg>

                    {/* Central Main Avatar Node */}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-white/80 flex items-center justify-center text-white shadow-xl">
                      <span className="text-xs font-black">You</span>
                    </div>

                    {/* Top-Right Secondary Node */}
                    <div className="absolute top-8 right-12 w-8 h-8 rounded-full bg-slate-800 border border-purple-400/60 flex items-center justify-center text-[10px] text-purple-300 font-bold shadow-md">
                      RH
                    </div>

                    {/* Bottom-Left Secondary Node */}
                    <div className="absolute bottom-9 left-10 w-8 h-8 rounded-full bg-slate-800 border border-indigo-400/60 flex items-center justify-center text-[10px] text-indigo-300 font-bold shadow-md">
                      FA
                    </div>

                    {/* Bottom-Right Node */}
                    <div className="absolute bottom-9 right-14 w-8 h-8 rounded-full bg-slate-800 border border-pink-400/60 flex items-center justify-center text-[10px] text-pink-300 font-bold shadow-md">
                      MK
                    </div>
                  </div>

                  {/* Title & Body Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Challenge friends to climb the leaderboard
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Compare scaled score benchmarks with peer examinees across Bangladesh and track weekly rank improvements.
                    </p>
                  </div>
                </div>

                {/* --- CARD 3: (Scroll Scrubbed 72% -> 95%) --- */}
                <div
                  style={{
                    opacity: c3Progress,
                    transform: `translateY(${(1 - c3Progress) * 32}px) scale(${0.96 + c3Progress * 0.04})`,
                  }}
                  className="p-6 sm:p-8 flex flex-col justify-between space-y-6 relative group transition-all duration-300"
                >
                  {/* Index Label */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>0.3</span>
                    </span>
                  </div>

                  {/* Inner Demo Box: Vertical Slot Carousel */}
                  <div className="h-52 rounded-2xl bg-[#0b0d1a] border border-white/10 p-3 flex flex-col items-center justify-center space-y-2 relative overflow-hidden shadow-inner">
                    {slotRewards.map((reward, rIdx) => {
                      const isSelected = activeSlot === rIdx;
                      return (
                        <div
                          key={rIdx}
                          className={`w-full max-w-[230px] p-2 rounded-xl transition-all duration-500 flex items-center justify-between border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#1c1c38] to-[#121426] border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105 z-10'
                              : 'bg-slate-900/40 border-white/5 opacity-40 scale-95'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <reward.icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                            <div>
                              <div className="text-[11px] font-black text-white">{reward.title}</div>
                              <div className="text-[9px] text-slate-400">{reward.sub}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500'}`}>
                            {reward.tag}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Title & Body Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Get certified &amp; rewarded
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Receive instant CEFR A2 diagnostic verification reports, detailed answer explanations, and exam completion badges.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            5. SECTION: FINAL CTA PANEL (Simple on-enter reveal, no pin)
           ========================================================================= */}
        <ScrollReveal variant="up" delay={100} duration={800}>
          <section className="relative overflow-hidden rounded-3xl bg-[#080914] border border-white/10 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
            {/* Animated Glowing Comet Light Border Beam running around perimeter */}
            <div className="absolute -inset-[2px] rounded-3xl bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#5b5bf0_320deg,#38bdf8_360deg)] animate-spin-ring opacity-90 pointer-events-none"></div>
            <div className="absolute inset-[2px] rounded-3xl bg-[#070913] pointer-events-none"></div>

            {/* Inner Content */}
            <div className="relative z-10 space-y-3 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Join the Practice Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Get your official Prometric CBT mock exam link right now:
              </p>
            </div>

            <div className="relative z-10 pt-2">
              <Link
                href="/accounts/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5b5bf0] to-[#3b82f6] hover:from-[#4f4fe0] hover:to-[#2563eb] text-white font-black text-xs sm:text-sm shadow-[0_0_35px_rgba(91,91,240,0.6)] active:scale-95 transition-all cursor-pointer"
              >
                <span>Join Practice &rarr;</span>
              </Link>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
