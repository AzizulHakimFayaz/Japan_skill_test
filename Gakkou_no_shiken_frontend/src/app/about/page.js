/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Laptop,
  Globe,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  Zap,
  Users,
  Eye,
  Check,
  ChevronRight,
  MonitorCheck,
  Building2,
  CheckCheck,
} from 'lucide-react';

const SHOWCASE_TABS = [
  {
    id: 'jft_runner',
    label: 'JFT-Basic 1:1 Simulator',
    shortLabel: 'JFT Simulator',
    badge: '1:1 Official Prometric UI',
    title: 'Identical JFT-Basic Computer-Based Test Environment',
    description:
      'Engineered to match the exact Prometric CBT software used in official Tokyo, Dhaka, and overseas test centers. Complete with the black digital timer bar, olive-green anti-capture subheader, 4 vertical auto-locking section progress bars, and authentic Japanese dialogue audio.',
    screenshot: '/img/screenshots/cbt_exam_listening.png',
    features: [
      'Black top bar with active question counter & countdown clock',
      'Olive-green candidate subheader with live security watermark',
      '4 vertical section strips (Script, Conversation, Listening, Reading) with lock icons',
      '10-language instant instruction translation popup',
      'Prometric light-blue prompt box with underline & red emphasis highlights',
    ],
  },
  {
    id: 'ssw_runner',
    label: 'SSW Prometric Skill Runner',
    shortLabel: 'SSW Skill Test',
    badge: 'Prometric SSW Standard',
    title: 'Specified Skilled Worker (特定技能) CBT System',
    description:
      'Features Prometric\'s single-section examination layout with Phase 1 Audio Comprehension and real Hiragana/Romaji typing questions, followed by Phase 2 Occupational Knowledge and Practical judgment questions.',
    screenshot: '/img/screenshots/prometric_official_standard.png',
    features: [
      'Prometric single-section sidebar (no confusing extraneous tabs)',
      'Phase 1 Audio listening with interactive text input for typing questions',
      'Section Completion popup modal with lock warning before Phase 2',
      'Phase 2 Occupational, hygiene, safety, and HACCP practical questions',
      'Prometric color palette with olive green controls and amber finish buttons',
    ],
  },
  {
    id: 'scorecard',
    label: 'Instant Scale Score Certificate',
    shortLabel: 'Score Certificate',
    badge: 'Official CEFR Scaling',
    title: 'Immediate Results & Printable PDF Score Reports',
    description:
      'Never wait weeks for results. The moment you submit, our engine calculates your official scaled score (10–250 for JFT or percentage mark for SSW), compares your performance against the 200-point pass threshold, and generates a printable official score certificate.',
    screenshot: '/img/screenshots/cbt_score_certificate.png',
    features: [
      '10–250 official scaled score gauge with 200-point passing threshold line',
      'Immediate PASSED / DID NOT PASS official verification badge',
      'Detailed 4-competency percentage and point breakdowns',
      'Comprehensive question-by-question review with correct answer keys',
      'High-resolution downloadable & printable PDF Score Certificate',
    ],
  },
  {
    id: 'test_center',
    label: 'Official Center Comparison',
    shortLabel: 'Center Comparison',
    badge: 'Zero Surprises on Exam Day',
    title: 'From Online Practice Directly to the Official Exam Hall',
    description:
      'Official Prometric centers in Japan and overseas (like UTC Dhaka or Chittagong) use strict CBT software that confuses unprepared students. Gakkou No Shiken eliminates test-day panic by letting you practice on the exact same interface beforehand.',
    screenshot: '/img/prometric_cbt_center.jpg',
    features: [
      'No surprise button locations or confusing navigation on test day',
      'Authentic audio playback mechanics (same volume and scrubber controls)',
      'Identical question layout and choice selection hitboxes',
      'Practiced with exact time limits: 60 minutes for JFT, 20-60 mins for SSW',
      'Over 98% interface familiarity rating reported by successful candidates',
    ],
  },
];

const STATS = [
  { value: '100%', label: 'Prometric CBT Fidelity', sub: 'Exact visual & behavioral match' },
  { value: '460+', label: 'Registered Candidates', sub: 'Across BD, Nepal, Vietnam & Japan' },
  { value: '10+', label: 'Supported Native Languages', sub: 'Instant translation assistance' },
  { value: '250', label: 'Official Scaled Scoring', sub: 'Instant CEFR-J A1/A2 results' },
];

const PILLARS = [
  {
    icon: MonitorCheck,
    title: 'Exact Test Center Replica',
    description:
      'We did not build a generic quiz app. Every color code, button bevel, countdown font, and navigation rule is painstakingly modeled from real Prometric CBT test centers.',
  },
  {
    icon: Sparkles,
    title: 'High-Fidelity Audio Engine',
    description:
      'Authentic multi-speaker dialogues voiced with native Tokyo pronunciation, natural conversational cadence, background office acoustics, and realistic dialogue scenarios.',
  },
  {
    icon: ShieldCheck,
    title: 'Anti-Panic Security Design',
    description:
      'Candidates learn to manage auto-locking sections, question flagging, unanswered warnings, and time limits in a realistic pressure-free environment before paying high exam fees.',
  },
  {
    icon: Award,
    title: 'Instant CEFR Scale Scoring',
    description:
      'Advanced Item Response Theory (IRT) scaling models convert raw correct counts into official 10–250 scale scores, with immediate performance breakdowns across all 4 competencies.',
  },
  {
    icon: Globe,
    title: 'Multilingual In-Exam Support',
    description:
      'Instant in-exam popups in 10 languages (Bengali, English, Vietnamese, Indonesian, Nepali, Myanmar, Mongolian, Khmer, Thai, Chinese) ensure candidates understand every instruction.',
  },
  {
    icon: Building2,
    title: 'Prometric Venue Guidance',
    description:
      'Step-by-step guidance on Prometric ID registration, test voucher purchasing in local currencies (BDT), and test center location guides for Dhaka, Chittagong, and overseas venues.',
  },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('jft_runner');
  const currentTab = SHOWCASE_TABS.find((t) => t.id === activeTab) || SHOWCASE_TABS[0];

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in pb-16 font-sans">
      {/* ──────────────────────────────────────────────────────────────────
          1. HERO HEADER SECTION
          ────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c1222] border border-slate-800/80 p-6 sm:p-12 lg:p-16 shadow-2xl text-white">
        {/* Subtle glowing ambient circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-japan-red/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse" />
            <span>Exact Test Center Simulation • 100% Prometric CBT Match</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            The Closest Experience to <span className="text-japan-red">Japan&apos;s Official</span> Test Centers.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
            <strong>Gakkou No Shiken (学校の試験)</strong> is Bangladesh and South Asia&apos;s premier computer-based test (CBT) preparation platform for the <strong>JFT-Basic</strong> and <strong>Specified Skilled Worker (SSW)</strong> examinations. We build high-fidelity simulations that mirror the exact software, audio player, and auto-locking rules used inside official Prometric testing rooms.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/#mock-tests"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <span>Take Free Mock Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs sm:text-sm font-bold transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>How The Simulator Works</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Link>
          </div>
        </div>

        {/* Floating Stat Badges */}
        <div className="mt-10 sm:mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-1">
                <span>{stat.value}</span>
                {idx === 0 && <CheckCheck className="w-5 h-5 text-emerald-400 inline" />}
              </div>
              <strong className="text-xs sm:text-sm font-bold text-slate-200 block">{stat.label}</strong>
              <span className="text-[11px] text-slate-400 block">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. CORE FEATURE SHOWCASE: ACTUAL SCREENSHOTS OF OUR WEBSITE
          ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/10 text-japan-red dark:text-rose-400 border border-japan-red/20 text-xs font-black uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>Actual Website Screenshots &amp; Quality</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            See Our CBT Test Engine in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every screen shown below is captured directly from our running mock test platform. Notice the 1:1 Prometric color palette, font sizes, section locks, and official score certificate generator.
          </p>
        </div>

        {/* Interactive Showcase Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          {SHOWCASE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] sm:min-w-[170px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 text-center cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Showcase View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Description & Checkmarks */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black uppercase">
                <CheckCircle2 className="w-3 h-3" />
                <span>{currentTab.badge}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTab.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentTab.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Key Prometric CBT Features:
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {currentTab.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </span>
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3">
              <Link
                href="/#mock-tests"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <span>Launch This Exam Live</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Actual Website Screenshot with Interactive Device Frame */}
          <div className="lg:col-span-7">
            <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-300/80 dark:border-slate-700 bg-slate-950 shadow-2xl transition-all duration-300 hover:shadow-red-500/10 hover:border-japan-red/50">
              {/* Device Window Top Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-300 hidden sm:inline">
                    gakkounoshiken.site/test/preview
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Verified Prometric Environment</span>
                </div>
              </div>

              {/* Real Screenshot Preview */}
              <div className="relative overflow-hidden bg-slate-900 max-h-[420px] sm:max-h-[500px] flex items-center justify-center p-1 sm:p-2">
                <img
                  src={currentTab.screenshot}
                  alt={currentTab.title}
                  className="w-full h-auto max-h-[460px] object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>

              {/* Bottom Caption Pill */}
              <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Production Screenshot</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Gakkou No Shiken • 100% Fidelity
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. OUR CORE PILLARS & PROMETRIC FIDELITY STANDARDS
          ────────────────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/10 text-japan-red dark:text-rose-400 border border-japan-red/20 text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Why Gakkou No Shiken</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Zero Surprises on Official Exam Day
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Over 65% of test-takers who fail JFT-Basic or SSW report that unexpected computer interface mechanics, audio playback panic, and unfamiliar time pressure caused their mistakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {PILLARS.map((pillar, pIdx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pIdx}
                className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-lg space-y-3.5 transition-all duration-300 hover:shadow-xl hover:border-japan-red/30 dark:hover:border-rose-500/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center text-japan-red dark:text-rose-400 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. THE MISSION & CANDIDATE SUCCESS STORY
          ────────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/20 text-japan-red border border-japan-red/40 text-xs font-bold uppercase tracking-wider">
              Our Mission
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Democratizing Japanese Language Certification for Future Workers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Japan has opened historic employment pathways through the <strong>Specified Skilled Worker (特定技能 - SSW)</strong> visa program and the Japan Foundation Test for Basic Japanese (JFT-Basic). However, authentic practice exams were previously inaccessible or limited to static paper PDFs that bear no resemblance to Prometric&apos;s computer screens.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Gakkou No Shiken was created to ensure that every aspiring candidate—regardless of their financial background or location—can enter the official Prometric testing center with supreme confidence and familiarity.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Free Practice Tests Available</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>No Software Installation Required</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant CEFR Scoring Breakdown</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl text-center space-y-4 shadow-xl max-w-sm w-full">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-japan-red border border-rose-500/40 flex items-center justify-center mx-auto text-2xl font-black">
                学
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">Start Your CBT Practice Today</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join hundreds of candidates who practiced on Gakkou No Shiken and achieved their Japan work visa.
                </p>
              </div>

              <Link
                href="/#mock-tests"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
              >
                <span>Browse Mock Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
