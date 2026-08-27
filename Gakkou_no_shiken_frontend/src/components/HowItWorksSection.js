'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';
import {
  Compass,
  Laptop,
  LineChart,
  PlaneTakeoff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Choose Exam Category',
    subtitle: 'Diagnostic Evaluation',
    desc: 'Select either JFT-Basic (Japanese language proficiency) or specific SSW Skill evaluation tests (Nursing Care, Food Service, Agriculture, etc.).',
    icon: Compass,
    color: 'from-rose-500 to-red-600',
  },
  {
    step: '02',
    title: 'Practice CBT Simulator',
    subtitle: 'Timed Exam Simulation',
    desc: 'Take timed 60-minute tests with realistic single-play audio dialogues, 4-section flow, and instant in-test Bengali & English translations.',
    icon: Laptop,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    step: '03',
    title: 'Review Diagnostics',
    subtitle: 'Weak-Spot Analytics',
    desc: 'Receive immediate CEFR scaled scores (250-point scale), Can-do skill metrics, and detailed answer explanations for all questions.',
    icon: LineChart,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    step: '04',
    title: 'Pass Prometric in BD',
    subtitle: 'Japan Visa Ready',
    desc: 'Confidently score 200+ at Prometric test centers in Dhaka or Chittagong and qualify for your Specified Skilled Worker visa.',
    icon: PlaneTakeoff,
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl lg:rounded-4xl p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-8 sm:space-y-12">
        <ScrollReveal variant="up" duration={600}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Step-by-Step Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Your 4-Stage Pathway to Working in Japan
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Follow our structured preparation journey designed specifically for Bangladeshi candidates to conquer the Prometric CBT examination.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 100} duration={600}>
                <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-3xl p-6 space-y-4 hover-lift transition-all flex flex-col justify-between h-full group relative">
                  {/* Step Number Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
                      {item.step}
                    </span>
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
                      {item.subtitle}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Free on platform</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
