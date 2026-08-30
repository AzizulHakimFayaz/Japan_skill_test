from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Test, Question, AnswerOption, Attempt

class TestViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = "testuser"
        self.password = "password123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        # Free practice test
        self.free_test = Test.objects.create(
            title="Free JFT Practice Test",
            description="A free test open to everyone.",
            requires_account=False,
            is_published=True,
            time_limit_seconds=600
        )
        
        # Account required practice test
        self.paid_test = Test.objects.create(
            title="Premium JFT Practice Test",
            description="Requires login.",
            requires_account=True,
            is_published=True
        )
        
        # Add a question to free test
        self.free_question = Question.objects.create(
            test=self.free_test,
            section=Question.Section.SCRIPT_VOCAB,
            type=Question.QuestionType.TEXT,
            prompt="What is 'Konnichiwa' in Japanese?",
            order_index=1
        )

        self.free_opt_correct = AnswerOption.objects.create(
            question=self.free_question,
            label="こんにちは",
            is_correct=True,
            order_index=1
        )
        self.free_opt_incorrect = AnswerOption.objects.create(
            question=self.free_question,
            label="さようなら",
            is_correct=False,
            order_index=2
        )

    def test_admin_changelist_views(self):
        superuser = User.objects.create_superuser(username="adminuser", password="adminpassword123", email="admin@example.com")
        self.client.login(username="adminuser", password="adminpassword123")
        
        # Test changelist for Test model
        resp_test = self.client.get(reverse('admin:tests_test_changelist'))
        self.assertEqual(resp_test.status_code, 200)
        self.assertContains(resp_test, self.paid_test.title)

        # Test changelist for QuestionGroup model
        resp_group = self.client.get(reverse('admin:tests_questiongroup_changelist'))
        self.assertEqual(resp_group.status_code, 200)

        # Test changelist for Question model
        resp_q = self.client.get(reverse('admin:tests_question_changelist'))
        self.assertEqual(resp_q.status_code, 200)

        # Test changelist for Attempt model
        resp_att = self.client.get(reverse('admin:tests_attempt_changelist'))
        self.assertEqual(resp_att.status_code, 200)

    def test_api_tests_list(self):
        response = self.client.get(reverse('api_tests_list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        titles = [t['title'] for t in data['tests']]
        self.assertIn(self.free_test.title, titles)
        self.assertIn(self.paid_test.title, titles)

    def test_api_quiz_data_access(self):
        # Free test quiz data
        response = self.client.get(reverse('api_quiz_data', args=[self.free_test.id]))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['test']['id'], self.free_test.id)
        self.assertEqual(data['total_questions'], 1)
        self.assertEqual(len(data['steps']), 1)


    def test_api_submit_quiz_anonymous(self):
        post_data = {
            "answers": {
                str(self.free_question.id): self.free_opt_correct.id
            }
        }
        response = self.client.post(
            reverse('api_submit_quiz', args=[self.free_test.id]),
            data=post_data,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['score'], 1)
        self.assertEqual(data['total_questions'], 1)

    def test_api_info_views(self):
        resp_jft = self.client.get(reverse('api_jft_info'))
        self.assertEqual(resp_jft.status_code, 200)
        resp_ssw = self.client.get(reverse('api_ssw_info'))
        self.assertEqual(resp_ssw.status_code, 200)



    def test_csv_question_import_helper(self):
        from .utils import import_questions_from_csv, generate_sample_csv_string
        from .models import QuestionGroup
        sample_csv = generate_sample_csv_string()
        count, errors = import_questions_from_csv(self.free_test, sample_csv, auto_generate_audio=False)
        self.assertEqual(count, 5)
        self.assertEqual(len(errors), 0)
        self.assertEqual(self.free_test.questions.count(), 6) # 1 original + 5 imported
        self.assertTrue(QuestionGroup.objects.filter(test=self.free_test, title="Reading Passage 1 - Town Magazine").exists())

    def test_dialogue_script_parser(self):
        from .audio_generator import parse_dialogue_script, resolve_voice_for_speaker

        # 1. Bracketed format (user demo)
        script1 = "[Nanami], [田中さん、今週の日曜日にバーベキューをしませんか。], [Keita], [日曜日ですね。土曜日なら大丈夫です。]"
        turns1 = parse_dialogue_script(script1)
        self.assertEqual(len(turns1), 2)
        self.assertEqual(turns1[0]['speaker'], "Nanami")
        self.assertEqual(turns1[0]['voice'], "ja-JP-NanamiNeural")
        self.assertEqual(turns1[0]['text'], "田中さん、今週の日曜日にバーベキューをしませんか。")
        self.assertEqual(turns1[1]['speaker'], "Keita")
        self.assertEqual(turns1[1]['voice'], "ja-JP-KeitaNeural")
        self.assertEqual(turns1[1]['text'], "日曜日ですね。土曜日なら大丈夫です。")

        # 2. Multi-line colon format
        script2 = "A：しごとは どうですか。\nB：たのしいです。"
        turns2 = parse_dialogue_script(script2)
        self.assertEqual(len(turns2), 2)
        self.assertEqual(turns2[0]['voice'], "ja-JP-NanamiNeural")
        self.assertEqual(turns2[1]['voice'], "ja-JP-KeitaNeural")

        # 3. Comma-separated pairs
        script3 = "Nanami, こんにちは, Keita, やあ"
        turns3 = parse_dialogue_script(script3)
        self.assertEqual(len(turns3), 2)

        # 4. Single text narration
        script4 = "あしたは あめが ふるでしょう。"
        turns4 = parse_dialogue_script(script4)
        self.assertEqual(len(turns4), 1)
        self.assertEqual(turns4[0]['voice'], "ja-JP-NanamiNeural")

    def test_audio_generator_and_model_save(self):
        from .audio_generator import generate_and_save_question_audio, generate_audio_from_script
        
        # Test generating audio bytes
        test_script = "[Nanami], [こんにちは。]"
        audio_bytes = generate_audio_from_script(test_script)
        self.assertGreater(len(audio_bytes), 1000)

        # Test saving to Question instance
        q = Question.objects.create(
            test=self.free_test,
            section=Question.Section.LISTENING,
            type=Question.QuestionType.AUDIO,
            prompt="Listen to the audio.",
            audio_script="[Nanami], [はじめまして。], [Keita], [どうぞよろしく。]",
            order_index=20
        )
        saved = generate_and_save_question_audio(q, overwrite=True)
        self.assertTrue(saved)
        self.assertTrue(bool(q.audio))
        self.assertTrue(q.audio.name.endswith(".mp3"))

    def test_intelligent_translations(self):
        # 1. Illustration question
        q_img = Question.objects.create(
            test=self.free_test,
            section=Question.Section.SCRIPT_VOCAB,
            type=Question.QuestionType.IMAGE,
            instruction="Look at the illustration and choose the correct word.",
            prompt="Choose the word for picture",
            order_index=10
        )
        trans_img = q_img.get_translations()
        self.assertEqual(trans_img['Bengali'], "ছবিটি দেখুন এবং সঠিক শব্দটি নির্বাচন করুন।")
        self.assertEqual(trans_img['English'], "Look at the illustration and choose the correct word.")

        # 2. Kanji reading question
        q_kanji = Question.objects.create(
            test=self.free_test,
            section=Question.Section.SCRIPT_VOCAB,
            type=Question.QuestionType.TEXT,
            instruction="How do you write the underlined kanji word in hiragana? Choose the correct one.",
            prompt="水道",
            order_index=11
        )
        trans_kanji = q_kanji.get_translations()
        self.assertEqual(trans_kanji['Bengali'], "নিচে দাগ দেওয়া কাঞ্জি শব্দটি হিরাগানায় কীভাবে লিখবেন? সঠিকটি নির্বাচন করুন।")

        # 3. Custom translation override
        q_custom = Question.objects.create(
            test=self.free_test,
            section=Question.Section.READING,
            type=Question.QuestionType.TEXT,
            instruction="Read the notice.",
            translations={"Bengali": "কাস্টম বাংলা অনুবাদ"},
            order_index=12
        )
        trans_custom = q_custom.get_translations()
        self.assertEqual(trans_custom['Bengali'], "কাস্টম বাংলা অনুবাদ")



