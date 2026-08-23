from django.contrib import admin, messages
from django.db import models
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.urls import path, reverse
from django.utils.html import format_html
from .models import Test, Question, QuestionGroup, AnswerOption, Attempt
from .utils import import_questions_from_csv, generate_sample_csv_string



# ─── Inline: Answer Options inside Question ──────────────────────────
class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 4
    min_num = 2
    fields = ('order_index', 'label', 'image', 'image_preview', 'is_correct')
    readonly_fields = ('image_preview',)
    ordering = ('order_index',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="admin-preview-container">'
                '<img src="{}" style="max-height:48px; max-width:80px; border-radius:4px; object-fit:contain;" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span class="text-muted font-italic" style="font-size:0.75rem;">No image</span>')
    image_preview.short_description = 'Preview'

    class Media:
        css = {'all': ('css/admin_custom.css',)}


# ─── Inline: Questions inside Test ───────────────────────────────────
class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    fields = (
        ('section', 'type', 'order_index'),
        'group',
        'instruction',
        'prompt',
        ('image', 'image_preview'),
        ('audio', 'audio_preview'),
        'edit_question_link',
    )


    readonly_fields = ('image_preview', 'audio_preview', 'edit_question_link')
    ordering = ('order_index',)
    raw_id_fields = ('group',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('group')

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="admin-preview-container">'
                '<img src="{}" class="admin-preview-img" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span class="text-muted font-italic">No image uploaded</span>')
    image_preview.short_description = 'Preview'

    def audio_preview(self, obj):
        if obj.audio:
            return format_html(
                '<div class="admin-preview-container">'
                '<audio controls class="admin-preview-audio" src="{}"></audio>'
                '</div>',
                obj.audio.url
            )
        return format_html('<span class="text-muted font-italic">No audio uploaded</span>')
    audio_preview.short_description = 'Preview'

    def edit_question_link(self, obj):
        if obj.id:
            url = reverse('admin:tests_question_change', args=[obj.id])
            return format_html(
                '<a href="{}" target="_blank" class="btn btn-sm btn-primary">'
                '<i class="fas fa-external-link-alt"></i> Edit Answers &amp; Options'
                '</a>',
                url
            )
        return format_html(
            '<span class="text-muted font-weight-bold" style="font-size:0.85rem;">'
            '<i class="fas fa-info-circle"></i> Save this test first to manage answer options'
            '</span>'
        )
    edit_question_link.short_description = 'Actions'


class QuestionGroupInlineForTest(admin.StackedInline):
    model = QuestionGroup
    extra = 0
    fields = ('title', 'instruction', ('image', 'image_preview'), 'order_index', 'edit_group_link')
    readonly_fields = ('image_preview', 'edit_group_link')
    ordering = ('order_index',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="admin-preview-container">'
                '<img src="{}" style="max-height:80px; max-width:120px; border-radius:4px; object-fit:contain;" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span class="text-muted font-italic" style="font-size:0.75rem;">No image uploaded</span>')
    image_preview.short_description = 'Preview'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(q_count=models.Count('questions', distinct=True))

    def edit_group_link(self, obj):
        if obj.id:
            url = reverse('admin:tests_questiongroup_change', args=[obj.id])
            count = getattr(obj, 'q_count', obj.questions.count())
            return format_html(
                '<a href="{}" target="_blank" class="btn btn-sm btn-info font-weight-bold">'
                '<i class="fas fa-layer-group"></i> Add / Edit Sub-Questions &amp; Prompts ({} questions)'
                '</a>',
                url, count
            )
        return format_html(
            '<span class="text-muted font-italic">'
            '<i class="fas fa-info-circle"></i> Save test first to add questions to this group'
            '</span>'
        )
    edit_group_link.short_description = 'Actions'


# ─── TestAdmin ────────────────────────────────────────────────────────
@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    change_list_template = "admin/tests_changelist.html"
    list_display = (
        'title_display',
        'category',
        'question_count',
        'is_actual_exam_demo',
        'requires_account',
        'is_published',
        'time_limit_display',
        'preview_action',
        'import_csv_action',
        'created_at',
    )

    list_editable = ('category', 'is_actual_exam_demo', 'requires_account', 'is_published')
    list_filter = ('category', 'is_actual_exam_demo', 'requires_account', 'is_published')
    search_fields = ('title', 'description')
    inlines = [QuestionGroupInlineForTest, QuestionInline]
    date_hierarchy = 'created_at'
    list_per_page = 20
    save_on_top = True

    class Media:
        css = {'all': ('css/admin_custom.css',)}
        js = ('js/admin_sticky_save.js',)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(q_count=models.Count('questions', distinct=True))

    readonly_fields = ('manage_questions_link', 'preview_action')

    fieldsets = (
        ('Test Information', {
            'fields': ('title', 'description', 'category', 'is_actual_exam_demo', 'manage_questions_link', 'preview_action'),
            'description': 'Basic details about this practice test and its examination mode.'
        }),
        ('Access & Visibility', {
            'fields': ('requires_account', 'is_published'),
            'description': 'Control who can access this test and whether it appears on the public listing.'
        }),
        ('Timer Settings', {
            'fields': ('time_limit_seconds',),
            'classes': ('collapse',),
            'description': 'Optional countdown timer in seconds. Leave blank for unlimited time.'
        }),
    )


    def manage_questions_link(self, obj):
        if obj and obj.id:
            url = reverse('admin:tests_question_changelist') + f'?test__id__exact={obj.id}'
            count = getattr(obj, 'q_count', obj.questions.count())
            return format_html(
                '<a href="{}" target="_blank" class="btn btn-info font-weight-bold">'
                '<i class="fas fa-list-ol"></i> Open Paginated Questions List ({} questions)'
                '</a>',
                url, count
            )
        return format_html('<span class="text-muted">Save test first</span>')
    manage_questions_link.short_description = 'Fast Question Management'


    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-csv/', self.admin_site.admin_view(self.admin_import_csv_view), name='import_questions_csv'),
            path('sample-csv/', self.admin_site.admin_view(self.admin_download_sample_csv_view), name='download_sample_csv'),
        ]
        return custom_urls + urls

    def admin_download_sample_csv_view(self, request):
        csv_data = generate_sample_csv_string()
        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="jft_test_questions_template.csv"'
        return response

    def admin_import_csv_view(self, request):
        # VERSION MARKER: v3-standalone-2026-08-23
        import sys
        print(f"[CSV-IMPORT v3] Method={request.method} Path={request.path}", file=sys.stderr, flush=True)

        try:
            if request.method == 'POST':
                print("[CSV-IMPORT v3] Processing POST...", file=sys.stderr, flush=True)
                test_id = request.POST.get('test_id')
                clear_existing = str(request.POST.get('clear_existing', '')).lower() in ['true', 'on', '1', 'yes']
                csv_file = request.FILES.get('csv_file')
                print(f"[CSV-IMPORT v3] test_id={test_id}, has_file={csv_file is not None}, clear={clear_existing}", file=sys.stderr, flush=True)

                if not test_id or not csv_file:
                    return HttpResponse(self._import_result_html(
                        success=False,
                        message="Please select a target test and choose a valid CSV file."
                    ))

                try:
                    test_obj = Test.objects.get(pk=test_id)
                    print(f"[CSV-IMPORT v3] Found test: {test_obj.title}", file=sys.stderr, flush=True)

                    if clear_existing:
                        deleted_q = test_obj.questions.all().delete()
                        deleted_g = test_obj.question_groups.all().delete()
                        print(f"[CSV-IMPORT v3] Cleared existing: questions={deleted_q}, groups={deleted_g}", file=sys.stderr, flush=True)

                    created_count, errors = import_questions_from_csv(test_obj, csv_file)
                    print(f"[CSV-IMPORT v3] Import complete: created={created_count}, errors={len(errors)}", file=sys.stderr, flush=True)

                    from tests.signals import invalidate_test_cache
                    invalidate_test_cache(test_obj.id)

                    warning_html = ""

                    if errors:
                        warning_items = "".join(f"<li>{e}</li>" for e in errors[:10])
                        warning_html = f"<div style='margin-top:16px;padding:12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;'><strong>Warnings:</strong><ul style='margin:8px 0 0;'>{warning_items}</ul></div>"

                    return HttpResponse(self._import_result_html(
                        success=True,
                        message=f"Successfully imported {created_count} question(s) into '{test_obj.title}'!",
                        extra_html=warning_html
                    ))

                except Test.DoesNotExist:
                    return HttpResponse(self._import_result_html(
                        success=False,
                        message=f"Test with ID '{test_id}' does not exist."
                    ))
                except Exception as e:
                    import traceback
                    tb = traceback.format_exc()
                    print(f"[CSV-IMPORT v3] Import exception: {tb}", file=sys.stderr, flush=True)
                    return HttpResponse(self._import_result_html(
                        success=False,
                        message=f"Import failed: {str(e)}",
                        extra_html=f"<pre style='margin-top:12px;background:#fef2f2;color:#991b1b;padding:12px;border-radius:8px;overflow-x:auto;font-size:0.8rem;'>{tb}</pre>"
                    ))

            # GET request — render the normal Jazzmin template
            tests = Test.objects.all()
            selected_test_id = request.POST.get('test_id') or request.GET.get('test_id')
            context = {
                **self.admin_site.each_context(request),
                'title': 'Bulk Import Questions via CSV',
                'tests': tests,
                'selected_test_id': int(selected_test_id) if selected_test_id and str(selected_test_id).isdigit() else None,
                'opts': self.model._meta,
                'has_view_permission': self.has_view_permission(request),
                'available_apps': self.admin_site.get_app_list(request),
            }
            return render(request, 'admin/csv_import.html', context)

        except Exception as fatal_e:
            import traceback
            tb = traceback.format_exc()
            print(f"[CSV-IMPORT v3] FATAL error: {tb}", file=sys.stderr, flush=True)
            return HttpResponse(self._import_result_html(
                success=False,
                message="A fatal error occurred.",
                extra_html=f"<pre style='margin-top:12px;background:#fef2f2;color:#991b1b;padding:12px;border-radius:8px;overflow-x:auto;font-size:0.8rem;'>{tb}</pre>"
            ))

    @staticmethod
    def _import_result_html(success, message, extra_html=""):
        """Returns a standalone HTML page for import results — no Jazzmin template dependency."""
        color = "#16a34a" if success else "#dc2626"
        icon = "✅" if success else "❌"
        bg = "#f0fdf4" if success else "#fef2f2"
        border = "#86efac" if success else "#fca5a5"
        return (
            f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>CSV Import Result</title>"
            f"<style>body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#1a1c23;color:#e2e8f0;margin:0;padding:40px 20px;}}"
            f".card{{max-width:700px;margin:0 auto;background:#2d303a;border-radius:16px;padding:32px;box-shadow:0 8px 32px rgba(0,0,0,0.3);}}"
            f".result{{padding:20px;border-radius:12px;background:{bg};border:1px solid {border};margin-bottom:20px;}}"
            f".result h2{{color:{color};margin:0 0 8px;font-size:1.3rem;}}"
            f".result p{{color:#334155;margin:0;font-size:1rem;}}"
            f".btn{{display:inline-block;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;margin-right:12px;margin-top:8px;}}"
            f".btn-primary{{background:#2563eb;color:#fff;}}.btn-secondary{{background:#475569;color:#fff;}}"
            f"</style></head><body>"
            f"<div class='card'>"
            f"<div class='result'><h2>{icon} {message}</h2></div>"
            f"{extra_html}"
            f"<div style='margin-top:24px;'>"
            f"<a href='/admin/tests/test/' class='btn btn-primary'>← Back to Tests</a>"
            f"<a href='/admin/tests/test/import-csv/' class='btn btn-secondary'>Import Another CSV</a>"
            f"</div>"
            f"<p style='margin-top:20px;font-size:0.75rem;color:#64748b;'>Deploy version: v3-standalone | {__import__('datetime').datetime.now().isoformat()}</p>"
            f"</div></body></html>"
        )


    def preview_action(self, obj):
        if obj and obj.id:
            status_text = "Live Preview" if obj.is_published else "Draft Preview"
            status_color = "#0284C7" if obj.is_published else "#D97706"
            return format_html(
                '<a href="https://gakkou-no-shiken.vercel.app/test/{}?preview=admin" target="_blank" '
                'style="display:inline-flex; align-items:center; gap:4px; background:{}; color:#fff; padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem; text-decoration:none; box-shadow:0 2px 6px rgba(0,0,0,0.2);">'
                '👁️ {}'
                '</a>',
                obj.id, status_color, status_text
            )
        return format_html('<span class="text-muted">Save first</span>')
    preview_action.short_description = 'CBT Preview'


    def import_csv_action(self, obj):
        url = reverse('admin:import_questions_csv') + f'?test_id={obj.id}'
        return format_html(
            '<a href="{}" style="display:inline-flex; align-items:center; gap:4px; background:#16a34a; color:#fff; padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem; text-decoration:none; box-shadow:0 2px 6px rgba(0,0,0,0.2);">'
            '📥 CSV'
            '</a>',
            url
        )
    import_csv_action.short_description = 'Bulk Upload'

    def title_display(self, obj):
        icon = '🔒' if obj.requires_account else '🌐'
        status = '🟢' if obj.is_published else '🟡 [DRAFT]'
        return format_html(
            '{} {} <strong>{}</strong>',
            status, icon, obj.title
        )
    title_display.short_description = 'Test'
    title_display.admin_order_field = 'title'


    def question_count(self, obj):
        count = getattr(obj, 'q_count', obj.questions.count())
        empty_class = ' empty' if count == 0 else ''
        return format_html(
            '<span class="admin-badge admin-badge-count{}">{} questions</span>',
            empty_class, count
        )
    question_count.short_description = 'Questions'

    def time_limit_display(self, obj):
        if obj.time_limit_seconds:
            mins = obj.time_limit_seconds // 60
            secs = obj.time_limit_seconds % 60
            if secs:
                return format_html(
                    '<span class="text-muted font-weight-bold">⏱ {}m {}s</span>',
                    mins, secs
                )
            return format_html(
                '<span class="text-muted font-weight-bold">⏱ {} min</span>',
                mins
            )
        return format_html('<span class="text-muted font-italic">∞ Unlimited</span>')
    time_limit_display.short_description = 'Duration'
    time_limit_display.admin_order_field = 'time_limit_seconds'



# ─── QuestionGroupAdmin ──────────────────────────────────────────────
class GroupQuestionInline(admin.StackedInline):
    """Inline for managing questions within a QuestionGroup."""
    model = Question
    fk_name = 'group'
    extra = 1
    fields = (
        ('section', 'type', 'order_index'),
        'test',
        'instruction',
        'prompt',
        ('image', 'audio'),
        'edit_question_link',
    )
    readonly_fields = ('edit_question_link',)
    ordering = ('order_index',)

    def edit_question_link(self, obj):
        if obj.id:
            url = reverse('admin:tests_question_change', args=[obj.id])
            count = obj.options.count()
            return format_html(
                '<a href="{}" target="_blank" class="btn btn-sm btn-primary font-weight-bold">'
                '<i class="fas fa-edit"></i> Edit Options &amp; Answers ({} options)'
                '</a>',
                url, count
            )
        return format_html(
            '<span class="text-muted font-italic">'
            '<i class="fas fa-info-circle"></i> Save this group first to manage answer options'
            '</span>'
        )
    edit_question_link.short_description = 'Manage Options'


@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    list_display = ('title_display', 'test', 'question_count', 'has_image', 'has_audio', 'order_index')
    list_filter = ('test',)
    search_fields = ('title', 'instruction', 'test__title')
    inlines = [GroupQuestionInline]
    readonly_fields = ('image_preview', 'audio_preview')
    ordering = ('test', 'order_index')
    save_on_top = True

    class Media:
        css = {'all': ('css/admin_custom.css',)}
        js = ('js/admin_sticky_save.js',)

    fieldsets = (

        ('Group Info', {
            'fields': ('test', 'title', 'order_index'),
            'description': 'Create a group to share one image/audio passage across multiple questions.',
        }),
        ('Shared Instruction', {
            'fields': ('instruction',),
            'description': 'This instruction is shown above all questions in this group.',
        }),
        ('Shared Media', {
            'fields': ('image', 'image_preview', 'audio', 'audio_preview'),
            'description': 'Upload the shared reading passage image or listening audio clip.',
        }),
    )

    def title_display(self, obj):
        return obj.title or f"Group #{obj.pk}"
    title_display.short_description = 'Group'
    title_display.admin_order_field = 'title'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('test').annotate(q_count=models.Count('questions', distinct=True))

    def question_count(self, obj):
        count = getattr(obj, 'q_count', obj.questions.count())
        empty_class = ' empty' if count == 0 else ''
        return format_html(
            '<span class="admin-badge admin-badge-count{}">{} questions</span>',
            empty_class, count
        )
    question_count.short_description = 'Questions'

    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True
    has_image.short_description = 'Img'

    def has_audio(self, obj):
        return bool(obj.audio)
    has_audio.boolean = True
    has_audio.short_description = 'Audio'

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="admin-preview-container">'
                '<img src="{}" class="admin-preview-img" style="max-height:350px; max-width:500px;" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span class="text-muted font-italic">No image uploaded</span>')
    image_preview.short_description = 'Image Preview'

    def audio_preview(self, obj):
        if obj.audio:
            return format_html(
                '<div class="admin-preview-container">'
                '<audio controls src="{}"></audio>'
                '</div>',
                obj.audio.url
            )
        return format_html('<span class="text-muted font-italic">No audio uploaded</span>')
    audio_preview.short_description = 'Audio Preview'


# ─── QuestionAdmin ────────────────────────────────────────────────────
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    change_list_template = "admin/tests_changelist.html"
    list_display = (
        'prompt_snippet',
        'test',
        'group',
        'section',
        'type_badge',
        'order_index',
        'option_count',
        'image_preview_small',
        'audio_preview_small',
    )

    list_filter = ('test', 'section', 'type', 'group')
    search_fields = ('prompt', 'test__title')
    inlines = [AnswerOptionInline]
    ordering = ('test', 'order_index')
    readonly_fields = ('image_preview', 'audio_preview')
    list_per_page = 25
    save_on_top = True

    class Media:
        css = {'all': ('css/admin_custom.css',)}
        js = ('js/admin_sticky_save.js',)

    fieldsets = (

        ('Question Content', {
            'fields': ('test', 'group', 'section', 'type', 'instruction', 'prompt', 'order_index'),
            'description': 'Link to a Question Group to share an image/audio passage across multiple questions.',
        }),


        ('Multi-Language Overlay', {
            'fields': ('translations',),
            'classes': ('collapse',),
            'description': 'Optional custom JSON dictionary mapping languages (English, Chinese, Indonesian, Khmer, Mongolian, Myanmar, Nepali, Thai, Vietnamese) to translations.',
        }),
        ('Media Attachments', {
            'fields': ('image', 'image_preview', 'audio', 'audio_preview'),
            'classes': ('collapse',),
            'description': 'Upload an image or audio file depending on the question type.',
        }),
    )


    def prompt_snippet(self, obj):
        text = obj.prompt[:60] + '…' if len(obj.prompt) > 60 else obj.prompt
        return format_html('<span title="{}">{}</span>', obj.prompt, text)
    prompt_snippet.short_description = 'Prompt'
    prompt_snippet.admin_order_field = 'prompt'

    def type_badge(self, obj):
        emojis = {'text': '📝', 'image': '🖼️', 'audio': '🎧', 'image_audio': '🖼️🎧'}
        emoji = emojis.get(obj.type, '❓')
        return format_html(
            '<span class="admin-badge admin-badge-type">'
            '{} {}</span>',
            emoji, obj.get_type_display()
        )
    type_badge.short_description = 'Type'
    type_badge.admin_order_field = 'type'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('test', 'group').prefetch_related('options')

    def option_count(self, obj):
        opts = list(obj.options.all())
        count = len(opts)
        has_correct = any(o.is_correct for o in opts)
        if count == 0:
            return format_html('<span class="admin-badge admin-badge-fail">⚠ None</span>')
        if not has_correct:
            return format_html(
                '<span class="admin-badge admin-badge-fail" title="No correct answer marked!">'
                '⚠ {} (no correct!)</span>', count
            )
        return format_html('<span class="font-weight-bold">{}</span>', count)
    option_count.short_description = 'Options'

    def image_preview_small(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:36px; max-width:54px; '
                'border-radius:6px; object-fit:cover; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" />',
                obj.image.url
            )
        return format_html('<span class="text-muted">—</span>')
    image_preview_small.short_description = 'Img'

    def audio_preview_small(self, obj):
        if obj.audio:
            return format_html(
                '<audio controls style="max-width:140px; height:28px;" src="{}"></audio>',
                obj.audio.url
            )
        return format_html('<span class="text-muted">—</span>')
    audio_preview_small.short_description = 'Audio'

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="admin-preview-container">'
                '<img src="{}" class="admin-preview-img" style="max-height:280px; max-width:420px;" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span class="text-muted font-italic">No image</span>')
    image_preview.short_description = 'Image Preview'

    def audio_preview(self, obj):
        if obj.audio:
            return format_html(
                '<div class="admin-preview-container">'
                '<audio controls src="{}"></audio>'
                '</div>',
                obj.audio.url
            )
        return format_html('<span class="text-muted font-italic">No audio</span>')
    audio_preview.short_description = 'Audio Preview'


# ─── AttemptAdmin ─────────────────────────────────────────────────────
@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'test',
        'user_display',
        'score_display',
        'percentage_badge',
        'status_badge',
        'completed_at',
    )
    list_filter = ('test', 'completed_at')
    search_fields = ('user__username', 'user__email', 'test__title')
    readonly_fields = ('test', 'user', 'score', 'total_questions', 'answers', 'completed_at')
    list_per_page = 30
    date_hierarchy = 'completed_at'

    fieldsets = (
        ('Attempt Overview', {
            'fields': ('test', 'user', 'completed_at'),
        }),
        ('Results', {
            'fields': ('score', 'total_questions'),
        }),
        ('Raw Answer Data', {
            'fields': ('answers',),
            'classes': ('collapse',),
            'description': 'JSON mapping of question IDs to selected option IDs.',
        }),
    )

    def user_display(self, obj):
        if obj.user:
            return format_html(
                '<span class="font-weight-bold">'
                '<i class="fas fa-user-circle text-primary"></i> {}</span>',
                obj.user.username
            )
        return format_html(
            '<span class="text-muted font-italic">'
            '<i class="fas fa-user-secret"></i> Anonymous</span>'
        )
    user_display.short_description = 'User'

    def score_display(self, obj):
        return format_html(
            '<span class="font-weight-bold" style="font-size:1rem;">{}</span>'
            '<span class="text-muted"> / {}</span>',
            obj.score, obj.total_questions
        )
    score_display.short_description = 'Score'

    def percentage_badge(self, obj):
        if obj.total_questions > 0:
            pct = (obj.score / obj.total_questions) * 100
            badge_class = 'admin-badge-pass' if pct >= 50 else 'admin-badge-fail'
            return format_html(
                '<span class="admin-badge {}">{}%</span>',
                badge_class, round(pct, 1)
            )
        return '—'
    percentage_badge.short_description = 'Score %'

    def status_badge(self, obj):
        if obj.total_questions > 0:
            pct = (obj.score / obj.total_questions) * 100
            if pct >= 80:
                return format_html('<span class="admin-badge admin-badge-pass">✓ PASS</span>')
            return format_html('<span class="admin-badge admin-badge-fail">✗ FAIL</span>')
        return '—'
    status_badge.short_description = 'Status'


# ─── Admin site branding ──────────────────────────────────────────────
admin.site.site_header = 'Gakkou No Shiken — Admin'
admin.site.site_title = 'Gakkou No Shiken Admin'
admin.site.index_title = 'Dashboard'
