from django.db import models
from django.conf import settings

class Test(models.Model):
    class Category(models.TextChoices):
        BASIC = "basic", "Basic"
        SKILL = "skill", "Skill"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.BASIC,
    )
    requires_account = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    is_actual_exam_demo = models.BooleanField(
        default=False,
        verbose_name="Actual Exam Demo",
        help_text="If checked, candidates must complete the official Introduction part before starting Section 1. Otherwise starts directly on Question 1."
    )
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.title

    class Meta:
        ordering = ['created_at']


class Question(models.Model):
    class QuestionType(models.TextChoices):
        TEXT = "text", "Text"
        IMAGE = "image", "Image"
        AUDIO = "audio", "Audio"

    class Section(models.TextChoices):
        SCRIPT_VOCAB = "script_vocab", "Script and Vocabulary"
        CONVERSATION = "conversation", "Conversation and Expression"
        LISTENING = "listening", "Listening Comprehension"
        READING = "reading", "Reading Comprehension"

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    type = models.CharField(max_length=10, choices=QuestionType.choices)
    section = models.CharField(
        max_length=32,
        choices=Section.choices,
        default=Section.SCRIPT_VOCAB,
    )
    instruction = models.TextField(
        blank=True,
        verbose_name="Instruction / Pre-prompt",
        help_text="e.g. How do you write the underlined kanji word in hiragana? Choose the correct one."
    )
    prompt = models.TextField(blank=True)
    image = models.ImageField(upload_to="questions/images/", null=True, blank=True)
    audio = models.FileField(upload_to="questions/audio/", null=True, blank=True)
    translations = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom JSON mapping for 9 languages e.g. {'English': '...', 'Chinese': '...', 'Indonesian': '...'}"
    )
    order_index = models.PositiveIntegerField(default=0)



    def get_translations(self):
        """Returns a dict of 9 language translations for the instruction/pre-prompt."""
        default_instruction = self.instruction or self.prompt or "How do you write the underlined kanji word in hiragana? Choose the correct one."
        
        defaults = {
            "English": default_instruction,
            "Chinese": "带有下划线的汉字单词的平假名是什么？请选择正确的答案。",
            "Indonesian": "Bagaimanakah Anda menuliskan hiragana dari kanji yang digarisbawahi? Pilihlah yang benar.",
            "Khmer": "តើពាក្យកាន់ជើដែលបានគូសបន្ទាត់ពីក្រោមអាចសរសេរយ៉ាងដូចម្តេចដោយប្រើហ៊ីរ៉ាហ្គាណា? ចូរជ្រើសរើសចម្លើយមួយដែលត្រឹមត្រូវ។",
            "Mongolian": "Доогуур зураастай ханзтай үгийг Хирагана-гаар яаж бичих вэ? Зөв зүйлийг сонгоно уу.",
            "Myanmar": "မျဉ်းတားထားသောက Kanji စကားလုံးများကို ဟိရဂဏဖြင့်မည်သို့ရေးမည်နည်း။ အမှန်ကိုရွေးပါ။",
            "Nepali": "लाइन लगाइएको कान्जी शब्दलाई हिरागानामा कसरी लेख्नुहुन्छ? सही उत्तर चयन गर्नुहोस्।",
            "Thai": "คำที่เขียนด้วยคันจิที่ขีดเส้นใต้นี้เขียนเป็นฮิรางานะว่าอย่างไร เลือกข้อที่ถูกต้อง",
            "Vietnamese": "Cụm từ chữ Hán gạch chân được viết như thế nào bằng chữ Hiragana? Hãy chọn đáp án đúng.",
        }
        
        if isinstance(self.translations, dict) and self.translations:
            # Override defaults with custom dictionary entries
            merged = defaults.copy()
            merged.update(self.translations)
            return merged
        return defaults

    def __str__(self):
        return f"{self.get_section_display()} - {self.get_type_display()} Question (Order {self.order_index}) for {self.test.title}"


    class Meta:
        ordering = ['order_index']



class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    label = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order_index = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.label} ({'Correct' if self.is_correct else 'Incorrect'})"

    class Meta:
        ordering = ['order_index']


class Attempt(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="attempts")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    answers = models.JSONField(default=dict)  # {question_id: selected_option_id}
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"Attempt by {user_str} on {self.test.title}: {self.score}/{self.total_questions}"

    class Meta:
        ordering = ['-completed_at']
