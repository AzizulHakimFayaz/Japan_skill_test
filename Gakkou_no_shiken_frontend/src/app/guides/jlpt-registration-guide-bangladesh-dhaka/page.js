import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'JLPT Registration Guide in Bangladesh (Dhaka): Dates, Fees & Mock Prep (2026)',
  description:
    'Step-by-step JLPT registration guide for Bangladeshi candidates in Dhaka (University of Dhaka / JUAAB). Learn July & December exam dates, required documents, seat booking tips, and free JLPT N5–N1 mock tests.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jlpt-registration-guide-bangladesh-dhaka',
  },
};

export default function JlptDhakaRegistrationPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is the JLPT exam held in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In Bangladesh, the JLPT is administered in Dhaka by the Japanese Universities Alumni Association in Bangladesh (JUAAB) in coordination with the Japan Foundation and the Embassy of Japan.',
        },
      },
      {
        '@type': 'Question',
        name: 'When does JLPT registration open in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Registration for the July JLPT typically opens in March, and registration for the December JLPT typically opens in August. Seats fill very quickly, so candidates should prepare their photo and NID/Passport early.',
        },
      },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto space-y-8 py-6 sm:py-10 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>Bangladesh / Dhaka Candidate Guide</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          JLPT Registration Guide in Bangladesh (Dhaka): Dates, Documents &amp; Free Prep
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Every July and December, thousands of students in Bangladesh sit for JLPT N5, N4, N3, N2, and N1 in Dhaka. Follow this checklist so you never miss a registration window and walk into exam day fully prepared.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#DB1A1A]" />
            Annual Exam Schedule
          </h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li><strong>July Session:</strong> Registration usually opens in March; exam held on the first Sunday of July.</li>
            <li><strong>December Session:</strong> Registration usually opens in August; exam held on the first Sunday of December.</li>
            <li><strong>Tip:</strong> Set your Planned Exam Date in your Gakkou No Shiken Student Portal to get a live countdown!</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Required Documents Checklist
          </h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li>Valid National ID (NID), Passport, or Birth Certificate (name must match your admit card).</li>
            <li>Recent passport-size digital photo with plain light background.</li>
            <li>Active email &amp; mobile number for bKash/online fee payment confirmation and test voucher download.</li>
          </ul>
        </div>
      </section>

      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black">Practice Free JLPT N5–N1 Mock Tests with Bangla Explanations</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Over 32,800+ questions across 1,935+ sets — 100% free for Bangladeshi students &amp; academies.
          </p>
        </div>
        <Link
          href="/jlpt"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white font-black text-sm shrink-0"
        >
          <span>Start JLPT Practice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
