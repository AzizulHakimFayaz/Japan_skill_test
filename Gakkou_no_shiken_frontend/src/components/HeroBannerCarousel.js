'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import { useLanguage } from './LanguageContext';
import {
  BookOpen,
  Layers,
  Trophy,
  CheckCircle2,
  Globe,
  Zap,
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  UtensilsCrossed,
  Wheat,
  Building2,
  HardHat,
  Crown,
  Medal,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function HeroBannerCarousel() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = 3;
  const slideIntervalRef = useRef(null);

  const [topThree, setTopThree] = useState([
    { rank: 1, name: 'Kenji Tanaka', username: 'kenji_tanaka', score: 245, exam: 'JFT-Basic A2' },
    { rank: 2, name: 'Rahim Ahmed', username: 'rahim_ahmed', score: 238, exam: 'SSW Nursing' },
    { rank: 3, name: 'Aung Min', username: 'aung_min', score: 225, exam: 'SSW Food' },
  ]);

  useEffect(() => {
    let isMounted = true;
    getLeaderboard()
      .then((data) => {
        if (isMounted && data?.top_three && data.top_three.length > 0) {
          const formatted = data.top_three.map((c, i) => ({
            rank: i + 1,
            name: c.full_name || c.username || `Candidate #${i + 1}`,
            username: c.username || `candidate_${i + 1}`,
            score: c.highest_score || c.avg_score || 200,
            exam: c.target_exam_display || 'JFT-Basic',
          }));
          const defaults = [
            { rank: 1, name: 'Kenji Tanaka', username: 'kenji_tanaka', score: 245, exam: 'JFT-Basic A2' },
            { rank: 2, name: 'Rahim Ahmed', username: 'rahim_ahmed', score: 238, exam: 'SSW Nursing' },
            { rank: 3, name: 'Aung Min', username: 'aung_min', score: 225, exam: 'SSW Food' },
          ];
          while (formatted.length < 3) {
            formatted.push(defaults[formatted.length]);
          }
          setTopThree(formatted);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isHovered) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6500);

    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isHovered, currentSlide]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090d16] text-white shadow-2xl shadow-slate-950/60 border border-slate-800/80 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ============================================================
          SLIDE 1: JFT-BASIC & AUTHENTIC CBT SIMULATOR (Professional CBT)
          ============================================================ */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${
          currentSlide === 0 ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'
        }`}
      >
        {/* Background Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-[position:center_center] bg-no-repeat opacity-95 pointer-events-none"
          style={{ backgroundImage: "url('/img/hero_professional_cbt.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/75 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none"></div>

        {/* Animated Wind Vortex SVG (Desktop only to prevent mobile CPU throttling) */}
        <svg
          className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-1 select-none"
          viewBox="0 0 1400 500"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vortexWindGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#fbcfe8" stopOpacity="0.9" />
              <stop offset="90%" stopColor="#fda4af" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
            <filter id="windGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            className="animate-wind-vortex"
            filter="url(#windGlow)"
            d="M 50,320 C 250,220 420,380 620,240 C 820,100 1020,340 1280,180 C 1380,120 1420,80 1500,40"
            stroke="url(#vortexWindGrad1)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Foreground Content */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-4 sm:space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-10">
            {/* Left Glass Card */}
            <div className="relative w-full max-w-md xl:max-w-lg bg-black/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-red-500/35 shadow-[0_0_35px_rgba(220,38,38,0.22)] ring-1 ring-white/15 space-y-3 sm:space-y-4">
              {/* Bangladesh's #1 Platform Pill Badge (Inspired by Image 3) */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 shadow-md shadow-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wide">
                <span className="text-xs sm:text-sm">🇧🇩</span>
                <span className="text-emerald-300">
                  Bangladesh&apos;s #1 JFT-Basic &amp; SSW Mock Test Platform
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/logo.png"
                  alt="Gakkou No Shiken"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
                />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                  GAKKOU NO SHIKEN • CBT 2026
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                JFT-Basic &amp; SSW{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-japan-red to-amber-300">
                  CBT Mock Exams
                </span>
              </h1>

              <p className="text-[11px] sm:text-sm text-slate-200/95 font-medium leading-relaxed drop-shadow-xs">
                Bangladesh&apos;s 1st official Prometric computer-based test simulator for JFT-Basic &amp; SSW Skills with instant CEFR scoring &amp; local venue guides.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  <span>JFT-Basic A2</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-300" />
                  <span>SSW Skills</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Prometric BDJ01/02</span>
                </div>
              </div>

              <div className="hidden sm:grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-200 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>Authentic CBT Simulator</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>10 Language Aids</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Certificates</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/jft-basic"
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/35 text-[11px] sm:text-sm active:scale-95 text-center whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>JFT Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/ssw-skill-test"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl backdrop-blur-md transition-all duration-300 text-[11px] sm:text-sm border border-slate-700 hover:border-slate-500 active:scale-95 text-center whitespace-nowrap"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Skill Tests</span>
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="hidden lg:flex flex-col items-end flex-shrink-0 relative">
              <div className="relative w-64 lg:w-72 xl:w-76 rounded-3xl bg-slate-950/85 border border-slate-700/70 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">CBT ENGINE LIVE</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    2026 EDITION
                  </span>
                </div>

                <div className="relative rounded-2xl bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 flex flex-col items-center justify-center shadow-lg border border-white/70">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/logo.png"
                    alt="Gakkou No Shiken Logo"
                    className="w-28 h-28 lg:w-32 lg:h-32 object-contain filter drop-shadow-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      PASS BENCHMARK
                    </div>
                    <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">80% · 200/250</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-[8px] sm:text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      STANDARD
                    </div>
                    <div className="text-xs sm:text-sm font-black text-rose-400 mt-0.5">CEFR-J A1–A2</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prometric CBT Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SLIDE 2: SSW VISA & 12 INDUSTRY SECTORS (Career / Industry)
          ============================================================ */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${
          currentSlide === 1 ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'
        }`}
      >
        {/* Background Artwork */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0c1a2e] to-[#061e1a] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.25),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none"></div>

        {/* Foreground Content */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-4 sm:space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-10">
            {/* Left Glass Card */}
            <div className="relative w-full max-w-md xl:max-w-lg bg-black/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-emerald-500/35 shadow-[0_0_35px_rgba(16,185,129,0.18)] ring-1 ring-white/15 space-y-3 sm:space-y-4">
              {/* Bangladesh's #1 SSW Platform Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 shadow-md shadow-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wide">
                <span className="text-xs sm:text-sm">🇧🇩</span>
                <span className="text-emerald-300">
                  Bangladesh&apos;s #1 SSW Skills CBT Mock Test Platform
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/logo.png"
                  alt="Gakkou No Shiken"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
                />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-300 uppercase">
                  SPECIFIED SKILLED WORKER (SSW)
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                Launch Your Career in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                  Japan with SSW
                </span>
              </h2>

              <p className="text-[11px] sm:text-sm text-slate-200/95 font-medium leading-relaxed drop-shadow-xs">
                Prepare for official Prometric exams in Nursing Care, Food Service, Agriculture, and 12 Specified Skilled Worker sectors with Bangladesh&apos;s leading CBT system.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[9px] sm:text-[10px] font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                  <span>12 SSW Sectors</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[9px] sm:text-[10px] font-bold">
                  <span>Prometric Standard</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[9px] sm:text-[10px] font-bold">
                  <span>Free Practice</span>
                </div>
              </div>

              <div className="hidden sm:grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-200 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nursing Care</span>
                </div>
                <div className="flex items-center gap-1">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  <span>Food Service</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agriculture</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hospitality</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/ssw-skill-test"
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/35 text-[11px] sm:text-sm active:scale-95 text-center whitespace-nowrap"
                >
                  <Layers className="w-4 h-4" />
                  <span>Explore Sectors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/jft-basic"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl backdrop-blur-md transition-all duration-300 text-[11px] sm:text-sm border border-slate-700 hover:border-slate-500 active:scale-95 text-center whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>JFT-Basic Hub</span>
                </Link>
              </div>
            </div>

            {/* Right Card: SSW Sectors Showcase */}
            <div className="hidden lg:flex flex-col items-end flex-shrink-0 relative">
              <div className="relative w-64 lg:w-72 xl:w-76 rounded-3xl bg-slate-950/85 border border-slate-700/70 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">12 SSW SECTORS</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    VISA READY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                    <HeartPulse className="w-6 h-6 text-rose-400" />
                    <span className="text-[11px] font-extrabold text-white">Nursing Care</span>
                    <span className="text-[9px] text-slate-400">介護分野</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                    <UtensilsCrossed className="w-6 h-6 text-amber-400" />
                    <span className="text-[11px] font-extrabold text-white">Food Service</span>
                    <span className="text-[9px] text-slate-400">外食業分野</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                    <Wheat className="w-6 h-6 text-emerald-400" />
                    <span className="text-[11px] font-extrabold text-white">Agriculture</span>
                    <span className="text-[9px] text-slate-400">農業分野</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                    <HardHat className="w-6 h-6 text-cyan-400" />
                    <span className="text-[11px] font-extrabold text-white">Construction</span>
                    <span className="text-[9px] text-slate-400">建設分野</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Prometric Question Banks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SLIDE 3: LEADERBOARD & SCALED CEFR SCORING (Competition / Standings)
          ============================================================ */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${
          currentSlide === 2 ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'
        }`}
      >
        {/* Background Artwork */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#180e29] to-[#0f172a] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.22),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none"></div>

        {/* Foreground Content */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-4 sm:space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-10">
            {/* Left Glass Card */}
            <div className="relative w-full max-w-md xl:max-w-lg bg-black/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-amber-500/35 shadow-[0_0_35px_rgba(245,158,11,0.18)] ring-1 ring-white/15 space-y-3 sm:space-y-4">
              {/* Bangladesh's #1 Ranking Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 shadow-md shadow-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-black tracking-wide">
                <span className="text-xs sm:text-sm">🇧🇩</span>
                <span className="text-amber-300">
                  Bangladesh&apos;s #1 CBT Leaderboard &amp; Ranking
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/logo.png"
                  alt="Gakkou No Shiken"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
                />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-300 uppercase">
                  NATIONAL STANDINGS &amp; RANKS
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                Compete with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-rose-400">
                  Top Candidates
                </span>
              </h2>

              <p className="text-[11px] sm:text-sm text-slate-200/95 font-medium leading-relaxed drop-shadow-xs">
                Track your scaled scores (10–250), earn prestigious candidate rank badges, and climb the live national leaderboard podium.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[9px] sm:text-[10px] font-bold">
                  <Crown className="w-2.5 h-2.5 text-amber-300" />
                  <span>National Leaderboard</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/40 text-purple-200 text-[9px] sm:text-[10px] font-bold">
                  <span>CEFR A2.2 Scaling</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[9px] sm:text-[10px] font-bold">
                  <span>Candidate Badges</span>
                </div>
              </div>

              <div className="hidden sm:grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-200 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rank #1 Gold Trophy</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Scaled Score Reports</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-rose-400" />
                  <span>Shareable Scorecards</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/35 text-[11px] sm:text-sm active:scale-95 text-center whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/accounts/my-results"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl backdrop-blur-md transition-all duration-300 text-[11px] sm:text-sm border border-slate-700 hover:border-slate-500 active:scale-95 text-center whitespace-nowrap"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>My Results</span>
                </Link>
              </div>
            </div>

            {/* Right Card: Leaderboard Podium Preview */}
            <div className="hidden lg:flex flex-col items-end flex-shrink-0 relative">
              <div className="relative w-64 lg:w-72 xl:w-76 rounded-3xl bg-slate-950/85 border border-slate-700/70 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">LIVE PODIUM</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    NATIONAL
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    href={topThree[0]?.username ? `/profile/${topThree[0].username}` : '/leaderboard'}
                    className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between hover:bg-amber-500/25 transition-all group/cand cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        1
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover/cand:text-amber-300 transition-colors truncate max-w-[130px]">
                          {topThree[0]?.name}
                        </div>
                        <div className="text-[9px] text-amber-300 font-semibold">{topThree[0]?.score} Scaled Score</div>
                      </div>
                    </div>
                    <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  </Link>

                  <Link
                    href={topThree[1]?.username ? `/profile/${topThree[1].username}` : '/leaderboard'}
                    className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:bg-slate-800/90 transition-all group/cand cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        2
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover/cand:text-slate-200 transition-colors truncate max-w-[130px]">
                          {topThree[1]?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold">{topThree[1]?.score} Scaled Score</div>
                      </div>
                    </div>
                    <Medal className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </Link>

                  <Link
                    href={topThree[2]?.username ? `/profile/${topThree[2].username}` : '/leaderboard'}
                    className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:bg-slate-800/90 transition-all group/cand cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        3
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover/cand:text-amber-400 transition-colors truncate max-w-[130px]">
                          {topThree[2]?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold">{topThree[2]?.score} Scaled Score</div>
                      </div>
                    </div>
                    <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  </Link>
                </div>


                <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-amber-300">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-Time CEFR-J Scaled Rankings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          CAROUSEL CONTROLS: Left / Right Arrows & Dot Indicators
          ============================================================ */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Modern Slide Indicators (Pills & Progress Bar) */}
      <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-8 z-20 flex items-center gap-2">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx
                ? 'w-8 sm:w-10 bg-gradient-to-r from-japan-red to-amber-400 shadow-md shadow-red-500/50'
                : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Layer 5: Bottom Community Channels Strip */}
      <div className="relative z-10 bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <MessageSquare className="w-3 h-3" />
          </div>
          <span>OFFICIAL WHATSAPP CHANNEL</span>
          <a
            href="https://whatsapp.com/channel/0029Vb7B36Y9hXF4yK2n9R3m"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 font-bold ml-1"
          >
            <span>Follow Channel</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1 transition-colors"
          >
            <span>Facebook</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 font-bold flex items-center gap-1 transition-colors"
          >
            <span>Instagram</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>COMMUNITY CHANNEL</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
