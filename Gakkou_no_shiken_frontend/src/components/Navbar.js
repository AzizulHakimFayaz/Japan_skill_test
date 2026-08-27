'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
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
  MapPin,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#060913]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-300">
      {/* Top Announcement & Trust Bar (Hidden on very small mobile) */}
      <div className="hidden md:block bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-rose-400">
              <Flame className="w-3.5 h-3.5 text-japan-red" />
              <span>2026 Test Pool Live:</span>
            </span>
            <span className="text-slate-300 font-medium">
              Authentic Prometric CBT Mock Exams with 1-play native audio &amp; Bengali explanations.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <a href="/#test-centers" className="hover:text-white transition-colors flex items-center gap-1">
              <MapPin className="w-3 h-3 text-japan-red" />
              <span>Dhaka &amp; Chittagong Venues</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>WhatsApp Channel</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-17 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group btn-touch-active">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo.png"
              alt="Gakkou No Shiken - JFT & SSW CBT Mock Test"
              className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                  Gakkou No <span className="text-japan-red">Shiken</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-japan-red border border-rose-200/80 dark:border-rose-800/60 text-[9px] font-black tracking-wider uppercase">
                  CBT 2026
                </span>
              </div>
              <div className="mt-0.5 text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight leading-none flex items-center gap-1">
                <span className="text-japan-red font-black">学校の試験</span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">• BD&apos;s #1 CBT Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Menu Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex lg:items-center lg:gap-2 xl:gap-3">
            <Link
              href="/"
              className={`text-sm font-bold transition-all duration-200 py-1.5 px-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('home')}</span>
            </Link>

            <Link
              href="/jft-basic"
              className={`text-sm font-bold transition-all duration-200 py-1.5 px-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/jft-basic')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('jft_basic')}</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/80 text-japan-red rounded-md font-extrabold">A2</span>
            </Link>

            <Link
              href="/ssw-skill-test"
              className={`text-sm font-bold transition-all duration-200 py-1.5 px-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/ssw-skill-test')
                  ? 'text-japan-red bg-red-50/90 dark:bg-red-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('ssw_skills')}</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-md font-extrabold">12 Sectors</span>
            </Link>

            <Link
              href="/leaderboard"
              className={`text-sm font-bold transition-all duration-200 py-1.5 px-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/leaderboard')
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{t('leaderboard')}</span>
            </Link>

            <a
              href="/#test-centers"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 hover:bg-red-50/50 dark:hover:bg-slate-800/60 py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-4 h-4 text-japan-red" />
              <span>Test Venues</span>
            </a>

            {/* Language Switcher (EN / BN / JA) */}
            <LanguageSwitcher />

            {/* Dark Mode Theme Toggle Button */}
            <ThemeToggle size="compact" />

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            {/* Primary Action Button: Take Free CBT Test */}
            <a
              href="/#practice-grid"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-japan-red via-rose-600 to-japan-red hover:from-japan-redhover hover:to-rose-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Free CBT</span>
            </a>

            {isAuthenticated && user ? (
              <>
                {user.is_staff && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 transition-all py-1.5 px-2.5 rounded-xl hover:bg-red-50/50 dark:hover:bg-slate-800/60 flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-japan-red" />
                    <span>{t('admin_panel')}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                <Link
                  href="/accounts/my-results"
                  className="flex items-center gap-2 group p-1 pr-3 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all"
                >
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 text-white text-xs font-black flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                    {user.username?.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-extrabold group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('sign_out')}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/accounts/login"
                  className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red dark:hover:text-rose-400 transition-colors px-2.5 py-1.5 flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 opacity-75" />
                  <span>{t('sign_in')}</span>
                </Link>
                <Link
                  href="/accounts/signup"
                  className="text-xs font-extrabold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
                >
                  <span>{t('register')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Actions (Language, Theme, Menu Button) */}
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
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 active:scale-95 focus:outline-none transition-all cursor-pointer"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Slide-Down Menu Drawer */}
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

              <a
                href="/#test-centers"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-900 hover:text-japan-red dark:hover:text-rose-400 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-japan-red" />
                  <span>Prometric BD Venues</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              <a
                href="/#practice-grid"
                onClick={() => setOpen(false)}
                className="mx-1 py-3.5 rounded-2xl text-center font-black text-white bg-gradient-to-r from-japan-red to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free CBT Mock Test</span>
              </a>

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
        </div>
      </nav>
    </header>
  );
}
