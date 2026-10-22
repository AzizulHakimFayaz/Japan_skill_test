import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Laptop,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  HeartHandshake,
  Wheat,
  HardHat,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const metadata = {
  title: 'SSW Skill Test Blueprint & Prometric CBT Guide (2026) | Gakkou No Shiken',
  description:
    'Complete guide to Japan Specified Skilled Worker (SSW 1 & 2) skill evaluation tests. Covers Food Service, Food Manufacturing, Caregiving, Agriculture, Construction CBT format, hygiene rules, and sample questions.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/ssw-skill-test-guide',
  },
};

export default function SswSkillTestGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Specified Skilled Worker (SSW) skill evaluation test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The SSW skill evaluation test measures whether a foreign candidate possesses the practical technical skills, safety awareness, and industry knowledge required to perform occupational tasks in Japan without extensive training.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for SSW skill tests?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most SSW skill evaluation exams (including OTAFF Food Service and Food Manufacturing) require a passing score of 60% or higher across both theoretical knowledge and practical test phases.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is the SSW Prometric CBT structured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SSW Prometric CBT exams typically feature Phase 1 (workplace audio listening comprehension and Japanese text typing) and Phase 2 (practical judgment, hygiene/HACCP, occupational knowledge, and decision-making scenarios).',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Specified Skilled Worker (SSW) Skill Test Blueprint & CBT Guide',
    description:
      'Detailed blueprint for Japan Specified Skilled Worker skill evaluation exams across Food Service, Manufacturing, Agriculture, and Caregiving sectors.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/ssw-skill-test-guide',
    datePublished: '2026-01-20T00:00:00Z',
    dateModified: '2026-10-12T00:00:00Z',
  };

  return (
    <article className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-japan-red transition-colors">Home</Link>
        <span>/</span>
        <Link href="/ssw-skill-test" className="hover:text-japan-red transition-colors">SSW Skill Tests</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">Syllabus Blueprint</span>
      </nav>

      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Japan Ministry of Justice SSW Examination Blueprint (2026)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Specified Skilled Worker (特定技能 - SSW) Skill Test Guide
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          To obtain a <strong>Specified Skilled Worker (i)</strong> visa for employment in Japan, candidates must pass both a Japanese language test (JFT-Basic or JLPT N4) and a designated sector-specific <strong>Skill Evaluation Examination</strong>. This guide breaks down the exam format, major industrial sectors, scoring criteria, and Prometric CBT procedures.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Technical Examination Panel</span>
          </div>
          <span>•</span>
          <span>Aligned with Prometric SSW Blueprint</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>


      {/* Section 1: Major SSW Sectors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-japan-red" />
          <span>1. Major Industrial Sectors for Foreign Workers</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The Japanese government has approved 12+ industry categories for the SSW program. The most popular sectors for candidates in Bangladesh, Nepal, Vietnam, Indonesia, and the Philippines include:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-japan-red font-black text-base">
              <UtensilsCrossed className="w-5 h-5" />
              <span>Food Service Industry (外食業)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organized by OTAFF. Covers customer service (接客), food preparation (調理), and hygiene management (衛生管理). Candidates must understand HACCP regulations, allergy labeling, and Japanese hospitality greetings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-base">
              <UtensilsCrossed className="w-5 h-5" />
              <span>Food & Beverage Manufacturing (飲食料品製造業)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organized by OTAFF. Focuses on food processing lines, equipment cleaning, food hygiene safety, storage temperature controls, and contamination prevention protocols.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-base">
              <HeartHandshake className="w-5 h-5" />
              <span>Caregiving / Nursing Care (介護)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Consists of two separate exams: Nursing Care Skills Evaluation and Nursing Care Japanese Language Evaluation. Covers physical assistance, dementia care, dignified communication, and patient safety.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-black text-base">
              <HardHat className="w-5 h-5" />
              <span>Construction Industry (建設業 - JAC)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organized by JAC. Encompasses formwork, scaffolding, reinforcing bar, plastering, interior finishing, and civil earthwork. Supported by 26 official JAC textbooks available on Gakkou No Shiken.
            </p>
          </div>
        </div>
      </section>


      {/* Section 2: Prometric Exam Two-Phase Structure */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Laptop className="w-6 h-6 text-japan-red" />
          <span>2. Prometric SSW CBT Two-Phase Examination Format</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Unlike ordinary multiple-choice tests, official Prometric SSW skill examinations partition candidates through two rigorous testing phases:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-japan-red text-white text-xs font-black uppercase">Phase 1</span>
              <strong className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Audio Listening & Japanese Text Typing</strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Candidates listen to workplace dialogues (kitchen orders, supervisor safety instructions, equipment alarms) and must either pick the correct response or type Japanese Hiragana/Romaji keywords into an interactive input box.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black uppercase">Phase 2</span>
              <strong className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Occupational Knowledge & Practical Judgment</strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Contains image-based real workplace scenarios. Tests understanding of HACCP 7 principles, cross-contamination, sanitization chemicals, machine lockout-tagout procedures, and emergency response actions.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Study Links */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-japan-red" />
          <span>3. Free Mock Tests & JAC Textbooks</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Prepare effectively with authentic 1:1 Prometric CBT simulator tests and verified textbook materials:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/ssw-skill-test"
            className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-japan-red transition-all shadow-sm group"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red flex items-center justify-between">
              <span>Take SSW Skill Practice Exams</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Phase 1 typing & Phase 2 practical judgment simulation with instant score results.
            </p>
          </Link>
          <Link
            href="/books"
            className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-japan-red transition-all shadow-sm group"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red flex items-center justify-between">
              <span>Read 26 JAC Official Textbooks</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore construction and craft manuals with multilingual audio synthesis.
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}
