from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, PasswordResetToken


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Candidate Profile Details'
    fields = ('country', 'country_source', 'last_known_ip', 'location', 'bio', 'target_exam', 'japanese_level')


class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_country', 'get_target_exam', 'get_level', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__country', 'profile__country_source', 'profile__target_exam', 'profile__japanese_level')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'profile__country')

    def get_country(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.country:
            return '—'
        source_label = f" ({profile.country_source})" if profile.country_source else ""
        return f"{profile.country}{source_label}"
    get_country.short_description = 'Country'

    def get_target_exam(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.get_target_exam_display()
    get_target_exam.short_description = 'Target Exam'

    def get_level(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.get_japanese_level_display()
    get_level.short_description = 'Level'


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'country_source', 'last_known_ip', 'target_exam', 'japanese_level', 'updated_at')
    list_filter = ('country_source', 'country', 'target_exam', 'japanese_level')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email', 'country', 'location', 'bio')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_used', 'is_expired_display', 'expires_at', 'created_at', 'ip_address')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__username', 'user__email', 'ip_address')
    readonly_fields = ('user', 'token_hash', 'created_at', 'expires_at', 'used_at', 'ip_address')

    def is_expired_display(self, obj):
        return obj.is_expired()
    is_expired_display.boolean = True
    is_expired_display.short_description = 'Expired'

