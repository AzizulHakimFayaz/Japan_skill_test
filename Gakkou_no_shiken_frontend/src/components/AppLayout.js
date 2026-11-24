'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileDock from './MobileDock';
import SupportChatWidget from './SupportChatWidget';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isQuizPage = pathname?.startsWith('/test/') || pathname?.startsWith('/ssw-test/');
  const isHomePage = pathname === '/';

  if (isQuizPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-0 sm:pt-8 pb-24 sm:pb-12 max-w-[1850px] 2xl:max-w-[1920px] w-full mx-auto px-2.5 sm:px-8 lg:px-12 2xl:px-16 relative z-10">
        {children}
      </main>

      <Footer />
      <MobileDock />
      {isHomePage && <SupportChatWidget />}
    </>
  );
}
