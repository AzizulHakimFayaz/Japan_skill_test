import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Laptop,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Languages,
  Headphones,
  HardHat,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export const metadata = {
  title: 'JAC Official Japanese Textbooks & Multilingual Audio Guide | Gakkou No Shiken',
  description:
    'Complete guide to all 26 official JAC textbooks for Japan Specified Skilled Worker examinations. Features textbook catalog, trade breakdowns, and neural audio study guides.',
  keywords: [
    'JAC textbook guide',
    'JAC official books Japan',
    'SSW construction textbook',
    'Japanese skill test audio book',
    'JAC textbook Bengali audio',
    'JAC textbook Indonesian audio',
  ],
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/jac-textbooks-guide',
  },
};

export default function JacTextbooksGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'JAC Official Japanese Textbooks & Multilingual Audio Learning Guide',
    description:
      'Explore all 26 official Japan Construction & Culture (JAC) textbooks with neural audio synthesis in Bengali, Indonesian, English, and Japanese.',
    author: {
      '@type': 'Organization',
      name: 'Gakkou No Shiken',
      url: 'https://www.gakkounoshiken.site',
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Gakkou No Shiken (学校の試験)',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.gakkounoshiken.site/img/logo.png',
      },
    },
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/jac-textbooks-guide',
    datePublished: '2026-02-01T00:00:00Z',
    dateModified: '2026-10-12T00:00:00Z',
  };

  return (
    <article className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-japan-red transition-colors">Home</Link>
        <span>/</span>
        <Link href="/books" className="hover:text-japan-red transition-colors">Textbooks</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">JAC Curriculum Guide</span>
      </nav>

      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Official 26 JAC Curriculum Reference</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Official JAC Examination Textbooks & Multilingual Audio Guide
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          The Japan Association for Construction Human Resources (JAC) publishes official textbooks covering occupational terminology, technical diagrams, safety regulations, and practice questions. Gakkou No Shiken hosts all <strong>26 official volumes</strong> with an integrated cloud reader and <strong>multilingual neural voice synthesis</strong>.
        </p>
      </header>

      {/* Ad Placement 1 */}
      <AdBanner slot="8435487820" format="auto" />

      {/* Section 1: Multilingual Neural Audio Feature */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Headphones className="w-6 h-6 text-japan-red" />
          <span>1. Multilingual Audio Learning Technology</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Candidates often struggle when technical manuals are written solely in Japanese Kanji and technical jargon. Our interactive textbook reader bridges this gap by automatically adapting audio synthesis to your native language:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-2xl">🇧🇩</span>
            <div className="text-sm font-black text-slate-900 dark:text-white">Bengali (বাংলা)</div>
            <p className="text-[11px] text-slate-500">Native audio reading for Bengali textbooks with correct local pronunciation.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-2xl">🇮🇩</span>
            <div className="text-sm font-black text-slate-900 dark:text-white">Indonesian (Bahasa)</div>
            <p className="text-[11px] text-slate-500">Natural voice synthesis for Bahasa Indonesia edition manuals.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-2xl">🇺🇸</span>
            <div className="text-sm font-black text-slate-900 dark:text-white">English</div>
            <p className="text-[11px] text-slate-500">Clear English narration for all general theory and terminology.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-2xl">🇯🇵</span>
            <div className="text-sm font-black text-slate-900 dark:text-white">Japanese (日本語)</div>
            <p className="text-[11px] text-slate-500">Authentic native Tokyo accent pronunciation for technical vocabulary.</p>
          </div>
        </div>
      </section>

      {/* Ad Placement 2 */}
      <AdBanner slot="8435487820" format="auto" />

      {/* Section 2: Catalog of Covered Construction Trades */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <HardHat className="w-6 h-6 text-japan-red" />
          <span>2. Full Catalog of 26 JAC Trade Curricula</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The 26 textbooks on our platform contain complete, high-resolution original pages with exact page counts matching official Tokyo publications:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
          <li><strong>Textbook 1:</strong> Formwork Construction (型枠施工 - 152 pages)</li>
          <li><strong>Textbook 2:</strong> Reinforcing Bar Construction (鉄筋施工 - 150 pages)</li>
          <li><strong>Textbook 3:</strong> Scaffolding & Rigging (とび・足場 - 147 pages)</li>
          <li><strong>Textbook 4:</strong> Concrete Pumping (コンクリート圧送 - 120 pages)</li>
          <li><strong>Textbook 5:</strong> Plastering & Masonry (左官 - 135 pages)</li>
          <li><strong>Textbook 6:</strong> Interior Finishing (内装仕上げ施工 - 140 pages)</li>
          <li><strong>Textbook 7:</strong> Painting & Surface Coating (塗装 - 128 pages)</li>
          <li><strong>Textbook 8:</strong> Roof Work & Sheet Metal (屋根・板金 - 132 pages)</li>
          <li><strong>Textbook 9:</strong> Piping & Plumbing Work (配管 - 125 pages)</li>
          <li><strong>Textbook 10:</strong> Civil Earthwork & Foundation (土工・基礎 - 145 pages)</li>
          <li><strong>Textbooks 11–26:</strong> Specialized safety, machinery maintenance, and Japanese-Bengali bilingual editions.</li>
        </ul>
      </section>

      {/* Section 3: Call to Action */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-japan-red" />
          <span>3. Start Reading Today</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Access the complete textbook collection directly in your web browser. No software installation required:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/books"
            className="flex-1 p-5 rounded-2xl bg-japan-red hover:bg-japan-redhover text-white transition-all shadow-md flex items-center justify-between font-black"
          >
            <span>Open All 26 Textbooks in Interactive Reader</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-japan-red transition-all shadow-sm flex items-center justify-between font-black text-slate-900 dark:text-white"
          >
            <span>Return to Mock Exam Simulator</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Ad Placement 3 */}
      <AdBanner slot="8435487820" format="auto" />
    </article>
  );
}
