'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Gamepad2,
  Home,
  BookOpen,
  Zap,
  Layers,
  Headphones,
  Crosshair,
  Compass,
  Heart,
  Crown,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Trophy,
  LogIn,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { getInitialGameProgress, fetchBackendGameProgress } from '@/lib/gameStore';

const GAME_NAV_ITEMS = [
  { href: '/game-zone', label: 'Game Zone Home', icon: Home, badge: 'Hub' },
  { href: '/game-zone/word-match', label: 'Word Match', icon: Layers, badge: 'Hot', activeColor: 'text-japan-red' },
  { href: '/game-zone/ranks', label: 'Rankings & Top 3', icon: Trophy, badge: 'Podium' },
  { href: '/game-zone/word-rush', label: 'Word Rush', icon: Zap, badge: 'Speed' },
  { href: '/game-zone/vocab-snake', label: 'Vocab Snake', icon: Gamepad2, badge: 'Classic' },
  { href: '/game-zone/sentence-builder', label: 'Sentence Builder', icon: BookOpen, badge: 'Grammar' },
  { href: '/game-zone/listen-catch', label: 'Listen & Catch', icon: Headphones, badge: 'Audio' },
  { href: '/game-zone/kanji-hunter', label: 'Kanji Hunter', icon: Crosshair, badge: 'Kanji' },
  { href: '/game-zone/situation-quest', label: 'Situation Quest', icon: Compass, badge: 'RPG' },
  { href: '/game-zone/three-lives', label: '3 Lives Challenge', icon: Heart, badge: 'Hard' },
];

export default function GameZoneLayout({ children }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [progress, setProgress] = useState(getInitialGameProgress());

  useEffect(() => {
    const update = () => setProgress(getInitialGameProgress());
    window.addEventListener('game_progress_updated', update);
    window.addEventListener('storage', update);

    // If authenticated, sync with backend database
    if (isAuthenticated) {
      fetchBackendGameProgress().then((backendData) => {
        if (backendData) setProgress(backendData);
      });
    }

    return () => {
      window.removeEventListener('game_progress_updated', update);
      window.removeEventListener('storage', update);
    };
  }, [isAuthenticated]);

  const xpInCurrentLevel = progress.xp % 100;
  const xpTarget = 100;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpTarget) * 100));

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-14 z-30 bg-white/95 dark:bg-[#0b101e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-japan-red to-rose-500 text-white flex items-center justify-center shadow-xs">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>Game Zone</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-japan-red border border-rose-200/80 dark:border-rose-900/40">
                Play &amp; Learn
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold">
              {isAuthenticated ? `@${user?.username} • ` : 'Guest • '}Lvl {progress.level} • {progress.xp} XP
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red transition-colors"
          aria-label="Toggle Game Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
          {/* Left Sidebar */}
          <aside
            className={`lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 ${
              mobileMenuOpen ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Sidebar Main Card */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-2.5 px-2 py-1">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-japan-red via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Game Zone
                  </h2>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Interactive Arcade
                  </p>
                </div>
              </div>

              {/* Game Links List */}
              <nav className="flex flex-col gap-1">
                {GAME_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs sm:text-[13px] font-extrabold transition-all duration-200 ${
                        isActive
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-japan-red dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-japan-red dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider ${
                            isActive
                              ? 'bg-japan-red text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* "Your Progress" Card (Dynamic for Guest and Logged-in Users) */}
            <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-4 shadow-sm flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Progress
                </span>
                {isAuthenticated ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-900/40">
                    <Crown className="w-3 h-3 text-amber-500" />
                    Level {progress.level}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Guest Mode</span>
                  </span>
                )}
              </div>

              {/* XP Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 dark:text-slate-400 mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200 font-black">
                    {isAuthenticated ? `@${user?.username || 'Candidate'}` : 'Guest Player'}
                  </span>
                  <span className="text-japan-red font-bold">
                    Lvl {progress.level} • {progress.xp} XP
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-japan-red to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-bold mt-1">
                  <span>{progress.xp % 100} / 100 XP to Level {progress.level + 1}</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Stats List */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-extrabold">
                {/* Streak */}
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                    <span>Streak</span>
                  </span>
                  <span className="font-black text-orange-500">{progress.streak} days</span>
                </div>

                {/* Mastered */}
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Mastered</span>
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {progress.mastered} words
                  </span>
                </div>

                {/* Learning */}
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Learning</span>
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {progress.learning}
                  </span>
                </div>
              </div>

              {/* Guest Login / Save Reminder Banner */}
              {!isAuthenticated && (
                <div className="mt-1 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-[11px] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 font-black text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Save Your Rank &amp; XP</span>
                  </div>
                  <p className="text-[10px] leading-tight font-medium text-slate-600 dark:text-slate-400">
                    You are in guest mode. Log in or create an account to save your progress permanently and climb the national leaderboard!
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      href="/accounts/login"
                      className="flex-1 py-1 px-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-[10.5px] font-black text-center hover:bg-slate-900 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/accounts/signup"
                      className="flex-1 py-1 px-2 rounded-xl bg-japan-red text-white text-[10.5px] font-black text-center hover:bg-rose-700 transition-colors shadow-xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Play Area */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
