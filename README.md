# Gakkou No Shiken (学校の試験) — Japanese CBT Mock Exam Simulator

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Django 5](https://img.shields.io/badge/Django-5.x-green?style=flat&logo=django)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Production Live](https://img.shields.io/badge/Production-Live-emerald)](https://www.gakkounoshiken.site)

**Production Website:** [https://www.gakkounoshiken.site](https://www.gakkounoshiken.site)  
**Backend API & Admin:** [https://gakkounoshiken.site/admin/](https://gakkounoshiken.site/admin/)

---

> ### ⚠️ Institutional Non-Affiliation Notice
> **Gakkou No Shiken (学校の試験)** is an independent educational training platform developed by Bangladeshi Japanese-language educators. We are **not affiliated with, sponsored by, authorized by, or endorsed by** The Japan Foundation (独立行政法人国際交流基金), Prometric Inc., the Japan Association for Construction Human Resources (JAC / 一般社団法人 建設技能人材機構), OTIT, JITCO, or any agency of the Government of Japan. All mock examinations, scoring models, and study guides are developed independently for self-study and candidate diagnostic evaluation.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Repository Structure](#repository-structure)
- [Frontend Setup (Next.js)](#frontend-setup-nextjs)
- [Backend Setup (Django REST Framework)](#backend-setup-django-rest-framework)
- [Educational Fair Use & Attributions](#educational-fair-use--attributions)
- [Deployment](#deployment)

---

## Overview

**Gakkou No Shiken** is Bangladesh's #1 Computer-Based Testing (CBT) mock exam platform for candidates preparing for the **Japan Foundation Test for Basic Japanese (JFT-Basic)** and the **Specified Skilled Worker (SSW - 特定技能1号)** skill evaluation examinations.

The platform provides a high-fidelity simulation of the official Prometric testing environment:
- **Real-time 60-Minute Countdown Timers** across 4 locked testing sections.
- **Native Japanese Studio Audio** streaming with single-play test protocols.
- **Psychometric IRT Scaled Scoring** modeling the 250-point Prometric scale with a 200-point CEFR A2 passing threshold.
- **12 Comprehensive Editorial Guides** covering test registration at IDB Bhaban in Dhaka, scoring mechanics, sector syllabi (Nursing Care, Food Service, Agriculture), grammar particles, and study plans.
- **26 Construction Sector Study Guides** indexed under educational fair use with synchronized audio pronunciations.

---

## Architecture & Tech Stack

The platform is engineered as a decoupled modern web application:

```
┌────────────────────────────────────────────────────────┐
│               NEXT.JS 16 (FRONTEND)                    │
│   • App Router (React 19, Turbopack)                   │
│   • Server-Side Rendering (SSR) & Static Generation    │
│   • Tailwind CSS, Lucide Icons, Leaflet Maps           │
│   • Deployed on Vercel Edge Network                    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / JWT)
┌───────────────────────────▼────────────────────────────┐
│         DJANGO REST FRAMEWORK (BACKEND)                │
│   • Python 3.10+, Django 5.x REST Framework            │
│   • SQLite / PostgreSQL Database                       │
│   • Jazzmin Admin Portal for Test Management           │
│   • Media Delivery: Native MP3 Audio & Question Assets │
│   • Deployed on cPanel Linux VPS / Gunicorn            │
└────────────────────────────────────────────────────────┘
```

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.2** | App Router (`src/app/`), React 19, Server Components |
| **Styling & UI** | **Tailwind CSS** | Dark/Light themes, Glassmorphism, Responsive Mobile Layout |
| **Backend Framework** | **Django 5.x + DRF** | RESTful endpoints, JWT & Session Authentication |
| **Admin Panel** | **Django Jazzmin** | Staff dashboard for uploading questions, audio, and exams |
| **Database** | **SQLite (cPanel) / PostgreSQL** | Candidate attempts, test questions, book metadata |
| **Frontend Hosting** | **Vercel** | Global edge network (`www.gakkounoshiken.site`) |
| **Backend Hosting** | **cPanel / Linux VPS** | REST API at `gakkounoshiken.site/api/` |

---

## Key Features

1. **Prometric CBT Replica Simulator:** Authentic locked-section navigation, audio prompts played once, and on-screen timers.
2. **Instant Preliminary Scoring:** Evaluates candidate responses against scaled psychometrics upon exam completion.
3. **National Candidate Leaderboard:** Public performance ranking celebrating top scorers in Bangladesh.
4. **Interactive Learning Hub:** Kanji Hunter, Vocab Snake, and Particle Quiz tools for gamified retention.
5. **JAC Curriculum Textbook Reader:** 26 official construction sector textbooks with synchronized neural audio.
6. **Authoritative Guide Knowledge Base:** 12 in-depth guides covering Prometric registration in Dhaka, scoring, and SSW sectors.

---

## Repository Structure

```
Japan_skill_test/
├── Gakkou_no_shiken_frontend/     # Next.js 16 App Router application
│   ├── src/app/                   # 51+ static and server-rendered routes
│   │   ├── guides/                # 12 in-depth examination study guides
│   │   ├── books/                 # Textbook catalog & interactive reader
│   │   ├── test/[id]/             # Full-screen Prometric CBT exam engine
│   │   ├── tools/                 # Interactive flashcards & particle quizzes
│   │   └── ...                    # Policy, leaderboard, about, contact pages
│   ├── src/components/            # Reusable React UI & layout components
│   └── package.json
├── Gakkou_no_shiken_backend/      # Django REST Framework backend
│   ├── tests/                     # Test models, CBT serializer, viewsets
│   ├── books/                     # Book chapters, topics, audio models
│   ├── accounts/                  # Candidate profiles and authentication
│   └── manage.py
├── ADSENSE_AGENT_PLAYBOOK.md      # Master AdSense & AI agent compliance guide
├── ADSENSE_COMPLIANCE_AND_AUDIT_FIXES.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- Python 3.10+
- Git

### 1. Frontend Setup
```bash
cd Gakkou_no_shiken_frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Setup
```bash
cd Gakkou_no_shiken_backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```
Backend API will be accessible at [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/).

---

## Educational Fair Use & Attributions

- **JAC Textbooks:** Training manuals referenced are original works published by the **Japan Association for Construction Human Resources (JAC / 一般社団法人 建設技能人材機構)** and the Ministry of Land, Infrastructure, Transport and Tourism (MLIT). Used under educational fair use for candidate preparation.
- **Irodori:** Coursebooks referenced are published under Creative Commons (CC BY-NC-ND) by **The Japan Foundation**.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
