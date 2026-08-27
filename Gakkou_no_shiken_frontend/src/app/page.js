import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import WebsiteHero from '@/components/WebsiteHero';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorksSection from '@/components/HowItWorksSection';
import InteractiveFeatureShowcase from '@/components/InteractiveFeatureShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';
import PrometricInfoSection from '@/components/PrometricInfoSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToActionBanner from '@/components/CallToActionBanner';
import { BookOpen, Layers, ArrowRight, Sparkles } from 'lucide-react';

export const revalidate = 60; // Incremental Static Regeneration (revalidate at most every 60 seconds)

export default async function HomePage() {
  let data = { tests: [], tests_by_category: { basic: [], skill: [] }, section_specs: [] };

  try {
    data = await getTests();
  } catch (err) {
    console.error('Failed to fetch tests on home page:', err);
  }

  const basicTests = data?.tests_by_category?.basic || [];
  const skillTests = data?.tests_by_category?.skill || [];

  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Gakkou No Shiken?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Gakkou No Shiken (学校の試験) is Bangladesh's #1 official-style Computer-Based Testing (CBT) mock exam portal for candidates preparing for JFT-Basic and SSW (Specified Skilled Worker) Japanese exams.",
        },
      },
      {
        '@type': 'Question',
        name: 'How does the JFT-Basic & SSW CBT mock test work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The platform simulates authentic Prometric CBT test conditions with timed sections, native listening audio, 10 language aids (including Bengali & English), and instant CEFR scaled score reports upon completion.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Gakkou No Shiken free to practice for Bangladeshi students?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Candidates can access free full-length CBT diagnostic tests, view detailed answer explanations in Bengali, and track their national rankings.',
        },
      },
    ],
  };

  const homeBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.gakkounoshiken.site',
      },
    ],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Gakkou No Shiken CBT Exam Simulator',
    url: 'https://www.gakkounoshiken.site',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1240',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      {/* Schema.org FAQPage, BreadcrumbList, and WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      {/* 1. Website Grand Hero Section */}
      <div className="space-y-4">
        <WebsiteHero />
        {/* Real-time Student Milestone & Activity Ticker */}
        <LiveActivityTicker />
      </div>

      {/* 2. Target Exam Pathways Quick Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200/90 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-4 hover-lift transition-all">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-japan-red dark:text-rose-300 text-xs font-black uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Language Evaluation</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">CEFR A2 Level</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            JFT-Basic Examination (基礎日本語)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Essential 60-minute test evaluating everyday Japanese communication for Specified Skilled Worker (SSW-1) applicants across 4 sections: Script/Vocab, Dialogue, Listening, and Reading.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="#jft-tests"
              className="inline-flex items-center gap-1.5 text-japan-red dark:text-rose-400 font-extrabold text-sm hover:underline"
            >
              <span>Practice JFT Mock Exams</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/jft-basic"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              View Syllabus &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/90 dark:border-amber-900/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-4 hover-lift transition-all">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Vocational Competency</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">12 SSW Sectors</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            SSW Technical Skills Evaluation Tests
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Industry-specific assessments for Caregiving/Nursing Care (介護), Food Service (外食), Agriculture (農業), Hospitality, and Construction skills necessary for Japanese employment visas.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="#ssw-tests"
              className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-extrabold text-sm hover:underline"
            >
              <span>Practice SSW Mock Exams</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/ssw-skill-test"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Explore Sectors &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Practice Test Categories & Cards Grid */}
      <div id="practice-grid" className="space-y-8 sm:space-y-12">
        <section id="jft-tests" className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={basicTests}
            title="JFT-Basic Practice Exams"
            subtitle="Official-format Japanese language evaluation tests with 60-min CBT timer."
            catKey="basic"
          />
        </section>

        <section id="ssw-tests" className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={skillTests}
            title="SSW Sector Skills Evaluation Exams"
            subtitle="Technical and workplace competency practice exams for Specified Skilled Worker visas."
            catKey="skill"
          />
        </section>
      </div>

      {/* 4. Why Gakkou No Shiken (6 Feature Pillars) */}
      <WhyChooseUs />

      {/* 5. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge) */}
      <InteractiveFeatureShowcase />

      {/* 6. Step-by-Step 4-Stage Roadmap */}
      <HowItWorksSection />

      {/* 7. Official Prometric Test Centers in Bangladesh */}
      <PrometricInfoSection />

      {/* 8. Student Exam Guide & Syllabus Breakdown */}
      <StudentExamGuide />

      {/* 9. Student Testimonials & Success Stories */}
      <TestimonialsSection />

      {/* 10. High-Converting Bottom Call-To-Action Banner */}
      <CallToActionBanner />
    </div>
  );
}
