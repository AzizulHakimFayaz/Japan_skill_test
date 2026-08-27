'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';
import {
  Star,
  Quote,
  CheckCircle2,
  Award,
  Sparkles,
  MapPin,
} from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Tanvir Hossain',
    location: 'Dhaka, Bangladesh',
    score: '238 / 250 (A2 Pass)',
    exam: 'JFT-Basic A2 Exam',
    destination: 'Tokyo, Japan',
    role: 'Specified Skilled Worker (Caregiving)',
    quote: 'The CBT simulator screen on Gakkou No Shiken was 100% identical to the Prometric center in Banani, Dhaka! The 1-play listening practice gave me huge confidence. Highly recommended!',
    rating: 5,
    avatar: 'T',
    color: 'from-rose-500 to-red-600',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Chittagong, Bangladesh',
    score: '242 / 250 (A2 Pass)',
    exam: 'SSW Food Service Evaluation',
    destination: 'Osaka, Japan',
    role: 'Restaurant & Hospitality Visa',
    quote: 'Having the Bengali translation lens while reviewing mistakes helped me master technical terms in hygiene and customer service in just 2 weeks of practice.',
    rating: 5,
    avatar: 'N',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    name: 'Mehedi Hasan',
    location: 'Sylhet, Bangladesh',
    score: '225 / 250 (A2 Pass)',
    exam: 'SSW Agriculture Skill Test',
    destination: 'Hokkaido, Japan',
    role: 'Crop Farming Specialist',
    quote: 'I passed on my very first attempt at the Dhaka Prometric venue. The timed section drills and instant CEFR score report helped me know exactly where I needed to improve.',
    rating: 5,
    avatar: 'M',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="space-y-8 sm:space-y-12">
      <ScrollReveal variant="up" duration={600}>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Trusted by 15,000+ Bangladeshi Test-Takers
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Real feedback from candidates who achieved 200+ scores and successfully secured Japanese Specified Skilled Worker visas.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item, idx) => (
          <ScrollReveal key={idx} variant="up" delay={idx * 100} duration={600}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800/90 shadow-md hover:shadow-xl hover-lift transition-all flex flex-col justify-between h-full space-y-5">
              <div className="space-y-3.5">
                {/* Star rating & quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Score & Exam Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{item.exam}</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px]">
                      {item.score}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Visa: {item.role} • {item.destination}
                  </div>
                </div>
              </div>

              {/* User Profile Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0`}>
                  {item.avatar}
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
