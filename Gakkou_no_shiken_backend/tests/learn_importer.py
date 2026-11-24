"""
Idempotent Learn Japanese Topic Importer & 7-Language Translation Patcher.

Imports all 23 topic JSONs from D:\\JLPT questions\\Learn_Japanese\\json (or uploaded JSON bundles),
automatically:
- Assigns clean Japanese icon glyphs, order, category, and learner-friendly descriptions
- Cleans duplicated slash strings (e.g. "こんにちは/こんにちは" -> "こんにちは")
- Splits long single-lesson topics (>25 words) into clean ~20-word "Part 1, Part 2..." study chunks
- Cross-populates Bangla (`bn`) from existing CurriculumVocabulary / CurriculumKanji where Japanese matches
- Supports uploading a 7-language translation patch JSON to fill `en`, `id`, `bn`, `ne`, `vi`, `tl`, `hi`
  for BOTH LearnWord AND existing CurriculumVocabulary / CurriculumKanji!
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

from django.db import transaction

from .models import (
    CurriculumKanji,
    CurriculumVocabulary,
    LearnLesson,
    LearnTopic,
    LearnWord,
)

TOPIC_META: Dict[str, Dict[str, Any]] = {
    "hiragana": {
        "order": 1,
        "category": "basics",
        "icon": "あ",
        "title_ja": "ひらがな",
        "desc": "Master all 46 basic Hiragana characters, dakuten, and combination sounds step by step.",
    },
    "katakana": {
        "order": 2,
        "category": "basics",
        "icon": "ア",
        "title_ja": "カタカナ",
        "desc": "Learn Katakana scripts and everyday foreign loanwords used across Japan.",
    },
    "basic-kanji-20-days-foundation-course": {
        "order": 3,
        "category": "kanji",
        "icon": "字",
        "title": "Basic Kanji (20-Day Course)",
        "title_ja": "基本漢字",
        "desc": "Structured 20-day foundation Kanji course covering essential everyday characters.",
    },
    "greetings": {
        "order": 4,
        "category": "conversation",
        "icon": "挨",
        "title_ja": "あいさつ",
        "desc": "Essential Japanese greetings, polite expressions, and daily courtesies.",
    },
    "numbers": {
        "order": 5,
        "category": "basics",
        "icon": "数",
        "title_ja": "数字",
        "desc": "Counting numbers, prices, and basic numeric expressions in Japanese.",
    },
    "time-and-date": {
        "order": 6,
        "category": "basics",
        "icon": "時",
        "title_ja": "時間と日付",
        "desc": "Telling time, days of the week, months, schedules, and appointments.",
    },
    "family": {
        "order": 7,
        "category": "daily_life",
        "icon": "家",
        "title_ja": "家族",
        "desc": "Polite vs. humble words for family members and relatives.",
    },
    "general-conversation": {
        "order": 8,
        "category": "conversation",
        "icon": "話",
        "title_ja": "日常会話",
        "desc": "Useful everyday phrases for natural conversation in Japan.",
    },
    "eating-out": {
        "order": 9,
        "category": "daily_life",
        "icon": "食",
        "title_ja": "外食・料理",
        "desc": "Ordering food, restaurant etiquette, tastes, and common dishes.",
    },
    "shopping": {
        "order": 10,
        "category": "daily_life",
        "icon": "買",
        "title_ja": "買い物",
        "desc": "Prices, sizes, convenience stores, and everyday shopping vocabulary.",
    },
    "transportation": {
        "order": 11,
        "category": "travel",
        "icon": "電",
        "title_ja": "交通",
        "desc": "Trains, buses, tickets, stations, and commuting across Japan.",
    },
    "directions-places": {
        "order": 12,
        "category": "travel",
        "icon": "道",
        "title_ja": "道案内・場所",
        "desc": "Asking for directions, landmarks, and city locations.",
    },
    "accommodation": {
        "order": 13,
        "category": "travel",
        "icon": "宿",
        "title_ja": "宿泊・住まい",
        "desc": "Hotels, apartments, check-in phrases, and room facilities.",
    },
    "feeling-sick": {
        "order": 14,
        "category": "daily_life",
        "icon": "病",
        "title_ja": "体調・病院",
        "desc": "Describing symptoms at a clinic, pharmacy, or hospital.",
    },
    "emergency": {
        "order": 15,
        "category": "daily_life",
        "icon": "急",
        "title_ja": "緊急時",
        "desc": "Critical emergency phrases for police, ambulance, earthquakes, and help.",
    },
    "body-parts": {
        "order": 16,
        "category": "daily_life",
        "icon": "体",
        "title_ja": "体の部位",
        "desc": "Parts of the body — essential for daily life, medical visits, and Kaigo.",
    },
    "colours": {
        "order": 17,
        "category": "basics",
        "icon": "色",
        "title_ja": "色",
        "desc": "Common Japanese colors and how to use them as adjectives.",
    },
    "countries": {
        "order": 18,
        "category": "basics",
        "icon": "国",
        "title_ja": "国・国籍",
        "desc": "Country names, nationalities, and languages in Katakana & Kanji.",
    },
    "occasion-phrases": {
        "order": 19,
        "category": "conversation",
        "icon": "祝",
        "title_ja": "季節の挨拶",
        "desc": "Seasonal wishes, celebrations, and special occasion expressions.",
    },
    "regions-and-towns": {
        "order": 20,
        "category": "travel",
        "icon": "町",
        "title_ja": "地域と街",
        "desc": "Major Japanese prefectures, regions, and town vocabulary.",
    },
    "tourist-attractions": {
        "order": 21,
        "category": "travel",
        "icon": "旅",
        "title_ja": "観光地",
        "desc": "Sightseeing vocabulary for shrines, temples, parks, and museums.",
    },
    "dating": {
        "order": 22,
        "category": "conversation",
        "icon": "恋",
        "title_ja": "会話表現",
        "desc": "Friendly social expressions and casual conversation starters.",
    },
    "tongue-twisters": {
        "order": 23,
        "category": "conversation",
        "icon": "早",
        "title_ja": "早口言葉",
        "desc": "Fun Japanese pronunciation drills to sharpen speaking speed.",
    },
}


def _clean_dup_slash(val: Any) -> str:
    s = str(val or "").strip()
    if "/" in s:
        parts = [p.strip() for p in s.split("/") if p.strip()]
        if len(parts) == 2 and parts[0].lower() == parts[1].lower():
            return parts[0]
    return s


def _merge_translations(existing: Optional[dict], incoming: Optional[dict]) -> dict:
    merged = dict(existing or {})
    if isinstance(incoming, dict):
        for k, v in incoming.items():
            if k and v is not None and str(v).strip():
                merged[str(k).strip().lower()] = str(v).strip()
    return merged


def _build_existing_bn_lookup() -> Dict[str, str]:
    """Build quick lookup from existing CurriculumVocabulary & CurriculumKanji for instant Bangla cross-fill."""
    lookup: Dict[str, str] = {}
    for v in CurriculumVocabulary.objects.exclude(meaning_bn="").only("word", "furigana", "meaning_en", "meaning_bn"):
        if v.word:
            lookup[v.word.strip()] = v.meaning_bn.strip()
        if v.furigana:
            lookup.setdefault(v.furigana.strip(), v.meaning_bn.strip())
        if v.meaning_en:
            lookup.setdefault(v.meaning_en.strip().lower(), v.meaning_bn.strip())
    for k in CurriculumKanji.objects.exclude(meaning_bn="").only("character", "meaning_en", "meaning_bn"):
        if k.character:
            lookup.setdefault(k.character.strip(), k.meaning_bn.strip())
        if k.meaning_en:
            lookup.setdefault(k.meaning_en.strip().lower(), k.meaning_bn.strip())
    return lookup


def import_learn_topic_payload(payload: dict, bn_lookup: Optional[Dict[str, str]] = None) -> Dict[str, int]:
    """Import or update a single Learn Japanese topic JSON payload."""
    slug = str(payload.get("slug") or "").strip().lower()
    raw_title = str(payload.get("topic") or payload.get("title") or slug).strip()
    if not slug:
        raise ValueError("Missing 'slug' in Learn Japanese topic payload.")

    meta = TOPIC_META.get(slug, {})
    title = meta.get("title") or raw_title
    raw_lessons = payload.get("lessons") or []

    # Normalize lessons: if a topic has only 1 giant lesson (>25 words), split into clean ~20-word Parts!
    normalized_lessons: List[Dict[str, Any]] = []
    if len(raw_lessons) == 1 and len(raw_lessons[0].get("words") or []) > 25:
        all_words = raw_lessons[0].get("words") or []
        chunk_size = 20
        total_parts = math.ceil(len(all_words) / chunk_size)
        for p_idx in range(total_parts):
            chunk = all_words[p_idx * chunk_size : (p_idx + 1) * chunk_size]
            normalized_lessons.append(
                {
                    "external_lesson_id": int(raw_lessons[0].get("lesson_id") or 0),
                    "part_number": p_idx + 1,
                    "title": f"{title} — Part {p_idx + 1}",
                    "description": f"Practice {len(chunk)} essential {title.lower()} words and phrases (Part {p_idx + 1} of {total_parts}).",
                    "words": chunk,
                }
            )
    else:
        for idx, l_data in enumerate(raw_lessons, start=1):
            l_words = l_data.get("words") or []
            l_title = str(l_data.get("title") or f"Part {idx}").strip()
            if l_title.lower() == "general":
                l_title = f"{title} — Core Expressions"
            normalized_lessons.append(
                {
                    "external_lesson_id": int(l_data.get("lesson_id") or 0),
                    "part_number": idx,
                    "title": l_title,
                    "description": str(l_data.get("description") or f"Learn {len(l_words)} key expressions in {l_title}.").strip(),
                    "words": l_words,
                }
            )

    bn_map = bn_lookup if bn_lookup is not None else _build_existing_bn_lookup()

    with transaction.atomic():
        topic_obj, created = LearnTopic.objects.update_or_create(
            slug=slug,
            defaults={
                "title": title,
                "title_ja": meta.get("title_ja", ""),
                "description": meta.get("desc", f"Structured {title} lessons with pronunciation and multi-language meanings."),
                "category": meta.get("category", "daily_life"),
                "icon_text": meta.get("icon", "日"),
                "order_index": meta.get("order", 50),
                "is_published": True,
            },
        )

        # Preserve existing translations by (part_number, kanji) before refreshing words
        existing_trans: Dict[tuple, dict] = {}
        for w in LearnWord.objects.filter(lesson__topic=topic_obj).select_related("lesson"):
            existing_trans[(w.lesson.part_number, w.kanji)] = w.translations or {}

        # Remove old lessons/words for clean re-import of this topic
        topic_obj.lessons.all().delete()

        lessons_created = 0
        words_created = 0
        for l_info in normalized_lessons:
            l_obj = LearnLesson.objects.create(
                topic=topic_obj,
                external_lesson_id=l_info["external_lesson_id"],
                part_number=l_info["part_number"],
                title=l_info["title"],
                description=l_info["description"],
                word_count=len(l_info["words"]),
            )
            lessons_created += 1

            bulk_words: List[LearnWord] = []
            for w_idx, w_data in enumerate(l_info["words"], start=1):
                kanji = _clean_dup_slash(w_data.get("kanji") or w_data.get("word"))
                if not kanji:
                    continue
                furigana = _clean_dup_slash(w_data.get("furigana"))
                romaji = _clean_dup_slash(w_data.get("romaji"))
                eng = str(w_data.get("english") or w_data.get("meaning_en") or "").strip()
                nep = str(w_data.get("nepali") or "").strip()

                trans = _merge_translations(
                    existing_trans.get((l_info["part_number"], kanji)),
                    w_data.get("translations"),
                )
                if eng:
                    trans.setdefault("en", eng)
                if nep:
                    trans.setdefault("ne", nep)
                if "bn" not in trans:
                    bn_hit = bn_map.get(kanji) or bn_map.get(furigana) or (bn_map.get(eng.lower()) if eng else None)
                    if bn_hit:
                        trans["bn"] = bn_hit

                bulk_words.append(
                    LearnWord(
                        lesson=l_obj,
                        order_index=w_idx,
                        kanji=kanji,
                        furigana=furigana,
                        romaji=romaji,
                        meaning_en=eng or trans.get("en", ""),
                        translations=trans,
                    )
                )
            if bulk_words:
                LearnWord.objects.bulk_create(bulk_words, batch_size=500)
                words_created += len(bulk_words)

        topic_obj.lesson_count = lessons_created
        topic_obj.word_count = words_created
        topic_obj.save(update_fields=["lesson_count", "word_count"])

    return {
        "topics_created": 1 if created else 0,
        "topics_updated": 0 if created else 1,
        "lessons_created": lessons_created,
        "words_created": words_created,
    }


def apply_translations_bundle(payload: dict) -> Dict[str, int]:
    """
    Apply a 7-language translation bundle JSON:
    {
      "mode": "translations_bundle",
      "by_english": { "person": {"id": "orang", "bn": "মানুষ", "ne": "मानिस", "vi": "người", "tl": "tao", "hi": "व्यक्ति"}, ... }
    }
    Updates LearnWord, CurriculumVocabulary, and CurriculumKanji in fast chunks!
    """
    by_en = payload.get("by_english") or {}
    if not isinstance(by_en, dict):
        return {"learn_words_updated": 0, "vocab_updated": 0, "kanji_updated": 0}

    norm_map = {str(k).strip().lower(): v for k, v in by_en.items() if isinstance(v, dict)}
    stats = {"learn_words_updated": 0, "vocab_updated": 0, "kanji_updated": 0}

    with transaction.atomic():
        # 1. LearnWord
        lw_updates = []
        for w in LearnWord.objects.all().only("id", "meaning_en", "translations"):
            key = (w.meaning_en or "").strip().lower()
            patch = norm_map.get(key)
            merged = _merge_translations(w.translations, {"en": w.meaning_en} if w.meaning_en else None)
            if patch:
                merged = _merge_translations(merged, patch)
            if merged != (w.translations or {}):
                w.translations = merged
                lw_updates.append(w)
        for i in range(0, len(lw_updates), 500):
            LearnWord.objects.bulk_update(lw_updates[i : i + 500], ["translations"])
        stats["learn_words_updated"] = len(lw_updates)

        # 2. CurriculumVocabulary
        cv_updates = []
        for v in CurriculumVocabulary.objects.all().only("id", "meaning_en", "meaning_bn", "translations"):
            key = (v.meaning_en or "").strip().lower()
            patch = norm_map.get(key)
            base = {}
            if v.meaning_en:
                base["en"] = v.meaning_en
            if v.meaning_bn:
                base["bn"] = v.meaning_bn
            merged = _merge_translations(v.translations, base)
            if patch:
                merged = _merge_translations(merged, patch)
            if merged != (v.translations or {}):
                v.translations = merged
                if not v.meaning_bn and merged.get("bn"):
                    v.meaning_bn = merged["bn"][:300]
                cv_updates.append(v)
        for i in range(0, len(cv_updates), 500):
            CurriculumVocabulary.objects.bulk_update(cv_updates[i : i + 500], ["translations", "meaning_bn"])
        stats["vocab_updated"] = len(cv_updates)

        # 3. CurriculumKanji
        ck_updates = []
        for k in CurriculumKanji.objects.all().only("id", "meaning_en", "meaning_bn", "translations"):
            key = (k.meaning_en or "").strip().lower()
            patch = norm_map.get(key)
            base = {}
            if k.meaning_en:
                base["en"] = k.meaning_en
            if k.meaning_bn:
                base["bn"] = k.meaning_bn
            merged = _merge_translations(k.translations, base)
            if patch:
                merged = _merge_translations(merged, patch)
            if merged != (k.translations or {}):
                k.translations = merged
                if not k.meaning_bn and merged.get("bn"):
                    k.meaning_bn = merged["bn"][:300]
                ck_updates.append(k)
        for i in range(0, len(ck_updates), 500):
            CurriculumKanji.objects.bulk_update(ck_updates[i : i + 500], ["translations", "meaning_bn"])
        stats["kanji_updated"] = len(ck_updates)

    return stats


def import_learn_json_data(payload: Any) -> Dict[str, Any]:
    """Universal importer for Learn Japanese topic JSONs, bundles, or 7-language translation patches."""
    if isinstance(payload, dict) and payload.get("mode") == "translations_bundle":
        return apply_translations_bundle(payload)

    bn_lookup = _build_existing_bn_lookup()
    totals = {"topics_created": 0, "topics_updated": 0, "lessons_created": 0, "words_created": 0}

    if isinstance(payload, list):
        for item in payload:
            part = import_learn_topic_payload(item, bn_lookup=bn_lookup)
            for k in totals:
                totals[k] += part.get(k, 0)
        return totals

    if isinstance(payload, dict) and "topics" in payload and isinstance(payload["topics"], list):
        for item in payload["topics"]:
            part = import_learn_topic_payload(item, bn_lookup=bn_lookup)
            for k in totals:
                totals[k] += part.get(k, 0)
        if isinstance(payload.get("by_english"), dict):
            totals.update(apply_translations_bundle(payload))
        return totals

    if isinstance(payload, dict) and "lessons" in payload:
        return import_learn_topic_payload(payload, bn_lookup=bn_lookup)

    raise ValueError("Unrecognized Learn Japanese JSON format.")


def import_learn_directory(dir_path: str | Path) -> Dict[str, Any]:
    root = Path(dir_path)
    if not root.exists():
        raise FileNotFoundError(f"Directory not found: {root}")
    bn_lookup = _build_existing_bn_lookup()
    totals = {"files": 0, "topics_created": 0, "topics_updated": 0, "lessons_created": 0, "words_created": 0}
    for f in sorted(root.glob("*.json")):
        data = json.load(f.open("r", encoding="utf-8"))
        part = import_learn_topic_payload(data, bn_lookup=bn_lookup)
        totals["files"] += 1
        for k in ("topics_created", "topics_updated", "lessons_created", "words_created"):
            totals[k] += part.get(k, 0)
    return totals
