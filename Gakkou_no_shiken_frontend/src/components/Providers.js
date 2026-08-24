'use client';

import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import AnimatedThemeBackground from './AnimatedThemeBackground';
import AppLayout from './AppLayout';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AnimatedThemeBackground />
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
