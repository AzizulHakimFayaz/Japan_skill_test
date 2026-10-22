'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { X, Bell, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m';
const FACEBOOK_URL = 'https://www.facebook.com/Gakkou.No.Shiken';
const INSTAGRAM_URL = 'https://www.instagram.com/gakkou.no.shiken/';

export default function LeadCaptureModal({ isOpen, onClose, sectorName = 'SSW Skill Evaluation' }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-japan-red mx-auto flex items-center justify-center shadow-md">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Stay Updated: {sectorName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Get instant alerts when new mock test sets, official Prometric test dates, and textbook guides are published.
          </p>
        </div>

        {/* Channel Links */}
        <div className="space-y-3">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold">Official WhatsApp Channel</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Exam seat alerts &amp; voucher tips</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </a>

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-sm">
                f
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold">Official Facebook Community</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400">Daily grammar questions &amp; Q&amp;A</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </a>
        </div>

        {/* Privacy & Trust Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Free Candidate Resources • No Spam</span>
          </p>
        </div>
      </div>
    </div>
  );
}
