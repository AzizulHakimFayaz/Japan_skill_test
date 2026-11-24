"""
Chunked, idempotent JLPT JSON Importer & Multi-Language Translation Patcher.

Supports 3 JSON upload formats:
1. Category file (e.g. N1/json/Vocabulary.json, N5/json/Reading.json):
   {"level": "N1", "category": "Vocabulary", "tests": [...]}
2. Level bundle file (e.g. N1_all.json):
   {"level": "N1", "categories": {"Vocabulary": {...}, ...}} or list of category payloads
3. Lightweight translation patch file:
   [{"level": "N5", "key": "q_1001", "answer_index": 2, "answer_text": "...", "hints": {...}, "explanation": {...}}]
   or {"patches": [...]} / {"questions": [...]}

Safe to re-run or upload updated translated JSON files at any time:
- Upserts sets by (level, external_test_id)
- Upserts questions by (jlpt_set, external_key)
- Merges 7-language `hints` and `explanation` dicts without erasing existing languages
- Never deletes existing student JLPTAttempt rows
- Auto-computes `question_count`, `answered_count`, `translated_count`, and `is_ready`
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

from django.db import transaction

from .models import JLPTPassage, JLPTQuestion, JLPTSet

VALID_LEVELS = {"N5", "N4", "N3", "N2", "N1"}
CHUNK_SIZE = 500


def _normalize_level(val: Any) -> Optional[str]:
    if not val:
        return None
    s = str(val).strip().upper()
    return s if s in VALID_LEVELS else None


def _clean_text(val: Any) -> str:
    if val is None:
        return ""
    return str(val).strip()


def _merge_lang_dict(existing: Optional[dict], incoming: Optional[dict]) -> dict:
    merged = dict(existing or {})
    if isinstance(incoming, dict):
        for lang, text in incoming.items():
            if lang and text is not None and str(text).strip():
                merged[str(lang).strip().lower()] = str(text).strip()
    return merged


def _extract_hints(q_data: dict, existing_hints: Optional[dict] = None) -> dict:
    merged = _merge_lang_dict(existing_hints, q_data.get("hints"))
    hint_en = _clean_text(q_data.get("hint_en") or q_data.get("hint"))
    hint_np = _clean_text(q_data.get("hint_np"))
    if hint_en and "en" not in merged:
        merged["en"] = hint_en
    if hint_np and "ne" not in merged:
        merged["ne"] = hint_np
    return merged


def _extract_answer_index(val: Any) -> Optional[int]:
    if val is None or val == "":
        return None
    try:
        idx = int(val)
        return idx if 1 <= idx <= 6 else None
    except (TypeError, ValueError):
        return None


def _has_explanation(expl: Optional[dict]) -> bool:
    if not isinstance(expl, dict):
        return False
    return any(bool(str(v).strip()) for v in expl.values() if v is not None)


def recalculate_set_metrics(set_ids: Iterable[int]) -> Dict[str, int]:
    """Recompute question_count, answered_count, translated_count, and is_ready for touched sets."""
    ids = list(set(set_ids))
    if not ids:
        return {"sets_updated": 0, "ready_sets": 0}

    sets_by_id = {s.id: s for s in JLPTSet.objects.filter(id__in=ids)}
    counts: Dict[int, List[int]] = {sid: [0, 0, 0] for sid in sets_by_id}

    for q in JLPTQuestion.objects.filter(jlpt_set_id__in=ids).only(
        "jlpt_set_id", "answer_index", "explanation"
    ).iterator(chunk_size=2000):
        bucket = counts.get(q.jlpt_set_id)
        if bucket is None:
            continue
        bucket[0] += 1
        if q.answer_index is not None:
            bucket[1] += 1
        if _has_explanation(q.explanation):
            bucket[2] += 1

    to_update: List[JLPTSet] = []
    ready_count = 0
    for sid, s in sets_by_id.items():
        q_cnt, a_cnt, t_cnt = counts[sid]
        is_ready = q_cnt > 0 and a_cnt == q_cnt
        if is_ready:
            ready_count += 1
        s.question_count = q_cnt
        s.answered_count = a_cnt
        s.translated_count = t_cnt
        s.is_ready = is_ready
        to_update.append(s)

    for i in range(0, len(to_update), CHUNK_SIZE):
        JLPTSet.objects.bulk_update(
            to_update[i : i + CHUNK_SIZE],
            ["question_count", "answered_count", "translated_count", "is_ready"],
        )

    return {"sets_updated": len(to_update), "ready_sets": ready_count}


def _import_category_payload(payload: dict, level_override: Optional[str] = None) -> Dict[str, Any]:
    level = _normalize_level(level_override or payload.get("level"))
    if not level:
        raise ValueError("Missing or invalid 'level' (expected N5, N4, N3, N2, or N1).")

    category = _clean_text(payload.get("category")) or "General"
    tests_list = payload.get("tests") or []
    if not isinstance(tests_list, list):
        raise ValueError("'tests' must be a list.")

    stats = {
        "sets_created": 0,
        "sets_updated": 0,
        "passages_upserted": 0,
        "questions_created": 0,
        "questions_updated": 0,
        "ready_sets": 0,
        "level": level,
        "category": category,
    }

    if not tests_list:
        return stats

    ext_ids = [int(t["test_id"]) for t in tests_list if t.get("test_id") is not None]
    existing_sets = {
        s.external_test_id: s
        for s in JLPTSet.objects.filter(level=level, external_test_id__in=ext_ids)
    }

    sets_to_create: List[JLPTSet] = []
    sets_to_update: List[JLPTSet] = []

    for idx, t in enumerate(tests_list, start=1):
        ext_id = t.get("test_id")
        if ext_id is None:
            continue
        ext_id = int(ext_id)
        set_num = int(t.get("set_number") or idx)
        title = _clean_text(t.get("title")) or f"JLPT {level} {category} — Set {set_num}"
        # Reading sets get 25 mins, Mini Tests get 12 mins, standard Vocab/Grammar/Kanji get 18 mins
        if "Mini Test" in category:
            default_secs = 720
        elif "Reading" in category:
            default_secs = 1500
        else:
            default_secs = 1080

        if ext_id in existing_sets:
            s_obj = existing_sets[ext_id]
            changed = False
            if s_obj.category != category:
                s_obj.category = category
                changed = True
            if s_obj.set_number != set_num:
                s_obj.set_number = set_num
                changed = True
            if title and s_obj.title != title:
                s_obj.title = title
                changed = True
            if changed:
                sets_to_update.append(s_obj)
        else:
            sets_to_create.append(
                JLPTSet(
                    level=level,
                    category=category,
                    external_test_id=ext_id,
                    set_number=set_num,
                    title=title,
                    time_limit_seconds=default_secs,
                    is_published=True,
                    is_ready=False,
                )
            )

    with transaction.atomic():
        if sets_to_create:
            for i in range(0, len(sets_to_create), CHUNK_SIZE):
                JLPTSet.objects.bulk_create(sets_to_create[i : i + CHUNK_SIZE])
            stats["sets_created"] += len(sets_to_create)
        if sets_to_update:
            for i in range(0, len(sets_to_update), CHUNK_SIZE):
                JLPTSet.objects.bulk_update(
                    sets_to_update[i : i + CHUNK_SIZE],
                    ["category", "set_number", "title"],
                )
            stats["sets_updated"] += len(sets_to_update)

        # Reload map of external_test_id -> JLPTSet
        sets_map = {
            s.external_test_id: s
            for s in JLPTSet.objects.filter(level=level, external_test_id__in=ext_ids)
        }
        touched_set_ids: Set[int] = {s.id for s in sets_map.values()}

        # Preload existing passages & questions for these sets
        existing_passages: Dict[Tuple[int, int], JLPTPassage] = {
            (p.jlpt_set_id, p.order_index): p
            for p in JLPTPassage.objects.filter(jlpt_set_id__in=touched_set_ids)
        }

        passages_to_create: List[JLPTPassage] = []
        passages_to_update: List[JLPTPassage] = []

        for t in tests_list:
            ext_id = t.get("test_id")
            if ext_id is None or int(ext_id) not in sets_map:
                continue
            s_obj = sets_map[int(ext_id)]
            for p_idx, p_data in enumerate(t.get("reading_passages") or [], start=1):
                body_ja = _clean_text(p_data.get("passage"))
                translations = _merge_lang_dict(None, p_data.get("translations"))
                key = (s_obj.id, p_idx)
                if key in existing_passages:
                    p_obj = existing_passages[key]
                    p_obj.body_ja = body_ja or p_obj.body_ja
                    p_obj.translations = _merge_lang_dict(p_obj.translations, translations)
                    passages_to_update.append(p_obj)
                else:
                    passages_to_create.append(
                        JLPTPassage(
                            jlpt_set=s_obj,
                            order_index=p_idx,
                            body_ja=body_ja,
                            translations=translations,
                        )
                    )

        if passages_to_create:
            for i in range(0, len(passages_to_create), CHUNK_SIZE):
                JLPTPassage.objects.bulk_create(passages_to_create[i : i + CHUNK_SIZE])
            stats["passages_upserted"] += len(passages_to_create)
        if passages_to_update:
            for i in range(0, len(passages_to_update), CHUNK_SIZE):
                JLPTPassage.objects.bulk_update(
                    passages_to_update[i : i + CHUNK_SIZE],
                    ["body_ja", "translations"],
                )
            stats["passages_upserted"] += len(passages_to_update)

        # Reload passages map
        passages_map: Dict[Tuple[int, int], JLPTPassage] = {
            (p.jlpt_set_id, p.order_index): p
            for p in JLPTPassage.objects.filter(jlpt_set_id__in=touched_set_ids)
        }

        existing_questions: Dict[Tuple[int, str], JLPTQuestion] = {
            (q.jlpt_set_id, q.external_key): q
            for q in JLPTQuestion.objects.filter(jlpt_set_id__in=touched_set_ids)
        }

        q_to_create: List[JLPTQuestion] = []
        q_to_update: List[JLPTQuestion] = []
        seen_in_batch: Set[Tuple[int, str]] = set()

        def _process_question(
            s_obj: JLPTSet,
            passage_obj: Optional[JLPTPassage],
            q_data: dict,
            order_idx: int,
            default_type: str,
        ) -> None:
            raw_key = _clean_text(q_data.get("key"))
            if not raw_key:
                q_id = q_data.get("id")
                raw_key = f"q_{q_id}" if q_id is not None else f"auto_{s_obj.external_test_id}_{order_idx}"

            pair = (s_obj.id, raw_key)
            if pair in seen_in_batch:
                return
            seen_in_batch.add(pair)

            q_type = _clean_text(q_data.get("type")) or default_type
            section = _clean_text(q_data.get("section")) or category
            instruction = _clean_text(q_data.get("instruction"))
            question_text = _clean_text(q_data.get("question"))
            underline = _clean_text(q_data.get("underline"))
            raw_opts = q_data.get("options") or []
            options = [str(o) for o in raw_opts] if isinstance(raw_opts, list) else []
            answer_index = _extract_answer_index(q_data.get("answer_index"))
            answer_text = _clean_text(q_data.get("answer_text"))

            if pair in existing_questions:
                q_obj = existing_questions[pair]
                q_obj.passage = passage_obj or q_obj.passage
                q_obj.order_index = order_idx
                q_obj.question_type = q_type
                if section:
                    q_obj.section = section
                if instruction:
                    q_obj.instruction = instruction
                if question_text:
                    q_obj.question = question_text
                if underline:
                    q_obj.underline = underline
                if options:
                    q_obj.options = options
                if answer_index is not None:
                    q_obj.answer_index = answer_index
                if answer_text:
                    q_obj.answer_text = answer_text
                q_obj.hints = _extract_hints(q_data, q_obj.hints)
                q_obj.explanation = _merge_lang_dict(q_obj.explanation, q_data.get("explanation"))
                q_to_update.append(q_obj)
            else:
                q_to_create.append(
                    JLPTQuestion(
                        jlpt_set=s_obj,
                        passage=passage_obj,
                        external_key=raw_key,
                        order_index=order_idx,
                        question_type=q_type,
                        section=section,
                        instruction=instruction,
                        question=question_text,
                        underline=underline,
                        options=options,
                        answer_index=answer_index,
                        answer_text=answer_text,
                        hints=_extract_hints(q_data, None),
                        explanation=_merge_lang_dict(None, q_data.get("explanation")),
                    )
                )

        for t in tests_list:
            ext_id = t.get("test_id")
            if ext_id is None or int(ext_id) not in sets_map:
                continue
            s_obj = sets_map[int(ext_id)]
            order_counter = 0

            for q_data in t.get("mcq_questions") or []:
                order_counter += 1
                _process_question(s_obj, None, q_data, order_counter, "mcq")

            for p_idx, p_data in enumerate(t.get("reading_passages") or [], start=1):
                passage_obj = passages_map.get((s_obj.id, p_idx))
                for q_data in p_data.get("questions") or []:
                    order_counter += 1
                    _process_question(s_obj, passage_obj, q_data, order_counter, "reading")

        if q_to_create:
            for i in range(0, len(q_to_create), CHUNK_SIZE):
                JLPTQuestion.objects.bulk_create(q_to_create[i : i + CHUNK_SIZE])
            stats["questions_created"] += len(q_to_create)

        if q_to_update:
            for i in range(0, len(q_to_update), CHUNK_SIZE):
                JLPTQuestion.objects.bulk_update(
                    q_to_update[i : i + CHUNK_SIZE],
                    [
                        "passage",
                        "order_index",
                        "question_type",
                        "section",
                        "instruction",
                        "question",
                        "underline",
                        "options",
                        "answer_index",
                        "answer_text",
                        "hints",
                        "explanation",
                    ],
                )
            stats["questions_updated"] += len(q_to_update)

        metrics = recalculate_set_metrics(touched_set_ids)
        stats["ready_sets"] = metrics["ready_sets"]

    return stats


def _import_patch_list(patches: List[dict], level_override: Optional[str] = None) -> Dict[str, Any]:
    """Patch existing JLPTQuestion rows by external_key (and optional level) without recreating sets."""
    stats = {
        "sets_created": 0,
        "sets_updated": 0,
        "passages_upserted": 0,
        "questions_created": 0,
        "questions_updated": 0,
        "unmatched_keys": 0,
        "ready_sets": 0,
        "mode": "translation_patch",
    }

    normalized_items = []
    keys_needed: Set[str] = set()
    for item in patches:
        if not isinstance(item, dict):
            continue
        key = _clean_text(item.get("key") or item.get("external_key"))
        if not key and item.get("id") is not None:
            key = f"q_{item.get('id')}"
        if not key:
            continue
        lvl = _normalize_level(level_override or item.get("level"))
        normalized_items.append((lvl, key, item))
        keys_needed.add(key)

    if not normalized_items:
        return stats

    qs = JLPTQuestion.objects.select_related("jlpt_set").filter(external_key__in=keys_needed)
    by_level_key: Dict[Tuple[str, str], List[JLPTQuestion]] = {}
    by_key_only: Dict[str, List[JLPTQuestion]] = {}
    for q in qs:
        by_level_key.setdefault((q.jlpt_set.level, q.external_key), []).append(q)
        by_key_only.setdefault(q.external_key, []).append(q)

    updated_map: Dict[int, JLPTQuestion] = {}
    touched_set_ids: Set[int] = set()

    for lvl, key, item in normalized_items:
        targets = by_level_key.get((lvl, key)) if lvl else by_key_only.get(key)
        if not targets:
            stats["unmatched_keys"] += 1
            continue
        ans_idx = _extract_answer_index(item.get("answer_index"))
        ans_txt = _clean_text(item.get("answer_text"))
        for q_obj in targets:
            if ans_idx is not None:
                q_obj.answer_index = ans_idx
            if ans_txt:
                q_obj.answer_text = ans_txt
            q_obj.hints = _extract_hints(item, q_obj.hints)
            q_obj.explanation = _merge_lang_dict(q_obj.explanation, item.get("explanation"))
            updated_map[q_obj.id] = q_obj
            touched_set_ids.add(q_obj.jlpt_set_id)

    with transaction.atomic():
        to_update = list(updated_map.values())
        for i in range(0, len(to_update), CHUNK_SIZE):
            JLPTQuestion.objects.bulk_update(
                to_update[i : i + CHUNK_SIZE],
                ["answer_index", "answer_text", "hints", "explanation"],
            )
        stats["questions_updated"] = len(to_update)
        metrics = recalculate_set_metrics(touched_set_ids)
        stats["sets_updated"] = metrics["sets_updated"]
        stats["ready_sets"] = metrics["ready_sets"]

    return stats


def _merge_stats(total: Dict[str, Any], part: Dict[str, Any]) -> None:
    for k in (
        "sets_created",
        "sets_updated",
        "passages_upserted",
        "questions_created",
        "questions_updated",
        "unmatched_keys",
    ):
        total[k] = total.get(k, 0) + part.get(k, 0)


def import_jlpt_json_data(payload: Any, level_override: Optional[str] = None) -> Dict[str, Any]:
    """Universal entry point for importing or patching JLPT JSON data."""
    total: Dict[str, Any] = {
        "sets_created": 0,
        "sets_updated": 0,
        "passages_upserted": 0,
        "questions_created": 0,
        "questions_updated": 0,
        "unmatched_keys": 0,
        "files_processed": 1,
    }

    if isinstance(payload, list):
        if payload and isinstance(payload[0], dict) and "tests" in payload[0]:
            for cat_payload in payload:
                _merge_stats(total, _import_category_payload(cat_payload, level_override=level_override))
            return total
        return _import_patch_list(payload, level_override=level_override)

    if isinstance(payload, dict):
        if "tests" in payload and isinstance(payload["tests"], list):
            return _import_category_payload(payload, level_override=level_override)

        if "patches" in payload and isinstance(payload["patches"], list):
            return _import_patch_list(payload["patches"], level_override=level_override or payload.get("level"))

        if "questions" in payload and isinstance(payload["questions"], list):
            return _import_patch_list(payload["questions"], level_override=level_override or payload.get("level"))

        if "categories" in payload and isinstance(payload["categories"], dict):
            lvl = _normalize_level(level_override or payload.get("level"))
            for cat_name, cat_val in payload["categories"].items():
                if isinstance(cat_val, dict) and "tests" in cat_val:
                    cat_copy = dict(cat_val)
                    cat_copy.setdefault("level", lvl)
                    cat_copy.setdefault("category", cat_name)
                    _merge_stats(total, _import_category_payload(cat_copy, level_override=lvl))
                elif isinstance(cat_val, list):
                    _merge_stats(
                        total,
                        _import_category_payload(
                            {"level": lvl, "category": cat_name, "tests": cat_val},
                            level_override=lvl,
                        ),
                    )
            return total

    raise ValueError(
        "Unrecognized JLPT JSON format. Expected a Category JSON ({level, category, tests}), "
        "a Level bundle ({level, categories}), or a Translation Patch list ([{level, key, answer_index, explanation}])."
    )


def import_jlpt_directory(
    root_dir: str | Path,
    levels: Optional[Iterable[str]] = None,
) -> Dict[str, Any]:
    """Import all N5..N1 category JSON files from a JLPT questions root directory."""
    root = Path(root_dir)
    if not root.exists():
        raise FileNotFoundError(f"Directory not found: {root}")

    target_levels = (
        [_normalize_level(l) for l in levels if _normalize_level(l)]
        if levels
        else ["N5", "N4", "N3", "N2", "N1"]
    )

    summary: Dict[str, Any] = {
        "sets_created": 0,
        "sets_updated": 0,
        "passages_upserted": 0,
        "questions_created": 0,
        "questions_updated": 0,
        "unmatched_keys": 0,
        "files_processed": 0,
        "per_level": {},
    }

    for lvl in target_levels:
        json_dir = root / lvl / "json"
        if not json_dir.is_dir():
            continue
        lvl_stats: Dict[str, Any] = {
            "sets_created": 0,
            "sets_updated": 0,
            "questions_created": 0,
            "questions_updated": 0,
            "files": 0,
        }
        for json_file in sorted(json_dir.glob("*.json")):
            with json_file.open("r", encoding="utf-8") as fh:
                data = json.load(fh)
            part = import_jlpt_json_data(data, level_override=lvl)
            _merge_stats(summary, part)
            _merge_stats(lvl_stats, part)
            lvl_stats["files"] += 1
            summary["files_processed"] += 1
        summary["per_level"][lvl] = lvl_stats

    return summary
