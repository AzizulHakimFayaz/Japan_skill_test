from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Candidate Profile Details'
    fields = ('bio', 'target_exam', 'japanese_level', 'location')


class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_target_exam', 'get_level', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__target_exam', 'profile__japanese_level')

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
    list_display = ('user', 'target_exam', 'japanese_level', 'location', 'updated_at')
    list_filter = ('target_exam', 'japanese_level')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email', 'bio', 'location')
    readonly_fields = ('created_at', 'updated_at')
