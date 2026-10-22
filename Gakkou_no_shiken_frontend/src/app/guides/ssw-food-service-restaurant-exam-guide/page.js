import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Coffee,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers,
  ShieldCheck,
  Sparkles,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';

export const metadata = {
  title: 'SSW Food Service Industry Skill Test: Syllabus, Kitchen Safety & Customer Care (2026)',
  description:
    'Complete preparation guide for the Specified Skilled Worker (SSW No. 1) Food Service Industry Skills Proficiency Test (外食業特定技能1号技能測定試験) administered by OTAFF via Prometric.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/ssw-food-service-restaurant-exam-guide',
  },
};

export default function SswFoodServiceGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who organizes the SSW Food Service examination for Japan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The examination is organized and certified by the Organization for Technical Assistance for Food Service Foreign Workers (OTAFF - 一般社団法人 外食業特定技能測定協会) and administered globally via Prometric Computer-Based Testing centers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for the SSW Food Service test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates must achieve a score of 65% or higher across the 45 multiple-choice questions within the 80-minute testing session.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the main topics covered in the Food Service exam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The exam covers three primary domains: (1) Hygiene Management & Food Safety (HACCP, 5S principles, norovirus prevention), (2) Food and Drink Preparation (cooking techniques, knife handling, temperature management), and (3) Customer Service (Japanese dining etiquette, polite keigo phrasing, allergy handling, cash register operations).',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SSW Food Service Industry Skill Test: Syllabus, Kitchen Safety & Customer Care',
    description:
      'Comprehensive preparation guide for the Specified Skilled Worker Food Service test in Japan covering OTAFF test format, HACCP food hygiene, kitchen preparation techniques, and omotenashi customer service.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/ssw-food-service-restaurant-exam-guide',
    datePublished: '2026-02-22T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">SSW Food Service Guide</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
          <Utensils className="w-3.5 h-3.5" />
          <span>SSW Sector Blueprint • Food Service (外食業)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          SSW Food Service Industry Skill Test: Syllabus &amp; Kitchen Safety
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Japan&apos;s restaurant, hotel, and dining sector offers thousands of opportunities under the <strong>Specified Skilled Worker (特定技能1号 - 外食業)</strong> visa program. This guide details the examination syllabus administered by <strong>OTAFF</strong> via Prometric CBT, critical HACCP sanitation rules, kitchen cooking methods, and Japanese customer service etiquette (おもてなし).
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Verified against OTAFF Examination Standards</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Duration</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">80 Minutes</div>
          <p className="text-xs text-slate-500">Computer-Based Testing (CBT) multiple-choice examination.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Question Volume</span>
          <div className="text-xl font-black text-japan-red">45 Questions</div>
          <p className="text-xs text-slate-500">Includes visual scenario illustrations and menu problems.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Passing Mark</span>
          <div className="text-xl font-black text-emerald-600">65% or Higher</div>
          <p className="text-xs text-slate-500">Instant on-screen result upon exam submission.</p>
        </div>
      </section>

      {/* Part 1: Three Core Testing Domains */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-japan-red" />
          <span>1. The Three Examination Knowledge Domains</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The OTAFF examination evaluates your readiness across every facet of Japanese commercial restaurant operations:
        </p>

        <div className="space-y-4">
          {/* Domain 1 */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-japan-red">
              <ShieldCheck className="w-4 h-4" />
              <span>Domain 1: Hygiene Management &amp; Food Safety (衛生管理)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This is the single most heavily tested subject area. Japanese food safety law requires strict adherence to international <strong>HACCP standards</strong> (Hazard Analysis Critical Control Point).
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>5S Principles:</strong> Seiri (整理), Seiton (整頓), Seisō (清掃), Seiketsu (清潔), Shitsuke (躾).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Temperature Danger Zone:</strong> Bacteria multiply rapidly between <strong>10°C and 60°C</strong>. Refrigeration must remain below 10°C; freezers below -15°C.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Norovirus Prevention:</strong> Strict handwashing protocol (minimum 30 seconds with foam soap), reporting vomiting or diarrhea immediately, hypochlorite sanitization.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Cross-Contamination (二次汚染):</strong> Dedicated color-coded cutting boards (raw meat = red, fish = blue, vegetables = green).</span>
              </li>
            </ul>
          </div>

          {/* Domain 2 */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-amber-700 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>Domain 2: Food &amp; Drink Preparation (調理)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Focuses on professional kitchen equipment, culinary terminology, and core Japanese cooking methods:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <li>• <strong>加熱調理 (Heating &amp; Cooking):</strong> Searing (焼く), boiling (茹でる), simmering (煮る), deep-frying (揚げる), steaming (蒸す).</li>
              <li>• <strong>Core Internal Temperatures:</strong> Ground meat must reach at least <strong>75°C for 1 minute</strong> (poultry: 85°C for 90 seconds).</li>
              <li>• <strong>Kitchen Knives:</strong> Safe grip techniques (猫の手 - cat claw hand position when slicing), sharpening angles, sanitizing knife racks.</li>
              <li>• <strong>Stock &amp; Seasonings:</strong> Dashi broths (konbu seaweed, katsuobushi bonito flakes), measuring spoons (大さじ15ml, 小さじ5ml).</li>
            </ul>
          </div>

          {/* Domain 3 */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-indigo-600 dark:text-indigo-400">
              <Coffee className="w-4 h-4" />
              <span>Domain 3: Customer Service &amp; Dining Room Management (接客全般)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Evaluates real-time hospitality etiquette, communication, and order management:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <li>• <strong>Greeting (挨拶):</strong> <em>&quot;Irasshaimase!&quot;</em> (Welcome!), <em>&quot;Arigatō gozaimashita!&quot;</em> (Thank you very much!).</li>
              <li>• <strong>Serving Etiquette:</strong> Serving dishes from the customer&apos;s left or right depending on dining style, never placing fingers inside bowl rims.</li>
              <li>• <strong>Allergen Alerts (特定原材料):</strong> Identifying the 8 statutory food allergens (Eggs, Milk, Wheat, Buckwheat, Peanuts, Shrimp, Crab, Walnuts).</li>
              <li>• <strong>Cashier &amp; POS:</strong> Presenting change with two hands, verifying banknotes politely.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Part 2: Mandatory Language Requirement */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-japan-red" />
          <span>2. Dual Requirement: JFT-Basic + Food Service CBT</span>
        </h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            To lodge an official application for the Specified Skilled Worker (SSW No. 1) visa with the Japanese Immigration Services Agency (出入国在留管理庁), candidates must present two valid pass certificates:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">1. Language Certificate</span>
              <p className="text-xs text-slate-500 pt-1">JFT-Basic (200+ points) OR JLPT N4 / N3 / N2 / N1.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">2. Skill Test Certificate</span>
              <p className="text-xs text-slate-500 pt-1">Food Service Skills Proficiency Test (OTAFF - 65%+ pass mark).</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Practice SSW Skill Mock Tests</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Familiarize yourself with authentic multiple-choice Prometric CBT questions, hygiene scenarios, and real-time exam timers.
          </p>
        </div>
        <Link
          href="/ssw-skill-test"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>View SSW Practice Tests</span>
        </Link>
      </section>
    </article>
  );
}
