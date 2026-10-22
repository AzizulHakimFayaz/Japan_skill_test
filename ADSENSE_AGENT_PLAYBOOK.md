# 🤖 AI Agent Hand-Off Guide: Google AdSense Status, Site Condition & Decision Playbook

> **TARGET AUDIENCE:** Any AI Agent (Antigravity, Claude, ChatGPT, Cursor, GitHub Copilot) or human software engineer working on this repository.  
> **PRIMARY REPO:** `AzizulHakimFayaz/Japan_skill_test`  
> **LIVE DOMAIN:** [https://www.gakkounoshiken.site](https://www.gakkounoshiken.site)  
> **LAST AUDITED & UPDATED:** October 2026  
> **BRANCH:** `main` (verified clean, zero build errors)

---

## 1. Quick Executive Summary (Read This First!)

If the user asks: *"What is going on with Google AdSense?"* or *"Can we enable ads now?"* or *"Why was the site rejected?"*, here is the ground truth:

1. **Current State:** The site is in **Pre-Approval / Clean-Slate Mode**.
2. **Current Ad Policy Status:** All premature ad units, ad script tags, countdown video interstitials, and surprise Facebook popups have been **completely purged/deactivated**.
3. **Active Verification Tag:** Google AdSense domain ownership verification is active via:
   ```html
   <meta name="google-adsense-account" content="ca-pub-8435487820435842" />
   ```
   located in `Gakkou_no_shiken_frontend/src/app/layout.js`.
4. **GOLDEN DIRECTIVE FOR AGENTS:**
   > ⛔ **DO NOT RE-ENABLE `adsbygoogle.js`, `<AdBanner />`, OR ANY AD UNITS UNTIL THE USER EXPLICITLY CONFIRMS THAT GOOGLE ADSENSE HAS EMAILED APPROVAL FOR `gakkounoshiken.site`.**  
   > Premature ad requests from unapproved domains trigger instant crawler penalties for "Broken Ad Units" and "Low Value Content".

---

## 2. Website Architecture & Overview

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.2 (Turbopack)** | App Router (`src/app/`), React 19, Tailwind CSS |
| **Backend Framework** | **Django REST Framework** | Python 3.10+, SQLite database, JWT Authentication |
| **Production Domain** | `https://www.gakkounoshiken.site` | Vercel (Frontend) / cPanel VPS (Backend API & Media) |
| **Backend API Host** | `https://gakkounoshiken.site/api/` | Secure REST API endpoints for tests, results, notices |
| **Admin Panel** | `https://gakkounoshiken.site/admin/` | Staff portal for uploading CBT tests and audio |
| **Primary Mission** | **Educational / CBT Exam Simulator** | Authentic Prometric CBT test simulator for Bangladeshi candidates preparing for JFT-Basic (A2) and SSW (Specified Skilled Worker) exams in Japan |

### Route Breakdown (51 Production Routes)
- **High-Value Exam Simulators:** `/test/[id]`, `/ssw-test/[id]`, `/tests`, `/jft-basic`, `/ssw-skill-test`
- **Curriculum & Study Guides (SSR):** `/guides/jft-basic-exam-guide`, `/guides/ssw-skill-test-guide`, `/guides/jac-textbooks-guide`
- **Textbook Library:** `/books`, `/books/[id]` (26 official Japanese textbooks with PDF readers)
- **Interactive Tools (SSR + Client Widgets):** `/tools`, `/tools/flashcards`, `/tools/particle-quiz`, `/tools/salary-calculator`, `/game-zone`
- **Mandatory Policy & Compliance Pages (100% Server Rendered):**
  - `/about`
  - `/contact`
  - `/privacy` (with 301 redirect from `/privacy-policy`)
  - `/terms` (with 301 redirect from `/terms-of-service`)
  - `/disclaimer`
  - `/how-it-works`
- **SEO & Crawlers:** `/robots.txt` (explicitly permits `Mediapartners-Google`), `/sitemap.xml` (dynamic, 51+ routes)

---

## 3. The Complete Backstory: Why AdSense Rejected the Site

In October 2026, Google AdSense rejected the site with the generic notification: **"Low Value Content"**.

### Root Cause Analysis (The 6 Fatal Triggers Identified)

| # | Fatal Flaw | Exact Code / Location | Why Google Rejected It | Status |
|---|---|---|---|---|
| 1 | **Fabricated Schema Ratings** | `src/app/page.js`<br>`AggregateRating: 4.9 (1240 reviews)` | Platform had ~460 users. Fabricating 1,240 reviews in Schema.org JSON-LD is an explicit violation of Google Webmaster Guidelines on deceptive rich snippets. | **PURGED** |
| 2 | **Premature Ad Density & Blank Slots** | Over 30 `<AdBanner />` units across 11 pages | When unapproved sites render ad units, the script fails (HTTP 400/403). Google crawler sees a page covered in empty boxes and flags it as a "Made-For-Ads" (MFA) site with broken ad units. | **DEACTIVATED** |
| 3 | **Surprise Facebook Popups** | `PracticeTestGrid.js` & `tests/page.js`<br>`window.open('https://facebook.com/...')` on clicking "Start Exam" | Tricking users into opening a social media page when clicking an exam button violates Google Navigation Policies and Search Spam guidelines. | **PURGED** |
| 4 | **Pre-Exam Interstitial Video Ad Modal** | `src/components/ExamVideoAdModal.js`<br>10-second countdown before exam access | Forcing users to watch a dummy interstitial or countdown timer before accessing free educational tests triggers Google's abusive interstitial policy. | **PURGED** |
| 5 | **Duplicate Policy URLs** | `/privacy-policy` vs `/privacy`<br>`/terms-of-service` vs `/terms` | Both routes existed simultaneously with identical content, triggering search engine duplicate content penalties. | **RESOLVED** (301 Redirects in `next.config.mjs`) |
| 6 | **Client-Side Rendered (CSR) Policy Pages** | `'use client'` on `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer` | Policy pages were CSR. Crawlers that don't execute full JavaScript saw blank shells and deemed the site lacking mandatory privacy and transparency policies. | **CONVERTED** to Server Components |

---

## 4. Current Codebase Configuration (How It Is Set Up Right Now)

### A. AdSense Components (`src/components/`)
1. **`GoogleAdsense.js`**:
   ```javascript
   // Returns null during pre-approval review
   export default function GoogleAdsense() {
     return null;
   }
   ```
2. **`AdBanner.js`**:
   ```javascript
   // Returns null during pre-approval review
   export default function AdBanner() {
     return null;
   }
   ```
3. **`ExamVideoAdModal.js`**:
   ```javascript
   // Returns null; completely removed from all caller components
   export default function ExamVideoAdModal() {
     return null;
   }
   ```

### B. Ownership Verification Meta Tag (`src/app/layout.js`)
Inside `<head>`:
```jsx
{/* Google AdSense Account Verification Meta Tag */}
<meta name="google-adsense-account" content="ca-pub-8435487820435842" />
```
*(DO NOT remove or comment out this meta tag. It is the sole mechanism Google uses to verify domain ownership while ads are disabled).*

### C. Crawlers & Robots (`src/app/robots.js`)
```javascript
{
  userAgent: 'Mediapartners-Google',
  allow: '/',
  disallow: ['/admin/', '/api/'],
}
```
Google AdSense's ad crawler (`Mediapartners-Google`) has unrestricted access to all educational content, guides, textbooks, and practice tests.

---

## 5. Decision Tree for Future AI Agents: "What Should I Do?"

When you are asked to work on Google AdSense or site monetization, follow this exact flowchart:

```
                          USER ASKS ABOUT ADSENSE
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       "Has Google approved                    "Site is still in review
       the site yet?"                           or was rejected"
                 │                                       │
        ┌────────┴────────┐                              │
       YES                NO                             ▼
        │                  │                    Go to SECTION 5.1
        ▼                  ▼                   (Rejection Playbook)
Go to SECTION 5.2    KEEP ADS DISABLED!
(Rollout Playbook)   Maintain clean state
```

---

### 5.1. IF THE SITE IS REJECTED AGAIN (Troubleshooting Playbook)

If Google responds with another rejection, check the exact rejection reason in the AdSense console and apply the corresponding fix:

#### Case A: "Low Value Content" (Still)
- **Do NOT re-add ads.**
- **Action:** Expand organic educational text.
  1. Add 2 to 3 new long-form guides in `src/app/guides/` (e.g., *"How to Register for Prometric in Dhaka"*, *"JFT-Basic Section-by-Section Scoring Breakdown"*, *"Top 100 SSW Nursing Vocabulary"*).
  2. Ensure each new article is at least **1,200 words**, has an author byline (`Gakkou No Shiken Academic Editorial Board`), and includes structured `Article` Schema.org JSON-LD.
  3. Increase test coverage: Add 2 new mock exams in the backend admin panel so candidates have more original practice material.

#### Case B: "Site Under Construction" or "Site Down or Unavailable"
- **Action:** Verify DNS & crawler accessibility.
  1. Test `https://www.gakkounoshiken.site` from an external network or incognito window.
  2. Verify that Vercel is not blocking requests with bot mitigation or challenge screens.
  3. Verify `https://www.gakkounoshiken.site/robots.txt` and `https://www.gakkounoshiken.site/sitemap.xml` return HTTP 200.

#### Case C: "Policy Violation / Deceptive Navigation"
- **Action:** Check for any rogue links or external redirects.
  1. Run a grep search for `window.open` across `src/`:
     ```bash
     grep -rn "window.open" src/
     ```
  2. Confirm that only legitimate document downloads (PDF notices) use `window.open`.
  3. Ensure no buttons say one thing (e.g. "Download Book") and do something else.

---

### 5.2. IF GOOGLE HAS OFFICIALLY APPROVED THE SITE (Ad Rollout Playbook)

> ⚠️ **CRITICAL REQUIREMENT:** Only execute these steps **after** the user explicitly confirms approval in Google AdSense!

#### Step 1: Re-enable the Global AdSense Script
Open `Gakkou_no_shiken_frontend/src/components/GoogleAdsense.js` and replace it with:
```javascript
import Script from 'next/script';

export default function GoogleAdsense() {
  const pId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-8435487820435842';
  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
```

#### Step 2: Use "Auto Ads" First! (Highest Revenue, Lowest Risk)
1. In Google AdSense Dashboard: Go to **Ads** $\rightarrow$ **By Site** $\rightarrow$ Click **Edit** next to `gakkounoshiken.site`.
2. Toggle **Auto Ads** to **ON**.
3. Under **Excluded Pages**, add:
   - `/test/*` (Do NOT show auto ads inside active mock exam simulators!)
   - `/ssw-test/*` (Prevents candidate distraction during timed CBT tests)
   - `/attempt/*` (Scorecard report screens)
4. Let Google's AI place ads automatically in high-performing content areas.

#### Step 3: (Optional) Re-enabling Manual Banner Slots
If the user specifically wants manual banner placements, restore `AdBanner.js` using real ad slot IDs from the Google AdSense dashboard:
- **Maximum 1 ad** on mobile viewports per screen fold.
- **Maximum 2 ads** on long guide articles (`/guides/*`).
- **NEVER** place ads directly above or below primary action buttons ("Start Exam", "Submit Answers", "Next Question").
- **NEVER** place ads inside the exam iframe/test container (`/test/[id]`).

---

## 6. Strict "NEVER DO" Rules for Any Agent Working on This Repo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            STRICT POLICY GUARDRAILS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. NEVER add fake or hardcoded reviews/ratings to Schema.org JSON-LD.       │
│ 2. NEVER add window.open popups or unexpected new-window triggers.          │
│ 3. NEVER create interstitial countdown timers before exam access.           │
│ 4. NEVER add 'use client' to policy pages (/about, /privacy, /terms, etc.). │
│ 5. NEVER put ad units inside the timed CBT exam simulator (/test/[id]).     │
│ 6. NEVER comma-stuff keyword meta tags in layout.js or page heads.          │
│ 7. NEVER delete the AdSense meta tag from src/app/layout.js.               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Fast Verification Commands

Run these commands in PowerShell or Bash from `Gakkou_no_shiken_frontend/` to verify compliance at any time:

```bash
# 1. Verify build passes with zero static or SSR errors
npm run build

# 2. Verify NO active adsbygoogle units exist in JSX
grep -rn "adsbygoogle" src/

# 3. Verify NO fake aggregateRating exists in schemas
grep -rn "aggregateRating" src/

# 4. Verify NO surprise popups exist
grep -rn "window.open" src/

# 5. Check git status
git status
```

---

## 8. Summary Table of Files Modified in the Compliance Cleanup

| File Path | Description of Changes |
|---|---|
| `src/app/layout.js` | Added verified `<meta name="google-adsense-account">`, cleaned keywords, retained valid Organization JSON-LD |
| `src/app/page.js` | Removed fake `AggregateRating` (4.9 / 1240 reviews) from WebApplication JSON-LD |
| `src/components/GoogleAdsense.js` | Deactivated (returns `null`) to prevent unapproved crawler errors |
| `src/components/AdBanner.js` | Deactivated (returns `null`), removing all unapproved partner banners |
| `src/components/ExamVideoAdModal.js` | Deactivated (returns `null`), eliminating pre-exam 10s interstitial barriers |
| `src/components/PracticeTestGrid.js` | Removed surprise Facebook popup and cleaned all interstitial modal imports/states |
| `src/app/tests/page.js` | Removed surprise Facebook popup on "Start Exam" link |
| `src/components/LeadCaptureModal.js` | Converted to transparent community links modal; removed simulated dummy input processing |
| `next.config.mjs` | Added 301 permanent redirects for `/privacy-policy` and `/terms-of-service` |
| `src/app/privacy-policy/` | Deleted duplicate folder |
| `src/app/terms-of-service/` | Deleted duplicate folder |
| `src/app/privacy/page.js` | Converted to Server Component; added canonical URL |
| `src/app/terms/page.js` | Converted to Server Component; added canonical URL |
| `src/app/disclaimer/page.js` | Converted to Server Component; added canonical URL |
| `src/app/about/page.js` | Converted to Server Component; extracted `AboutShowcaseTabs.js` client component |
| `src/app/contact/page.js` | Converted to Server Component; extracted `ContactForm.js` client component |
| `src/app/tools/page.js` | Converted to Server Component; added 500+ words of pedagogical text |
| `src/app/books/page.js` | Added 400+ words of curriculum overview prose |
| `src/app/lessons/page.js` | Added 400+ words of structured CEFR progression prose |
| `src/app/game-zone/page.js` | Added 350+ words of cognitive gamification pedagogy prose |
| `src/app/leaderboard/page.js` | Added 350+ words of psychometric scoring context prose |
| `src/app/guides/*/page.js` | Added editorial author bylines, peer-review badges, and "Last Updated" timestamps |
