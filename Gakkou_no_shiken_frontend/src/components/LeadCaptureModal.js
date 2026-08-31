'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { X, Bell, Mail, Phone, CheckCircle2, Sparkles, Send, ExternalLink, MessageSquare } from 'lucide-react';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m';
const FACEBOOK_URL = 'https://www.facebook.com/Gakkou.No.Shiken';
const INSTAGRAM_URL = 'https://www.instagram.com/gakkou.no.shiken/';

export default function LeadCaptureModal({ isOpen, onClose, sectorName = 'SSW Skill Evaluation' }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email && !phone) return;
    setLoading(true);

    // Simulate instant registration of interest
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      // Automatically open the WhatsApp Channel in a new tab upon submit
      if (typeof window !== 'undefined') {
        try {
          window.open(WHATSAPP_CHANNEL_URL, '_blank', 'noopener,noreferrer');
        } catch (err) {
          console.error('Failed to open WhatsApp window:', err);
        }
      }
    }, 500);
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-3 sm:py-5 space-y-4 animate-fade-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                You&apos;re On the Priority List!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We will notify you immediately as soon as new mock test sets for <strong>{sectorName}</strong> are released.
              </p>
            </div>

            {/* Direct WhatsApp Channel Action Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Follow Our Official WhatsApp Channel</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Stay updated with instant CBT test notifications, Prometric exam schedules, and results directly on WhatsApp:
              </p>
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Channel ↗</span>
              </a>
            </div>

            {/* Community Social Links */}
            <div className="pt-1 flex items-center justify-center gap-2 text-xs">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 font-bold text-[11px] flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/60 font-bold text-[11px] flex items-center gap-1 hover:bg-pink-100 transition-colors"
              >
                <span>Instagram</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                <Bell className="w-3 h-3 text-amber-500 animate-bounce" />
                <span>Instant Exam Release Alert</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Get Notified for {sectorName}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Be the first to practice newly released Prometric-standard CBT mock exams with full audio and scoring.
              </p>
            </div>

            {/* Quick 1-Tap WhatsApp Channel Banner */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Official WhatsApp Channel
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400">
                    Tap to follow for instant updates
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XX-XXXXXX"
                    className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red"
                  />
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading || (!email && !phone)}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Registering Alert...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Submit &amp; Open WhatsApp Channel</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                🔒 No spam. Submitting will redirect directly to our WhatsApp Channel.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
