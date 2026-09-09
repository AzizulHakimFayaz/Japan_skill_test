'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Scale,
  Building2,
  Mail,
} from 'lucide-react';

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms & Service Scope',
    content: `Welcome to Gakkou No Shiken (学校の試験 - "we", "our", or "the platform"). By accessing, browsing, or registering an account on www.gakkounoshiken.site, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of these Terms, you must discontinue use of the platform immediately.
    
Gakkou No Shiken is an independent computer-based testing (CBT) preparatory and educational platform created to assist candidates studying for the Japan Foundation Test for Basic Japanese (JFT-Basic) and Specified Skilled Worker (SSW) skill examinations.`,
  },
  {
    id: 'license',
    title: '2. Educational Examination Simulator License',
    content: `We grant you a non-exclusive, non-transferable, revocable license to access and use the educational mock tests, flashcards, and language tools solely for personal, non-commercial examination preparation.
    
You agree NOT to:
• Reproduce, scrape, crawl, reverse-engineer, or duplicate the question banks, audio files, or software engine for commercial distribution.
• Resell, sub-license, or redistribute mock test access or question materials without written consent from Gakkou No Shiken.
• Deploy automated bots, web scrapers, or scripts to access our servers or download test assets.`,
  },
  {
    id: 'accounts',
    title: '3. Candidate Accounts & Credential Security',
    content: `To save your exam progress, calculate your scaled CEFR scores, and view past performance reports, you may create a Candidate Account.
• You must provide accurate, current, and complete registration information.
• You are solely responsible for maintaining the confidentiality of your account credentials (username and password).
• You agree to notify us immediately at support@gakkounoshiken.site of any unauthorized use or security breach of your account.
• We reserve the right to suspend or terminate accounts that violate our conduct rules or engage in abuse.`,
  },
  {
    id: 'anti_cheating',
    title: '4. Fair Use, Anti-Cheating & Community Standards',
    content: `Gakkou No Shiken fosters a realistic, honest learning environment for candidates preparing for high-stakes overseas employment and visa exams.
• National Leaderboard Integrity: Submissions detected using automated answer scripts, browser manipulation, or unnatural completion times will be disqualified from national rankings.
• Multi-Account Manipulation: Creating multiple fake accounts to game rankings or exploit free trial allocations is strictly prohibited.
• Respectful Community Behavior: Any abusive, harassing, or fraudulent behavior toward our support team or fellow candidates will result in immediate termination.`,
  },
  {
    id: 'intellectual_property',
    title: '5. Intellectual Property & Fair Use Acknowledgment',
    content: `All original platform content, software source code, user interface designs, audio recordings, graphic layouts, and mock test formulations belong exclusively to Gakkou No Shiken and are protected by applicable copyright and intellectual property laws.
    
Educational Fair Use Notice:
• JFT-Basic is a registered trademark of The Japan Foundation (国際交流基金) and Japan Educational Exchanges and Services (JEES).
• SSW (Specified Skilled Worker - 特定技能) examinations are administered under standards established by Japanese government ministries (MHLW, MOFA, MAFF, MLIT) via Prometric Inc.
• Gakkou No Shiken references public curriculum guidelines and CEFR A1/A2 frameworks solely for fair-use educational preparation. References to trademarks do not imply endorsement, sponsorship, or affiliation.`,
  },
  {
    id: 'scoring_disclaimer',
    title: '6. Simulated Scoring & No Guarantee of Official Results',
    content: `Our scaled score algorithms (10–250 for JFT-Basic and percentage metrics for SSW) are calibrated to simulate official Item Response Theory (IRT) scoring standards.
• Educational Diagnostic Only: Scores, pass/fail status, and diagnostic certificates generated on Gakkou No Shiken are practice tools and do not constitute an official Japanese government certificate.
• No Guarantee of Exam Pass: While our simulated mock tests significantly improve candidate familiarity and time management, performance on Gakkou No Shiken does not guarantee identical results on the official Prometric examination day.
• No Visa or Employment Guarantee: Gakkou No Shiken does not issue visas, Certificates of Eligibility (COE), or employment contracts in Japan.`,
  },
  {
    id: 'third_party',
    title: '7. Third-Party Links & Prometric Guidelines',
    content: `Our website contains external links to official Japanese government portals, Prometric registration pages, and social media channels.
• These external websites are operated by independent third parties.
• We do not control, endorse, or accept responsibility for third-party websites, their registration policies, or test scheduling voucher availability.
• Candidates are responsible for verifying official test dates, ID requirements, and venue rules on official government/Prometric portals.`,
  },
  {
    id: 'warranty',
    title: '8. Disclaimer of Warranties',
    content: `Gakkou No Shiken is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular study purpose, or uninterrupted, error-free operation. We make reasonable efforts to maintain uninterrupted service, but scheduled maintenance, network latency, or unexpected server downtime may occur.`,
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: `To the fullest extent permitted by applicable law, Gakkou No Shiken, its founders, educators, and technical operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from:
• The use or inability to use our mock examination platform.
• Discrepancies between practice mock scores and official examination scores.
• Changes in official exam schedules, venue availability, or Prometric test voucher prices.
• Unauthorized access to or alteration of your candidate submissions.`,
  },
  {
    id: 'governing_law',
    title: '10. Modifications, Governing Law & Contact Information',
    content: `We reserve the right to revise or replace these Terms at any time. Changes will be posted to this page with an updated revision date. Your continued use of the platform following the posting of any changes constitutes acceptance of those revisions.
    
If you have questions regarding these Terms of Service, please contact our administrative desk:
• Email: support@gakkounoshiken.site
• Organization: Gakkou No Shiken (学校の試験)
• Support Portal: https://www.gakkounoshiken.site/contact`,
  },
];

export default function TermsPage() {
  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in pb-16 font-sans">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c1222] border border-slate-800/80 p-6 sm:p-12 lg:p-14 shadow-2xl text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-japan-red/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-black uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-japan-red" />
            <span>Legal Agreement &amp; Platform Guidelines</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Terms of Service
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
            Last Updated: September 2026 • Please read these terms carefully before utilizing our Japanese CBT examination simulators, candidate tools, and study materials.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of Contents Sticky Sidebar */}
        <aside className="lg:col-span-4 sticky top-20 hidden lg:block bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-japan-red" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Sections
            </span>
          </div>
          <nav className="space-y-1.5 text-xs">
            {TERMS_SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block py-1.5 px-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-japan-red dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all leading-snug"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content Body */}
        <main className="lg:col-span-8 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl space-y-8">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              These Terms of Service govern your relationship with <strong>Gakkou No Shiken (学校の試験)</strong>. By accessing our mock tests, you acknowledge that you have read, understood, and agree to these terms.
            </p>
          </div>

          <div className="space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
            {TERMS_SECTIONS.map((sec) => (
              <section key={sec.id} id={sec.id} className="pt-8 first:pt-0 space-y-3 scroll-mt-24">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {sec.title}
                </h3>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line space-y-2">
                  {sec.content}
                </div>
              </section>
            ))}
          </div>

          {/* Bottom Assistance Callout */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Questions or Feedback on these Terms?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reach out to our administrative support desk anytime.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-japan-red hover:bg-japan-redhover text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>Contact Support</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
