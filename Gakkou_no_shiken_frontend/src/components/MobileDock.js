'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function MobileDock() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Don't show dock inside full-screen CBT quiz
  if (pathname.startsWith('/test/') && !pathname.includes('/submit')) {
    return null;
  }

  const isHome = pathname === '/';
  const isJft = pathname.includes('/jft');
  const isSsw = pathname.includes('/ssw');
  const isResults = pathname.includes('/my-results') || pathname.includes('/attempt/');
  const isAuth = pathname.includes('/login') || pathname.includes('/signup');

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-50 sm:hidden mobile-app-dock">
      <div className="grid grid-cols-4 h-14 max-w-lg mx-auto">
        {/* Tab 1: Home */}
        <Link href="/" className={`mobile-app-dock-item ${isHome ? 'active' : ''} btn-touch-active`}>
          <div className="dock-icon-wrapper">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        {/* Tab 2: JFT Info */}
        <Link href="/jft-basic" className={`mobile-app-dock-item ${isJft ? 'active' : ''} btn-touch-active`}>
          <div className="dock-icon-wrapper">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">JFT Info</span>
        </Link>

        {/* Tab 3: SSW Tests */}
        <Link href="/ssw-skill-test" className={`mobile-app-dock-item ${isSsw ? 'active' : ''} btn-touch-active`}>
          <div className="dock-icon-wrapper">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">SSW Tests</span>
        </Link>

        {/* Tab 4: Results / Profile / Login */}
        {isAuthenticated && user ? (
          <Link href="/accounts/my-results" className={`mobile-app-dock-item ${isResults ? 'active' : ''} btn-touch-active`}>
            <div className="dock-icon-wrapper">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Results</span>
          </Link>
        ) : (
          <Link href="/accounts/login" className={`mobile-app-dock-item ${isAuth ? 'active' : ''} btn-touch-active`}>
            <div className="dock-icon-wrapper">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
