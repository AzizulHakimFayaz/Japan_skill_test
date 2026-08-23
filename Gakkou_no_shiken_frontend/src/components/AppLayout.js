'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileDock from './MobileDock';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isQuizPage = pathname?.startsWith('/test/');

  if (isQuizPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Ambient Decorative Animated Background Lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-red-300/25 to-rose-400/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow"></div>
      <div className="fixed top-1/3 right-10 w-[550px] h-[550px] bg-gradient-to-br from-indigo-300/20 to-violet-400/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-float-slow delay-300"></div>
      <div className="fixed bottom-10 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-amber-200/20 to-orange-300/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-float-slow delay-500"></div>

      <Navbar />

      <main className="flex-grow pt-4 sm:pt-8 pb-24 sm:pb-12 max-w-[1850px] 2xl:max-w-[1920px] w-full mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16">
        {children}
      </main>

      <Footer />
      <MobileDock />
    </>
  );
}
