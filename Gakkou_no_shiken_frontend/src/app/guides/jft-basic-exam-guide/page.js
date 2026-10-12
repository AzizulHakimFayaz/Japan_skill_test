import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Laptop,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  FileText,
  Volume2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export const metadata = {
  title: 'JFT-Basic Official Exam Guide & Prometric CBT Syllabus (2026)',
  description:
    'Comprehensive guide to the Japan Foundation Test for Basic Japanese (JFT-Basic). Learn test structure, 250-point scoring system, CEFR A2 passing criteria, Prometric CBT interface, and study tips.',
  keywords: [
    'JFT-Basic exam guide',
    'JFT-Basic syllabus 2026',
    'JFT mock test guide',
    'Prometric CBT test Bangladesh',
    'CEFR A2 Japanese test',
    'JFT passing score',
    'JFT listening audio tips',
  ],
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jft-basic-exam-guide',
  },
};

export default function JftBasicExamGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the passing score for the JFT-Basic exam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The passing score for JFT-Basic is 200 points or higher out of a maximum of 250 scaled points, which corresponds to CEFR Level A2 proficiency.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long is the JFT-Basic Computer-Based Test (CBT)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The test lasts 60 minutes and contains approximately 50 to 60 questions distributed across four sections: Script and Vocabulary, Conversation and Expression, Listening Comprehension, and Reading Comprehension.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can candidates review questions during the test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates can review questions within an active section. Once you proceed to the next section or the section timer elapses, the previous section locks to adhere to official Prometric security standards.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Complete JFT-Basic Exam Guide: CBT Test Structure, Scoring & Syllabus',
    description:
      'Master the JFT-Basic examination with this official Prometric CBT guide covering test format, CEFR A2 criteria, test venues, and preparation strategies.',
    author: {
      '@type': 'Organization',
      name: 'Gakkou No Shiken',
      url: 'https://www.gakkounoshiken.site',
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Gakkou No Shiken (学校の試験)',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.gakkounoshiken.site/img/logo.png',
      },
    },
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/jft-basic-exam-guide',
    datePublished: '2026-01-15T00:00:00Z',
    dateModified: '2026-10-12T00:00:00Z',
  };

  return (
    <article className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-japan-red transition-colors">Home</Link>
        <span>/</span>
        <Link href="/jft-basic" className="hover:text-japan-red transition-colors">JFT-Basic</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">Official Exam Guide</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Official Syllabus & Prometric CBT Guide (2026)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Complete JFT-Basic Examination Guide & CBT Test Syllabus
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          The Japan Foundation Test for Basic Japanese (JFT-Basic) is the official language assessment required for foreigners obtaining Japan&apos;s <strong>Specified Skilled Worker (特定技能 - SSW) Status of Residence (i)</strong>. This guide explains the computer-based testing format, scoring methodology, section requirements, and preparation techniques.
        </p>
      </header>

      {/* Ad Placement 1: Top of Content */}
      <AdBanner slot="8435487820" format="auto" />

      {/* Section 1: Overview and Purpose */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-japan-red" />
          <span>1. Purpose and Importance of JFT-Basic</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Administered worldwide by the Japan Foundation and Prometric Inc., the JFT-Basic evaluates whether non-native candidates possess the communication skills required for day-to-day life and basic workplace conversations in Japan. It conforms to the <strong>Common European Framework of Reference for Languages (CEFR) Level A2</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Duration</span>
            <div className="text-2xl font-black text-japan-red">60 Minutes</div>
            <p className="text-xs text-slate-500">Continuous timed CBT session on Prometric computer terminals.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Passing Benchmark</span>
            <div className="text-2xl font-black text-emerald-600">200 / 250 Pts</div>
            <p className="text-xs text-slate-500">Scaled score based on Item Response Theory (IRT).</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Question Volume</span>
            <div className="text-2xl font-black text-indigo-600">50 – 60 Questions</div>
            <p className="text-xs text-slate-500">Divided evenly across 4 distinct linguistic sections.</p>
          </div>
        </div>
      </section>

      {/* Section 2: Four Examination Sections */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-japan-red" />
          <span>2. Four Examination Sections & Breakdown</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The test is split into four sequential sections. In our online simulator at Gakkou No Shiken, each section matches Prometric&apos;s official test software layout:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3.5 border border-slate-200 dark:border-slate-800">Section</th>
                <th className="p-3.5 border border-slate-200 dark:border-slate-800">Japanese Name</th>
                <th className="p-3.5 border border-slate-200 dark:border-slate-800">Approx. Questions</th>
                <th className="p-3.5 border border-slate-200 dark:border-slate-800">Focus & Scope</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3.5 font-bold">1. Script & Vocabulary</td>
                <td className="p-3.5 font-mono">文字と語彙</td>
                <td className="p-3.5 font-bold">~12 questions</td>
                <td className="p-3.5">Word meanings, Kanji readings, and correct vocabulary usage in everyday context.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">2. Conversation & Expression</td>
                <td className="p-3.5 font-mono">会話と表現</td>
                <td className="p-3.5 font-bold">~12 questions</td>
                <td className="p-3.5">Grammar particles, conversational formulas, requests, and appropriate situational responses.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">3. Listening Comprehension</td>
                <td className="p-3.5 font-mono">聴解</td>
                <td className="p-3.5 font-bold">~12 questions</td>
                <td className="p-3.5">Native Japanese audio dialogues with questions on announcements, directions, and work tasks.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">4. Reading Comprehension</td>
                <td className="p-3.5 font-mono">読解</td>
                <td className="p-3.5 font-bold">~12 questions</td>
                <td className="p-3.5">Short notices, email messages, train timetables, workplace instructions, and safety signs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad Placement 2: Mid Content */}
      <AdBanner slot="8435487820" format="auto" />

      {/* Section 3: Prometric CBT Computer Operation Guide */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Laptop className="w-6 h-6 text-japan-red" />
          <span>3. Prometric Computer-Based Testing (CBT) Interface Tips</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Unlike paper-based JLPT examinations, the JFT-Basic is conducted exclusively on computer workstations. Understanding the user interface beforehand is vital to avoiding time management errors:
        </p>
        <ul className="space-y-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 list-disc list-inside">
          <li><strong>Digital Top Countdown Timer:</strong> A digital clock displays the exact time remaining. Plan for approximately 1 minute per question.</li>
          <li><strong>Section Locking Rule:</strong> When you complete a section and click &quot;Proceed&quot;, or when section time expires, you CANNOT return to edit previous sections. Answer every question before finishing.</li>
          <li><strong>Headphone Controls:</strong> In the Listening Comprehension section, test audio plays automatically. You can adjust the volume slider on the screen. Audio can only be replayed in practice mode; in official tests, questions play once or twice.</li>
          <li><strong>Question Flagging:</strong> You can mark difficult questions with the &quot;Flag&quot; button to review them before locking your active section.</li>
        </ul>
      </section>

      {/* Section 4: Preparation Resources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-japan-red" />
          <span>4. Free Practice Resources on Gakkou No Shiken</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Gakkou No Shiken is Bangladesh&apos;s #1 Japanese CBT mock test platform, providing authentic practice materials completely free of charge:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/jft-basic"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-japan-red transition-all shadow-sm group"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red flex items-center justify-between">
              <span>Full-Length JFT Mock Tests</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Take complete 60-minute mock exams with native audio, timed sections, and instant CEFR scaled scoring.
            </p>
          </Link>

          <Link
            href="/books"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-japan-red transition-all shadow-sm group"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red flex items-center justify-between">
              <span>26 JAC Official Textbooks with Audio</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Study authentic textbooks with multilingual neural speech synthesis in Bengali, Indonesian, English, and Japanese.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 5: Official FAQs */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-japan-red" />
          <span>5. Frequently Asked Questions (FAQ)</span>
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Q: Is JFT-Basic equivalent to JLPT N4?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Yes. The Japanese Immigration Services Agency recognizes both JFT-Basic (200+ points) and JLPT N4 as satisfying the Japanese language requirement for Specified Skilled Worker (SSW 1) visas.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Q: How many times can a candidate take the test?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              There is no limit on total attempts, but candidates must wait a mandatory cooling-off period (usually 30 to 45 days) before booking another official Prometric test appointment. On Gakkou No Shiken, you can practice unlimited times for free.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Q: What identification is required at Prometric test centers?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Candidates must present an original, valid Passport with photograph and signature. A National ID (NID) card alone is not accepted at most international Prometric centers.
            </p>
          </div>
        </div>
      </section>

      {/* Ad Placement 3: Bottom of Guide */}
      <AdBanner slot="8435487820" format="auto" />
    </article>
  );
}
