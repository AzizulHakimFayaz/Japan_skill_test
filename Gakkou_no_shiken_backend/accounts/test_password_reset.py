import re
from datetime import timedelta
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import PasswordResetToken, UserProfile
from accounts.tokens import hash_token


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user_password = "OldStrongPassword123!"
        self.user = User.objects.create_user(
            username="testcandidate",
            email="candidate@example.com",
            password=self.user_password,
            first_name="Kenji",
            last_name="Sato"
        )
        UserProfile.objects.get_or_create(user=self.user)
        self.forgot_url = reverse('api_forgot_password')
        self.reset_url = reverse('api_reset_password')
        mail.outbox = []
        from django.core.cache import cache
        cache.clear()

    def test_forgot_password_valid_email(self):
        """Valid registered email receives reset email and generic anti-enumeration response."""
        response = self.client.post(self.forgot_url, {'email': 'candidate@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data.get('message'),
            "If an account exists for this email, a password reset link has been sent."
        )

        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("candidate@example.com", sent_email.to)
        self.assertIn("Reset Your Password", sent_email.subject)
        self.assertIn("/reset-password?token=", sent_email.body)

        # Verify token in database is hashed with SHA-256 and raw token is NOT stored
        token_record = PasswordResetToken.objects.filter(user=self.user).first()
        self.assertIsNotNone(token_record)
        self.assertFalse(token_record.is_used)
        self.assertEqual(len(token_record.token_hash), 64)

        # Extract raw token from email body
        match = re.search(r'token=([A-Za-z0-9_\-]+)', sent_email.body)
        self.assertIsNotNone(match)
        raw_token = match.group(1)
        self.assertEqual(hash_token(raw_token), token_record.token_hash)
        self.assertNotEqual(raw_token, token_record.token_hash)

    def test_forgot_password_non_existent_email_returns_identical_generic_response(self):
        """Non-existent email receives the exact same response to prevent user enumeration."""
        response = self.client.post(self.forgot_url, {'email': 'nonexistent@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data.get('message'),
            "If an account exists for this email, a password reset link has been sent."
        )

        # No email should be sent and no token created
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(PasswordResetToken.objects.count(), 0)

    def test_forgot_password_invalid_email_format(self):
        """Malformed email format returns 400 bad request."""
        response = self.client.post(self.forgot_url, {'email': 'invalid-email-format'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_success_workflow(self):
        """User successfully resets password with valid token: old password stops working, new works, token marked used."""
        # 1. Request reset
        self.client.post(self.forgot_url, {'email': 'candidate@example.com'}, format='json')
        match = re.search(r'token=([A-Za-z0-9_\-]+)', mail.outbox[0].body)
        raw_token = match.group(1)

        # 2. Reset password
        new_password = "NewSuperSecurePassword2026!"
        reset_response = self.client.post(self.reset_url, {
            'token': raw_token,
            'password': new_password,
            'password_confirm': new_password
        }, format='json')
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)

        # 3. Old password must NO LONGER work
        self.assertIsNone(authenticate(username="testcandidate", password=self.user_password))

        # 4. New password MUST work
        authenticated_user = authenticate(username="testcandidate", password=new_password)
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.id, self.user.id)

        # 5. Token record is marked as used
        token_record = PasswordResetToken.objects.get(user=self.user)
        self.assertTrue(token_record.is_used)
        self.assertIsNotNone(token_record.used_at)

        # 6. Token CANNOT be reused
        reuse_response = self.client.post(self.reset_url, {
            'token': raw_token,
            'password': "AnotherPassword123!"
        }, format='json')
        self.assertEqual(reuse_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been used", reuse_response.data.get('detail', ''))

    def test_reset_password_expired_token(self):
        """Expired reset token is rejected."""
        token_obj, raw_token = PasswordResetToken.create_token(self.user, timeout_minutes=15)
        # Fast-forward token into the past
        token_obj.expires_at = timezone.now() - timedelta(minutes=5)
        token_obj.save()

        response = self.client.post(self.reset_url, {
            'token': raw_token,
            'password': "ValidPassword123!"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expired", response.data.get('detail', ''))

    def test_reset_password_tampered_token(self):
        """Tampered or invalid reset token is rejected."""
        PasswordResetToken.create_token(self.user, timeout_minutes=15)
        response = self.client.post(self.reset_url, {
            'token': "completely_fake_invalid_token_xyz12345",
            'password': "ValidPassword123!"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid or expired", response.data.get('detail', ''))

    def test_reset_password_complexity_validation(self):
        """Password complexity rules are enforced."""
        token_obj, raw_token = PasswordResetToken.create_token(self.user, timeout_minutes=15)
        response = self.client.post(self.reset_url, {
            'token': raw_token,
            'password': "123"  # too short
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_password_hashing_security(self):
        """Verifies that updated password is cryptographically hashed with PBKDF2."""
        token_obj, raw_token = PasswordResetToken.create_token(self.user, timeout_minutes=15)
        new_password = "SecurePasswordHashTest99!"
        self.client.post(self.reset_url, {
            'token': raw_token,
            'password': new_password
        }, format='json')

        self.user.refresh_from_db()
        self.assertTrue(self.user.password.startswith('pbkdf2_sha256$'))
        self.assertNotIn(new_password, self.user.password)

    def test_email_rate_limiting_prevents_inbox_flooding(self):
        """Exceeding email reset limits prevents spamming emails while returning generic success."""
        email = "candidate@example.com"
        for i in range(3):
            self.client.post(self.forgot_url, {'email': email}, format='json')
        self.assertEqual(len(mail.outbox), 3)

        # 4th request within window -> should NOT send email, but still return 200 generic message
        response = self.client.post(self.forgot_url, {'email': email}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data.get('message'),
            "If an account exists for this email, a password reset link has been sent."
        )
        self.assertEqual(len(mail.outbox), 3)  # No extra email dispatched
