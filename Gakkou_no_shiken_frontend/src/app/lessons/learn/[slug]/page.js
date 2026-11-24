'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLearnTopicDetail, getLearnTopics } from '@/lib/api';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Globe,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

const STUDY_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export default function LearnTopicDetailPage({ params }) {
  const resolved = use(params);
  const slug = resolved?.slug;
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePartIdx, setActivePartIdx] = useState(null); // null = Day/Part list, number = studying that part
  const [lang, setLang] = useState(searchParams?.get('lang') || 'en');
  const [showRomaji, setShowRomaji] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);
  const [completedParts, setCompletedParts] = useState({});

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    getLearnTopics()
      .then((res) => {
        if (active && Array.isArray(res?.topics)) setAllTopics(res.topics);
      })
      .catch(() => {});

    getLearnTopicDetail(slug)
      .then((data) => {
        if (!active) return;
        setTopic(data);
        // If only 1 part exists, open it directly; if multiple parts/days exist, show the clean Day/Part list first!
        if (data?.lessons?.length === 1) {
          setActivePartIdx(0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined' || !slug) return;
    try {
      const saved = localStorage.getItem(`gns_learn_done_${slug}`);
      if (saved) setCompletedParts(JSON.parse(saved));
    } catch {}
  }, [slug]);

  const markPartDone = (partNum) => {
    setCompletedParts((prev) => {
      const next = { ...prev, [partNum]: !prev[partNum] };
      try {
        localStorage.setItem(`gns_learn_done_${slug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const speakJa = (text, id) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(id);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F6] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#C23B6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#F9F5F6] dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#FDCEDF] p-8 text-center space-y-4">
          <h1 className="text-xl font-black">Topic Not Found</h1>
          <Link href="/lessons" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C23B6B] text-white text-sm font-black">
            <ArrowLeft className="w-4 h-4" /> Back to Lessons Hub
          </Link>
        </div>
      </div>
    );
  }

  const lessons = topic.lessons || [];
  const currentLesson = activePartIdx !== null ? lessons[activePartIdx] : null;
  const isDayCourse = slug === 'hiragana' || slug === 'katakana' || slug.includes('20-days');

  return (
    <div className="min-h-screen bg-[#F9F5F6] dark:bg-[#060913] text-slate-900 dark:text-slate-100 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6">
        {/* Top Breadcrumb Header Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 p-5 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/lessons" className="hover:text-[#C23B6B] transition">
              Learn Japanese
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              type="button"
              onClick={() => setActivePartIdx(null)}
              className="hover:text-[#C23B6B] transition cursor-pointer font-extrabold text-slate-800 dark:text-slate-200"
            >
              {topic.title}
            </button>
            {currentLesson && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#C23B6B] truncate">
                  {isDayCourse ? `Day ${currentLesson.part_number}` : `Part ${currentLesson.part_number}`}
                </span>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentLesson ? currentLesson.title : `${topic.title} Lessons`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {currentLesson
                  ? `${currentLesson.word_count} expressions • Tap any speaker icon to hear native Japanese pronunciation.`
                  : `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}. Select a ${isDayCourse ? 'day' : 'part'} to start learning.`}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F8E8EE] dark:bg-slate-800 border border-[#FDCEDF] flex items-center justify-center text-2xl font-black text-[#B53562] shrink-0">
              {topic.icon_text || '日'}
            </div>
          </div>

          {/* 7-Language Switcher Bar */}
          <div className="pt-3 border-t border-[#F8E8EE] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Globe className="w-4 h-4 text-[#C23B6B] shrink-0 mr-1" />
              {STUDY_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap border ${
                    lang === l.code
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-[#F9F5F6] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE]'
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            {currentLesson && (
              <button
                type="button"
                onClick={() => setShowRomaji((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F5F6] dark:bg-slate-800 border border-[#FDCEDF] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                {showRomaji ? <Eye className="w-3.5 h-3.5 text-[#C23B6B]" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Romaji</span>
              </button>
            )}
          </div>

          {/* 1-TAP HORIZONTAL PART/DAY SWITCHER (when inside a lesson) + QUICK TOPIC SWITCHER */}
          {currentLesson && lessons.length > 1 && (
            <div className="pt-3 border-t border-[#F8E8EE] dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Switch {isDayCourse ? 'Day' : 'Part'} ({lessons.length})
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {lessons.map((l, idx) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActivePartIdx(idx)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap shrink-0 border cursor-pointer ${
                      idx === activePartIdx
                        ? 'bg-[#C23B6B] text-white border-[#C23B6B]'
                        : 'bg-[#F9F5F6] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE] dark:hover:bg-slate-700'
                    }`}
                  >
                    {isDayCourse ? `Day ${l.part_number}` : `Part ${l.part_number}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allTopics.length > 1 && (
            <div className="pt-3 border-t border-[#F8E8EE] dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Jump to Another Topic
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {allTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/lessons/learn/${t.slug}?lang=${lang}`}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap shrink-0 border ${
                      t.slug === slug
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-[#F9F5F6]/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-[#FDCEDF] dark:border-slate-700 hover:bg-[#F8E8EE] dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.icon_text} {t.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =================================================================
            VIEW A: DAY / PART LIST (Matches User's Reference Screenshot!)
           ================================================================= */}
        {activePartIdx === null && (
          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => {
              const isDone = Boolean(completedParts[lesson.part_number]);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => {
                    setActivePartIdx(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left group rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 hover:border-[#F2BED1] hover:bg-[#F9F5F6]/40 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-[#F8E8EE] dark:bg-slate-800 border-[#FDCEDF] text-[#9E2B54] dark:text-[#F2BED1]'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase leading-none">
                        {isDayCourse ? 'DAY' : 'PART'}
                      </span>
                      <span className="text-base font-black leading-tight">{lesson.part_number}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#C23B6B] truncate">
                          {lesson.title}
                        </h2>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {lesson.description || `${lesson.word_count} words & phrases`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-xs font-bold text-slate-500">
                      {lesson.word_count} items
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#C23B6B] group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* =================================================================
            VIEW B: INTERACTIVE 7-LANGUAGE WORD CARDS FOR SELECTED DAY/PART
           ================================================================= */}
        {currentLesson && (
          <div className="space-y-4">
            {/* Top Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {lessons.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setActivePartIdx(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#FDCEDF] text-xs font-extrabold hover:bg-[#F8E8EE] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> All {lessons.length} {isDayCourse ? 'Days' : 'Parts'}
                </button>
              ) : (
                <Link
                  href="/lessons"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#FDCEDF] text-xs font-extrabold hover:bg-[#F8E8EE]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Topics
                </Link>
              )}

              <button
                type="button"
                onClick={() => markPartDone(currentLesson.part_number)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                  completedParts[currentLesson.part_number]
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-[#FDCEDF] hover:border-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {completedParts[currentLesson.part_number] ? 'Completed ✓' : 'Mark Part Done'}
                </span>
              </button>
            </div>

            {/* Word Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentLesson.words || []).map((w) => {
                const localized = w.translations?.[lang] || w.translations?.en || w.meaning_en;
                const secondaryEn = lang !== 'en' ? (w.translations?.en || w.meaning_en) : null;
                return (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-white dark:bg-[#0f1629] border border-[#FDCEDF] dark:border-slate-800 p-4 flex items-start justify-between gap-3 shadow-2xs hover:border-[#F2BED1] transition"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {w.kanji}
                        </span>
                        {w.furigana && w.furigana !== w.kanji && (
                          <span className="text-xs font-bold text-[#9E2B54] dark:text-[#F2BED1]">
                            ({w.furigana})
                          </span>
                        )}
                      </div>
                      {showRomaji && w.romaji && (
                        <div className="text-[11px] font-semibold text-slate-400">{w.romaji}</div>
                      )}
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 pt-1">
                        {localized}
                      </div>
                      {secondaryEn && secondaryEn !== localized && (
                        <div className="text-[11px] font-medium text-slate-500">{secondaryEn}</div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => speakJa(w.furigana || w.kanji, w.id)}
                      aria-label="Listen pronunciation"
                      className={`p-2.5 rounded-xl border shrink-0 transition cursor-pointer ${
                        speakingId === w.id
                          ? 'bg-[#C23B6B] text-white border-[#C23B6B] animate-pulse'
                          : 'bg-[#F9F5F6] dark:bg-slate-800 text-[#9E2B54] dark:text-[#F2BED1] border-[#FDCEDF] hover:bg-[#F8E8EE]'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Prev / Next Part Footer */}
            {lessons.length > 1 && (
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={activePartIdx <= 0}
                  onClick={() => {
                    setActivePartIdx((i) => Math.max(0, i - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#FDCEDF] text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous {isDayCourse ? 'Day' : 'Part'}
                </button>
                <button
                  type="button"
                  disabled={activePartIdx >= lessons.length - 1}
                  onClick={() => {
                    setActivePartIdx((i) => Math.min(lessons.length - 1, i + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C23B6B] hover:bg-[#A32D58] text-white text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  Next {isDayCourse ? 'Day' : 'Part'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
