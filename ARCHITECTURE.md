# System Architecture — Gakkou No Shiken

This document details the software architecture of **Gakkou No Shiken (学校の試験)**: the decoupled client-server model, Next.js 16 App Router frontend, Django REST Framework backend API, database schema, and deployment topology.

---

## 1. High-Level System Architecture

Gakkou No Shiken is structured as a **Decoupled Jamstack Web Application**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EDGE / CLIENT LAYER                             │
│                                                                        │
│   Next.js 16.3.2 (App Router, Turbopack, React 19)                     │
│   • Server-Side Rendered (SSR) Policy, Guide & Syllabus Pages         │
│   • Static Site Generation (SSG) for Textbook Catalogs & Landing Pages │
│   • Client-Side CBT Simulator (Prometric Timer, Audio & Answers)       │
│   • Tailwind CSS + Lucide Icons + Leaflet Maps                         │
│   • Hosted on Vercel Edge Network (https://www.gakkounoshiken.site)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON + JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & BACKEND LAYER                             │
│                                                                        │
│   Django 5.x REST Framework (Gunicorn / cPanel Linux VPS)              │
│   • Endpoints: /api/tests/, /api/books/, /api/accounts/, /api/notices/ │
│   • Jazzmin Admin Portal (/admin/) for Exam & Audio Management         │
│   • JWT & Session Token Authentication                                 │
│   • Automatic Psychometric IRT Scaled Scoring (10–250 pts)             │
│   • SQLite / PostgreSQL Database Engine                                │
│   • Static/Media Storage: Local / Cloudflare R2 / AWS S3               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Next.js 16 App Router)

### Key Architectural Pillars:
1. **Server Components by Default:**
   - Critical SEO and policy pages (`/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/tools`, and all 12 `/guides/*`) are 100% Server Components without `'use client'`.
   - Crawlers (Googlebot, Mediapartners-Google) receive complete static semantic HTML containing rich editorial prose.
2. **Interactive Client Islands:**
   - Components requiring browser interactivity (audio players, particle quizzes, the full-screen Prometric CBT engine `/test/[id]`) are isolated into dedicated client components (`PracticeTestGrid.js`, `StudentExamGuide.js`, `InteractiveFeatureShowcase.js`).
3. **Structured Data (Schema.org):**
   - Injected dynamically in `<head>` via `next/script` or JSON-LD tags:
     - `WebSite` & `EducationalOrganization` in `src/app/layout.js`.
     - `WebApplication` & `FAQPage` in `src/app/page.js`.
     - `Article` & `FAQPage` across all 12 `/guides/*` pages.
4. **Permanent 301 Redirects:**
   - Managed in `next.config.mjs` to eliminate duplicate content (`/privacy-policy` $\rightarrow$ `/privacy`, `/terms-of-service` $\rightarrow$ `/terms`).

---

## 3. Backend Architecture (Django REST Framework)

### Core Django Apps:
1. **`tests`:**
   - `Test` model: Contains exam titles, category (`basic` vs `skill`), sector code, duration in minutes, passing percentage, and active flags.
   - `Question` model: Questions grouped by test and section (Script & Vocab, Conversation, Listening, Reading). Supports text, illustration image, and audio file URL.
   - `Option` model: 4 choices per question with correct answer boolean.
   - `Attempt` & `UserAnswer` models: Records candidate selections, scores, and timestamped submissions.
2. **`books`:**
   - `Book` model: Metadata for 26 construction sector textbooks, page counts, language codes, and PDF URLs.
   - `BookTopic` model: Page-level topics with Japanese script and synchronized neural audio pronunciations.
   - `BookQuestion` model: Practice Q&As aligned to specific textbook pages.
3. **`accounts`:**
   - Candidate authentication, profiles, national leaderboard points, and exam histories.

---

## 4. Security & Compliance Design

- **AdSense Verification:** `<meta name="google-adsense-account" content="ca-pub-8435487820435842" />` active in `layout.js` `<head>`.
- **Zero Premature Ad Slots:** All `<AdBanner />` slots return `null` until site receives formal AdSense approval.
- **No Unsolicited Popups:** No `window.open` calls on test buttons.
- **Non-Affiliation Transparency:** Prominent legal disclosures affirming independent educational status relative to The Japan Foundation, Prometric Inc., and JAC.
