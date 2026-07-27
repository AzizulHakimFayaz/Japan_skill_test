# JFT-Basic Practice Portal

A Django-based web application that provides practice exams for the **Japan Foundation Test for Basic Japanese (JFT-Basic)**. The portal supports both free open tests and account-required tests, with text, image, and audio question types, automatic scoring, and progress tracking.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database & Seeding](#database--seeding)
- [Running Tests](#running-tests)
- [Deployment Notes](#deployment-notes)
- [Further Documentation](#further-documentation)

---

## Overview

The JFT-Basic Practice Portal helps students preparing for the JFT-Basic exam (commonly used for Japan's Specified Skilled Worker — SSW — visa pathway) take realistic practice tests.

Two test categories are supported:

- **Free & Open** — accessible to anyone, no account required.
- **Account Required** — restricted to authenticated users; useful for paid/premium content.

Each test can mix three question types — **Text**, **Image**, and **Audio** — and is scored automatically against the official JFT-Basic passing threshold of **80%**.

---

## Features

- **Quiz Engine** — One-question-per-screen interface with progress bar, quick navigation grid, and optional countdown timer.
- **Multiple Question Types** — Text, Image, and Audio questions all rendered with the same engine.
- **Automatic Scoring** — Server-side validation of answers and immediate result calculation.
- **Pass / Fail Indicator** — Visual circular progress meter plus pass/fail badge based on the 80% threshold.
- **Detailed Review** — Per-question breakdown showing the correct answer and the user's selection.
- **Personal Dashboard** — Authenticated users see a dashboard of all their attempts with averages and pass-rate stats.
- **Auth** — Sign up / sign in / sign out flows, with the convenience of signing in via username **or** email.
- **Admin Panel** — A polished [Jazzmin](https://django-jazzmin.readthedocs.io/)-themed admin for managing tests, questions, options, and attempts.
- **Media Handling** — Local file system in development; automatic S3-compatible storage (e.g. Cloudflare R2, AWS S3) in production via `django-storages`.
- **Static Asset Optimization** — `whitenoise` serves compressed static files in production.

---

## Tech Stack

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Language         | Python 3.11+                                            |
| Framework        | Django 5.x                                              |
| Database         | SQLite (default) — switchable to PostgreSQL via `DATABASE_URL` |
| Auth             | Django built-in `User` model                            |
| Admin Skin       | `django-jazzmin`                                        |
| Media Storage    | `django-storages[s3]` + `boto3` (optional, S3-compatible) |
| Static Files     | `whitenoise`                                            |
| Image Processing | `Pillow`                                                |
| Frontend         | Server-rendered Django templates, Tailwind CSS (CDN), Alpine.js (CDN) |
| Configuration    | `django-environ`                                        |

---

## Project Structure

```
.
├── manage.py
├── requirements.txt
├── seed_db.py                  # One-off script that loads sample tests/questions
├── .env                        # Local secrets & config (not committed in production)
├── db.sqlite3                  # SQLite database (dev default)
├── config/                     # Django project (settings, root URLs, ASGI/WSGI)
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── accounts/                   # Auth app
│   ├── views.py                # signup / login (username or email) / logout / my_results
│   ├── urls.py
│   ├── admin.py
│   └── templates/accounts/
│       ├── login.html
│       ├── signup.html
│       └── my_results.html
├── tests/                      # Quiz app (named "tests" — Django convention clash with test runner)
│   ├── models.py               # Test, Question, AnswerOption, Attempt
│   ├── views.py                # landing / quiz / submit / results
│   ├── admin.py                # Rich inlines + media previews
│   ├── tests.py                # Unit tests for views & permissions
│   ├── migrations/
│   └── templates/tests/
│       ├── landing.html
│       ├── quiz.html
│       └── results.html
├── templates/
│   └── base.html               # Site-wide layout (nav, alerts, footer)
├── static/                     # Source static assets (collected into staticfiles/)
└── staticfiles/                # Collected static files (generated)
```

> **Naming note:** the app folder is called `tests`, which shadows the Django test-runner module name. The unit tests live in `tests/tests.py` and are run via the standard `manage.py test tests` command.

---

## Getting Started

### Prerequisites

- Python 3.11 or newer
- `pip` (or `uv` / `poetry` if preferred)
- A virtual environment tool (`venv` is recommended)

### 1. Clone and enter the project

```bash
git clone <your-fork-url> Japan_skill_test
cd Japan_skill_test
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

A starter `.env` is provided. The defaults work for local development; review and adjust before deploying.

```ini
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=127.0.0.1,localhost
```

See [Environment Variables](#environment-variables) for the full list.

### 5. Apply migrations

```bash
python manage.py migrate
```

### 6. Create a superuser

```bash
python manage.py createsuperuser
```

### 7. (Optional) Load sample data

```bash
python seed_db.py
```

This creates two demo tests: a free 3-question text/image mock exam and an account-required 2-question text/audio exam.

### 8. Run the development server

```bash
python manage.py runserver
```

Visit:

- **Portal:** http://127.0.0.1:8000/
- **Admin:** http://127.0.0.1:8000/admin/

---

## Environment Variables

Defined in `.env` and read by `config/settings.py` via `django-environ`.

| Variable                  | Default                                                | Purpose                                                                |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `DEBUG`                   | `True`                                                 | Toggles Django debug mode. **Set to `False` in production.**           |
| `SECRET_KEY`              | insecure dev key                                       | Django cryptographic signing. **Must override in production.**         |
| `ALLOWED_HOSTS`           | `127.0.0.1,localhost`                                 | Comma-separated list of hostnames the site will serve.                 |
| `DATABASE_URL`            | `sqlite:///<BASE_DIR>/db.sqlite3`                      | Any [dj-database-url](https://github.com/jazzband/dj-database-url)-compatible URL (e.g. `postgres://user:pass@host:5432/db`). |
| `AWS_ACCESS_KEY_ID`       | _unset_                                                | If set together with `AWS_SECRET_ACCESS_KEY`, switches media storage to S3-compatible. |
| `AWS_SECRET_ACCESS_KEY`   | _unset_                                                | Companion secret key.                                                 |
| `AWS_STORAGE_BUCKET_NAME` | _unset_                                                | Target bucket name.                                                   |
| `AWS_S3_ENDPOINT_URL`     | _unset_                                                | Required for non-AWS providers such as Cloudflare R2.                 |
| `AWS_S3_REGION_NAME`      | `auto` (R2) or AWS region                             | Region for the bucket.                                                |
| `AWS_S3_CUSTOM_DOMAIN`    | _unset_                                                | Optional CDN domain in front of the bucket.                            |

---

## Database & Seeding

- **Development:** SQLite (no setup required).
- **Production:** provide `DATABASE_URL` (PostgreSQL recommended).

The `seed_db.py` script is **idempotent** — it uses `get_or_create` on titles so it's safe to run multiple times. Sample seed content includes grammar questions, vocabulary, kanji identification, and audio/image question placeholders that admins can populate with real media.

---

## Running Tests

```bash
python manage.py test tests
```

Tests cover:

- Landing page lists published tests.
- Anonymous users can access free tests, but are redirected to login for account-required tests.
- Authenticated users can access account-required tests.
- Quiz submission, scoring, and `Attempt` persistence for both anonymous and authenticated users.
- `My Results` page renders user attempts.

---

## Deployment Notes

- Set `DEBUG=False` and provide a strong `SECRET_KEY`.
- Configure `ALLOWED_HOSTS` for your domain.
- Provide a `DATABASE_URL` (PostgreSQL recommended).
- Configure S3-compatible object storage (Cloudflare R2 / AWS S3) for media files by setting the AWS environment variables.
- Run `python manage.py collectstatic` so `whitenoise` can serve static files.
- Place the app behind a WSGI/ASGI server such as Gunicorn / Uvicorn behind Nginx.
- Ensure HTTPS is terminated upstream so Django's `SecurityMiddleware` and CSRF work correctly.

---

## Further Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — data model, request flow, and component design.
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment walkthrough.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — local development workflow and conventions.

---

## License

This project is provided for educational purposes. It is **not affiliated with the Japan Foundation**.
