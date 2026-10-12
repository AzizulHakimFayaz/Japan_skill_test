from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from tests.models import Test, QuestionGroup, Question, AnswerOption, Attempt, Notice, CurriculumLesson, CurriculumVocabulary, CurriculumKanji, ExamBook, BookTopic, HeroBanner



def get_absolute_media_url(file_field, request=None):
    """Returns absolute URL for FileField or None."""
    if not file_field:
        return None
    try:
        url = file_field.url
        if url.startswith('http://') or url.startswith('https://'):
            return url
        if request:
            return request.build_absolute_uri(url)
        return url
    except Exception:
        return None


from accounts.models import UserProfile, PasswordResetToken


class UserProfileSerializer(serializers.ModelSerializer):
    target_exam_display = serializers.CharField(source='get_target_exam_display', read_only=True)
    japanese_level_display = serializers.CharField(source='get_japanese_level_display', read_only=True)
    country_source_display = serializers.CharField(source='get_country_source_display', read_only=True)
    needs_country_confirmation = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'bio',
            'target_exam',
            'target_exam_display',
            'japanese_level',
            'japanese_level_display',
            'location',
            'country',
            'country_source',
            'country_source_display',
            'needs_country_confirmation',
            'updated_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email', 'is_staff', 'profile']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username


class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150, default='')
    country = serializers.CharField(required=True, allow_blank=False, max_length=100)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'country', 'password', 'password_confirm']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

    def validate_country(self, value):
        clean_country = (value or '').strip()
        if not clean_country:
            raise serializers.ValidationError("Country is required.")
        return clean_country

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        country = validated_data.pop('country', '').strip()
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        if country:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.country = country
            profile.country_source = UserProfile.CountrySource.USER
            profile.save()
        return user


class UserProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    target_exam = serializers.ChoiceField(choices=UserProfile.TargetExam.choices, required=False)
    japanese_level = serializers.ChoiceField(choices=UserProfile.JapaneseLevel.choices, required=False)
    location = serializers.CharField(required=False, allow_blank=True, max_length=100)
    country = serializers.CharField(required=False, allow_blank=False, max_length=100)

    def validate_username(self, value):
        if value:
            user = self.instance
            if user and User.objects.filter(username__iexact=value).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

    def validate_country(self, value):
        if value is not None:
            clean = value.strip()
            if not clean:
                raise serializers.ValidationError("Country cannot be empty.")
            return clean
        return value

    def update(self, instance, validated_data):
        # instance is User
        if 'username' in validated_data and validated_data['username']:
            instance.username = validated_data['username'].strip()
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name']
        if 'email' in validated_data:
            instance.email = validated_data['email']
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if 'bio' in validated_data:
            profile.bio = validated_data['bio']
        if 'target_exam' in validated_data:
            profile.target_exam = validated_data['target_exam']
        if 'japanese_level' in validated_data:
            profile.japanese_level = validated_data['japanese_level']
        if 'location' in validated_data:
            profile.location = validated_data['location']
        if 'country' in validated_data and validated_data['country']:
            profile.country = validated_data['country'].strip()
            profile.country_source = UserProfile.CountrySource.USER
        profile.save()

        return instance


class ConfirmCountrySerializer(serializers.Serializer):
    country = serializers.CharField(required=True, allow_blank=False, max_length=100)

    def validate_country(self, value):
        clean = (value or '').strip()
        if not clean:
            raise serializers.ValidationError("Country is required.")
        return clean


class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.strip().lower()


class ResetPasswordRequestSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, trim_whitespace=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_confirm = attrs.get('password_confirm')
        if pw_confirm and pw != pw_confirm:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs





class AnswerOptionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AnswerOption
        fields = ['id', 'label', 'image_url', 'order_index']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.image, request)


class AnswerOptionReviewSerializer(serializers.ModelSerializer):
    """Includes is_correct for post-exam review/results only."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AnswerOption
        fields = ['id', 'label', 'image_url', 'is_correct', 'order_index']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.image, request)


class QuestionGroupSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = QuestionGroup
        fields = ['id', 'title', 'instruction', 'image_url', 'audio_url', 'order_index']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.image, request)

    def get_audio_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.audio, request)


class QuestionQuizSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    resolved_instruction = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'type', 'section', 'instruction', 'resolved_instruction',
            'prompt', 'image_url', 'audio_url', 'translations', 'order_index',
            'group_id', 'options'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.resolved_image, request)

    def get_audio_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.resolved_audio, request)

    def get_translations(self, obj):
        return obj.get_translations()

    def get_resolved_instruction(self, obj):
        return obj.resolved_instruction


class QuestionReviewSerializer(serializers.ModelSerializer):
    options = AnswerOptionReviewSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    resolved_instruction = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'type', 'section', 'instruction', 'resolved_instruction',
            'prompt', 'image_url', 'audio_url', 'translations', 'order_index',
            'group_id', 'options'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.resolved_image, request)

    def get_audio_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.resolved_audio, request)

    def get_translations(self, obj):
        return obj.get_translations()

    def get_resolved_instruction(self, obj):
        return obj.resolved_instruction


class TestListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    is_released = serializers.SerializerMethodField()
    time_until_release_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category',
            'requires_account', 'is_published', 'is_actual_exam_demo',
            'time_limit_seconds', 'scheduled_release_at', 'is_released',
            'time_until_release_seconds', 'created_at', 'question_count'
        ]

    def get_question_count(self, obj):
        if hasattr(obj, 'q_count'):
            return obj.q_count
        return obj.questions.count()

    def get_is_released(self, obj):
        return obj.is_released

    def get_time_until_release_seconds(self, obj):
        if obj.scheduled_release_at:
            from django.utils import timezone
            diff = (obj.scheduled_release_at - timezone.now()).total_seconds()
            return max(0, int(diff))
        return 0


class TestDetailSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    is_released = serializers.SerializerMethodField()
    time_until_release_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category',
            'requires_account', 'is_published', 'is_actual_exam_demo',
            'time_limit_seconds', 'scheduled_release_at', 'is_released',
            'time_until_release_seconds', 'created_at', 'question_count'
        ]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_is_released(self, obj):
        return obj.is_released

    def get_time_until_release_seconds(self, obj):
        if obj.scheduled_release_at:
            from django.utils import timezone
            diff = (obj.scheduled_release_at - timezone.now()).total_seconds()
            return max(0, int(diff))
        return 0


class AttemptSummarySerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    test_category = serializers.CharField(source='test.category', read_only=True)
    percentage = serializers.SerializerMethodField()
    scaled_score = serializers.SerializerMethodField()
    assessment_level = serializers.SerializerMethodField()
    passed = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            'id', 'test_id', 'test_title', 'test_category',
            'score', 'total_questions', 'percentage',
            'scaled_score', 'assessment_level', 'passed', 'completed_at'
        ]

    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return int(round((obj.score / obj.total_questions) * 100))
        return 0

    def get_scaled_score(self, obj):
        pct = (obj.score / obj.total_questions * 100.0) if obj.total_questions > 0 else 0.0
        return int(round(10 + (pct / 100.0) * 240)) if obj.total_questions > 0 else 10

    def get_assessment_level(self, obj):
        scaled = self.get_scaled_score(obj)
        if scaled >= 200:
            return "A2.2 (A2)"
        elif scaled >= 175:
            return "A2.1"
        elif scaled >= 145:
            return "A1"
        return "Below A1"

    def get_passed(self, obj):
        return self.get_scaled_score(obj) >= 200


class NoticeSerializer(serializers.ModelSerializer):
    notice_type_display = serializers.CharField(source='get_notice_type_display', read_only=True)
    target_audience_display = serializers.CharField(source='get_target_audience_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    pdf_file_url = serializers.SerializerMethodField()
    related_test_title = serializers.CharField(source='related_test.title', read_only=True)
    related_test_category = serializers.CharField(source='related_test.category', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        fields = [
            'id',
            'title',
            'summary',
            'content',
            'notice_type',
            'notice_type_display',
            'target_audience',
            'target_audience_display',
            'image_url',
            'pdf_file_url',
            'file_size_text',
            'related_test',
            'related_test_title',
            'related_test_category',
            'action_url',
            'action_button_text',
            'is_pinned',
            'show_as_popup',
            'order_index',
            'views_count',
            'downloads_count',
            'created_at',
            'created_at_formatted',
            'time_ago',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.image, request)

    def get_pdf_file_url(self, obj):
        request = self.context.get('request')
        return get_absolute_media_url(obj.pdf_file, request)

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%B %d, %Y')

    def get_time_ago(self, obj):
        from django.utils.timezone import now
        diff = now() - obj.created_at
        seconds = diff.total_seconds()
        if seconds < 60:
            return "Just now"
        elif seconds < 3600:
            mins = int(seconds / 60)
            return f"{mins}m ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours}h ago"
        elif seconds < 86400 * 7:
            days = int(seconds / 86400)
            return f"{days}d ago"
        return obj.created_at.strftime('%b %d, %Y')


# ─── Curriculum Serializers ──────────────────────────────────────────

class CurriculumVocabularySerializer(serializers.ModelSerializer):
    class Meta:
        model = CurriculumVocabulary
        fields = [
            'id',
            'order_index',
            'word',
            'furigana',
            'romaji',
            'meaning_en',
            'meaning_bn',
            'speech',
            'part_of_speech',
        ]


class CurriculumKanjiSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurriculumKanji
        fields = [
            'id',
            'order_index',
            'character',
            'onyomi',
            'kunyomi',
            'romaji',
            'meaning_en',
            'meaning_bn',
            'speech',
            'stroke_count',
        ]


class CurriculumLessonListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurriculumLesson
        fields = [
            'id',
            'lesson_type',
            'level',
            'lesson_number',
            'title',
            'title_ja',
            'description',
            'items_count',
        ]


class CurriculumLessonDetailSerializer(serializers.ModelSerializer):
    vocabularies = CurriculumVocabularySerializer(many=True, read_only=True)
    kanjis = CurriculumKanjiSerializer(many=True, read_only=True)
    prev_lesson_id = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = CurriculumLesson
        fields = [
            'id',
            'lesson_type',
            'level',
            'lesson_number',
            'title',
            'title_ja',
            'description',
            'items_count',
            'vocabularies',
            'kanjis',
            'prev_lesson_id',
            'next_lesson_id',
        ]

    def get_prev_lesson_id(self, obj):
        prev = CurriculumLesson.objects.filter(
            lesson_type=obj.lesson_type,
            level=obj.level,
            lesson_number__lt=obj.lesson_number
        ).order_by('-lesson_number').first()
        return prev.id if prev else None

    def get_next_lesson_id(self, obj):
        nxt = CurriculumLesson.objects.filter(
            lesson_type=obj.lesson_type,
            level=obj.level,
            lesson_number__gt=obj.lesson_number
        ).order_by('lesson_number').first()
        return nxt.id if nxt else None


# ─── Exam Books & Topics Serializers ──────────────────────────────────
class BookTopicSerializer(serializers.ModelSerializer):
    audio_file_url = serializers.SerializerMethodField()

    class Meta:
        model = BookTopic
        fields = [
            'id',
            'book',
            'title',
            'title_ja',
            'page_number',
            'topic_type',
            'summary_text',
            'question_options',
            'correct_answer',
            'japanese_script',
            'audio_file_url',
            'audio_duration',
            'order',
        ]

    def get_audio_file_url(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            return get_absolute_media_url(obj.audio_file, request)
        if obj.audio_url:
            return obj.audio_url
        return None


class ExamBookListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    book_type_display = serializers.CharField(source='get_book_type_display', read_only=True)
    pdf_download_url = serializers.SerializerMethodField()
    cover_image_display = serializers.SerializerMethodField()
    topics_count = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = ExamBook
        fields = [
            'id',
            'title',
            'title_ja',
            'category',
            'category_display',
            'language',
            'language_name',
            'language_flag',
            'book_type',
            'book_type_display',
            'pdf_download_url',
            'cover_image_display',
            'description',
            'total_pages',
            'topics_count',
            'questions_count',
            'order',
        ]

    def get_pdf_download_url(self, obj):
        if obj.local_pdf:
            request = self.context.get('request')
            return get_absolute_media_url(obj.local_pdf, request)
        return obj.pdf_url

    def get_cover_image_display(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            return get_absolute_media_url(obj.cover_image, request)
        return obj.cover_image_url if obj.cover_image_url else None

    def get_topics_count(self, obj):
        return obj.topics.filter(topic_type__in=['chapter', 'section', 'safety', 'terminology']).count()

    def get_questions_count(self, obj):
        return obj.topics.filter(topic_type='question').count()


class ExamBookDetailSerializer(ExamBookListSerializer):
    topics = serializers.SerializerMethodField()

    class Meta(ExamBookListSerializer.Meta):
        fields = ExamBookListSerializer.Meta.fields + ['topics']

    def get_topics(self, obj):
        topics_qs = obj.topics.all().order_by('order', 'page_number', 'id')
        return BookTopicSerializer(topics_qs, many=True, context=self.context).data


class HeroBannerSerializer(serializers.ModelSerializer):
    image_display = serializers.SerializerMethodField()
    mobile_image_display = serializers.SerializerMethodField()

    class Meta:
        model = HeroBanner
        fields = [
            'id',
            'title',
            'title_highlight',
            'subtitle',
            'badge_text',
            'badge_icon',
            'image',
            'image_url',
            'image_display',
            'mobile_image',
            'mobile_image_url',
            'mobile_image_display',
            'primary_btn_text',
            'primary_btn_url',
            'secondary_btn_text',
            'secondary_btn_url',
            'theme_color',
            'order',
            'is_active',
        ]

    def get_image_display(self, obj):
        if obj.image:
            return get_absolute_media_url(obj.image, self.context.get('request'))
        return obj.image_url if obj.image_url else None

    def get_mobile_image_display(self, obj):
        if obj.mobile_image:
            return get_absolute_media_url(obj.mobile_image, self.context.get('request'))
        if obj.mobile_image_url:
            return obj.mobile_image_url
        return self.get_image_display(obj)


