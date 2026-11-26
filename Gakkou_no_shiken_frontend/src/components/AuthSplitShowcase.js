'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, LayoutDashboard, GraduationCap, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const CANDIDATE_SLIDES = [
  {
    id: 'cbt',
    badge: 'PROMETRIC CBT SIMULATOR',
    title: 'Authentic JFT-Basic, JLPT & SSW Mock Panel',
    subtitle:
      'Practice with real exam timers, native Japanese listening audio, 4-section question navigator, and instant 250-point CEFR scorecards.',
    mainImg: '/img/auth/cbt-mock-preview.webp',
    mainAlt: 'Gakkou No Shiken CBT Mock Exam Interface',
    secondaryImg: '/img/auth/student-portal-preview.webp',
    secondaryAlt: 'Gakkou No Shiken Student Portal Preview',
    pills: ['Real CBT Timer', 'Native Audio', 'CEFR 250-Pt Score'],
    icon: Monitor,
  },
  {
    id: 'portal',
    badge: 'UNIFIED STUDENT LMS',
    title: 'Your All-in-One Japanese Study Workspace',
    subtitle:
      'Track learning hours, watch academy video classes, take Sensei-assigned mock exams, and keep your daily Japanese streak alive.',
    mainImg: '/img/auth/student-portal-preview.webp',
    mainAlt: 'Gakkou No Shiken Student Portal Dashboard',
    secondaryImg: '/img/auth/cbt-mock-preview.webp',
    secondaryAlt: 'Gakkou No Shiken CBT Mock Exam Preview',
    pills: ['Video Courses', 'Exam Diagnostics', 'Study Calendar'],
    icon: LayoutDashboard,
  },
];

const SENSEI_SLIDES = [
  {
    id: 'sensei-lms',
    badge: 'SENSEI & LPK COMMAND CENTER',
    title: 'Manage Batches, Mock Routines & Video Courses',
    subtitle:
      'Assign live mock exams with 4-digit attendance PINs, track Star Students across batches, upload lessons, and lock your academy with a 6-digit Join PIN.',
    mainImg: '/img/auth/sensei-portal-preview.webp',
    mainAlt: 'Gakkou No Shiken Sensei LMS Portal Dashboard',
    pills: ['6-Digit Anti-Leak PIN', 'Batch Analytics', 'CSV Score Export'],
    icon: GraduationCap,
  },
];

export default function AuthSplitShowcase({ role = 'candidate', variant = 'desktop' }) {
  const isSchool = role === 'school';
  const slides = isSchool ? SENSEI_SLIDES : CANDIDATE_SLIDES;
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset slide index when role switches
  useEffect(() => {
    setActiveIdx(0);
  }, [role]);

  // Auto-cycle candidate slides smoothly
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeIdx % slides.length] || slides[0];
  const BadgeIcon = current.icon || Sparkles;

  // =========================================================================
  // COMPACT MOBILE & TABLET TOP BANNER (< lg)
  // =========================================================================
  if (variant === 'mobile') {
    return (
      <div
        className={`lg:hidden relative overflow-hidden rounded-2xl p-4 text-white shadow-lg ${
          isSchool
            ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B1120]'
            : 'bg-gradient-to-br from-[#0E2A33] via-[#205162] to-[#0B1E25]'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5">
          {/* Screenshot thumbnail */}
          <div className="w-full sm:w-44 md:w-56 shrink-0 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-white/95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.mainImg}
              alt={current.mainAlt}
              className="w-full h-28 sm:h-28 md:h-32 object-cover object-top"
            />
          </div>
          {/* Copy + switcher */}
          <div className="flex-1 min-w-0 text-left w-full">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-black tracking-wider uppercase mb-1.5">
              <BadgeIcon className="w-3 h-3 text-[#8CC7C4]" />
              <span>{current.badge}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black leading-snug tracking-tight">
              {current.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-200/90 mt-1 line-clamp-2">
              {current.subtitle}
            </p>
            {slides.length > 1 && (
              <div className="flex items-center gap-2 mt-2.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                      idx === activeIdx
                        ? 'bg-white text-[#143946] shadow-xs'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {idx === 0 ? 'CBT Mock Panel' : 'Student Portal'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FULL DESKTOP RIGHT-HAND SHOWCASE PANEL (lg+)
  // =========================================================================
  return (
    <div
      className={`hidden lg:flex relative flex-col justify-between overflow-hidden rounded-[22px] p-8 xl:p-12 text-white select-none w-full min-h-[640px] h-full ${
        isSchool
          ? 'bg-gradient-to-br from-[#0F172A] via-[#1B2B44] to-[#0B1220]'
          : 'bg-gradient-to-br from-[#0E2E38] via-[#205566] to-[#0A1F26]'
      }`}
    >
      {/* Subtle Architectural Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Ambient Radial Glows */}
      <div
        className={`pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-35 ${
          isSchool ? 'bg-sky-500' : 'bg-[#8CC7C4]'
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-25 ${
          isSchool ? 'bg-indigo-500' : 'bg-[#DB1A1A]'
        }`}
      />

      {/* Top Role Badge + Quick Slide Toggle (for Candidate) */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/20 text-[11px] font-black tracking-wider uppercase">
          <BadgeIcon className="w-3.5 h-3.5 text-[#8CC7C4]" />
          <span>{current.badge}</span>
        </span>

        {slides.length > 1 && (
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                  idx === activeIdx
                    ? 'bg-white text-[#123743] shadow-sm'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {idx === 0 ? 'Mock Panel' : 'Student Portal'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center Floating Layered Screenshots (Sticky so tall forms always keep showcase centered) */}
      <div className="relative z-10 my-6 flex-1 flex items-center justify-center">
        <div className="lg:sticky lg:top-28 relative w-full max-w-[600px]">
          {/* Primary Screenshot Card */}
          <div className="relative z-20 rounded-2xl overflow-hidden bg-white p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-white/40 transition-all duration-500">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-t-xl border-b border-slate-200/80">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DB1A1A]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[10px] font-bold text-slate-500 truncate">
                {isSchool
                  ? 'gakkounoshiken.site/partner/sensei-lms'
                  : activeIdx === 0
                  ? 'gakkounoshiken.site/test/jft-basic-cbt'
                  : 'gakkounoshiken.site/student-portal'}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.mainImg}
              src={current.mainImg}
              alt={current.mainAlt}
              className="w-full h-[250px] xl:h-[310px] object-cover object-top rounded-b-xl animate-fade-in"
            />
          </div>

          {/* Secondary Floating Preview Card (Candidate: shows both Mock Panel & Student Portal together!) */}
          {!isSchool && current.secondaryImg && (
            <div
              onClick={() => setActiveIdx((prev) => (prev + 1) % slides.length)}
              title="Click to switch preview"
              className="relative z-30 -mt-12 ml-auto mr-2 w-[62%] rounded-xl overflow-hidden bg-white p-1 shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-white/60 cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="px-2 py-1 bg-[#143946] text-white text-[9px] font-black uppercase tracking-wider rounded-t-lg flex items-center justify-between">
                <span>{activeIdx === 0 ? 'Student LMS Portal' : 'Prometric CBT Exam'}</span>
                <span className="text-[#8CC7C4]">Switch ↗</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.secondaryImg}
                alt={current.secondaryAlt}
                className="w-full h-[108px] object-cover object-top rounded-b-lg"
              />
            </div>
          )}

          {/* Floating Status Pill for Sensei Portal */}
          {isSchool && (
            <div className="relative z-30 -mt-7 ml-auto mr-3 w-fit flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 text-slate-900 shadow-[0_16px_36px_rgba(0,0,0,0.35)] border border-white">
              <div className="w-8 h-8 rounded-xl bg-[#DB1A1A] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Anti-Leak Class Gate
                </p>
                <p className="text-xs font-black text-slate-900">
                  6-Digit Join PIN + Approval Queue
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Brand Emblem, Copy & Kezak-style Progress Bars */}
      <div className="relative z-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 mx-auto flex items-center justify-center shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo.png"
            alt="Gakkou No Shiken"
            className="w-8 h-8 object-contain"
          />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-xl xl:text-2xl font-black tracking-tight leading-snug">
            {current.title}
          </h2>
          <p className="text-xs xl:text-sm text-slate-200/85 leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {current.pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-slate-100"
            >
              <CheckCircle2 className="w-3 h-3 text-[#8CC7C4]" />
              {pill}
            </span>
          ))}
        </div>

        {/* Kezak-style Bottom Slide Progress Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {(slides.length > 1 ? slides : [0, 1, 2]).map((item, idx) => {
            const isActive = slides.length > 1 ? idx === activeIdx : idx === 0;
            return (
              <button
                key={typeof item === 'object' ? item.id : item}
                type="button"
                onClick={() => slides.length > 1 && setActiveIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  slides.length > 1 ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isActive ? 'w-14 bg-white' : 'w-8 bg-white/25 hover:bg-white/45'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
