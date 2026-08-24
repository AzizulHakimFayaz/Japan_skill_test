import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import {
  BookOpen,
  Layers,
  Trophy,
  Clock,
  CheckCircle2,
  Globe,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  Laptop,
  Compass,
  UtensilsCrossed,
  HeartPulse,
  Wheat,
  Building2,
  HardHat,
  Wrench,
  Fish,
  Cog,
  Plane,
  Factory,
  Anchor,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch live tests in real-time

export default async function HomePage() {
  let data = { tests: [], tests_by_category: { basic: [], skill: [] }, section_specs: [] };

  try {
    data = await getTests();
  } catch (err) {
    console.error('Failed to fetch tests on home page:', err);
  }

  const basicTests = data?.tests_by_category?.basic || [];
  const skillTests = data?.tests_by_category?.skill || [];

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* 1. Hero Banner (Full-Width Responsive Modern Glassmorphic Container with Anime Wind Scene) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090d16] text-white shadow-2xl shadow-slate-950/60 border border-slate-800/80 animate-fade-in-up">
        {/* Layer 1: Anime Student & Sakura Tree Background Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-[position:22%_center] sm:bg-[position:28%_center] bg-no-repeat opacity-95 pointer-events-none transition-transform duration-1000"
          style={{ backgroundImage: "url('/img/hero_anime_student.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/60 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none"></div>

        {/* Layer 2: Swirling Anime Wind Gust Stream Vortexes (Animated SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-1 select-none"
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
            <linearGradient id="vortexWindGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="30%" stopColor="#fed7aa" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
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
          <path
            className="animate-wind-vortex"
            style={{ animationDelay: '-2.8s', animationDuration: '6.8s' }}
            filter="url(#windGlow)"
            d="M 80,360 C 300,280 480,420 690,290 C 890,160 1080,380 1340,220"
            stroke="url(#vortexWindGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            className="animate-wind-vortex"
            style={{ animationDelay: '-4.5s', animationDuration: '8s' }}
            filter="url(#windGlow)"
            d="M 0,200 C 200,80 450,260 750,150 C 1050,40 1250,220 1450,110"
            stroke="url(#vortexWindGrad1)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Layer 3: Animated Flying Test Papers & Sakura Petals */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden z-2 select-none">
          <div className="absolute top-1/2 left-[28%] animate-paper-fly-1">
            <div className="w-14 h-18 bg-white/95 text-slate-800 rounded-xs p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.5)] border border-slate-300 transform -rotate-12 backdrop-blur-xs">
              <div className="border border-slate-300/80 p-0.5 h-full flex flex-col justify-between text-[7px] font-sans leading-tight">
                <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                  <span className="font-black text-rose-600">日本語</span>
                  <span className="w-2.5 h-2.5 rounded-full border border-red-500 text-[6px] text-red-500 flex items-center justify-center font-bold">
                    合
                  </span>
                </div>
                <div className="space-y-0.5 py-0.5 opacity-60">
                  <div className="h-0.5 bg-slate-400 rounded-full w-full"></div>
                  <div className="h-0.5 bg-slate-400 rounded-full w-4/5"></div>
                  <div className="h-0.5 bg-slate-400 rounded-full w-3/4"></div>
                </div>
                <div className="text-[6px] font-bold text-slate-500 text-right">学校の試験</div>
              </div>
            </div>
          </div>

          <div className="absolute top-[40%] left-[34%] animate-paper-fly-2">
            <div className="w-12 h-16 bg-white/90 text-slate-800 rounded-xs p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-slate-300 transform rotate-45 backdrop-blur-xs">
              <div className="border border-slate-300/80 p-0.5 h-full flex flex-col justify-between text-[6px]">
                <span className="font-black text-indigo-600 text-[7px]">JFT CBT</span>
                <div className="space-y-0.5 opacity-60">
                  <div className="h-0.5 bg-slate-400 rounded-full w-full"></div>
                  <div className="h-0.5 bg-slate-400 rounded-full w-2/3"></div>
                </div>
                <span className="text-emerald-600 font-bold text-[6px]">合格 A2</span>
              </div>
            </div>
          </div>

          <div className="absolute top-12 left-0 animate-wind-petal-1">
            <svg className="w-5 h-5 text-rose-300 drop-shadow-[0_2px_10px_rgba(244,63,94,0.9)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 C8 6 4 11 4 16 C4 20 7.5 22 12 22 C16.5 22 20 20 20 16 C20 11 16 6 12 2 Z" />
            </svg>
          </div>
          <div className="absolute top-28 left-0 animate-wind-petal-2">
            <svg className="w-4 h-4 text-pink-300 drop-shadow-[0_2px_8px_rgba(251,113,133,0.9)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 C8 6 4 11 4 16 C4 20 7.5 22 12 22 C16.5 22 20 20 20 16 C20 11 16 6 12 2 Z" />
            </svg>
          </div>
        </div>

        {/* Layer 4: Main Interactive Foreground Content */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-4 sm:space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-10">
            {/* Left: Japanese Frosted Glass Notice Board */}
            <div className="relative w-full max-w-md xl:max-w-lg bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-red-500/35 shadow-[0_0_35px_rgba(220,38,38,0.18)] ring-1 ring-white/15 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-tr from-japan-red to-rose-600 flex items-center justify-center text-white font-black text-[10px] sm:text-xs shadow-md shadow-red-500/40">
                  学
                </div>
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                  GAKKOU NO SHIKEN
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                Master Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-japan-red to-amber-300">
                  JFT &amp; Skill Tests
                </span>
              </h1>

              <p className="text-[11px] sm:text-sm text-slate-200/95 font-medium leading-relaxed drop-shadow-xs">
                Authentic computer-based test simulator with 10 native language aids and instant CEFR-J scores.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  <span>JFT Portal</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-300" />
                  <span>Skill Tests</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[9px] sm:text-[10px] font-bold backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>CEFR-J A1–A2</span>
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
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/35 text-[11px] sm:text-sm active:scale-95 btn-touch-active group glow-red ring-1 ring-white/20 text-center whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>JFT Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform hidden xs:inline" />
                </Link>
                <Link
                  href="/ssw-skill-test"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl backdrop-blur-md transition-all duration-300 text-[11px] sm:text-sm border border-slate-700 hover:border-slate-500 active:scale-95 btn-touch-active text-center whitespace-nowrap"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Skill Tests</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden xs:inline opacity-60" />
                </Link>
              </div>
            </div>

            {/* Right: Sleek Glassmorphic CBT Portal Showcase Terminal */}
            <div className="hidden lg:flex flex-col items-end flex-shrink-0 relative">
              <div className="relative w-64 lg:w-72 xl:w-76 rounded-3xl bg-slate-950/85 border border-slate-700/70 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3 hover:border-slate-500 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">CBT ENGINE LIVE</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    2026 EDITION
                  </span>
                </div>

                <div className="relative rounded-2xl bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 flex flex-col items-center justify-center shadow-lg border border-white/70 group hover-lift">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/logo.png"
                    alt="Gakkou No Shiken Logo"
                    className="w-28 h-28 lg:w-32 lg:h-32 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-700/70 text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pass Benchmark</div>
                    <div className="text-xs font-black text-emerald-400 mt-0.5">80% · 200/250</div>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-700/70 text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Standard</div>
                    <div className="text-xs font-black text-rose-300 mt-0.5">CEFR-J A1–A2</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none mt-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Prometric CBT Standard</span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Contact & Social Bar */}
          <div className="w-full bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 sm:px-6 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shadow-xl">
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-slate-200 hover:text-emerald-300 transition-colors group cursor-pointer"
              title="Follow Gakkou No Shiken Official WhatsApp Channel"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xs shadow-emerald-500/30">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <div className="text-[8px] sm:text-[9px] text-slate-300 font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
                  Official WhatsApp Channel
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wide group-hover:underline flex items-center gap-1">
                  <span>Follow Channel</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </span>
              </div>
            </a>

            <div className="flex items-center gap-2 sm:gap-2.5 text-slate-300">
              <a
                href="https://www.facebook.com/Gakkou.No.Shiken"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 transition-all text-[10px] font-bold flex items-center gap-1"
                title="Follow Gakkou No Shiken on Facebook"
              >
                <span>Facebook</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <a
                href="https://www.instagram.com/gakkou.no.shiken/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/40 transition-all text-[10px] font-bold flex items-center gap-1"
                title="Follow Gakkou No Shiken on Instagram"
              >
                <span>Instagram</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>

            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl transition-all font-mono text-[10px] sm:text-xs font-black shadow-xs cursor-pointer group"
              title="Follow WhatsApp Channel"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>COMMUNITY CHANNEL</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Interactive Live Stats & Exam Standard Counter Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in-up delay-100">
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover-lift hover-shine-container flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-japan-red uppercase tracking-wider">Exam Questions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-japan-red">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              42 <span className="text-xs sm:text-sm font-bold text-slate-400">items</span>
            </strong>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">4 Sequential Sections</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover-lift hover-shine-container flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-wider">Time Limit</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              60 <span className="text-xs sm:text-sm font-bold text-slate-400">mins</span>
            </strong>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Timed Prometric Engine</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover-lift hover-shine-container flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-wider">Passing Standard</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              200 <span className="text-xs sm:text-sm font-bold text-slate-400">/ 250</span>
            </strong>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">80% Passing Threshold</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover-lift hover-shine-container flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-wider">Translation Support</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              10 <span className="text-xs sm:text-sm font-bold text-slate-400">Langs</span>
            </strong>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Native Passage Helpers</p>
          </div>
        </div>
      </div>

      {/* 3. Practice Test Categories & Cards Grid */}
      <div className="space-y-6 sm:space-y-12">
        <section className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <PracticeTestGrid
            practiceTests={basicTests}
            title="JFT Tests"
            subtitle="Beginner-friendly Japanese language evaluation tests."
            catKey="basic"
          />
        </section>

        <section className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
          <PracticeTestGrid
            practiceTests={skillTests}
            title="SSW Skill Tests"
            subtitle="Technical and workplace skill assessment practice exams."
            catKey="skill"
          />
        </section>
      </div>

      {/* 4. Creative 3-Step Interactive CBT Workflow Section (Redesigned Ultra-Premium) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl shadow-slate-950/50 animate-fade-in-up delay-150">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-14 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Exam Preparation Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How Computer-Based Testing (CBT) Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Follow these three steps to practice, evaluate, and earn your CEFR-J Japanese certificate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
          {/* Step 1 */}
          <div className="relative bg-white/[0.04] hover:bg-white/[0.08] rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-japan-red/50 transition-all duration-300 hover-lift hover-shine-container space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-japan-red to-rose-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-rose-300/80 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                STEP 01
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-rose-300 transition-colors">
              Select Exam Category
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Choose between open JFT-Basic Japanese language exams or specific Specified Skilled Worker (SSW) sector evaluation tests.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white/[0.04] hover:bg-white/[0.08] rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover-lift hover-shine-container space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                STEP 02
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
              Take Authentic Prometric CBT
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Experience timed sections, high-quality Japanese audio listening clips, question progress chevrons, and 10-language translation helper modals.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white/[0.04] hover:bg-white/[0.08] rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover-lift hover-shine-container space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300/80 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                STEP 03
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
              Instant CEFR-J Score Report
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Get instantaneous scoring on the official 10–250 scale with pass/fail evaluation (80% benchmark) and detailed question review breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SSW Industry Sectors Quick Explorer (100% Vector Icons) */}
      <section className="relative overflow-hidden bg-[#090d16] rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800/90 text-white shadow-2xl shadow-slate-950/40 animate-fade-in-up delay-200 bg-cbt-grid">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-slate-800/80 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Specified Skilled Worker (SSW-1)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              12 SSW{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200">
                Industry Sectors
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-xl font-normal">
              Practice skill evaluation tests tailored for Japan&apos;s primary employment and visa sectors.
            </p>
          </div>
          <Link
            href="/ssw-skill-test"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-5 sm:px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex-shrink-0 group"
          >
            <span>Explore All Sectors</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Interactive Sector Chips Grid (100% Crisp Vector Icons) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3.5 relative z-10">
          {[
            { Icon: UtensilsCrossed, iconColor: 'text-amber-400 bg-amber-500/10', ja: '外食業', name: 'Food Service', sub: 'Restaurant & Dining' },
            { Icon: Sparkles, iconColor: 'text-cyan-400 bg-cyan-500/10', ja: 'ビルクリーニング', name: 'Building Cleaning', sub: 'Sanitation' },
            { Icon: HeartPulse, iconColor: 'text-rose-400 bg-rose-500/10', ja: '介護', name: 'Nursing Care', sub: 'Elderly Care & Health' },
            { Icon: Wheat, iconColor: 'text-emerald-400 bg-emerald-500/10', ja: '農業', name: 'Agriculture', sub: 'Cultivation & Livestock' },
            { Icon: Building2, iconColor: 'text-indigo-400 bg-indigo-500/10', ja: '宿泊業', name: 'Hospitality', sub: 'Hotel & Lodging' },
            { Icon: HardHat, iconColor: 'text-amber-400 bg-amber-500/10', ja: '建設業', name: 'Construction', sub: 'Civil Engineering' },
            { Icon: Wrench, iconColor: 'text-sky-400 bg-sky-500/10', ja: '自動車整備', name: 'Auto Repair', sub: 'Automotive' },
            { Icon: Fish, iconColor: 'text-teal-400 bg-teal-500/10', ja: '漁業', name: 'Fishery', sub: 'Aquaculture' },
            { Icon: Cog, iconColor: 'text-slate-300 bg-slate-500/10', ja: '素形材産業', name: 'Machinery', sub: 'Parts & Tooling' },
            { Icon: Plane, iconColor: 'text-blue-400 bg-blue-500/10', ja: '航空業', name: 'Aviation', sub: 'Airport Ground Handling' },
            { Icon: Factory, iconColor: 'text-violet-400 bg-violet-500/10', ja: '製造業', name: 'Manufacturing', sub: 'Industrial Production' },
            { Icon: Anchor, iconColor: 'text-blue-400 bg-blue-500/10', ja: '造船', name: 'Shipbuilding', sub: 'Marine Equipment' },
          ].map((sector, idx) => {
            const SectorIcon = sector.Icon;
            return (
              <Link
                key={idx}
                href="/ssw-skill-test"
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover-lift group shadow-xs flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${sector.iconColor} group-hover:scale-110 transition-transform`}>
                    <SectorIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {sector.ja}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {sector.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{sector.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
