import React from 'react';
import Link from 'next/link';
import AboutShowcaseTabs from '@/components/AboutShowcaseTabs';
import AboutDynamicStats from '@/components/AboutDynamicStats';
import { getPlatformStats } from '@/lib/api';
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
  BookOpen,
  BellRing,
  Gamepad2,
  GraduationCap,
  Headphones,
  CheckSquare,
} from 'lucide-react';

export const metadata = {
  title: 'About Us & CBT Simulator Mission | Gakkou No Shiken',
  description:
    'Learn about Gakkou No Shiken, South Asia\'s premier Japanese computer-based test (CBT) examination simulator for JFT-Basic and Specified Skilled Worker (SSW) tests.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/about',
  },
};

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

const ECOSYSTEM_CARDS = [
  {
    title: 'Master Exam Guides',
    subtitle: '30-Day Study Plans & Scoring Rules',
    description:
      'In-depth, research-backed guides covering the official 250-point Prometric scoring scale, section auto-locking mechanics, and sector-by-sector SSW strategies for Agriculture and Food Service.',
    href: '/guides',
    icon: FileText,
    badge: '12 Guides Available',
    color: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400',
    btnText: 'Read Guides',
  },
  {
    title: 'Official Study Materials',
    subtitle: '26 JAC Textbooks & Audio Files',
    description:
      'Complete repository of Japanese Agriculture & Food Service textbooks published by the Japan Agricultural Corporation (JAC), equipped with full bilingual vocabulary and audio tracks.',
    href: '/books',
    icon: BookOpen,
    badge: '26 Textbooks & PDFs',
    color: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400',
    btnText: 'Browse Books',
  },
  {
    title: 'Official Exam Notices',
    subtitle: 'Prometric Circulars & Booking Dates',
    description:
      'Stay fully updated on official test voucher sales, Prometric test booking windows in Dhaka and Chittagong, Japan Foundation policy changes, and venue advisories.',
    href: '/notices',
    icon: BellRing,
    badge: 'Real-Time Circulars',
    color: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400',
    btnText: 'View Notices',
  },
  {
    title: 'Interactive Practice Suite',
    subtitle: 'Game Zone & Structured Lessons',
    description:
      'Over 8 interactive arcade games and 80 structured vocabulary and Kanji lessons designed to reinforce memory retention with native Tokyo pronunciation and Bengali translations.',
    href: '/game-zone',
    icon: Gamepad2,
    badge: '8 Games & 80 Units',
    color: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400',
    btnText: 'Explore Practice',
  },
];

const EXAM_DAY_RULES = [
  {
    step: '01',
    title: 'Identity Verification & Confirmation Slip',
    detail:
      'Bring your valid, non-expired international Passport and the printed Prometric Appointment Confirmation letter. Names must match character-by-character.',
  },
  {
    step: '02',
    title: 'Biometric Check-In & Strict Locker Policy',
    detail:
      'All personal items (phones, watches, wallets, stationery) are securely locked in personal lockers. You will pass an electronic metal-detector wand and biometric photo check-in.',
  },
  {
    step: '03',
    title: 'Prometric Audio Headset & Sound Test',
    detail:
      'Before Section 1 starts, you must complete the hardware sound test. Practice adjusting the volume on our simulator so you know the exact slider placement.',
  },
  {
    step: '04',
    title: 'Auto-Locking Sections & Non-Reversible Flow',
    detail:
      'Once a section’s 15 or 20 minutes expire or you click Next Section, that section permanently locks. You can never return to previous questions.',
  },
];

export default async function AboutPage() {
  let initialStats = null;
  try {
    initialStats = await getPlatformStats();
  } catch {
    initialStats = null;
  }

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
              href="/guides"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs sm:text-sm font-bold transition-all cursor-pointer backdrop-blur-xs"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Explore Exam Guides</span>
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>How The Simulator Works</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Link>
          </div>
        </div>

        {/* Dynamic Registered Candidates & Core Platform Stats (Live from backend) */}
        <div className="mt-10 sm:mt-14 pt-8 border-t border-slate-800/80">
          <AboutDynamicStats initialStats={initialStats} />
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
            Every screen shown below is captured directly from our running mock test platform. Notice the 1:1 Prometric color palette, font sizes, section locks, and authentic exam environment.
          </p>
        </div>

        {/* Interactive Showcase Tabs Component */}
        <AboutShowcaseTabs tabs={SHOWCASE_TABS} />
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. COMPLETE LEARNING & RESOURCE ECOSYSTEM (Guides, Books, Notices, Practice)
          ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/10 text-japan-red dark:text-rose-400 border border-japan-red/20 text-xs font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>All-In-One Japanese CBT Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            More Than Just Tests: A Complete Study System
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            From the first day of Japanese study to the final Prometric CBT test session, our integrated platform equips candidates with verified study guides, official JAC textbooks, real-time circulars, and gamified practice tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {ECOSYSTEM_CARDS.map((card, cIdx) => {
            const Icon = card.icon;
            return (
              <div
                key={cIdx}
                className={`group relative rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.color} border p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-japan-red dark:text-rose-400 hover:text-japan-redhover group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{card.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-[11px] font-bold text-slate-400">Gakkou No Shiken</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. OUR CORE PILLARS & PROMETRIC FIDELITY STANDARDS
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
          5. PROMETRIC TEST CENTER EXAM DAY PROTOCOL CHECKLIST
          ────────────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Test Day Readiness</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Prometric Exam Day Protocol
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Familiarize yourself with what happens from the moment you arrive at the Prometric test center in Dhaka, Chittagong, Tokyo, or Manila.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {EXAM_DAY_RULES.map((rule, rIdx) => (
            <div
              key={rIdx}
              className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3"
            >
              <div className="w-8 h-8 rounded-xl bg-japan-red/10 text-japan-red font-black text-xs flex items-center justify-center border border-japan-red/20">
                {rule.step}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                {rule.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rule.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. THE MISSION & CALL TO ACTION
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
                <span>12 Comprehensive Study Guides</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>26 Official JAC Textbooks</span>
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

              <div className="space-y-2 pt-1">
                <Link
                  href="/#mock-tests"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  <span>Browse Mock Tests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/guides"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition-all"
                >
                  <span>View All 12 Guides</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
