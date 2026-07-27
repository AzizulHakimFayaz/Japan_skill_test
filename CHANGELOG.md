# Changelog

All notable changes to the JFT-Basic Practice Portal are documented here. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), and the project does **not** yet follow semantic versioning.

---

## [Unreleased]

### Added
- **Test categories** — Admins can now classify each `Test` as either **Basic** or **Skill**.
  - New `Test.category` `TextChoices` field (default: `basic`) plus migration `0002_test_category`.
  - Admin changelist exposes the category as a column, filter, and inline-edit field.
  - Public landing page groups published tests into two clearly labeled sections ("Basic Tests" / "Skill Tests") with per-category icons, counts, and empty-state messages.
  - Quiz and results pages render a small category chip in their header cards.
  - Per-test card on the landing page shows a colored category chip alongside the existing `Free & Open` / `Account Required` badge.
  - `tests/templatetags/quiz_extras.py` provides `get_item`, `category_chip_class`, and `category_label` filters used by the templates.
  - New `tests/test_categories.py` with regression tests for default category, landing-page grouping, admin filter wiring, and chip-class mapping.
  - `seed_db.py` sets explicit categories on the two demo rows and backfills them on subsequent runs.

---

## Initial Release — 2026-07-18

### Added
- Django 5.x project skeleton with the following apps:
  - `accounts` — sign up, sign in (username or email), sign out, per-user dashboard.
  - `tests` — quiz engine, scoring, results, and admin.
- Models:
  - `Test` — practice exam with metadata, `requires_account`, `is_published`, optional `time_limit_seconds`.
  - `Question` — `text` / `image` / `audio` types with optional media and an `order_index`.
  - `AnswerOption` — labelled answer with `is_correct` flag.
  - `Attempt` — JSON-encoded answers and a nullable user (anonymous free-test attempts).
- Views:
  - `landing_page_view` — list of published tests.
  - `quiz_page_view` — quiz wizard with auth enforcement.
  - `submit_quiz_view` — server-side scoring and `Attempt` persistence.
  - `attempt_results_view` — circular scoreboard and per-question review.
- Templates:
  - `base.html` — site shell with responsive navbar (Alpine.js) and toast alerts.
  - `tests/landing.html`, `tests/quiz.html`, `tests/results.html`.
  - `accounts/login.html`, `accounts/signup.html`, `accounts/my_results.html`.
- Admin (Jazzmin theme):
  - `TestAdmin` with `QuestionInline` (live image / audio previews + edit link).
  - `QuestionAdmin` with `AnswerOptionInline`.
  - `AttemptAdmin` with read-only attempt details and a `percentage_score` column.
- Storage:
  - Local `FileSystemStorage` in development.
  - Automatic switch to S3-compatible storage (`django-storages[s3]` + `boto3`) when AWS credentials are present.
- Static assets served by `whitenoise` with manifest hashing.
- Environment-driven configuration via `django-environ`.
- Sample data seeder (`seed_db.py`) creating:
  - A free, public, 3-question text/image mock exam.
  - An account-required, 2-question text/audio mock exam.
- Test suite covering landing, free vs. paid access, and submission / scoring for both anonymous and authenticated users.

### Notes
- The app folder `tests/` shadows Django's test-runner module name; tests are run via `python manage.py test tests`.
- The 80% pass threshold mirrors the published JFT-Basic standard.
- This release is **not affiliated with the Japan Foundation**.