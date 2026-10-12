'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import NotificationBell from './NotificationBell';
import {
  Trophy,
  Home,
  BookOpen,
  Layers,
  User,
  ExternalLink,
  Shield,
  LogIn,
  LogOut,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  FileText,
  Bell,
  Info,
  Mail,
  Gamepad2,
  GraduationCap,
} from 'lucide-react';


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  // Active state helpers for grouped pillars
  const isExamsActive =
    isActive('/jft-basic') ||
    isActive('/ssw-skill-test') ||
    isActive('/leaderboard') ||
    pathname.startsWith('/ssw-test') ||
    pathname.startsWith('/test') ||
    pathname.startsWith('/attempt');

  const isLearningActive =
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/game-zone') ||
    pathname.startsWith('/books');

  const isToolsActive =
    pathname.startsWith('/tools') ||
    pathname.startsWith('/guides') ||
    pathname.startsWith('/notices');

  const isMoreActive =
    isActive('/how-it-works') ||
    isActive('/about') ||
    isActive('/contact');

  // Auto-close dropdowns on navigation or outside click
  useEffect(() => {
    setActiveDropdown(null);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#060913]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-300">
        <nav className="max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 xl:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand Logo & Mobile Left Extended Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Mobile Extended Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Open mobile menu"
            className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 active:scale-95 focus:outline-none transition-all shrink-0 cursor-pointer lg:hidden"
          >
            {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>

          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group btn-touch-active shrink-0 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo.png"
              alt="Gakkou No Shiken - JFT & SSW CBT Mock Test"
              className="h-7 sm:h-9 xl:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm shrink-0"
            />
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-[13px] sm:text-base xl:text-lg tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  Gakkou No <span className="text-japan-red">Shiken</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-japan-red border border-rose-200/80 dark:border-rose-800/60 text-[8px] xl:text-[9px] font-black tracking-wider uppercase whitespace-nowrap">
                  CBT 2026
                </span>
              </div>
              <div className="mt-0.5 text-[8.5px] sm:text-[10px] xl:text-[11px] font-black text-japan-red tracking-tight leading-none flex items-center gap-1 whitespace-nowrap">
                <span>JFT &amp; SSW Mock Tests</span>
                <span className="hidden 2xl:inline text-slate-400 dark:text-slate-500 font-bold">• BD&apos;s #1 Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Menu Navigation - Grouped Dropdown Pillars */}
        <div ref={dropdownRef} className="hidden lg:flex lg:items-center lg:gap-1.5 xl:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 xl:gap-1.5 shrink-0">
            {/* 1. HOME DIRECT LINK */}
            <Link
              href="/"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2.5 xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>{t('home')}</span>
            </Link>

            {/* 2. EXAMS & TESTS DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('exams')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'exams' ? null : 'exams')}
                className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2.5 xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isExamsActive
                    ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span>Exams &amp; Tests</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'exams' ? 'rotate-180 text-japan-red' : 'text-slate-400'
                  }`}
                />
              </button>

              {activeDropdown === 'exams' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[300px] rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-xl shadow-slate-900/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-1">
                    <Link
                      href="/jft-basic"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/jft-basic')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">JFT-Basic Mock Tests</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            A1•A2
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Official Prometric CBT format with listening audio
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/ssw-skill-test"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/ssw-skill-test')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">SSW Sector Skills</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            CBT
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Caregiving, Food Service, Agriculture &amp; more
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/leaderboard"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/leaderboard')
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Global Leaderboard</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Top Rank
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Live candidate scoreboards &amp; achievements
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. LEARNING SUITE DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('learning')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'learning' ? null : 'learning')}
                className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2.5 xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isLearningActive
                    ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span>Learning Suite</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'learning' ? 'rotate-180 text-japan-red' : 'text-slate-400'
                  }`}
                />
              </button>

              {activeDropdown === 'learning' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[315px] rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-xl shadow-slate-900/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-1">
                    <Link
                      href="/game-zone"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/game-zone')
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 shadow-xs border border-purple-200 dark:border-purple-800 bg-purple-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/game_zone_icon.png"
                          alt="Japanese Game Zone"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Japanese Game Zone</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            8 Games
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Kanji Hunter, Word Match, 3 Lives arcade
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/lessons"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/lessons')
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 shadow-xs border border-cyan-200 dark:border-cyan-800 bg-cyan-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/lessons_hub_icon.png"
                          alt="Structured Lessons"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Structured Lessons</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                            N5 • N4
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          50 Vocab &amp; 30 Kanji units with audio
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/books"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/books')
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-japan-red'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 shadow-xs border border-rose-200 dark:border-rose-800 bg-rose-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/daily_vocab_icon.png"
                          alt="Books & Audio"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Books &amp; Audio Reader</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-japan-red dark:text-rose-300">
                            26 JAC Books
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Online PDF viewer with multi-language audio
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. TOOLS & RESOURCES DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('tools')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'tools' ? null : 'tools')}
                className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2.5 xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isToolsActive
                    ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span>Tools &amp; Guides</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'tools' ? 'rotate-180 text-japan-red' : 'text-slate-400'
                  }`}
                />
              </button>

              {activeDropdown === 'tools' && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[305px] rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-xl shadow-slate-900/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-1">
                    <Link
                      href="/tools"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/tools')
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 shadow-xs border border-indigo-200 dark:border-indigo-800 bg-indigo-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/study_tools_icon.png"
                          alt="Candidate Tools"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Candidate Tools</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Free
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          3D Flashcards, Particle quiz &amp; Salary calc
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/guides/jft-basic-exam-guide"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        pathname.startsWith('/guides')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">CBT Exam Guides</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                            3 Guides
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Prometric registration, pass marks &amp; rules
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/notices"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/notices')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-japan-red dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black leading-tight">Notices &amp; Materials</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-japan-red dark:text-rose-300">
                            Live
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Dhaka Prometric seat alerts &amp; downloads
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. MORE DROPDOWN */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('more')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 rounded-xl flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  isMoreActive
                    ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'more' ? 'rotate-180 text-japan-red' : 'text-slate-400'
                  }`}
                />
              </button>

              {activeDropdown === 'more' && (
                <div className="absolute top-full right-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-[230px] rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-xl shadow-slate-900/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-1">
                    <Link
                      href="/how-it-works"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/how-it-works')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold">How It Works</span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/about')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold">About Us</span>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                        isActive('/contact')
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 text-japan-red font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold">Contact &amp; Support</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Utilities Group */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark Mode Theme Toggle */}
            <ThemeToggle size="compact" />

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0"></div>

            {isAuthenticated && user ? (
              <>
                {user.is_staff && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs xl:text-[13px] 2xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 transition-all py-1.5 px-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-slate-800/60 flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <Shield className="w-3.5 h-3.5 text-japan-red shrink-0" />
                    <span>{t('admin_panel')}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                  </a>
                )}
                <Link
                  href="/accounts/my-results"
                  className="flex items-center gap-1.5 group p-1 pr-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all whitespace-nowrap shrink-0"
                >
                  <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 text-white text-xs font-black flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform shrink-0">
                    {user.username?.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-xs xl:text-sm text-slate-800 dark:text-slate-200 font-extrabold group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors max-w-[80px] xl:max-w-[120px] truncate">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xl:inline">{t('sign_out')}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                <Link
                  href="/accounts/login"
                  className="text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 transition-colors px-2 py-1.5 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 opacity-75 shrink-0" />
                  <span>{t('sign_in')}</span>
                </Link>
                <Link
                  href="/accounts/signup"
                  className="text-xs xl:text-sm font-extrabold bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-red-700 text-white px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('register')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

          {/* Mobile Top App Actions (Avatar / Theme Toggle / Notification) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden shrink-0">
            <LanguageSwitcher compact={true} />
            <ThemeToggle size="compact" />

            {isAuthenticated && user && (
              <Link
                href="/accounts/my-results"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-japan-red to-amber-500 text-white text-xs font-extrabold flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
              >
                {user.username?.slice(0, 1).toUpperCase()}
              </Link>
            )}

            {/* Mobile Notification Bell */}
            <NotificationBell align="right" compact={true} />
          </div>
        </nav>
      </header>

      {/* Mobile Left Slide-Over Navigation Drawer (Outside header so fixed positioning is viewport-relative) */}
      {open && (
        <div className="lg:hidden">
          {/* Dim Backdrop Overlay */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-200 animate-fade-in"
          />

          {/* Sleek Off-Canvas Left Drawer */}
          <aside
            aria-label="Mobile Navigation Menu"
            className="fixed inset-y-0 left-0 w-[285px] sm:w-[320px] max-w-[82vw] h-screen bg-white dark:bg-[#070b16] border-r border-slate-200/90 dark:border-slate-800/90 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/logo.png"
                  alt="Gakkou No Shiken"
                  className="h-6 w-auto object-contain shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white truncate leading-none">
                    Gakkou No <span className="text-japan-red">Shiken</span>
                  </div>
                  <span className="text-[9px] font-bold text-japan-red leading-none block mt-0.5">
                    CBT 2026 Portal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5 overscroll-contain">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Main Portal
              </div>

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-japan-red shrink-0" />
                  <span>{t('home')}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/jft-basic"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-japan-red shrink-0" />
                  <span>{t('jft_basic')}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/ssw-skill-test"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-japan-red shrink-0" />
                  <span>{t('ssw_skills')}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/lessons"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Curriculum &amp; Lessons</span>
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-50 text-japan-red dark:bg-rose-950/60 dark:text-rose-300">
                  80 Lessons
                </span>
              </Link>

              <Link
                href="/books"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-japan-red shrink-0" />
                  <span>PDF Books &amp; Audio</span>
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  New
                </span>
              </Link>

              <Link
                href="/tools"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Candidate Tools</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/guides/jft-basic-exam-guide"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-japan-red shrink-0" />
                  <span>CBT Exam Guides</span>
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-japan-red/10 text-japan-red dark:bg-rose-950/60 dark:text-rose-300">
                  3 Guides
                </span>
              </Link>

              <Link
                href="/game-zone"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Game Zone (Arcade)</span>
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-japan-red text-white">8 Games</span>
              </Link>

              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t('leaderboard')}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </Link>

              <div className="pt-2 pb-1 px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Resources &amp; Support
              </div>

              <Link
                href="/notices"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Notices &amp; Materials</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/how-it-works"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Exam Guide</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-japan-red shrink-0" />
                  <span>About Us</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-japan-red shrink-0" />
                  <span>Contact &amp; Support</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Drawer Footer Account Area */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/60 dark:bg-slate-900/40">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/accounts/my-results"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <div className="w-8 h-8 rounded-xl bg-japan-red text-white text-xs font-black flex items-center justify-center shrink-0">
                      {user.username?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-extrabold text-slate-900 dark:text-white truncate block">
                        {user.username}
                      </strong>
                      <span className="text-[10px] text-japan-red font-bold">My Profile</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{t('sign_out')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/accounts/login"
                    onClick={() => setOpen(false)}
                    className="text-center font-bold text-slate-800 dark:text-slate-200 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('sign_in')}</span>
                  </Link>
                  <Link
                    href="/accounts/signup"
                    onClick={() => setOpen(false)}
                    className="text-center font-extrabold bg-gradient-to-r from-japan-red to-rose-600 text-white py-2 rounded-xl shadow-xs transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('register')}</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
