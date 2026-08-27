'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ShieldCheck,
  Globe,
  CheckCircle2,
  BookOpen,
  Layers,
  Trophy,
  MapPin,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#050811] text-slate-300 border-t border-slate-800/80 mt-16 pt-12 sm:pt-16 pb-20 sm:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand Info & Mission (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/logo.png"
                alt="Gakkou No Shiken - JFT & SSW CBT Platform"
                className="h-10 w-auto object-contain filter drop-shadow-md"
              />
              <div>
                <span className="font-black text-xl text-white tracking-tight block">
                  Gakkou No <span className="text-japan-red">Shiken</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 block tracking-wide">
                  学校の試験 • Bangladesh&apos;s #1 CBT Portal
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Bangladesh&apos;s premier Computer-Based Testing (CBT) simulator for candidates aspiring to work in Japan. Practice authentic JFT-Basic &amp; SSW skill tests with native audio and instant CEFR score diagnostics.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>2026 Prometric Format</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>10 Languages</span>
              </span>
            </div>
          </div>

          {/* Column 2: Examination Tracks */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-japan-red" />
              <span>Exam Tracks</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li>
                <Link href="/jft-basic" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>JFT-Basic A2 Guide</span>
                  <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">A2</span>
                </Link>
              </li>
              <li>
                <a href="/#practice-grid" className="hover:text-white transition-colors">
                  JFT-Basic Practice Tests
                </a>
              </li>
              <li>
                <Link href="/ssw-skill-test" className="hover:text-white transition-colors">
                  SSW 12 Industry Sectors
                </Link>
              </li>
              <li>
                <Link href="/ssw-skill-test" className="hover:text-white transition-colors">
                  Nursing Care (介護) Test
                </Link>
              </li>
              <li>
                <Link href="/ssw-skill-test" className="hover:text-white transition-colors">
                  Food Service (外食) Test
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>National Leaderboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Test Venues */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>BD Test Centers</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li>
                <a href="/#test-centers" className="hover:text-white transition-colors">
                  Dhaka Prometric Center
                </a>
              </li>
              <li>
                <a href="/#test-centers" className="hover:text-white transition-colors">
                  Chittagong CBT Venue
                </a>
              </li>
              <li>
                <Link href="/jft-basic#jft-format" className="hover:text-white transition-colors">
                  CEFR A2 Passing Criteria
                </Link>
              </li>
              <li>
                <Link href="/jft-basic#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/accounts/signup" className="hover:text-emerald-400 transition-colors">
                  Create Candidate Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Affiliations & Socials */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Official Links</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li>
                <a
                  href="https://www.prometric-jp.com/en/jftbasic/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Prometric Japan Official</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jpf.go.jp/e/project/japanese/education/jft-basic/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Japan Foundation</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/Gakkou.No.Shiken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Facebook Study Group</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>WhatsApp Updates</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/gakkou.no.shiken/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors flex items-center gap-1"
                >
                  <span>Instagram Channel</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Disclaimer: </strong>
          Gakkou No Shiken (学校の試験) is an independent examination preparatory platform designed for Bangladeshi candidates. Prometric®, JFT-Basic®, and JLPT® are registered trademarks of their respective organizations. This platform provides practice simulation material aligned with official testing standards.
        </div>

        {/* Bottom Bar: Copyright & Engine Status */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Gakkou No Shiken. All rights reserved. Bangladesh&apos;s #1 Japanese CBT Platform.
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Prometric CBT Engine Live</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
