"""
Fast batched 7-language translator for LearnWord + CurriculumVocabulary + CurriculumKanji.
Generates `learn_7lang_translations_bundle.json` (uploadable to cPanel Django Admin in 1 click)
and applies the translations directly to the local SQLite database.
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from tests.learn_importer import apply_translations_bundle
from tests.models import CurriculumKanji, CurriculumVocabulary, LearnWord

TARGET_LANGS = ["id", "bn", "ne", "vi", "tl", "hi"]
BATCH_SIZE = 35
SEP = "\n"


def translate_batch(texts, target_lang):
    """Translate a batch of short English words/phrases via translate.googleapis.com."""
    joined = SEP.join(texts)
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl=en&tl={target_lang}&dt=t&q={urllib.parse.quote(joined)}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            translated_full = "".join(seg[0] for seg in data[0] if seg and seg[0])
            parts = [p.strip() for p in translated_full.split("\n")]
            if len(parts) == len(texts):
                return parts
            # Fallback: translate individually if line count drifted
            out = []
            for t in texts:
                u2 = (
                    "https://translate.googleapis.com/translate_a/single"
                    f"?client=gtx&sl=en&tl={target_lang}&dt=t&q={urllib.parse.quote(t)}"
                )
                r2 = urllib.request.Request(u2, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(r2, timeout=10) as resp2:
                    d2 = json.loads(resp2.read().decode("utf-8"))
                out.append("".join(seg[0] for seg in d2[0] if seg and seg[0]).strip())
            return out
        except Exception:
            time.sleep(0.6 * (attempt + 1))
    return [""] * len(texts)


def main():
    # Collect unique English phrases across LearnWord, CurriculumVocabulary, CurriculumKanji
    unique_en = {}

    for w in LearnWord.objects.all().only("meaning_en", "translations"):
        en = (w.meaning_en or "").strip()
        if en and len(en) <= 180:
            key = en.lower()
            entry = unique_en.setdefault(key, {"_en": en})
            for lg, val in (w.translations or {}).items():
                if val and str(val).strip():
                    entry.setdefault(lg, str(val).strip())

    for v in CurriculumVocabulary.objects.all().only("meaning_en", "meaning_bn", "translations"):
        en = (v.meaning_en or "").strip()
        if en and len(en) <= 180:
            key = en.lower()
            entry = unique_en.setdefault(key, {"_en": en})
            if v.meaning_bn:
                entry.setdefault("bn", v.meaning_bn.strip())
            for lg, val in (v.translations or {}).items():
                if val and str(val).strip():
                    entry.setdefault(lg, str(val).strip())

    for k in CurriculumKanji.objects.all().only("meaning_en", "meaning_bn", "translations"):
        en = (k.meaning_en or "").strip()
        if en and len(en) <= 180:
            key = en.lower()
            entry = unique_en.setdefault(key, {"_en": en})
            if k.meaning_bn:
                entry.setdefault("bn", k.meaning_bn.strip())
            for lg, val in (k.translations or {}).items():
                if val and str(val).strip():
                    entry.setdefault(lg, str(val).strip())

    print(f"Collected {len(unique_en)} unique English terms across Learn Japanese & Curriculum.")

    # Translate missing languages in parallel per language
    for lang in TARGET_LANGS:
        missing_keys = [k for k, d in unique_en.items() if not d.get(lang)]
        if not missing_keys:
            print(f"  [{lang}] already 100% translated!")
            continue
        batches = [missing_keys[i : i + BATCH_SIZE] for i in range(0, len(missing_keys), BATCH_SIZE)]
        print(f"  [{lang}] translating {len(missing_keys)} terms in {len(batches)} batches...")

        def _run_batch(b_keys):
            en_texts = [unique_en[k]["_en"].replace("\n", " ") for k in b_keys]
            return b_keys, translate_batch(en_texts, lang)

        done = 0
        with ThreadPoolExecutor(max_workers=6) as ex:
            futures = [ex.submit(_run_batch, b) for b in batches]
            for fut in as_completed(futures):
                b_keys, results = fut.result()
                for k, tr in zip(b_keys, results):
                    if tr:
                        unique_en[k][lang] = tr
                done += len(b_keys)
        print(f"  [{lang}] completed ({done} terms).")

    # Build clean bundle
    by_english = {}
    for k, d in unique_en.items():
        clean = {lg: val for lg, val in d.items() if lg != "_en" and val}
        clean["en"] = d["_en"]
        by_english[k] = clean

    bundle = {
        "mode": "translations_bundle",
        "languages": ["en"] + TARGET_LANGS,
        "total_terms": len(by_english),
        "by_english": by_english,
    }

    out_path = BASE_DIR.parent / "learn_7lang_translations_bundle.json"
    with out_path.open("w", encoding="utf-8") as fh:
        json.dump(bundle, fh, ensure_ascii=False)
    print(f"Saved 7-language bundle to {out_path} ({out_path.stat().st_size / 1024:.1f} KB)")

    stats = apply_translations_bundle(bundle)
    print(f"Applied to local DB: {stats}")


if __name__ == "__main__":
    main()
