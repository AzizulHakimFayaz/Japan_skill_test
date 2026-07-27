# Contributing

Thank you for your interest in contributing to the JFT-Basic Practice Portal. This guide explains how to set up your development environment and the conventions used by the project.

---

## 1. Local Development Setup

### Prerequisites

- Python 3.11+
- `git`

### First-time setup

```bash
git clone <your-fork-url>
cd Japan_skill_test
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env .env.local           # optional: tweak values
python manage.py migrate
python manage.py createsuperuser
python seed_db.py            # optional: load sample tests
python manage.py runserver
```

The dev server runs on http://127.0.0.1:8000/.

### Useful management commands

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py shell
python manage.py test tests
```

---

## 2. Project Layout Recap

- `config/` — settings and root URL configuration.
- `accounts/` — auth and per-user dashboards.
- `tests/` — quiz engine, models, scoring, and admin.
- `templates/base.html` — site shell (navbar, alerts, footer).
- `static/` — source static files; collected into `staticfiles/` for serving.
- `seed_db.py` — idempotent sample-data loader.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper dive.

---

## 3. Coding Conventions

### Python / Django

- **PEP 8** with reasonable line lengths (~100 chars).
- **Function-based views** are used throughout — please follow that style unless a class-based view clearly improves clarity.
- Keep business logic in **models and views**, not templates.
- Every new model field needs a **migration** (`python manage.py makemigrations`).
- Prefer explicit `related_name` on all `ForeignKey` fields.
- Forms should use Django's `forms` module; avoid raw HTML inputs when a `Form`/`ModelForm` is appropriate.

### Templates

- All pages extend `templates/base.html`.
- Use Tailwind utility classes for styling — keep class strings semantic and consistent with the existing palette (`japan-red`, `japan-navy`, `japan-gold`, etc.).
- For interactivity, prefer Alpine.js (`x-data`, `x-show`, `@click`) over ad-hoc inline `onclick` handlers.
- Replace placeholder Tailwind CDN usage with a compiled CSS pipeline before shipping to production.

### Frontend / Assets

- Google Fonts (Inter + Noto Sans JP) are loaded via `<link>` tags.
- Avoid adding new JS libraries without discussion; Alpine.js + Tailwind cover the current scope.
- Keep SVGs inline (as the existing templates do) to avoid extra HTTP requests.

### Tests

- Tests live in `tests/tests.py` (and `accounts/tests.py`, which currently only contains a placeholder — add new tests there as the auth surface grows).
- Use `django.test.TestCase` and the included `Client`.
- Name tests like `test_<thing_being_tested>`; cover both happy and unhappy paths.
- Always add tests when fixing a bug or adding a feature.

### Documentation

- Update `README.md` for user-facing changes (setup, env vars, scripts).
- Update `ARCHITECTURE.md` for non-trivial design changes.
- Add entries to this file's **Conventions** section when introducing new patterns.

---

## 4. Git Workflow

1. Fork and create a topic branch: `git checkout -b feat/my-feature`.
2. Make your changes in small, focused commits.
3. Run tests before pushing: `python manage.py test tests`.
4. Open a PR with a clear description of the change and rationale.

Commit message style: short imperative present tense — `Add timer auto-submit`, not _Added..._ or _Adds..._.

---

## 5. Adding a New Question Type

The quiz engine currently supports `text`, `image`, and `audio`. To add another:

1. Add the choice to `Question.QuestionType` in `tests/models.py`.
2. Add the corresponding media field on `Question` (e.g. `video = models.FileField(...)`).
3. Update `seed_db.py` and the admin inlines to expose the new field.
4. Update `tests/templates/tests/quiz.html` and `results.html` to render the asset.
5. Add tests for the new media path.

---

## 6. Adding a New App

```bash
python manage.py startapp <app_name>
```

Then:

1. Add the app to `INSTALLED_APPS` in `config/settings.py`.
2. Include its URLs from `config/urls.py` (or from another included URLconf).
3. Ensure migrations are generated and committed.

---

## 7. Reporting Issues

When filing an issue, please include:

- A clear, descriptive title.
- Steps to reproduce (or, for bugs, the failing test/command).
- Expected vs. actual behavior.
- Django / Python / OS versions (`python -m django --version`).

---

## 8. Code of Conduct

This project follows a standard respectful-collaboration policy: be welcoming, assume good faith, give constructive feedback, and prioritize the user/student community the portal serves.

Happy hacking — and がんばってください!
