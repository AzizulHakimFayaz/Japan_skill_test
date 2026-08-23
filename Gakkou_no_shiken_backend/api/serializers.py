from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from tests.models import Test, QuestionGroup, Question, AnswerOption, Attempt


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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


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

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category',
            'requires_account', 'is_published', 'is_actual_exam_demo',
            'time_limit_seconds', 'created_at', 'question_count'
        ]

    def get_question_count(self, obj):
        if hasattr(obj, 'q_count'):
            return obj.q_count
        return obj.questions.count()


class TestDetailSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category',
            'requires_account', 'is_published', 'is_actual_exam_demo',
            'time_limit_seconds', 'created_at', 'question_count'
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


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
