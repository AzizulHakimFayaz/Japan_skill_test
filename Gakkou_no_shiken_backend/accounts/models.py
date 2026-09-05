import hashlib
import random
import secrets
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.hashers import make_password


class UserProfile(models.Model):
    """Extended profile information for students/candidates."""
    
    class TargetExam(models.TextChoices):
        JFT_BASIC = 'jft_basic', 'JFT-Basic (A2 Standard)'
        SSW_NURSING = 'ssw_nursing', 'SSW: Nursing Care (介護)'
        SSW_FOOD = 'ssw_food', 'SSW: Food Service (外食業)'
        SSW_AGRICULTURE = 'ssw_agriculture', 'SSW: Agriculture (農業)'
        SSW_CONSTRUCTION = 'ssw_construction', 'SSW: Construction (建設業)'
        SSW_MANUFACTURING = 'ssw_manufacturing', 'SSW: Manufacturing (製造業)'
        SSW_ACCOMMODATION = 'ssw_accommodation', 'SSW: Accommodation (宿泊業)'
        JLPT_N4 = 'jlpt_n4', 'JLPT N4'
        JLPT_N3 = 'jlpt_n3', 'JLPT N3'
        OTHER = 'other', 'Other Examination'

    class JapaneseLevel(models.TextChoices):
        N5 = 'n5', 'Beginner (N5 / A1)'
        N4 = 'n4', 'Elementary (N4 / A2)'
        N3 = 'n3', 'Intermediate (N3 / B1)'
        N2 = 'n2', 'Upper Intermediate (N2 / B2)'
        N1 = 'n1', 'Advanced (N1 / C1)'

    class CountrySource(models.TextChoices):
        USER = 'user', 'User Selected'
        IP = 'ip', 'IP Estimated'
        UNKNOWN = 'unknown', 'Unknown'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, default='', help_text="Short candidate introduction or learning target.")
    target_exam = models.CharField(
        max_length=40,
        choices=TargetExam.choices,
        default=TargetExam.JFT_BASIC,
        blank=True
    )
    japanese_level = models.CharField(
        max_length=20,
        choices=JapaneseLevel.choices,
        default=JapaneseLevel.N4,
        blank=True
    )
    location = models.CharField(max_length=100, blank=True, default='', help_text="Country or City (e.g. Dhaka, Yangon, Jakarta)")
    
    # Country registration & migration fields (initially nullable for existing users)
    country = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Candidate's country of residence or nationality"
    )
    country_source = models.CharField(
        max_length=20,
        choices=CountrySource.choices,
        default=CountrySource.UNKNOWN,
        help_text="Source of the country information: user (explicit), ip (estimated), unknown"
    )
    last_known_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Last recorded client IP address for security audit & geolocation"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def needs_country_confirmation(self):
        """Returns True if the user needs to confirm or provide their country."""
        return self.country_source in [self.CountrySource.IP, self.CountrySource.UNKNOWN] or not self.country

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    """Automatically create or get UserProfile whenever a User is created."""
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Ensure profile exists even for previously created users
        UserProfile.objects.get_or_create(user=instance)


class EmailVerificationOTP(models.Model):
    """Stores temporary 6-digit verification code and pending candidate registration data."""
    email = models.EmailField(db_index=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    username = models.CharField(max_length=150, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    password_hash = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=15)

    @classmethod
    def create_otp(cls, email, username='', first_name='', last_name='', password='', country=''):
        try:
            cls.objects.filter(email__iexact=email).delete()
        except Exception:
            pass
        code = f"{random.randint(100000, 999999)}"
        return cls.objects.create(
            email=email.strip().lower(),
            otp_code=code,
            username=username.strip(),
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            password_hash=make_password(password) if password else '',
            country=country.strip() if country else ''
        )

    def __str__(self):
        return f"OTP for {self.email} ({self.otp_code})"


class PasswordResetToken(models.Model):
    """
    Stores cryptographically secure hashes of single-use password reset tokens.
    Raw tokens are NEVER saved to the database.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token_hash = models.CharField(max_length=64, db_index=True, help_text="SHA-256 hash of the raw token")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="IP address where reset was requested")

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token_hash', 'is_used']),
        ]

    def is_expired(self):
        return timezone.now() > self.expires_at

    @staticmethod
    def hash_raw_token(raw_token: str) -> str:
        """Computes SHA-256 hex digest of a raw token string."""
        return hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()

    @classmethod
    def create_token(cls, user, ip_address=None, timeout_minutes=15):
        """
        Invalidates any pending unused tokens for this user, generates a new
        cryptographically random URL-safe token, and stores only its SHA-256 hash.
        Returns tuple of (PasswordResetToken instance, raw_token_string).
        """
        # Invalidate previous unused tokens for this user
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        raw_token = secrets.token_urlsafe(32)
        token_hash = cls.hash_raw_token(raw_token)
        expires_at = timezone.now() + timedelta(minutes=timeout_minutes)

        token_obj = cls.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            is_used=False
        )
        return token_obj, raw_token

    def mark_as_used(self):
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])

    def __str__(self):
        status = "Used" if self.is_used else ("Expired" if self.is_expired() else "Active")
        return f"PasswordResetToken for {self.user.username} ({status})"



