import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  HelpCircle,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Sun,
  Tractor,
} from 'lucide-react';

export const metadata = {
  title: 'SSW Agriculture Evaluation Test Guide: Crop Cultivation & Livestock Farming (2026)',
  description:
    'Comprehensive syllabus and study guide for the Specified Skilled Worker (SSW No. 1) Agriculture Skill Assessment Test (農業技能測定試験) covering crop cultivation, greenhouse horticulture, and livestock care.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/ssw-agriculture-farming-exam-guide',
  },
};

export default function SswAgricultureGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the two sub-categories in the SSW Agriculture examination?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Agriculture examination is split into two specialized sub-fields: (1) Crop Cultivation (耕種農業 - open-field vegetables, fruit orchards, greenhouse horticulture, rice and grain crops), and (2) Livestock Farming (畜産農業 - dairy cattle, beef cattle, hog farming, and poultry). Candidates must select and pass the exam corresponding to their employment sector.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the passing score for the Agriculture Skills Evaluation Test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates must achieve a score of 60% or higher on the multiple-choice computer-based test to obtain the official pass certificate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who organizes the Japanese Agriculture SSW exam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The examination is organized and accredited by the National Chamber of Agriculture (一般社団法人 全国農業会議所) under the supervision of the Ministry of Agriculture, Forestry and Fisheries (MAFF) and administered via Prometric CBT centers.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SSW Agriculture Evaluation Test Guide: Crop Cultivation & Livestock Farming',
    description:
      'Complete study guide for the Specified Skilled Worker Agriculture skill test covering crop management, greenhouse automation, agricultural machinery safety, livestock health, and Prometric CBT test patterns.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/ssw-agriculture-farming-exam-guide',
    datePublished: '2026-02-26T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">SSW Agriculture Guide</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>SSW Sector Blueprint • Agriculture (農業)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          SSW Agriculture Evaluation Test Guide: Crop &amp; Livestock Farming
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Japan&apos;s agricultural sector relies on technical talent to maintain food production across modern greenhouse complexes and livestock farms. This blueprint provides a complete syllabus breakdown for the <strong>Specified Skilled Worker (特定技能1号 - 農業)</strong> test, covering soil science, machinery safety, and animal husbandry.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Aligned with National Chamber of Agriculture Guidelines</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Duration</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">60 Minutes</div>
          <p className="text-xs text-slate-500">Computer-Based Testing (CBT) multiple-choice format.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Passing Threshold</span>
          <div className="text-xl font-black text-emerald-600">60% or Above</div>
          <p className="text-xs text-slate-500">Scaled across technical theory and practical judgement.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Sub-Specialties</span>
          <div className="text-xl font-black text-japan-red">2 Distinct Fields</div>
          <p className="text-xs text-slate-500">Crop Cultivation (耕種) vs. Livestock Farming (畜産).</p>
        </div>
      </section>

      {/* Part 1: Crop Cultivation Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-600" />
          <span>Field 1: Crop Cultivation (耕種農業)</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Candidates choosing the Crop Cultivation pathway are evaluated on horticultural science, plant lifecycle management, and farm machinery operations:
        </p>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">A. Soil Management &amp; Fertilization (土作りと施肥):</h4>
            <p>Understanding soil pH (acidity vs alkalinity), organic compost application (堆肥), essential nutrients (Nitrogen, Phosphorus, Potassium - N-P-K), and moisture drainage systems.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">B. Greenhouse Horticulture (施設園芸):</h4>
            <p>Modern climate control inside plastic vinyl houses (ビニールハウス): ventilation management (換気), automated irrigation drippers, temperature regulation, and artificial lighting.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">C. Harvesting, Sorting &amp; Packaging (収穫・選別・調製):</h4>
            <p>Determining peak ripeness (適期収穫), careful harvesting to avoid bruising, grading vegetables by size/weight standards, and hygienic packing for wholesale markets.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">D. Tractor &amp; Machine Safety (農業機械の安全操作):</h4>
            <p>Preventing machinery rollovers (ROPS safety frames), power take-off (PTO) shaft entanglement hazards, and daily engine oil and hydraulic checks.</p>
          </div>
        </div>
      </section>

      {/* Part 2: Livestock Farming Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Tractor className="w-6 h-6 text-japan-red" />
          <span>Field 2: Livestock Farming (畜産農業)</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Candidates specializing in animal husbandry work across dairy farms, beef cattle ranches, swine facilities, and poultry houses:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Dairy &amp; Cattle Care (酪農・肉用牛)</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>Milking Hygiene (搾乳衛生):</strong> Sanitizing udders before attaching teat cups, post-milking teat dipping to prevent mastitis (乳房炎).</li>
              <li>• <strong>Feed Management (給餌):</strong> Balancing roughage (牧草・サイレージ) and concentrated grain feed.</li>
              <li>• <strong>Calf Nursing (子牛の哺乳):</strong> Colostrum feeding protocols and thermal heat lamps.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Swine &amp; Poultry Management (養豚・養鶏)</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>Biosecurity (伝染病予防):</strong> Footbath disinfection, vehicle wash stations to prevent African Swine Fever and Avian Influenza.</li>
              <li>• <strong>Barn Climate Control:</strong> Automated ventilation fans, ammonia gas reduction, waste slurry scraping.</li>
              <li>• <strong>Egg Collection:</strong> Automated belt monitoring, sorting cracked shells, humidity control.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Part 3: Farm Safety and Heatstroke */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-500" />
          <span>3. Workplace Safety &amp; Heatstroke Prevention (熱中症対策)</span>
        </h2>
        <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>High-Frequency Test Topics: Occupational Health</span>
          </div>
          <p>
            Working in Japanese summer greenhouses or open fields requires rigorous safety protocols that appear frequently on the Prometric CBT exam:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Hydration &amp; Salt Replenishment (水分・塩分補給):</strong> Taking scheduled breaks before feeling thirsty; drinking water with electrolytes every 20–30 minutes.</li>
            <li><strong>Wet Bulb Globe Temperature (WBGT):</strong> Monitoring heat stress indices to suspend outdoor labor during &quot;Danger&quot; alert levels.</li>
            <li><strong>Pesticide Spraying Safety (農薬散布):</strong> Wearing certified respirators, waterproof gloves, eye goggles, and checking wind direction before application.</li>
          </ul>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Practice Agricultural Terminology &amp; CBT Tests</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Train with our free interactive quizzes, flashcards, and Prometric CBT mock exams tailored for SSW agricultural candidates.
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
