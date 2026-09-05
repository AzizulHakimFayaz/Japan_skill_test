from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.contrib.admin.sites import site
from django.urls import reverse
from accounts.models import UserProfile
from accounts.admin import CustomUserAdmin
from tests.models import Test, Attempt


class AdminDashboardAndUserPageTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser('admin_tester', 'admin@tester.com', 'TestAdminPass123!')
        self.user = User.objects.create_user('student1', 'student1@example.com', 'StudentPass123!', first_name='John', last_name='Doe')
        
        # UserProfile (created by signal on user creation)
        self.profile, _ = UserProfile.objects.get_or_create(user=self.user)
        self.profile.country = 'Bangladesh'
        self.profile.country_source = 'user_selected'
        self.profile.target_exam = 'jft_basic'
        self.profile.japanese_level = 'A2'
        self.profile.save()
        self.user.refresh_from_db()

        # Test and Attempt
        self.mock_test = Test.objects.create(title='JFT Mock Test 1', is_published=True)
        self.attempt = Attempt.objects.create(
            test=self.mock_test,
            user=self.user,
            score=38,
            total_questions=45,
            answers={}
        )

    def test_statistics_view_requires_staff(self):
        # Anonymous user must be redirected to login
        resp = self.client.get('/admin/statistics/')
        self.assertEqual(resp.status_code, 302)
        self.assertIn('/admin/login/', resp['Location'])

    def test_statistics_view_for_staff(self):
        self.client.force_login(self.admin)
        resp = self.client.get('/admin/statistics/')
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Live Platform Statistics')
        self.assertContains(resp, 'Bangladesh')
        self.assertContains(resp, 'JFT Mock Test 1')
        self.assertContains(resp, 'student1')

    def test_custom_user_admin_rendering(self):
        cua = CustomUserAdmin(User, site)
        
        # Test candidate_card
        card_html = cua.candidate_card(self.user)
        self.assertIn('student1', card_html)
        self.assertIn('John Doe', card_html)
        self.assertIn('student1@example.com', card_html)

        # Test country_badge
        country_html = cua.country_badge(self.user)
        self.assertIn('Bangladesh', country_html)

        # Test role_badge
        role_user = cua.role_badge(self.user)
        self.assertIn('Candidate', role_user)
        role_admin = cua.role_badge(self.admin)
        self.assertIn('Admin', role_admin)

        # Test status_pill
        status_html = cua.status_pill(self.user)
        self.assertIn('Active', status_html)

    def test_password_change_template_has_eye_toggle(self):
        self.client.force_login(self.admin)
        resp = self.client.get('/admin/password_change/')
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'pwd-toggle-btn')
        self.assertContains(resp, 'id_old_password')
        self.assertContains(resp, 'id_new_password1')
        self.assertContains(resp, 'id_new_password2')

    def test_user_change_view_renders_successfully(self):
        self.client.force_login(self.admin)
        # Test changelist
        list_url = reverse('admin:auth_user_changelist')
        resp_list = self.client.get(list_url)
        self.assertEqual(resp_list.status_code, 200)

        # Test add user
        add_url = reverse('admin:auth_user_add')
        resp_add = self.client.get(add_url)
        self.assertEqual(resp_add.status_code, 200)

        # Test change view for admin
        admin_change_url = reverse('admin:auth_user_change', args=[self.admin.id])
        resp = self.client.get(admin_change_url)
        self.assertEqual(resp.status_code, 200)

        # Test change view for normal user
        user_change_url = reverse('admin:auth_user_change', args=[self.user.id])
        resp2 = self.client.get(user_change_url)
        self.assertEqual(resp2.status_code, 200)


