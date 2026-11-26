'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { getHeroBanners, getNotices } from '@/lib/api';
import { useAuth } from './AuthContext';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Calendar,
  LayoutDashboard,
  Sparkles,
  UserPlus,
  Bell,
  BookMarked,
  Trophy,
  Building2,
} from 'lucide-react';

const DEFAULT_SLIDES = [
  {
    id: 'cbt-simulator',
    title: 'JFT-Basic & SSW CBT Mock Exams',
    subtitle:
      'Practice with authentic Prometric CBT timers, native Japanese listening audio, and instant 250-point CEFR score reports.',
    badge_text: 'CBT EXAM SIMULATOR',
    image_display: '/img/hero_professional_cbt.jpg',
    mobile_image_display: '/img/hero_professional_cbt.jpg',
    primary_btn_text: 'Start JFT-Basic',
    primary_btn_url: '/jft-basic',
  },
  {
    id: 'game-zone',
    title: 'Play & Master Japanese in Game Zone',
    subtitle:
      'Interactive arcade games with sound effects — Kanji Hunter, Word Match, Listen & Catch, and 3 Lives challenge.',
    badge_text: 'JAPANESE ARCADE',
    image_display: '/img/game_banner.jpg',
    mobile_image_display: '/img/game_banner.jpg',
    primary_btn_text: 'Play Games Now',
    primary_btn_url: '/game-zone',
  },
  {
    id: 'lessons-hub',
    title: 'Structured JLPT N5 & N4 Lessons',
    subtitle:
      'Master vocabulary, grammar, and Kanji with 7-language explanations and interactive flashcards.',
    badge_text: 'CURRICULUM & LESSONS',
    image_display: '/img/hero_anime_student.jpg',
    mobile_image_display: '/img/hero_anime_student.jpg',
    primary_btn_text: 'Start Lessons',
    primary_btn_url: '/lessons',
  },
  {
    id: 'jac-books',
    title: '26 Official JAC Textbooks & Audio',
    subtitle:
      'Read all 26 official JAC textbooks across 15 languages with synchronized cloud PDF and native audio player.',
    badge_text: 'PDF BOOKS & AUDIO',
    image_display: '/img/japanese_night_street.jpg',
    mobile_image_display: '/img/japanese_night_street.jpg',
    primary_btn_text: 'Read Textbooks',
    primary_btn_url: '/books',
  },
];

function stripLeadingEmoji(text) {
  if (!text) return '';
  return String(text)
    .replace(/^[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\s]+/gu, '')
    .trim();
}

function computeCountdown(isoDate) {
  if (!isoDate) return null;
  const parts = String(isoDate).slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { diffDays, formatted };
}

function formatShortDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function HeroBannerCarousel() {
  const { user, isAuthenticated } = useAuth();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [notices, setNotices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideIntervalRef = useRef(null);

  // Touch swipe support for mobile
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Fetch dynamic banners & latest official notices
  useEffect(() => {
    let isMounted = true;
    getHeroBanners()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((b, idx) => ({
            id: b.id || `banner-${idx}`,
            title: b.title || 'Practice Japanese CBT Exams',
            subtitle: b.subtitle || '',
            badge_text: stripLeadingEmoji(b.badge_text) || 'FEATURED',
            image_display: b.image_display || b.image_url || '/img/game_banner.jpg',
            mobile_image_display:
              b.mobile_image_display || b.mobile_image_url || b.image_display || '/img/game_banner.jpg',
            primary_btn_text: b.primary_btn_text || 'Explore Now',
            primary_btn_url: b.primary_btn_url || '/jft-basic',
          }));
          setSlides(formatted);
        }
      })
      .catch(() => {});

    getNotices()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data?.results || data?.notices || [];
        setNotices(list.slice(0, 3));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (isHovered || totalSlides <= 1) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isHovered, currentSlide, totalSlides]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  // Role & Personalized State
  const ownedSchool = user?.owned_partner_school;
  const isSensei = Boolean(isAuthenticated && ownedSchool?.slug);
  const displayName = user?.first_name?.trim() || user?.username || 'Candidate';
  const avatarUrl = user?.profile?.avatar_url || null;
  const targetExamDisplay = user?.profile?.target_exam_display || 'JFT-Basic (A2 Standard)';
  const countdown = useMemo(
    () => computeCountdown(user?.profile?.planned_exam_date),
    [user?.profile?.planned_exam_date]
  );

  const latestNotice = notices[0] || null;

  // Reusable circular avatar on the RIGHT side
  const renderRoundAvatar = (sizeClass = 'w-12 h-12') => (
    <Link
      href={isSensei ? `/partner/${encodeURIComponent(ownedSchool.slug)}` : '/student-portal?tab=profile'}
      title="View profile"
      className={`${sizeClass} rounded-full ring-2 ring-[#CBE5E3] dark:ring-slate-700 bg-gradient-to-tr from-[#2C687B] to-japan-red text-white font-black text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-sm hover:scale-105 transition-transform`}
    >
      {avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        displayName.slice(0, 1).toUpperCase()
      )}
    </Link>
  );

  return (
    <section
      aria-label="Hero Showcase and Live Updates"
      className="space-y-3 lg:space-y-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* =====================================================================
          SMART SPLIT HERO BENTO (Desktop 7/5 Split • Compact ~335px Height)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-stretch">
        {/* -------------------------------------------------------------------
            LEFT SIDE (7 cols on Desktop • Slim 172px Banner on Mobile)
           ------------------------------------------------------------------- */}
        <div
          className="lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090d16] text-white shadow-lg border border-slate-800/80 group select-none flex flex-col justify-between"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide Canvas */}
          <div className="relative flex-1 min-h-[172px] sm:min-h-[260px] lg:min-h-[296px] overflow-hidden">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  {/* Artwork */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url('${slide.image_display}')`,
                    }}
                  />
                  {/* Single clean directional scrim so artwork breathes on the right */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/92 via-[#070b14]/65 to-[#070b14]/15" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-transparent to-[#070b14]/25" />

                  {/* Single Clean Left Overlay (Headline + 1 Primary CTA) */}
                  <div className="relative z-10 h-full p-4 sm:p-6 lg:p-7 flex flex-col justify-between">
                    <div className="hidden sm:inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-wider text-[#8CC7C4]">
                      <Sparkles className="w-3 h-3" />
                      <span>{slide.badge_text}</span>
                    </div>

                    <div className="mt-auto space-y-2 sm:space-y-3 max-w-[88%] sm:max-w-[78%] pb-4 sm:pb-2">
                      <h1 className="text-lg sm:text-2xl lg:text-[26px] font-black tracking-tight leading-tight text-white drop-shadow-sm line-clamp-2">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="hidden sm:block text-xs lg:text-[13px] text-slate-200/90 font-medium leading-relaxed line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="pt-0.5 flex items-center gap-2.5">
                        <Link
                          href={slide.primary_btn_url}
                          className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-japan-red hover:bg-japan-redhover text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/25 active:scale-95 transition-all"
                        >
                          <span>{slide.primary_btn_text}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Desktop Prev/Next Arrows */}
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Indicator Dots */}
            {totalSlides > 1 && (
              <div className="absolute bottom-3 right-3.5 sm:right-5 z-20 flex items-center gap-1.5">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlide(dotIdx)}
                    aria-label={`Slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === dotIdx
                        ? 'w-6 bg-japan-red'
                        : 'w-1.5 bg-white/40 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Slim Community Strip along bottom of Left Carousel */}
          <div className="relative z-10 bg-slate-950/95 border-t border-slate-800/80 px-3.5 sm:px-5 py-2 flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold truncate"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Official WhatsApp Channel</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 hidden sm:inline" />
            </a>
            <div className="flex items-center gap-2 shrink-0 text-slate-300 font-bold">
              <a
                href="https://www.facebook.com/Gakkou.No.Shiken"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="https://www.instagram.com/gakkou.no.shiken/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            RIGHT SIDE (5 cols on Desktop • Round Avatar on Right + Live Notices)
            Zero duplication with the Exam/Lessons/Game cards below!
           ------------------------------------------------------------------- */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-3xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-5 shadow-md shadow-slate-200/40 dark:shadow-none">
          {/* Top Personalized Header — Round Profile Picture on the RIGHT */}
          {isSensei ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                    Sensei LMS Quick Launch
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                    {ownedSchool.name || `Welcome, ${displayName}`}
                  </h2>
                </div>
                {renderRoundAvatar('w-12 h-12')}
              </div>

              <Link
                href={`/partner/${encodeURIComponent(ownedSchool.slug)}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-extrabold text-xs flex items-center justify-between transition shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Sensei Academy Dashboard</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Welcome back,
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                      {displayName}
                    </h2>
                    {countdown && countdown.diffDays >= 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 text-[10px] font-black border border-red-200/70 dark:border-rose-800/60">
                        {countdown.diffDays === 0 ? 'Exam Today!' : `${countdown.diffDays}d to exam`}
                      </span>
                    ) : (
                      <Link
                        href="/student-portal?tab=profile"
                        className="px-2 py-0.5 rounded-full bg-[#F4FAFA] dark:bg-slate-800 text-[#2C687B] dark:text-[#8CC7C4] text-[10px] font-extrabold border border-[#CBE5E3] dark:border-slate-700 hover:border-[#2C687B] inline-flex items-center gap-1 transition"
                      >
                        <Calendar className="w-2.5 h-2.5" />
                        <span>Set Exam Date</span>
                      </Link>
                    )}
                  </div>
                </div>
                {renderRoundAvatar('w-12 h-12')}
              </div>

              <Link
                href="/student-portal"
                className="w-full py-2.5 px-4 rounded-xl bg-japan-red hover:bg-japan-redhover text-white font-extrabold text-xs flex items-center justify-between transition shadow-sm shadow-red-500/20"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Student Portal</span>
                </span>
                <span className="text-[10px] font-bold opacity-90 truncate max-w-[150px]">
                  {targetExamDisplay} →
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                    100% Free CBT Portal
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    Start Free CBT Practice
                  </h2>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#F4FAFA] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center shrink-0 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/logo.png" alt="Gakkou No Shiken" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/accounts/signup"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-japan-red hover:bg-japan-redhover text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-sm shadow-red-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Free Account</span>
                </Link>
                <Link
                  href="/accounts/login"
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Middle Section: Live Official Exam Notices & Updates (Unique value, zero duplication!) */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <Bell className="w-3.5 h-3.5 text-japan-red" />
                  <span>Latest Exam Notices</span>
                </span>
                <Link
                  href="/notices"
                  className="text-[11px] font-extrabold text-[#2C687B] dark:text-[#8CC7C4] hover:underline"
                >
                  View All →
                </Link>
              </div>

              {notices.length > 0 ? (
                <div className="space-y-1.5">
                  {notices.slice(0, 3).map((n) => (
                    <Link
                      key={n.id || n.title}
                      href="/notices"
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-[#F4FAFA] dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-japan-red shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-japan-red truncate">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {formatShortDate(n.created_at || n.published_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Stay updated with JFT-Basic, JLPT &amp; SSW Prometric exam schedules, seat openings, and study materials.
                </div>
              )}
            </div>

            {/* Bottom Unique Utility Pills (Resources not duplicated in the main grid below) */}
            <div className="grid grid-cols-3 gap-2 pt-3 mt-2">
              <Link
                href="/books"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F4FAFA] dark:bg-slate-800/70 border border-[#CBE5E3] dark:border-slate-700 hover:border-[#2C687B] text-[11px] font-extrabold text-slate-800 dark:text-slate-200 transition"
              >
                <BookMarked className="w-3.5 h-3.5 text-[#2C687B] dark:text-[#8CC7C4] shrink-0" />
                <span className="truncate">PDF Books</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 hover:border-amber-400 text-[11px] font-extrabold text-slate-800 dark:text-slate-200 transition"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">Ranks</span>
              </Link>
              <Link
                href="/partners"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-[11px] font-extrabold text-slate-800 dark:text-slate-200 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
                <span className="truncate">Schools</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MOBILE & TABLET COMPACT ROLE + LIVE NOTICE CARD (< lg)
          Zero duplicate JFT/JLPT/SSW tiles — keeps the Exam Suite higher up!
         ===================================================================== */}
      <div className="lg:hidden rounded-2xl bg-white dark:bg-[#0f1629] border border-[#CBE5E3] dark:border-slate-800 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isSensei ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#2C687B] dark:text-[#8CC7C4]">
                  Sensei LMS Portal
                </p>
                <Link
                  href={`/partner/${encodeURIComponent(ownedSchool.slug)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white hover:text-japan-red truncate max-w-full"
                >
                  <span className="truncate">{ownedSchool.name || displayName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-japan-red shrink-0" />
                </Link>
              </>
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Hi, {displayName}
                  </p>
                  {countdown && countdown.diffDays >= 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 text-[10px] font-black">
                      {countdown.diffDays === 0 ? 'Exam Today!' : `${countdown.diffDays}d left`}
                    </span>
                  )}
                </div>
                <Link
                  href="/student-portal"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2C687B] dark:text-[#8CC7C4] mt-0.5"
                >
                  <span>Open Student Portal</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Free Japanese CBT Portal
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href="/accounts/signup"
                    className="px-3 py-1 rounded-lg bg-japan-red text-white text-[11px] font-extrabold"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/accounts/login"
                    className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Circular Avatar on the RIGHT */}
          {isAuthenticated ? (
            renderRoundAvatar('w-10 h-10')
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#F4FAFA] dark:bg-slate-800 border border-[#CBE5E3] dark:border-slate-700 flex items-center justify-center shrink-0 p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo.png" alt="Gakkou No Shiken" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* 1-Line Live Exam Notice Ticker */}
        <Link
          href="/notices"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[11px]"
        >
          <span className="flex items-center gap-1.5 min-w-0 font-bold text-slate-700 dark:text-slate-200">
            <Bell className="w-3.5 h-3.5 text-japan-red shrink-0" />
            <span className="truncate">
              {latestNotice ? latestNotice.title : 'Check latest JFT-Basic, JLPT & SSW exam notices'}
            </span>
          </span>
          <span className="text-[10px] font-extrabold text-[#2C687B] dark:text-[#8CC7C4] shrink-0">
            Notices →
          </span>
        </Link>
      </div>
    </section>
  );
}
