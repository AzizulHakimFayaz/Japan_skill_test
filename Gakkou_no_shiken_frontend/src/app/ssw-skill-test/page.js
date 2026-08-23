'use client';

import React, { useState, useEffect } from 'react';
import { getSswInfo } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';
import SswSectorExplorer from '@/components/SswSectorExplorer';
import JftCenterMap from '@/components/JftCenterMap';

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
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            Specified Skilled Worker Visa Prerequisite
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
              Sectors
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="#ssw-venues"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 hover:border-white/30"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Test Venues
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
        <div className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover-lift hover-shine-container transition-all duration-300 flex items-center gap-4 animate-fade-in-up delay-75">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
            12+
          </div>
          <div>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Sectors</span>
            <strong className="text-lg font-black text-slate-900">Occupational Exams</strong>
            <p className="text-xs text-slate-500 mt-0.5">Nursing, Food, Ag, etc.</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            CBT
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Format</span>
            <strong className="text-lg font-extrabold text-slate-900">Written + Practical</strong>
            <p className="text-xs text-slate-500 mt-0.5">Computer &amp; Skill Test</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            60%
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Pass Line</span>
            <strong className="text-lg font-extrabold text-slate-900">60% – 65% Threshold</strong>
            <p className="text-xs text-slate-500 mt-0.5">Varies by sector standard</p>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-japan-red font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
            A2
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Prerequisite</span>
            <strong className="text-lg font-extrabold text-slate-900">JFT-Basic OR JLPT N4</strong>
            <p className="text-xs text-slate-500 mt-0.5">Required for visa</p>
          </div>
        </div>
      </div>

      {/* SSW Practice Mock Exams Section */}
      <div id="mock-tests" className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-100">
        <PracticeTestGrid
          practiceTests={practiceTests}
          title="SSW Skill Practice Mock Exams"
          subtitle="Take Specified Skilled Worker sector practice tests online with instant scoring."
          catKey="skill"
        />
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
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-3">
                1
              </span>
              <strong className="text-white text-sm font-bold block mb-1">Check Calendar</strong>
              <p className="text-xs text-slate-300">Prometric releases testing windows monthly for Dhaka and Chittagong.</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-3">
                2
              </span>
              <strong className="text-white text-sm font-bold block mb-1">Buy Exam Voucher</strong>
              <p className="text-xs text-slate-300">Vouchers must be purchased in BDT prior to seat reservation.</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-3">
                3
              </span>
              <strong className="text-white text-sm font-bold block mb-1">Combine Results</strong>
              <p className="text-xs text-slate-300">Submit JFT-Basic + SSW Skill Certificate for your SSW Type 1 visa application.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="https://www.prometric-jp.com/en/ssw/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-7 py-3.5 rounded-2xl transition-all shadow-md text-sm active:scale-95"
            >
              Prometric SSW Official Portal ↗
            </a>
            <a
              href="https://www.mofa.go.jp/mofaj/ca/fna/ssw/us/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/15 transition-all text-sm"
            >
              MOFA Japan Official Guidelines ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
