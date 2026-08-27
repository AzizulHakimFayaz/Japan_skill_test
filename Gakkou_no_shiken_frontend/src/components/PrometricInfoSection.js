'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';
import {
  MapPin,
  Calendar,
  CreditCard,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const CENTERS = [
  {
    city: 'Dhaka',
    name: 'Prometric Test Center - Dhaka (Banani)',
    address: 'Green Deluxe, Plot #67/D, Block-E, Road #11, Banani, Dhaka-1213, Bangladesh',
    hours: 'Mon - Fri: 9:00 AM - 5:00 PM (Exam slots per schedule)',
    facilities: 'Soundproof listening booths, high-speed CBT terminals, lockers',
    status: 'Active Booking Center',
  },
  {
    city: 'Chittagong',
    name: 'Prometric Test Center - Chittagong (Agrabad)',
    address: 'World Trade Center Chittagong, 102-103 Agrabad Commercial Area, Chittagong-4100',
    hours: 'Selected weekday slots (Check Prometric Japan website)',
    facilities: 'Standard Prometric CBT testing terminals with HD headphones',
    status: 'Active Booking Center',
  },
];

const GUIDELINES = [
  {
    icon: FileCheck2,
    title: 'Valid Passport / ID Required',
    desc: 'You must bring the exact physical passport or National ID registered with your Prometric account.',
  },
  {
    icon: Clock,
    title: 'Arrive 30 Mins Early',
    desc: 'Biometric registration, locker check-in, and seat assignment take approximately 20-30 minutes.',
  },
  {
    icon: CreditCard,
    title: 'Exam Registration Fee',
    desc: 'Official Prometric fee is approx ~7,000 JPY (BDT ~5,500 depending on exchange rates).',
  },
  {
    icon: ShieldCheck,
    title: 'Instant CBT Results Sheet',
    desc: 'You receive your official provisional score sheet printed directly at the test venue immediately upon exam completion.',
  },
];

export default function PrometricInfoSection() {
  return (
    <section id="test-centers" className="space-y-8 sm:space-y-12">
      <ScrollReveal variant="up" duration={600}>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Test Venues &amp; Booking</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Prometric CBT Centers in Bangladesh
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Essential venue details, registration instructions, and official Prometric examination center guidelines for Dhaka and Chittagong candidates.
          </p>
        </div>
      </ScrollReveal>

      {/* Centers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CENTERS.map((item, idx) => (
          <ScrollReveal key={idx} variant="up" delay={idx * 100} duration={600}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-md hover:shadow-xl hover-lift transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-black text-xs uppercase">
                  {item.city} Venue
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{item.status}</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-japan-red flex-shrink-0 mt-0.5" />
                  <span>{item.address}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Facilities: {item.facilities}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Prometric Exam Day Checklist */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-japan-red" />
          <span>Prometric Examination Day Checklist</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDELINES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 text-japan-red flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Book official Prometric CBT slots at Prometric Japan Portal:
          </span>
          <a
            href="https://www.prometric-jp.com/en/jftbasic/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-japan-red hover:text-rose-600 dark:hover:text-rose-400 underline transition-colors"
          >
            <span>Prometric Japan Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
