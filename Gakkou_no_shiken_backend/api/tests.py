from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from tests.models import Test, Question, QuestionGroup, AnswerOption, Attempt


class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')

        # Create test
        self.test_obj = Test.objects.create(
            title='JFT Mock Test 1',
            category=Test.Category.BASIC,
            is_published=True,
            is_actual_exam_demo=True,
            time_limit_seconds=3600
        )

        # Create group
        self.group = QuestionGroup.objects.create(
            test=self.test_obj,
            title='Passage 1',
            instruction='Read the conversation.'
        )

        # Create questions
        self.q1 = Question.objects.create(
            test=self.test_obj,
            group=self.group,
            type=Question.QuestionType.TEXT,
            section=Question.Section.SCRIPT_VOCAB,
            prompt='What is the reading of __漢字__?'
        )
        self.opt1 = AnswerOption.objects.create(question=self.q1, label='かんじ', is_correct=True, order_index=1)
        self.opt2 = AnswerOption.objects.create(question=self.q1, label='かんじき', is_correct=False, order_index=2)

    def test_list_tests(self):
        response = self.client.get('/api/tests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tests', response.data)
        self.assertEqual(len(response.data['tests']), 1)
        self.assertEqual(response.data['tests'][0]['title'], 'JFT Mock Test 1')

    def test_quiz_data(self):
        response = self.client.get(f'/api/tests/{self.test_obj.id}/quiz/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('steps', response.data)
        self.assertEqual(len(response.data['steps']), 1)
        # Verify is_correct is NOT leaked in quiz payload
        q_options = response.data['steps'][0]['questions'][0]['options']
        self.assertNotIn('is_correct', q_options[0])

    def test_submit_quiz(self):
        answers = {str(self.q1.id): self.opt1.id}
        response = self.client.post(f'/api/tests/{self.test_obj.id}/submit/', {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('attempt_id', response.data)
        self.assertEqual(response.data['score'], 1)

        # Fetch results
        attempt_id = response.data['attempt_id']
        res_response = self.client.get(f'/api/attempts/{attempt_id}/')
        self.assertEqual(res_response.status_code, status.HTTP_200_OK)
        self.assertEqual(res_response.data['attempt']['score'], 1)
        self.assertEqual(res_response.data['attempt']['percentage'], 100.0)

    def test_info_endpoints(self):
        jft_res = self.client.get('/api/info/jft/')
        self.assertEqual(jft_res.status_code, status.HTTP_200_OK)
        self.assertIn('jft_info', jft_res.data)

        ssw_res = self.client.get('/api/info/ssw/')
        self.assertEqual(ssw_res.status_code, status.HTTP_200_OK)
        self.assertIn('ssw_info', ssw_res.data)

    def test_auth_and_my_results(self):
        # Login
        login_res = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        token = login_res.data['tokens']['access']

        # Access with Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['user']['username'], 'testuser')

        results_res = self.client.get('/api/auth/my-results/')
        self.assertEqual(results_res.status_code, status.HTTP_200_OK)
