# Testing Guide

This document explains the testing strategy for the JFT-Basic Practice Portal and how to run, extend, and interpret the existing test suite.

---

## 1. Running Tests

The project uses Django's built-in test runner:

```bash
python manage.py test tests
```

> The app folder is named `tests` — Django's test runner resolves this as our package (not the standard library `tests` module). Always target it explicitly.

To run a single test case:

```bash
python manage.py test tests.tests.TestViewsTestCase.test_landing_page_shows_published_tests
```

To enable verbose output:

```bash
python manage.py test tests -v 2
```

---

## 2. What's Tested Today

The test module lives at `tests/tests.py` (`TestViewsTestCase`):

| Test                                                       | Asserts                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `test_landing_page_shows_published_tests`                  | The landing page returns 200 and contains both free and account-required test titles.            |
| `test_anonymous_user_can_access_free_test`                 | Anonymous user gets 200 + `tests/quiz.html` template on a free test.                              |
| `test_anonymous_user_cannot_access_paid_test`              | Anonymous user gets 302 redirect to `/accounts/login/` for an account-required test.             |
| `test_authenticated_user_can_access_paid_test`             | Logged-in user gets 200 + `tests/quiz.html` template for an account-required test.                |
| `test_quiz_submission_and_scoring_anonymous`               | Anonymous submission creates an `Attempt(user=None, score=1, …)` and redirects to results.        |
| `test_quiz_submission_and_scoring_authenticated`           | Authenticated submission creates an `Attempt(user=user, score=0, …)` and the `My Results` page shows the test. |

`accounts/tests.py` currently contains only a placeholder — add auth tests there as the surface grows.

---

## 3. Test Infrastructure in Use

- `django.test.TestCase` — wraps each test in a transaction and rolls back, so tests don't interfere with each other.
- `django.test.Client` — emulates HTTP requests without a network socket.
- `django.urls.reverse` — generates URLs from view names; avoids hard-coded paths in tests.
- A `setUp` method constructs a `User`, two `Test`s, and one `Question` with two options — enough fixtures for the entire test class to share.

---

## 4. Authoring New Tests

### Conventions

- One `TestCase` per app/component.
- Use `setUp` for fixtures shared across the class; use `setUpTestData` for read-only fixtures that don't need per-test mutation.
- Test both happy and unhappy paths (auth, permissions, invalid input).
- Test *behavior*, not Django implementation details — assert on response codes, rendered content, and database state, not on internal method calls.
- Prefer `assertContains(response, text)` for template text and `assertTemplateUsed(response, 'tests/quiz.html')` for template selection.

### Template

```python
from django.test import TestCase
from django.urls import reverse

class MyFeatureTests(TestCase):
    def setUp(self):
        # create fixtures
        ...

    def test_happy_path(self):
        response = self.client.get(reverse('landing_page'))
        self.assertEqual(response.status_code, 200)

    def test_unauthenticated_user_is_redirected(self):
        response = self.client.get(reverse('my_results'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('login'), response.url)
```

### Testing POST submissions

For submission tests, build the `post_data` dict using the same field names as the templates (`question_<id>`):

```python
post_data = {f"question_{question.id}": correct_option.id}
response = self.client.post(reverse('submit_quiz', args=[test.id]), data=post_data)
self.assertEqual(response.status_code, 302)  # redirect on success
```

---

## 5. Manual Smoke Test Checklist

Automated tests cover the critical paths, but you should also smoke-test the UI before releases:

- [ ] Landing page loads and shows published tests.
- [ ] Free test loads for an anonymous user; submit works; results render.
- [ ] Account-required test redirects anonymous user to login; original test is resumed after login.
- [ ] Authenticated user can submit an account-required test; results enforce ownership.
- [ ] `My Results` shows correct averages and pass-rate (try mixing passing and failing attempts).
- [ ] Quiz timer counts down, auto-submits at zero, and pauses audio when navigating between questions.
- [ ] Admin: create a new test, question (with image & audio), and verify it appears on the landing page after publishing.
- [ ] Admin: image and audio previews render in question inline.

---

## 6. Adding Tests When Fixing Bugs

A typical bug-fix flow:

1. **Reproduce** — write a failing test that captures the bug.
2. **Fix** — change the code to make the test pass.
3. **Extend** — add adjacent edge-case tests (auth, invalid input, missing data).
4. **Run** — `python manage.py test tests` should pass cleanly.

This guarantees a regression can never re-introduce the same bug unnoticed.

---

## 7. Future Test Coverage Targets

- `accounts/` — login with username/email, signup with optional email, logout, `my_results` filtering.
- Quiz UI edge cases — submitting with no answers, navigating with the keyboard, expired timer auto-submit.
- Admin — verifying that `QuestionInline` renders previews correctly.
- Storage layer — switching between local and S3-compatible backends based on env vars.

These can be added incrementally as the surface grows; aim to keep coverage on the public-facing URLs (those listed in [URLS_VIEWS.md](./URLS_VIEWS.md)) at 100%.
