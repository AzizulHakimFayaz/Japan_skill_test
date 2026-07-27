# Architecture

This document explains the high-level architecture of the JFT-Basic Practice Portal: the data model, the request flow, the responsibilities of each app, and a few important design decisions.

---

## 1. Bird's-eye View

The project is a classic server-rendered Django monolith:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (CDN assets)                    │
│                                                                 │
│   Tailwind CSS + Alpine.js + Google Fonts (Noto Sans JP, Inter) │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTML / POST forms
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Django (config.settings)                   │
│                                                                 │
│   ┌───────────────┐    ┌──────────────────┐    ┌─────────────┐   │
│   │   accounts    │    │      tests       │    │   admin     │   │
│   │  auth + my    │    │  quiz engine +   │    │  (jazzmin)  │   │
│   │   results     │    │     scoring      │    │             │   │
│   └──────┬────────┘    └────────┬─────────┘    └──────┬──────┘   │
│          │                     │                    │          │
│          └──────────┬──────────┴────────────────────┘          │
│                     │                                           │
│                     ▼                                           │
│             ┌──────────────────────┐                            │
│             │     ORM (Django)     │                            │
│             └──────────┬───────────┘                            │
│                        │                                        │
│                  ┌─────▼──────┐    ┌────────────────────────┐  │
│                  │  SQLite /  │    │  FileSystem or S3      │  │
│                  │ PostgreSQL │    │  (media + staticfiles) │  │
│                  └────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Two custom apps (`accounts`, `tests`) plus Django's built-in `admin`, `auth`, `sessions`, `messages`, `contenttypes`, `staticfiles`. The admin UI is restyled by `django-jazzmin`.

---

## 2. Apps and Responsibilities

### `config/`

The Django project itself. Contains only wiring:

- `settings.py` — environment-driven configuration, app registry, middleware, template config, storage backends, and Jazzmin theme tweaks.
- `urls.py` — Root URL routing. Mounts `accounts/` and `tests/` and serves media/static in DEBUG.
- `asgi.py` / `wsgi.py` — Server entry points.

### `accounts/`

Authentication and per-user dashboards.

**Models:** none (uses Django's `auth.User`).

**Views (FBVs):**

| URL                  | View                  | Notes                                                             |
| -------------------- | --------------------- | ----------------------------------------------------------------- |
| `/accounts/signup/`  | `signup_view`         | Uses `UserCreationForm`; auto-logs in on success.                 |
| `/accounts/login/`   | `login_view`          | Accepts **username or email** — transparently resolves emails.    |
| `/accounts/logout/`  | `logout_view`         | Posts/logs out and redirects to landing.                          |
| `/accounts/my-results/` | `my_results_view` | `login_required` — renders the user's attempt history.           |

**Templates:** `login.html`, `signup.html`, `my_results.html` (all extend `base.html`).

### `tests/`

Domain logic — the quiz engine, scoring, and result rendering.

**Models:**

| Model          | Purpose                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| `Test`         | A practice exam. Has metadata, a `requires_account` flag, a publication flag, and an optional `time_limit_seconds`. |
| `Question`     | Belongs to a `Test`. Has a `QuestionType` (text / image / audio), an optional image, an optional audio clip, an `order_index`, and a text prompt. |
| `AnswerOption` | Belongs to a `Question`. Stores `label`, `is_correct`, and `order_index`.            |
| `Attempt`      | A user's submission for a `Test`. Stores `score`, `total_questions`, JSON `answers`, completion timestamp, and `user` (nullable to support anonymous attempts on free tests). |

**Views (FBVs):**

| URL                              | View                    | Notes                                                                                              |
| -------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                              | `landing_page_view`     | Lists all published tests, with badges for free vs. account-required.                              |
| `/test/<id>/`                    | `quiz_page_view`        | Enforces `requires_account`. Serves all questions/options in one render; Alpine.js handles the wizard. |
| `/test/<id>/submit/`             | `submit_quiz_view`      | Validates `POST`, computes the score, creates an `Attempt`, redirects to the results page.          |
| `/attempt/<id>/`                 | `attempt_results_view`  | Per-question review; ownership enforced when the test `requires_account`.                          |

**Templates:** `landing.html`, `quiz.html`, `results.html` (all extend `base.html`).

**Admin:** `QuestionInline` (under `Test`) provides inline editing of questions with live media previews and a "Edit Answers & Options" link to the dedicated `Question` change form. `AnswerOptionInline` sits inside `QuestionAdmin`.

---

## 3. Data Model (ER Overview)

```
┌──────────────┐ 1   N ┌──────────────┐ 1   N ┌──────────────────┐
│    Test      │──────<│   Question   │──────<│  AnswerOption    │
└──────┬───────┘       └──────────────┘       └──────────────────┘
       │ 1
       │
       │ N
┌──────▼───────┐
│   Attempt    │  N:1 → auth.User (nullable)   JSONField {question_id: option_id}
└──────────────┘
```

Key relationships:

- `Test → Question`: cascade delete (`on_delete=CASCADE`). `related_name="questions"`.
- `Question → AnswerOption`: cascade delete. `related_name="options"`.
- `Test → Attempt`: cascade delete. `related_name="attempts"`.
- `Attempt → User`: `on_delete=SET_NULL` so attempts survive user deletion; `null=True, blank=True` so anonymous attempts are allowed for free tests.
- `Attempt.answers` is `JSONField` mapping question PK (stringified) → selected option PK (or `null`).

---

## 4. Request Flows

### 4.1 Taking a free test (anonymous)

1. `GET /` — `landing_page_view`. Lists every published test.
2. `GET /test/<id>/` — `quiz_page_view` checks `requires_account`; for free tests, renders `quiz.html`.
3. `quiz.html` ships a single Alpine.js instance (`x-data`) holding `currentStep`, `timeLeft`, and `answers`. Each step is one question card; media players auto-pause on navigation.
4. `POST /test/<id>/submit/` — `submit_quiz_view`:
   - Iterates questions, reads `question_<id>` form values.
   - Computes score by comparing selected option's `is_correct`.
   - Persists `Attempt(user=None, …)` and redirects to `/attempt/<id>/`.
5. `GET /attempt/<id>/` — `attempt_results_view` renders the per-question review. Ownership is not enforced for free tests.

### 4.2 Taking an account-required test

1. Anonymous user clicks "Start Practice Exam" on a `requires_account` test.
2. `quiz_page_view` returns `302` to `/accounts/login/?next=/test/<id>/`.
3. After login, `login_view` honors the `?next=` parameter and redirects back.
4. Submission requires `request.user.is_authenticated`; otherwise the view returns `HttpResponseForbidden`.
5. The results page enforces ownership — only `attempt.user == request.user` may view it.

---

## 5. Authentication Design

- Built on Django's default `User` model.
- `signup_view` uses `UserCreationForm` and explicitly captures an optional email field that's not part of the default form, then logs the user in immediately.
- `login_view` extends `AuthenticationForm` to transparently resolve an email address into the corresponding username before calling `authenticate()`. The end-user behavior: a single "Username or Email" field.
- `LOGIN_URL = 'login'`, `LOGIN_REDIRECT_URL = 'landing_page'`, `LOGOUT_REDIRECT_URL = 'landing_page'` provide sensible defaults across the app.

---

## 6. Storage Layout

- **Static files** — Collected via `collectstatic` into `staticfiles/`. `whitenoise` serves them with `CompressedManifestStaticFilesStorage` so a hashed-manifest lookup pattern works in production.
- **Media files** — In development: `FileSystemStorage` under `BASE_DIR/media/`. In production: when both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set, the project switches to `storages.backends.s3boto3.S3Boto3Storage` — this works with any S3-compatible API, including Cloudflare R2 (`AWS_S3_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com`, `AWS_S3_REGION_NAME=auto`).

---

## 7. Frontend Architecture

- **Layout** — A single `templates/base.html` provides the navbar (responsive, with Alpine.js controlled mobile menu), message alerts, main content block, and footer.
- **Quiz wizard** — `quiz.html` renders every question card into the same DOM and uses Alpine.js to show only the current one. This keeps server logic simple while giving a snappy SPA-like experience.
- **Styling** — Tailwind via the play CDN with a custom config that defines `japan-red`, `japan-navy`, etc. For production you'd swap to a built CSS pipeline.
- **JavaScript** — Alpine.js (lightweight declarative bindings) covers timers, modal dialogs, step navigation, and audio play/pause.

---

## 8. Scoring

- One point per correctly answered question. No negative marking.
- `Attempt.score`, `Attempt.total_questions`, and the JSON `answers` map are persisted; percentage is derived at render time.
- The **passing threshold is hard-coded at 80%** (the JFT-Basic standard). Defined in `tests/views.py` (`passed = percentage >= 80.0`) and mirrored in `my_results.html` for the dashboard pass/fail badges.

---

## 9. Admin Customization (Jazzmin)

- Site title / brand / search models are configured in `JAZZMIN_SETTINGS`.
- `icons` maps each model to a FontAwesome class so the sidebar feels curated.
- `JAZZMIN_UI_TWEAKS` applies a navy + red theme to the chrome (navbar, sidebar, action cards), uses the `flatly` Bootswatch theme for the body, and enables `changeform_format="horizontal_tabs"` for cleaner pages.

---

## 10. Things to Watch Out For

- The Django app is named `tests/` — that shadows the standard test runner module. Run tests with `python manage.py test tests` so that resolution targets our package and not the runner.
- `SECRET_KEY` in `.env` is the insecure dev key shipped with Django; **override it in any non-local environment.**
- The `Attempt.user` field is nullable by design (to allow anonymous free-test attempts); don't enforce non-null on it.
- A `Test` with `is_published=False` is invisible everywhere (landing page, quiz access). Use the admin to toggle publication safely.
