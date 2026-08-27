'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  Sparkles,
  BookOpen,
  Headphones,
  CheckCircle2,
  Trophy,
  Calculator,
  ArrowRight,
  Clock,
  Laptop,
  HelpCircle,
  ShieldCheck,
  Zap,
  Volume2,
  Flag,
  RotateCcw,
  Check,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const STEPS = [
  {
    step: '01',
    title: 'Choose Your Exam Category or Study Tool',
    title_bn: 'আপনার পরীক্ষা বা প্র্যাকটিস টুল নির্বাচন করুন',
    icon: BookOpen,
    iconColor: 'from-rose-500 to-red-600',
    desc: 'Select between JFT-Basic (A2 Japanese Language Proficiency) or Specified Skilled Worker (SSW) skill tests for Caregiving, Food Service, Agriculture, etc. You can also explore our free daily study tools like Kanji Flashcards and Salary Calculators.',
    desc_bn: 'JFT-Basic A2 জাপানি ভাষা পরীক্ষা অথবা SSW নার্সিং/কেয়ারগিভিং, ফুড সার্ভিস পরীক্ষার মক টেস্ট নির্বাচন করুন। অথবা ফ্রি ফ্ল্যাশ কার্ড ও স্যালারি ক্যালকুলেটর ব্যবহার করুন।',
    tips: [
      'Mock Test 01 is 100% Free & Open with No Account Required.',
      'Tests are structured exactly like real Prometric CBT test centers in Dhaka and Chittagong.',
    ],
  },
  {
    step: '02',
    title: 'One-Click Sign In (Save Results & Rank on Leaderboard)',
    title_bn: '১-ক্লিকে সাইন ইন করুন (ফলাফল সংরক্ষণ ও র‍্যাংকিং)',
    icon: UserCheck,
    iconColor: 'from-indigo-500 to-blue-600',
    desc: 'While free demo tests can be taken anonymously, signing in with your Google account or email unlocks all full-length mock exams, saves your attempt history, tracks score progress, and ranks you on the National Bangladesh Leaderboard.',
    desc_bn: 'গুগল অ্যাকাউন্ট দিয়ে ১-ক্লিকে সাইন ইন করলে সব মক টেস্ট আনলক হবে এবং আপনার পরীক্ষার ফলাফল ও জাতীয় র‍্যাংকিং সংরক্ষিত থাকবে।',
    tips: [
      'Completely free instant sign in with Google.',
      'Track your CEFR A2 score improvement over time.',
    ],
  },
  {
    step: '03',
    title: 'Experience Authentic Prometric CBT Exam Interface',
    title_bn: 'আসল প্রমেট্রিক কম্পিউটার টেস্ট ইন্টারফেসে পরীক্ষা দিন',
    icon: Laptop,
    iconColor: 'from-emerald-500 to-teal-600',
    desc: 'Enter the 60-minute Computer-Based Testing simulator. The test includes 4 timed sections: Script & Vocabulary (文字・語彙), Conversation & Expression (会話・表現), Listening Comprehension (聴解), and Reading (読解).',
    desc_bn: 'ঠিক ৬০ মিনিটের আসল পরীক্ষার ইন্টারফেসে ৪টি সেকশনে পরীক্ষা দিন: শব্দভাণ্ডার, কথোপকথন, অডিও লিসেনিং ও রিডিং।',
    tips: [
      'Use headphones for high-fidelity native Japanese listening audio questions.',
      'Use the "Flag Question" (🚩) feature to mark difficult questions and review before submitting.',
      'Single-play native audio mimics real Prometric exam restrictions.',
    ],
  },
  {
    step: '04',
    title: 'Instant CEFR Scaled Score Diagnostic Report',
    title_bn: 'তাৎক্ষণিক ফলাফল ও বিস্তারিত অ্যানালাইসিস রিপোর্ট',
    icon: Trophy,
    iconColor: 'from-amber-500 to-yellow-600',
    desc: 'Upon completing your exam, you immediately receive a 250-point scaled score report, Pass/Fail status (Passing mark: 200/250 points, 80%), and section-by-section performance breakdown with correct answers and explanations.',
    desc_bn: 'পরীক্ষা শেষ হওয়ামাত্র ২৫০ স্কেলের তাৎক্ষণিক মার্কশিট ও প্রতিটি প্রশ্নের সঠিক উত্তর এবং বাংলা ব্যাখ্যা দেখতে পাবেন। পাস মার্ক: ২০০/২৫০।',
    tips: [
      'Detailed question review reveals correct answers, Bengali explanations, and listening transcripts.',
      'Top scorers automatically feature on the Bangladesh National Leaderboard.',
    ],
  },
  {
    step: '05',
    title: 'Daily Practice Tools & Career Calculators',
    title_bn: 'প্রতিদিনের ফ্ল্যাশ কার্ড ও জাপান ক্যারিয়ার টুলস',
    icon: Zap,
    iconColor: 'from-purple-500 to-pink-600',
    desc: 'Supplement your mock exam prep with our dedicated standalone tools: Daily Kanji & Vocab Flashcards with native audio, Japan SSW Salary & Cost of Living Calculator (in JPY & BDT), and Rapid Particle Quiz Drill rooms.',
    desc_bn: 'মক টেস্টের পাশাপাশি অডিওসহ শব্দভাণ্ডার ফ্ল্যাশ কার্ড, জাপান স্যালারি ক্যালকুলেটর ও গ্রামার প্র্যাকটিস টুল ব্যবহার করে প্রস্তুতি মজবুত করুন।',
    tips: [
      'Access anytime from the top "Tools" menu on desktop or mobile.',
      'Practice 10-minute daily vocabulary drills for maximum retention.',
    ],
  },
];

const FAQS = [
  {
    q: 'Are the mock tests on Gakkou No Shiken free to take?',
    q_bn: 'পরীক্ষাগুলো কি সম্পূর্ণ ফ্রি?',
    a: 'Yes! Mock Test 01 and diagnostic sample exams are 100% free with no registration required. All other full-length mock tests are free to access by creating a free student account via Google or email.',
    a_bn: 'হ্যাঁ! মক টেস্ট ০১ সহ ফ্রি টেস্টগুলো কোনো রেজিস্ট্রেশন ছাড়াই দেওয়া যায়। বাকি টেস্টগুলো ফ্রি গুগল সাইন-ইন করলেই আনলক হয়ে যায়।',
  },
  {
    q: 'How does the scoring system match the real JFT-Basic exam?',
    q_bn: 'ফলাফলের স্কেলিং কি আসল পরীক্ষার মতো?',
    a: 'Real JFT-Basic Prometric exams use an Item Response Theory (IRT) scaled scoring algorithm ranging from 10 to 250 points. A score of 200 or higher (80%) is required to achieve CEFR A2 level and pass. Our platform calculates scaled scores and section breakdowns in the exact same format.',
    a_bn: 'আসল জেএফটি পরীক্ষার মতো আমাদের প্ল্যাটফর্মেও ২৫০ স্কেলের স্কোর এবং ২০০ পেলে পাস (CEFR A2) সার্টিফিকেট প্রদান করা হয়।',
  },
  {
    q: 'Can I take the mock tests on my mobile phone?',
    q_bn: 'মোবাইল দিয়ে কি পরীক্ষা দেওয়া যাবে?',
    a: 'Yes! Our website is 100% responsive and works smoothly on smartphones, tablets, laptops, and desktop computers. However, for the most authentic CBT simulation experience, taking the test on a laptop or desktop computer with headphones is recommended.',
    a_bn: 'হ্যাঁ! মোবাইল, ট্যাব ও কম্পিউটার সব ডিভাইসেই সুন্দরভাবে পরীক্ষা দেওয়া যায়। তবে হেডফোনসহ কম্পিউটারে দেওয়া বেশি উপকারী।',
  },
  {
    q: 'How many times can I retake a mock test?',
    q_bn: 'একটি পরীক্ষা কতবার দেওয়া যায়?',
    a: 'Unlimited times! You can retake any mock test as many times as you like to practice your speed, timing, and listening comprehension. Your highest score will be shown on your profile and leaderboard.',
    a_bn: 'যতবার খুশি আনলিমিটেড বার পরীক্ষা দিতে পারবেন। আপনার সর্বোচ্চ স্কোরটি প্রোফাইল ও লিডারবোর্ডে প্রদর্শিত হবে।',
  },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">How It Works</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-japan-navy text-white p-6 sm:p-12 border border-slate-800 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-japan-red" />
          <span>Platform User Guide (ব্যবহারের নির্দেশিকা)</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          How Gakkou No Shiken Works &amp; How to Use It
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Master the official Prometric Computer-Based Testing (CBT) simulator, practice full-length JFT-Basic &amp; SSW mock tests, and utilize free Japanese study tools.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-red-500/25 text-xs sm:text-sm active:scale-95 transition-all"
          >
            <Laptop className="w-4 h-4" />
            <span>Browse Mock Exams</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl border border-white/15 text-xs sm:text-sm transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Explore Free Study Tools</span>
          </Link>
        </div>
      </div>

      {/* Step-by-Step Interactive Guide */}
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-japan-red dark:text-rose-400">
            5 Simple Steps to Exam Success
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How to Use the Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Follow this guide to get the most authentic CBT exam experience and boost your CEFR score.
          </p>
        </div>

        <div className="space-y-5">
          {STEPS.map((st, idx) => {
            const Icon = st.icon;
            return (
              <ScrollReveal key={st.step} variant="up" delay={idx * 60} duration={500}>
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${st.iconColor} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          STEP {st.step}
                        </span>
                        <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                          {st.title}
                        </h3>
                        <p className="text-xs text-japan-red dark:text-rose-400 font-bold mt-0.5">
                          {st.title_bn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {st.desc}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {st.desc_bn}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Key Highlights &amp; Pro-Tips:
                    </span>
                    {st.tips.map((tip, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Prometric CBT Simulator Interface Anatomy */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-japan-navy text-white border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>CBT Exam Screen Anatomy</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            Prometric Kiosk Controls &amp; Features
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            During the exam, familiarize yourself with these official CBT controls to maximize your score:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Section Countdown Timer</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Always visible in the top header. Shows exactly how many minutes and seconds remain in the active section.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Volume2 className="w-4 h-4" />
              <span>Single-Play Audio</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              In Listening Comprehension, audio plays native Japanese conversations according to official Prometric rules.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Flag className="w-4 h-4" />
              <span>Flag for Review (🚩)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tag difficult questions to quickly jump back and review before clicking Final Submit.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instant CEFR Scoring</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Instant 250-scale scoring and detailed answer keys with Bengali explanations right after submission.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion) */}
      <div className="space-y-4">
        <div className="text-center space-y-1 max-w-lg mx-auto">
          <span className="text-xs font-black uppercase text-japan-red dark:text-rose-400">FAQ</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {faq.q}
                  </h4>
                  <span className="text-[11px] text-japan-red dark:text-rose-400 font-bold block mt-0.5">
                    {faq.q_bn}
                  </span>
                </div>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 animate-fade-in font-medium leading-relaxed">
                  <p>{faq.a}</p>
                  <p className="text-slate-500 dark:text-slate-400">{faq.a_bn}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-japan-red to-rose-700 text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Ready to Test Your Japanese Skills?
          </h3>
          <p className="text-xs sm:text-sm text-rose-100 font-normal leading-relaxed">
            Take a 100% free official-format JFT-Basic CBT mock test right now and find out your CEFR A2 score!
          </p>
        </div>

        <Link
          href="/tests"
          className="bg-white hover:bg-slate-100 text-slate-950 font-black px-8 py-3.5 rounded-2xl shadow-xl text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <span>Start Free Exam Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
