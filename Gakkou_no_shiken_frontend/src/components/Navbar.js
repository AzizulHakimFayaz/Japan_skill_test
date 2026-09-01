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
} from 'lucide-react';


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#060913]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-300">
      <nav className="max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 xl:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand Logo */}
        <div className="flex items-center shrink-0 min-w-0">
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
              <div className="hidden sm:flex mt-0.5 text-[9px] sm:text-[10px] xl:text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight leading-none items-center gap-1 whitespace-nowrap">
                <span className="text-japan-red font-black">JFT &amp; SSW Mock Tests</span>
                <span className="hidden 2xl:inline text-slate-400 dark:text-slate-500">• BD&apos;s #1 Portal</span>
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

          {/* Mobile Top App Actions (Avatar / Theme Toggle / Menu) */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher compact={true} />
            <ThemeToggle size="compact" />

            {isAuthenticated && user && (
              <Link
                href="/accounts/my-results"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-japan-red to-amber-500 text-white text-xs font-extrabold flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              >
                {user.username?.slice(0, 1).toUpperCase()}
              </Link>
            )}

            <button
              onClick={() => setOpen(!open)}
              aria-label="Open mobile menu"
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 active:scale-95 focus:outline-none transition-all"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Slide-Down App Menu Drawer */}
          {open && (
            <div className="absolute top-16 right-3 left-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-5 flex flex-col gap-3 lg:hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-japan-red animate-pulse"></span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide">学校の試験 • {t('cbt_portal')}</span>
                </div>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 px-2 py-0.5 rounded-full uppercase">
                  2026 Live
                </span>
              </div>

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Home className="w-5 h-5 text-japan-red" />
                  <span>{t('home')}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/jft-basic"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-japan-red" />
                  <span>{t('jft_basic')}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/ssw-skill-test"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-japan-red" />
                  <span>{t('ssw_skills')}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/tools"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-japan-red" />
                  <span>Candidate Tools (Flashcards &amp; Particle Drill)</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>


              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>{t('leaderboard')}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-amber-600" />
              </Link>

              <Link
                href="/notices"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-japan-red" />
                  <span>Notices &amp; Study Materials (PDFs)</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/how-it-works"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-japan-red" />
                  <span>How It Works &amp; Exam Guide</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>


              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/accounts/my-results"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="w-5 h-5 text-japan-red" />
                      <span>{t('my_results')}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-japan-red text-white font-extrabold flex items-center justify-center">
                        {user.username?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block">Signed in</span>
                        <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{user.username}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('sign_out')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/accounts/login"
                    onClick={() => setOpen(false)}
                    className="text-center font-bold text-slate-800 dark:text-slate-200 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-1.5 text-sm"
                  >
                    <LogIn className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>{t('sign_in')}</span>
                  </Link>
                  <Link
                    href="/accounts/signup"
                    onClick={() => setOpen(false)}
                    className="text-center font-extrabold bg-gradient-to-r from-japan-red to-rose-600 text-white py-3 rounded-2xl shadow-md shadow-red-500/25 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('register')}</span>
                  </Link>
                </div>
              )}
            </div>
          )}
      </nav>
    </header>
  );
}
