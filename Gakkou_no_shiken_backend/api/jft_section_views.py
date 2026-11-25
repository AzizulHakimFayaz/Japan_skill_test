"""
JFT-Basic Section-Wise Randomized Mock Test APIs (Anti-Repeat from Previous Attempt).

Endpoints:
  GET  /api/jft/sections/summary/             -> Pool counts & specs for all 4 JFT-Basic sections
  POST /api/jft/sections/<section>/start/     -> Pulls random questions excluding previous attempt IDs (anti-cheat)
  POST /api/jft/sections/<section>/submit/    -> Grades answers, returns official 62.5-pt JFT section score + review
"""

import random
from typing import Any

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tests.models import Question, Test
from .serializers import get_absolute_media_url

JFT_SECTIONS_META: list[dict[str, Any]] = [
    {
        "key": "script_vocab",
        "name": "Script & Vocabulary",
        "name_ja": "文字と語彙",
        "description": "Test kanji readings, katakana words, and everyday A2 vocabulary in real-life contexts.",
        "default_count": 10,
        "time_limit_seconds": 720,
        "max_points": 62.5,
    },
    {
        "key": "conversation",
        "name": "Conversation & Expression",
        "name_ja": "会話と表現",
        "description": "Practice natural daily dialogues, polite responses, and grammar expressions used in Japan.",
        "default_count": 10,
        "time_limit_seconds": 720,
        "max_points": 62.5,
    },
    {
        "key": "listening",
        "name": "Listening Comprehension",
        "name_ja": "聴解",
        "description": "Listen to everyday Japanese announcements and conversations to catch key information.",
        "default_count": 10,
        "time_limit_seconds": 900,
        "max_points": 62.5,
    },
    {
        "key": "reading",
        "name": "Reading Comprehension",
        "name_ja": "読解",
        "description": "Read signs, notices, emails, and short workplace memos quickly and accurately.",
        "default_count": 10,
        "time_limit_seconds": 900,
        "max_points": 62.5,
    },
]

SECTION_META_BY_KEY: dict[str, dict[str, Any]] = {str(s["key"]): s for s in JFT_SECTIONS_META}


def _get_section_pool_queryset(section_key):
    """Returns all published global JFT-Basic questions for a given section."""
    qs = Question.objects.filter(
        test__category=Test.Category.BASIC,
        test__is_published=True,
        test__partner_school__isnull=True,
        section=section_key,
    ).select_related("group", "test").prefetch_related("options")
    return qs


class JftSectionSummaryAPIView(APIView):
    """GET /api/jft/sections/summary/ — Live pool sizes for the 4 JFT-Basic sections."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sections = []
        total_pool = 0
        for meta in JFT_SECTIONS_META:
            pool_count = _get_section_pool_queryset(meta["key"]).count()
            total_pool += pool_count
            effective_count = min(meta["default_count"], pool_count) if pool_count > 0 else 0
            sections.append(
                {
                    **meta,
                    "pool_count": pool_count,
                    "questions_per_mock": effective_count,
                }
            )
        return Response({"total_pool": total_pool, "sections": sections})


class JftSectionStartAPIView(APIView):
    """
    POST /api/jft/sections/<section>/start/
    Randomly selects questions for the requested section while excluding `exclude_ids`
    from the user's immediately previous attempt so questions stay fresh every time!
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, section):
        return self._build_quiz(request, section)

    def get(self, request, section):
        return self._build_quiz(request, section)

    def _build_quiz(self, request, section):
        meta = SECTION_META_BY_KEY.get(section)
        if not meta:
            return Response(
                {"detail": f"Invalid JFT section '{section}'. Expected one of: {', '.join(SECTION_META_BY_KEY.keys())}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse exclude_ids (from POST body or GET query param)
        raw_exclude = request.data.get("exclude_ids") if isinstance(request.data, dict) else None
        if raw_exclude is None:
            q_ex = request.query_params.get("exclude_ids", "")
            raw_exclude = [x for x in q_ex.split(",") if x.strip()] if q_ex else []

        exclude_ids = set()
        if isinstance(raw_exclude, (list, tuple)):
            for x in raw_exclude:
                try:
                    exclude_ids.add(int(x))
                except (TypeError, ValueError):
                    pass

        try:
            requested_count = int(
                (request.data.get("count") if isinstance(request.data, dict) else None)
                or request.query_params.get("count")
                or meta["default_count"]
            )
            requested_count = max(3, min(25, requested_count))
        except (TypeError, ValueError):
            requested_count = meta["default_count"]

        all_questions = list(_get_section_pool_queryset(section))
        if not all_questions:
            return Response(
                {"detail": f"No published JFT-Basic questions are available for {meta['name']} yet."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Separate fresh (unseen in last attempt) vs previous-attempt questions
        fresh = [q for q in all_questions if q.id not in exclude_ids]
        previous = [q for q in all_questions if q.id in exclude_ids]

        random.shuffle(fresh)
        random.shuffle(previous)

        target_count = min(requested_count, len(all_questions))
        if len(fresh) >= target_count:
            selected = fresh[:target_count]
            fresh_count = len(selected)
        else:
            # Take all fresh questions first, then top up randomly only if pool is smaller than target
            selected = fresh + previous[: target_count - len(fresh)]
            fresh_count = len(fresh)

        random.shuffle(selected)

        questions_payload = []
        for idx, q in enumerate(selected, start=1):
            opts = list(q.options.all().order_by("order_index", "id"))
            questions_payload.append(
                {
                    "id": q.id,
                    "order_index": idx,
                    "type": q.type,
                    "section": q.section,
                    "instruction": q.resolved_instruction,
                    "prompt": q.prompt,
                    "image_url": get_absolute_media_url(q.resolved_image, request),
                    "audio_url": get_absolute_media_url(q.resolved_audio, request),
                    "options": [
                        {
                            "id": opt.id,
                            "label": opt.label,
                            "image_url": get_absolute_media_url(opt.image, request),
                        }
                        for opt in opts
                    ],
                }
            )

        return Response(
            {
                "section": meta["key"],
                "section_name": meta["name"],
                "section_name_ja": meta["name_ja"],
                "time_limit_seconds": meta["time_limit_seconds"],
                "max_points": meta["max_points"],
                "pool_count": len(all_questions),
                "fresh_questions_count": fresh_count,
                "question_ids": [q.id for q in selected],
                "questions": questions_payload,
            }
        )


class JftSectionSubmitAPIView(APIView):
    """
    POST /api/jft/sections/<section>/submit/
    Grades the submitted section-wise mock test and returns official JFT 62.5-point section score + review.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, section):
        meta = SECTION_META_BY_KEY.get(section)
        if not meta:
            return Response({"detail": f"Invalid JFT section '{section}'."}, status=status.HTTP_400_BAD_REQUEST)

        question_ids = request.data.get("question_ids") or []
        raw_answers = request.data.get("answers") or {}
        if not isinstance(question_ids, list) or not question_ids:
            return Response({"detail": "'question_ids' list is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(raw_answers, dict):
            return Response({"detail": "'answers' must be a JSON object."}, status=status.HTTP_400_BAD_REQUEST)

        clean_qids = []
        for qid in question_ids:
            try:
                clean_qids.append(int(qid))
            except (TypeError, ValueError):
                pass

        submitted = {}
        for k, v in raw_answers.items():
            try:
                submitted[int(k)] = int(v)
            except (TypeError, ValueError):
                continue

        q_map = {
            q.id: q
            for q in Question.objects.filter(id__in=clean_qids)
            .select_related("group")
            .prefetch_related("options")
        }

        correct_count = 0
        total_questions = 0
        review = []

        for idx, qid in enumerate(clean_qids, start=1):
            q = q_map.get(qid)
            if not q:
                continue
            total_questions += 1
            opts = list(q.options.all().order_by("order_index", "id"))
            correct_opt = next((o for o in opts if o.is_correct), None)
            user_opt_id = submitted.get(q.id)
            is_correct = bool(correct_opt and user_opt_id == correct_opt.id)
            if is_correct:
                correct_count += 1

            review.append(
                {
                    "id": q.id,
                    "order_index": idx,
                    "instruction": q.resolved_instruction,
                    "prompt": q.prompt,
                    "image_url": get_absolute_media_url(q.resolved_image, request),
                    "audio_url": get_absolute_media_url(q.resolved_audio, request),
                    "user_option_id": user_opt_id,
                    "correct_option_id": correct_opt.id if correct_opt else None,
                    "correct_option_label": correct_opt.label if correct_opt else "",
                    "is_correct": is_correct,
                    "translations": q.get_translations() if hasattr(q, "get_translations") else {},
                    "options": [
                        {
                            "id": opt.id,
                            "label": opt.label,
                            "image_url": get_absolute_media_url(opt.image, request),
                            "is_correct": opt.is_correct,
                        }
                        for opt in opts
                    ],
                }
            )

        percentage = round((correct_count / total_questions) * 100.0, 1) if total_questions > 0 else 0.0
        section_points = round((correct_count / total_questions) * meta["max_points"], 1) if total_questions > 0 else 0.0
        passed = percentage >= 80.0

        return Response(
            {
                "section": meta["key"],
                "section_name": meta["name"],
                "section_name_ja": meta["name_ja"],
                "score": correct_count,
                "total_questions": total_questions,
                "percentage": percentage,
                "section_points": section_points,
                "max_points": meta["max_points"],
                "passed": passed,
                "question_ids": clean_qids,
                "review": review,
            }
        )
