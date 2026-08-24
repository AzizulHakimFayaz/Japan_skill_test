import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
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
      {/* 1. Hero Banner (Interactive Auto-Sliding Glassmorphic Carousel) */}
      <HeroBannerCarousel />

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
