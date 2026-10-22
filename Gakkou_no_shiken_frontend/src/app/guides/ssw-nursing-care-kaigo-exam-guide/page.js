import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  Hospital,
  Layers,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'SSW Nursing Care (Kaigo) Skill & Japanese Evaluation Test Guide (2026)',
  description:
    'Complete syllabus and preparation guide for the Specified Skilled Worker (SSW No. 1) Nursing Care Evaluation Test (介護技能評価試験) and Nursing Care Japanese Test (介護日本語評価試験).',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/ssw-nursing-care-kaigo-exam-guide',
  },
};

export default function SswNursingCareGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What exams are required to work in Japan under the SSW Nursing Care (Kaigo) visa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates must pass three separate exams: (1) JFT-Basic or JLPT N4 for foundational Japanese, (2) the Nursing Care Skills Evaluation Test (介護技能評価試験), and (3) the Nursing Care Japanese Language Evaluation Test (介護日本語評価試験). Both technical tests are computer-based and administered via Prometric.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for the Kaigo skill and Japanese tests?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The passing standard for both the Nursing Care Skills Evaluation Test and the Nursing Care Japanese Language Evaluation Test is approximately 60% or higher of the total score.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can foreign caregivers transition to permanent residency in Japan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. If an SSW caregiver works in Japan for 3 years and successfully passes the Japanese National Examination for Certified Care Workers (Kaigofukushishi - 介護福祉士), they can transition to the "Nursing Care" status of residence, which allows indefinite visa renewals and an eligibility pathway to permanent residency with family sponsorship.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SSW Nursing Care (Kaigo) Skill & Japanese Evaluation Test Guide (2026)',
    description:
      'Comprehensive study guide for the Specified Skilled Worker Nursing Care examination in Japan covering exam structure, key medical terminology, physical transfer skills, and passing benchmarks.',
    author: {
      '@type': 'Organization',
      name: 'Gakkou No Shiken Academic Editorial Board',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/ssw-nursing-care-kaigo-exam-guide',
    datePublished: '2026-02-18T00:00:00Z',
    dateModified: '2026-10-22T00:00:00Z',
  };

  return (
    <article className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      {/* Schema.org Structured Data */}
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
        <Link href="/guides" className="hover:text-japan-red transition-colors">Guides</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">SSW Nursing Care (Kaigo) Guide</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>SSW Sector Blueprint • Nursing Care (介護)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          SSW Nursing Care (Kaigo) Skill &amp; Japanese Evaluation Test Guide
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Japan faces an unprecedented demand for qualified international caregivers across elderly care homes (特別養護老人ホーム) and day-service facilities. This comprehensive manual details the two statutory Prometric CBT examinations required under the <strong>Specified Skilled Worker (特定技能1号 - 介護)</strong> category, core medical terminology, ethical standards, and career trajectories.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Aligned with Ministry of Health, Labour &amp; Welfare (MHLW) Standards</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Exam 1: Care Skills</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">45 Questions • 60 Mins</div>
          <p className="text-xs text-slate-500">Physical transfer, bathing, nutrition, dementia care basics.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Exam 2: Care Japanese</span>
          <div className="text-xl font-black text-japan-red">15 Questions • 30 Mins</div>
          <p className="text-xs text-slate-500">Caregiving vocabulary, handovers, medical voice dialogues.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Passing Benchmark</span>
          <div className="text-xl font-black text-emerald-600">60% or Above</div>
          <p className="text-xs text-slate-500">Instant preliminary result displayed upon exam completion.</p>
        </div>
      </section>

      {/* Part 1: Mandatory Exam Triad */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Hospital className="w-6 h-6 text-japan-red" />
          <span>1. The Three Mandatory Examinations for Kaigo Candidates</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Unlike other SSW sectors (which only require 1 language test and 1 skill test), the Nursing Care sector requires <strong>three distinct credential evaluations</strong> due to the direct medical and human safety responsibilities involved:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
              Exam 1 (General Language)
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">JFT-Basic or JLPT N4</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verifies general conversational Japanese proficiency at CEFR A2 level. Measures basic listening, grammar, and reading comprehension.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 font-bold text-xs text-japan-red">
              Exam 2 (Technical Skill)
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nursing Care Skills Evaluation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              45 computer-based questions evaluating physical care techniques: wheelchair transfers, body mechanics, feeding assistance, skin breakdown prevention, and hygiene.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-bold text-xs text-indigo-600">
              Exam 3 (Sector Japanese)
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nursing Care Japanese Test</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              15 questions evaluating specialized eldercare vocabulary, conversational compassion phrases, and medical handover records (申し送り).
            </p>
          </div>
        </div>
      </section>

      {/* Part 2: Key Technical Concepts in Nursing Care */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-japan-red" />
          <span>2. Core Caregiving Terminology &amp; Practice Domains</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-japan-red">Physical Care Terminology (身体介護)</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>• <strong>移乗 (Ijō):</strong> Transferring a care recipient from a bed to a wheelchair.</li>
              <li>• <strong>体位変換 (Taii Henkan):</strong> Repositioning the body to prevent bedsores (褥瘡 - Jokusō).</li>
              <li>• <strong>歩行介助 (Hokō Kaijo):</strong> Assisting with walking using walking canes or walkers.</li>
              <li>• <strong>食事介助 (Shokuji Kaijo):</strong> Feeding support, swallowing checks to prevent choking (誤嚥 - Goen).</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Hygiene &amp; Health Monitoring (清潔・健康管理)</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>• <strong>入浴介助 (Nyūyoku Kaijo):</strong> Bathing support, monitoring water temperature (38–40°C).</li>
              <li>• <strong>排泄介助 (Haisetsu Kaijo):</strong> Toilet assistance and respectful diaper changing etiquette.</li>
              <li>• <strong>バイタルサイン (Vital Signs):</strong> Measuring blood pressure, pulse, body temperature, and respiration.</li>
              <li>• <strong>認知症 (Ninshishō):</strong> Understanding dementia symptoms and maintaining human dignity (尊厳の保持).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Part 3: Career Path to Permanent Residency */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-japan-red" />
          <span>3. Long-Term Career Pathway: Certified Care Worker (介護福祉士)</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The Nursing Care sector offers one of the most advantageous immigration pathways in Japan:
        </p>

        <div className="p-6 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-3 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
          <p>
            Candidates enter on the <strong>SSW No. 1 (特定技能1号)</strong> visa, valid for up to 5 years. While working full-time in Japan, you accumulate practical clinical care experience. After <strong>3 years of registered full-time employment</strong>, you become eligible to sit for the prestigious <strong>National Examination for Certified Care Workers (Kaigofukushishi - 介護福祉士)</strong>.
          </p>
          <p>
            Passing this national exam transitions your legal visa status from SSW to the professional <strong>&quot;Nursing Care (介護)&quot;</strong> status of residence. Under this status:
          </p>
          <ul className="list-disc list-inside space-y-1 pt-1 font-semibold">
            <li>Visa renewals are unlimited (no 5-year maximum restriction).</li>
            <li>You can sponsor spouse and children to live in Japan.</li>
            <li>You establish a direct track to applying for Japanese Permanent Residency (永住権).</li>
          </ul>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Prepare for the Prometric Nursing Care CBT</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Practice Japanese healthcare dialogues, technical caregiver vocabulary, and real-time timed test simulations on our portal.
          </p>
        </div>
        <Link
          href="/ssw-skill-test"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Explore SSW Tests</span>
        </Link>
      </section>
    </article>
  );
}
