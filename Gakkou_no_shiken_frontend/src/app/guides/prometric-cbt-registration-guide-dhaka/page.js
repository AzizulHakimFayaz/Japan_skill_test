import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  HelpCircle,
  Laptop,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const metadata = {
  title: 'How to Register for Prometric CBT Exams in Dhaka, Bangladesh (2026 Step-by-Step Guide)',
  description:
    'Complete step-by-step tutorial on registering for JFT-Basic and SSW skill evaluation tests in Dhaka. Learn Prometric ID creation, IDB Bhaban test venue details, exam fees in BDT, passport rules, and payment methods.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/prometric-cbt-registration-guide-dhaka',
  },
};

export default function PrometricRegistrationGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is the Prometric CBT test center located in Dhaka, Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The accredited Prometric CBT test center in Dhaka is located at IDB Bhaban, E/8-A Rokeya Sarani, Sher-e-Bangla Nagar, Agargaon, Dhaka-1207. It is directly accessible via the Agargaon Metro Rail Station.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I take the JFT-Basic or SSW exam with a Bangladeshi National ID (NID) card?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Prometric Japan requires an original, valid International Machine-Readable Passport (MRP) or E-Passport with at least 6 months of validity. National Identity Cards (NID) or birth certificates are strictly not accepted for Prometric CBT check-in.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does the JFT-Basic exam cost in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The official test fee for JFT-Basic in Bangladesh is approximately 3,000 to 3,500 BDT (equivalent to approximately 3,500 Japanese Yen), payable online via dual-currency credit/debit card or via pre-purchased Prometric exam vouchers from authorized training institutions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How early should I arrive at the Prometric test center on exam day?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Candidates must arrive at least 30 minutes before the scheduled appointment time for biometric verification, photo capture, digital signature capture, and locker storage of personal belongings.',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Register for Prometric CBT Exams in Dhaka, Bangladesh (Step-by-Step 2026 Guide)',
    description:
      'Comprehensive registration guide for Prometric Computer-Based Testing (CBT) in Dhaka, Bangladesh covering Prometric ID setup, venue details at IDB Bhaban, payment methods, and exam day regulations.',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/prometric-cbt-registration-guide-dhaka',
    datePublished: '2026-02-10T00:00:00Z',
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
        <span className="text-slate-800 dark:text-slate-200">Prometric Dhaka Registration</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Laptop className="w-3.5 h-3.5" />
          <span>Prometric CBT Registration Blueprint • Bangladesh 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          How to Register for Prometric CBT Exams in Dhaka, Bangladesh
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          A definitive, step-by-step candidate manual for booking your <strong>Japan Foundation Test for Basic Japanese (JFT-Basic)</strong> and <strong>Specified Skilled Worker (SSW - 特定技能)</strong> Computer-Based Testing (CBT) seat in Dhaka. Learn account setup, ID requirements, venue logistics at IDB Bhaban, payment methods, and test day protocols.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>Verified for Prometric Dhaka Center</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Primary Center</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">IDB Bhaban, Dhaka</div>
          <p className="text-xs text-slate-500">Agargaon Metro Station access. Modern secure terminal cubicles.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Standard Test Fee</span>
          <div className="text-xl font-black text-japan-red">~3,000 – 3,500 BDT</div>
          <p className="text-xs text-slate-500">Dual-currency international card or authorized voucher code.</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Mandatory Document</span>
          <div className="text-xl font-black text-emerald-600">Original Passport</div>
          <p className="text-xs text-slate-500">Minimum 6 months validity. NID cards are NOT accepted.</p>
        </div>
      </section>

      {/* Step 1: Account Creation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-japan-red" />
          <span>Step 1: Creating Your Official Prometric ID</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Before you can view available dates or schedule an exam seat, you must register a personal Prometric ID on the official Japan portal (<a href="https://www.prometric-jp.com/en/" target="_blank" rel="noopener noreferrer" className="text-japan-red underline font-bold">prometric-jp.com</a>). This ID remains permanently tied to your passport number and your future Japanese immigration records.
        </p>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Critical Data Matching Rules During Registration:
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Surname and Given Names:</strong> Must match your passport letter-for-letter. If your passport says &quot;MOHAMMAD&quot;, do not write &quot;MD&quot; or &quot;MD.&quot; on the Prometric portal. Mismatches will result in immediate refusal at the test door with zero refund.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Date of Birth:</strong> Ensure format is Year/Month/Day (YYYY/MM/DD) as standard on Japanese software systems.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Active Email Address:</strong> Use a personal Gmail account you can access on your phone. Prometric sends appointment confirmations, seat numbers, and digital score notices directly to this address.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Step 2: Test Center Details */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MapPin className="w-6 h-6 text-japan-red" />
          <span>Step 2: Test Center Location in Dhaka</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The authorized Prometric CBT test center in Bangladesh is located inside the prestigious Islamic Development Bank (IDB) complex in Sher-e-Bangla Nagar.
        </p>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Facility Name:</span>
              <p className="text-slate-600 dark:text-slate-400">Prometric Testing Center - Dhaka Center</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Address:</span>
              <p className="text-slate-600 dark:text-slate-400">IDB Bhaban, E/8-A Rokeya Sarani, Sher-e-Bangla Nagar, Agargaon, Dhaka-1207</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Transit Recommendation:</span>
              <p className="text-slate-600 dark:text-slate-400">Take the Dhaka Metro Rail Line 6 to <strong>Agargaon Metro Station</strong>. Walk 3 minutes west directly to IDB Bhaban.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Venue Environment:</span>
              <p className="text-slate-600 dark:text-slate-400">Air-conditioned, CCTV-monitored, partitioned individual computer terminals with noise-dampening headsets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Payment Methods & Vouchers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-japan-red" />
          <span>Step 3: Test Fees and Payment Methods in Bangladesh</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Candidates in Bangladesh have two primary options for clearing the test fee:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-japan-red font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Option A: International Dual-Currency Card</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If you or an immediate family member has a credit or debit card endorsed for international foreign currency transactions (USD/JPY) with passport endorsement from a Bangladeshi bank (e.g. City Bank, EBL, BRAC Bank, Standard Chartered), you can pay directly online at the moment of booking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Option B: Prometric Exam Vouchers</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Candidates without international cards can purchase an official Prometric Voucher Code in local currency (BDT) through designated Japanese language institutes, manpower agencies, or authorized test voucher distributors in Dhaka. Enter the voucher alphanumeric code at checkout to settle the registration fee instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Step 4: Seat Availability & Timing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-japan-red" />
          <span>Step 4: Booking Cycles and Seat Rush Strategy</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Due to immense demand from candidates pursuing the Specified Skilled Worker (SSW) visa program, test seats in Dhaka often fill within hours of release.
        </p>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider text-japan-red">Release Schedule:</span>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Prometric typically opens booking dates around the middle of each month for the upcoming testing window. Official booking release times usually occur at <strong>10:00 AM JST (7:00 AM Bangladesh Standard Time)</strong>.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Cancellation &amp; Reschedule Policy:</span>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              You can reschedule your exam date or time free of penalty up to <strong>3 business days</strong> before your appointed testing date. Within 3 business days, changes are completely locked, and absences are marked as forfeiture.
            </p>
          </div>
        </div>
      </section>

      {/* Step 5: Test Day Rules & Arrival */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-japan-red" />
          <span>Step 5: Exam Day Check-in Rules at IDB Bhaban</span>
        </h2>
        <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Strict Security &amp; Biometric Protocol</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside">
            <li><strong>Arrive 30 minutes early:</strong> Late arrivals are barred entry with zero exceptions.</li>
            <li><strong>Original Passport Only:</strong> Must present the exact original physical passport used during registration. Photocopies or digital images are invalid.</li>
            <li><strong>Locker Protocol:</strong> All personal items, including mobile phones, analog watches, smartwatches, wallets, pens, and paper, must be locked in the center lockers.</li>
            <li><strong>Biometric Check:</strong> Staff will capture your digital photograph and electronic signature before assigning your cubicle terminal.</li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Ready to Experience the Prometric CBT Terminal?</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Practice with our authentic computer-based testing engine. Includes real-time 60-minute section countdowns and native Japanese audio dialogues.
          </p>
        </div>
        <Link
          href="/jft-basic"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Start CBT Simulator</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </section>
    </article>
  );
}
