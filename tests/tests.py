from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Test, Question, AnswerOption, Attempt

class TestViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = "testuser"
        self.password = "password123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        # Free practice test
        self.free_test = Test.objects.create(
            title="Free JFT Practice Test",
            description="A free test open to everyone.",
            requires_account=False,
            is_published=True,
            time_limit_seconds=600
        )
        
        # Account required practice test
        self.paid_test = Test.objects.create(
            title="Premium JFT Practice Test",
            description="Requires login.",
            requires_account=True,
            is_published=True
        )
        
        # Add a question to free test
        self.free_question = Question.objects.create(
            test=self.free_test,
            section=Question.Section.SCRIPT_VOCAB,
            type=Question.QuestionType.TEXT,
            prompt="What is 'Konnichiwa' in Japanese?",
            order_index=1
        )

        self.free_opt_correct = AnswerOption.objects.create(
            question=self.free_question,
            label="こんにちは",
            is_correct=True,
            order_index=1
        )
        self.free_opt_incorrect = AnswerOption.objects.create(
            question=self.free_question,
            label="さようなら",
            is_correct=False,
            order_index=2
        )

    def test_landing_page_shows_published_tests(self):
        response = self.client.get(reverse('landing_page'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.free_test.title)
        self.assertContains(response, self.paid_test.title)

    def test_anonymous_user_can_access_free_test(self):
        response = self.client.get(reverse('quiz_page', args=[self.free_test.id]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tests/quiz.html')

    def test_anonymous_user_cannot_access_paid_test(self):
        response = self.client.get(reverse('quiz_page', args=[self.paid_test.id]))
        self.assertEqual(response.status_code, 302) # Redirect to login
        self.assertTrue(response.url.startswith(reverse('login')))

    def test_authenticated_user_can_access_paid_test(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.get(reverse('quiz_page', args=[self.paid_test.id]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tests/quiz.html')

    def test_quiz_submission_and_scoring_anonymous(self):
        # Submit correct answer to free test anonymously
        post_data = {
            f"question_{self.free_question.id}": self.free_opt_correct.id
        }
        response = self.client.post(reverse('submit_quiz', args=[self.free_test.id]), data=post_data)
        
        # Should redirect to attempt results
        self.assertEqual(response.status_code, 302)
        
        # Verify attempt was created with user=None, score=1
        attempt = Attempt.objects.get(test=self.free_test)
        self.assertIsNone(attempt.user)
        self.assertEqual(attempt.score, 1)
        self.assertEqual(attempt.total_questions, 1)
        self.assertEqual(attempt.answers, {str(self.free_question.id): self.free_opt_correct.id})

    def test_quiz_submission_and_scoring_authenticated(self):
        self.client.login(username=self.username, password=self.password)
        # Submit incorrect answer to free test while logged in
        post_data = {
            f"question_{self.free_question.id}": self.free_opt_incorrect.id
        }
        response = self.client.post(reverse('submit_quiz', args=[self.free_test.id]), data=post_data)
        
        self.assertEqual(response.status_code, 302)
        
        # Verify attempt was created with user=self.user, score=0
        attempt = Attempt.objects.get(test=self.free_test)
        self.assertEqual(attempt.user, self.user)
        self.assertEqual(attempt.score, 0)
        self.assertEqual(attempt.total_questions, 1)
        self.assertEqual(attempt.answers, {str(self.free_question.id): self.free_opt_incorrect.id})
        
        # Also check My Results shows it
        response = self.client.get(reverse('my_results'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.free_test.title)

    def test_jft_basic_info_view_renders(self):
        response = self.client.get(reverse('jft_basic_info'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tests/jft_basic.html')
        self.assertContains(response, "Japan Foundation Test for")
        self.assertContains(response, "BDJ01")


    def test_ssw_skill_test_info_view_renders(self):
        response = self.client.get(reverse('ssw_skill_test_info'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tests/ssw_skill_test.html')
        self.assertContains(response, "Specified Skilled Worker")
        self.assertContains(response, "Nursing Care")

    def test_csv_question_import_helper(self):
        from .utils import import_questions_from_csv, generate_sample_csv_string
        sample_csv = generate_sample_csv_string()
        count, errors = import_questions_from_csv(self.free_test, sample_csv)
        self.assertEqual(count, 4)
        self.assertEqual(len(errors), 0)
        self.assertEqual(self.free_test.questions.count(), 5) # 1 original + 4 imported


