from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from tests.models import Test, Question, QuestionGroup, AnswerOption, Attempt
from accounts.models import PartnerSchool, PartnerAssignedExam, PartnerStudyNote, PartnerNotification, UserProfile


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

    def test_draft_test_preview_submission_and_results(self):
        # Unpublish test to make it a draft
        self.test_obj.is_published = False
        self.test_obj.requires_account = True
        self.test_obj.save()

        # 1. Anonymous submission without preview -> 403 Forbidden
        answers = {str(self.q1.id): self.opt1.id}
        res_fail = self.client.post(f'/api/tests/{self.test_obj.id}/submit/', {'answers': answers}, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Anonymous submission with preview=admin -> 201 Created
        res_ok = self.client.post(
            f'/api/tests/{self.test_obj.id}/submit/?preview=admin',
            {'answers': answers, 'preview': 'admin'},
            format='json'
        )
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_ok.data.get('is_preview'))
        attempt_id = res_ok.data['attempt_id']

        # 3. Retrieve results of the preview attempt -> 200 OK
        res_results = self.client.get(f'/api/attempts/{attempt_id}/?preview=admin')
        self.assertEqual(res_results.status_code, status.HTTP_200_OK)
        self.assertTrue(res_results.data['attempt']['is_preview'])
        self.assertEqual(res_results.data['attempt']['score'], 1)


class PartnerSchoolLMSAndSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sensei_user = User.objects.create_user(
            username='sensei_sakura', email='sensei@sakura.com', password='password123'
        )
        self.student_user = User.objects.create_user(
            username='student_budi', email='budi@example.com', password='password123'
        )
        self.outsider_user = User.objects.create_user(
            username='outsider_user', email='outsider@example.com', password='password123'
        )

        self.school = PartnerSchool.objects.create(
            name='LPK Sakura Nusantara',
            slug='lpk-sakura',
            country='Indonesia',
            city='Jakarta',
            owner=self.sensei_user,
            join_code='482910',
            require_join_pin=True,
            require_approval=True,
            enrollment_locked=False,
        )

        self.mock_test = Test.objects.create(
            title='Sakura Friday JFT Exam',
            category=Test.Category.BASIC,
            is_published=True,
            partner_school=self.school,
        )

    def test_anti_leak_join_pin_and_approval_gate(self):
        self.client.force_authenticate(user=self.student_user)

        # 1. Joining without PIN when require_join_pin=True fails with 400
        res_no_pin = self.client.post(
            '/api/partners/join/',
            {'slug': 'lpk-sakura', 'batch': 'Batch-14', 'first_name': 'Budi', 'join_code': '000000'},
            format='json',
        )
        self.assertEqual(res_no_pin.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Joining with valid 6-digit PIN succeeds, places student in 'pending' status
        res_ok = self.client.post(
            '/api/partners/join/',
            {'slug': 'lpk-sakura', 'batch': 'Batch-14', 'first_name': 'Budi', 'join_code': '482910'},
            format='json',
        )
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertEqual(res_ok.data['partner_status'], 'pending')

        # 3. While pending, student receives empty private classroom feed with membership_status='pending'
        res_classroom_pending = self.client.get('/api/partners/lpk-sakura/classroom/')
        self.assertEqual(res_classroom_pending.status_code, status.HTTP_200_OK)
        self.assertEqual(res_classroom_pending.data['membership_status'], 'pending')
        self.assertEqual(len(res_classroom_pending.data['assigned_exams']), 0)

        # 4. Sensei (logged in via website account owner) approves student, assigns exam, note, and notice
        self.client.force_authenticate(user=self.sensei_user)

        res_approve = self.client.post(
            '/api/partners/lpk-sakura/manage/',
            {'action': 'approve_student', 'user_id': self.student_user.id},
            format='json',
        )
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)

        res_assign = self.client.post(
            '/api/partners/lpk-sakura/manage/',
            {
                'action': 'assign_exam',
                'test_id': self.mock_test.id,
                'title_override': 'Friday Room B Assessment',
                'target_batch': 'Batch-14',
                'schedule_label': 'Friday 10:00 AM',
                'attendance_pin': '7788',
                'require_pin': True,
            },
            format='json',
        )
        self.assertEqual(res_assign.status_code, status.HTTP_201_CREATED)
        assigned_exam_id = res_assign.data['assigned_exam']['id']

        res_note = self.client.post(
            '/api/partners/lpk-sakura/manage/',
            {
                'action': 'create_note',
                'title': 'Lesson 12 Grammar Sheet',
                'category': 'grammar',
                'target_batch': 'Batch-14',
                'content': 'Important grammar particles for JFT-Basic A2.',
            },
            format='json',
        )
        self.assertEqual(res_note.status_code, status.HTTP_201_CREATED)

        res_notice = self.client.post(
            '/api/partners/lpk-sakura/manage/',
            {
                'action': 'create_notification',
                'title': 'Exam starts at 10 AM sharp',
                'message': 'Bring headphones.',
                'priority': 'important',
            },
            format='json',
        )
        self.assertEqual(res_notice.status_code, status.HTTP_201_CREATED)

        # 5. Approved student now accesses classroom, verifies 4-digit exam PIN, and marks attendance
        self.client.force_authenticate(user=self.student_user)
        res_classroom_ok = self.client.get('/api/partners/lpk-sakura/classroom/')
        self.assertEqual(res_classroom_ok.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_classroom_ok.data['assigned_exams']), 1)
        self.assertEqual(len(res_classroom_ok.data['study_notes']), 1)
        self.assertEqual(len(res_classroom_ok.data['notifications']), 1)

        # Wrong 4-digit exam PIN fails with 400
        res_bad_exam_pin = self.client.post(
            '/api/partners/lpk-sakura/classroom/',
            {'action': 'verify_exam_pin', 'assigned_exam_id': assigned_exam_id, 'pin': '1111'},
            format='json',
        )
        self.assertEqual(res_bad_exam_pin.status_code, status.HTTP_400_BAD_REQUEST)

        # Correct 4-digit exam PIN marks attendance
        res_good_exam_pin = self.client.post(
            '/api/partners/lpk-sakura/classroom/',
            {'action': 'verify_exam_pin', 'assigned_exam_id': assigned_exam_id, 'pin': '7788'},
            format='json',
        )
        self.assertEqual(res_good_exam_pin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_good_exam_pin.data['test_id'], self.mock_test.id)
        self.assertEqual(PartnerAssignedExam.objects.get(id=assigned_exam_id).attended_users.count(), 1)

    def test_school_self_registration_and_onboarding(self):
        # 1. A Candidate account trying to log in with role='school' is rejected with 403
        res_cand_school_login = self.client.post(
            '/api/auth/login/',
            {'username': 'student_budi', 'password': 'password123', 'role': 'school'},
            format='json',
        )
        self.assertEqual(res_cand_school_login.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res_cand_school_login.data.get('code'), 'not_a_school_account')

        # 2. A School Owner account logging in with role='school' succeeds
        res_sensei_login = self.client.post(
            '/api/auth/login/',
            {'username': 'sensei_sakura', 'password': 'password123', 'role': 'school'},
            format='json',
        )
        self.assertEqual(res_sensei_login.status_code, status.HTTP_200_OK)
        self.assertEqual(res_sensei_login.data['user']['owned_partner_school']['slug'], 'lpk-sakura')

        # 3. Authenticated School registration creates PartnerSchool with is_active=False (Pending Admin Approval)
        self.client.force_authenticate(user=self.outsider_user)
        res_setup = self.client.post(
            '/api/partners/register-school/',
            {
                'school_name': 'Dhaka Nihongo Academy',
                'country': 'Bangladesh',
                'city': 'Dhaka',
                'whatsapp_or_phone': '+8801711000000',
                'require_join_pin': True,
            },
            format='json',
        )
        self.assertEqual(res_setup.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_setup.data['partner_school']['slug'], 'dhaka-nihongo-academy')
        created_school = PartnerSchool.objects.get(slug='dhaka-nihongo-academy')
        self.assertEqual(created_school.owner, self.outsider_user)
        self.assertFalse(created_school.is_active)
        self.assertFalse(created_school.is_featured)
        self.assertEqual(len(created_school.join_code), 6)

        # 4. Before Admin approves, visiting Sensei Dashboard returns 403 school_pending_admin_approval
        res_dash_pending = self.client.get('/api/partners/dhaka-nihongo-academy/dashboard/')
        self.assertEqual(res_dash_pending.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res_dash_pending.data.get('code'), 'school_pending_admin_approval')

        # 5. Once Admin approves (is_active=True), Sensei Dashboard unlocks (200 OK)
        created_school.is_active = True
        created_school.save(update_fields=['is_active'])
        res_dash_approved = self.client.get('/api/partners/dhaka-nihongo-academy/dashboard/')
        self.assertEqual(res_dash_approved.status_code, status.HTTP_200_OK)


