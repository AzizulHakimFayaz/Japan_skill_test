'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getHeroBanners, getLeaderboard } from '@/lib/api';
import { useLanguage } from './LanguageContext';
import {
  Gamepad2,
  BookOpen,
  Layers,
  Trophy,
  CheckCircle2,
  Globe,
  Zap,
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  UtensilsCrossed,
  Wheat,
  Building2,
  HardHat,
  Crown,
  Medal,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
  Flame,
  Play,
  Swords,
  Headphones,
  Compass,
} from 'lucide-react';

// Default initial slides (publicizing Game Zone, Lessons, CBT, JAC Books, SSW)
const DEFAULT_SLIDES = [
  {
    id: 'game-zone',
    title: 'Play & Master Japanese in Game Zone',
    title_highlight: 'Game Zone Arcade',
    subtitle: 'Interactive arcade games with sound effects! Kanji Hunter, Word Match, Sentence Builder & 3 Lives challenge.',
    mobile_headline_lines: ['PLAY.', 'LEARN.', 'CONQUER.'],
    badge_text: '🎮 JAPANESE ARCADE GAME ZONE',
    badge_icon: 'gamepad',
    image_display: '/img/game_banner.jpg',
    mobile_image_display: '/img/game_banner.jpg',
    primary_btn_text: 'Play Games Now',
    primary_btn_url: '/game-zone',
    secondary_btn_text: 'Hall of Fame',
    secondary_btn_url: '/game-zone/ranks',
    theme_color: 'purple',
    type: 'game',
  },
  {
    id: 'lessons-hub',
    title: 'Master Structured JLPT N5 & N4 Lessons',
    title_highlight: 'Japanese Lessons',
    subtitle: 'Structured vocabulary, Kanji stroke orders, and native pronunciation with English and Bengali translations.',
    mobile_headline_lines: ['MASTER.', 'VOCAB & KANJI.', 'N5 / N4.'],
    badge_text: '📚 STRUCTURED LESSONS (N5 • N4)',
    badge_icon: 'book',
    image_display: '/img/hero_anime_student.jpg',
    mobile_image_display: '/img/hero_anime_student.jpg',
    primary_btn_text: 'Start Lessons',
    primary_btn_url: '/lessons',
    secondary_btn_text: 'Study Flashcards',
    secondary_btn_url: '/tools/flashcards',
    theme_color: 'cyan',
    type: 'lessons',
  },
  {
    id: 'cbt-simulator',
    title: 'JFT-Basic & SSW CBT Mock Exams',
    title_highlight: 'CBT Mock Exams',
    subtitle: "Bangladesh's #1 official Prometric test simulator with native listening audio, instant CEFR score report & pass certificates.",
    mobile_headline_lines: ['AUTHENTIC.', 'PROMETRIC CBT.', 'CEFR PASS.'],
    badge_text: "🇧🇩 BANGLADESH'S #1 CBT SIMULATOR",
    badge_icon: 'zap',
    image_display: '/img/hero_professional_cbt.jpg',
    mobile_image_display: '/img/hero_professional_cbt.jpg',
    primary_btn_text: 'Start JFT Test',
    primary_btn_url: '/jft-basic',
    secondary_btn_text: 'SSW Skill Tests',
    secondary_btn_url: '/ssw-skill-test',
    theme_color: 'rose',
    type: 'cbt',
  },
  {
    id: 'jac-books',
    title: '26 Official JAC Textbooks & Synchronized Audio',
    title_highlight: 'JAC Textbooks',
    subtitle: 'All 26 official JAC textbooks across 15 languages with synchronized cloud PDF reader and native audio player.',
    mobile_headline_lines: ['26 BOOKS.', '15 LANGUAGES.', 'NATIVE AUDIO.'],
    badge_text: '📖 26 JAC TEXTBOOKS (15 LANGUAGES)',
    badge_icon: 'book',
    image_display: '/img/japanese_night_street.jpg',
    mobile_image_display: '/img/japanese_night_street.jpg',
    primary_btn_text: 'Read Textbooks',
    primary_btn_url: '/books',
    secondary_btn_text: 'JAC Guide',
    secondary_btn_url: '/guides/jac-textbooks-guide',
    theme_color: 'emerald',
    type: 'books',
  },
  {
    id: 'ssw-sectors',
    title: 'Launch Your Career in Japan with SSW Visa',
    title_highlight: 'Japan with SSW',
    subtitle: 'Prepare for official Prometric exams in Nursing Care, Food Service, Agriculture, and 12 Specified Skilled Worker sectors.',
    mobile_headline_lines: ['SSW VISA.', '12 SECTORS.', 'JAPAN READY.'],
    badge_text: '💼 12 SSW INDUSTRY SECTORS',
    badge_icon: 'shield',
    image_display: '/img/hero_professional_cbt.jpg',
    mobile_image_display: '/img/hero_professional_cbt.jpg',
    primary_btn_text: 'Explore Sectors',
    primary_btn_url: '/ssw-skill-test',
    secondary_btn_text: 'SSW Guide',
    secondary_btn_url: '/guides/ssw-skill-test-guide',
    theme_color: 'emerald',
    type: 'ssw',
  },
];

export default function HeroBannerCarousel() {
  const { t } = useLanguage();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideIntervalRef = useRef(null);

  // Touch swipe support for mobile
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Top 3 candidate scores for leaderboard showcase
  const [topThree, setTopThree] = useState([
    { rank: 1, name: 'Kenji Tanaka', username: 'kenji_tanaka', score: 245, exam: 'JFT-Basic A2' },
    { rank: 2, name: 'Rahim Ahmed', username: 'rahim_ahmed', score: 238, exam: 'SSW Nursing' },
    { rank: 3, name: 'Aung Min', username: 'aung_min', score: 225, exam: 'SSW Food' },
  ]);

  // Fetch dynamic banners from backend API
  useEffect(() => {
    let isMounted = true;
    getHeroBanners()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Merge backend fields with fallbacks
          const formatted = data.map((b, idx) => ({
            id: b.id || `banner-${idx}`,
            title: b.title,
            title_highlight: b.title_highlight || '',
            subtitle: b.subtitle || '',
            badge_text: b.badge_text || 'FEATURED',
            badge_icon: b.badge_icon || 'zap',
            image_display: b.image_display || b.image_url || '/img/game_banner.jpg',
            mobile_image_display: b.mobile_image_display || b.mobile_image_url || b.image_display || '/img/game_banner.jpg',
            primary_btn_text: b.primary_btn_text || 'Explore Now',
            primary_btn_url: b.primary_btn_url || '/game-zone',
            secondary_btn_text: b.secondary_btn_text || '',
            secondary_btn_url: b.secondary_btn_url || '',
            theme_color: b.theme_color || 'purple',
            mobile_headline_lines: b.title
              ? b.title.split(' ').slice(0, 3).map((w) => w.toUpperCase() + '.')
              : ['EXPLORE.', 'PRACTICE.', 'MASTER.'],
            type: b.primary_btn_url?.includes('game')
              ? 'game'
              : b.primary_btn_url?.includes('lesson')
              ? 'lessons'
              : b.primary_btn_url?.includes('book')
              ? 'books'
              : b.primary_btn_url?.includes('ssw')
              ? 'ssw'
              : 'cbt',
          }));
          setSlides(formatted);
        }
      })
      .catch(() => {});

    // Fetch leaderboard
    getLeaderboard()
      .then((data) => {
        if (isMounted && data?.top_three && data.top_three.length > 0) {
          const formatted = data.top_three.map((c, i) => ({
            rank: i + 1,
            name: c.full_name || c.username || `Candidate #${i + 1}`,
            username: c.username || `candidate_${i + 1}`,
            score: c.highest_score || c.avg_score || 200,
            exam: c.target_exam_display || 'JFT-Basic',
          }));
          setTopThree(formatted);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-play interval
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

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const activeSlide = slides[currentSlide] || slides[0];

  // Helper theme colors for border, glow, buttons
  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'purple':
        return {
          glow: 'shadow-[0_0_35px_rgba(168,85,247,0.22)]',
          border: 'border-purple-500/40',
          badgeBg: 'bg-purple-950/80 border-purple-400/50 text-purple-300',
          gradientText: 'from-purple-400 via-pink-400 to-amber-300',
          primaryBtn: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/35',
          dot: 'bg-purple-500',
          accent: 'text-purple-400',
        };
      case 'cyan':
        return {
          glow: 'shadow-[0_0_35px_rgba(6,182,212,0.22)]',
          border: 'border-cyan-500/40',
          badgeBg: 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300',
          gradientText: 'from-cyan-300 via-teal-300 to-emerald-300',
          primaryBtn: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-600/35',
          dot: 'bg-cyan-400',
          accent: 'text-cyan-400',
        };
      case 'emerald':
        return {
          glow: 'shadow-[0_0_35px_rgba(16,185,129,0.22)]',
          border: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300',
          gradientText: 'from-emerald-400 via-teal-300 to-cyan-300',
          primaryBtn: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/35',
          dot: 'bg-emerald-500',
          accent: 'text-emerald-400',
        };
      case 'amber':
        return {
          glow: 'shadow-[0_0_35px_rgba(245,158,11,0.22)]',
          border: 'border-amber-500/40',
          badgeBg: 'bg-amber-950/80 border-amber-400/50 text-amber-300',
          gradientText: 'from-amber-400 via-yellow-300 to-orange-400',
          primaryBtn: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/35 text-slate-950',
          dot: 'bg-amber-400',
          accent: 'text-amber-400',
        };
      case 'rose':
      default:
        return {
          glow: 'shadow-[0_0_35px_rgba(220,38,38,0.22)]',
          border: 'border-red-500/40',
          badgeBg: 'bg-rose-950/80 border-rose-400/50 text-rose-300',
          gradientText: 'from-rose-400 via-japan-red to-amber-300',
          primaryBtn: 'bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-rose-700 shadow-red-500/35',
          dot: 'bg-japan-red',
          accent: 'text-rose-400',
        };
    }
  };

  const themeStyle = getThemeStyles(activeSlide.theme_color);

  return (
    <div
      className="space-y-3 sm:space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================
          MAIN HERO BANNER CONTAINER
          - On mobile: Exact proportions and card layout from user reference photo
          - On desktop: Rich glassmorphic wide layout with interactive widgets
          ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090d16] text-white shadow-2xl shadow-slate-950/60 border border-slate-800/80 group select-none">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const slideTheme = getThemeStyles(slide.theme_color);

          return (
            <div
              key={slide.id || idx}
              className={`transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'
              }`}
            >
              {/* ──────────────────────────────────────────────────────────
                  DESKTOP BACKGROUND ARTWORK (Rich wide art from backend)
                  ────────────────────────────────────────────────────────── */}
              <div
                className="hidden sm:block absolute inset-0 bg-cover bg-[position:center_center] bg-no-repeat opacity-90 pointer-events-none transition-transform duration-1000 scale-100"
                style={{ backgroundImage: `url('${slide.image_display}')` }}
              />
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/80 pointer-events-none" />
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/50 pointer-events-none" />

              {/* ──────────────────────────────────────────────────────────
                  MOBILE BANNER VIEW: Exact Card Proportions from User Photo
                  (Aspect ratio ~16:9, bold stacked headline, badge, pill button,
                  and picture positioned on right with high-contrast gradient)
                  ────────────────────────────────────────────────────────── */}
              <div className="block sm:hidden relative w-full aspect-[16/9] min-h-[200px] max-h-[245px] overflow-hidden rounded-2xl bg-slate-950 text-white">
                {/* Background Picture from Backend */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: `url('${slide.mobile_image_display || slide.image_display}')` }}
                />

                {/* High contrast gradient overlay: solid black on left for crystal-clear readability, fading to reveal picture on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40 pointer-events-none" />

                {/* Foreground Mobile Card Content */}
                <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-rose-300">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                      <span className="truncate max-w-[190px]">{slide.badge_text}</span>
                    </div>

                    <span className="text-[9px] font-extrabold text-slate-300 bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
                      {idx + 1}/{totalSlides}
                    </span>
                  </div>

                  {/* Middle Content: Stacked Bold Headline like Reference Photo */}
                  <div className="space-y-1 pr-14">
                    <h2 className="text-base font-black tracking-tight leading-tight text-white drop-shadow-md">
                      {slide.title}
                    </h2>
                    <p className="text-[10px] text-slate-300 font-medium line-clamp-1 drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action: High-Contrast Pill Button like Reference Photo */}
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={slide.primary_btn_url}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-japan-red hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/40 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{slide.primary_btn_text}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    {slide.secondary_btn_text && (
                      <Link
                        href={slide.secondary_btn_url}
                        className="text-[10px] font-bold text-slate-300 hover:text-white underline decoration-dotted transition-colors"
                      >
                        {slide.secondary_btn_text}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mobile Bottom Centered Pagination Dots (Exact style as Reference Photo) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-auto">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentSlide(dotIdx)}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === dotIdx
                          ? 'w-5 bg-japan-red shadow-sm'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  DESKTOP WIDE VIEW: Full interactive dual-card experience
                  ────────────────────────────────────────────────────────── */}
              <div className="hidden sm:block relative z-10 p-6 sm:p-8 lg:p-10 space-y-4 sm:space-y-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-10">
                  {/* Left Glass Card */}
                  <div
                    className={`relative w-full max-w-md xl:max-w-lg bg-black/65 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border ${slideTheme.border} ${slideTheme.glow} ring-1 ring-white/15 space-y-3 sm:space-y-4`}
                  >
                    {/* Badge Pill */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${slideTheme.badgeBg} shadow-md text-[10px] sm:text-xs font-black tracking-wide`}
                    >
                      <Sparkles className="w-3 h-3 animate-spin text-amber-300" />
                      <span>{slide.badge_text}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/img/logo.png"
                        alt="Gakkou No Shiken"
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain filter drop-shadow-md"
                      />
                      <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase">
                        GAKKOU NO SHIKEN • 2026 EDITION
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                      {slide.title_highlight ? (
                        <>
                          {slide.title.replace(slide.title_highlight, '')}{' '}
                          <span
                            className={`text-transparent bg-clip-text bg-gradient-to-r ${slideTheme.gradientText}`}
                          >
                            {slide.title_highlight}
                          </span>
                        </>
                      ) : (
                        slide.title
                      )}
                    </h1>

                    <p className="text-[11px] sm:text-sm text-slate-200/95 font-medium leading-relaxed drop-shadow-xs">
                      {slide.subtitle}
                    </p>

                    {/* Quick Feature Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {slide.type === 'game' ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/40 text-purple-200 text-[10px] font-bold">
                            <Gamepad2 className="w-3 h-3 text-purple-400" />
                            <span>8 Arcade Modes</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/25 border border-pink-500/40 text-pink-200 text-[10px] font-bold">
                            <Swords className="w-3 h-3 text-pink-400" />
                            <span>Kanji Hunter</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>Global Ranks</span>
                          </span>
                        </>
                      ) : slide.type === 'lessons' ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold">
                            <GraduationCap className="w-3 h-3 text-cyan-400" />
                            <span>JLPT N5 &amp; N4</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold">
                            <Headphones className="w-3 h-3 text-emerald-400" />
                            <span>Audio Pronunciation</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold">
                            <span>Bilingual (EN • BN)</span>
                          </span>
                        </>
                      ) : slide.type === 'books' ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold">
                            <span>26 JAC Textbooks</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold">
                            <span>15 National Languages</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold">
                            <span>Native Voice Audio</span>
                          </span>
                        </>
                      ) : slide.type === 'ssw' ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold">
                            <span>12 SSW Sectors</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold">
                            <span>Prometric CBT</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold">
                            <span>Visa Ready</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[10px] font-bold">
                            <span>JFT-Basic A2</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[10px] font-bold">
                            <span>Prometric Simulator</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold">
                            <span>Instant Certificate</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <Link
                        href={slide.primary_btn_url}
                        className={`inline-flex items-center justify-center gap-1.5 ${slideTheme.primaryBtn} text-white font-extrabold py-3 px-4 rounded-xl transition-all duration-300 text-xs sm:text-sm active:scale-95 text-center shadow-lg cursor-pointer`}
                      >
                        <span>{slide.primary_btn_text}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {slide.secondary_btn_text && (
                        <Link
                          href={slide.secondary_btn_url}
                          className="inline-flex items-center justify-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl backdrop-blur-md transition-all duration-300 text-xs sm:text-sm border border-slate-700 hover:border-slate-500 active:scale-95 text-center cursor-pointer"
                        >
                          <span>{slide.secondary_btn_text}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Interactive Showcase Widget (Desktop) */}
                  <div className="hidden lg:flex flex-col items-end flex-shrink-0 relative">
                    {slide.type === 'game' ? (
                      /* Game Zone Showcase */
                      <div className="relative w-72 xl:w-80 rounded-3xl bg-slate-950/85 border border-purple-500/40 p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                              ARCADE ZONE LIVE
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-400/20 text-purple-300 border border-purple-400/40">
                            8 MODES
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/game-zone/kanji-hunter"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center text-center space-y-1 transition-all group/item"
                          >
                            <Swords className="w-6 h-6 text-pink-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-xs font-black text-white">Kanji Hunter</span>
                            <span className="text-[9px] text-slate-400">Boss Battle</span>
                          </Link>

                          <Link
                            href="/game-zone/word-match"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center text-center space-y-1 transition-all group/item"
                          >
                            <Gamepad2 className="w-6 h-6 text-purple-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-xs font-black text-white">Word Match</span>
                            <span className="text-[9px] text-slate-400">Card Pairs</span>
                          </Link>

                          <Link
                            href="/game-zone/listen-catch"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center text-center space-y-1 transition-all group/item"
                          >
                            <Headphones className="w-6 h-6 text-cyan-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-xs font-black text-white">Listen &amp; Catch</span>
                            <span className="text-[9px] text-slate-400">Audio Quiz</span>
                          </Link>

                          <Link
                            href="/game-zone/three-lives"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center text-center space-y-1 transition-all group/item"
                          >
                            <Flame className="w-6 h-6 text-amber-400 group-hover/item:scale-110 transition-transform" />
                            <span className="text-xs font-black text-white">3 Lives</span>
                            <span className="text-[9px] text-slate-400">Survival</span>
                          </Link>
                        </div>

                        <Link
                          href="/game-zone"
                          className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center gap-1.5 text-xs font-black text-purple-200 hover:bg-purple-900/60 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 text-purple-400" />
                          <span>Enter Japanese Arcade →</span>
                        </Link>
                      </div>
                    ) : slide.type === 'lessons' ? (
                      /* Lessons Hub Showcase */
                      <div className="relative w-72 xl:w-80 rounded-3xl bg-slate-950/85 border border-cyan-500/40 p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                              CURRICULUM HUB
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                            N5 &amp; N4
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Link
                            href="/lessons"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center">
                                N5
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">JLPT N5 Core Lessons</div>
                                <div className="text-[10px] text-slate-400">25 Structured Units</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-cyan-400" />
                          </Link>

                          <Link
                            href="/lessons"
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center">
                                N4
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">JLPT N4 Intermediate</div>
                                <div className="text-[10px] text-slate-400">Grammar &amp; Vocabulary</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-teal-400" />
                          </Link>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center gap-1.5 text-xs font-extrabold text-cyan-300">
                          <GraduationCap className="w-4 h-4 text-cyan-400" />
                          <span>100% Free Structured Lessons</span>
                        </div>
                      </div>
                    ) : slide.type === 'books' ? (
                      /* JAC Textbooks Showcase */
                      <div className="relative w-72 xl:w-80 rounded-3xl bg-slate-950/85 border border-emerald-500/40 p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                              JAC TEXTBOOK LIBRARY
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                            15 LANGS
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                            <span className="text-2xl">🇧🇩</span>
                            <div>
                              <div className="text-xs font-bold text-white">Bengali Edition</div>
                              <div className="text-[10px] text-slate-400">JAC Civil &amp; Architecture (150 P.)</div>
                            </div>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                            <span className="text-2xl">🇮🇩</span>
                            <div>
                              <div className="text-xs font-bold text-white">Indonesian Edition</div>
                              <div className="text-[10px] text-slate-400">JAC Civil &amp; Architecture (152 P.)</div>
                            </div>
                          </div>
                        </div>

                        <Link
                          href="/books"
                          className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs font-black text-emerald-200 hover:bg-emerald-900/60 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Open Cloud PDF Reader →</span>
                        </Link>
                      </div>
                    ) : slide.type === 'ssw' ? (
                      /* SSW Sectors Showcase */
                      <div className="relative w-72 xl:w-80 rounded-3xl bg-slate-950/85 border border-emerald-500/40 p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                              12 SSW SECTORS
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                            VISA READY
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                            <HeartPulse className="w-5 h-5 text-rose-400" />
                            <span className="text-[11px] font-extrabold text-white">Nursing Care</span>
                            <span className="text-[9px] text-slate-400">介護分野</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                            <span className="text-[11px] font-extrabold text-white">Food Service</span>
                            <span className="text-[9px] text-slate-400">外食業分野</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                            <Wheat className="w-5 h-5 text-emerald-400" />
                            <span className="text-[11px] font-extrabold text-white">Agriculture</span>
                            <span className="text-[9px] text-slate-400">農業分野</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                            <HardHat className="w-5 h-5 text-cyan-400" />
                            <span className="text-[11px] font-extrabold text-white">Construction</span>
                            <span className="text-[9px] text-slate-400">建設分野</span>
                          </div>
                        </div>

                        <Link
                          href="/ssw-skill-test"
                          className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-center gap-1.5 text-xs font-black text-teal-200 hover:bg-teal-900/60 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-teal-400" />
                          <span>Explore All 12 Sectors →</span>
                        </Link>
                      </div>
                    ) : (
                      /* CBT Engine Showcase */
                      <div className="relative w-72 xl:w-80 rounded-3xl bg-slate-950/85 border border-slate-700/70 p-5 shadow-2xl backdrop-blur-md space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                              CBT ENGINE LIVE
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            2026 EDITION
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                            <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                              PASS BENCHMARK
                            </div>
                            <div className="text-xs font-black text-emerald-400 mt-0.5">80% · 200/250</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                            <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                              STANDARD
                            </div>
                            <div className="text-xs font-black text-rose-400 mt-0.5">CEFR-J A1–A2</div>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-300">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Official Prometric Standard</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ──────────────────────────────────────────────────────────
            DESKTOP CAROUSEL CONTROLS: Left / Right Arrows & Dot Indicators
            ────────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Desktop Slide Indicators */}
        <div className="hidden sm:flex absolute bottom-16 sm:bottom-20 right-4 sm:right-8 z-20 items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-8 sm:w-10 bg-gradient-to-r from-japan-red to-amber-400 shadow-md shadow-red-500/50'
                  : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* ──────────────────────────────────────────────────────────
            BOTTOM COMMUNITY CHANNELS STRIP
            ────────────────────────────────────────────────────────── */}
        <div className="relative z-10 bg-slate-950/90 border-t border-slate-800/80 px-3 sm:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 font-semibold">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span className="text-[10px] sm:text-xs">OFFICIAL WHATSAPP CHANNEL</span>
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-bold ml-0.5 sm:ml-1"
            >
              <span>Follow Channel</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="https://www.facebook.com/Gakkou.No.Shiken"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1 transition-colors text-[10px] sm:text-xs"
            >
              <span>Facebook</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://www.instagram.com/gakkou.no.shiken/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 font-bold flex items-center gap-1 transition-colors text-[10px] sm:text-xs"
            >
              <span>Instagram</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 transition-colors text-[10px] sm:text-xs"
            >
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">COMMUNITY</span>
              <span>CHANNEL</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          QUICK CATEGORY CIRCLES / PILLS (Inspired by Image 2 Mockup)
          Under the mobile banner: Quick access to Games, Lessons,
          JFT CBT, SSW Skills, Textbooks, Tools & Rankings
          ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scrollbar-none py-1 px-1">
        <Link
          href="/game-zone"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
          <span>Game Zone</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        </Link>

        <Link
          href="/lessons"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
          <span>Lessons Hub</span>
        </Link>

        <Link
          href="/jft-basic"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-japan-red" />
          <span>JFT Mock Tests</span>
        </Link>

        <Link
          href="/ssw-skill-test"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          <span>SSW Skills</span>
        </Link>

        <Link
          href="/books"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>26 JAC Books</span>
        </Link>

        <Link
          href="/leaderboard"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 text-slate-700 dark:text-slate-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>Rankings</span>
        </Link>

        <Link
          href="/tools"
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 transition-all text-[11px] sm:text-xs font-black shadow-xs active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
          <span>Study Tools</span>
        </Link>
      </div>
    </div>
  );
}
