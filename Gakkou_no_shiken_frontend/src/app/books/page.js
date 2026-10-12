'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Languages,
  Sparkles,
  Search,
  Volume2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Layers,
  GraduationCap,
  Download,
  Filter,
  FileText,
  Compass,
  Headphones,
  ExternalLink,
  ShieldAlert,
  HardHat,
  Building2,
  Wrench,
} from 'lucide-react';
import { getBooks } from '@/lib/api';

export default function BooksLibraryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLanguage, setActiveLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadBooks() {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (activeLanguage !== 'all') params.language = activeLanguage;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const data = await getBooks(params);
        if (isMounted) {
          setBooks(data.books || []);
          if (data.languages && data.languages.length > 0) {
            setLanguages(data.languages);
          }
        }
      } catch (err) {
        console.error('Failed to load exam books:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBooks();
    return () => { isMounted = false; };
  }, [activeCategory, activeLanguage, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Categories', label_ja: 'すべて', icon: Layers },
    { id: 'architecture', label: 'Architecture', label_ja: '建築', icon: Building2 },
    { id: 'civil', label: 'Civil Engineering', label_ja: '土木', icon: HardHat },
    { id: 'lifeline', label: 'Infrastructure & Lifeline', label_ja: '設備・ライフライン', icon: Wrench },
  ];

  const popularLanguages = [
    { code: 'all', name: 'All Languages', flag: '🌐' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
    { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">PDF Books &amp; Study Guides</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-rose-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-rose-900/30">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official JAC Examination Textbooks (特定技能評価試験)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Read Books with <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-amber-300">Synchronized Audio</span> &amp; Key Topics
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Read official construction textbooks directly in your browser. Jump directly to important topics on each page, listen to native Japanese audio explanations, and master high-frequency exam questions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-amber-400" /> Neural Japanese Audio
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-rose-400" /> Page-Synced Navigation
            </span>
            <span className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-sky-400" /> 15+ Languages Available
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Category, Language & Search */}
      <div className="space-y-4 bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-japan-red text-white shadow-md shadow-rose-900/20 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-normal">({cat.label_ja})</span>
              </button>
            );
          })}
        </div>

        {/* Language Selection Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Languages className="w-3.5 h-3.5 text-japan-red" /> Language:
          </span>
          {popularLanguages.map((lang) => {
            const isSelected = activeLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search textbooks by topic, trade, or title (e.g. 建築, 鉄筋, 安全, Civil)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red transition-all"
          />
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No textbooks found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try switching the category or language filter above to explore other official examination guides.
          </p>
          <button
            onClick={() => { setActiveCategory('all'); setActiveLanguage('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-japan-red text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-rose-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const hasAudioTopics = book.topics_count > 0;
            return (
              <div
                key={book.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-japan-red/40 dark:hover:border-rose-500/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Book Card Top Banner */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-black uppercase tracking-wider">
                      <span>{book.language_flag || '🇯🇵'}</span>
                      <span>{book.language_name}</span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {book.total_pages} Pages
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    {book.title_ja && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 line-clamp-1">
                        {book.title_ja}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {book.description || 'Official JAC preparation textbook for Specified Skilled Worker examination in Japan.'}
                  </p>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/30">
                      <Headphones className="w-3 h-3 text-amber-500" />
                      <span>{hasAudioTopics ? `${book.topics_count} Audio Topics` : 'Audio TTS Ready'}</span>
                    </span>
                    {book.questions_count > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{book.questions_count} Exam Q&amp;As</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <Link
                    href={`/books/${book.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read &amp; Listen</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  {book.pdf_download_url && (
                    <a
                      href={book.pdf_download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download PDF"
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-japan-red border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
