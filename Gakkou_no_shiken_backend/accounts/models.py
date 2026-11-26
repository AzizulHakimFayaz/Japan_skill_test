import hashlib
import random
import secrets
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password


class PartnerSchool(models.Model):
    """Partner Japanese Language School / LPK / Review Center for B2B2C batch tracking."""

    name = models.CharField(max_length=200)
    slug = models.SlugField(
        max_length=120,
        unique=True,
        db_index=True,
        blank=True,
        help_text="URL invite slug (e.g. lpk-sakura). Auto-generated if left blank.",
    )
    country = models.CharField(max_length=100, default='Indonesia')
    city = models.CharField(max_length=100, blank=True, default='')
    contact_person = models.CharField(max_length=150, blank=True, default='')
    contact_whatsapp_or_email = models.CharField(max_length=200, blank=True, default='')
    website_url = models.URLField(max_length=500, blank=True, default='')
    welcome_message = models.CharField(
        max_length=300,
        blank=True,
        default='',
        help_text="Optional custom message shown to your students when they open the invite link.",
    )
    access_token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        blank=True,
        help_text="Secret Sensei Dashboard key (?key=...). Auto-generated on save.",
    )
    owner = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='owned_partner_schools',
        help_text="Optional website user account (Sensei/Owner) who can log into this school's portal directly.",
    )
    join_code = models.CharField(
        max_length=16,
        blank=True,
        default='',
        db_index=True,
        help_text="6-digit rotating Class Join PIN (e.g. 482910) to prevent unauthorized link sharing.",
    )
    require_join_pin = models.BooleanField(
        default=True,
        help_text="If checked, students must enter the 6-digit Class Join PIN to join this school.",
    )
    require_approval = models.BooleanField(
        default=False,
        help_text="If checked, new students who join via link enter Pending status until approved by Sensei.",
    )
    enrollment_locked = models.BooleanField(
        default=False,
        help_text="If checked, no new students can join until unlocked by Sensei.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Show this school on the public Partner Training Centers showcase.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Partner School / LPK'
        verbose_name_plural = 'Partner Schools & LPKs'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:90] or 'partner-school'
            candidate = base
            counter = 1
            while PartnerSchool.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{counter}"
                counter += 1
            self.slug = candidate
        if not self.access_token:
            self.access_token = secrets.token_urlsafe(18)
        if not self.join_code:
            self.join_code = f"{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        loc = f" ({self.city}, {self.country})" if self.city else f" ({self.country})"
        return f"{self.name}{loc}"


class PartnerApplication(models.Model):
    """Inbound partnership inquiry submitted by a Language School / LPK / Review Center."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        CONTACTED = 'contacted', 'Contacted'
        APPROVED = 'approved', 'Approved & Onboarded'

    school_name = models.CharField(max_length=200)
    country = models.CharField(max_length=100, default='Indonesia')
    city = models.CharField(max_length=100, blank=True, default='')
    contact_name = models.CharField(max_length=150)
    whatsapp_or_phone = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    estimated_students = models.PositiveIntegerField(default=30)
    message = models.TextField(max_length=1500, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Partner School Application'
        verbose_name_plural = 'Partner School Applications'

    def __str__(self):
        return f"{self.school_name} ({self.country}) - {self.get_status_display()}"


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

    class PartnerStatus(models.TextChoices):
        APPROVED = 'approved', 'Approved Member'
        PENDING = 'pending', 'Pending Sensei Approval'
        REJECTED = 'rejected', 'Rejected / Blocked'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text="Auto-compressed 256x256 WebP profile avatar (~20 KB).",
    )
    bio = models.TextField(max_length=500, blank=True, default='', help_text="Short candidate introduction or learning target.")
    target_exam = models.CharField(
        max_length=40,
        choices=TargetExam.choices,
        default=TargetExam.JFT_BASIC,
        blank=True
    )
    planned_exam_date = models.DateField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Candidate's planned JFT-Basic / JLPT / SSW exam date (for study planning & peak-month analytics).",
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

    # Game Zone & Arcade Stats
    game_xp = models.PositiveIntegerField(default=0, help_text="Total XP earned across learning games.")
    game_level = models.PositiveIntegerField(default=1, help_text="Calculated Arcade level.")
    game_streak = models.PositiveIntegerField(default=0, help_text="Consecutive days played in Game Zone.")
    game_words_mastered = models.PositiveIntegerField(default=0, help_text="Total vocabulary items matched/mastered.")
    game_last_played = models.DateField(null=True, blank=True, help_text="Last date game was played.")

    # Partner School / LPK Enrollment Tracking
    partner_school = models.ForeignKey(
        PartnerSchool,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='students',
        help_text="Partner language school / LPK this student belongs to.",
    )
    partner_batch = models.CharField(
        max_length=64,
        blank=True,
        default='',
        db_index=True,
        help_text="Batch or cohort label (e.g. Batch-12, Morning-Class).",
    )
    student_roll_or_id = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text="Optional roll number or student ID assigned by their school.",
    )
    partner_status = models.CharField(
        max_length=16,
        choices=PartnerStatus.choices,
        default=PartnerStatus.APPROVED,
        db_index=True,
        help_text="Enrollment approval state for the linked Partner School.",
    )
    partner_joined_at = models.DateTimeField(null=True, blank=True)

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


class SupportThread(models.Model):
    """Persistent 1-to-1 candidate support chat thread."""

    class Status(models.TextChoices):
        NEEDS_REPLY = 'needs_reply', 'Needs Admin Reply'
        REPLIED = 'replied', 'Replied by Admin'
        RESOLVED = 'resolved', 'Resolved / Closed'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='support_thread')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEEDS_REPLY,
        db_index=True,
    )
    subject = models.CharField(max_length=200, blank=True, default='Candidate Support Chat')
    unread_by_admin = models.PositiveIntegerField(default=0)
    unread_by_user = models.PositiveIntegerField(default=0)
    last_message_preview = models.CharField(max_length=255, blank=True, default='')
    last_message_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-unread_by_admin', '-last_message_at']
        verbose_name = 'Support Chat Thread'
        verbose_name_plural = 'Candidate Support Chats'

    def __str__(self):
        return f"Support Chat: {self.user.username} ({self.get_status_display()})"


class SupportMessage(models.Model):
    """Individual message inside a SupportThread."""

    class SenderType(models.TextChoices):
        USER = 'user', 'Candidate'
        ADMIN = 'admin', 'Support Team'
        SYSTEM = 'system', 'System Assistant'

    thread = models.ForeignKey(SupportThread, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(
        max_length=16,
        choices=SenderType.choices,
        default=SenderType.USER,
        db_index=True,
    )
    sender_name = models.CharField(max_length=150, blank=True, default='')
    body = models.TextField(max_length=1500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at', 'id']
        verbose_name = 'Support Message'
        verbose_name_plural = 'Support Messages'

    def __str__(self):
        return f"[{self.sender_type}] {self.sender_name}: {self.body[:40]}"


class PartnerAssignedExam(models.Model):
    """Scheduled or assigned mock exam set by a Partner School / Sensei for their students."""

    school = models.ForeignKey(PartnerSchool, on_delete=models.CASCADE, related_name='assigned_exams')
    test = models.ForeignKey('tests.Test', on_delete=models.CASCADE, related_name='school_assignments')
    title = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Custom exam routine title (defaults to Test title if blank).",
    )
    target_batch = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text="Leave blank for All Batches, or specify e.g. Batch-12.",
    )
    attendance_pin = models.CharField(
        max_length=12,
        blank=True,
        default='',
        help_text="Optional 4-digit Live Exam Room PIN for attendance verification.",
    )
    require_pin = models.BooleanField(
        default=False,
        help_text="If enabled, students must enter the Attendance PIN before starting this assigned exam.",
    )
    instructions = models.CharField(max_length=400, blank=True, default='')
    scheduled_date_label = models.CharField(
        max_length=80,
        blank=True,
        default='',
        help_text="Display schedule label, e.g. 'Friday 10:00 AM' or 'Weekly Assessment'.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    attended_users = models.ManyToManyField(User, blank=True, related_name='attended_partner_exams')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_active', '-created_at']
        verbose_name = 'School Assigned Exam'
        verbose_name_plural = 'School Assigned Exams'

    def save(self, *args, **kwargs):
        if not self.title and self.test_id:
            try:
                self.title = self.test.title
            except Exception:
                pass
        if self.require_pin and not self.attendance_pin:
            self.attendance_pin = f"{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.school.name}] {self.title or 'Assigned Exam'} ({self.target_batch or 'All Batches'})"


class PartnerStudyNote(models.Model):
    """Study note, vocabulary sheet, PDF link, or class routine shared by a Partner School."""

    class Category(models.TextChoices):
        VOCABULARY = 'vocabulary', 'Vocabulary & Kanji'
        GRAMMAR = 'grammar', 'Grammar & Conversation'
        LISTENING = 'listening', 'Listening & Audio Script'
        SSW_SKILL = 'ssw_skill', 'SSW Sector Study Material'
        ROUTINE = 'routine', 'Class Routine & Syllabus'

    school = models.ForeignKey(PartnerSchool, on_delete=models.CASCADE, related_name='study_notes')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.VOCABULARY)
    content = models.TextField(
        blank=True,
        default='',
        help_text="Study note content, vocabulary list, or lesson summary.",
    )
    external_url = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text="Optional Google Drive / PDF / YouTube / Resource link.",
    )
    target_batch = models.CharField(max_length=64, blank=True, default='')
    views_count = models.PositiveIntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']
        verbose_name = 'School Study Note'
        verbose_name_plural = 'School Study Notes'

    def __str__(self):
        return f"[{self.school.name}] {self.title}"


class PartnerNotification(models.Model):
    """Announcement or exam notification sent by a Partner School to its students."""

    class Priority(models.TextChoices):
        NORMAL = 'normal', 'Standard Update'
        IMPORTANT = 'important', 'Important Reminder'
        URGENT = 'urgent', 'Urgent Exam Alert'

    school = models.ForeignKey(PartnerSchool, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField(max_length=1500)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.NORMAL)
    target_batch = models.CharField(max_length=64, blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'School Notification'
        verbose_name_plural = 'School Notifications'

    def __str__(self):
        return f"[{self.school.name}] {self.title}"


class PartnerCourse(models.Model):
    """Structured video course created by a Partner School / Sensei for enrolled students."""

    class Category(models.TextChoices):
        JFT_BASIC = 'jft_basic', 'JFT-Basic (A2)'
        JLPT = 'jlpt', 'JLPT (N5–N1)'
        SSW = 'ssw', 'SSW / Tokutei Ginou'
        CONVERSATION = 'conversation', 'Japanese Conversation'
        KANJI = 'kanji', 'Kanji & Vocabulary'
        GENERAL = 'general', 'General Course'

    school = models.ForeignKey(PartnerSchool, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=220)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.JFT_BASIC)
    level_badge = models.CharField(max_length=32, blank=True, default='N5 • A2')
    instructor_name = models.CharField(max_length=150, blank=True, default='')
    description = models.TextField(blank=True, default='')
    outcomes_text = models.TextField(
        blank=True,
        default='',
        help_text="One learning outcome per line.",
    )
    audience_text = models.TextField(blank=True, default='')
    target_batch = models.CharField(max_length=64, blank=True, default='', db_index=True)
    order_index = models.PositiveIntegerField(default=1)
    is_published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', '-created_at']
        verbose_name = 'Academy Course'
        verbose_name_plural = 'Academy Courses'

    def __str__(self):
        return f"[{self.school.name}] {self.title}"


class PartnerCourseModule(models.Model):
    """Ordered module inside a PartnerCourse (e.g. Module 1: Hiragana & Greetings)."""

    course = models.ForeignKey(PartnerCourse, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=220)
    description = models.CharField(max_length=400, blank=True, default='')
    order_index = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order_index', 'id']
        verbose_name = 'Course Module'
        verbose_name_plural = 'Course Modules'

    def __str__(self):
        return f"{self.course.title} — {self.title}"


class PartnerCourseLesson(models.Model):
    """Individual video lesson inside a PartnerCourseModule (supports URL embed or direct upload)."""

    module = models.ForeignKey(PartnerCourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=220)
    description = models.TextField(blank=True, default='')
    video_url = models.URLField(
        max_length=600,
        blank=True,
        default='',
        help_text="YouTube, Vimeo, Google Drive share link, or direct MP4 URL.",
    )
    video_file = models.FileField(
        upload_to='partner_videos/%Y/%m/',
        blank=True,
        null=True,
        help_text="Optional direct MP4/WebM video file upload.",
    )
    resource_url = models.URLField(
        max_length=600,
        blank=True,
        default='',
        help_text="Optional downloadable PDF, slide deck, or worksheet link.",
    )
    duration_minutes = models.PositiveIntegerField(default=15)
    order_index = models.PositiveIntegerField(default=1)
    is_published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order_index', 'id']
        verbose_name = 'Course Video Lesson'
        verbose_name_plural = 'Course Video Lessons'

    def __str__(self):
        return f"{self.module.title} — {self.title}"


class StudentLessonProgress(models.Model):
    """Tracks per-student completion & watch progress for each academy video lesson."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='partner_lesson_progress')
    lesson = models.ForeignKey(PartnerCourseLesson, on_delete=models.CASCADE, related_name='student_progress')
    is_completed = models.BooleanField(default=True)
    watched_seconds = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')
        verbose_name = 'Student Lesson Progress'
        verbose_name_plural = 'Student Lesson Progress'

    def __str__(self):
        return f"{self.user.username} -> {self.lesson.title} ({'Done' if self.is_completed else 'In Progress'})"


class PartnerCourseDiscussion(models.Model):
    """Course Q&A / discussion message between students and Sensei."""

    class AuthorRole(models.TextChoices):
        STUDENT = 'student', 'Student'
        SENSEI = 'sensei', 'Sensei'

    course = models.ForeignKey(PartnerCourse, on_delete=models.CASCADE, related_name='discussions')
    lesson = models.ForeignKey(
        PartnerCourseLesson,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='discussions',
    )
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    author_name = models.CharField(max_length=150, blank=True, default='')
    author_role = models.CharField(max_length=16, choices=AuthorRole.choices, default=AuthorRole.STUDENT)
    message = models.TextField(max_length=1500)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Course Discussion'
        verbose_name_plural = 'Course Discussions'

    def __str__(self):
        return f"[{self.author_role}] {self.author_name}: {self.message[:40]}"


class PartnerScheduleEvent(models.Model):
    """Live class, mock exam, or study reminder scheduled by a Partner School / Sensei."""

    class EventType(models.TextChoices):
        LIVE_CLASS = 'live_class', 'Live Class'
        MOCK_EXAM = 'mock_exam', 'Mock Exam'
        ASSIGNMENT = 'assignment', 'Assignment / Homework'
        REMINDER = 'reminder', 'Academy Reminder'

    school = models.ForeignKey(PartnerSchool, on_delete=models.CASCADE, related_name='schedule_events')
    title = models.CharField(max_length=200)
    event_type = models.CharField(max_length=24, choices=EventType.choices, default=EventType.LIVE_CLASS)
    event_date = models.DateField(db_index=True)
    start_time_label = models.CharField(max_length=32, blank=True, default='08:00 PM')
    end_time_label = models.CharField(max_length=32, blank=True, default='')
    meeting_url = models.URLField(max_length=500, blank=True, default='')
    target_batch = models.CharField(max_length=64, blank=True, default='')
    notes = models.CharField(max_length=400, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date', 'start_time_label', 'id']
        verbose_name = 'Academy Schedule Event'
        verbose_name_plural = 'Academy Schedule Events'

    def __str__(self):
        return f"[{self.school.name}] {self.event_date} — {self.title}"


class SitePopupNotice(models.Model):
    """Admin-controlled popup notification (shown once a day; user can dismiss forever)."""

    class PopupType(models.TextChoices):
        PROFILE_UPDATE = 'profile_update', 'Profile / Avatar Update Prompt'
        ANNOUNCEMENT = 'announcement', 'General Announcement'
        EXAM_ALERT = 'exam_alert', 'Exam / Registration Alert'
        FEATURE = 'feature', 'New Feature Highlight'

    class TargetAudience(models.TextChoices):
        MISSING_AVATAR = 'missing_avatar_only', 'Logged-in Users Without Profile Photo'
        ALL_LOGGED_IN = 'all_logged_in', 'All Logged-in Users'
        ALL_VISITORS = 'all_visitors', 'All Visitors (Including Guests)'

    title = models.CharField(max_length=180)
    message = models.TextField(max_length=800)
    popup_type = models.CharField(max_length=32, choices=PopupType.choices, default=PopupType.PROFILE_UPDATE)
    target_audience = models.CharField(
        max_length=32,
        choices=TargetAudience.choices,
        default=TargetAudience.MISSING_AVATAR,
    )
    cta_label = models.CharField(max_length=80, blank=True, default='Update My Profile')
    cta_url = models.CharField(max_length=300, blank=True, default='/student-portal?tab=profile')
    priority = models.PositiveIntegerField(default=10, help_text="Higher number shows first.")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Site Popup Notification'
        verbose_name_plural = 'Site Popup Notifications'

    def __str__(self):
        return f"[{self.get_popup_type_display()}] {self.title}"





