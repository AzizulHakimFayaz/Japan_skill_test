from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
