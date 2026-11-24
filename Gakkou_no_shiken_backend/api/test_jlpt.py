from django.test import TestCase
from rest_framework.test import APIClient

from tests.jlpt_importer import import_jlpt_json_data
from tests.models import JLPTAttempt, JLPTQuestion, JLPTSet


class JLPTImporterAndAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_import_and_idempotent_translation_patch_preserves_attempts(self):
        # 1. Initial upload with NO answers or Bangla translations yet
        raw_payload = {
            "level": "N5",
            "category": "Vocabulary",
            "tests": [
                {
                    "test_id": 9001,
                    "set_number": 1,
                    "title": "N5 Vocabulary Set 1",
                    "mcq_questions": [
                        {
                            "id": 101,
                            "key": "q_101",
                            "type": "mcq",
                            "section": "Vocabulary",
                            "instruction": "Choose reading",
                            "question": "電車 に のります。",
                            "underline": "電車",
                            "options": ["でんしゃ", "てんしゃ", "でんじゃ", "てんじゃ"],
                            "hint_en": "Means train",
                        }
                    ],
                }
            ],
        }
        stats1 = import_jlpt_json_data(raw_payload)
        self.assertEqual(stats1["sets_created"], 1)
        self.assertEqual(stats1["questions_created"], 1)

        s = JLPTSet.objects.get(level="N5", external_test_id=9001)
        self.assertFalse(s.is_ready)
        self.assertEqual(s.question_count, 1)
        self.assertEqual(s.answered_count, 0)

        # Create a student attempt before patching translations
        attempt = JLPTAttempt.objects.create(jlpt_set=s, score=0, total_questions=1, answers={"1": 1})

        # 2. Patch translations & answer_index later via lightweight patch JSON
        patch_payload = [
            {
                "level": "N5",
                "key": "q_101",
                "answer_index": 1,
                "answer_text": "でんしゃ",
                "hints": {"bn": "এর অর্থ ট্রেন"},
                "explanation": {"en": "電車 is read でんしゃ.", "bn": "電車 এর উচ্চারণ でんしゃ।"},
            }
        ]
        stats2 = import_jlpt_json_data(patch_payload)
        self.assertEqual(stats2["questions_updated"], 1)

        s.refresh_from_db()
        self.assertTrue(s.is_ready)
        self.assertEqual(s.answered_count, 1)
        self.assertEqual(s.translated_count, 1)

        q = JLPTQuestion.objects.get(jlpt_set=s, external_key="q_101")
        # Both original hint_en and patched bn hint must be preserved!
        self.assertEqual(q.hints.get("en"), "Means train")
        self.assertEqual(q.hints.get("bn"), "এর অর্থ ট্রেন")
        self.assertEqual(q.explanation.get("bn"), "電車 এর উচ্চারণ でんしゃ।")
        # Existing attempt is intact
        self.assertTrue(JLPTAttempt.objects.filter(pk=attempt.pk).exists())

    def test_jlpt_endpoints_anti_cheat_and_grading(self):
        import_jlpt_json_data(
            {
                "level": "N1",
                "category": "Vocabulary",
                "tests": [
                    {
                        "test_id": 10443,
                        "set_number": 1,
                        "title": "N1 Vocab Set 1",
                        "mcq_questions": [
                            {
                                "id": 25279,
                                "key": "q_25279",
                                "question": "旅客機 が とびます。",
                                "underline": "旅客機",
                                "options": ["りょこうき", "りょかくぎ", "りょがくき", "りょかくき"],
                                "answer_index": 4,
                                "answer_text": "りょかくき",
                                "explanation": {"en": "Passenger plane", "bn": "যাত্রীবাহী বিমান"},
                            }
                        ],
                    }
                ],
            }
        )

        # Overview
        ov = self.client.get("/api/jlpt/overview/")
        self.assertEqual(ov.status_code, 200)
        self.assertEqual(ov.data["totals"]["total_sets"], 1)
        self.assertEqual(ov.data["totals"]["ready_sets"], 1)

        # Sets list
        lst = self.client.get("/api/jlpt/sets/?level=N1&ready_only=1")
        self.assertEqual(lst.status_code, 200)
        self.assertEqual(lst.data["count"], 1)
        set_id = lst.data["results"][0]["id"]

        # Detail (ANTI-CHEAT: no answer_index or explanation leaked!)
        det = self.client.get(f"/api/jlpt/sets/{set_id}/")
        self.assertEqual(det.status_code, 200)
        q_item = det.data["questions"][0]
        self.assertNotIn("answer_index", q_item)
        self.assertNotIn("explanation", q_item)

        # Submit exam -> graded + 7-language explanation unlocked!
        sub = self.client.post(
            f"/api/jlpt/sets/{set_id}/submit/",
            {"answers": {str(q_item["id"]): 4}},
            format="json",
        )
        self.assertEqual(sub.status_code, 200)
        self.assertEqual(sub.data["score"], 1)
        self.assertTrue(sub.data["passed"])
        self.assertEqual(sub.data["review"][0]["answer_index"], 4)
        self.assertEqual(sub.data["review"][0]["explanation"]["bn"], "যাত্রীবাহী বিমান")

    def test_placement_level_checker(self):
        get_res = self.client.get("/api/jlpt/placement-test/")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.data["total_questions"], 10)
        self.assertNotIn("answer_index", get_res.data["questions"][0])

        # Submit 5 correct answers -> should recommend N3
        submit_res = self.client.post(
            "/api/jlpt/placement-test/submit/",
            {
                "answers": {
                    "pl_n5_1": 1,
                    "pl_n5_2": 2,
                    "pl_n4_1": 2,
                    "pl_n4_2": 2,
                    "pl_n3_1": 1,
                }
            },
            format="json",
        )
        self.assertEqual(submit_res.status_code, 200)
        self.assertEqual(submit_res.data["score"], 5)
        self.assertEqual(submit_res.data["recommended_level"], "N3")
        self.assertEqual(len(submit_res.data["breakdown"]), 5)
