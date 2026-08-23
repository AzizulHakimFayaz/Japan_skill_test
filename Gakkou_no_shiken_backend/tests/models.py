from django.db import models
from django.conf import settings
from django.db.models import Case, When, Value, IntegerField

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

    def get_ordered_questions(self):
        """Returns questions ordered by JFT section hierarchy (script_vocab, conversation, listening, reading), then order_index, then id."""
        return self.questions.select_related('group').prefetch_related('options').annotate(
            sec_order=Case(
                When(section=Question.Section.SCRIPT_VOCAB, then=Value(1)),
                When(section=Question.Section.CONVERSATION, then=Value(2)),
                When(section=Question.Section.LISTENING, then=Value(3)),
                When(section=Question.Section.READING, then=Value(4)),
                default=Value(5),
                output_field=IntegerField()
            )
        ).order_by('sec_order', 'order_index', 'id')


    def __str__(self):
        return self.title

    class Meta:
        ordering = ['created_at']


class QuestionGroup(models.Model):
    """A shared context (image/audio/instruction) for a group of related questions.
    
    Example: A reading passage image with questions (1), (2), (3) beneath it.
    """
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="question_groups")
    title = models.CharField(
        max_length=255, blank=True,
        help_text="Admin label, e.g. 'Reading Passage 1' or 'Listening Conversation 3'"
    )
    instruction = models.TextField(
        blank=True,
        help_text="Shared instruction for all questions in this group, e.g. 'You are reading a town magazine. Answer questions (1) and (2).'"
    )
    image = models.FileField(upload_to="groups/images/", null=True, blank=True)
    audio = models.FileField(upload_to="groups/audio/", null=True, blank=True)
    order_index = models.PositiveIntegerField(default=0)

    def __str__(self):
        label = self.title or f"Group #{self.pk}"
        return f"{label} ({self.test.title})"

    class Meta:
        ordering = ['order_index']
        verbose_name = "Question Group"
        verbose_name_plural = "Question Groups"


class Question(models.Model):
    class QuestionType(models.TextChoices):
        TEXT = "text", "Text"
        IMAGE = "image", "Image"
        AUDIO = "audio", "Audio"
        IMAGE_AUDIO = "image_audio", "Image + Audio"

    class Section(models.TextChoices):
        SCRIPT_VOCAB = "script_vocab", "Script and Vocabulary"
        CONVERSATION = "conversation", "Conversation and Expression"
        LISTENING = "listening", "Listening Comprehension"
        READING = "reading", "Reading Comprehension"

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    group = models.ForeignKey(
        QuestionGroup, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="questions",
        help_text="To show multiple prompts/questions under one shared image/passage, select or create (+) a Question Group."
    )
    type = models.CharField(max_length=16, choices=QuestionType.choices)
    section = models.CharField(
        max_length=32,
        choices=Section.choices,
        default=Section.SCRIPT_VOCAB,
    )
    instruction = models.TextField(
        blank=True,
        verbose_name="Instruction / Pre-prompt",
        help_text="e.g. How do you write the __underlined__ kanji word in hiragana? Use __word__ to underline specific words."
    )
    prompt = models.TextField(blank=True, help_text="The question text. Use __word__ to underline specific words (e.g. 水道が __こわれた__ ときは).")
    image = models.FileField(upload_to="questions/images/", null=True, blank=True)
    audio = models.FileField(upload_to="questions/audio/", null=True, blank=True)
    translations = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom JSON mapping for 10 languages e.g. {'Bengali': '...', 'English': '...', 'Chinese': '...', 'Indonesian': '...'}"
    )
    order_index = models.PositiveIntegerField(default=0)

    @property
    def text(self):
        return self.prompt or self.instruction

    @property
    def resolved_image(self):
        """Returns the question's own image, or falls back to the group's image."""
        if self.image:
            return self.image
        if self.group and self.group.image:
            return self.group.image
        return None

    @property
    def resolved_audio(self):
        """Returns the question's own audio, or falls back to the group's audio."""
        if self.audio:
            return self.audio
        if self.group and self.group.audio:
            return self.group.audio
        return None

    @property
    def resolved_instruction(self):
        """Returns the question's own instruction, or falls back to the group's instruction."""
        if self.instruction:
            return self.instruction
        if self.group and self.group.instruction:
            return self.group.instruction
        return ""


    def _get_default_translations_for_text(self, text_source, text_lower):
        # 1. Illustration / Picture / Vocabulary
        if any(k in text_lower for k in ['illustration', 'picture', 'image', 'イラスト', '絵', 'look at the illustration', 'choose the correct word']):
            return {
                "Bengali": "ছবিটি দেখুন এবং সঠিক শব্দটি নির্বাচন করুন।",
                "English": text_source or "Look at the illustration and choose the correct word.",
                "Chinese": "看插图并选择正确的单词。",
                "Indonesian": "Lihatlah ilustrasi dan pilihlah kata yang benar.",
                "Khmer": "ចូរមើលរូបភាព និងជ្រើសរើសពាក្យដែលត្រឹមត្រូវ។",
                "Mongolian": "Зургийг хараад зөв үгийг сонгоно уу.",
                "Myanmar": "သရုပ်ဖော်ပုံကိုကြည့်၍ မှန်ကန်သောစကားလုံးကို ရွေးချယ်ပါ။",
                "Nepali": "चित्र हेर्नुहोस् र सही शब्द छान्नुहोस्।",
                "Thai": "ดูภาพประกอบแล้วเลือกคำที่ถูกต้อง",
                "Vietnamese": "Hãy nhìn vào tranh minh họa và chọn từ đúng.",
            }

        # 2. Hiragana to Kanji
        if any(k in text_lower for k in ['hiragana word in kanji', 'kanji for the underlined']):
            return {
                "Bengali": "নিচে দাগ দেওয়া হিরাগানা শব্দটি কাঞ্জিতে কীভাবে লিখবেন? সঠিকটি নির্বাচন করুন।",
                "English": text_source or "How do you write the underlined hiragana word in kanji? Choose the correct one.",
                "Chinese": "带有下划线的平假名单词的汉字是什么？请选择正确的答案。",
                "Indonesian": "Bagaimanakah Anda menuliskan kanji dari kata hiragana yang digarisbawahi? Pilihlah yang benar.",
                "Khmer": "តើពាក្យហ៊ីរ៉ាហ្គាណាដែលបានគូសបន្ទាត់ពីក្រោមអាចសរសេរជាកាន់ជើដូចម្តេច? ចូរជ្រើសរើសចម្លើយមួយដែលត្រឹមត្រូវ។",
                "Mongolian": "Доогуур зураастай Хирагана үгийг ханзаар яаж бичих вэ? Зөв зүйлийг сонгоно уу.",
                "Myanmar": "မျဉ်းတားထားသော ဟိရဂဏစကားလုံးကို Kanji ဖြင့် မည်သို့ရေးမည်နည်း။ အမှန်ကိုရွေးပါ။",
                "Nepali": "लाइन लगाइएको हिरागाना शब्दलाई कान्जीमा कसरी लेख्नुहुन्छ? सही उत्तर चयन गर्नुहोस्।",
                "Thai": "คำที่เขียนด้วยฮิรางานะที่ขีดเส้นใต้นี้เขียนเป็นคันจิว่าอย่างไร เลือกข้อที่ถูกต้อง",
                "Vietnamese": "Cụm từ chữ Hiragana gạch chân được viết như thế nào bằng chữ Hán? Hãy chọn đáp án đúng.",
            }

        # 3. Listening / Audio Comprehension
        if any(k in text_lower for k in ['listen', 'audio', 'hearing', 'conversation and answer', '聞いて', '聴解']) or self.section == self.Section.LISTENING or self.type in [self.QuestionType.AUDIO, self.QuestionType.IMAGE_AUDIO]:
            return {
                "Bengali": "কথোপকথনটি মনোযোগ দিয়ে শুনুন এবং সঠিক উত্তরটি নির্বাচন করুন।",
                "English": text_source or "Listen to the audio and choose the correct answer.",
                "Chinese": "听录音并选择正确的答案。",
                "Indonesian": "Dengarkan audio dan pilihlah jawaban yang benar.",
                "Khmer": "ចូរស្តាប់សំឡេង និងជ្រើសរើសចម្លើយដែលត្រឹមត្រូវ។",
                "Mongolian": "Аудиог сонсоод зөв хариултыг сонгоно уу.",
                "Myanmar": "အသံဖိုင်ကို နားထောင်ပြီး မှန်ကန်သောအဖြေကို ရွေးချယ်ပါ။",
                "Nepali": "अडियो सुन्नुहोस् र सही उत्तर छान्नुहोस्।",
                "Thai": "ฟังเสียงแล้วเลือกคำตอบที่ถูกต้อง",
                "Vietnamese": "Lắng nghe đoạn ghi âm và chọn câu trả lời đúng.",
            }

        # 4. Conversation / Expression
        if any(k in text_lower for k in ['conversation', 'dialogue', 'reply', 'response', '会話']) or self.section == self.Section.CONVERSATION:
            return {
                "Bengali": "এই কথোপকথনে সবচেয়ে উপযুক্ত উত্তরটি নির্বাচন করুন।",
                "English": text_source or "Choose the most appropriate reply in this conversation.",
                "Chinese": "选择这段对话中最恰当的回答。",
                "Indonesian": "Pilihlah tanggapan yang paling tepat dalam percakapan ini.",
                "Khmer": "ចូរជ្រើសរើសចម្លើយដែលសមរម្យបំផុតនៅក្នុងការសន្ទនានេះ។",
                "Mongolian": "Энэхүү харилцан ярианд хамгийн тохиромжтой хариултыг сонгоно уу.",
                "Myanmar": "ဤစကားပြောဆိုမှုတွင် အသင့်တော်ဆုံးသော တုံ့ပြန်မှုကို ရွေးချယ်ပါ။",
                "Nepali": "यस कुराकानीमा सबैभन्दा उपयुक्त जवाफ छान्नुहोस्।",
                "Thai": "เลือกคำตอบที่เหมาะสมที่สุดในการสนทนานี้",
                "Vietnamese": "Chọn câu trả lời phù hợp nhất trong đoạn hội thoại này.",
            }

        # 5. Reading Comprehension / Passage
        if any(k in text_lower for k in ['read', 'passage', 'magazine', 'notice', 'flyer', 'article', 'メール', '読解']) or self.section == self.Section.READING:
            return {
                "Bengali": "অনুচ্ছেদ বা বিজ্ঞপ্তিটি মনোযোগ দিয়ে পড়ুন এবং প্রশ্নের উত্তর দিন।",
                "English": text_source or "Read the passage/notice and answer the question.",
                "Chinese": "阅读短文/通知并回答问题。",
                "Indonesian": "Bacalah teks/pengumuman dan jawablah pertanyaannya.",
                "Khmer": "ចូរអានអត្ថបទ/សេចក្តីជូនដំណឹង និងឆ្លើយសំណួរ។",
                "Mongolian": "Эхийг уншаад асуултад хариулна уу.",
                "Myanmar": "စာပိုဒ်ကိုဖတ်ပြီး မေးခွန်းများကို ဖြေဆိုပါ။",
                "Nepali": "अनुच्छेद पढ्नुहोस् र प्रश्नहरूको उत्तर दिनुहोस्।",
                "Thai": "อ่านบทความ/ประกาศแล้วตอบคำถาม",
                "Vietnamese": "Đọc đoạn văn/thông báo và trả lời các câu hỏi.",
            }

        # 6. Fill in the blank / Complete the sentence / Grammar
        if any(k in text_lower for k in ['complete the sentence', 'fill in', 'suitable word', 'particle', '( )', '______']):
            return {
                "Bengali": "বাক্যটি সম্পূর্ণ করার জন্য সবচেয়ে উপযুক্ত বিকল্পটি নির্বাচন করুন।",
                "English": text_source or "Choose the most suitable word or phrase to complete the sentence.",
                "Chinese": "选择最合适的词或短语来完成句子。",
                "Indonesian": "Pilihlah kata atau frasa yang paling tepat untuk melengkapi kalimat.",
                "Khmer": "ចូរជ្រើសរើសពាក្យ ឬឃ្លាដែលស័ក្តិសមបំផុតដើម្បីបំពេញប្រយោគ។",
                "Mongolian": "Өгүүлбэрийг гүйцээхийн тулд хамгийн тохиромжтой үг буюу хэллэгийг сонгоно уу.",
                "Myanmar": "စာကြောင်းကို ပြီးပြည့်စုံစေရန် အသင့်တော်ဆုံး စကားလုံး သို့မဟုတ် စကားစုကို ရွေးချယ်ပါ။",
                "Nepali": "वाक्य पूरा गर्नको लागि सबैभन्दा उपयुक्त शब्द वा वाक्यांश छान्नुहोस्।",
                "Thai": "เลือกคำหรือวลีที่เหมาะสมที่สุดเพื่อเติมเต็มประโยค",
                "Vietnamese": "Chọn từ hoặc cụm từ thích hợp nhất để hoàn thành câu.",
            }

        # 7. Kanji Reading (Underlined Kanji -> Hiragana)
        if any(k in text_lower for k in ['underlined', 'kanji', 'hiragana', '漢字', '下線', '線']) or self.section == self.Section.SCRIPT_VOCAB:
            return {
                "Bengali": "নিচে দাগ দেওয়া কাঞ্জি শব্দটি হিরাগানায় কীভাবে লিখবেন? সঠিকটি নির্বাচন করুন।",
                "English": text_source or "How do you write the underlined kanji word in hiragana? Choose the correct one.",
                "Chinese": "带有下划线的汉字单词的平假名是什么？请选择正确的答案。",
                "Indonesian": "Bagaimanakah Anda menuliskan hiragana dari kanji yang digarisbawahi? Pilihlah yang benar.",
                "Khmer": "តើពាក្យកាន់ជើដែលបានគូសបន្ទាត់ពីក្រោមអាចសរសេរយ៉ាងដូចម្តេចដោយប្រើហ៊ីរ៉ាហ្គាណា? ចូរជ្រើសរើសចម្លើយមួយដែលត្រឹមត្រូវ។",
                "Mongolian": "Доогуур зураастай ханзтай үгийг Хирагана-гаар яаж бичих вэ? Зөв зүйлийг сонгоно уу.",
                "Myanmar": "မျဉ်းတားထားသော Kanji စကားလုံးများကို ဟိရဂဏဖြင့်မည်သို့ရေးမည်နည်း။ အမှန်ကိုရွေးပါ။",
                "Nepali": "लाइन लगाइएको कान्जी शब्दलाई हिरागानामा कसरी लेख्नुहुन्छ? सही उत्तर चयन गर्नुहोस्।",
                "Thai": "คำที่เขียนด้วยคันจิที่ขีดเส้นใต้นี้เขียนเป็นฮิรางานะว่าอย่างไร เลือกข้อที่ถูกต้อง",
                "Vietnamese": "Cụm từ chữ Hán gạch chân được viết như thế nào bằng chữ Hiragana? Hãy chọn đáp án đúng.",
            }

        # 8. General fallback
        return {
            "Bengali": "বিকল্পগুলো থেকে সঠিক উত্তরটি নির্বাচন করুন।",
            "English": text_source or "Choose the correct answer from the options.",
            "Chinese": "从选项中选择正确答案。",
            "Indonesian": "Pilihlah jawaban yang benar dari pilihan yang ada.",
            "Khmer": "ចូរជ្រើសរើសចម្លើយដែលត្រឹមត្រូវពីជម្រើស។",
            "Mongolian": "Сонголтуудаас зөв хариултыг сонгоно уу.",
            "Myanmar": "ရွေးချယ်စရာများထဲမှ မှန်ကန်သောအဖြေကို ရွေးပါ။",
            "Nepali": "विकल्पहरूबाट सही उत्तर छान्नुहोस्।",
            "Thai": "เลือกคำตอบที่ถูกต้องจากตัวเลือก",
            "Vietnamese": "Hãy chọn đáp án đúng từ các lựa chọn.",
        }

    def get_translations(self):
        """Returns a dict of 10 language translations for the instruction/pre-prompt."""
        text_source = (self.instruction or self.prompt or "").strip()
        text_lower = text_source.lower()
        
        base = self._get_default_translations_for_text(text_source, text_lower)
        if isinstance(self.translations, dict) and self.translations:
            base.update(self.translations)
        return base

    def __str__(self):
        return f"{self.get_section_display()} - {self.get_type_display()} Question (Order {self.order_index}) for {self.test.title}"


    class Meta:
        ordering = ['order_index']



class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    label = models.CharField(max_length=255, blank=True)
    image = models.FileField(upload_to="options/images/", null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    order_index = models.PositiveIntegerField(default=0)

    def __str__(self):
        label_text = self.label or "(Image Option)"
        return f"{label_text} ({'Correct' if self.is_correct else 'Incorrect'})"

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
