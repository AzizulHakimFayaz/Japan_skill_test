'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  UserCheck,
  Trash2,
  Mail,
  ExternalLink,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview & Commitment to Candidate Privacy',
    content: `Gakkou No Shiken (学校の試験 - "we", "our", or "the platform") is committed to protecting the privacy and personal integrity of all candidates preparing for the Japan Foundation Test for Basic Japanese (JFT-Basic) and Specified Skilled Worker (SSW) examinations. This Privacy Policy details how we collect, store, evaluate, and safeguard your account credentials, examination results, and technical data when you use our web platform.`,
  },
  {
    id: 'data_collected',
    title: '2. Information We Collect',
    content: `To provide an authentic CBT examination simulation and personalized score reports, we collect minimal and necessary information:
• Account Credentials: Full name, username, email address, and encrypted password hash (via secure Argon2/PBKDF2 algorithms).
• Exam Performance Data: Answers submitted for each question, scaled scores (10–250 for JFT, percentage scores for SSW), time spent per question, and completion timestamps.
• Nationality & Exam Country: Used exclusively to personalize your local test venue guides, local voucher payment tips, and national leaderboard standings.
• Technical & Device Diagnostics: IP address (used for approximate country detection and anti-cheating protection), browser type, and screen viewport dimensions to ensure proper CBT simulator rendering.`,
  },
  {
    id: 'geolocation',
    title: '3. IP Geolocation & Country Confirmation',
    content: `When you visit or register on Gakkou No Shiken, our server queries your client IP against local offline GeoIP2 database tables to detect your candidate region (e.g., Bangladesh, Nepal, Vietnam, Indonesia, Japan).
• Purpose: To show relevant local test center locations (e.g., UTC Dhaka / Chittagong), local voucher payment methods in BDT, and rank you on your national candidate leaderboard.
• User Control: You always have the right to confirm or override your country via your Profile Settings or the Country Confirmation Dialog. We never share or sell physical GPS or pinpoint coordinates.`,
  },
  {
    id: 'exam_results',
    title: '4. Mock Test Attempts & Official Score Certificates',
    content: `When you complete a mock exam:
• Your answers are evaluated on our secure server, and an official CEFR scaled score is calculated.
• The score report and downloadable high-resolution PDF certificate are stored in your private Candidate Dashboard under "My Results".
• You can review your past answers, view explanations, and track your progress toward the 200-point JFT passing benchmark.
• Staff and test administrators can view aggregate, anonymized test performance statistics to improve exam question quality and calibrate item difficulty.`,
  },
  {
    id: 'cookies_storage',
    title: '5. Cookies, Tokens & Local Storage',
    content: `We utilize lightweight, secure browser storage:
• JWT Authentication Tokens: Secure tokens stored in HTTP cookies or local storage to keep you signed in between study sessions.
• Theme Preferences: Local storage saves your preferred Light or Dark mode setting.
• Dismissed Banners: Session storage remembers if you dismissed the Country Confirmation dialog so you are not interrupted repeatedly.
• We do NOT employ third-party behavioral tracking cookies or sell your browsing history to advertising networks.`,
  },
  {
    id: 'security',
    title: '6. Platform Security & Anti-Tampering Protections',
    content: `We employ enterprise-grade security measures to safeguard candidate data and protect exam questions from unauthorized extraction:
• SSL/TLS 256-bit encryption for all data in transit across our web endpoints.
• Anti-Capture Watermarks: During actual exam runs, subtle dynamic watermarks are embedded into the CBT canvas to deter unauthorized redistribution of question banks.
• Strict Staff-Only Permissions: Draft mock tests and administrative bulk question uploaders are protected by role-based access control and rate throttles.`,
  },
  {
    id: 'third_party',
    title: '7. Third-Party Integrations',
    content: `We integrate only with trusted, industry-standard service providers:
• Google Authentication: For optional 1-click candidate login (Google ID token verification only; we do not access your Google contacts or private files).
• Transactional Email Delivery: For 6-digit registration OTP verification codes and password reset links via encrypted SMTP.
• Cloudflare & LiteSpeed: For DDoS protection, CDN asset caching, and web application firewall security.`,
  },
  {
    id: 'compliance',
    title: '8. Compliance with Japan APPI & International Standards',
    content: `Because our tests prepare candidates for employment and residency under Japan's Ministry of Justice immigration standards, we observe principles aligned with Japan's Act on the Protection of Personal Information (APPI) as well as global GDPR principles:
• Lawful, fair, and transparent data processing.
• Purpose limitation: candidate data is used solely for educational assessment and certification preparation.
• Data minimization: we never ask for sensitive financial credit card details directly on our servers.`,
  },
  {
    id: 'user_rights',
    title: '9. Your Rights & Account Deletion',
    content: `As a registered candidate, you hold full authority over your data:
• Right of Access: View all your personal details and exam attempt histories at any time from your profile.
• Right of Rectification: Update your name, Japanese level, bio, and country anytime.
• Right of Erasure (Right to be Forgotten): You may request complete deletion of your account, email, and historical test attempts by contacting our administrative team at support@gakkounoshiken.site.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us Regarding Privacy',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how your candidate information is handled, please reach out to us:
• Official Email: privacy@gakkounoshiken.site / support@gakkounoshiken.site
• Facebook Official: facebook.com/Gakkou.No.Shiken
• WhatsApp Support Channel: Available via official link in footer
• Data Controller: Gakkou No Shiken CBT Systems Team`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c1222] border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-japan-red/15 blur-3xl" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy &amp; Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          At Gakkou No Shiken, we prioritize candidate confidentiality and data security. Learn how we handle your mock test results, IP geolocation, and profile information.
        </p>
        <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800 flex items-center gap-3">
          <span>Effective Date: September 2026</span>
          <span>•</span>
          <span>Version 2.4 (Prometric CBT Compliance Edition)</span>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <strong className="text-sm font-bold text-slate-900 dark:text-white block">No Ad Tracking</strong>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We do not sell your personal details, browsing history, or test scores to third-party advertisers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-japan-red dark:text-rose-400 flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <strong className="text-sm font-bold text-slate-900 dark:text-white block">Encrypted Storage</strong>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Passwords and authentication tokens are encrypted with military-grade hashing algorithms.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <strong className="text-sm font-bold text-slate-900 dark:text-white block">You Own Your Data</strong>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export your certificates, update your nationality, or request complete account erasure anytime.
          </p>
        </div>
      </div>

      {/* Main Policy Content Sections */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
        {SECTIONS.map((sec, idx) => (
          <div key={sec.id} className={idx > 0 ? 'pt-8 space-y-3' : 'space-y-3'}>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {sec.title}
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {sec.content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Contact Card */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Have privacy inquiries?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Our data protection team responds to candidate verification and deletion inquiries within 48 hours.
          </p>
        </div>
        <a
          href="mailto:support@gakkounoshiken.site"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Privacy Team</span>
        </a>
      </div>
    </div>
  );
}
