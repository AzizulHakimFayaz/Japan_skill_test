'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-header shadow-sm transition-all duration-300">
      <nav className="max-w-[1850px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group btn-touch-active">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo.png"
              alt="Gakkou No Shiken"
              className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  Gakkou No <span className="text-japan-red">Shiken</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 text-japan-red border border-rose-200/80 text-[9px] font-black tracking-wider uppercase">
                  CBT 2026
                </span>
              </div>
              <div className="mt-0.5 text-[10px] sm:text-[11px] font-black tracking-widest leading-none">
                <span className="text-japan-red">学校の試験</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Menu Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <Link
              href="/"
              className={`text-sm font-bold transition-colors duration-200 py-1.5 px-3 rounded-xl ${
                isActive('/') ? 'text-japan-red bg-red-50' : 'text-slate-700 hover:text-japan-red hover:bg-red-50/80'
              }`}
            >
              Home
            </Link>
            <Link
              href="/jft-basic"
              className={`text-sm font-bold transition-colors duration-200 py-1.5 px-3 rounded-xl ${
                isActive('/jft-basic') ? 'text-japan-red bg-red-50' : 'text-slate-700 hover:text-japan-red hover:bg-red-50/80'
              }`}
            >
              JFT-Basic Info
            </Link>
            <Link
              href="/ssw-skill-test"
              className={`text-sm font-bold transition-colors duration-200 py-1.5 px-3 rounded-xl ${
                isActive('/ssw-skill-test') ? 'text-japan-red bg-red-50' : 'text-slate-700 hover:text-japan-red hover:bg-red-50/80'
              }`}
            >
              SSW Skill Tests
            </Link>
            <Link
              href="/leaderboard"
              className={`text-sm font-bold transition-colors duration-200 py-1.5 px-3 rounded-xl flex items-center gap-1.5 ${
                isActive('/leaderboard') ? 'text-amber-600 bg-amber-50' : 'text-slate-700 hover:text-amber-600 hover:bg-amber-50/80'
              }`}
            >
              <span>🏆</span> Leaderboard
            </Link>


            {isAuthenticated && user ? (
              <>
                {user.is_staff && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-700 hover:text-japan-red transition-colors duration-200 py-1.5 px-3 rounded-xl hover:bg-red-50/80"
                  >
                    Admin Panel ↗
                  </a>
                )}
                <span className="text-slate-300">|</span>
                <Link
                  href="/accounts/my-results"
                  className="flex items-center gap-2 group p-1 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all"
                >
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-japan-red via-rose-600 to-amber-500 text-white text-xs font-black flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                    {user.username?.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-800 font-extrabold group-hover:text-japan-red transition-colors">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/accounts/login"
                  className="text-sm font-bold text-slate-700 hover:text-japan-red transition-colors px-3 py-2 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/accounts/signup"
                  className="text-sm font-extrabold bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-red-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Top App Actions (Avatar / Quick Menu) */}
          <div className="flex items-center gap-2 sm:hidden">
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
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100/90 active:scale-95 focus:outline-none transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Slide-Down App Menu Drawer */}
          {open && (
            <div className="absolute top-16 right-3 left-3 bg-white backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl p-5 flex flex-col gap-3.5 sm:hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-japan-red animate-pulse"></span>
                  <span className="text-xs font-black text-slate-800 tracking-wide">学校の試験 • CBT Portal</span>
                </div>
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full uppercase">
                  2026 Live
                </span>
              </div>

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 hover:bg-red-50 hover:text-japan-red transition-all flex items-center justify-between"
              >
                <span>Home Page</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/jft-basic"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 hover:bg-red-50 hover:text-japan-red transition-all flex items-center justify-between"
              >
                <span>JFT-Basic Overview</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/ssw-skill-test"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 hover:bg-red-50 hover:text-japan-red transition-all flex items-center justify-between"
              >
                <span>SSW Skill Tests</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-base font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">🏆 Leaderboard Standings</span>
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>


              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/accounts/my-results"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-2xl text-base font-bold text-slate-800 hover:bg-red-50 hover:text-japan-red transition-all flex items-center justify-between"
                  >
                    <span>My Test Results</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-japan-red text-white font-extrabold flex items-center justify-center">
                        {user.username?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block">Signed in</span>
                        <strong className="text-sm font-extrabold text-slate-900">{user.username}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-xs"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/accounts/login"
                    onClick={() => setOpen(false)}
                    className="text-center font-bold text-slate-800 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/accounts/signup"
                    onClick={() => setOpen(false)}
                    className="text-center font-extrabold bg-gradient-to-r from-japan-red to-rose-600 text-white py-3 rounded-2xl shadow-md shadow-red-500/25 hover:shadow-lg transition-all active:scale-95"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Social Community Channels Strip */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <a
                  href="https://www.facebook.com/Gakkou.No.Shiken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 hover:bg-blue-100 transition-colors"
                >
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.instagram.com/gakkou.no.shiken/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-200/60 hover:bg-pink-100 transition-colors"
                >
                  <span>Instagram</span>
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
