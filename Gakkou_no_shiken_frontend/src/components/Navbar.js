'use client';

import React, { useState } from 'react';
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
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

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
        {/* Desktop Menu Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1.5 xl:gap-2.5 2xl:gap-3.5 shrink-0">
          {/* Main Links */}
          <div className="flex items-center gap-0.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 shrink-0">
            <Link
              href="/"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>{t('home')}</span>
            </Link>
            <Link
              href="/jft-basic"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/jft-basic')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>{t('jft_basic')}</span>
            </Link>
            <Link
              href="/ssw-skill-test"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/ssw-skill-test')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>{t('ssw_skills')}</span>
            </Link>
            <Link
              href="/lessons"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/lessons') || pathname.startsWith('/lessons')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span>Lessons</span>
            </Link>
            <Link
              href="/books"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/books') || pathname.startsWith('/books')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span>Books &amp; Audio</span>
            </Link>
            <Link
              href="/tools"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/tools') || pathname.startsWith('/tools')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span>Tools</span>
            </Link>
            <Link
              href="/guides/jft-basic-exam-guide"
              className={`hidden 2xl:flex text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl items-center gap-1.5 whitespace-nowrap shrink-0 ${
                pathname.startsWith('/guides')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span>Guides</span>
            </Link>
            <Link
              href="/game-zone"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/game-zone') || pathname.startsWith('/game-zone')
                  ? 'text-japan-red bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span>{t('game_zone')}</span>
            </Link>
            <Link
              href="/leaderboard"
              className={`text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/leaderboard')
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-500 shrink-0" />
              <span>{t('leaderboard')}</span>
            </Link>
            <Link
              href="/notices"
              className={`hidden xl:flex text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/notices') || pathname.startsWith('/notices')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-japan-red shrink-0" />
              <span className="hidden 2xl:inline">Notices &amp; Materials</span>
              <span className="2xl:hidden">Notices</span>
            </Link>
            <Link
              href="/how-it-works"
              className={`hidden 2xl:flex text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/how-it-works')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Guide</span>
            </Link>
            <Link
              href="/about"
              className={`hidden xl:flex text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 py-1.5 px-2 xl:px-2.5 2xl:px-3 rounded-xl items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive('/about')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>About Us</span>
            </Link>
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
