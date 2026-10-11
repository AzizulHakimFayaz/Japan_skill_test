import urllib.request
import re
import json
import time
import os
import html
from concurrent.futures import ThreadPoolExecutor, as_completed

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

def fetch_url(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode('utf-8')
        except Exception as e:
            if attempt == retries - 1:
                print(f"[ERROR] Failed {url}: {e}")
                return None
            time.sleep(1)
    return None

def clean_text(s):
    if not s:
        return ""
    s = html.unescape(s)
    s = re.sub(r'<[^>]+>', '', s)
    return s.strip()

def scrape_vocab_lesson(level, lesson_num):
    url_en = f"https://langolearn.org/lessons/vocabulary/{level}/{lesson_num}"
    url_bn = f"https://langolearn.org/bn/lessons/vocabulary/{level}/{lesson_num}"

    html_en = fetch_url(url_en)
    html_bn = fetch_url(url_bn)

    if not html_en:
        return None

    # Title
    t_match = re.search(r'<h1[^>]*>\s*([^<]+)\s*</h1>', html_en)
    title = clean_text(t_match.group(1)) if t_match else f"{level} Vocabulary Lesson {lesson_num}"

    # Split cards
    cards_en = html_en.split('class="p-5 rounded-[12px] bg-white')[1:]
    cards_bn = html_bn.split('class="p-5 rounded-[12px] bg-white')[1:] if html_bn else []

    cards = []
    for idx, card in enumerate(cards_en):
        num_m = re.search(r'>\s*#(\d+)\s*<', card)
        order = int(num_m.group(1)) if num_m else (idx + 1)

        speech_m = re.search(r'data-speech="([^"]*)"', card)
        speech = clean_text(speech_m.group(1)) if speech_m else ""

        word_m = re.search(r'<div class="text-2xl font-semibold font-japanese[^"]*">\s*([^<]+)\s*</div>', card)
        word = clean_text(word_m.group(1)) if word_m else speech

        furi_m = re.search(r'<div class="text-xs text-\[#8f8f8f\][^"]*font-japanese[^"]*">\s*([^<]+)\s*</div>', card)
        furigana = clean_text(furi_m.group(1)) if furi_m else ""

        romaji_m = re.search(r'<span class="[^"]*font-mono[^"]*">\s*([a-zA-Z\s\-\.\,\(\)]+)\s*</span>', card)
        romaji = clean_text(romaji_m.group(1)) if romaji_m else ""

        mean_en_m = re.search(r'<div class="text-sm font-semibold text-\[#171717\][^"]*">\s*([^<]+)\s*</div>', card)
        meaning_en = clean_text(mean_en_m.group(1)) if mean_en_m else ""

        meaning_bn = ""
        if idx < len(cards_bn):
            bn_card = cards_bn[idx]
            mean_bn_m = re.search(r'<div class="text-sm font-semibold text-\[#171717\][^"]*">\s*([^<]+)\s*</div>', bn_card)
            meaning_bn = clean_text(mean_bn_m.group(1)) if mean_bn_m else ""

        if word or meaning_en:
            cards.append({
                "order": order,
                "word": word,
                "furigana": furigana or speech or word,
                "romaji": romaji,
                "meaning_en": meaning_en,
                "meaning_bn": meaning_bn,
                "speech": speech or word
            })

    return {
        "lesson_type": "vocabulary",
        "level": level,
        "lesson_number": lesson_num,
        "title": title,
        "items_count": len(cards),
        "words": cards
    }

def scrape_kanji_lesson(level, lesson_num):
    url_en = f"https://langolearn.org/lessons/kanji/{level}/{lesson_num}"
    url_bn = f"https://langolearn.org/bn/lessons/kanji/{level}/{lesson_num}"

    html_en = fetch_url(url_en)
    html_bn = fetch_url(url_bn)

    if not html_en:
        return None

    # Title
    t_match = re.search(r'<h1[^>]*>\s*([^<]+)\s*</h1>', html_en)
    title = clean_text(t_match.group(1)) if t_match else f"{level} Kanji Lesson {lesson_num}"

    cards_en = html_en.split('class="p-5 rounded-[12px] bg-white')[1:]
    cards_bn = html_bn.split('class="p-5 rounded-[12px] bg-white')[1:] if html_bn else []

    items = []
    for idx, card in enumerate(cards_en):
        num_m = re.search(r'>\s*#(\d+)\s*<', card)
        order = int(num_m.group(1)) if num_m else (idx + 1)

        char_m = re.search(r'<div class="text-4xl md:text-5xl font-semibold font-japanese[^"]*">\s*([^<]+)\s*</div>', card)
        char = clean_text(char_m.group(1)) if char_m else ""

        onyomi_m = re.search(r'Onyomi:</span>\s*<span class="font-japaneseSans font-semibold[^"]*">\s*([^<]+)\s*</span>', card)
        onyomi = clean_text(onyomi_m.group(1)) if onyomi_m else ""

        kunyomi_m = re.search(r'Kunyomi:</span>\s*<span class="font-japaneseSans font-semibold[^"]*">\s*([^<]+)\s*</span>', card)
        kunyomi = clean_text(kunyomi_m.group(1)) if kunyomi_m else ""

        romaji_m = re.search(r'<span class="px-2 py-0.5 rounded-\[4px\] text-xs bg-\[#fafafa\][^"]*font-mono">\s*([^<]+)\s*</span>', card)
        romaji = clean_text(romaji_m.group(1)) if romaji_m else ""

        speech_m = re.search(r'data-speech="([^"]*)"', card)
        speech = clean_text(speech_m.group(1)) if speech_m else char

        mean_en_m = re.search(r'<div class="text-sm font-semibold text-\[#171717\][^"]*">\s*([^<]+)\s*</div>', card)
        mean_en = clean_text(mean_en_m.group(1)) if mean_en_m else ""

        mean_bn = ""
        if idx < len(cards_bn):
            bn_card = cards_bn[idx]
            mean_bn_m = re.search(r'<div class="text-sm font-semibold text-\[#171717\][^"]*">\s*([^<]+)\s*</div>', bn_card)
            mean_bn = clean_text(mean_bn_m.group(1)) if mean_bn_m else ""

        if char:
            items.append({
                "order": order,
                "character": char,
                "onyomi": onyomi,
                "kunyomi": kunyomi,
                "romaji": romaji,
                "meaning_en": mean_en,
                "meaning_bn": mean_bn,
                "speech": speech or char
            })

    return {
        "lesson_type": "kanji",
        "level": level,
        "lesson_number": lesson_num,
        "title": title,
        "items_count": len(items),
        "kanji_items": items
    }

def main():
    print("Starting full curriculum scraper...")
    start_time = time.time()
    
    tasks = []
    # 1. N5 Vocabulary (1 to 25)
    for i in range(1, 26):
        tasks.append(('vocab', 'N5', i))
    # 2. N4 Vocabulary (26 to 50)
    for i in range(26, 51):
        tasks.append(('vocab', 'N4', i))
    # 3. N5 Kanji (1 to 10)
    for i in range(1, 11):
        tasks.append(('kanji', 'N5', i))
    # 4. N4 Kanji (1 to 20)
    for i in range(1, 21):
        tasks.append(('kanji', 'N4', i))

    print(f"Total lessons to scrape: {len(tasks)}")

    vocab_results = []
    kanji_results = []

    def worker(task):
        t_type, level, num = task
        if t_type == 'vocab':
            res = scrape_vocab_lesson(level, num)
            return ('vocab', res)
        else:
            res = scrape_kanji_lesson(level, num)
            return ('kanji', res)

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(worker, t): t for t in tasks}
        for future in as_completed(futures):
            t_type, res = future.result()
            if res:
                if t_type == 'vocab':
                    vocab_results.append(res)
                    print(f"  [VOCAB {res['level']} L{res['lesson_number']}] {res['title']} -> {res['items_count']} words")
                else:
                    kanji_results.append(res)
                    print(f"  [KANJI {res['level']} L{res['lesson_number']}] {res['title']} -> {res['items_count']} kanji")

    # Sort results
    vocab_results.sort(key=lambda x: (x['level'], x['lesson_number']))
    kanji_results.sort(key=lambda x: (x['level'], x['lesson_number']))

    total_words = sum(v['items_count'] for v in vocab_results)
    total_kanji = sum(k['items_count'] for k in kanji_results)

    dataset = {
        "metadata": {
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "source": "https://langolearn.org",
            "total_vocab_lessons": len(vocab_results),
            "total_vocab_words": total_words,
            "total_kanji_lessons": len(kanji_results),
            "total_kanji_items": total_kanji
        },
        "vocabulary_lessons": vocab_results,
        "kanji_lessons": kanji_results
    }

    out_path = r"e:\Study\Python Projects\Japan_skill_test\Gakkou_no_shiken_backend\tests\data\curriculum_seed.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - start_time
    print(f"\n Scraping complete in {elapsed:.1f}s!")
    print(f" Saved to: {out_path}")
    print(f" Total Vocab: {len(vocab_results)} lessons ({total_words} words)")
    print(f" Total Kanji: {len(kanji_results)} lessons ({total_kanji} characters)")

if __name__ == "__main__":
    main()
