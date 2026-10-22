import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers,
  ListOrdered,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

export const metadata = {
  title: '30-Day Intensive JFT-Basic Study Plan: From Zero to CEFR A2 Pass (2026)',
  description:
    'A realistic, structured 30-day roadmap for busy students and working candidates in Bangladesh preparing to pass the JFT-Basic CBT exam with a 200+ scaled score.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jft-basic-30-day-study-plan',
  },
};

export default function JftThirtyDayStudyPlanPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is 30 days enough to pass the JFT-Basic examination?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, provided you commit between 2.5 to 3 focused hours daily following an active study curriculum based on the official Japan Foundation Irodori: Japanese for Life in Japan textbook and authentic Prometric CBT mock test simulations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which textbook is best for JFT-Basic preparation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The official textbook specifically engineered for the JFT-Basic syllabus is "Irodori: Japanese for Life in Japan" (Starter A1 and Elementary 1 & 2 A2), published for free open access by the Japan Foundation.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should I allocate my 3 daily study hours?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Allocate 45 minutes to active vocabulary and kanji flashcards, 45 minutes to grammar patterns and sentence construction, 45 minutes to native Japanese listening immersion, and 45 minutes to timed practice questions.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '30-Day Intensive JFT-Basic Study Plan: From Zero to CEFR A2 Pass',
    description:
      'Step-by-step 30-day study roadmap for passing the JFT-Basic Prometric Computer-Based Test, covering script acquisition, Irodori lessons, grammar particles, and mock simulations.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/jft-basic-30-day-study-plan',
    datePublished: '2026-03-02T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">30-Day JFT Study Plan</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Rocket className="w-3.5 h-3.5" />
          <span>Intensive Study Blueprint • CEFR A2</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          30-Day Intensive JFT-Basic Study Plan: From Zero to CEFR A2 Pass
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Designed specifically for candidates in Bangladesh and South Asia who need to obtain their official JFT-Basic pass certificate for the Japanese Specified Skilled Worker (SSW) visa program under strict deadlines. This day-by-day timetable balances script mastery, grammar, native listening, and CBT pacing.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Pedagogy: Irodori JF Standard Framework</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Plan Parameters */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Duration</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">30 Days</div>
          <p className="text-xs text-slate-500">4 progressive weekly development phases.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Daily Commitment</span>
          <div className="text-2xl font-black text-japan-red">2.5 – 3 Hours</div>
          <p className="text-xs text-slate-500">Structured into 45-minute focused sprints.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Target Score</span>
          <div className="text-2xl font-black text-emerald-600">210+ Points</div>
          <p className="text-xs text-slate-500">Safe margin above the 200-point pass cutoff.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Core Text</span>
          <div className="text-2xl font-black text-indigo-600">Irodori A1 &amp; A2</div>
          <p className="text-xs text-slate-500">Official Japan Foundation coursebooks.</p>
        </div>
      </section>

      {/* Weekly Breakdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-japan-red" />
          <span>The Four Weekly Study Blocks</span>
        </h2>

        {/* Week 1 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Week 1 (Days 1–7): The Script &amp; Phonetics Sprint
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-japan-red dark:bg-rose-950/60 dark:text-rose-400">Foundation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your immediate objective is reading without romaji hesitation.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li>• <strong>Days 1–3:</strong> Master Hiragana (46 base characters, dakuten, handakuten, and combined yōon sounds like kya, shu, cho).</li>
            <li>• <strong>Days 4–5:</strong> Master Katakana (crucial for supermarket items, machine buttons, foreign loanwords like パン, トイレ, エレベーター).</li>
            <li>• <strong>Days 6–7:</strong> Learn the first 50 essential A2 Kanji (numbers, days of the week, directions, entry/exit signs: 入口, 出口, 非常口, 止まれ).</li>
          </ul>
        </div>

        {/* Week 2 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Week 2 (Days 8–14): Daily Situations &amp; Practical Vocabulary
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">Vocabulary</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Cover the core communicative topics in <em>Irodori Starter (A1)</em> and <em>Elementary 1 (A2)</em>:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li>• <strong>Days 8–9:</strong> Self-introductions, country of origin, occupation, daily routine verbs (起きます, 食べます, 行きます).</li>
            <li>• <strong>Days 10–11:</strong> Shopping and dining: counting objects (ひとつ, ふたつ), asking prices (いくらですか), ordering food at restaurant counters.</li>
            <li>• <strong>Days 12–14:</strong> Navigating town: asking directions (〜はどこですか), public transit ticketing, reading simple train timetables.</li>
          </ul>
        </div>

        {/* Week 3 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Week 3 (Days 15–21): Core Grammar Particles &amp; Verb Conjugations
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">Grammar &amp; Audio</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The grammatical core tested in Section 2 (Conversation &amp; Expression):
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li>• <strong>Days 15–16:</strong> Master particles: は vs が (topic vs subject), に vs で (time/destination vs action location), を (direct object).</li>
            <li>• <strong>Days 17–18:</strong> Te-form conjugation (て形): Making polite requests (〜てください), asking permission (〜てもいいですか), states of being (〜ています).</li>
            <li>• <strong>Days 19–21:</strong> Nai-form (ない形) for rules and warnings (〜ないでください) and dictionary form for expressing abilities (〜ことができます). Daily 30-minute audio immersion listening to Irodori dialogues.</li>
          </ul>
        </div>

        {/* Week 4 */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Week 4 (Days 22–30): Full CBT Exam Simulations &amp; Error Logging
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">Exam Mastery</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Transition from book learning to realistic computer-based test endurance:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li>• <strong>Days 22–25:</strong> Take full 60-minute simulated CBT mock exams on Gakkou No Shiken under strict timed conditions.</li>
            <li>• <strong>Days 26–28:</strong> Analyze your error log: drill into every missed particle and misunderstood listening prompt.</li>
            <li>• <strong>Days 29–30:</strong> Rest and confidence building: light vocabulary review, confirm Prometric registration details, check original passport.</li>
          </ul>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Begin Day 1 with Our Free CBT Mock Exams</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Experience authentic Prometric CBT countdown timers, native audio prompts, and instant diagnostic score reports.
          </p>
        </div>
        <Link
          href="/jft-basic"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Start Practicing Now</span>
        </Link>
      </section>
    </article>
  );
}
