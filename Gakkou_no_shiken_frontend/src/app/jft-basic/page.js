'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJftInfo, getJftSectionsSummary } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import AdsterraNativeBanner from '@/components/AdsterraNativeBanner';
import {
  Laptop,
  Clock,
  CheckCircle2,
  Award,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  FileCheck2,
  GraduationCap,
  Shuffle,
  Headphones,
  MessageCircle,
  FileText,
  Languages,
} from 'lucide-react';

export default function JftBasicPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('script_vocab');
  const [openFaq, setOpenFaq] = useState(null);
  const [sectionSummary, setSectionSummary] = useState([]);
  const [savedSectionScores, setSavedSectionScores] = useState({});

  useEffect(() => {
    getJftInfo()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load JFT info:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    getJftSectionsSummary()
      .then((res) => {
        if (Array.isArray(res?.sections)) setSectionSummary(res.sections);
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('gns_jft_section_scores');
        if (raw) setSavedSectionScores(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const jftInfo = data?.jft_info || {};
  const resources = data?.jft_resources || [];
  const practiceTests = data?.practice_tests || [];

  const FALLBACK_SECTIONS = [
    { key: 'script_vocab', name: 'Script & Vocabulary', name_ja: '文字と語彙', description: 'Kanji readings, katakana words, and everyday A2 vocabulary.', max_points: 62.5, questions_per_mock: 10 },
    { key: 'conversation', name: 'Conversation & Expression', name_ja: '会話と表現', description: 'Daily dialogues, polite responses, and grammar expressions.', max_points: 62.5, questions_per_mock: 10 },
    { key: 'listening', name: 'Listening Comprehension', name_ja: '聴解', description: 'Everyday Japanese audio dialogues & workplace announcements.', max_points: 62.5, questions_per_mock: 10 },
    { key: 'reading', name: 'Reading Comprehension', name_ja: '読解', description: 'Signs, notices, emails, and short workplace memos.', max_points: 62.5, questions_per_mock: 10 },
  ];
  const fourSections = sectionSummary.length > 0 ? sectionSummary : FALLBACK_SECTIONS;
  const totalCombinedPoints = fourSections.reduce(
    (sum, s) => sum + Number(savedSectionScores[s.key]?.latest_points || 0),
    0
  );
  const sectionIcons = {
    script_vocab: Languages,
    conversation: MessageCircle,
    listening: Headphones,
    reading: FileText,
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-japan-navy to-slate-900 text-white p-6 sm:p-14 shadow-2xl shadow-slate-900/30 border border-slate-800/80 animate-fade-in-up">
        <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-japan-red/20 border border-japan-red/40 text-rose-300 text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-md">
            <span>🇧🇩</span>
            <span>Bangladesh&apos;s #1 JFT-Basic CBT Mock Test Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Japan Foundation Test for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-japan-red to-rose-300">
              Basic Japanese
            </span>{' '}
            (JFT-Basic)
          </h1>

          <p className="hidden sm:block text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            {jftInfo.overview ||
              'Computer-Based Testing (CBT) measuring everyday Japanese communicative proficiency for foreign workers.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Link
              href="/lessons?tab=jft"
              className="inline-flex items-center gap-2 bg-[#DB1A1A] hover:bg-[#B81515] text-white font-extrabold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl transition-all shadow-lg text-xs sm:text-sm active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>JFT-Basic Lessons &amp; Notes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#mock-tests"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 hover:border-white/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>Full CBT Mock Exams</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a
              href="#section-mocks"
              className="inline-flex items-center gap-2 bg-[#2C687B]/80 hover:bg-[#2C687B] text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl transition-all text-xs sm:text-sm border border-[#8CC7C4]/40"
            >
              <Shuffle className="w-4 h-4" />
              <span>Section-Wise Mocks</span>
            </a>
          </div>
        </div>

        {/* Watermark Japanese Kanji */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-9xl tracking-tighter text-rose-300 pointer-events-none select-none hidden sm:block">
          基礎
        </div>
      </div>

      {/* Exam At-A-Glance Cards Grid */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex items-start gap-4 hover-shine-container animate-fade-in-up delay-75">
          <div className="w-13 h-13 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Format</span>
            <strong className="text-xl font-black text-slate-900 dark:text-white leading-tight block mt-0.5">
              {jftInfo.format || 'CBT (Computer-Based)'}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Computer terminal &amp; headphones</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex items-start gap-4 hover-shine-container animate-fade-in-up delay-150">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Duration</span>
            <strong className="text-xl font-black text-slate-900 dark:text-white leading-tight block mt-0.5">
              {jftInfo.duration_minutes || 60} Minutes
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{jftInfo.total_questions || '50–60 Questions'}</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex items-start gap-4 hover-shine-container animate-fade-in-up delay-200">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Passing Threshold</span>
            <strong className="text-xl font-black text-slate-900 dark:text-white leading-tight block mt-0.5">200 / 250 (80%)</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Scale score range 10 - 250</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift transition-all duration-300 flex items-start gap-4 hover-shine-container animate-fade-in-up delay-300">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-japan-red dark:text-rose-400 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Level &amp; Validity</span>
            <strong className="text-xl font-black text-slate-900 dark:text-white leading-tight block mt-0.5">
              {jftInfo.target_level || 'A1 - A2 Level'}
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Valid for {jftInfo.validity_years || 2} Years</p>
          </div>
        </div>
      </div>

      {/* Pre-Exam Study CTA: JFT-Basic Learn Japanese & Lessons Hub */}
      <div className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#2C687B] dark:text-[#8CC7C4] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-[10px] font-black uppercase tracking-wider">
              Start Here Before Your Mock Exam
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              Need to Learn JFT-Basic Vocabulary, Kanji &amp; Grammar First?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Study all 50 Minna no Nihongo lessons, 30 Kanji units, and A2 grammar notes in 7 languages with native audio.
            </p>
          </div>
        </div>
        <Link
          href="/lessons?tab=jft"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs sm:text-sm font-black shadow-sm transition shrink-0"
        >
          <span>Study JFT-Basic Lessons</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Online Practice Mock Exams Section */}
      <div id="mock-tests" className="bg-white dark:bg-slate-950/75 rounded-3xl border border-[#CBE5E3] dark:border-slate-800/90 p-5 sm:p-10 shadow-sm">
        <PracticeTestGrid
          practiceTests={practiceTests}
          title="JFT-Basic Full CBT Mock Exams"
          subtitle="Take realistic full-length JFT-Basic CBT practice tests online to get familiar with the exam interface and instant scoring."
          catKey="basic"
        />
      </div>

      {/* =====================================================================
          SECTION-WISE RANDOMIZED JFT-BASIC MOCK TESTS (4 OFFICIAL SECTIONS)
         ===================================================================== */}
      <div
        id="section-mocks"
        className="rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 sm:p-8 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAF4F4] dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Shuffle className="w-3.5 h-3.5 text-[#DB1A1A]" /> Smart Non-Repeating Practice
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Section-Wise Randomized Mock Tests
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Practice each of the 4 official JFT-Basic sections individually. Every new attempt shuffles fresh questions (excluding your previous attempt) and tracks your points out of <strong>62.5 pts</strong> per section!
            </p>
          </div>

          {/* Live Combined 4-Section Score Pill */}
          <div className="rounded-2xl bg-[#EAF4F4] dark:bg-slate-900 border border-[#CBE5E3] dark:border-slate-700 px-4 py-3 flex items-center gap-3 shrink-0">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                Combined 4-Section Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {totalCombinedPoints.toFixed(1)}{' '}
                <span className="text-xs font-bold text-slate-500">/ 250 pts</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                totalCombinedPoints >= 200
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] border border-[#CBE5E3] dark:border-slate-700'
              }`}
            >
              {totalCombinedPoints >= 200 ? 'Pass Ready' : 'Goal: 200'}
            </span>
          </div>
        </div>

        {/* 4 Section Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fourSections.map((sec) => {
            const IconComp = sectionIcons[sec.key] || BookOpen;
            const saved = savedSectionScores[sec.key];
            const pts = Number(saved?.latest_points || 0);
            const maxPts = Number(sec.max_points || 62.5);
            const pct = Math.min(100, Math.round((pts / maxPts) * 100));

            return (
              <div
                key={sec.key}
                className="rounded-2xl bg-white dark:bg-slate-900/80 border border-[#CBE5E3] dark:border-slate-800 hover:border-[#8CC7C4] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF4F4] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center text-[#2C687B] dark:text-[#8CC7C4]">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF4F4] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-[10px] font-black">
                      {sec.name_ja}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {sec.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {sec.description}
                    </p>
                  </div>

                  {/* Per-Section Points Tracker Box */}
                  <div className="rounded-xl bg-[#EAF4F4]/70 dark:bg-slate-800/70 border border-[#CBE5E3] dark:border-slate-700 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-extrabold">
                      <span className="text-[#2C687B] dark:text-[#8CC7C4]">Your Section Points</span>
                      <span className="text-slate-900 dark:text-white font-black">
                        {saved ? `${pts.toFixed(1)} / ${maxPts}` : `— / ${maxPts}`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white dark:bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          saved?.passed ? 'bg-emerald-500' : 'bg-[#DB1A1A]'
                        }`}
                        style={{ width: `${saved ? pct : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>
                        {saved
                          ? `Last: ${saved.score}/${saved.total_questions} (${saved.percentage}%)`
                          : 'Not attempted yet'}
                      </span>
                      {saved?.best_points > 0 && (
                        <span className="text-[#2C687B] dark:text-[#8CC7C4]">
                          Best: {Number(saved.best_points).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/jft-basic/section/${sec.key}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#DB1A1A] hover:bg-[#B81515] text-white text-xs font-black text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>{saved ? 'Try Fresh Random Set' : 'Start Section Mock'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adsterra Native Sponsored Banner (Pre-Exam Discovery) */}
      <AdsterraNativeBanner />



      {/* Interactive Section Breakdown Tabs */}
      {jftInfo.sections && jftInfo.sections.length > 0 && (
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <span className="text-xs font-extrabold text-japan-red dark:text-rose-400 uppercase tracking-wider block mb-1">Detailed Breakdown</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Exam Sections &amp; Competencies</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              The JFT-Basic exam evaluates four core communicative abilities under daily living scenarios in Japan.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200/70 dark:border-slate-700">
            {jftInfo.sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`py-3 px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 text-center cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          {jftInfo.sections.map((sec) =>
            activeSection === sec.id ? (
              <div key={sec.id} className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-slate-50 to-slate-800/30 dark:from-slate-800 dark:to-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950/80 text-slate-800 dark:text-slate-300 text-xs font-bold">
                      {sec.item_count}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{sec.name}</h3>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{sec.description}</p>
                  </div>
                  <div className="flex-shrink-0 bg-white dark:bg-slate-800/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center min-w-[160px]">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">Section Portion</span>
                    <strong className="text-2xl font-extrabold text-japan-navy dark:text-white">1/4</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Equal section balance</span>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Helpful Resources: Irodori Textbooks & Exam Day Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-900 via-japan-navy to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/20 text-rose-300 border border-japan-red/40 text-xs font-bold uppercase tracking-wider">
            Official Free Textbooks
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">Irodori: Japanese for Life in Japan</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The Japan Foundation provides the complete <em>Irodori</em> coursebook series for free download (PDF textbooks + MP3 audio files) specifically tailored for JFT-Basic &amp; SSW candidates.
          </p>

          <div className="space-y-3">
            <a
              href="https://www.irodori.jpf.go.jp/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
            >
              <div>
                <strong className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Starter (A1 Level)
                </strong>
                <p className="text-xs text-slate-300">Basic daily greetings, shopping &amp; food ordering</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-xs flex items-center gap-1">
                <span>Download</span>
                <Download className="w-3 h-3" />
              </span>
            </a>

            <a
              href="https://www.irodori.jpf.go.jp/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
            >
              <div>
                <strong className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Elementary 1 &amp; 2 (A2 Level)
                </strong>
                <p className="text-xs text-slate-300">Workplace communication &amp; community living</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-xs flex items-center gap-1">
                <span>Download</span>
                <Download className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold uppercase tracking-wider">
            Exam Day Checklist
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Test Center Admission Guidelines</h3>

          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-slate-900 dark:text-white">Original Machine-Readable Passport:</strong> You must present your valid original passport at venue check-in.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-slate-900 dark:text-white">Prometric Admission Ticket:</strong> Printed copy of your test confirmation voucher with your Registration ID.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-slate-900 dark:text-white">Arrive 30 Minutes Prior:</strong> Show up early at the Dhaka or Chittagong UTC venue for biometric verification and locker storage.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Prometric Registration Steps & Official Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-japan-red/10 text-japan-red dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
              Step-by-step
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Prometric Registration Workflow</h3>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              <div className="flex items-start gap-4 relative">
                <span className="w-8 h-8 rounded-full bg-japan-red text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
                  1
                </span>
                <div>
                  <strong className="text-base text-slate-900 dark:text-white font-bold block">Create Prometric ID Profile</strong>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Register on the Prometric Japan Foundation portal using your machine-readable Passport.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 border border-slate-700">
                  2
                </span>
                <div>
                  <strong className="text-base text-slate-900 dark:text-white font-bold block">Purchase Exam Voucher in BDT</strong>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Vouchers are purchased through authorized Bangladesh bank/mobile payment partners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 border border-slate-700">
                  3
                </span>
                <div>
                  <strong className="text-base text-slate-900 dark:text-white font-bold block">Reserve Seat &amp; Test Venue</strong>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Select Prometric UTC Dhaka or Chittagong test center and lock your exam date &amp; time slot.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                  4
                </span>
                <div>
                  <strong className="text-base text-slate-900 dark:text-white font-bold block">Attend Exam &amp; Get Immediate Result</strong>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Score card printed immediately on screen at completion. Certificate issued within 5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Local Voucher Notice */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-xs text-slate-950 dark:text-slate-200 space-y-1">
              <strong className="font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-300">
                <span>💡 Bangladesh Candidates Voucher Tip:</span>
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                If you don&apos;t have an international credit card with dual-currency endorsement, you can purchase official Prometric vouchers in BDT through authorized Bangladesh test center partners (UTC Dhanmondi &amp; Banani) or designated Japanese language training centers.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <a
              href="https://www.prometric-jp.com/en/jftbasic/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md text-sm"
            >
              <span>Open Prometric Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold uppercase tracking-wider mb-4">
            Official Links
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Syllabi &amp; Preparation Resources</h3>

          <div className="space-y-4">
            {resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-japan-red/40 dark:hover:border-rose-500/40 hover:bg-red-50/20 dark:hover:bg-slate-800/60 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 text-base transition-colors flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-japan-red" />
                    <span>{res.title}</span>
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 flex-shrink-0">
                    {res.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{res.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>


      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>

        <div className="space-y-3">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              className="w-full text-left p-4 sm:p-5 font-bold text-slate-800 dark:text-white hover:text-japan-red dark:hover:text-rose-400 flex items-center justify-between gap-4 transition-colors cursor-pointer"
            >
              <span>What is the difference between JFT-Basic and JLPT N4?</span>
              {openFaq === 1 ? <ChevronUp className="w-5 h-5 text-japan-red" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {openFaq === 1 && (
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
                Both JFT-Basic and JLPT N4 fulfill the Japanese language prerequisite for Japan&apos;s Specified Skilled Worker (SSW Type 1) visa. However, JFT-Basic is conducted multiple times a month via Computer-Based Testing (CBT) with instant score reports, whereas JLPT is held only twice a year on paper.
              </div>
            )}
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              className="w-full text-left p-4 sm:p-5 font-bold text-slate-800 dark:text-white hover:text-japan-red dark:hover:text-rose-400 flex items-center justify-between gap-4 transition-colors cursor-pointer"
            >
              <span>Can I retake the test if I fail?</span>
              {openFaq === 2 ? <ChevronUp className="w-5 h-5 text-japan-red" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {openFaq === 2 && (
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
                Yes. Candidates must wait 30 full days after taking a JFT-Basic exam before re-sitting for another attempt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
