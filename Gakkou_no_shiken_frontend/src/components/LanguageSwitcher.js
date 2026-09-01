'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', short: 'বাং', flag: '🇧🇩' },
  { code: 'ja', label: '日本語', short: 'JP', flag: '🇯🇵' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        className={`flex items-center gap-1 py-1 px-2 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 text-japan-red dark:text-rose-400 border-slate-300 dark:border-slate-700 shadow-xs'
            : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="font-extrabold text-[11px] sm:text-xs">{compact ? currentLang.short : currentLang.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in">
          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
            Language / ভাষা
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                language === lang.code
                  ? 'bg-red-50 dark:bg-rose-950/50 text-japan-red dark:text-rose-400 font-extrabold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-japan-red dark:text-rose-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
