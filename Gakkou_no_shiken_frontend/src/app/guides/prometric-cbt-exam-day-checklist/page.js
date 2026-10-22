import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HelpCircle,
  Key,
  Laptop,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Prometric CBT Exam Day Rules & Checklist: What to Expect at the Test Center (2026)',
  description:
    'Comprehensive chronological walkthrough of test day at a Prometric Computer-Based Testing center. Learn check-in rules, biometric photo protocols, prohibited items, locker procedures, and CBT terminal navigation.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/prometric-cbt-exam-day-checklist',
  },
};

export default function PrometricExamDayChecklistPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What identity documents must I bring on exam day?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You MUST bring your original, valid physical International Passport (MRP or E-Passport) matching the name on your Prometric appointment confirmation letter. National ID (NID) cards, student IDs, driving licenses, or photocopies are strictly rejected.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are watches or pens allowed inside the Prometric testing room?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All watches (analog, digital, and smartwatches), personal pens, mechanical pencils, paper notes, mobile phones, and electronic devices are strictly prohibited inside the testing room and must be stored in the provided secure lockers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I go back to change answers in a previous section of the CBT test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. In Prometric CBT exams, questions are grouped into locked sections. You can review and change answers within your current active section while the section timer is running. Once you advance or the timer expires, previous sections lock permanently.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Prometric CBT Exam Day Rules & Checklist: What to Expect at the Test Center',
    description:
      'Detailed chronological checklist for candidates taking Prometric computer-based examinations in Bangladesh and globally, covering security check-in, software navigation, and scoring.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/prometric-cbt-exam-day-checklist',
    datePublished: '2026-03-12T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">Exam Day Checklist</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Candidate Protocol • Test Center Checklist</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Prometric CBT Exam Day Rules &amp; Checklist: What to Expect
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Walking into a Prometric testing center for the first time can be intimidating. High-security biometric scans, CCTV monitoring, and digital cubicles demand thorough preparation. This chronological manual explains every protocol from the moment you wake up on exam day to your digital score delivery.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Verified Prometric Test Center Procedures</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Chronological Checklist Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-japan-red" />
          <span>Chronological Exam Day Timeline</span>
        </h2>

        {/* Phase 1: Night Before */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-japan-red text-white flex items-center justify-center text-xs">1</span>
              <span>The Night Before: Document Verification</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">T-Minus 12 Hours</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>• <strong>Original Physical Passport:</strong> Confirm it has not expired and has at least 6 months remaining validity. Place it in a safe folder.</li>
            <li>• <strong>Appointment Confirmation Letter:</strong> Print a physical copy or save the PDF on your smartphone. Verify your appointment time and center code (e.g. IDB Bhaban, Dhaka).</li>
            <li>• <strong>Rest &amp; Hydration:</strong> Avoid late-night cramming. Your brain requires cognitive agility to process 20 rapid listening comprehension tracks.</li>
          </ul>
        </div>

        {/* Phase 2: Arrival */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-japan-red text-white flex items-center justify-center text-xs">2</span>
              <span>Arrival at the Center: The 30-Minute Rule</span>
            </h3>
            <span className="text-xs text-japan-red font-bold">T-Minus 30 Minutes</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Prometric enforces a zero-tolerance policy for late arrivals. If your exam is scheduled for 10:00 AM, you must be in the waiting lobby by <strong>9:30 AM</strong>. Arriving after 9:45 AM will cause the registration software to lock automatically, resulting in exam forfeiture.
          </p>
        </div>

        {/* Phase 3: Biometrics & Locker */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-japan-red text-white flex items-center justify-center text-xs">3</span>
              <span>Biometric Security &amp; Locker Storage</span>
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Check-in Desk</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-japan-red" />
                <span>Biometric Capture</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Staff inspect your passport, take an on-site digital headshot photo, and register your electronic signature. This photo will be printed directly onto your official Japanese score report.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-japan-red" />
                <span>Locker Protocol</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                You are assigned a key locker. All mobile devices, analog/smartwatches, wallets, food, water, tissues, jackets, and stationery must be stored inside. You take only your passport and locker key into the room.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 4: Inside the Terminal */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-japan-red text-white flex items-center justify-center text-xs">4</span>
              <span>Inside the Computerized Cubicle</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Exam Session</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>• <strong>Hardware Check:</strong> Verify that the mouse moves smoothly and that the headphones output sound clearly during the pre-test audio test screen. Adjust headphone volume before clicking &quot;Start&quot;.</li>
            <li>• <strong>The Non-Disclosure Agreement (NDA):</strong> You have 2 minutes to click &quot;Agree&quot; to Japanese copyright regulations. Always click &quot;Agree&quot; promptly to avoid session timeouts.</li>
            <li>• <strong>Section Pacing:</strong> The countdown clock in the upper-right corner displays time remaining in the current active section. Keep a steady pace of 45 seconds per question in Sections 1 and 2.</li>
          </ul>
        </div>
      </section>

      {/* Prohibited Items Warning */}
      <section className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 text-xs sm:text-sm text-rose-950 dark:text-rose-200">
        <div className="flex items-center gap-2 font-black text-sm text-japan-red">
          <ShieldAlert className="w-5 h-5" />
          <span>Zero-Tolerance Cheating Policy</span>
        </div>
        <p className="leading-relaxed">
          Prometric testing rooms are continuously recorded via high-definition ceiling cameras and physical proctor walk-throughs. Accessing a phone, attempting to view other monitors, talking, or taking notes on your hands will lead to immediate exam termination, police notification, and a permanent multi-year ban from taking any Japanese immigration tests.
        </p>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Practice on the Exact CBT Layout</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Eliminate exam day anxiety. Practice on our high-fidelity Prometric CBT simulator with real-time countdown clocks.
          </p>
        </div>
        <Link
          href="/jft-basic"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Start Practice CBT</span>
        </Link>
      </section>
    </article>
  );
}
