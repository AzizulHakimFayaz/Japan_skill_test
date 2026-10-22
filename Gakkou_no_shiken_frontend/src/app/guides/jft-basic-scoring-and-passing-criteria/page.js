import React from 'react';
import Link from 'next/link';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  HelpCircle,
  Percent,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'JFT-Basic Scoring System: 250-Scale Calculation, Pass Mark & Section Breakdown (2026)',
  description:
    'Detailed analysis of the JFT-Basic 250-point scaled scoring system. Learn how Item Response Theory (IRT) calculates your score, why 200 points is the passing threshold, and section-by-section scoring weight.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jft-basic-scoring-and-passing-criteria',
  },
};

export default function JftScoringCriteriaGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the passing score for the JFT-Basic exam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The passing score for JFT-Basic is 200 scaled points or higher out of a maximum 250 points, which certifies that the candidate has reached CEFR Level A2 Japanese language proficiency.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the JFT-Basic score calculated as a simple raw percentage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The score is calculated using an advanced statistical method called Item Response Theory (IRT) Equating. This ensures that scores remain fair and comparable across different test forms, dates, and test centers, adjusting for subtle differences in question difficulty.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there minimum passing score cutoffs for individual sections in JFT-Basic?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike JLPT, the JFT-Basic does not have a formal sectional failure threshold. Passing is determined strictly by achieving a total scaled score of 200 points or above across all four sections combined. However, balanced competence across all sections is necessary to hit the 200-point mark.',
        },
      },
      {
        '@type': 'Question',
        name: 'When can I download my official Prometric JFT-Basic Score Report?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your preliminary total score is displayed on the computer screen immediately after you submit the exam. An official, cryptographically verifiable PDF score report is released inside your Prometric candidate account within 5 business days.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'JFT-Basic Scoring System: 250-Scale Calculation, Pass Mark & Section Breakdown',
    description:
      'In-depth guide to understanding the JFT-Basic scaled scoring methodology, Item Response Theory, section weighting, and passing benchmarks for Japanese immigration.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/jft-basic-scoring-and-passing-criteria',
    datePublished: '2026-02-14T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">JFT-Basic Scoring System</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Psychometric Scoring Analysis • CEFR A2 Benchmark</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          JFT-Basic Scoring System: 250-Scale Calculation &amp; Section Breakdown
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          How is your JFT-Basic exam evaluated? Unlike standard school tests where each question carries a fixed raw point, the Japan Foundation utilizes <strong>Item Response Theory (IRT) Equating</strong> to generate a scaled score between 10 and 250 points. This guide provides a full mathematical and strategic breakdown.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>CEFR A2 Benchmark Verified</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Key Metric Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Scale Range</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">10 – 250 Pts</div>
          <p className="text-xs text-slate-500">Scaled score based on statistical psychometrics.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Passing Mark</span>
          <div className="text-2xl font-black text-emerald-600">200 Points</div>
          <p className="text-xs text-slate-500">Represents CEFR A2 standard competency.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Duration</span>
          <div className="text-2xl font-black text-japan-red">60 Minutes</div>
          <p className="text-xs text-slate-500">Strictly enforced across 4 locked sections.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Questions</span>
          <div className="text-2xl font-black text-indigo-600">50 – 60 Items</div>
          <p className="text-xs text-slate-500">Multiple-choice format with audio prompts.</p>
        </div>
      </section>

      {/* Part 1: How IRT Scaling Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-japan-red" />
          <span>1. The Mathematics of Scaled Scoring (IRT Equating)</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Many candidates ask: <em>&quot;If there are 55 questions on the test, how can the score be out of 250? Does each question count for 4.5 points?&quot;</em>
        </p>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The answer is no. Prometric and the Japan Foundation employ <strong>Item Response Theory (IRT)</strong>. In IRT:
        </p>
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">A. Question Weighting by Difficulty:</h4>
            <p>Every test question is assigned a statistical difficulty coefficient. Correctly answering a high-difficulty listening question contributes differently to your scaled estimate than correctly answering an elementary katakana identification item.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">B. Test Form Equating:</h4>
            <p>Because candidates test on different days throughout the year, test forms are never identical. The equating algorithm mathematically adjusts for small fluctuations in test form difficulty, ensuring that a 200 achieved on Tuesday in Dhaka represents identical linguistic mastery to a 200 achieved on Friday in Tokyo.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">C. Standard Error of Measurement:</h4>
            <p>To safely pass the 200-point threshold, candidates should target answering at least <strong>75% to 80% of all questions correctly</strong> during practice mock sessions.</p>
          </div>
        </div>
      </section>

      {/* Part 2: Section Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-japan-red" />
          <span>2. Four Examination Sections and Question Weights</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The JFT-Basic examination is segmented into four distinct competency sections:
        </p>

        <div className="space-y-3">
          {/* Section 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Section 1: Script &amp; Vocabulary (文字と語彙)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-japan-red dark:bg-rose-950/60 dark:text-rose-400 font-bold">12 Questions • ~12 Mins</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Assesses knowledge of everyday Japanese vocabulary, kanji readings, and contextual word meanings. Focuses heavily on words encountered on public notices, supermarket packaging, public transportation signage, and workplace facilities.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Section 2: Conversation &amp; Expression (会話と表現)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold">12 Questions • ~15 Mins</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Measures practical sentence grammar, particle usage (は, が, に, で, を), verb conjugations (te-form, nai-form, conditional tara), and polite conversational exchanges (requests, invitations, apologizing, asking directions).
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Section 3: Listening Comprehension (聴解)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold">18 – 20 Questions • ~20 Mins</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Critical section featuring native Japanese audio dialogues played <strong>only once</strong> through the test terminal headphones. Candidates listen to store announcements, instructions from workplace supervisors, and social conversations to extract specific details (times, locations, prices, instructions).
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Section 4: Reading Comprehension (読解)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">12 Questions • ~13 Mins</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tests reading comprehension of brief everyday texts: apartment notices, waste sorting guides, restaurant menus, short email messages, and clinic appointment slips.
            </p>
          </div>
        </div>
      </section>

      {/* Part 3: Strategy for Hitting 200 Points */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-japan-red" />
          <span>3. Practical Roadmap to Exceeding the 200-Point Pass Mark</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Rule 1: Never Leave Any Question Blank</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              There is zero penalty for incorrect answers in JFT-Basic. If time is running out in an active section, always select an educated guess before advancing.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Rule 2: Master Section Time Limits</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Spend no more than 45 to 60 seconds on single-sentence grammar questions. Reserve your cognitive stamina for Section 3 (Listening) and Section 4 (Reading Comprehension).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Test Your Scaled Score on Our Simulator</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Our diagnostic algorithm models the official Prometric IRT scaling to calculate your preliminary 250-point score instantly.
          </p>
        </div>
        <Link
          href="/jft-basic"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Try CBT Mock Exam</span>
        </Link>
      </section>
    </article>
  );
}
