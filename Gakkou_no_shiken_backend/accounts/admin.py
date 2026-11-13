import secrets
from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.html import format_html, escape
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.db.models import Count, Max, Case, When, Value, IntegerField
from .models import (
    UserProfile,
    PasswordResetToken,
    SupportThread,
    SupportMessage,
    PartnerSchool,
    PartnerApplication,
)

from accounts.geolocation import COUNTRY_FLAG_MAP, get_country_flag as get_flag


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
        'game_xp',
        'game_level',
        'game_streak',
        'game_words_mastered',
        'game_last_played',
        'partner_school',
        'partner_batch',
        'student_roll_or_id',
        'partner_joined_at',
    )
    readonly_fields = ('country_source', 'country_confirmation_status', 'last_known_ip', 'partner_joined_at')

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
        'partner_school_badge',
        'exam_activity',
        'game_stats_badge',
        'target_exam_badge',
        'role_badge',
        'status_pill',
        'date_joined_formatted',
    )
    list_filter = (
        'is_staff',
        'is_superuser',
        'is_active',
        'profile__partner_school',
        'profile__partner_batch',
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
        'profile__partner_school__name',
        'profile__partner_batch',
        'profile__student_roll_or_id',
    )
    ordering = ('-date_joined',)
    list_per_page = 25

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('profile', 'profile__partner_school').annotate(
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

    def partner_school_badge(self, obj):
        profile = getattr(obj, 'profile', None)
        school = getattr(profile, 'partner_school', None) if profile else None
        if not school:
            return format_html('<span class="text-muted" style="font-size:0.75rem;">Public / Independent</span>')
        batch = profile.partner_batch or 'Default'
        return format_html(
            '<span class="badge bg-info text-dark" style="font-size:11px;">🏫 {} <span style="opacity:0.75;">({})</span></span>',
            school.name,
            batch,
        )
    partner_school_badge.short_description = 'School / LPK'
    partner_school_badge.admin_order_field = 'profile__partner_school__name'

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

    def game_stats_badge(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or profile.game_xp == 0:
            return format_html('<span class="badge bg-secondary opacity-50">No Games</span>')
        return format_html(
            '<span class="badge bg-danger text-white border border-danger font-weight-bold" style="font-size:11px;">'
            '<i class="fas fa-gamepad me-1"></i> Lvl {} • {} XP <span class="ms-1 opacity-75">🔥{}d</span>'
            '</span>',
            profile.game_level,
            profile.game_xp,
            profile.game_streak
        )
    game_stats_badge.short_description = 'Game Zone Stats'
    game_stats_badge.admin_order_field = 'profile__game_xp'

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


class SupportThreadAdminForm(forms.ModelForm):
    admin_reply_text = forms.CharField(
        required=False,
        label='✍️ Write a Reply to Candidate',
        widget=forms.Textarea(attrs={
            'rows': 4,
            'placeholder': 'Type your reply here and click "Save" or "Save and continue editing" to send immediately to the student\'s floating chat widget...',
            'style': 'width:100%; max-width:850px; border-radius:10px; padding:12px; font-size:14px; border:2px solid #0ea5e9;',
        }),
        help_text='When you save this thread with text in this box, a reply message will be sent to the candidate\'s chat widget and the thread status will update to "Replied".'
    )

    class Meta:
        model = SupportThread
        fields = ('user', 'status', 'admin_reply_text')


@admin.register(SupportThread)
class SupportThreadAdmin(admin.ModelAdmin):
    form = SupportThreadAdminForm
    list_display = (
        'candidate_badge',
        'status_pill',
        'unread_badge',
        'last_message_snippet',
        'message_count_badge',
        'last_message_at_formatted',
        'reply_action_btn',
    )
    list_filter = ('status', 'last_message_at', 'created_at')
    search_fields = (
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'last_message_preview',
        'messages__body',
    )
    readonly_fields = ('conversation_history_panel', 'unread_by_admin', 'unread_by_user', 'last_message_at', 'created_at', 'updated_at')
    fieldsets = (
        ('💬 Live Conversation & Quick Reply', {
            'fields': ('conversation_history_panel', 'admin_reply_text', 'status'),
            'description': 'Review the candidate\'s message history below and send a reply directly from this console.'
        }),
        ('📋 Thread Metadata', {
            'fields': ('user', 'unread_by_admin', 'unread_by_user', 'last_message_at', 'created_at'),
            'classes': ('collapse',),
        }),
    )
    actions = ['mark_threads_resolved', 'mark_threads_needs_reply']
    list_per_page = 25

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'user__profile').annotate(
            total_messages=Count('messages', distinct=True),
            needs_reply_rank=Case(
                When(status=SupportThread.Status.NEEDS_REPLY, then=Value(0)),
                When(status=SupportThread.Status.REPLIED, then=Value(1)),
                default=Value(2),
                output_field=IntegerField(),
            ),
        ).order_by('needs_reply_rank', '-last_message_at')

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        if object_id and request.method == 'GET':
            SupportThread.objects.filter(pk=object_id, unread_by_admin__gt=0).update(unread_by_admin=0)
        return super().changeform_view(request, object_id, form_url, extra_context)

    def save_model(self, request, obj, form, change):
        reply_text = (form.cleaned_data.get('admin_reply_text') or '').strip()
        if reply_text:
            sender_label = (
                f"{request.user.first_name} {request.user.last_name}".strip()
                or request.user.username
                or "Gakkou Support Team"
            )
            now = timezone.now()
            obj.status = SupportThread.Status.REPLIED
            obj.unread_by_admin = 0
            obj.unread_by_user = (obj.unread_by_user or 0) + 1
            obj.last_message_preview = f"[Support] {reply_text[:240]}"
            obj.last_message_at = now
            super().save_model(request, obj, form, change)
            SupportMessage.objects.create(
                thread=obj,
                sender_type=SupportMessage.SenderType.ADMIN,
                sender_name=f"{sender_label} (Support)",
                body=reply_text[:1000],
            )
            self.message_user(
                request,
                f"✅ Reply sent to @{obj.user.username}! They will see it in their floating chat widget.",
                level=messages.SUCCESS,
            )
        else:
            obj.unread_by_admin = 0
            super().save_model(request, obj, form, change)

    def candidate_badge(self, obj):
        user = obj.user
        profile = getattr(user, 'profile', None)
        country = profile.country if profile and profile.country else None
        flag = get_flag(country) if country else '🌐'
        full_name = f"{user.first_name} {user.last_name}".strip()
        url = reverse('admin:accounts_supportthread_change', args=[obj.id])
        return format_html(
            '<div style="display:flex; align-items:center; gap:10px;">'
            '<span style="font-size:1.25rem;">{}</span>'
            '<div>'
            '<a href="{}" style="font-weight:700; color:#38bdf8; text-decoration:none; font-size:0.92rem;">@{}</a>'
            '<div style="font-size:0.75rem; color:#94a3b8;">{}</div>'
            '</div>'
            '</div>',
            flag,
            url,
            user.username,
            full_name or user.email or 'Candidate',
        )
    candidate_badge.short_description = 'Candidate'
    candidate_badge.admin_order_field = 'user__username'

    def status_pill(self, obj):
        if obj.status == SupportThread.Status.NEEDS_REPLY:
            return format_html(
                '<span class="badge bg-danger text-white" style="font-size:11px; padding:5px 10px; border-radius:999px;">'
                '<i class="fas fa-bell me-1"></i> Needs Reply</span>'
            )
        if obj.status == SupportThread.Status.REPLIED:
            return format_html(
                '<span class="badge bg-info text-white" style="font-size:11px; padding:5px 10px; border-radius:999px;">'
                '<i class="fas fa-reply me-1"></i> Replied</span>'
            )
        return format_html(
            '<span class="badge bg-success text-white" style="font-size:11px; padding:5px 10px; border-radius:999px;">'
            '<i class="fas fa-check-circle me-1"></i> Resolved</span>'
        )
    status_pill.short_description = 'Status'
    status_pill.admin_order_field = 'status'

    def unread_badge(self, obj):
        if obj.unread_by_admin > 0:
            return format_html(
                '<span class="badge bg-warning text-dark font-weight-bold" style="font-size:11px; padding:4px 9px; border-radius:999px;">'
                '{} new from user</span>',
                obj.unread_by_admin,
            )
        return format_html('<span style="color:#64748b; font-size:12px;">All read</span>')
    unread_badge.short_description = 'Admin Unread'
    unread_badge.admin_order_field = 'unread_by_admin'

    def last_message_snippet(self, obj):
        preview = obj.last_message_preview or '—'
        short = preview if len(preview) <= 85 else f"{preview[:82]}..."
        return format_html(
            '<div style="max-width:360px; font-size:0.84rem; color:#e2e8f0; line-height:1.35;">{}</div>',
            short,
        )
    last_message_snippet.short_description = 'Latest Message'

    def message_count_badge(self, obj):
        total = getattr(obj, 'total_messages', None)
        if total is None:
            total = obj.messages.count()
        return format_html(
            '<span class="badge bg-secondary" style="font-size:11px;">{} msgs</span>',
            total,
        )
    message_count_badge.short_description = 'Messages'

    def last_message_at_formatted(self, obj):
        if not obj.last_message_at:
            return '—'
        local_dt = timezone.localtime(obj.last_message_at)
        return format_html(
            '<div style="font-size:0.82rem; font-weight:600;">{}</div>'
            '<div style="font-size:0.72rem; color:#64748b;">{}</div>',
            local_dt.strftime('%b %d, %Y'),
            local_dt.strftime('%H:%M'),
        )
    last_message_at_formatted.short_description = 'Last Activity'
    last_message_at_formatted.admin_order_field = 'last_message_at'

    def reply_action_btn(self, obj):
        url = reverse('admin:accounts_supportthread_change', args=[obj.id])
        label = 'Reply Now' if obj.status == SupportThread.Status.NEEDS_REPLY else 'Open Chat'
        btn_style = (
            'background:#ef4444; color:#fff;'
            if obj.status == SupportThread.Status.NEEDS_REPLY
            else 'background:#0284c7; color:#fff;'
        )
        return format_html(
            '<a href="{}" style="{} padding:5px 12px; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none; display:inline-block;">'
            '<i class="fas fa-comments me-1"></i> {}</a>',
            url,
            btn_style,
            label,
        )
    reply_action_btn.short_description = 'Action'

    def conversation_history_panel(self, obj):
        if not obj or not obj.pk:
            return "Save the thread first to view messages."
        msgs = list(obj.messages.order_by('created_at', 'id'))
        if not msgs:
            return mark_safe('<div style="padding:16px; color:#94a3b8;">No messages in this thread yet.</div>')

        bubbles = []
        for m in msgs:
            local_dt = timezone.localtime(m.created_at).strftime('%b %d, %Y • %H:%M')
            safe_body = escape(m.body).replace('\n', '<br>')
            safe_sender = escape(m.sender_name or m.get_sender_type_display())

            if m.sender_type == SupportMessage.SenderType.USER:
                bubbles.append(
                    f'<div style="display:flex; flex-direction:column; align-items:flex-start; margin-bottom:12px;">'
                    f'<div style="font-size:11px; color:#94a3b8; margin-bottom:3px; font-weight:600;">👤 {safe_sender} • {local_dt}</div>'
                    f'<div style="background:#1e293b; color:#f8fafc; border:1px solid #334155; padding:10px 14px; border-radius:14px 14px 14px 4px; max-width:75%; font-size:13.5px; line-height:1.5;">'
                    f'{safe_body}</div></div>'
                )
            elif m.sender_type == SupportMessage.SenderType.ADMIN:
                bubbles.append(
                    f'<div style="display:flex; flex-direction:column; align-items:flex-end; margin-bottom:12px;">'
                    f'<div style="font-size:11px; color:#38bdf8; margin-bottom:3px; font-weight:600;">🛡️ {safe_sender} • {local_dt}</div>'
                    f'<div style="background:#0284c7; color:#ffffff; padding:10px 14px; border-radius:14px 14px 4px 14px; max-width:75%; font-size:13.5px; line-height:1.5;">'
                    f'{safe_body}</div></div>'
                )
            else:
                bubbles.append(
                    f'<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:12px;">'
                    f'<div style="background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); padding:7px 14px; border-radius:999px; font-size:12px; max-width:85%; text-align:center;">'
                    f'🤖 {safe_body}</div></div>'
                )

        html = (
            '<div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:18px; max-width:850px; max-height:460px; overflow-y:auto;">'
            + "".join(bubbles)
            + '</div>'
        )
        return mark_safe(html)
    conversation_history_panel.short_description = 'Chat History'

    @admin.action(description='✅ Mark selected threads as Resolved')
    def mark_threads_resolved(self, request, queryset):
        updated = queryset.update(status=SupportThread.Status.RESOLVED, unread_by_admin=0)
        self.message_user(request, f"{updated} thread(s) marked as Resolved.", level=messages.SUCCESS)

    @admin.action(description='🔴 Mark selected threads as Needs Reply')
    def mark_threads_needs_reply(self, request, queryset):
        updated = queryset.update(status=SupportThread.Status.NEEDS_REPLY)
        self.message_user(request, f"{updated} thread(s) marked as Needs Reply.", level=messages.WARNING)


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'thread_user', 'sender_type_badge', 'short_body', 'created_at')
    list_filter = ('sender_type', 'created_at')
    search_fields = ('thread__user__username', 'thread__user__email', 'sender_name', 'body')
    readonly_fields = ('created_at',)

    def thread_user(self, obj):
        url = reverse('admin:accounts_supportthread_change', args=[obj.thread_id])
        return format_html('<a href="{}" style="font-weight:700; color:#38bdf8;">@{}</a>', url, obj.thread.user.username)
    thread_user.short_description = 'Thread (Candidate)'

    def sender_type_badge(self, obj):
        if obj.sender_type == SupportMessage.SenderType.USER:
            return format_html('<span class="badge bg-primary">Candidate</span>')
        if obj.sender_type == SupportMessage.SenderType.ADMIN:
            return format_html('<span class="badge bg-info">Support Admin</span>')
        return format_html('<span class="badge bg-secondary">System Auto</span>')
    sender_type_badge.short_description = 'Sender'

    def short_body(self, obj):
        return obj.body[:100] + ('...' if len(obj.body) > 100 else '')
    short_body.short_description = 'Message'


@admin.register(PartnerSchool)
class PartnerSchoolAdmin(admin.ModelAdmin):
    list_display = (
        'school_card',
        'location_badge',
        'student_count_badge',
        'exclusive_tests_badge',
        'invite_link_action',
        'sensei_dashboard_action',
        'is_active',
        'is_featured',
    )
    list_filter = ('is_active', 'is_featured', 'country', 'created_at')
    search_fields = ('name', 'slug', 'country', 'city', 'contact_person', 'contact_whatsapp_or_email')
    list_editable = ('is_active', 'is_featured')
    readonly_fields = ('access_token', 'student_invite_url_box', 'sensei_dashboard_url_box', 'created_at', 'updated_at')
    fieldsets = (
        ('🏫 Partner School / LPK Profile', {
            'fields': ('name', 'slug', 'country', 'city', 'contact_person', 'contact_whatsapp_or_email', 'website_url', 'welcome_message'),
        }),
        ('🔗 Invite & Sensei Dashboard Links', {
            'fields': ('student_invite_url_box', 'sensei_dashboard_url_box', 'access_token'),
            'description': 'Share the Student Invite URL with the school\'s batches, and give the private Sensei Dashboard URL to their teacher/owner.',
        }),
        ('⚙️ Visibility & Status', {
            'fields': ('is_active', 'is_featured', 'created_at', 'updated_at'),
        }),
    )
    actions = ['regenerate_access_tokens']

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            total_students=Count('students', distinct=True),
            total_tests=Count('exclusive_tests', distinct=True),
        )

    def school_card(self, obj):
        return format_html(
            '<div><strong style="color:#38bdf8; font-size:0.95rem;">🏫 {}</strong>'
            '<div style="font-size:0.75rem; color:#94a3b8;">Slug: <code>{}</code> • {}</div></div>',
            obj.name,
            obj.slug,
            obj.contact_person or obj.contact_whatsapp_or_email or 'Partner Center',
        )
    school_card.short_description = 'School / LPK'
    school_card.admin_order_field = 'name'

    def location_badge(self, obj):
        flag = get_flag(obj.country) if obj.country else '🌐'
        loc = f"{obj.city}, {obj.country}" if obj.city else (obj.country or '—')
        return format_html('<span style="font-weight:600;">{} {}</span>', flag, loc)
    location_badge.short_description = 'Location'
    location_badge.admin_order_field = 'country'

    def student_count_badge(self, obj):
        count = getattr(obj, 'total_students', 0)
        url = reverse('admin:auth_user_changelist') + f"?profile__partner_school__id__exact={obj.id}"
        return format_html(
            '<a href="{}" class="badge bg-primary" style="font-size:11px; text-decoration:none;">👥 {} students</a>',
            url, count,
        )
    student_count_badge.short_description = 'Enrolled Students'

    def exclusive_tests_badge(self, obj):
        count = getattr(obj, 'total_tests', 0)
        url = reverse('admin:tests_test_changelist') + f"?partner_school__id__exact={obj.id}"
        return format_html(
            '<a href="{}" class="badge bg-dark border border-secondary text-info" style="font-size:11px; text-decoration:none;">📝 {} private tests</a>',
            url, count,
        )
    exclusive_tests_badge.short_description = 'School Tests'

    def invite_link_action(self, obj):
        invite_url = f"https://www.gakkounoshiken.site/?partner={obj.slug}"
        return format_html(
            '<a href="{}" target="_blank" style="background:#0f172a; color:#38bdf8; border:1px solid #334155; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">'
            '🔗 ?partner={}</a>',
            invite_url, obj.slug,
        )
    invite_link_action.short_description = 'Student Invite Link'

    def sensei_dashboard_action(self, obj):
        dash_url = f"https://www.gakkounoshiken.site/partner/{obj.slug}?key={obj.access_token}"
        return format_html(
            '<a href="{}" target="_blank" style="background:#059669; color:#ffffff; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none;">'
            '📊 Open Sensei Portal ↗</a>',
            dash_url,
        )
    sensei_dashboard_action.short_description = 'Sensei Scoreboard'

    def student_invite_url_box(self, obj):
        if not obj or not obj.slug:
            return "Save this school first to generate the student invite URL."
        url = f"https://www.gakkounoshiken.site/?partner={obj.slug}"
        return format_html(
            '<code style="padding:8px 12px; background:#0f172a; color:#38bdf8; border-radius:8px; display:inline-block; user-select:all;">{}</code>'
            '<div style="font-size:11px; color:#94a3b8; margin-top:4px;">Tip: Append <code>&amp;batch=Batch-12</code> for cohort tracking!</div>',
            url,
        )
    student_invite_url_box.short_description = 'Student Invite URL'

    def sensei_dashboard_url_box(self, obj):
        if not obj or not obj.slug:
            return "Save this school first to generate the private Sensei Dashboard URL."
        url = f"https://www.gakkounoshiken.site/partner/{obj.slug}?key={obj.access_token}"
        return format_html(
            '<code style="padding:8px 12px; background:#0f172a; color:#34d399; border-radius:8px; display:inline-block; user-select:all;">{}</code>'
            '<div style="font-size:11px; color:#94a3b8; margin-top:4px;">Share ONLY with this school\'s Sensei/Owner.</div>',
            url,
        )
    sensei_dashboard_url_box.short_description = 'Private Sensei Dashboard URL'

    @admin.action(description='🔄 Regenerate Sensei Access Token')
    def regenerate_access_tokens(self, request, queryset):
        for school in queryset:
            school.access_token = secrets.token_urlsafe(18)
            school.save(update_fields=['access_token', 'updated_at'])
        self.message_user(request, f"Regenerated access tokens for {queryset.count()} school(s).", level=messages.SUCCESS)


@admin.register(PartnerApplication)
class PartnerApplicationAdmin(admin.ModelAdmin):
    list_display = ('school_name', 'country', 'city', 'contact_name', 'whatsapp_or_phone', 'estimated_students', 'status_badge', 'created_at')
    list_filter = ('status', 'country', 'created_at')
    search_fields = ('school_name', 'contact_name', 'whatsapp_or_phone', 'email', 'city')
    readonly_fields = ('created_at',)
    actions = ['approve_and_create_school']

    def status_badge(self, obj):
        colors = {
            'pending': 'bg-warning text-dark',
            'contacted': 'bg-info text-dark',
            'approved': 'bg-success text-white',
        }
        cls = colors.get(obj.status, 'bg-secondary')
        return format_html('<span class="badge {}">{}</span>', cls, obj.get_status_display())
    status_badge.short_description = 'Status'

    @admin.action(description='✅ Approve & Auto-Create Partner School')
    def approve_and_create_school(self, request, queryset):
        created_count = 0
        for app in queryset:
            existing = PartnerSchool.objects.filter(name__iexact=app.school_name).first()
            if not existing:
                PartnerSchool.objects.create(
                    name=app.school_name,
                    country=app.country,
                    city=app.city,
                    contact_person=app.contact_name,
                    contact_whatsapp_or_email=app.whatsapp_or_phone or app.email,
                    is_active=True,
                    is_featured=True,
                )
                created_count += 1
            app.status = PartnerApplication.Status.APPROVED
            app.save(update_fields=['status'])
        self.message_user(
            request,
            f"Approved {queryset.count()} application(s) and created {created_count} new Partner School(s)!",
            level=messages.SUCCESS,
        )
