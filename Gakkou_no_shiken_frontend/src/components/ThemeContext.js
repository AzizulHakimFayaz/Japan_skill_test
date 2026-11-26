'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export const COLOR_THEMES = [
  {
    id: 'torii',
    name: 'Torii Crimson',
    jpName: '鳥居クリムゾン',
    tagline: 'Signature Hinomaru Red, Fuji Teal & Soft Washi Cream (Default)',
    swatches: ['#DB1A1A', '#FFF6F6', '#8CC7C4', '#2C687B'],
    accent: '#DB1A1A',
    secondary: '#2C687B',
  },
  {
    id: 'aqua',
    name: 'Okinawa Aqua',
    jpName: '沖縄アクア',
    tagline: 'Refreshing Ocean Mint & Sky Cyan for calm, distraction-free study',
    swatches: ['#E3FDFD', '#CBF1F5', '#A6E3E9', '#71C9CE'],
    accent: '#0E8A91',
    secondary: '#71C9CE',
  },
  {
    id: 'sakura',
    name: 'Kyoto Sakura',
    jpName: '京都さくら',
    tagline: 'Soft Cherry Blossom Pink & Warm Rose Mist aesthetic',
    swatches: ['#F9F5F6', '#F8E8EE', '#FDCEDF', '#F2BED1'],
    accent: '#C94A78',
    secondary: '#F2BED1',
  },
];

const VALID_COLOR_THEMES = new Set(COLOR_THEMES.map((t) => t.id));

const ThemeContext = createContext({
  theme: 'light',
  colorTheme: 'torii',
  toggleTheme: () => {},
  setTheme: () => {},
  setColorTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [colorTheme, setColorThemeState] = useState('torii');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gns_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        setThemeState('light');
        document.documentElement.classList.remove('dark');
      }

      const savedColor = localStorage.getItem('gns_color_theme');
      if (savedColor && VALID_COLOR_THEMES.has(savedColor)) {
        setColorThemeState(savedColor);
        document.documentElement.setAttribute('data-color-theme', savedColor);
      } else {
        setColorThemeState('torii');
        document.documentElement.setAttribute('data-color-theme', 'torii');
      }
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('gns_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch {
      // ignore
    }
  };

  const setColorTheme = (newColor) => {
    const safeColor = VALID_COLOR_THEMES.has(newColor) ? newColor : 'torii';
    setColorThemeState(safeColor);
    try {
      localStorage.setItem('gns_color_theme', safeColor);
      document.documentElement.setAttribute('data-color-theme', safeColor);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorTheme,
        toggleTheme,
        setTheme,
        setColorTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
