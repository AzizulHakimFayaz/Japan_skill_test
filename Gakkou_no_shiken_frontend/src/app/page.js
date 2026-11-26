import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import LeaderboardPodiumShowcase from '@/components/LeaderboardPodiumShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';
import LearningHubShowcase from '@/components/LearningHubShowcase';
import AdsterraNativeBanner from '@/components/AdsterraNativeBanner';

export const revalidate = 60; // Refresh ISR every 60s so scheduled test countdowns stay live

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
          text: "Gakkou No Shiken is Asia's #1 realistic Computer-Based Testing (CBT) practice simulator, designed to help candidates get familiar with the JFT-Basic and SSW exam interface and timing before test day.",
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
          text: 'Yes! Candidates can access full-length CBT mock tests, view detailed answer explanations, and track their rankings on the national leaderboard.',
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
  };

  return (
    <div className="space-y-5 sm:space-y-8">
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

      {/* 1. Hero Banner (Interactive Auto-Sliding Glassmorphic Carousel) */}
      <HeroBannerCarousel />

      {/* 2. Interactive Learning & Game Hub Showcase (Game Zone, Lessons, Tools, Daily Vocab) */}
      <LearningHubShowcase />

      {/* 3. Practice Test Categories & Cards Grid */}
      <div id="practice-grid" className="space-y-6 sm:space-y-10">
        <section className="bg-transparent sm:bg-white/85 sm:dark:bg-slate-950/70 sm:backdrop-blur-xl sm:rounded-3xl sm:border sm:border-slate-200/90 sm:dark:border-slate-800/90 sm:p-8 lg:p-10 sm:shadow-lg sm:shadow-slate-200/40 sm:dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={basicTests}
            title="JFT Tests"
            subtitle="Beginner-friendly Japanese language evaluation tests."
            catKey="basic"
            seeAllHref="/tests?category=basic"
          />
        </section>

        <section className="bg-transparent sm:bg-white/85 sm:dark:bg-slate-950/70 sm:backdrop-blur-xl sm:rounded-3xl sm:border sm:border-slate-200/90 sm:dark:border-slate-800/90 sm:p-8 lg:p-10 sm:shadow-lg sm:shadow-slate-200/40 sm:dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-300">
          <PracticeTestGrid
            practiceTests={skillTests}
            title="SSW Skill Tests"
            subtitle="Technical and workplace skill assessment practice exams."
            catKey="skill"
            seeAllHref="/tests?category=skill"
          />
        </section>
      </div>

      {/* 4. Top 3 Champions Podium & "Grind for #1" Promotional Challenge */}
      <LeaderboardPodiumShowcase />

      {/* 3. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge, Hubs) */}
      <AdsterraNativeBanner />


      {/* 4. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />

      {/* 5. Compact Non-Affiliation & Study Guide Notice */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="max-w-4xl">
          <strong className="text-slate-800 dark:text-slate-200">Independent Practice Simulator:</strong>{' '}
          Gakkou No Shiken is an independent study platform built to help candidates get familiar with the JFT-Basic &amp; SSW CBT interface and timing. Not affiliated with The Japan Foundation, Prometric Inc., JAC, or any government agency.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0 font-bold">
          <Link href="/guides" className="text-japan-red dark:text-rose-400 hover:underline whitespace-nowrap">
            Study Guides →
          </Link>
          <Link href="/disclaimer" className="text-slate-500 dark:text-slate-400 hover:underline whitespace-nowrap">
            Disclaimer
          </Link>
        </div>
      </section>
    </div>
  );
}

