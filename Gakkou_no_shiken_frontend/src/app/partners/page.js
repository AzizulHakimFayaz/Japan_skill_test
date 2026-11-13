'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicPartners, submitPartnerApplication } from '@/lib/api';
import {
  GraduationCap,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  Users,
  Sparkles,
  Send,
  Headphones,
  Clock,
  ArrowRight,
  Building2,
} from 'lucide-react';

const COUNTRIES = [
  'Indonesia',
  'Philippines',
  'Bangladesh',
  'Nepal',
  'Vietnam',
  'Myanmar',
  'Sri Lanka',
  'India',
  'Cambodia',
  'Japan',
  'Other',
];

export default function PartnersPage() {
  const [partnersData, setPartnersData] = useState({ total_partners: 0, featured_partners: [] });

  // Application form state
  const [schoolName, setSchoolName] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [city, setCity] = useState('');
  const [contactName, setContactName] = useState('');
  const [whatsappOrPhone, setWhatsappOrPhone] = useState('');
  const [email, setEmail] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState('50');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    getPublicPartners()
      .then((res) => {
        if (res) setPartnersData(res);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!schoolName.trim() || !contactName.trim()) {
      setError('School / LPK Name and Contact Person Name are required.');
      return;
    }
    if (!whatsappOrPhone.trim() && !email.trim()) {
      setError('Please enter a WhatsApp number or Email address so we can send your Sensei link.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitPartnerApplication({
        school_name: schoolName.trim(),
        country,
        city: city.trim(),
        contact_name: contactName.trim(),
        whatsapp_or_phone: whatsappOrPhone.trim(),
        email: email.trim(),
        estimated_students: Number(estimatedStudents) || 50,
        message: message.trim(),
      });
      setSubmitted(res);
      setSchoolName('');
      setCity('');
      setContactName('');
      setWhatsappOrPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err?.message || 'Submission failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 animate-fade-in pb-12">
      {/* 1. Hero Pitch Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/35 text-indigo-200 text-xs font-black uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-rose-400" />
            <span>For LPKs, Review Centers &amp; Japanese Institutes</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
            Run Weekly Prometric JFT-Basic &amp; SSW Mock Exams for Your Entire Batch —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-300">
              100% Free
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl leading-relaxed">
            Skip paper grading and generic Google Forms. Give your students an authentic 250-point Prometric CBT simulator with native Japanese audio—while you track batch pass rates, 4-section weaknesses, and 1st vs Best scores in one Sensei dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#apply-partner"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-japan-red to-rose-600 hover:from-japan-redhover hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-red-500/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Request Free School Account</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/tests"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all"
            >
              Try Public Mock Tests First
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Why Partner Training Centers Love Gakkou No Shiken */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-japan-red dark:text-rose-400">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Prometric Audio &amp; Timer
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Real 60-minute JFT-Basic &amp; SSW CBT workflow with listening play-once rules so students lose exam anxiety before test day.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            4-Section Class Weakness
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Instantly see if Batch-12 is weak in Listening (聴解) vs Reading (読解) so Sensei knows exactly what to review on Monday.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Private School-Only Exams
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload weekly Friday internal exams visible ONLY to your enrolled students—completely hidden from public users and rival centers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            1st vs Best Score + CSV
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Prevent retake score inflation by comparing every candidate&apos;s genuine 1st Attempt vs Best Score, exportable to Excel in 1 click.
          </p>
        </div>
      </section>

      {/* 3. How It Works + Featured Partners Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-emerald-700 dark:text-emerald-300 uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Ready in Under 2 Minutes</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            How Your Friday Weekly Mock Test Works
          </h2>

          <ol className="space-y-4">
            {[
              {
                step: '1',
                title: 'Get Your School Invite Link & Sensei Key',
                desc: 'Submit the form on this page. We approve your LPK / Institute and send your private invite link + Sensei dashboard URL.',
              },
              {
                step: '2',
                title: 'Paste in Your Student WhatsApp Group',
                desc: 'Send students a link like ?partner=your-school&batch=Batch-14. Students create a free account with Full Name & Batch.',
              },
              {
                step: '3',
                title: 'Watch Live Scores & Download Excel Reports',
                desc: 'Every student automatically unlocks your school-exclusive mock tests plus all global JFT/SSW exams, synced straight to your sheet.',
              },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Featured Active Partner Schools */}
          {partnersData.featured_partners?.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Featured Partner Training Centers ({partnersData.total_partners})</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {partnersData.featured_partners.map((p) => (
                  <div
                    key={p.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <span>{p.flag || '🏫'}</span>
                    <span>{p.name}</span>
                    {p.city && <span className="text-[11px] text-slate-400">({p.city})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Partner Application Form */}
        <div
          id="apply-partner"
          className="lg:col-span-6 bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black text-indigo-700 dark:text-indigo-300 uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Partner Onboarding</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Apply for Your School / LPK
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No credit card required. Free weekly CBT simulation &amp; Sensei tracking for verified training centers across Asia.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {submitted.message}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School / LPK / Review Center Name *
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. LPK Sakura Nusantara / Nihongo Center Dhaka"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jakarta, Manila, Dhaka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sensei / Coordinator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Budi Sensei"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Students per Batch
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      value={estimatedStudents}
                      onChange={(e) => setEstimatedStudents(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="text"
                    value={whatsappOrPhone}
                    onChange={(e) => setWhatsappOrPhone(e.target.value)}
                    placeholder="+62 812... / +880 17..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sensei@yourschool.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Focus or Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Preparing 60 Caregiver & Food Service students for JFT-Basic next month..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-japan-red hover:from-indigo-700 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Free Partnership Application'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
