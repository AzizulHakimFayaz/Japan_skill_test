from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Max
from .models import UserProfile, PasswordResetToken

COUNTRY_FLAG_MAP = {
    'Bangladesh': '🇧🇩',
    'Nepal': '🇳🇵',
    'Vietnam': '🇻🇳',
    'Indonesia': '🇮🇩',
    'Japan': '🇯🇵',
    'India': '🇮🇳',
    'Myanmar': '🇲🇲',
    'Sri Lanka': '🇱🇰',
    'Philippines': '🇵🇭',
    'Pakistan': '🇵🇰',
    'Uzbekistan': '🇺🇿',
    'Mongolia': '🇲🇳',
    'Cambodia': '🇰🇭',
    'Thailand': '🇹🇭',
    'China': '🇨🇳',
    'Brazil': '🇧🇷',
    'Peru': '🇵🇪',
}

def get_flag(country):
    if not country:
        return '🌐'
    return COUNTRY_FLAG_MAP.get(country.strip(), '📍')


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Candidate Profile Details'
    fields = (
        'country',
        'country_source',
        'country_confirmation_status',
        'last_known_ip',
        'location',
        'bio',
        'target_exam',
        'japanese_level',
    )
    readonly_fields = ('country_source', 'country_confirmation_status', 'last_known_ip')

    @admin.display(description='Country Confirmation Needed', boolean=True)
    def country_confirmation_status(self, obj):
        if not obj or not getattr(obj, 'pk', None):
            return False
        return obj.needs_country_confirmation



class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = (
        'candidate_card',
        'country_badge',
        'exam_activity',
        'target_exam_badge',
        'role_badge',
        'status_pill',
        'date_joined_formatted',
    )
    list_filter = (
        'is_staff',
        'is_superuser',
        'is_active',
        'profile__country',
        'profile__country_source',
        'profile__target_exam',
        'profile__japanese_level',
        'date_joined',
    )
    search_fields = (
        'username',
        'first_name',
        'last_name',
        'email',
        'profile__country',
        'profile__location',
    )
    ordering = ('-date_joined',)
    list_per_page = 25

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('profile').annotate(
            total_attempts_count=Count('attempt', distinct=True),
            max_exam_score=Max('attempt__score'),
        )

    def candidate_card(self, obj):
        initial = (obj.username[:1] or 'U').upper()
        # Deterministic background color from username
        colors = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']
        color = colors[sum(ord(c) for c in obj.username) % len(colors)]
        
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        name_line = f"<div style='font-size:0.8rem; color:#94a3b8;'>{full_name}</div>" if full_name else ""
        email_line = f"<div class='user-email-text'><i class='fas fa-envelope' style='font-size:10px; margin-right:4px; opacity:0.7;'></i>{obj.email}</div>" if obj.email else ""

        url = reverse('admin:auth_user_change', args=[obj.id])
        return format_html(
            """
            <div class="user-card-cell">
                <div class="user-avatar-pill" style="background:{};">{}</div>
                <div>
                    <a href="{}" class="user-name-link">{}</a>
                    {}
                    {}
                </div>
            </div>
            """,
            color, initial, url, obj.username, format_html(name_line), format_html(email_line)
        )
    candidate_card.short_description = 'Candidate'
    candidate_card.admin_order_field = 'username'

    def country_badge(self, obj):
        profile = getattr(obj, 'profile', None)
        country = profile.country if profile and profile.country else None
        if not country:
            return format_html('<span class="badge bg-secondary opacity-50"><span class="me-1">🌐</span> Not Set</span>')
        
        flag = get_flag(country)
        source = profile.country_source or 'unknown'
        source_badge = ""
        if source == 'user_selected':
            source_badge = "<span class='badge bg-success ms-1' style='font-size:9px; padding:2px 5px;'>Self</span>"
        elif source == 'ip_geolocation':
            source_badge = "<span class='badge bg-info ms-1' style='font-size:9px; padding:2px 5px;'>IP</span>"

        return format_html(
            '<span class="badge-country"><span style="font-size:1.1rem;">{}</span> <span>{}</span>{}</span>',
            flag, country, format_html(source_badge)
        )
    country_badge.short_description = 'Country'
    country_badge.admin_order_field = 'profile__country'

    def exam_activity(self, obj):
        attempts = getattr(obj, 'total_attempts_count', 0)
        if attempts > 0:
            url = reverse('admin:tests_attempt_changelist') + f"?user__id__exact={obj.id}"
            return format_html(
                '<a href="{}" class="badge-attempts" title="Click to view attempts">'
                '<i class="fas fa-bolt text-warning me-1"></i> {} attempts'
                '</a>',
                url, attempts
            )
        return format_html('<span class="badge bg-secondary opacity-50">0 attempts</span>')
    exam_activity.short_description = 'Mock Exams'
    exam_activity.admin_order_field = 'total_attempts_count'

    def target_exam_badge(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile:
            return '—'
        exam = profile.get_target_exam_display() if profile.target_exam else None
        level = profile.get_japanese_level_display() if profile.japanese_level else None
        if not exam and not level:
            return '—'
        
        lines = []
        if exam:
            lines.append(f"<span class='badge bg-dark border border-secondary text-info font-weight-bold'>{exam}</span>")
        if level:
            lines.append(f"<span class='badge bg-secondary ms-1' style='font-size:10px;'>{level}</span>")
        return format_html(" ".join(lines))
    target_exam_badge.short_description = 'Target Exam'
    target_exam_badge.admin_order_field = 'profile__target_exam'

    def role_badge(self, obj):
        if obj.is_superuser:
            return format_html('<span class="badge-role-super"><i class="fas fa-crown me-1"></i> Admin</span>')
        elif obj.is_staff:
            return format_html('<span class="badge-role-staff"><i class="fas fa-shield-alt me-1"></i> Staff</span>')
        return format_html('<span class="badge-role-student"><i class="fas fa-user-graduate me-1"></i> Candidate</span>')
    role_badge.short_description = 'Role'
    role_badge.admin_order_field = 'is_staff'

    def status_pill(self, obj):
        if obj.is_active:
            return format_html('<span class="badge-status-active"><i class="fas fa-circle text-success me-1" style="font-size:7px;"></i> Active</span>')
        return format_html('<span class="badge-status-inactive"><i class="fas fa-circle text-danger me-1" style="font-size:7px;"></i> Inactive</span>')
    status_pill.short_description = 'Status'
    status_pill.admin_order_field = 'is_active'

    def date_joined_formatted(self, obj):
        return format_html(
            '<div style="font-size:0.85rem; font-weight:600; color:#e2e8f0;">{}</div>'
            '<div style="font-size:0.75rem; color:#64748b;">{}</div>',
            obj.date_joined.strftime('%b %d, %Y'),
            obj.date_joined.strftime('%H:%M')
        )
    date_joined_formatted.short_description = 'Joined'
    date_joined_formatted.admin_order_field = 'date_joined'


# Re-register CustomUserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('candidate_link', 'country_display', 'source_badge', 'target_exam', 'japanese_level', 'last_known_ip', 'updated_at')
    list_filter = ('country_source', 'country', 'target_exam', 'japanese_level')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email', 'country', 'location', 'bio')
    readonly_fields = ('created_at', 'updated_at')

    def candidate_link(self, obj):
        user = obj.user
        url = reverse('admin:auth_user_change', args=[user.id])
        return format_html(
            '<a href="{}" style="font-weight:700; color:#38bdf8; text-decoration:none;">{}</a>'
            '<div style="font-size:0.75rem; color:#94a3b8;">{}</div>',
            url, user.username, user.email or '—'
        )
    candidate_link.short_description = 'Candidate'
    candidate_link.admin_order_field = 'user__username'

    def country_display(self, obj):
        if not obj.country:
            return format_html('<span class="text-muted">Not specified</span>')
        flag = get_flag(obj.country)
        return format_html('<span style="font-weight:600;"><span class="me-1">{}</span> {}</span>', flag, obj.country)
    country_display.short_description = 'Country'
    country_display.admin_order_field = 'country'

    def source_badge(self, obj):
        source = obj.country_source or 'unknown'
        if source == 'user_selected':
            return format_html('<span class="badge bg-success">User Selected</span>')
        elif source == 'ip_geolocation':
            return format_html('<span class="badge bg-info">IP Geolocation</span>')
        return format_html('<span class="badge bg-secondary">Unknown</span>')
    source_badge.short_description = 'Source'
    source_badge.admin_order_field = 'country_source'


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user_display', 'status_badge', 'expires_at', 'created_at', 'ip_address')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__username', 'user__email', 'ip_address')
    readonly_fields = ('user', 'token_hash', 'created_at', 'expires_at', 'used_at', 'ip_address')

    def user_display(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.user.id])
        return format_html('<a href="{}" style="color:#38bdf8; font-weight:600;">{}</a> ({})', url, obj.user.username, obj.user.email)
    user_display.short_description = 'Candidate'

    def status_badge(self, obj):
        if obj.is_used:
            return format_html('<span class="badge bg-secondary"><i class="fas fa-check me-1"></i> Used</span>')
        if obj.is_expired():
            return format_html('<span class="badge bg-danger"><i class="fas fa-clock me-1"></i> Expired</span>')
        return format_html('<span class="badge bg-success"><i class="fas fa-key me-1"></i> Active (Valid)</span>')
    status_badge.short_description = 'Status'
