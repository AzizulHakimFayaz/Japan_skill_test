import Link from 'next/link';
import { getTests } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import HeroBannerCarousel from '@/components/HeroBannerCarousel';
import InteractiveFeatureShowcase from '@/components/InteractiveFeatureShowcase';
import StudentExamGuide from '@/components/StudentExamGuide';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import LearningHubShowcase from '@/components/LearningHubShowcase';

export const revalidate = 86400; // Cache for 24 hours to stay well within free limits

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
          text: "Gakkou No Shiken is Bangladesh's #1 official-style Computer-Based Testing (CBT) mock exam platform for candidates preparing for JFT-Basic and SSW (Specified Skilled Worker) Japanese exams.",
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
    <div className="space-y-6 sm:space-y-12">
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
      <div className="space-y-3">
        <HeroBannerCarousel />
        {/* Real-time Student Milestone & Activity Ticker */}
        <LiveActivityTicker />
      </div>

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

      {/* 3. Animated Interactive Feature Showcase (Audio Equalizer, Language Lens, IRT Scoring Gauge, Hubs) */}
      <InteractiveFeatureShowcase />

      {/* 4. Professional Student Exam Guide & Syllabus Blueprint */}
      <StudentExamGuide />

      {/* 5. Server-Rendered Comprehensive Educational Guide & Prometric CBT Architecture (Crawlable by Search Engines) */}
      <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 space-y-8 shadow-sm">
        <header className="space-y-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 text-xs font-black uppercase tracking-wider">
            <span>Independent Academic Study Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Understanding Computer-Based Testing (CBT) for JFT-Basic &amp; SSW in Bangladesh
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            The Japan Foundation Test for Basic Japanese (JFT-Basic) and the Specified Skilled Worker (SSW - 特定技能) Skills Evaluation Tests represent the primary official immigration pathways for technical personnel seeking employment in Japan. Administered exclusively through Prometric Computer-Based Testing (CBT) centers worldwide, these examinations require not only language fluency but also computer-based test-taking endurance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Section 1: Prometric CBT Architecture */}
          <article className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. The Prometric CBT Architecture
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike traditional pen-and-paper examinations such as the JLPT, the JFT-Basic test is administered via secure computerized terminals at accredited Prometric facilities (such as the IDB Bhaban center in Agargaon, Dhaka). Candidates receive instant preliminary scoring on-screen upon submission, with formal official digital score reports accessible within five business days.
            </p>
            <Link
              href="/guides/prometric-cbt-registration-guide-dhaka"
              className="inline-flex items-center gap-1 text-xs font-bold text-japan-red dark:text-rose-400 hover:underline pt-1"
            >
              <span>Prometric Dhaka Registration Guide →</span>
            </Link>
          </article>

          {/* Section 2: CEFR A2 Benchmarking */}
          <article className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. CEFR A2 Competency Standard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              JFT-Basic measures whether test-takers possess the Japanese communication ability necessary to handle everyday conversations and daily life situations in Japan without difficulty. It is benchmarked against Level A2 of the Common European Framework of Reference for Languages (CEFR). A scaled score of 200 out of 250 points is required to obtain an official pass certificate.
            </p>
            <Link
              href="/guides/jft-basic-scoring-and-passing-criteria"
              className="inline-flex items-center gap-1 text-xs font-bold text-japan-red dark:text-rose-400 hover:underline pt-1"
            >
              <span>Scoring &amp; Passing Scale Breakdown →</span>
            </Link>
          </article>

          {/* Section 3: Specified Skilled Worker (SSW) Pathways */}
          <article className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. SSW Visa Category Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              To obtain the Specified Skilled Worker (SSW No. 1) status of residence, international candidates must pass two distinct exams: a foundational Japanese language test (JFT-Basic or JLPT N4+) and a trade-specific skill evaluation test in sectors such as Nursing Care (Kaigo), Food Service, Agriculture, or Construction.
            </p>
            <Link
              href="/guides/ssw-skill-test-guide"
              className="inline-flex items-center gap-1 text-xs font-bold text-japan-red dark:text-rose-400 hover:underline pt-1"
            >
              <span>SSW Exam Blueprint &amp; Syllabus →</span>
            </Link>
          </article>
        </div>

        {/* Deep Curriculum Prose */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Why Realistic Simulation Matters for Candidate Success
          </h3>
          <p>
            Candidate performance data indicates that over 40% of test-takers who struggle with the JFT-Basic CBT do so not because of lack of vocabulary, but due to testing environment unfamiliarity. The 60-minute countdown timer operates across four locked sections (Script &amp; Vocabulary, Conversation &amp; Expression, Listening Comprehension, and Reading Comprehension). Once a section timer expires or a candidate advances, previous questions lock permanently.
          </p>
          <p>
            Gakkou No Shiken was developed to eliminate this anxiety. Our platform provides high-fidelity Prometric CBT replicas featuring real-time section timers, native Japanese audio streaming, multilingual terminology support, and instant scaled psychometric evaluation. We empower candidates in Bangladesh and worldwide to master the actual testing software before setting foot in the test center.
          </p>
        </div>

        {/* Clear Non-Affiliation Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            Institutional Non-Affiliation &amp; Educational Purpose Notice:
          </p>
          <p>
            Gakkou No Shiken (学校の試験) is an independent non-commercial academic research and examination practice platform developed by Bangladeshi educators. We are not affiliated with, sponsored by, authorized by, or endorsed by The Japan Foundation (国際交流基金), Prometric Inc., the Japan Association for Construction Human Resources (JAC), or any agency of the Government of Japan. Official exam scheduling and candidate verification must always be completed directly on Prometric&apos;s official portal at prometric-jp.com.
          </p>
        </div>
      </section>
    </div>
  );
}

