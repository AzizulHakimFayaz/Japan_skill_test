'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { X, Bell, Mail, Phone, CheckCircle2, Sparkles, Send } from 'lucide-react';

export default function LeadCaptureModal({ isOpen, onClose, sectorName = 'SSW Skill Evaluation' }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('both'); // 'email', 'whatsapp', 'both'
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
      setTimeout(() => {
        // Auto-close after success feedback
        // onClose();
      }, 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                You&apos;re On the Priority List!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                We will notify you immediately via {channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'Email & WhatsApp'} as soon as new mock test sets for <strong>{sectorName}</strong> are released.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[10px] font-black uppercase tracking-wider">
                <Bell className="w-3 h-3 text-amber-500 animate-bounce" />
                <span>Instant Exam Release Alert</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Get Notified for {sectorName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Be the first to practice newly released Prometric-standard CBT mock exams with full audio and scoring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp / Phone (Optional for Bangladesh SMS alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XX-XXXXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (!email && !phone)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Registering Alert...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Notify Me When Live</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                🔒 No spam. Only official CBT test release announcements.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
