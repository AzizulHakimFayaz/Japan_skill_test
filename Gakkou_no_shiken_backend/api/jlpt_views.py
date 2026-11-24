"""
JLPT Mock Test Hub & Short Placement Level Checker API Views.

Endpoints:
  GET  /api/jlpt/overview/                -> Per-level N5-N1 stats & category counts
  GET  /api/jlpt/sets/                    -> Paginated, filterable JLPT mock test sets
  GET  /api/jlpt/sets/<id>/               -> Quiz payload (anti-cheat: answers & explanations stripped)
  POST /api/jlpt/sets/<id>/submit/        -> Grades exam, saves JLPTAttempt, returns 7-language explanations
  GET  /api/jlpt/placement-test/          -> 10-question diagnostic spanning N5 -> N1 (2 per level)
  POST /api/jlpt/placement-test/submit/   -> Estimates user's JLPT level + 5-level breakdown + explanations
"""

from collections import OrderedDict
import math

from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.schema_sync import ensure_schema_synced
from tests.models import JLPTAttempt, JLPTPassage, JLPTQuestion, JLPTSet

LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"]

# Curated, verified 10-question JLPT Level Checker (2 per level: N5 -> N1)
# Works on Day 1 for all 5 levels regardless of which levels have been translated in DB.
JLPT_PLACEMENT_QUESTIONS = [
    {
        "id": "pl_n5_1",
        "level": "N5",
        "section": "Vocabulary",
        "instruction": "Choose the correct reading for the underlined kanji.",
        "question": "まいにち 電車 で がっこう へ 行きます。",
        "underline": "電車",
        "options": ["でんしゃ", "てんしゃ", "でんじゃ", "てんじゃ"],
        "answer_index": 1,
        "answer_text": "でんしゃ",
        "explanation": {
            "en": "電車 (でんしゃ) means 'train'. 電 is read でん and 車 is read しゃ here.",
            "bn": "電車 (でんしゃ) এর অর্থ 'ট্রেন'। এখানে 電 = でん এবং 車 = しゃ।",
            "id": "電車 (でんしゃ) berarti 'kereta listrik'.",
            "ne": "電車 (でんしゃ) को अर्थ 'रेल' हो।",
            "vi": "電車 (でんしゃ) có nghĩa là 'tàu điện'.",
            "tl": "Ang 電車 (でんしゃ) ay nangangahulugang 'tren'.",
            "hi": "電車 (でんしゃ) का अर्थ 'ट्रेन' होता है।",
        },
    },
    {
        "id": "pl_n5_2",
        "level": "N5",
        "section": "Grammar",
        "instruction": "Choose the best particle to complete the sentence.",
        "question": "きのう ともだち （　　） えいが を みました。",
        "underline": "",
        "options": ["に", "と", "を", "で"],
        "answer_index": 2,
        "answer_text": "と",
        "explanation": {
            "en": "The particle と marks the person you do an action together with ('with a friend').",
            "bn": "কারো সাথে কোনো কাজ করা বোঝাতে と পার্টিকেল ব্যবহৃত হয় ('বন্ধুর সাথে')।",
            "id": "Partikel と digunakan untuk menyatakan 'bersama' seseorang.",
            "ne": "कुनै व्यक्तिसँग मिलेर काम गर्दा と पार्टिकल प्रयोग गरिन्छ।",
            "vi": "Trợ từ と diễn tả việc làm gì đó 'cùng với' ai.",
            "tl": "Ang particle na と ay ginagamit para sa 'kasama ang' isang tao.",
            "hi": "किसी के साथ कोई कार्य करने के लिए と पार्टिकल का उपयोग होता है।",
        },
    },
    {
        "id": "pl_n4_1",
        "level": "N4",
        "section": "Vocabulary",
        "instruction": "Choose the correct reading for the underlined kanji.",
        "question": "あしたの 会議 は 午前 10時 から です。",
        "underline": "会議",
        "options": ["かいき", "かいぎ", "がいぎ", "かえぎ"],
        "answer_index": 2,
        "answer_text": "かいぎ",
        "explanation": {
            "en": "会議 (かいぎ) means 'meeting / conference'.",
            "bn": "会議 (かいぎ) এর অর্থ 'মিটিং বা সভা'।",
            "id": "会議 (かいぎ) berarti 'rapat / pertemuan'.",
            "ne": "会議 (かいぎ) को अर्थ 'बैठक' हो।",
            "vi": "会議 (かいぎ) có nghĩa là 'cuộc họp'.",
            "tl": "Ang 会議 (かいぎ) ay nangangahulugang 'pulong / meeting'.",
            "hi": "会議 (かいぎ) का अर्थ 'बैठक / मीटिंग' होता है।",
        },
    },
    {
        "id": "pl_n4_2",
        "level": "N4",
        "section": "Grammar",
        "instruction": "Choose the best expression to complete the sentence.",
        "question": "にほんご が はなせる （　　）、まいにち れんしゅうして います。",
        "underline": "",
        "options": ["ために", "ように", "ので", "のに"],
        "answer_index": 2,
        "answer_text": "ように",
        "explanation": {
            "en": "With potential verbs like はなせる (able to speak), use ように to express 'so that I can speak Japanese'.",
            "bn": "সম্ভাব্য ক্রিয়া (はなせる - বলতে পারা) এর পরে 'যাতে পারি' বোঝাতে ように বসে।",
            "id": "Dengan kata kerja potensial (はなせる), gunakan ように untuk menyatakan 'agar bisa'.",
            "ne": "सक्ने क्रिया (はなせる) सँग 'सकियोस् भनेर' भन्न ように प्रयोग गरिन्छ।",
            "vi": "Với động từ khả năng (はなせる), dùng ように để diễn tả mục đích 'để có thể'.",
            "tl": "Sa potential verbs tulad ng はなせる, gamitin ang ように para sa 'upang makapagsalita'.",
            "hi": "संभाव्य क्रिया (はなせる) के साथ 'ताकि बोल सकूँ' के लिए ように का प्रयोग होता है।",
        },
    },
    {
        "id": "pl_n3_1",
        "level": "N3",
        "section": "Vocabulary",
        "instruction": "Choose the correct reading for the underlined kanji.",
        "question": "この 仕事 は 経験 が なくても できます。",
        "underline": "経験",
        "options": ["けいけん", "けいげん", "きょけん", "けけん"],
        "answer_index": 1,
        "answer_text": "けいけん",
        "explanation": {
            "en": "経験 (けいけん) means 'experience'. Note 検/験 is read けん.",
            "bn": "経験 (けいけん) এর অর্থ 'অভিজ্ঞতা'।",
            "id": "経験 (けいけん) berarti 'pengalaman'.",
            "ne": "経験 (けいけん) को अर्थ 'अनुभव' हो।",
            "vi": "経験 (けいけん) có nghĩa là 'kinh nghiệm'.",
            "tl": "Ang 経験 (けいけん) ay nangangahulugang 'karanasan'.",
            "hi": "経験 (けいけん) का अर्थ 'अनुभव' होता है।",
        },
    },
    {
        "id": "pl_n3_2",
        "level": "N3",
        "section": "Grammar",
        "instruction": "Choose the best grammar pattern.",
        "question": "あめ が ふる （　　）、しあい は ちゅうし に なりました。",
        "underline": "",
        "options": ["おかげで", "せいで", "かわりに", "たびに"],
        "answer_index": 2,
        "answer_text": "せいで",
        "explanation": {
            "en": "せいで means 'because of (a negative outcome)' — the match was canceled due to rain. おかげで is for positive outcomes.",
            "bn": "নেতিবাচক ফলাফলের কারণ বোঝাতে せいで ব্যবহৃত হয় ('বৃষ্টির কারণে খেলা বাতিল হয়েছে')।",
            "id": "せいで digunakan untuk penyebab hasil negatif ('karena hujan, pertandingan dibatalkan').",
            "ne": "नकारात्मक परिणामको कारण जनाउन せいで प्रयोग गरिन्छ।",
            "vi": "せいで diễn tả nguyên nhân dẫn đến kết quả tiêu cực ('vì trời mưa nên trận đấu bị hủy').",
            "tl": "Ang せいで ay ginagamit para sa dahilan ng negatibong resulta.",
            "hi": "नकारात्मक परिणाम के कारण के लिए せいで ('बारिश की वजह से') का उपयोग होता है।",
        },
    },
    {
        "id": "pl_n2_1",
        "level": "N2",
        "section": "Vocabulary",
        "instruction": "Choose the correct reading for the underlined kanji.",
        "question": "新しい 法律 が 来年 から 実施 される。",
        "underline": "実施",
        "options": ["じっし", "じつし", "じっせ", "じちし"],
        "answer_index": 1,
        "answer_text": "じっし",
        "explanation": {
            "en": "実施 (じっし) means 'implementation / enforcement' (e.g., implementing a law or exam).",
            "bn": "実施 (じっし) এর অর্থ 'বাস্তবায়ন বা কার্যকর করা'।",
            "id": "実施 (じっし) berarti 'pelaksanaan / implementasi'.",
            "ne": "実施 (じっし) को अर्थ 'कार्यान्वयन' हो।",
            "vi": "実施 (じっし) có nghĩa là 'thực thi / triển khai'.",
            "tl": "Ang 実施 (じっし) ay nangangahulugang 'pagpapatupad'.",
            "hi": "実施 (じっし) का अर्थ 'कार्यान्वयन / लागू करना' होता है।",
        },
    },
    {
        "id": "pl_n2_2",
        "level": "N2",
        "section": "Grammar",
        "instruction": "Choose the best N2 grammar pattern.",
        "question": "かれ は 日本 に 10年 も 住んで いる （　　）、日本語 が とても じょうずだ。",
        "underline": "",
        "options": ["わけがない", "だけあって", "にもかかわらず", "どころか"],
        "answer_index": 2,
        "answer_text": "だけあって",
        "explanation": {
            "en": "だけあって means 'as expected of someone who...' — 'As expected of someone who lived in Japan for 10 years, his Japanese is very good.'",
            "bn": "だけあって এর অর্থ 'যেহেতু (এত অভিজ্ঞতা আছে), তাই প্রত্যাশিতভাবেই...'।",
            "id": "だけあって berarti 'sesuai dugaan karena sudah...'.",
            "ne": "だけあって को अर्थ 'भएकै कारणले अपेक्षाअनुसार...' हो।",
            "vi": "だけあって nghĩa là 'quả đúng là / xứng đáng với việc đã...'.",
            "tl": "Ang だけあって ay nangangahulugang 'gaya ng inaasahan dahil...'.",
            "hi": "だけあって का अर्थ है 'जैसा कि अपेक्षित है क्योंकि...'।",
        },
    },
    {
        "id": "pl_n1_1",
        "level": "N1",
        "section": "Vocabulary",
        "instruction": "Choose the correct reading for the underlined kanji.",
        "question": "この 会社 は 業績 が 著しく 伸びて いる。",
        "underline": "著しく",
        "options": ["いちじるしく", "はげしく", "きびしく", "はなはだしく"],
        "answer_index": 1,
        "answer_text": "いちじるしく",
        "explanation": {
            "en": "著しく (いちじるしく) means 'remarkably / dramatically / significantly'.",
            "bn": "著しく (いちじるしく) এর অর্থ 'উল্লেখযোগ্যভাবে বা ব্যাপকভাবে'।",
            "id": "著しく (いちじるしく) berarti 'secara mencolok / drastis'.",
            "ne": "著しく (いちじるしく) को अर्थ 'उल्लेखनीय रूपमा' हो।",
            "vi": "著しく (いちじるしく) có nghĩa là 'một cách đáng kể / rõ rệt'.",
            "tl": "Ang 著しく (いちじるしく) ay nangangahulugang 'kapansin-pansin / malaki ang pagbabago'.",
            "hi": "著しく (いちじるしく) का अर्थ 'उल्लेखनीय रूप से' होता है।",
        },
    },
    {
        "id": "pl_n1_2",
        "level": "N1",
        "section": "Grammar",
        "instruction": "Choose the best N1 grammar pattern.",
        "question": "事実 を 知った （　　）、だまって 見ている わけには いかない。",
        "underline": "",
        "options": ["からには", "ものの", "つつも", "ばかりに"],
        "answer_index": 1,
        "answer_text": "からには",
        "explanation": {
            "en": "からには means 'now that / since (this is the case), I must...' — 'Now that I know the truth, I cannot just stand by silently.'",
            "bn": "からには এর অর্থ 'যেহেতু (সত্যটা জেনেই গেছি), তাই অবশ্যই...'।",
            "id": "からには berarti 'karena sudah terlanjur..., maka harus...'.",
            "ne": "からには को अर्थ 'थाहा पाइसकेपछि अब...' हो।",
            "vi": "からには nghĩa là 'một khi đã..., thì không thể...'.",
            "tl": "Ang からには ay nangangahulugang 'ngayong alam na ang katotohanan...'.",
            "hi": "からには का अर्थ है 'अब जबकि (सच्चाई जान ली है), तो...'।",
        },
    },
]


def _ensure_jlpt_tables():
    try:
        JLPTSet.objects.exists()
    except Exception:
        ensure_schema_synced()


class JLPTOverviewAPIView(APIView):
    """GET /api/jlpt/overview/ — Per-level N5–N1 stats & category counts."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        _ensure_jlpt_tables()

        levels_data = []
        grand_sets = 0
        grand_ready = 0
        grand_questions = 0
        grand_answered = 0

        for lvl in LEVEL_ORDER:
            lvl_qs = JLPTSet.objects.filter(level=lvl, is_published=True)
            total_sets = lvl_qs.count()
            ready_sets = lvl_qs.filter(is_ready=True).count()
            total_q = JLPTQuestion.objects.filter(jlpt_set__level=lvl, jlpt_set__is_published=True).count()
            answered_q = JLPTQuestion.objects.filter(
                jlpt_set__level=lvl, jlpt_set__is_published=True, answer_index__isnull=False
            ).count()

            cat_rows = (
                lvl_qs.values("category")
                .annotate(
                    total_sets=Count("id"),
                    ready_sets=Count("id", filter=Q(is_ready=True)),
                )
                .order_by("category")
            )

            grand_sets += total_sets
            grand_ready += ready_sets
            grand_questions += total_q
            grand_answered += answered_q

            levels_data.append(
                {
                    "level": lvl,
                    "total_sets": total_sets,
                    "ready_sets": ready_sets,
                    "total_questions": total_q,
                    "answered_questions": answered_q,
                    "categories": list(cat_rows),
                }
            )

        return Response(
            {
                "totals": {
                    "total_sets": grand_sets,
                    "ready_sets": grand_ready,
                    "total_questions": grand_questions,
                    "answered_questions": grand_answered,
                },
                "levels": levels_data,
            }
        )


class JLPTSetListAPIView(APIView):
    """GET /api/jlpt/sets/ — Paginated, filterable JLPT mock test sets."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        _ensure_jlpt_tables()

        level = (request.query_params.get("level") or "").strip().upper()
        category = (request.query_params.get("category") or "").strip()
        ready_only = str(request.query_params.get("ready_only") or "0").lower() in ("1", "true", "yes")
        search = (request.query_params.get("search") or "").strip()
        try:
            page = max(1, int(request.query_params.get("page") or 1))
        except ValueError:
            page = 1
        try:
            page_size = min(60, max(6, int(request.query_params.get("page_size") or 24)))
        except ValueError:
            page_size = 24

        qs = JLPTSet.objects.filter(is_published=True)
        if level in LEVEL_ORDER:
            qs = qs.filter(level=level)
        if category and category.lower() != "all":
            qs = qs.filter(category__iexact=category)
        if ready_only:
            qs = qs.filter(is_ready=True)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(category__icontains=search))

        qs = qs.order_by("-is_ready", "level", "category", "set_number", "id")

        total_count = qs.count()
        total_pages = max(1, math.ceil(total_count / page_size))
        if page > total_pages:
            page = total_pages
        offset = (page - 1) * page_size
        page_items = list(qs[offset : offset + page_size])

        # User's best score per set if authenticated
        best_scores = {}
        if request.user and request.user.is_authenticated and page_items:
            set_ids = [s.id for s in page_items]
            agg = (
                JLPTAttempt.objects.filter(user=request.user, jlpt_set_id__in=set_ids)
                .values("jlpt_set_id")
                .annotate(best_score=Max("score"), attempts=Count("id"))
            )
            for row in agg:
                best_scores[row["jlpt_set_id"]] = {
                    "best_score": row["best_score"],
                    "attempts": row["attempts"],
                }

        results = []
        for s in page_items:
            user_perf = best_scores.get(s.id)
            results.append(
                {
                    "id": s.id,
                    "level": s.level,
                    "category": s.category,
                    "set_number": s.set_number,
                    "title": s.title,
                    "time_limit_seconds": s.time_limit_seconds,
                    "question_count": s.question_count,
                    "answered_count": s.answered_count,
                    "translated_count": s.translated_count,
                    "is_ready": s.is_ready,
                    "user_best_score": user_perf["best_score"] if user_perf else None,
                    "user_attempts": user_perf["attempts"] if user_perf else 0,
                }
            )

        return Response(
            {
                "count": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "results": results,
            }
        )


class JLPTSetDetailAPIView(APIView):
    """GET /api/jlpt/sets/<id>/ — Quiz data with answers & explanations stripped (anti-cheat)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        _ensure_jlpt_tables()
        jlpt_set = get_object_or_404(JLPTSet, pk=pk, is_published=True)

        passages = [
            {
                "id": p.id,
                "order_index": p.order_index,
                "body_ja": p.body_ja,
            }
            for p in jlpt_set.passages.all().order_by("order_index", "id")
        ]

        questions = []
        for q in jlpt_set.questions.all().order_by("order_index", "id"):
            questions.append(
                {
                    "id": q.id,
                    "external_key": q.external_key,
                    "order_index": q.order_index,
                    "passage_id": q.passage_id,
                    "question_type": q.question_type,
                    "section": q.section,
                    "instruction": q.instruction,
                    "question": q.question,
                    "underline": q.underline,
                    "options": q.options or [],
                    "hints": q.hints or {},
                    "has_answer": q.answer_index is not None,
                }
            )

        return Response(
            {
                "id": jlpt_set.id,
                "level": jlpt_set.level,
                "category": jlpt_set.category,
                "set_number": jlpt_set.set_number,
                "title": jlpt_set.title,
                "time_limit_seconds": jlpt_set.time_limit_seconds,
                "question_count": jlpt_set.question_count,
                "answered_count": jlpt_set.answered_count,
                "translated_count": jlpt_set.translated_count,
                "is_ready": jlpt_set.is_ready,
                "passages": passages,
                "questions": questions,
            }
        )


class JLPTSetSubmitAPIView(APIView):
    """POST /api/jlpt/sets/<id>/submit/ — Grades exam, saves JLPTAttempt, returns 7-language explanations."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        _ensure_jlpt_tables()
        jlpt_set = get_object_or_404(JLPTSet, pk=pk, is_published=True)

        raw_answers = request.data.get("answers") or {}
        if not isinstance(raw_answers, dict):
            return Response({"detail": "'answers' must be a JSON object mapping question_id -> option_index (1..4)."}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize submitted answers: str(q_id) -> int(1..4)
        submitted = {}
        for k, v in raw_answers.items():
            try:
                submitted[int(k)] = int(v)
            except (TypeError, ValueError):
                continue

        questions = list(jlpt_set.questions.all().order_by("order_index", "id"))
        total_gradable = 0
        correct_count = 0
        review = []

        for q in questions:
            user_choice = submitted.get(q.id)
            is_gradable = q.answer_index is not None
            is_correct = False
            if is_gradable:
                total_gradable += 1
                if user_choice == q.answer_index:
                    is_correct = True
                    correct_count += 1

            review.append(
                {
                    "id": q.id,
                    "external_key": q.external_key,
                    "order_index": q.order_index,
                    "passage_id": q.passage_id,
                    "section": q.section,
                    "instruction": q.instruction,
                    "question": q.question,
                    "underline": q.underline,
                    "options": q.options or [],
                    "user_answer_index": user_choice,
                    "answer_index": q.answer_index,
                    "answer_text": q.answer_text,
                    "is_gradable": is_gradable,
                    "is_correct": is_correct,
                    "hints": q.hints or {},
                    "explanation": q.explanation or {},
                }
            )

        denom = total_gradable if total_gradable > 0 else len(questions)
        percentage = round((correct_count / denom) * 100.0, 1) if denom > 0 else 0.0
        passed = percentage >= 60.0 and total_gradable > 0

        attempt = JLPTAttempt.objects.create(
            jlpt_set=jlpt_set,
            user=request.user if (request.user and request.user.is_authenticated) else None,
            score=correct_count,
            total_questions=denom,
            answers={str(k): v for k, v in submitted.items()},
        )

        return Response(
            {
                "attempt_id": attempt.id,
                "set_id": jlpt_set.id,
                "level": jlpt_set.level,
                "category": jlpt_set.category,
                "title": jlpt_set.title,
                "score": correct_count,
                "total_questions": denom,
                "total_in_set": len(questions),
                "percentage": percentage,
                "passed": passed,
                "is_ready": jlpt_set.is_ready,
                "review": review,
            }
        )


class JLPTPlacementTestAPIView(APIView):
    """
    GET  /api/jlpt/placement-test/         -> 10-question diagnostic spanning N5->N1 (answers stripped)
    POST /api/jlpt/placement-test/submit/  -> Grades diagnostic and recommends JLPT level + 7-lang explanations
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        questions_public = [
            {
                "id": q["id"],
                "level": q["level"],
                "section": q["section"],
                "instruction": q["instruction"],
                "question": q["question"],
                "underline": q["underline"],
                "options": q["options"],
            }
            for q in JLPT_PLACEMENT_QUESTIONS
        ]
        return Response(
            {
                "title": "JLPT Quick Level Checker (N5 → N1)",
                "total_questions": len(questions_public),
                "estimated_minutes": 3,
                "questions": questions_public,
            }
        )

    def post(self, request):
        raw_answers = request.data.get("answers") or {}
        if not isinstance(raw_answers, dict):
            return Response({"detail": "'answers' must be an object."}, status=status.HTTP_400_BAD_REQUEST)

        per_level = OrderedDict((lvl, {"level": lvl, "correct": 0, "total": 0}) for lvl in LEVEL_ORDER)
        total_correct = 0
        review = []

        for q in JLPT_PLACEMENT_QUESTIONS:
            lvl = q["level"]
            per_level[lvl]["total"] += 1
            raw_choice = raw_answers.get(q["id"])
            try:
                user_choice = int(raw_choice) if raw_choice is not None else None
            except (TypeError, ValueError):
                user_choice = None

            is_correct = user_choice == q["answer_index"]
            if is_correct:
                total_correct += 1
                per_level[lvl]["correct"] += 1

            review.append(
                {
                    "id": q["id"],
                    "level": lvl,
                    "section": q["section"],
                    "question": q["question"],
                    "underline": q["underline"],
                    "options": q["options"],
                    "user_answer_index": user_choice,
                    "answer_index": q["answer_index"],
                    "answer_text": q["answer_text"],
                    "is_correct": is_correct,
                    "explanation": q["explanation"],
                }
            )

        # Determine recommended JLPT level:
        # Walk up from N5 to N1: user is ready for the next level up to the highest level they passed (>=1/2),
        # or if they aced everything (9-10/10), recommend N1.
        if total_correct >= 9:
            recommended_level = "N1"
            summary = "Outstanding! You answered almost everything right — you are ready to challenge JLPT N1."
        elif total_correct >= 7:
            recommended_level = "N2"
            summary = "Strong upper-intermediate Japanese! Start with JLPT N2 mock tests to sharpen business & reading speed."
        elif total_correct >= 5:
            recommended_level = "N3"
            summary = "Solid intermediate foundation! JLPT N3 is your ideal target level right now."
        elif total_correct >= 3:
            recommended_level = "N4"
            summary = "Good elementary progress! Practice JLPT N4 mock tests to solidify daily grammar and kanji."
        else:
            recommended_level = "N5"
            summary = "Great starting point! Begin with JLPT N5 mock tests to build core vocabulary, particles, and basic kanji."

        return Response(
            {
                "score": total_correct,
                "total_questions": len(JLPT_PLACEMENT_QUESTIONS),
                "percentage": round((total_correct / len(JLPT_PLACEMENT_QUESTIONS)) * 100.0, 1),
                "recommended_level": recommended_level,
                "summary": summary,
                "breakdown": list(per_level.values()),
                "review": review,
            }
        )
