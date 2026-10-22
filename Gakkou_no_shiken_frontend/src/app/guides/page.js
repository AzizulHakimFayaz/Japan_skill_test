import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Headphones,
  Heart,
  HelpCircle,
  Laptop,
  Leaf,
  Rocket,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';

export const metadata = {
  title: 'Official JFT-Basic & SSW Examination Guides Hub (2026) | Gakkou No Shiken',
  description:
    'Comprehensive editorial study guides for Japanese Prometric CBT exams. Master JFT-Basic scoring, Prometric registration in Dhaka, SSW sector blueprints (Nursing Care, Food Service, Agriculture), grammar particles, and study plans.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides',
  },
};

const GUIDES = [
  {
    slug: 'prometric-cbt-registration-guide-dhaka',
    category: 'Registration & Test Center',
    title: 'How to Register for Prometric CBT Exams in Dhaka, Bangladesh (Step-by-Step 2026 Guide)',
    description:
      'Complete guide to booking your JFT-Basic and SSW exam seat at IDB Bhaban in Dhaka. Covers Prometric ID creation, passport rules, fees in BDT, and payment methods.',
    readTime: '8 min read',
    icon: Laptop,
    badgeColor: 'bg-rose-50 text-japan-red border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/40',
  },
  {
    slug: 'jft-basic-scoring-and-passing-criteria',
    category: 'Scoring & Psychometrics',
    title: 'JFT-Basic Scoring System: 250-Scale Calculation, Pass Mark & Section Breakdown',
    description:
      'Understand how Item Response Theory (IRT) calculates your scaled score between 10 and 250 points, why 200 points is the passing mark, and section weighting.',
    readTime: '7 min read',
    icon: Award,
    badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/40',
  },
  {
    slug: 'jft-basic-exam-guide',
    category: 'JFT-Basic Overview',
    title: 'Complete JFT-Basic Examination Guide & CBT Test Syllabus (2026)',
    description:
      'Master the JFT-Basic examination with this comprehensive Prometric CBT guide covering test format, CEFR A2 criteria, 4 testing sections, and study techniques.',
    readTime: '9 min read',
    icon: BookOpen,
    badgeColor: 'bg-rose-50 text-japan-red border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/40',
  },
  {
    slug: 'ssw-nursing-care-kaigo-exam-guide',
    category: 'SSW Sector Blueprint',
    title: 'SSW Nursing Care (Kaigo) Skill & Japanese Evaluation Test Guide (2026)',
    description:
      'Complete syllabus and study guide for the 2 mandatory eldercare Prometric tests: Nursing Care Skills Evaluation and Nursing Care Japanese Language Evaluation.',
    readTime: '9 min read',
    icon: Heart,
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-400 dark:border-pink-900/40',
  },
  {
    slug: 'ssw-food-service-restaurant-exam-guide',
    category: 'SSW Sector Blueprint',
    title: 'SSW Food Service Industry Skill Test: Syllabus, Kitchen Safety & Customer Care',
    description:
      'Prepare for the OTAFF Food Service test in Japan. Covers HACCP kitchen hygiene, cooking methods, core temperatures, and Japanese omotenashi customer service.',
    readTime: '8 min read',
    icon: Utensils,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/40',
  },
  {
    slug: 'ssw-agriculture-farming-exam-guide',
    category: 'SSW Sector Blueprint',
    title: 'SSW Agriculture Evaluation Test Guide: Crop Cultivation & Livestock Farming',
    description:
      'Syllabus breakdown for the National Chamber of Agriculture CBT exam. Covers crop management, greenhouse automation, machinery safety, and animal husbandry.',
    readTime: '8 min read',
    icon: Leaf,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/40',
  },
  {
    slug: 'ssw-skill-test-guide',
    category: 'SSW Overview',
    title: 'Specified Skilled Worker (SSW No. 1) Skill Test Blueprint & 12 Sectors',
    description:
      'Detailed blueprint of Japan’s Specified Skilled Worker visa program, sector quotas, mandatory language + technical tests, and application roadmap.',
    readTime: '9 min read',
    icon: FileCheck2,
    badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/40',
  },
  {
    slug: 'jft-basic-30-day-study-plan',
    category: 'Study Timetables',
    title: '30-Day Intensive JFT-Basic Study Plan: From Zero to CEFR A2 Pass',
    description:
      'A structured, 4-week timetable for busy candidates balancing work and study. Day-by-day allocation for Hiragana/Katakana, Irodori lessons, and CBT mock tests.',
    readTime: '9 min read',
    icon: Rocket,
    badgeColor: 'bg-rose-50 text-japan-red border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/40',
  },
  {
    slug: 'essential-japanese-particles-guide-a2',
    category: 'Grammar Masterclass',
    title: 'Mastering Japanese Particles for JFT-Basic & SSW: WA vs GA, NI vs DE Guide',
    description:
      'Clear sentence-by-sentence explanations resolving the most confusing particle pairs in Japanese grammar: は vs が, に vs で, を, へ, から, and まで.',
    readTime: '8 min read',
    icon: Sparkles,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/40',
  },
  {
    slug: 'jft-basic-listening-comprehension-strategy',
    category: 'Listening Techniques',
    title: 'JFT-Basic Listening Comprehension: Techniques to Score 100% on Audio Prompts',
    description:
      'Master Section 3 where audio plays only once. Learn the 5-second question preview technique, conversational pivot traps, and daily shadowing routines.',
    readTime: '8 min read',
    icon: Headphones,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-900/40',
  },
  {
    slug: 'prometric-cbt-exam-day-checklist',
    category: 'Test Day Protocol',
    title: 'Prometric CBT Exam Day Rules & Checklist: What to Expect at the Test Center',
    description:
      'Chronological walkthrough of test day. Security checks, original passport rules, locker protocols, biometric photo capture, and CBT terminal navigation.',
    readTime: '8 min read',
    icon: Clock,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/40',
  },
  {
    slug: 'jac-textbooks-guide',
    category: 'Textbook Audio Guide',
    title: 'Official JAC Textbooks Guide: Construction SSW Evaluation Curriculum',
    description:
      'Educational guide to the 26 official construction sector textbooks published by JAC and MLIT. Learn how to study with synchronized neural audio.',
    readTime: '7 min read',
    icon: BookOpen,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/40',
  },
];

export default function GuidesHubPage() {
  const hubBreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.gakkounoshiken.site',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Study Guides',
        item: 'https://www.gakkounoshiken.site/guides',
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubBreadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-japan-red transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">Study Guides &amp; Syllabi</span>
      </nav>

      {/* Hero Header Banner */}
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-rose-950 text-white p-6 sm:p-12 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Knowledge Base • 12 In-Depth Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
          JFT-Basic &amp; SSW Examination Study Guides &amp; Syllabi
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
          Authoritative, peer-reviewed educational guides prepared by our academic editorial board to help Bangladeshi candidates master the Prometric Computer-Based Testing (CBT) interface, scoring mechanics, sector syllabi, and test day regulations.
        </p>

        {/* Editorial Standards Notice */}
        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Peer-Reviewed Content
          </span>
          <span>•</span>
          <span>Aligned with CEFR A2 &amp; Prometric Standards</span>
          <span>•</span>
          <span>Updated for 2026 Testing Cycles</span>
        </div>
      </header>

      {/* Guides Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            All Examination Guides (12)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Sorted by curriculum category
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.slug}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-japan-red/40 dark:hover:border-rose-500/40 p-6 shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border ${guide.badgeColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{guide.category}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors leading-snug">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {guide.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-japan-red dark:text-rose-400 hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Full Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Institutional Non-Affiliation Box */}
      <section className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">
          Educational Independence Notice:
        </p>
        <p>
          The guides published above are original educational and diagnostic articles produced independently by Gakkou No Shiken. We are not affiliated with, sponsored by, authorized by, or endorsed by The Japan Foundation, Prometric Inc., OTAFF, or the National Chamber of Agriculture. All official test bookings must be completed via prometric-jp.com.
        </p>
      </section>
    </div>
  );
}
