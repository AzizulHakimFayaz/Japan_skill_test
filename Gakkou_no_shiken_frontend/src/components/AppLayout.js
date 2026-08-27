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
      <Navbar />

      <main className="flex-grow pt-4 sm:pt-8 pb-20 sm:pb-12 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>

      <Footer />
      <MobileDock />
    </>
  );
}
