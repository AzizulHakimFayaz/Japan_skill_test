import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Home,
  ChevronRight,
  Zap,
  BookOpen,
  CheckCircle2,
  Award,
  GraduationCap,
  Clock,
  HelpCircle,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'Japanese CBT Practice Tools & Particle Drills | Gakkou No Shiken',
  description:
    'Free interactive study tools for JFT-Basic and SSW skill test preparation. Practice active recall with Kanji flashcards, Japanese particle drills, and vocabulary curriculum tools.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/tools',
  },
};

const TOOLS = [
  {
    id: 'curriculum-lessons',
    href: '/lessons',
    title: 'Japanese Vocabulary & Kanji Curriculum Hub',
    title_ja: '語彙・漢字カリキュラム',
    badge: 'Complete Curriculum',
    badgeColor: 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: GraduationCap,
    iconColor: 'from-rose-500 via-red-600 to-amber-600',
    desc: 'Official 80-lesson Minna no Nihongo & JLPT N5/N4 curriculum containing 2,690+ words and Kanji characters with native audio pronunciation, Furigana toggles, and dual English & Bengali (বাংলা) translations.',
    features: ['50 Vocab + 30 Kanji Lessons', '2,690+ Words & Characters', 'Dual English & বাংলা Meanings', 'Interactive Flashcards & Audio'],
  },
  {
    id: 'flashcards',
    href: '/tools/flashcards',
    title: 'Daily Kanji & Vocab Flashcards',
    title_ja: '単語フラッシュカード',
    badge: 'Study Tool',
    badgeColor: 'bg-rose-50 dark:bg-rose-950/70 text-japan-red dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: BookOpen,
    iconColor: 'from-rose-500 to-red-600',
    desc: 'Interactive 3D flip flashcards for JFT-Basic A2 high-frequency vocabulary and workplace SSW terms with audio pronunciation and Bengali meanings.',
    features: ['300+ JFT A2 Words', 'Audio Pronunciation', 'Bengali & English Meanings', 'Mastery Tracker'],
  },
  {
    id: 'particle-quiz',
    href: '/tools/particle-quiz',
    title: 'Grammar Particle Drill Room',
    title_ja: '助詞・文法特訓',
    badge: 'Rapid Quiz',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: Zap,
    iconColor: 'from-emerald-500 to-teal-600',
    desc: 'Rapid 10-question drill room specifically designed for mastering tricky Japanese particles (に, で, を, が, は, へ, と) with instant Bengali grammar explanations.',
    features: ['10-Question Drills', 'Instant Bengali Feedback', 'Score Breakdown', 'All Key Particles'],
  },
];

export default function ToolsHubPage() {
  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">Candidate Tools</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-japan-navy text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-japan-red" />
          <span>Free Examination Practice Tools</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Japanese Practice Tools &amp; Drill Rooms
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          Interactive digital study tools engineered specifically for South Asian and international candidates preparing for JFT-Basic A2 examinations and Specified Skilled Worker (SSW) technical evaluations.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <ScrollReveal key={tool.id} variant="up" delay={idx * 80} duration={500}>
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full shadow-md hover:shadow-xl hover-lift transition-all space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.iconColor} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {tool.title_ja}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                      {tool.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="pt-2 space-y-2">
                    {tool.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={tool.href}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-japan-red dark:hover:bg-japan-red dark:hover:text-white transition-colors duration-200 shadow-md group"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* In-Depth Educational Guide Section for High-Value Content Indexability */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/10 text-japan-red dark:text-rose-400 text-xs font-black uppercase">
            <Award className="w-3.5 h-3.5" />
            <span>Educational Methodology &amp; CBT Readiness</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            How Interactive Practice Tools Accelerate Japanese Exam Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Unlike static paper flashcards or memorization lists, interactive computer-based practice tools reinforce neuromuscular recall and response agility under timed Prometric CBT conditions:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">Active Recall &amp; Spaced Repetition</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant answer feedback with Furigana aids strengthens long-term memory for high-frequency Kanji and vocabulary, ensuring retention through testing cycles.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">Particle Drill Precision</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Japanese postpositional particles (に, で, を, が, は, へ, と) account for over 30% of grammatical points lost on exam day. Rapid drills build muscle memory.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <strong className="text-sm font-bold text-slate-900 dark:text-white block">Prometric Interface Familiarity</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Familiarizing with digital timers, keyboard inputs, and audio controls prevents test-day anxiety at Dhaka, Chittagong, and Tokyo CBT test venues.
            </p>
          </div>
        </div>

        {/* Detailed Study Guide Integration */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Recommended Daily Tool Routine for JFT-Basic (CEFR A2)
          </h3>
          <p>
            To reach the 200-point passing threshold on the JFT-Basic exam, we advise dedicating 45 minutes daily across our interactive tools:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>15 Minutes Vocabulary Flashcards:</strong> Review 25 new vocabulary cards using native audio playback to train auditory identification before visual reading.
            </li>
            <li>
              <strong>15 Minutes Particle Drills:</strong> Complete three 10-question particle drill sessions to achieve an 80%+ accuracy rate on situational grammar.
            </li>
            <li>
              <strong>15 Minutes Textbook Listening:</strong> Listen to one chapter dialogue from the official JAC textbooks with synchronized Japanese and Bengali transcriptions.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
