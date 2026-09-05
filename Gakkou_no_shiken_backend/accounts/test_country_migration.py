from unittest.mock import patch
from django.core.management import call_command
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import UserProfile, EmailVerificationOTP


class CountryMigrationAndRegistrationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('api_register')
        self.login_url = reverse('api_login')
        self.confirm_country_url = reverse('api_confirm_country')
        self.profile_url = reverse('api_profile')
        self.send_otp_url = reverse('api_send_otp')
        self.verify_otp_url = reverse('api_verify_otp')

    def test_new_registration_without_country_rejected(self):
        """New candidate registration without country must be rejected with 400."""
        payload = {
            'username': 'newcandidate1',
            'email': 'new1@example.com',
            'password': 'SecurePassword2026!',
            'password_confirm': 'SecurePassword2026!',
            'first_name': 'Amina',
            'last_name': 'Akter'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('country', response.data)

    def test_new_registration_with_country_accepted_and_marked_user_source(self):
        """New candidate registration with country succeeds and stores country_source='user'."""
        payload = {
            'username': 'newcandidate2',
            'email': 'new2@example.com',
            'country': 'Bangladesh',
            'password': 'SecurePassword2026!',
            'password_confirm': 'SecurePassword2026!',
            'first_name': 'Rahim',
            'last_name': 'Uddin'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)

        user = User.objects.get(username='newcandidate2')
        self.assertEqual(user.profile.country, 'Bangladesh')
        self.assertEqual(user.profile.country_source, UserProfile.CountrySource.USER)
        self.assertFalse(user.profile.needs_country_confirmation)

    def test_otp_registration_requires_and_preserves_country(self):
        """OTP signup flow requires country and preserves it on verification."""
        # 1. Without country -> rejected
        bad_otp_res = self.client.post(self.send_otp_url, {
            'username': 'otpcandidate',
            'email': 'otp@example.com',
            'password': 'SecurePassword2026!',
            'password_confirm': 'SecurePassword2026!'
        }, format='json')
        self.assertEqual(bad_otp_res.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. With country -> accepted
        good_otp_res = self.client.post(self.send_otp_url, {
            'username': 'otpcandidate',
            'email': 'otp@example.com',
            'country': 'Myanmar',
            'password': 'SecurePassword2026!',
            'password_confirm': 'SecurePassword2026!'
        }, format='json')
        self.assertEqual(good_otp_res.status_code, status.HTTP_200_OK)

        otp_record = EmailVerificationOTP.objects.get(email='otp@example.com')
        self.assertEqual(otp_record.country, 'Myanmar')

        # 3. Verify OTP -> creates user with country & source 'user'
        verify_res = self.client.post(self.verify_otp_url, {
            'email': 'otp@example.com',
            'otp_code': otp_record.otp_code
        }, format='json')
        self.assertEqual(verify_res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username='otpcandidate')
        self.assertEqual(user.profile.country, 'Myanmar')
        self.assertEqual(user.profile.country_source, UserProfile.CountrySource.USER)

    def test_existing_users_without_country_can_still_log_in(self):
        """Existing users whose country is NULL can log in normally without errors."""
        existing_user = User.objects.create_user(
            username='legacy_student',
            email='legacy@example.com',
            password='LegacyPassword123!'
        )
        profile, _ = UserProfile.objects.get_or_create(user=existing_user)
        profile.country = None
        profile.country_source = UserProfile.CountrySource.UNKNOWN
        profile.save()

        response = self.client.post(self.login_url, {
            'username': 'legacy_student',
            'password': 'LegacyPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        user_data = response.data['user']
        self.assertIsNone(user_data['profile']['country'])
        self.assertTrue(user_data['profile']['needs_country_confirmation'])

    def test_client_ip_recorded_on_login(self):
        """Client IP is recorded to profile.last_known_ip on successful login."""
        user = User.objects.create_user(
            username='iploguser',
            email='iplog@example.com',
            password='ValidPassword123!'
        )
        self.client.post(
            self.login_url,
            {'username': 'iploguser', 'password': 'ValidPassword123!'},
            format='json',
            REMOTE_ADDR='203.0.113.195'
        )
        user.refresh_from_db()
        self.assertEqual(user.profile.last_known_ip, '203.0.113.195')

    def test_confirm_country_endpoint_transitions_source_to_user(self):
        """User confirms country -> country_source becomes 'user' and confirmation flag clears."""
        user = User.objects.create_user(
            username='confirm_user',
            email='confirm@example.com',
            password='ValidPassword123!'
        )
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.country = 'Bangladesh'
        profile.country_source = UserProfile.CountrySource.IP
        profile.save()
        self.assertTrue(profile.needs_country_confirmation)

        self.client.force_authenticate(user=user)
        response = self.client.post(self.confirm_country_url, {'country': 'Japan'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile.refresh_from_db()
        self.assertEqual(profile.country, 'Japan')
        self.assertEqual(profile.country_source, UserProfile.CountrySource.USER)
        self.assertFalse(profile.needs_country_confirmation)

    def test_user_profile_put_updates_country_and_marks_user_source(self):
        """Updating country via PUT /api/auth/profile/ updates country and sets source to user."""
        user = User.objects.create_user(
            username='profile_put_user',
            email='putuser@example.com',
            password='ValidPassword123!'
        )
        self.client.force_authenticate(user=user)
        response = self.client.put(self.profile_url, {'country': 'Vietnam'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertEqual(user.profile.country, 'Vietnam')
        self.assertEqual(user.profile.country_source, UserProfile.CountrySource.USER)

    @patch('accounts.management.commands.backfill_user_countries.lookup_ip_country')
    def test_backfill_management_command_preserves_user_and_handles_unknown_without_guessing(self, mock_lookup):
        """
        Backfill command:
        - Preserves user-confirmed countries
        - Sets IP estimated countries with country_source='ip'
        - Leaves unknown IPs as country=None, country_source='unknown' without guessing
        """
        # User 1: Explicit user selection
        u1 = User.objects.create_user(username='u1_explicit', email='u1@test.com', password='password123')
        p1, _ = UserProfile.objects.get_or_create(user=u1)
        p1.country = 'Bangladesh'
        p1.country_source = UserProfile.CountrySource.USER
        p1.save()

        # User 2: Known IP with successful geolocation
        u2 = User.objects.create_user(username='u2_ip', email='u2@test.com', password='password123')
        p2, _ = UserProfile.objects.get_or_create(user=u2)
        p2.last_known_ip = '103.100.100.1'
        p2.country = None
        p2.country_source = UserProfile.CountrySource.UNKNOWN
        p2.save()

        # User 3: No IP / undetectable
        u3 = User.objects.create_user(username='u3_no_ip', email='u3@test.com', password='password123')
        p3, _ = UserProfile.objects.get_or_create(user=u3)
        p3.last_known_ip = None
        p3.country = None
        p3.country_source = UserProfile.CountrySource.UNKNOWN
        p3.save()

        # Mock IP lookup for User 2
        mock_lookup.side_effect = lambda ip: 'Bangladesh' if ip == '103.100.100.1' else None

        # Execute backfill
        call_command('backfill_user_countries')

        p1.refresh_from_db()
        p2.refresh_from_db()
        p3.refresh_from_db()

        # User 1 preserved
        self.assertEqual(p1.country, 'Bangladesh')
        self.assertEqual(p1.country_source, UserProfile.CountrySource.USER)

        # User 2 populated via IP
        self.assertEqual(p2.country, 'Bangladesh')
        self.assertEqual(p2.country_source, UserProfile.CountrySource.IP)

        # User 3 not guessed, remains NULL and UNKNOWN
        self.assertIsNone(p3.country)
        self.assertEqual(p3.country_source, UserProfile.CountrySource.UNKNOWN)

    def test_check_country_migration_readiness_blocks_when_null_exists(self):
        """check_country_migration exits with error code when NULL records exist."""
        User.objects.create_user(username='null_country_user', email='null@test.com', password='password123')
        with self.assertRaises(SystemExit) as cm:
            call_command('check_country_migration')
        self.assertEqual(cm.exception.code, 1)

    def test_check_country_migration_readiness_succeeds_when_all_populated(self):
        """check_country_migration succeeds with exit code 0 when all users have country."""
        User.objects.all().delete()
        u = User.objects.create_user(username='migrated_user', email='migrated@test.com', password='password123')
        p, _ = UserProfile.objects.get_or_create(user=u)
        p.country = 'Japan'
        p.country_source = UserProfile.CountrySource.USER
        p.save()

        with self.assertRaises(SystemExit) as cm:
            call_command('check_country_migration')
        self.assertEqual(cm.exception.code, 0)
