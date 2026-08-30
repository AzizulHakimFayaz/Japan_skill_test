'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotices, getNoticeDetail, downloadNoticePdf } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedThemeBackground from '@/components/AnimatedThemeBackground';
import {
  Bell,
  FileDown,
  AlertTriangle,
  Sparkles,
  FileText,
  Pin,
  Search,
  Calendar,
  ExternalLink,
  ChevronRight,
  Download,
  Eye,
  X,
  Share2,
  Check,
  BookOpen,
  ArrowRight,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch notices
  useEffect(() => {
    setLoading(true);
    getNotices()
      .then((data) => {
        if (data && data.notices) {
          setNotices(data.notices);
          if (data.categories_count) {
            setCategoriesCount(data.categories_count);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching notices:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleOpenNoticeModal = (notice) => {
    setSelectedNotice(notice);
    // Fetch full details and increment view count
    getNoticeDetail(notice.id)
      .then((detailed) => {
        if (detailed && detailed.id) {
          setSelectedNotice(detailed);
          // Update view count in local list
          setNotices((prev) =>
            prev.map((n) => (n.id === detailed.id ? { ...n, views_count: detailed.views_count } : n))
          );
        }
      })
      .catch(() => {});
  };

  const handleDownloadPdf = async (e, notice) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (notice.pdf_file_url) {
        window.open(notice.pdf_file_url, '_blank');
        const res = await downloadNoticePdf(notice.id);
        if (res && res.downloads_count) {
          setNotices((prev) =>
            prev.map((n) => (n.id === notice.id ? { ...n, downloads_count: res.downloads_count } : n))
          );
          if (selectedNotice && selectedNotice.id === notice.id) {
            setSelectedNotice((prev) => ({ ...prev, downloads_count: res.downloads_count }));
          }
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleShareNotice = (e, notice) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/notices#notice-${notice.id}` : '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(notice.id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  // Filter & Search
  const filteredNotices = notices.filter((notice) => {
    // Type Filter
    if (activeFilter === 'material' && notice.notice_type !== 'material') return false;
    if (activeFilter === 'exam_alert' && notice.notice_type !== 'exam_alert') return false;
    if (activeFilter === 'update' && notice.notice_type !== 'update') return false;
    if (activeFilter === 'pinned' && !notice.is_pinned) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notice.title?.toLowerCase().includes(q);
      const matchSummary = notice.summary?.toLowerCase().includes(q);
      const matchContent = notice.content?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchContent) return false;
    }

    return true;
  });

  const pinnedNotice = notices.find((n) => n.is_pinned);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'material':
        return <FileDown className="w-4 h-4 text-blue-500" />;
      case 'exam_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'update':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'material':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'exam_alert':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'update':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#060913] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <AnimatedThemeBackground />
      <Navbar />

      <main className="flex-1 max-w-[1850px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-6 sm:py-10 w-full z-10">
        {/* =========================================================================
             HERO HEADER & STATS
             ========================================================================= */}
        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 text-japan-red text-xs font-black uppercase tracking-wider mb-3">
                <Bell className="w-3.5 h-3.5" />
                <span>Notice &amp; Study Material Center</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Official Notices &amp; <span className="text-japan-red">PDF Study Materials</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                Download official JFT-Basic &amp; SSW vocabulary guides, exam center seat announcements, past test questions, and platform updates.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl shadow-xs">
                <FileDown className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm sm:text-base font-black leading-none">
                    {categoriesCount.material || 0}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">PDF Guides</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl shadow-xs">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div>
                  <div className="text-sm sm:text-base font-black leading-none">
                    {categoriesCount.exam_alert || 0}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Exam Alerts</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl shadow-xs">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-sm sm:text-base font-black leading-none">
                    {categoriesCount.all || 0}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Total Updates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
             FEATURED / PINNED NOTICE HERO CARD
             ========================================================================= */}
        {pinnedNotice && (
          <section className="mb-8 sm:mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <Pin className="w-3.5 h-3.5 fill-current" />
                      <span>Featured Announcement</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTypeBadgeClass(
                        pinnedNotice.notice_type
                      )}`}
                    >
                      {getTypeIcon(pinnedNotice.notice_type)}
                      <span>{pinnedNotice.notice_type_display}</span>
                    </span>

                    <span className="text-slate-400 text-xs font-mono">
                      {pinnedNotice.created_at_formatted}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                    {pinnedNotice.title}
                  </h2>

                  {pinnedNotice.summary && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                      {pinnedNotice.summary}
                    </p>
                  )}

                  {/* Actions Bar inside Pinned Card */}
                  <div className="flex items-center gap-3 flex-wrap pt-2">
                    {pinnedNotice.pdf_file_url && (
                      <button
                        type="button"
                        onClick={(e) => handleDownloadPdf(e, pinnedNotice)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Download {pinnedNotice.file_size_text || 'PDF Guide'}</span>
                      </button>
                    )}

                    {pinnedNotice.related_test ? (
                      <Link
                        href={`/test/${pinnedNotice.related_test}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
                      >
                        <span>Start Practice Test</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : pinnedNotice.action_url ? (
                      <Link
                        href={pinnedNotice.action_url}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
                      >
                        <span>{pinnedNotice.action_button_text || 'Open Link'}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleOpenNoticeModal(pinnedNotice)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Read Full Notice</span>
                    </button>
                  </div>
                </div>

                {/* Right Image Preview or PDF Thumbnail */}
                <div className="lg:col-span-4 flex justify-center">
                  {pinnedNotice.image_url ? (
                    <div
                      onClick={() => handleOpenNoticeModal(pinnedNotice)}
                      className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/80 shadow-2xl max-h-56 w-full cursor-pointer group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pinnedNotice.image_url}
                        alt={pinnedNotice.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : pinnedNotice.pdf_file_url ? (
                    <div
                      onClick={(e) => handleDownloadPdf(e, pinnedNotice)}
                      className="w-full p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                        <FileDown className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-extrabold text-white">Download PDF Guide</span>
                      <span className="text-xs text-blue-300 mt-1 font-mono">{pinnedNotice.file_size_text || 'PDF'}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
             SEARCH & CATEGORY FILTER TABS
             ========================================================================= */}
        <section className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Notices ({categoriesCount.all || notices.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('material')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'material'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF Study Materials ({categoriesCount.material || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('exam_alert')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'exam_alert'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Exam Alerts ({categoriesCount.exam_alert || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('update')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'update'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Updates ({categoriesCount.update || 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-japan-red shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {/* =========================================================================
             NOTICES GRID CARDS
             ========================================================================= */}
        <section>
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-japan-red border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-500">Loading notices &amp; study materials...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No matching notices found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Try selecting another category filter or clearing your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredNotices.map((notice) => (
                <article
                  key={notice.id}
                  id={`notice-${notice.id}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  {/* Top Image Banner (if attached) */}
                  {notice.image_url ? (
                    <div
                      onClick={() => handleOpenNoticeModal(notice)}
                      className="h-44 sm:h-48 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={notice.image_url}
                        alt={notice.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {notice.is_pinned && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3">
                    {/* Meta Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] border ${getTypeBadgeClass(
                            notice.notice_type
                          )}`}
                        >
                          {getTypeIcon(notice.notice_type)}
                          <span>{notice.notice_type_display}</span>
                        </span>

                        <span className="text-[11px] font-semibold text-slate-400 font-mono">
                          {notice.created_at_formatted}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleShareNotice(e, notice)}
                        title="Copy link to notice"
                        className="p-1 rounded-lg text-slate-400 hover:text-japan-red hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedId === notice.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Headline */}
                    <h3
                      onClick={() => handleOpenNoticeModal(notice)}
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      {notice.title}
                    </h3>

                    {/* Summary Snippet */}
                    {notice.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                        {notice.summary}
                      </p>
                    )}

                    {/* PDF Material Download Highlight Box */}
                    {notice.pdf_file_url && (
                      <div
                        onClick={(e) => handleDownloadPdf(e, notice)}
                        className="mt-2 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-950/60 transition-all group/pdf"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <FileDown className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-blue-950 dark:text-blue-200 truncate">
                              PDF Study Sheet
                            </div>
                            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                              {notice.file_size_text || 'Ready for Download'}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold group-hover/pdf:scale-105 transition-transform flex-shrink-0 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>Get PDF</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    {notice.related_test ? (
                      <Link
                        href={`/test/${notice.related_test}`}
                        className="inline-flex items-center gap-1 font-bold text-japan-red hover:text-japan-redhover transition-colors"
                      >
                        <span>Start Mock Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : notice.action_url ? (
                      <Link
                        href={notice.action_url}
                        className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red transition-colors"
                      >
                        <span>{notice.action_button_text || 'View Resource'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenNoticeModal(notice)}
                        className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <span>Read Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      {notice.views_count > 0 && (
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3 h-3" />
                          <span>{notice.views_count}</span>
                        </span>
                      )}
                      {notice.downloads_count > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold" title="Downloads">
                          <Download className="w-3 h-3" />
                          <span>{notice.downloads_count}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =========================================================================
           FULL NOTICE READER MODAL
           ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl sm:max-w-3xl w-full shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getTypeBadgeClass(
                    selectedNotice.notice_type
                  )}`}
                >
                  {getTypeIcon(selectedNotice.notice_type)}
                  <span>{selectedNotice.notice_type_display}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedNotice.created_at_formatted}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {selectedNotice.title}
              </h2>

              {/* Flyer Image (if present) */}
              {selectedNotice.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedNotice.image_url}
                    alt={selectedNotice.title}
                    className="w-full h-auto max-h-80 object-cover"
                  />
                </div>
              )}

              {/* PDF Material Highlight Download Banner */}
              {selectedNotice.pdf_file_url && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileDown className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-blue-950 dark:text-blue-100">
                        Downloadable PDF Document Attached
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-mono mt-0.5">
                        {selectedNotice.file_size_text || 'PDF File Ready'} • {selectedNotice.downloads_count || 0} candidate download(s)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadPdf(e, selectedNotice)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Now</span>
                  </button>
                </div>
              )}

              {/* Full Formatted Notice Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedNotice.content || selectedNotice.summary}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => handleShareNotice(e, selectedNotice)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === selectedNotice.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Notice</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {selectedNotice.related_test ? (
                  <Link
                    href={`/test/${selectedNotice.related_test}`}
                    className="px-5 py-2 rounded-xl bg-japan-red hover:bg-japan-redhover text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>Start Practice Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : selectedNotice.action_url ? (
                  <Link
                    href={selectedNotice.action_url}
                    className="px-5 py-2 rounded-xl bg-japan-red hover:bg-japan-redhover text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>{selectedNotice.action_button_text || 'Open Resource'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
