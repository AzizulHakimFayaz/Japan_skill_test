import React from 'react';
import Link from 'next/link';
import { Scale, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'JFT-Basic vs JLPT N4: Differences, Pass Rate & Which Exam to Choose (2026)',
  description:
    'Comparing JFT-Basic (A2) and JLPT N4 for Japan Specified Skilled Worker (SSW) visa and study: exam frequency, CBT vs paper format, passing marks, difficulty, and free mock tests.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jft-basic-vs-jlpt-n4-which-exam-should-you-take',
  },
};

export default function JftVsJlptGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is JFT-Basic easier than JLPT N4?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Both target CEFR A2 level Japanese, but JFT-Basic focuses more on practical everyday conversation and workplace listening with a 60-minute computer-based format, whereas JLPT N4 tests deeper grammar structures and longer reading passages on paper.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are both JFT-Basic and JLPT N4 accepted for the Japan SSW visa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Passing either JFT-Basic (200/250) or JLPT N4 (90/180) fulfills the general Japanese language requirement for Japan’s Specified Skilled Worker (SSW Type 1) visa.',
        },
      },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto space-y-8 py-6 sm:py-10 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#DB1A1A] dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>Exam Comparison Guide</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          JFT-Basic vs JLPT N4: Which Japanese Exam Should You Take?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Planning to move to Japan under the Specified Skilled Worker (SSW) visa or student track? Compare JFT-Basic and JLPT N4 side-by-side on exam dates, scoring, difficulty, and career value.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-black">
            <tr>
              <th className="p-3.5">Feature</th>
              <th className="p-3.5 text-[#DB1A1A]">JFT-Basic (A2)</th>
              <th className="p-3.5 text-[#2C687B] dark:text-[#8CC7C4]">JLPT N4</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
            <tr><td className="p-3.5 font-bold">Format</td><td className="p-3.5">Computer-Based Test (Prometric CBT)</td><td className="p-3.5">Paper-Based (OMR Sheet)</td></tr>
            <tr><td className="p-3.5 font-bold">Exam Frequency</td><td className="p-3.5">Multiple times every year (frequent slots)</td><td className="p-3.5">Twice a year (July &amp; December)</td></tr>
            <tr><td className="p-3.5 font-bold">Result Speed</td><td className="p-3.5">Instant score on screen + official PDF in days</td><td className="p-3.5">~2 months after exam</td></tr>
            <tr><td className="p-3.5 font-bold">Pass Mark</td><td className="p-3.5">200 / 250 points</td><td className="p-3.5">90 / 180 points (+ sectional minimums)</td></tr>
            <tr><td className="p-3.5 font-bold">Duration</td><td className="p-3.5">60 minutes</td><td className="p-3.5">115 minutes</td></tr>
            <tr><td className="p-3.5 font-bold">Best For</td><td className="p-3.5">Fast SSW Work Visa entry</td><td className="p-3.5">SSW Visa + Universities &amp; Global Employers</td></tr>
          </tbody>
        </table>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Choose JFT-Basic if:</h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#DB1A1A] shrink-0 mt-0.5" />You want fast SSW visa processing without waiting 6 months for July/December.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#DB1A1A] shrink-0 mt-0.5" />You prefer practical daily-life Japanese and instant exam results.</li>
          </ul>
          <Link href="/jft-basic" className="inline-flex items-center gap-1.5 text-xs font-black text-[#DB1A1A] hover:underline pt-1">
            <span>Practice JFT-Basic Mock Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Choose JLPT N4 (or N3–N1) if:</h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2C687B] shrink-0 mt-0.5" />You plan to apply to Japanese language schools, universities, or corporate jobs.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2C687B] shrink-0 mt-0.5" />You want a globally recognized lifetime certificate across N5 through N1.</li>
          </ul>
          <Link href="/jlpt" className="inline-flex items-center gap-1.5 text-xs font-black text-[#2C687B] dark:text-[#8CC7C4] hover:underline pt-1">
            <span>Practice Free JLPT N5–N1 Mock Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </article>
  );
}
