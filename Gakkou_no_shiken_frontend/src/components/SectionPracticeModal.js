'use client';

import React, { useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { BookOpen, MessageSquare, Headphones, FileCheck2, X, ArrowRight, Clock, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SectionPracticeModal({ isOpen, onClose, testId, testTitle }) {
  const { t } = useLanguage();
  const router = useRouter();

  const sections = useMemo(
    () => [
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
    ],
    []
  );

  if (!isOpen) return null;

  const handleStartSection = (sectionKey) => {
    if (onClose) onClose();
    if (testId) {
      router.push(`/test/${testId}?section=${sectionKey}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-center pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider">
            <Target className="w-3 h-3" />
            <span>Targeted Section Practice</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('select_section_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('select_section_subtitle')}
          </p>
          {testTitle && (
            <p className="text-[11px] font-bold text-japan-red dark:text-rose-400 mt-1">
              {testTitle}
            </p>
          )}
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                onClick={() => handleStartSection(sec.id)}
                className="group p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-japan-red/50 dark:hover:border-rose-500/50 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${sec.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {sec.time}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 text-xs sm:text-sm leading-snug transition-colors">
                    {t(sec.titleKey)}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-normal">
                    {sec.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-japan-red dark:text-rose-400">
                  <span>{sec.items}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Tip */}
        <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400">
            Completing a single section provides an individual scaled score and answer review.
          </p>
        </div>
      </div>
    </div>
  );
}
