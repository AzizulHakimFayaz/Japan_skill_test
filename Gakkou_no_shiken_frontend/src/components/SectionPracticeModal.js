'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { BookOpen, MessageSquare, Headphones, FileCheck2, X, ArrowRight, Clock, Target, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  {
    id: 'script_vocab',
    titleKey: 'sec_script_vocab',
    desc: 'Hiragana kanji readings, vocabulary meaning in context & signage.',
    icon: BookOpen,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800',
    time: '12 Mins',
    items: '12 Questions',
  },
  {
    id: 'conversation',
    titleKey: 'sec_conversation',
    desc: 'Everyday conversations, workplace dialogues & particle grammar.',
    icon: MessageSquare,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800',
    time: '15 Mins',
    items: '12 Questions',
  },
  {
    id: 'listening',
    titleKey: 'sec_listening',
    desc: 'Spoken dialogue comprehension in station, hospital & shopping.',
    icon: Headphones,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
    time: '20 Mins',
    items: '12 Questions',
  },
  {
    id: 'reading',
    titleKey: 'sec_reading',
    desc: 'Reading flyers, instructions, emails, schedules & apartment notices.',
    icon: FileCheck2,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
    time: '13 Mins',
    items: '6 Questions',
  },
];

export default function SectionPracticeModal({ isOpen, onClose, testId, testTitle }) {
  const { t } = useLanguage();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelectSection = (sectionId) => {
    onClose();
    router.push(`/test/${testId}?section=${sectionId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-[10px] font-black uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Targeted Section Drills</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('select_section_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('select_section_subtitle')}
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectSection(sec.id)}
                className="text-left p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-japan-red/40 dark:hover:border-rose-500/40 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${sec.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{sec.time}</span>
                    </span>
                  </div>

                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors block leading-snug">
                    {t(sec.titleKey)}
                  </strong>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {sec.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-japan-red dark:text-rose-400">
                  <span>{sec.items}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Start Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
          <span>Official Prometric Scoring Algorithm</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
