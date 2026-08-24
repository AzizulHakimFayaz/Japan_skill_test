import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import InteractiveFeatureShowcase from '@/components/InteractiveFeatureShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';

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

      {/* 2. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge, Live Ticker) */}
      <InteractiveFeatureShowcase />

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

      {/* 4. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />
    </div>
  );
}
