'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getSswInfo } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import SswSectorExplorer from '@/components/SswSectorExplorer';

const JftCenterMap = dynamic(() => import('@/components/JftCenterMap'), { ssr: false });
import {
  Layers,
  MapPin,
  ExternalLink,
  ArrowRight,
  Award,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileCheck2,
  ChevronDown,
  Download,
} from 'lucide-react';

export default function SswSkillTestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSswInfo()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to fetch SSW info:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sswInfo = data?.ssw_info || {};
  const sswSectors = data?.ssw_sectors || [];
  const testCenters = data?.test_centers || [];
  const practiceTests = data?.practice_tests || [];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-japan-navy text-white p-6 sm:p-14 shadow-2xl shadow-slate-900/30 border border-slate-800/80 animate-fade-in-up">
        <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-md">
            <span>🇧🇩</span>
            <span>Bangladesh&apos;s #1 SSW Skills CBT Mock Test Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            SSW Sector{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
              Skills Evaluation
            </span>{' '}
            Exams
          </h1>

          <p className="hidden sm:block text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            {sswInfo.purpose ||
              'The SSW evaluation tests occupational competency in key industrial sectors facing labor shortages in Japan.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
            <a
              href="#ssw-sectors"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 text-xs sm:text-sm active:scale-95 glow-amber"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Sectors</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a
              href="#ssw-venues"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 hover:border-white/30"
            >
              <MapPin className="w-4 h-4" />
              <span>Test Venues</span>
            </a>
          </div>
        </div>

        {/* Watermark Japanese Kanji */}
        <div className="absolute -right-6 -bottom-10 opacity-10 font-black text-9xl tracking-tighter text-amber-300 pointer-events-none select-none hidden sm:block">
          特定技能
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Overview Stats Grid */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift hover-shine-container transition-all duration-300 flex items-center gap-4 animate-fade-in-up delay-75">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
            12+
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Sectors</span>
            <strong className="text-lg font-black text-slate-900 dark:text-white">Occupational Exams</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Nursing, Food, Ag, etc.</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift hover-shine-container transition-all duration-300 flex items-center gap-4 animate-fade-in-up delay-150">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            CBT
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Format</span>
            <strong className="text-lg font-black text-slate-900 dark:text-white">Written + Practical</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Computer &amp; Skill Test</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift hover-shine-container transition-all duration-300 flex items-center gap-4 animate-fade-in-up delay-200">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            60%
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Pass Line</span>
            <strong className="text-lg font-black text-slate-900 dark:text-white">60% – 65% Threshold</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Varies by sector standard</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover-lift hover-shine-container transition-all duration-300 flex items-center gap-4 animate-fade-in-up delay-300">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-japan-red dark:text-rose-400 font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            A2
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Prerequisite</span>
            <strong className="text-lg font-black text-slate-900 dark:text-white">JFT-Basic OR N4</strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Required for visa</p>
          </div>
        </div>
      </div>

      {/* SSW Practice Mock Exams Section */}
      <div id="mock-tests" className="bg-white/90 dark:bg-slate-950/75 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)]">
        <PracticeTestGrid
          practiceTests={practiceTests}
          title="SSW Skill Practice Mock Exams"
          subtitle="Take Specified Skilled Worker sector practice tests online with instant scoring."
          catKey="skill"
        />
      </div>

      {/* Official SSW Examination Blueprint & Question Authoring Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-900 via-amber-950/60 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-amber-900/40 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            CBT Question Authoring &amp; Bulk Import
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">SSW Prometric Sample CSV Template</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Download our standardized CSV question template to create or bulk-import Specified Skilled Worker tests with Phase 1 Audio/Typing and Phase 2 Practical Occupational questions.
          </p>

          <div className="space-y-3">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/tests/sample-ssw-csv/`}
              download
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
            >
              <div>
                <strong className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  SSW Prometric Question CSV Template
                </strong>
                <p className="text-xs text-slate-300">UTF-8 CSV with Phase 1 Audio MCQ, Typing &amp; Phase 2 Practical</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-xs flex items-center gap-1">
                <span>Download</span>
                <Download className="w-3 h-3" />
              </span>
            </a>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/tests/test/import-csv/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
            >
              <div>
                <strong className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Admin CSV Bulk Uploader
                </strong>
                <p className="text-xs text-slate-300">Upload CSV to any practice test with auto AI voice (TTS)</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1.5 bg-white/20 text-white rounded-lg border border-white/20 flex items-center gap-1">
                <span>Open Admin</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)] space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold uppercase tracking-wider">
            CBT Structure Guide
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">SSW 2-Phase Prometric Format</h3>

          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white block">Phase 1: Audio Comprehension &amp; Typing (第1部)</strong>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Candidates listen to spoken dialogues and answer multiple-choice questions or type Japanese responses.</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                !
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white block">Phase Lock Modal (セクション終了確認)</strong>
                <span className="text-slate-500 dark:text-slate-400 text-xs">When completing Phase 1, a confirmation modal ensures candidate is ready to advance before permanently locking Phase 1.</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white block">Phase 2: Occupational Knowledge &amp; Judgment (第2部)</strong>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Workplace situational judgment, safety standards, and practical skills specific to each sector. Passing mark is 60%.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* SSW Sector Explorer Component */}
      <div id="ssw-sectors">
        <SswSectorExplorer sectorsData={sswSectors} />
      </div>

      {/* Bangladesh Test Venues Map */}
      <div id="ssw-venues">
        <JftCenterMap centersData={testCenters} />
      </div>

      {/* How to Check Availability & Registration Workflow */}
      <div className="bg-gradient-to-br from-slate-950 via-japan-navy to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            Booking Guidance
          </div>

          <h3 className="text-3xl font-extrabold tracking-tight">How to Check Exam Slots &amp; Seat Availability</h3>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            SSW Skill Test dates are scheduled periodically by designated Japanese testing bodies (Prometric, OTAFF, etc.) in Bangladesh. Seat reservations open roughly 1 to 2 months prior to each exam month.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <strong className="text-white text-sm font-bold block">1. Check Calendar</strong>
              <p className="text-xs text-slate-300">Prometric releases testing windows monthly for Dhaka and Chittagong.</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <strong className="text-white text-sm font-bold block">2. Buy Voucher</strong>
              <p className="text-xs text-slate-300">Vouchers must be purchased in BDT prior to seat reservation.</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <strong className="text-white text-sm font-bold block">3. Combine Results</strong>
              <p className="text-xs text-slate-300">Submit JFT-Basic + SSW Skill Certificate for your SSW Type 1 visa application.</p>
            </div>
          </div>

          {/* Local BDT Voucher Advice */}
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 space-y-1">
            <strong className="text-amber-300 font-extrabold flex items-center gap-1.5">
              <span>💳 Bangladesh Payment &amp; Voucher Note:</span>
            </strong>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              If you do not possess an international dual-currency credit card, you can purchase official Prometric test vouchers in local currency (BDT) directly via Universal Testing Services (UTC Dhanmondi BDJ01 &amp; Banani BDJ02) or authorized test center partners prior to booking your online seat.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="https://www.prometric-jp.com/en/ssw/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-7 py-3.5 rounded-2xl transition-all shadow-md text-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>Prometric SSW Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://www.mofa.go.jp/mofaj/ca/fna/ssw/us/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/15 transition-all text-sm flex items-center gap-1.5"
            >
              <span>MOFA Japan Guidelines</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
