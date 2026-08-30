from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User

from .models import Test, Question, AnswerOption


class TestCategoryTestCase(TestCase):
    """Tests for the Basic / Skill test categories."""

    def setUp(self):
        self.client = Client()

        # A Basic test, published, free.
        self.basic_test = Test.objects.create(
            title="Basic Mock One",
            description="First basic mock.",
            category=Test.Category.BASIC,
            requires_account=False,
            is_published=True,
        )
        Question.objects.create(
            test=self.basic_test,
            type=Question.QuestionType.TEXT,
            prompt="Konnichiwa means?",
            order_index=1,
        )

        # A Skill test, published, requires account.
        self.skill_test = Test.objects.create(
            title="Skill Workplace Listening",
            description="SSW-focused listening practice.",
            category=Test.Category.SKILL,
            requires_account=True,
            is_published=True,
        )
        Question.objects.create(
            test=self.skill_test,
            type=Question.QuestionType.AUDIO,
            prompt="Listen and answer.",
            order_index=1,
        )

        # An unpublished Basic test (must NOT show on landing).
        self.draft_basic = Test.objects.create(
            title="Draft Basic Test",
            category=Test.Category.BASIC,
            requires_account=False,
            is_published=False,
        )

        # Staff user for admin checks.
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass123"
        )

    def test_category_default_is_basic(self):
        """Newly created Test rows default to the Basic category."""
        t = Test.objects.create(title="Defaults Check", is_published=True)
        self.assertEqual(t.category, Test.Category.BASIC)

    def test_landing_groups_by_category(self):
        """The API returns both category sections and the right tests."""
        response = self.client.get(reverse("api_tests_list"))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("tests_by_category", data)
        self.assertIn("basic", data["tests_by_category"])
        self.assertIn("skill", data["tests_by_category"])

        basic_titles = [t['title'] for t in data["tests_by_category"]["basic"]]
        skill_titles = [t['title'] for t in data["tests_by_category"]["skill"]]

        # Published tests appear; the draft does not.
        self.assertIn(self.basic_test.title, basic_titles)
        self.assertIn(self.skill_test.title, skill_titles)
        self.assertNotIn(self.draft_basic.title, basic_titles)


    def test_admin_list_filter_includes_category(self):
        """Admin ModelAdmin exposes `category` in list_filter (smoke-check the
        admin configuration without rendering the Jazzmin changelist template).

        The full admin changelist page is exercised manually because rendering
        Jazzmin requires a fully-built staticfiles manifest, which isn't
        reliable inside the test runner. We verify the model-side wiring here.
        """
        from django.contrib import admin as django_admin
        from tests.admin import TestAdmin

        self.assertIn("category", TestAdmin.list_filter)
        self.assertIn("category", TestAdmin.list_display)
        self.assertIn("category", TestAdmin.list_editable)

        # And the model has the choices we expect.
        self.assertEqual(Test.Category.BASIC, "basic")
        self.assertEqual(Test.Category.SKILL, "skill")

    def test_category_chip_classes_distinct(self):
        """Basic and Skill tests should map to different Tailwind chip classes."""
        from tests.templatetags.quiz_extras import category_chip_class, category_label

        self.assertEqual(category_label(self.basic_test), "JFT")
        self.assertEqual(category_label(self.skill_test), "SSW Skill")
        self.assertIn("indigo", category_chip_class(self.basic_test))
        self.assertIn("amber", category_chip_class(self.skill_test))