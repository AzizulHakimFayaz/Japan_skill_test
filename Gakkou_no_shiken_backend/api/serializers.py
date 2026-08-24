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


from accounts.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    target_exam_display = serializers.CharField(source='get_target_exam_display', read_only=True)
    japanese_level_display = serializers.CharField(source='get_japanese_level_display', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'bio',
            'target_exam',
            'target_exam_display',
            'japanese_level',
            'japanese_level_display',
            'location',
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
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
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

    def validate_username(self, value):
        if value:
            user = self.instance
            if user and User.objects.filter(username__iexact=value).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("This username is already taken. Please choose another.")
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
        profile.save()

        return instance




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
