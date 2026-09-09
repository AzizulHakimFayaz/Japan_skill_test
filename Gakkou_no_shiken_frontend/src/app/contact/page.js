'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How fast will I receive a response to my inquiry?',
    a: 'Our candidate support team typically replies within 12 to 24 hours (Saturday through Thursday, 9:00 AM – 8:00 PM BST / 12:00 PM – 11:00 PM JST).',
  },
  {
    q: 'Can I get help with Prometric ID registration or test voucher purchasing?',
    a: 'Yes! We guide candidates on how to register their official Prometric ID, locate test venues in Dhaka/Chittagong or overseas, and navigate local currency voucher requirements.',
  },
  {
    q: 'How do I report an issue with a mock test question or audio playback?',
    a: 'Please use the form below with the subject "Question Feedback / Technical Issue", mentioning the Test ID (e.g. BDJ01) and Question Number. Our language curriculum specialists review every report.',
  },
  {
    q: 'Can language institutes or Japanese training academies partner with Gakkou No Shiken?',
    a: 'Absolutely. We partner with Japanese language academies across Bangladesh, Nepal, and South Asia to provide batch mock examinations and candidate diagnostic reports.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'jft_basic',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate swift confirmation
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Gakkou No Shiken Support',
    description:
      'Official contact and candidate support page for Gakkou No Shiken Japanese CBT examination platform.',
    url: 'https://www.gakkounoshiken.site/contact',
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: 'Gakkou No Shiken',
      email: 'support@gakkounoshiken.site',
      url: 'https://www.gakkounoshiken.site',
      sameAs: [
        'https://www.facebook.com/Gakkou.No.Shiken',
        'https://www.instagram.com/gakkou.no.shiken/',
        'https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m',
        'https://www.youtube.com/@gakkounoshiken',
      ],
    },
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in pb-16 font-sans">
      {/* Schema.org ContactPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      {/* ──────────────────────────────────────────────────────────────────
          1. HERO HEADER SECTION
          ────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c1222] border border-slate-800/80 p-6 sm:p-12 lg:p-14 shadow-2xl text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-japan-red/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-japan-red" />
            <span>Official Candidate Support &amp; Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            We&apos;re Here to Help You <span className="text-japan-red">Pass with Confidence</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
            Have questions about our CBT mock examinations, scoring methodology, or Prometric test center procedures? Reach out directly to our curriculum and technical support team.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. DIRECT CONTACT CHANNELS & CARDS
          ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: General & Student Support */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-japan-red flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Direct Email</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Candidate Support</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Inquiries regarding test enrollment, score reports, answer explanations, or technical feedback.
          </p>
          <a
            href="mailto:support@gakkounoshiken.site"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-japan-red hover:text-japan-redhover transition-colors"
          >
            <span>support@gakkounoshiken.site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 2: WhatsApp & Community */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Instant Community</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">WhatsApp Channel</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Official announcements, voucher alerts, exam schedule updates, and daily study tips for candidates.
          </p>
          <a
            href="https://whatsapp.com/channel/0029Vb8f5nVGOj9mKhSBbp3m"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Join WhatsApp Community</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 3: Operating Hours & Regional Base */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Operational Desk</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Support Hours</h3>
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              Sat – Thu: 09:00 – 20:00 (BST)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Equivalent: 12:00 – 23:00 (Tokyo JST)
            </p>
            <p className="pt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard Response: Within 24h</span>
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          3. INQUIRY FORM & REGIONAL PRESENCE
          ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-black uppercase text-japan-red dark:text-rose-400 tracking-wider">
              Send a Message
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Candidate Inquiry Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Fill out the form below. A language curriculum specialist or technical coordinator will reply to your email.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 p-6 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Your inquiry has been dispatched to our support desk. We will respond to <strong>{formData.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', category: 'jft_basic', subject: '', message: '' });
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <span>Send Another Message</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-japan-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-japan-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Exam / Target Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red transition-all"
                  >
                    <option value="jft_basic">JFT-Basic (A1/A2)</option>
                    <option value="ssw_nursing">SSW Nursing Care (特定技能 介護)</option>
                    <option value="ssw_food">SSW Food Service (特定技能 外食)</option>
                    <option value="ssw_agri">SSW Agriculture (特定技能 農業)</option>
                    <option value="prometric_center">Prometric Center / Voucher Guidance</option>
                    <option value="institution_partnership">Language Institute Partnership</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subject / Topic <span className="text-japan-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Listening playback issue or voucher help"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Message / Details <span className="text-japan-red">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide any details, test IDs, or questions you have..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-japan-red/30 focus:border-japan-red transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Column: Regional Offices & Official Links */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location & Organization Overview */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Publisher &amp; Editorial Operations
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Gakkou No Shiken (学校の試験)
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-japan-red shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Bangladesh Support Hub</strong>
                  <span>Panthapath / Dhanmondi, Dhaka, Bangladesh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Japan Liaison</strong>
                  <span>Shinjuku-ku, Tokyo, Japan</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Official Social Channels
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.facebook.com/Gakkou.No.Shiken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.instagram.com/gakkou.no.shiken/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/50 text-slate-700 dark:text-slate-300 hover:text-pink-600 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.youtube.com/@gakkounoshiken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-700 dark:text-slate-300 hover:text-red-600 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Non-Affiliation Trust Note */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Independent Educational Resource</span>
            </div>
            <p className="leading-relaxed">
              Gakkou No Shiken is an independent educational preparatory platform. We are not affiliated with or endorsed by The Japan Foundation (国際交流基金), Prometric Inc., or the Ministry of Foreign Affairs of Japan.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          4. FREQUENTLY ASKED QUESTIONS ACCORDION
          ────────────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-japan-red uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Inquiries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quick Answers Before You Write
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {item.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
