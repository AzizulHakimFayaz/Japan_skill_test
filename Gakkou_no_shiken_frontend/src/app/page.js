import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import StudentExamGuide from '@/components/StudentExamGuide';
import {
  Clock,
  CheckCircle2,
  Globe,
  FileText,
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

      {/* 4. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />
    </div>
  );
}
