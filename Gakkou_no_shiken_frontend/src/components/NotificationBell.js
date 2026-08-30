'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getNotices, downloadNoticePdf } from '@/lib/api';
import {
  Bell,
  FileText,
  AlertTriangle,
  FileDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCheck,
  Pin,
  X,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);

  // Load read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gakkou_read_notices');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch recent notices
  const fetchNotices = () => {
    setLoading(true);
    getNotices({ limit: 10 })
      .then((data) => {
        if (data && data.notices) {
          setNotices(data.notices);
        }
      })
      .catch((err) => {
        console.error('Error loading notices in bell:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotices();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchNotices, 120000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('gakkou_read_notices', JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  };

  const markAllAsRead = () => {
    const allIds = notices.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('gakkou_read_notices', JSON.stringify(allIds));
    } catch {
      // Ignore
    }
  };

  const handleDownloadPdf = async (e, notice) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(notice.id);
    try {
      if (notice.pdf_file_url) {
        window.open(notice.pdf_file_url, '_blank');
        downloadNoticePdf(notice.id).catch(() => {});
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const unreadCount = notices.filter((n) => !readIds.includes(n.id)).length;

  const filteredNotices = notices.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'material') return n.notice_type === 'material';
    if (activeTab === 'alerts') return n.notice_type === 'exam_alert';
    return true;
  });

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
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'exam_alert':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'update':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications and Notices"
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
          isOpen
            ? 'bg-rose-50 dark:bg-rose-950/40 border-japan-red/40 text-japan-red shadow-xs'
            : 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200'
        }`}
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:rotate-12" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-japan-red text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-red-500/30 border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-[26rem] max-w-[28rem] bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-japan-red">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Notices &amp; Materials
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-japan-red dark:hover:text-japan-red flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-white dark:bg-[#0c1222] border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({notices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('material')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'material'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              <FileDown className="w-3 h-3" />
              <span>PDF Materials</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Exam Alerts</span>
            </button>
          </div>

          {/* Notices Scrollable List */}
          <div className="max-h-[22rem] sm:max-h-[26rem] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-japan-red border-t-transparent rounded-full animate-spin"></div>
                <span>Checking latest notices...</span>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-slate-600 dark:text-slate-400">No notices in this category</p>
                <p className="text-[11px] mt-0.5">Check back later for new study guides and exam updates.</p>
              </div>
            ) : (
              filteredNotices.map((notice) => {
                const isUnread = !readIds.includes(notice.id);

                return (
                  <div
                    key={notice.id}
                    onClick={() => markAsRead(notice.id)}
                    className={`p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-2 relative ${
                      isUnread ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-japan-red"></span>
                    )}

                    {/* Top Meta Row */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px]">
                      {notice.is_pinned && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold border text-[10px] ${getTypeBadgeClass(
                          notice.notice_type
                        )}`}
                      >
                        {getTypeIcon(notice.notice_type)}
                        <span>{notice.notice_type_display}</span>
                      </span>

                      <span className="text-slate-400 dark:text-slate-500 font-mono">
                        {notice.time_ago || notice.created_at_formatted}
                      </span>
                    </div>

                    {/* Image Thumbnail Banner (Clean Framing) */}
                    {notice.image_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 h-28 w-full bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={notice.image_url}
                          alt={notice.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}

                    {/* Title & Summary */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {notice.title}
                      </h4>
                      {notice.summary && (
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {notice.summary}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
                      {/* PDF Material Download Button */}
                      {notice.pdf_file_url ? (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadPdf(e, notice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download {notice.file_size_text || 'PDF'}</span>
                        </button>
                      ) : (
                        <div />
                      )}


                      {/* View Link / Related Test Link */}
                      {notice.related_test ? (
                        <Link
                          href={`/test/${notice.related_test}`}
                          onClick={() => {
                            markAsRead(notice.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-japan-red hover:text-japan-redhover transition-colors"
                        >
                          <span>Take Mock Test</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : notice.action_url ? (
                        <Link
                          href={notice.action_url}
                          onClick={() => {
                            markAsRead(notice.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-japan-red transition-colors"
                        >
                          <span>{notice.action_button_text || 'Open'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/notices#notice-${notice.id}`}
                          onClick={() => {
                            markAsRead(notice.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          <span>Read full notice</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
            <Link
              href="/notices"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>View Notice Board &amp; Study Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
