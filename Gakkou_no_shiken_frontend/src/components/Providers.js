'use client';

import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import AnimatedThemeBackground from './AnimatedThemeBackground';
import AppLayout from './AppLayout';
import CountryConfirmationBanner from './CountryConfirmationBanner';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AnimatedThemeBackground />
        <AuthProvider>
          <CountryConfirmationBanner />
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
