# Data Model Reference

A detailed reference for the database schema of the JFT-Basic Practice Portal. The application has two apps with a single domain model: `tests`.

---

## ER Diagram

```
┌──────────────────┐
│  auth.User       │ (Django built-in)
└────────▲─────────┘
         │ 1
         │
         │ N
┌────────┴─────────┐ 1     N ┌──────────────┐ 1     N ┌──────────────────┐
│     Attempt      │────────<│     Test     │───────<│    Question      │
│ (nullable user)  │         │              │        │                  │
└──────────────────┘         └──────────────┘        └────────┬─────────┘
                                                                │ 1
                                                                │
                                                                │ N
                                                       ┌────────▼─────────┐
                                                       │  AnswerOption    │
                                                       └──────────────────┘
```

---

## `tests.Test`

A practice exam.

| Field                | Type                       | Notes                                                          |
| -------------------- | -------------------------- | -------------------------------------------------------------- |
| `id`                 | `BigAutoField`             | Primary key.                                                   |
| `title`              | `CharField(max_length=200)` | Display name.                                                  |
| `description`        | `TextField(blank=True)`    | Optional rich description shown on the landing page.           |
| `requires_account`   | `BooleanField(default=False)` | When `True`, anonymous users are redirected to login.      |
| `is_published`       | `BooleanField(default=False)` | When `False`, the test is hidden from the landing page and inaccessible. |
| `time_limit_seconds` | `PositiveIntegerField(null=True, blank=True)` | Optional countdown; `null` = untimed.         |
| `created_at`         | `DateTimeField(auto_now_add=True)` | Set once on creation.                                |

**Ordering:** by `created_at` ascending.

**Reverse relations:**

- `test.questions.all()` → ordered by `order_index`
- `test.attempts.all()` → ordered by `-completed_at`

---

## `tests.Question`

A single question belonging to a `Test`.

| Field         | Type                                                                                  | Notes |
| ------------- | ------------------------------------------------------------------------------------- | ----- |
| `id`          | `BigAutoField`                                                                        | PK.   |
| `test`        | `ForeignKey(Test, on_delete=CASCADE, related_name="questions")`                      | Owner.|
| `type`        | `CharField(max_length=10, choices=QuestionType.choices)`                              | One of `text`, `image`, `audio`. |
| `prompt`      | `TextField(blank=True)`                                                               | Optional prompt shown above the media / options. |
| `image`       | `ImageField(upload_to="questions/images/", null=True, blank=True)`                    | Used when `type="image"`. |
| `audio`       | `FileField(upload_to="questions/audio/", null=True, blank=True)`                      | Used when `type="audio"`. |
| `order_index` | `PositiveIntegerField(default=0)`                                                     | Display & scoring order. |

**Ordering:** by `order_index` ascending.

**`QuestionType` (TextChoices):**

| Value   | Label  |
| ------- | ------ |
| `text`  | Text   |
| `image` | Image  |
| `audio` | Audio  |

**Reverse relations:**

- `question.options.all()` → ordered by `order_index`

---

## `tests.AnswerOption`

A single answer choice for a `Question`.

| Field         | Type                                                | Notes |
| ------------- | --------------------------------------------------- | ----- |
| `id`          | `BigAutoField`                                      | PK.   |
| `question`    | `ForeignKey(Question, on_delete=CASCADE, related_name="options")` | Owner. |
| `label`       | `CharField(max_length=255)`                         | Visible text. |
| `is_correct`  | `BooleanField(default=False)`                       | Exactly one should be `True` for a well-formed question. |
| `order_index` | `PositiveIntegerField(default=0)`                   | Display order. |

**Ordering:** by `order_index` ascending.

> **Invariant:** A well-formed question has at least two options and at least one `is_correct=True`. The application does not currently enforce this at the DB level — please audit in admin.

---

## `tests.Attempt`

A submission of a `Test` by a user (possibly anonymous).

| Field            | Type                                                                                    | Notes |
| ---------------- | --------------------------------------------------------------------------------------- | ----- |
| `id`             | `BigAutoField`                                                                          | PK.   |
| `test`           | `ForeignKey(Test, on_delete=CASCADE, related_name="attempts")`                          | Which test was attempted. |
| `user`           | `ForeignKey(AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)`                | Nullable so anonymous free-test attempts persist. |
| `score`          | `PositiveIntegerField()`                                                                | Number of correct answers. |
| `total_questions`| `PositiveIntegerField()`                                                                | Snapshot of question count at submission time. |
| `answers`        | `JSONField(default=dict)`                                                               | `{ "question_id": selected_option_id \| None }`. |
| `completed_at`   | `DateTimeField(auto_now_add=True)`                                                      | Submission timestamp. |

**Ordering:** by `-completed_at` (most recent first).

---

## Derived Values

These are computed at render time and not stored:

| Quantity             | Formula                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `percentage`         | `score / total_questions * 100`                                              |
| `passed`             | `percentage >= 80.0` (the JFT-Basic standard)                                 |
| `stroke_dashoffset`  | `389 - (389 * percentage / 100)` (drives the SVG progress ring on the results page) |

---

## Cascade & Retention Behavior

| Action                                         | Effect                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| Delete `Test`                                  | All related `Question`, `AnswerOption`, and `Attempt` rows are deleted (`CASCADE`).    |
| Delete `Question`                              | All `AnswerOption` rows for that question are deleted.                                 |
| Delete `User`                                  | Their `Attempt.user` is set to `NULL`; attempts themselves are retained (`SET_NULL`).  |

This last behavior matters: when an admin removes a user account, their historical scores stay in the database (visible in the admin with `user` shown as blank) but no longer appear in their `My Results` page because the user is gone.

---

## Example: Constructing a Test Programmatically

```python
from tests.models import Test, Question, AnswerOption

t = Test.objects.create(
    title="Greetings & Phrases",
    description="Introductory vocabulary and greetings.",
    requires_account=False,
    is_published=True,
    time_limit_seconds=600,
)

q1 = Question.objects.create(
    test=t, type="text", prompt="How do you say 'good morning' politely?", order_index=1
)
AnswerOption.objects.bulk_create([
    AnswerOption(question=q1, label="おはよう", is_correct=False, order_index=1),
    AnswerOption(question=q1, label="おはようございます", is_correct=True, order_index=2),
    AnswerOption(question=q1, label="こんにちは", is_correct=False, order_index=3),
])

q2 = Question.objects.create(
    test=t, type="image", prompt="What does the sign say?", image="questions/images/sign.jpg", order_index=2
)
AnswerOption.objects.create(question=q2, label="止まれ", is_correct=True, order_index=1)
```

---

## Schema Migrations

There is a single initial migration `tests/migrations/0001_initial.py` that defines the four models above. New changes should be generated with:

```bash
python manage.py makemigrations
```

…and committed alongside the model changes.