"""
Learn Japanese Topic-Based Lessons API Views (23 Topics -> 115 Day/Part Lessons -> 7-Language Words).

Endpoints:
  GET /api/learn/topics/              -> List all published topics (filterable by category & search)
  GET /api/learn/topics/<slug>/       -> Topic detail + ordered Day/Part lessons + words with 7-language meanings
"""

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.schema_sync import ensure_schema_synced
from tests.models import LearnTopic


def _ensure_learn_tables():
    try:
        LearnTopic.objects.exists()
    except Exception:
        ensure_schema_synced()


class LearnTopicListAPIView(APIView):
    """GET /api/learn/topics/ — Returns all 23 Learn Japanese topics with counts."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        _ensure_learn_tables()

        category = (request.query_params.get("category") or "").strip().lower()
        search = (request.query_params.get("search") or "").strip()

        qs = LearnTopic.objects.filter(is_published=True).order_by("order_index", "title")
        if category and category != "all":
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(title_ja__icontains=search)
                | Q(description__icontains=search)
            )

        topics = [
            {
                "id": t.id,
                "slug": t.slug,
                "title": t.title,
                "title_ja": t.title_ja,
                "description": t.description,
                "category": t.category,
                "icon_text": t.icon_text,
                "lesson_count": t.lesson_count,
                "word_count": t.word_count,
            }
            for t in qs
        ]

        all_pub = LearnTopic.objects.filter(is_published=True)
        total_topics = all_pub.count()
        total_lessons = sum(t.lesson_count for t in all_pub)
        total_words = sum(t.word_count for t in all_pub)

        return Response(
            {
                "totals": {
                    "topics": total_topics,
                    "lessons": total_lessons,
                    "words": total_words,
                },
                "topics": topics,
            }
        )


class LearnTopicDetailAPIView(APIView):
    """GET /api/learn/topics/<slug>/ — Topic detail with all Day/Part lessons and 7-language words."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        _ensure_learn_tables()
        topic = get_object_or_404(
            LearnTopic.objects.prefetch_related("lessons__words"),
            slug=slug,
            is_published=True,
        )

        lessons_data = []
        for l in topic.lessons.all().order_by("part_number", "id"):
            words_data = []
            for w in l.words.all().order_by("order_index", "id"):
                trans = dict(w.translations or {})
                if w.meaning_en and "en" not in trans:
                    trans["en"] = w.meaning_en
                words_data.append(
                    {
                        "id": w.id,
                        "order_index": w.order_index,
                        "kanji": w.kanji,
                        "furigana": w.furigana,
                        "romaji": w.romaji,
                        "meaning_en": w.meaning_en,
                        "translations": trans,
                    }
                )
            lessons_data.append(
                {
                    "id": l.id,
                    "part_number": l.part_number,
                    "title": l.title,
                    "description": l.description,
                    "word_count": len(words_data),
                    "words": words_data,
                }
            )

        return Response(
            {
                "id": topic.id,
                "slug": topic.slug,
                "title": topic.title,
                "title_ja": topic.title_ja,
                "description": topic.description,
                "category": topic.category,
                "icon_text": topic.icon_text,
                "lesson_count": len(lessons_data),
                "word_count": topic.word_count,
                "lessons": lessons_data,
            }
        )
