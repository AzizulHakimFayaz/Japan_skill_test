import React from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  FileCheck2,
  HelpCircle,
  Layers,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Mastering Japanese Particles for JFT-Basic & SSW: WA vs GA, NI vs DE Guide (2026)',
  description:
    'Comprehensive Japanese particles cheat sheet for JFT-Basic and SSW CBT exams. Clear rules and sentence examples for WA vs GA, NI vs DE, WO, E, KARA, and MADE.',
  alternates: {
    canonical: 'https://www.gakkounoshiken.site/guides/essential-japanese-particles-guide-a2',
  },
};

export default function JapaneseParticlesGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the fundamental difference between WA (は) and GA (が)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WA (は) marks the overarching topic of the sentence ("as for X..."), highlighting what comes AFTER it. GA (が) marks the grammatical subject and highlights WHO or WHAT performs the action, answering "which one specifically?".',
        },
      },
      {
        '@type': 'Question',
        name: 'When do I use NI (に) versus DE (で) for locations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use NI (に) for destinations of movement (e.g. 学校に行きます) and points of static existence (e.g. 部屋にいます). Use DE (で) for the physical location where an active event or action takes place (e.g. 図書館で勉強します) or for means/methods (e.g. 電車で行きます).',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is WO (を) used with motion verbs like "walk" or "cross"?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Beyond marking direct grammatical objects, the particle WO (を) marks the physical route or space through which movement occurs (e.g. 道を渡る - crossing the street, 公園を散歩する - strolling through the park).',
        },
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Mastering Japanese Particles for JFT-Basic & SSW: WA vs GA, NI vs DE Guide',
    description:
      'Detailed study manual resolving the most difficult particle pairings in Japanese grammar for CEFR A2, JFT-Basic, and Specified Skilled Worker examinations.',
    author: {
      '@type': 'Organization',
      name: 'Gakkou No Shiken Academic Editorial Board',
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
    mainEntityOfPage: 'https://www.gakkounoshiken.site/guides/essential-japanese-particles-guide-a2',
    datePublished: '2026-03-05T00:00:00Z',
    dateModified: '2026-10-22T00:00:00Z',
  };

  return (
    <article className="max-w-5xl mx-auto space-y-10 py-6 sm:py-10 px-4 sm:px-6">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-japan-red transition-colors">Home</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-japan-red transition-colors">Guides</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">Japanese Particles Guide</span>
      </nav>

      {/* Hero Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-japan-red/10 border border-japan-red/20 text-japan-red dark:text-rose-400 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grammar Mastery Blueprint • A2 Level</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Mastering Japanese Particles for JFT-Basic &amp; SSW: WA vs GA, NI vs DE
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          In Section 2 (Conversation &amp; Expression) of the JFT-Basic Computer-Based Test, over 50% of grammatical deduction errors stem from confusing small particles (助詞 - Joshi). This guide demystifies the rules with practical sentence comparisons and exam pitfalls.
        </p>

        {/* Editorial Trust Byline */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Author: Gakkou No Shiken Academic Editorial Board</span>
          </div>
          <span>•</span>
          <span>CEFR A2 Grammar Syllabus Aligned</span>
          <span>•</span>
          <span>Last Updated: October 2026</span>
        </div>
      </header>

      {/* Battle 1: WA vs GA */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-japan-red font-black text-sm uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>Particle Battle #1</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          は (WA) versus が (GA): Topic vs. Subject
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          The single most famous grammatical challenge in the Japanese language. Both can translate to subject positions in English or Bengali, but perform distinct psychological functions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-japan-red">は (WA)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-japan-red dark:bg-rose-950/60 dark:text-rose-400 font-bold">Topic Marker</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Function:</strong> Sets the spotlight on the topic. Means: <em>&quot;As for X, let me tell you about it.&quot;</em> The important new information comes <strong>AFTER</strong> the は.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 font-mono">
              <p className="font-bold text-slate-900 dark:text-white">わたし<strong>は</strong> アリです。</p>
              <p className="text-slate-500 font-sans">As for me, I am Ali. (Ali is the key info).</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">が (GA)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold">Subject Identifier</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Function:</strong> Identifies specifically <strong>WHO</strong> or <strong>WHAT</strong> does the action. The emphasis is on the word <strong>BEFORE</strong> the が.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 font-mono">
              <p className="font-bold text-slate-900 dark:text-white">だれ<strong>が</strong> 来ましたか。アリさん<strong>が</strong> 来ました。</p>
              <p className="text-slate-500 font-sans">Who came? Ali [specifically] is the one who came.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Battle 2: NI vs DE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-japan-red font-black text-sm uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>Particle Battle #2</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          に (NI) versus で (DE): Destination &amp; Existence vs. Action Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-emerald-600">に (NI)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">Destination / Point</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Point in time:</strong> 7時<strong>に</strong> 起きます (I wake up at 7:00).</li>
              <li>• <strong>Destination of movement:</strong> 日本<strong>に</strong> 行きます (I go to Japan).</li>
              <li>• <strong>Static existence:</strong> 部屋<strong>に</strong> ねこが います (There is a cat in the room).</li>
              <li>• <strong>Contact target:</strong> 先生<strong>に</strong> 聞きます (Ask the teacher).</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">で (DE)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold">Action Location / Means</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>• <strong>Action location:</strong> レストラン<strong>で</strong> 食べます (Eat at the restaurant).</li>
              <li>• <strong>Means / Transport:</strong> 電車<strong>で</strong> 行きます (Go by train).</li>
              <li>• <strong>Tool / Language:</strong> 日本語<strong>で</strong> 話します (Speak in Japanese).</li>
              <li>• <strong>Material composition:</strong> 木<strong>で</strong> つくります (Made from wood).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Battle 3: Movement through Space with WO */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Special Usage: を (WO) for Movement through Space
        </h2>
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Most learners know that を marks a direct grammatical object (e.g., パン<strong>を</strong> 食べます - Eat bread). However, in JFT-Basic tests, を is frequently tested with <strong>verbs of passage and movement</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white font-mono">みち<strong>を</strong> わたる</p>
              <p className="text-xs text-slate-500">Cross the street</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white font-mono">こうえん<strong>を</strong> さんぽする</p>
              <p className="text-xs text-slate-500">Stroll through the park</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white font-mono">はし<strong>を</strong> わたる</p>
              <p className="text-xs text-slate-500">Cross the bridge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Reference Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          JFT-Basic Essential Particles Reference Matrix
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Particle</th>
                <th className="p-3.5">Primary Function</th>
                <th className="p-3.5">Exam Example Sentence</th>
                <th className="p-3.5">Translation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="p-3.5 font-bold text-japan-red">は (wa)</td>
                <td className="p-3.5 font-sans">Topic marker</td>
                <td className="p-3.5">これは ペンです。</td>
                <td className="p-3.5 font-sans">This is a pen.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-indigo-600">が (ga)</td>
                <td className="p-3.5 font-sans">Subject identifier, likes/dislikes</td>
                <td className="p-3.5">すしが すきです。</td>
                <td className="p-3.5 font-sans">I like sushi.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-emerald-600">に (ni)</td>
                <td className="p-3.5 font-sans">Specific time, destination</td>
                <td className="p-3.5">9時に かいぎが あります。</td>
                <td className="p-3.5 font-sans">There is a meeting at 9:00.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-amber-600">で (de)</td>
                <td className="p-3.5 font-sans">Action location, transport</td>
                <td className="p-3.5">バスで いきます。</td>
                <td className="p-3.5 font-sans">I will go by bus.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-rose-600">を (wo)</td>
                <td className="p-3.5 font-sans">Direct object, path traversed</td>
                <td className="p-3.5">みずを のみます。</td>
                <td className="p-3.5 font-sans">I drink water.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-teal-600">へ (e)</td>
                <td className="p-3.5 font-sans">Direction headed towards</td>
                <td className="p-3.5">北へ むかいます。</td>
                <td className="p-3.5 font-sans">Head towards the north.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-purple-600">から / まで</td>
                <td className="p-3.5 font-sans">From / Until (time &amp; space)</td>
                <td className="p-3.5">9時から 5時まで はたらきます。</td>
                <td className="p-3.5 font-sans">I work from 9:00 to 5:00.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-black">Test Your Particle Knowledge Instantly</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Practice with our interactive particle quiz tool featuring hundreds of real-time sentence completion drills.
          </p>
        </div>
        <Link
          href="/tools/particle-quiz"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-japan-red hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>Open Particle Quiz Tool</span>
        </Link>
      </section>
    </article>
  );
}
