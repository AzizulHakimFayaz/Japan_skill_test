'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotices, getNoticeDetail, downloadNoticePdf } from '@/lib/api';
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
  Clock,
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
    getNoticeDetail(notice.id)
      .then((detailed) => {
        if (detailed && detailed.id) {
          setSelectedNotice(detailed);
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
    if (activeFilter === 'material' && notice.notice_type !== 'material') return false;
    if (activeFilter === 'exam_alert' && notice.notice_type !== 'exam_alert') return false;
    if (activeFilter === 'update' && notice.notice_type !== 'update') return false;
    if (activeFilter === 'pinned' && !notice.is_pinned) return false;

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
        return <FileDown className="w-3.5 h-3.5 text-blue-500" />;
      case 'exam_alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'update':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'material':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'exam_alert':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'update':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {/* =========================================================================
           1. HERO HEADER & QUICK STATS
           ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900/10 via-amber-900/5 to-blue-900/10 dark:from-rose-950/40 dark:via-slate-900/60 dark:to-blue-950/40 p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/30 text-japan-red text-xs font-black uppercase tracking-wider mb-3">
              <Bell className="w-3.5 h-3.5" />
              <span>Official Bulletin &amp; Study Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Official Notices &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-japan-red via-rose-500 to-amber-500">PDF Study Materials</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-normal">
              Download official JFT-Basic &amp; SSW vocabulary cheat-sheets, exam center seat alerts, mock test announcements, and official syllabus guidelines.
            </p>
          </div>

          {/* Quick Stats Pill Grid */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                  {categoriesCount.material || 0}
                </div>
                <div className="text-[11px] text-slate-500 font-bold mt-0.5">PDF Materials</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                  {categoriesCount.exam_alert || 0}
                </div>
                <div className="text-[11px] text-slate-500 font-bold mt-0.5">Exam Alerts</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                  {categoriesCount.all || notices.length}
                </div>
                <div className="text-[11px] text-slate-500 font-bold mt-0.5">Total Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
           2. FEATURED / PINNED HERO BANNER
           ========================================================================= */}
      {pinnedNotice && (
        <section>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1120] to-[#040711] text-white p-6 sm:p-8 lg:p-10 border border-slate-800/90 shadow-2xl">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-300 font-black uppercase tracking-wider shadow-xs">
                    <Pin className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>Featured Notice</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${getTypeBadgeClass(
                      pinnedNotice.notice_type
                    )}`}
                  >
                    {getTypeIcon(pinnedNotice.notice_type)}
                    <span>{pinnedNotice.notice_type_display}</span>
                  </span>

                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pinnedNotice.created_at_formatted}
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug text-white">
                  {pinnedNotice.title}
                </h2>

                {pinnedNotice.summary && (
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                    {pinnedNotice.summary}
                  </p>
                )}

                {/* Actions Bar inside Pinned Card */}
                <div className="flex items-center gap-3 flex-wrap pt-3">
                  {pinnedNotice.pdf_file_url && (
                    <button
                      type="button"
                      onClick={(e) => handleDownloadPdf(e, pinnedNotice)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-japan-red via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download {pinnedNotice.file_size_text || 'PDF Material'}</span>
                    </button>
                  )}

                  {pinnedNotice.related_test ? (
                    <Link
                      href={`/test/${pinnedNotice.related_test}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all backdrop-blur-md"
                    >
                      <span>Start Practice Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : pinnedNotice.action_url ? (
                    <Link
                      href={pinnedNotice.action_url}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all backdrop-blur-md"
                    >
                      <span>{pinnedNotice.action_button_text || 'Open Resource'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleOpenNoticeModal(pinnedNotice)}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer hover:bg-white/5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read Full Notice</span>
                  </button>
                </div>
              </div>

              {/* Right Image Container (Responsive, No distortion) */}
              <div className="lg:col-span-4 flex justify-center">
                {pinnedNotice.image_url ? (
                  <div
                    onClick={() => handleOpenNoticeModal(pinnedNotice)}
                    className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-white dark:bg-slate-900/90 shadow-2xl w-full max-w-sm h-48 sm:h-56 flex items-center justify-center p-3 cursor-pointer group/img"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pinnedNotice.image_url}
                      alt={pinnedNotice.title}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Eye className="w-3 h-3" /> Click to enlarge
                      </span>
                    </div>
                  </div>
                ) : pinnedNotice.pdf_file_url ? (
                  <div
                    onClick={(e) => handleDownloadPdf(e, pinnedNotice)}
                    className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition-all shadow-xl group/pdf"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover/pdf:scale-110 transition-transform shadow-md">
                      <FileDown className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-extrabold text-white">Download PDF Guide</span>
                    <span className="text-xs text-blue-300 mt-1 font-mono">{pinnedNotice.file_size_text || 'PDF Document'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
           3. SEARCH & CATEGORY FILTER TABS
           ========================================================================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>All Notices ({categoriesCount.all || notices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('material')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'material'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200/90 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF Materials ({categoriesCount.material || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('exam_alert')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'exam_alert'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200/90 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Exam Alerts ({categoriesCount.exam_alert || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('update')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'update'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200/90 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Updates ({categoriesCount.update || 0})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements &amp; PDFs..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-japan-red shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
           4. NOTICES GRID (EDITORIAL CARDS)
           ========================================================================= */}
      <section>
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-japan-red border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500">Loading notices &amp; study materials...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No notices found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No items match your filter criteria. Try choosing &quot;All Notices&quot; or clearing your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => (
              <article
                key={notice.id}
                id={`notice-${notice.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
              >
                {/* Top Image Flyer Container (Fixed aspect ratio & clean padding) */}
                {notice.image_url ? (
                  <div
                    onClick={() => handleOpenNoticeModal(notice)}
                    className="h-44 sm:h-48 w-full bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 overflow-hidden relative cursor-pointer flex items-center justify-center p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={notice.image_url}
                      alt={notice.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
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
                <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3.5">
                  {/* Meta Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] border ${getTypeBadgeClass(
                          notice.notice_type
                        )}`}
                      >
                        {getTypeIcon(notice.notice_type)}
                        <span>{notice.notice_type_display}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notice.created_at_formatted}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleShareNotice(e, notice)}
                      title="Copy link to notice"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-japan-red hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === notice.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Headline */}
                  <h3
                    onClick={() => handleOpenNoticeModal(notice)}
                    className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-japan-red dark:group-hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    {notice.title}
                  </h3>

                  {/* Summary Snippet */}
                  {notice.summary && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                      {notice.summary}
                    </p>
                  )}

                  {/* High-End PDF Material Download Box */}
                  {notice.pdf_file_url && (
                    <div
                      onClick={(e) => handleDownloadPdf(e, notice)}
                      className="mt-1 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-xs group/pdf"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/20 group-hover/pdf:scale-105 transition-transform">
                          <FileDown className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-blue-950 dark:text-blue-200 truncate">
                            Download PDF Material
                          </div>
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                            {notice.file_size_text || 'PDF File Ready'}
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold group-hover/pdf:scale-105 transition-transform flex-shrink-0 flex items-center gap-1.5 shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        <span>Get PDF</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Footer */}
                <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  {notice.related_test ? (
                    <Link
                      href={`/test/${notice.related_test}`}
                      className="inline-flex items-center gap-1.5 font-bold text-japan-red hover:text-japan-redhover transition-colors text-xs"
                    >
                      <span>Start Mock Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : notice.action_url ? (
                    <Link
                      href={notice.action_url}
                      className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red transition-colors text-xs"
                    >
                      <span>{notice.action_button_text || 'Open Link'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenNoticeModal(notice)}
                      className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      <span>Read Full Announcement</span>
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

      {/* =========================================================================
           5. FULL NOTICE READER MODAL
           ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl sm:max-w-3xl w-full shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeBadgeClass(
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

              {/* Flyer Image (Responsive, cleanly formatted) */}
              {selectedNotice.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center max-h-80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedNotice.image_url}
                    alt={selectedNotice.title}
                    className="max-h-72 max-w-full object-contain rounded-xl"
                  />
                </div>
              )}

              {/* PDF Material Highlight Download Banner */}
              {selectedNotice.pdf_file_url && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/30">
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
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                    className="px-5 py-2.5 rounded-xl bg-japan-red hover:bg-japan-redhover text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>Start Practice Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : selectedNotice.action_url ? (
                  <Link
                    href={selectedNotice.action_url}
                    className="px-5 py-2.5 rounded-xl bg-japan-red hover:bg-japan-redhover text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>{selectedNotice.action_button_text || 'Open Resource'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
