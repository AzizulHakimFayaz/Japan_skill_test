'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Volume2,
  Globe,
  Flame,
} from 'lucide-react';

const SAMPLE_QUESTIONS = [
  {
    type: 'JFT-Basic • Script & Vocabulary',
    prompt: '次の文の＿＿の言葉はどう読みますか。一番いいものを一つえらんでください。',
    context: '毎日、駅まで<u>歩いて</u>行きます。',
    options: ['1. はしって', '2. あるいて', '3. およいで', '4. とんで'],
    correct: 1,
    kana: 'あるいて (aruite)',
    meaning: 'I walk to the station every day (প্রতিদিন হেঁটে স্টেশনে যাই).',
  },
  {
    type: 'SSW Skill • Nursing Care (介護)',
    prompt: '利用者の食事介助をするとき、最も適切な姿勢はどれですか。',
    context: '車いすで食事をとる利用者への声かけと姿勢保持。',
    options: ['1. 背もたれに深く寄りかからせる', '2. あごを軽く引いて足裏を床につける', '3. 頭を後ろに反らせる', '4. 横向きに寝かせる'],
    correct: 1,
    kana: 'あごをひいて (ago o hiite)',
    meaning: 'Tuck chin lightly and keep feet on floor (চিবুক নামিয়ে পা মেঝেতে রাখুন).',
  },
];

export default function WebsiteHero() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const currentQ = SAMPLE_QUESTIONS[activeTab];

  return (
    <section className="relative overflow-hidden rounded-3xl lg:rounded-4xl bg-gradient-to-br from-[#0a0f1d] via-[#0f172a] to-[#1e112a] text-white border border-slate-800 shadow-2xl shadow-slate-950/70 select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Japanese Watermark Accent */}
      <div className="absolute right-6 top-6 opacity-5 font-black text-8xl lg:text-9xl text-white pointer-events-none select-none tracking-widest hidden md:block">
        試験合格
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-14 xl:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Inspiring Headline, Value Proposition & Dual CTAs */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            {/* Trust Pill & Official Standard Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-black tracking-wide uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-japan-red animate-pulse"></span>
                <span>🇧🇩 Bangladesh&apos;s #1 CBT Platform</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>2026 Prometric Format</span>
              </span>
            </div>

            {/* Main Portal Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12]">
                Pass Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-japan-red to-amber-400">
                  JFT-Basic &amp; SSW
                </span>{' '}
                CBT Exams on First Try
              </h1>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-2xl">
                Experience Bangladesh&apos;s first authentic Computer-Based Testing (CBT) simulator. Practice with 100% realistic Prometric exam timers, native listening audio, instant CEFR score diagnostics, and Bengali answer explanations.
              </p>
            </div>

            {/* Action Buttons & Secondary Links */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href="#practice-grid"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-rose-700 text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <BookOpen className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                <span>Start Free Diagnostic CBT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/ssw-skill-test"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 sm:py-4 rounded-2xl border border-white/15 hover:border-white/30 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Explore 12 SSW Sectors</span>
              </Link>
            </div>

            {/* Trust Proof Metrics Counter Grid */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-black text-xl sm:text-2xl tracking-tight">
                  <Flame className="w-4 h-4 text-japan-red" />
                  <span>15,000+</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">Mock Tests Taken</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xl sm:text-2xl tracking-tight">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>94.8%</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">Exam Pass Rate</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-black text-xl sm:text-2xl tracking-tight">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>100%</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">Prometric Audio</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xl sm:text-2xl tracking-tight">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>10 Langs</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">Bangla &amp; English</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Prometric CBT Live Teaser Card */}
          <div className="lg:col-span-5 relative">
            {/* Top Floating Badge */}
            <div className="absolute -top-3.5 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-lg shadow-amber-400/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive CBT Preview</span>
            </div>

            {/* Live CBT Simulator Card Box */}
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden">
              {/* Category Tab Switcher */}
              <div className="flex items-center justify-between pt-2">
                <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => {
                      setActiveTab(0);
                      setSelectedAnswer(null);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeTab === 0 ? 'bg-japan-red text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JFT-Basic
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab(1);
                      setSelectedAnswer(null);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeTab === 1 ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SSW Skills
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>58:45 Left</span>
                </div>
              </div>

              {/* CBT Prompt Area */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>{currentQ.type}</span>
                  <span className="text-rose-400">Q. #12 / 60</span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">{currentQ.prompt}</p>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm sm:text-base font-bold text-white tracking-wide" dangerouslySetInnerHTML={{ __html: currentQ.context }} />
              </div>

              {/* Interactive 4-Choice Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correct;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-xs'
                            : 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {isCorrect ? 'Correct ✓' : 'Choice'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Multilingual Translation Helper Bar */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-white">Bangla Aid: </span>
                    <span>{currentQ.meaning}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">10 Langs</span>
              </div>

              {/* Instant Diagnostic Score Meter Footer */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="font-bold text-slate-300">CEFR Benchmark:</span>
                  <span className="font-black text-amber-400">A2 Pass (200+/250)</span>
                </div>
                <a
                  href="#practice-grid"
                  className="font-extrabold text-japan-red hover:text-rose-400 transition-colors flex items-center gap-1 text-xs"
                >
                  <span>Full CBT Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
