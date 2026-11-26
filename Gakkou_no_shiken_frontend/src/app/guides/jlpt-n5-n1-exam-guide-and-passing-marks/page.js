import React from 'react';
import Link from 'next/link';
import { GraduationCap, CheckCircle2, Clock, Award, ArrowRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Complete JLPT (N5–N1) Exam Guide, Syllabus & Passing Marks (2026)',
  description:
    'Everything you need to know about the Japanese-Language Proficiency Test (JLPT) N5, N4, N3, N2 & N1: exam sections, exact passing scores out of 180, kanji/vocabulary targets, study hours, and free online mock tests.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jlpt-n5-n1-exam-guide-and-passing-marks',
  },
};

const LEVELS = [
  { level: 'JLPT N5', cefr: 'A1', pass: '80 / 180', kanji: '~100', vocab: '~800', hours: '150 hrs', time: '90 min' },
  { level: 'JLPT N4', cefr: 'A2', pass: '90 / 180', kanji: '~300', vocab: '~1,500', hours: '300 hrs', time: '115 min' },
  { level: 'JLPT N3', cefr: 'B1', pass: '95 / 180', kanji: '~650', vocab: '~3,700', hours: '450 hrs', time: '140 min' },
  { level: 'JLPT N2', cefr: 'B2', pass: '90 / 180', kanji: '~1,000', vocab: '~6,000', hours: '600 hrs', time: '155 min' },
  { level: 'JLPT N1', cefr: 'C1', pass: '100 / 180', kanji: '~2,000', vocab: '~10,000', hours: '900+ hrs', time: '170 min' },
];

export default function JlptExamGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the passing marks for JLPT N5, N4, N3, N2, and N1?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All JLPT levels are scored out of 180. Overall pass marks are: N5 = 80/180, N4 = 90/180, N3 = 95/180, N2 = 90/180, and N1 = 100/180. Candidates must also meet sectional minimum scores.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many times a year is the JLPT exam held?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The JLPT is administered twice a year worldwide, on the first Sunday of July and the first Sunday of December.',
        },
      },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto space-y-8 py-6 sm:py-10 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-xs font-black uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>JLPT Complete Blueprint • 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Complete JLPT (N5–N1) Exam Guide, Syllabus &amp; Passing Marks
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          The Japanese-Language Proficiency Test (JLPT) is the world&apos;s most widely recognized Japanese certification for study, work visas, and Specified Skilled Worker (SSW) eligibility. Here is the exact scoring table, study target, and free mock test roadmap for every level.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/jlpt"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-sm font-extrabold shadow-sm"
          >
            <span>Practice Free JLPT Mock Tests</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold"
          >
            <BookOpen className="w-4 h-4" />
            <span>Study N5 &amp; N4 Lessons</span>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          1. JLPT N5 to N1 Passing Scores &amp; Study Requirements
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-black">
              <tr>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">CEFR</th>
                <th className="p-3.5">Pass Mark</th>
                <th className="p-3.5">Kanji</th>
                <th className="p-3.5">Vocabulary</th>
                <th className="p-3.5">Study Hours</th>
                <th className="p-3.5">Exam Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              {LEVELS.map((r) => (
                <tr key={r.level}>
                  <td className="p-3.5 font-black text-[#DB1A1A]">{r.level}</td>
                  <td className="p-3.5">{r.cefr}</td>
                  <td className="p-3.5 font-black">{r.pass}</td>
                  <td className="p-3.5">{r.kanji}</td>
                  <td className="p-3.5">{r.vocab}</td>
                  <td className="p-3.5">{r.hours}</td>
                  <td className="p-3.5">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-[#DB1A1A]" />
            Sectional Pass Rule (Don&apos;t Miss This!)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Even if your total score exceeds the overall pass mark (for example, 105/180 on N4), you must still score at least the sectional minimum (19/60 in Listening and 38/120 in Language Knowledge &amp; Reading for N5/N4; 19/60 per section for N3–N1) to pass.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2C687B]" />
            How to Prepare Effectively
          </h3>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />Take the 3-minute JLPT Placement Test on Gakkou No Shiken to find your exact starting level.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />Practice 1–2 timed mock sets daily and review 7-language explanations for every mistake.</li>
          </ul>
        </div>
      </section>

      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2C687B] to-[#DB1A1A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black">Ready to test your JLPT level right now?</h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Access 1,935+ free JLPT N5–N1 mock sets with instant scoring and Bangla/English explanations.
          </p>
        </div>
        <Link
          href="/jlpt"
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-black text-sm shrink-0 hover:bg-slate-100 transition"
        >
          Open JLPT Mock Hub →
        </Link>
      </div>
    </article>
  );
}
