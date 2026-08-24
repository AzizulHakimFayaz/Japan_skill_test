import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import InteractiveFeatureShowcase from '@/components/InteractiveFeatureShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';
import LiveActivityTicker from '@/components/LiveActivityTicker';

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
    <div className="space-y-6 sm:space-y-12">
      {/* 1. Hero Banner (Interactive Auto-Sliding Glassmorphic Carousel) */}
      <div className="space-y-3">
        <HeroBannerCarousel />
        {/* Real-time Student Milestone & Activity Ticker */}
        <LiveActivityTicker />
      </div>

      {/* 2. Practice Test Categories & Cards Grid (Placed Immediately After Banner) */}
      <div id="practice-grid" className="space-y-6 sm:space-y-10">
        <section className="bg-transparent sm:bg-white/85 sm:dark:bg-slate-950/70 sm:backdrop-blur-xl sm:rounded-3xl sm:border sm:border-slate-200/90 sm:dark:border-slate-800/90 sm:p-8 lg:p-10 sm:shadow-lg sm:shadow-slate-200/40 sm:dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={basicTests}
            title="JFT Tests"
            subtitle="Beginner-friendly Japanese language evaluation tests."
            catKey="basic"
          />
        </section>

        <section className="bg-transparent sm:bg-white/85 sm:dark:bg-slate-950/70 sm:backdrop-blur-xl sm:rounded-3xl sm:border sm:border-slate-200/90 sm:dark:border-slate-800/90 sm:p-8 lg:p-10 sm:shadow-lg sm:shadow-slate-200/40 sm:dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={skillTests}
            title="SSW Skill Tests"
            subtitle="Technical and workplace skill assessment practice exams."
            catKey="skill"
          />
        </section>
      </div>

      {/* 3. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge, Hubs) */}
      <InteractiveFeatureShowcase />

      {/* 4. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />
    </div>
  );
}
