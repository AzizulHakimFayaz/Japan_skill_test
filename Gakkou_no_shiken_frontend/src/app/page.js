import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import InteractiveFeatureShowcase from '@/components/InteractiveFeatureShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import DailyKanjiCard from '@/components/DailyKanjiCard';
import ExamScorePredictor from '@/components/ExamScorePredictor';

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
    <div className="space-y-8 sm:space-y-14">
      {/* 1. Hero Banner (Interactive Auto-Sliding Glassmorphic Carousel) */}
      <div className="space-y-3">
        <HeroBannerCarousel />
        {/* Real-time Student Milestone & Activity Ticker */}
        <LiveActivityTicker />
      </div>

      {/* 2. Interactive Student Power Tools (Daily 3D Kanji Flipcard & AI CEFR Score Predictor) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyKanjiCard />
        <ExamScorePredictor />
      </div>

      {/* 3. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge, Hubs) */}
      <InteractiveFeatureShowcase />

      {/* 4. Practice Test Categories & Cards Grid */}
      <div id="practice-grid" className="space-y-6 sm:space-y-12">
        <section className="bg-white/95 dark:bg-slate-950/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-3.5 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] hover:shadow-xl transition-all duration-300">
          <PracticeTestGrid
            practiceTests={basicTests}
            title="JFT Tests"
            subtitle="Beginner-friendly Japanese language evaluation tests."
            catKey="basic"
          />
        </section>

        <section className="bg-white/95 dark:bg-slate-950/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-3.5 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] hover:shadow-xl transition-all duration-300">
          <PracticeTestGrid
            practiceTests={skillTests}
            title="SSW Skill Tests"
            subtitle="Technical and workplace skill assessment practice exams."
            catKey="skill"
          />
        </section>
      </div>

      {/* 5. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />
    </div>
  );
}
