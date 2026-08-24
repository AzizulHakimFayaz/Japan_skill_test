'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Home, BookOpen, Layers, Trophy, User, LogIn } from 'lucide-react';

export default function MobileDock() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Don't show dock inside full-screen CBT quiz
  if (pathname?.startsWith('/test/') && !pathname?.includes('/submit')) {
    return null;
  }

  const isHome = pathname === '/';
  const isJft = pathname?.includes('/jft');
  const isSsw = pathname?.includes('/ssw');
  const isLeaderboard = pathname?.includes('/leaderboard');
  const isProfile = pathname?.includes('/my-results') || pathname?.includes('/login') || pathname?.includes('/signup');

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-50 sm:hidden mobile-app-dock bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg">
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto px-1">
        {/* Tab 1: Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
            isHome ? 'text-japan-red font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isHome ? 'bg-rose-50 text-japan-red' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight">Home</span>
        </Link>

        {/* Tab 2: JFT Info */}
        <Link
          href="/jft-basic"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
            isJft ? 'text-japan-red font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isJft ? 'bg-rose-50 text-japan-red' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight">JFT Info</span>
        </Link>

        {/* Tab 3: SSW Tests */}
        <Link
          href="/ssw-skill-test"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
            isSsw ? 'text-japan-red font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isSsw ? 'bg-rose-50 text-japan-red' : ''}`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight">SSW</span>
        </Link>

        {/* Tab 4: Leaderboard */}
        <Link
          href="/leaderboard"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
            isLeaderboard ? 'text-amber-600 font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isLeaderboard ? 'bg-amber-50 text-amber-600' : ''}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight">Ranks</span>
        </Link>

        {/* Tab 5: Profile / Login */}
        {isAuthenticated && user ? (
          <Link
            href="/accounts/my-results"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
              isProfile ? 'text-japan-red font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isProfile ? 'bg-rose-50 text-japan-red' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-tight truncate max-w-[50px]">{user.username || 'Account'}</span>
          </Link>
        ) : (
          <Link
            href="/accounts/login"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
              isProfile ? 'text-japan-red font-black' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isProfile ? 'bg-rose-50 text-japan-red' : ''}`}>
              <LogIn className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-tight">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
