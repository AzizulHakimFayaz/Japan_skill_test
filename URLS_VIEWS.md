# URLs & Views Reference

This document catalogs every URL exposed by the project and the view it dispatches to, grouped by app. Use it as a quick reference when extending the portal.

---

## 1. Root URL Configuration

Defined in `config/urls.py`:

| Mounted URL Prefix | App / URLconf              | Purpose                            |
| ------------------ | -------------------------- | ---------------------------------- |
| `/admin/`          | `django.contrib.admin`     | Jazzmin-styled Django admin.       |
| `/accounts/`       | `accounts.urls`            | Auth flows & per-user dashboard.   |
| `/`                | `tests.urls`               | Landing page, quiz, submission, results. |

In `DEBUG`, the root `urlpatterns` also serves `MEDIA_URL` and `STATIC_URL` directly.

---

## 2. `accounts.urls` — `/accounts/`

| URL Pattern         | View Name            | View Function       | Auth Required | Description                                                                                |
| ------------------- | -------------------- | ------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `signup/`           | `signup`             | `signup_view`       | No            | Create a `User` with `UserCreationForm`; auto-login on success. Honors `?next=`.            |
| `login/`            | `login`              | `login_view`        | No            | Accepts username **or** email. Honors `?next=`.                                            |
| `logout/`           | `logout`             | `logout_view`       | No            | Logs the user out via Django's `auth.logout` and redirects to `landing_page`.              |
| `my-results/`       | `my_results`         | `my_results_view`   | Yes (`@login_required`) | Dashboard of the logged-in user's attempts, with averages and pass-rate.        |

### Settings relevant to this app

```python
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'landing_page'
LOGOUT_REDIRECT_URL = 'landing_page'
```

These give us consistent default redirect behavior across the site.

### Email-as-username behavior

The default Django `AuthenticationForm` only knows about usernames. To make life easier for users, `login_view`:

1. Inspects the submitted value.
2. If it contains `@`, looks up the corresponding `User` by email.
3. Substitutes the username before calling `authenticate()`.

This is transparent to the user — the form's single field is labeled "Username or Email".

---

## 3. `tests.urls` — mounted at `/`

| URL Pattern                          | View Name         | View Function            | Auth Required                                          | Description                                                                                       |
| ------------------------------------ | ----------------- | ------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `` (empty path)                      | `landing_page`    | `landing_page_view`      | No                                                     | Renders the public list of published tests.                                                        |
| `test/<int:pk>/`                     | `quiz_page`       | `quiz_page_view`         | Depends on the test                                    | Renders the quiz wizard. If `test.requires_account` and the user is anonymous, redirects to `?next=…` login. |
| `test/<int:pk>/submit/`              | `submit_quiz`     | `submit_quiz_view`       | Depends on the test                                    | Accepts `POST` from the quiz form, scores it, creates an `Attempt`, redirects to results.            |
| `attempt/<int:pk>/`                  | `attempt_results` | `attempt_results_view`   | Yes (when test `requires_account`)                     | Renders the score summary and per-question review. Ownership enforced for `requires_account` tests. |

### View internals at a glance

#### `landing_page_view`

- `tests = Test.objects.filter(is_published=True)`
- Renders `tests/landing.html`.

#### `quiz_page_view(request, pk)`

- `test = get_object_or_404(Test, pk=pk, is_published=True)`
- Auth gate: `if test.requires_account and not request.user.is_authenticated: redirect('login')`
- `questions = test.questions.prefetch_related('options')` — uses prefetch to avoid N+1 queries.
- Renders `tests/quiz.html` with `test`, `questions`, `total_questions`.

#### `submit_quiz_view(request, pk)`

- `if request.method != 'POST': redirect('landing_page')`
- Re-resolves the test (auth-gated for `requires_account`).
- For each question, reads `question_<id>` from `request.POST`, validates against `AnswerOption` ids, and increments `score` on correctness.
- `answers` stored as `{ "<question_id>": <option_id or None> }`.
- Persists `Attempt(user=request.user if authenticated else None, score=…, total_questions=…, answers=…)`.
- Redirects to `attempt_results` with the new attempt's id.

#### `attempt_results_view(request, pk)`

- Resolves the `Attempt`.
- Ownership check: if the related `Test.requires_account`, the viewing user must own the attempt.
- Decorates each question with `selected_option_id` and `is_answered_correctly` for template rendering.
- Computes `percentage`, `passed` (≥ 80%), and the SVG `stroke_dashoffset` for the scoreboard ring.
- Renders `tests/results.html`.

---

## 4. URL name conventions

Every named URL uses lowercase_with_underscores. Templates reference them via `{% url 'name' %}`:

- `{% url 'landing_page' %}`
- `{% url 'quiz_page' test.id %}`
- `{% url 'submit_quiz' test.id %}`
- `{% url 'attempt_results' attempt.id %}`
- `{% url 'login' %}`, `{% url 'signup' %}`, `{% url 'logout' %}`, `{% url 'my_results' %}`

Jazzmin's `topmenu_links` and `usermenu_links` settings also reference `landing_page` and `auth.User`.

---

## 5. Adding a new URL

1. Add the path to the appropriate `urls.py`.
2. Implement the view function in `views.py`.
3. Apply any required `@login_required` and ownership checks.
4. Write a test in `tests/tests.py`.
5. Reference it from templates with `{% url 'name' %}`.

For cross-app links, prefer `{% url 'namespace:name' %}` style to keep the indirection explicit.

---

## 6. Common redirect targets

| Code path                                         | Redirects to                                       |
| ------------------------------------------------- | -------------------------------------------------- |
| `signup_view` (already authed)                    | `landing_page` (or `?next=`)                       |
| `login_view` (already authed)                     | `landing_page` (or `?next=`)                       |
| `logout_view`                                     | `landing_page`                                     |
| `quiz_page_view` (requires_account, anon)         | `login?next=<original-path>`                       |
| `submit_quiz_view` (requires_account, anon)        | `HttpResponseForbidden`                            |
| `attempt_results_view` (requires_account, others) | `HttpResponseForbidden`                            |
| `submit_quiz_view` (success)                      | `attempt_results` for the new attempt              |
