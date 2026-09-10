from django.test import TestCase, TransactionTestCase, Client
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

    def test_download_sample_ssw_csv(self):
        superuser = User.objects.create_superuser(username="admin_ssw", password="adminpassword123", email="ssw@example.com")
        self.client.login(username="admin_ssw", password="adminpassword123")
        resp = self.client.get(reverse('admin:download_sample_ssw_csv'))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv; charset=utf-8-sig')
        content = resp.content.decode('utf-8-sig')
        self.assertIn('audio', content)
        self.assertIn('occupational', content)
        self.assertIn('audio_typing', content)

    def test_ssw_csv_import_with_typing(self):
        from .utils import import_questions_from_csv, generate_sample_ssw_csv_string
        ssw_test = Test.objects.create(
            title="SSW Bulk Test",
            category=Test.Category.SKILL,
            is_published=True
        )
        csv_str = generate_sample_ssw_csv_string()
        count, errors = import_questions_from_csv(ssw_test, csv_str, auto_generate_audio=False)
        self.assertEqual(count, 5)
        self.assertEqual(len(errors), 0)

        # Verify typing question has accepted answer option
        typing_q = ssw_test.questions.filter(type=Question.QuestionType.AUDIO_TYPING).first()
        self.assertIsNotNone(typing_q)
        self.assertTrue(typing_q.options.filter(label="いらっしゃいませ", is_correct=True).exists())

    def test_ssw_typing_submission_and_results(self):
        ssw_test = Test.objects.create(
            title="SSW Typing Eval",
            category=Test.Category.SKILL,
            is_published=True
        )
        q_type = Question.objects.create(
            test=ssw_test,
            section=Question.Section.AUDIO,
            type=Question.QuestionType.TYPING,
            prompt="Type greeting",
            order_index=1
        )
        AnswerOption.objects.create(question=q_type, label="いらっしゃいませ", is_correct=True, order_index=1)
        AnswerOption.objects.create(question=q_type, label="irasshaimase", is_correct=True, order_index=2)

        # Submit correct typing answer in Romaji
        post_data = {
            "answers": {
                str(q_type.id): "irasshaimase"
            }
        }
        resp = self.client.post(reverse('api_submit_quiz', args=[ssw_test.id]), data=post_data, content_type="application/json")
        self.assertEqual(resp.status_code, 201)
        attempt_id = resp.json()['attempt_id']
        self.assertEqual(resp.json()['score'], 1)

        # Fetch results
        res_resp = self.client.get(reverse('api_attempt_results', args=[attempt_id]))
        self.assertEqual(res_resp.status_code, 200)
        res_data = res_resp.json()
        self.assertTrue(res_data['attempt']['passed'])
        self.assertEqual(res_data['attempt']['assessment_level'], "合格 (Passed)")
        self.assertEqual(res_data['section_breakdown']['audio']['correct'], 1)

    def test_export_test_questions_to_csv_helper(self):
        from .utils import export_test_questions_to_csv
        csv_str = export_test_questions_to_csv(self.free_test)
        self.assertIn('group_title,section,type', csv_str)
        self.assertIn('option_1,option_2,option_3,option_4', csv_str)
        self.assertIn(self.free_question.prompt, csv_str)

    def test_admin_export_test_csv_view(self):
        superuser = User.objects.create_superuser(username="admin_exporter", password="password123", email="exp@example.com")
        self.client.login(username="admin_exporter", password="password123")
        resp = self.client.get(reverse('admin:export_test_csv', args=[self.free_test.id]))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv; charset=utf-8-sig')
        self.assertIn('attachment;', resp['Content-Disposition'])

    def test_api_sample_csv_download_endpoints(self):
        # SSW sample CSV API
        resp_ssw = self.client.get(reverse('api_sample_ssw_csv'))
        self.assertEqual(resp_ssw.status_code, 200)
        self.assertEqual(resp_ssw['Content-Type'], 'text/csv; charset=utf-8-sig')
        self.assertIn('ssw_prometric_test_questions_template.csv', resp_ssw['Content-Disposition'])

        # JFT sample CSV API
        resp_jft = self.client.get(reverse('api_sample_jft_csv'))
        self.assertEqual(resp_jft.status_code, 200)
        self.assertEqual(resp_jft['Content-Type'], 'text/csv; charset=utf-8-sig')
        self.assertIn('jft_test_questions_template.csv', resp_jft['Content-Disposition'])

    def test_api_test_export_csv(self):
        """Tests GET /api/tests/<id>/export-csv/ downloads CSV correctly for public and staff."""
        resp = self.client.get(reverse('api_test_export_csv', args=[self.free_test.id]))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv; charset=utf-8-sig')
        self.assertIn('questions.csv', resp['Content-Disposition'])
        self.assertIn(self.free_question.prompt, resp.content.decode('utf-8-sig'))

    def test_api_test_import_csv_staff_permission(self):
        """Tests POST /api/tests/<id>/import-csv/ rejects unauthorized candidates and accepts staff."""
        from django.core.files.uploadedfile import SimpleUploadedFile
        from .utils import generate_sample_ssw_csv_string

        csv_content = generate_sample_ssw_csv_string().encode('utf-8')
        uploaded = SimpleUploadedFile('import.csv', csv_content, content_type='text/csv')

        # 1. Anonymous candidate -> 401/403 Forbidden
        resp_anon = self.client.post(
            reverse('api_test_import_csv', args=[self.free_test.id]),
            {'csv_file': uploaded}
        )
        self.assertIn(resp_anon.status_code, [401, 403])

        # 2. Staff user -> 200 OK and imports questions
        staff_user = User.objects.create_superuser(username="api_staff_importer", password="password123", email="api_staff@example.com")
        self.client.login(username="api_staff_importer", password="password123")
        uploaded.seek(0)
        resp_staff = self.client.post(
            reverse('api_test_import_csv', args=[self.free_test.id]),
            {'csv_file': uploaded, 'clear_existing': 'true', 'auto_generate_audio': 'false'}
        )
        self.assertEqual(resp_staff.status_code, 200)
        self.assertEqual(resp_staff.json()['status'], 'success')
        self.assertGreater(resp_staff.json()['created_count'], 0)

    def test_full_ssw_csv_roundtrip(self):
        """Tests importing SSW sample CSV, then exporting it to CSV, ensuring full fidelity."""
        from .utils import import_questions_from_csv, export_test_questions_to_csv, generate_sample_ssw_csv_string

        ssw_test = Test.objects.create(
            title="SSW Roundtrip Test",
            category=Test.Category.SKILL,
            is_published=True
        )

        sample_csv = generate_sample_ssw_csv_string()
        count, errors = import_questions_from_csv(ssw_test, sample_csv, auto_generate_audio=False)
        self.assertEqual(len(errors), 0)
        self.assertEqual(count, 5)

        # Export test questions
        exported_csv = export_test_questions_to_csv(ssw_test)
        self.assertIn('audio', exported_csv)
        self.assertIn('occupational', exported_csv)
        self.assertIn('audio_typing', exported_csv)
        self.assertIn('いらっしゃいませ', exported_csv)
        self.assertIn('irasshaimase', exported_csv)


class BackgroundAudioWorkerTestCase(TransactionTestCase):
    def test_background_audio_worker_and_admin_view(self):
        """Tests generate_test_missing_audio_worker and admin generate audio endpoint."""
        from .utils import generate_test_missing_audio_worker
        from django.contrib.auth.models import User

        test_obj = Test.objects.create(
            title="Audio Worker Test",
            category=Test.Category.BASIC,
            is_published=True
        )
        q = Question.objects.create(
            test=test_obj,
            section=Question.Section.LISTENING,
            type=Question.QuestionType.AUDIO,
            prompt="Listen to audio.",
            audio_script="[Nanami], [こんにちは。]",
            order_index=1
        )

        # 1. Test worker directly
        success_q, success_g = generate_test_missing_audio_worker(test_id=test_obj.id, overwrite=True)
        self.assertEqual(success_q, 1)
        q.refresh_from_db()
        self.assertTrue(bool(q.audio))

        # 2. Test admin generate audio endpoint
        superuser = User.objects.create_superuser(username="admin_audio", password="adminpassword123", email="audio@example.com")
        self.client.login(username="admin_audio", password="adminpassword123")
        resp = self.client.get(reverse('admin:generate_test_audio', args=[test_obj.id]))
        self.assertEqual(resp.status_code, 302)

        # Wait for any background threads to finish cleanly before test DB teardown
        import threading
        for t in threading.enumerate():
            if t.name.startswith("AudioWorker-"):
                t.join(timeout=5.0)







