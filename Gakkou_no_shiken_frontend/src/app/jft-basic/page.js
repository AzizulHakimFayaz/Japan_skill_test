'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getJftInfo } from '@/lib/api';
import PracticeTestGrid from '@/components/PracticeTestGrid';

const JftCenterMap = dynamic(() => import('@/components/JftCenterMap'), { ssr: false });
import {
  Laptop,
  Clock,
  CheckCircle2,
  Award,
  MapPin,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileCheck2,
} from 'lucide-react';

export default function JftBasicPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('script_vocab');
  const [openFaq, setOpenFaq] = useState(null);

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
  }, []);

  const jftInfo = data?.jft_info || {};
  const testCenters = data?.test_centers || [];
  const resources = data?.jft_resources || [];
  const practiceTests = data?.practice_tests || [];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-japan-navy to-indigo-950 text-white p-6 sm:p-14 shadow-2xl shadow-slate-900/30 border border-slate-800/80 animate-fade-in-up">
        <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-japan-red/20 border border-japan-red/40 text-rose-300 text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-japan-red animate-pulse"></span>
            Official Japanese Language Benchmark
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
            <a
              href="#mock-tests"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 text-xs sm:text-sm active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice Mock Exams</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a
              href="#test-centers"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/15 hover:border-white/30"
            >
              <MapPin className="w-4 h-4" />
              <span>Test Venues</span>
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
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
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

      {/* Online Practice Mock Exams Section */}
      <div id="mock-tests" className="bg-white/90 dark:bg-slate-950/75 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_35px_rgba(0,0,0,0.5)]">
        <PracticeTestGrid
          practiceTests={practiceTests}
          title="JFT-Basic Practice Mock Exams"
          subtitle="Take official-style JFT-Basic practice tests online with instant scoring."
          catKey="basic"
        />
      </div>

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
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/40 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
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

      {/* Bangladesh Test Centers Map */}
      <div id="test-centers">
        <JftCenterMap centersData={testCenters} />
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
            <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <strong className="font-extrabold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
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
