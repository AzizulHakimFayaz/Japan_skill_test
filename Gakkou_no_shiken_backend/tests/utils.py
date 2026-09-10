import csv
import io
from django.db import transaction
from .models import Test, Question, QuestionGroup, AnswerOption

SECTION_MAP = {
    # JFT Sections
    'script_vocab': Question.Section.SCRIPT_VOCAB,
    'script and vocabulary': Question.Section.SCRIPT_VOCAB,
    'script & vocabulary': Question.Section.SCRIPT_VOCAB,
    '文字・語彙': Question.Section.SCRIPT_VOCAB,
    
    'conversation': Question.Section.CONVERSATION,
    'conversation and expression': Question.Section.CONVERSATION,
    'conversation & expression': Question.Section.CONVERSATION,
    '会話・表現': Question.Section.CONVERSATION,
    
    'listening': Question.Section.LISTENING,
    'listening comprehension': Question.Section.LISTENING,
    '聴解': Question.Section.LISTENING,
    
    'reading': Question.Section.READING,
    'reading comprehension': Question.Section.READING,
    '読解': Question.Section.READING,

    # SSW Prometric Sections (Phase 1: Audio/Typing & Phase 2: Occupational/Practical)
    'audio': 'audio',
    'audio comprehension': 'audio',
    'phase 1': 'audio',
    'phase1': 'audio',
    '第1部': 'audio',
    '第1部 音声・入力': 'audio',
    '音声': 'audio',
    '聴解・入力': 'audio',

    'occupational': 'occupational',
    'occupational / practical': 'occupational',
    'occupational and practical': 'occupational',
    'practical': 'occupational',
    'phase 2': 'occupational',
    'phase2': 'occupational',
    '第2部': 'occupational',
    '第2部 専門実技': 'occupational',
    '専門': 'occupational',
    '実技': 'occupational',
    '専門・実技': 'occupational',
}

TYPE_MAP = {
    'text': Question.QuestionType.TEXT,
    'image': Question.QuestionType.IMAGE,
    'audio': Question.QuestionType.AUDIO,
    'image_audio': Question.QuestionType.IMAGE_AUDIO,
    'image+audio': Question.QuestionType.IMAGE_AUDIO,
    # Typing & Text Input
    'typing': Question.QuestionType.TYPING,
    'type': Question.QuestionType.TYPING,
    'text_input': Question.QuestionType.TYPING,
    'input': Question.QuestionType.TYPING,
    'audio_typing': Question.QuestionType.AUDIO_TYPING,
    'audio+typing': Question.QuestionType.AUDIO_TYPING,
}

def generate_sample_csv_string():
    """Generates a sample CSV template string for bulk question import with QuestionGroup and Audio Script support."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'group_title', 'section', 'type', 'instruction', 'prompt', 'audio_script',
        'option_1', 'option_2', 'option_3', 'option_4',
        'correct_option', 'order_index'
    ])
    writer.writerow([
        '', 'Script and Vocabulary', 'text', 'How do you write the __underlined__ kanji word in hiragana? Choose the correct one.',
        '__水道__が こわれた ときは、 ここに でんわして ください。', '',
        'すいどう', 'すいとう', 'ずいどう', '',
        '1', '1'
    ])
    writer.writerow([
        '', 'Conversation and Expression', 'text', 'Complete the sentence:',
        'わたしは はるが ______ です。 (I like spring.)', '',
        'すき (suki)', 'きらい (kirai)', 'へた (heta)', '',
        '1', '2'
    ])
    writer.writerow([
        '', 'Listening Comprehension', 'audio', 'Listen to the audio and choose the correct answer.',
        '何曜日に バーベキューを しますか。 (What day will they have a barbecue?)',
        '[Nanami], [田中さん、今週の日曜日にみんなでバーベキューをしませんか。], [Keita], [日曜日ですね。行きたいんですが、日曜日はちょっと用事があって……。土曜日なら大丈夫ですけど。], [Nanami], [あ、そうですか。じゃあ、他の人にも聞いて、土曜日にしましょう！]',
        '土曜日', '日曜日', '金曜日', '',
        '1', '3'
    ])
    writer.writerow([
        'Reading Passage 1 - Town Magazine', 'Reading Comprehension', 'image',
        'You are reading a town public magazine. Answer questions (1) and (2).',
        '(1) フェスティバルに 行った 人は 何が できましたか。', '',
        '歌と おどりを 見ること', 'がっきを 買うこと', 'アクセサリーを 作ること', '',
        '1', '4'
    ])
    writer.writerow([
        'Reading Passage 1 - Town Magazine', 'Reading Comprehension', 'image',
        'You are reading a town public magazine. Answer questions (1) and (2).',
        '(2) ホアさんは スピーチコンテストに 参加して どう 思いましたか。', '',
        'スピーチの けいけんが なかったけど、うまく いった', '自分の スピーチを わられて、かなしかった', '日本人の 英語の スピーチが 上手で、びっくりした', '',
        '1', '5'
    ])
    return output.getvalue()


def generate_sample_ssw_csv_string():
    """Generates a sample CSV template specifically tailored for SSW (Specified Skilled Worker) Prometric CBT tests.
    Includes Phase 1 (Audio Multiple Choice & Audio Typing) and Phase 2 (Occupational & Practical Knowledge).
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'group_title', 'section', 'type', 'instruction', 'prompt', 'audio_script',
        'option_1', 'option_2', 'option_3', 'option_4',
        'correct_option', 'order_index'
    ])
    # Phase 1: Audio Section Question 1 (MCQ)
    writer.writerow([
        '', 'audio', 'audio', '音声を聞いて、最も適切な答えを1つ選んでください。',
        '会話を聞いて、二人は何時に待ち合わせをしますか。',
        '[Nanami], [明日の打ち合わせは何時にしますか。], [Keita], [午後2時はどうですか。], [Nanami], [2時は別の会議があるので、3時はどうでしょうか。], [Keita], [わかりました。では3時にしましょう。]',
        '14:00', '15:00', '16:00', '17:00',
        '2', '1'
    ])
    # Phase 1: Audio Section Question 2 (Typing question where candidate types the answer!)
    writer.writerow([
        '', 'audio', 'audio_typing', '音声を聞いて、質問に対する答えをひらがなまたはローマ字で入力してください。',
        '【タイピング回答問題】お客様が来店したときの挨拶は何と言いますか。',
        '[Nanami], [いらっしゃいませ。]',
        'いらっしゃいませ', 'irasshaimase', 'いらっしゃい', '',
        '1', '2'
    ])
    # Phase 2: Occupational / Practical Knowledge Question 3 (Olympic color question from user screenshot)
    writer.writerow([
        '', 'occupational', 'text', '問題1：オリンピックマーク（五輪マーク）に [red]使用されていない色[/red] を1つ選んでください。',
        'オリンピックマーク（五輪マーク）に 使用されていない色 を1つ選んでください。', '',
        '赤色', '緑色', '紫色', '青色',
        '3', '3'
    ])
    # Phase 2: Occupational / Practical Knowledge Question 4 (Food safety / HACCP hygiene)
    writer.writerow([
        '', 'occupational', 'text', '衛生管理に関する問題です。最も適切なものを1つ選んでください。',
        '作業前に行う手洗いについて、正しい手順として最も適切なものはどれですか。', '',
        '流水でさっと流すだけでよい', '石鹸を泡立てて指の間や手首までしっかり洗い、流水で流して清潔なペーパータオルで拭く', 'アルコール消毒液だけで拭き取る', '汚れた作業着で手を拭く',
        '2', '4'
    ])
    # Phase 2: Occupational / Practical Knowledge Question 5 (Workplace safety / judgment)
    writer.writerow([
        '', 'occupational', 'text', '職場の安全管理に関する問題です。最も適切なものを1つ選んでください。',
        '作業中に床に油がこぼれているのを見つけました。最初にすべき行動はどれですか。', '',
        '見なかったことにして自分の作業を続ける', 'すぐに拭き取り、周囲の作業者に注意を促す', '次の清掃時間まで放置する', '他の人に任せる',
        '2', '5'
    ])
    return output.getvalue()


def export_test_questions_to_csv(test_instance):
    """Exports all questions, options, and group associations from test_instance
    into a standardized CSV format matching the import template.
    Seamlessly supports both JFT (4 sections) and SSW (2 phases, typing questions).
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'group_title', 'section', 'type', 'instruction', 'prompt', 'audio_script',
        'option_1', 'option_2', 'option_3', 'option_4',
        'correct_option', 'order_index'
    ])

    questions = test_instance.get_ordered_questions()
    for q in questions:
        group_title = q.group.title if q.group else ''
        options = list(q.options.all().order_by('order_index', 'id'))
        opt_labels = [opt.label for opt in options]
        while len(opt_labels) < 4:
            opt_labels.append('')

        # Determine correct_option index
        correct_idx = 1
        if q.type in [Question.QuestionType.TYPING, Question.QuestionType.AUDIO_TYPING]:
            # For typing questions, any listed option is valid accepted answer
            correct_idx = 1
        else:
            for i, opt in enumerate(options, start=1):
                if opt.is_correct:
                    correct_idx = i
                    break

        writer.writerow([
            group_title,
            q.section,
            q.type,
            q.instruction,
            q.prompt,
            q.audio_script,
            opt_labels[0],
            opt_labels[1],
            opt_labels[2],
            opt_labels[3],
            str(correct_idx),
            str(q.order_index),
        ])
    return output.getvalue()


def generate_test_missing_audio_worker(test_id, question_ids=None, group_ids=None, overwrite=False):
    """
    Background worker thread function to generate Edge-TTS audio for Questions and QuestionGroups.
    Guarantees thread-safe DB connection handling under WSGI/Passenger servers.
    """
    import sys
    from django.db import connection

    # Close any inherited connection so this thread acquires its own fresh database connection
    try:
        connection.close()
    except Exception:
        pass

    print(f"[AUDIO-WORKER] Starting background audio worker for Test #{test_id} (overwrite={overwrite})", file=sys.stderr, flush=True)

    try:
        from .audio_generator import generate_and_save_question_audio, generate_and_save_group_audio
        from .models import Question, QuestionGroup

        import time
        # 1. Questions (fetch list with retry for SQLite lock resilience)
        raw_questions = []
        for attempt in range(3):
            try:
                q_qs = Question.objects.filter(test_id=test_id)
                if question_ids:
                    q_qs = q_qs.filter(id__in=question_ids)
                raw_questions = list(q_qs)
                break
            except Exception as e:
                if 'locked' in str(e).lower() and attempt < 2:
                    time.sleep(0.3 * (attempt + 1))
                else:
                    raise

        questions_to_process = []
        for q in raw_questions:
            has_script = bool(q.audio_script and q.audio_script.strip()) or (
                q.type in [Question.QuestionType.AUDIO, Question.QuestionType.IMAGE_AUDIO, Question.QuestionType.AUDIO_TYPING]
                and bool(q.prompt and ('[' in q.prompt or '：' in q.prompt or ':' in q.prompt))
            )
            if has_script:
                if overwrite or not q.audio:
                    questions_to_process.append(q)

        print(f"[AUDIO-WORKER] Test #{test_id}: Processing {len(questions_to_process)} question(s) requiring audio...", file=sys.stderr, flush=True)
        success_q = 0
        for q in questions_to_process:
            try:
                if generate_and_save_question_audio(q, overwrite=overwrite):
                    success_q += 1
                    print(f"[AUDIO-WORKER] ✓ Generated audio for Question #{q.id} (Order {q.order_index})", file=sys.stderr, flush=True)
                else:
                    print(f"[AUDIO-WORKER] ✕ Skipped/failed Question #{q.id}", file=sys.stderr, flush=True)
            except Exception as q_err:
                print(f"[AUDIO-WORKER] Error on Question #{q.id}: {q_err}", file=sys.stderr, flush=True)

        # 2. Groups (fetch list with retry)
        raw_groups = []
        for attempt in range(3):
            try:
                g_qs = QuestionGroup.objects.filter(test_id=test_id)
                if group_ids:
                    g_qs = g_qs.filter(id__in=group_ids)
                raw_groups = list(g_qs)
                break
            except Exception as e:
                if 'locked' in str(e).lower() and attempt < 2:
                    time.sleep(0.3 * (attempt + 1))
                else:
                    raise

        success_g = 0
        for g in raw_groups:
            if g.audio_script and g.audio_script.strip() and (overwrite or not g.audio):
                try:
                    if generate_and_save_group_audio(g, overwrite=overwrite):
                        success_g += 1
                        print(f"[AUDIO-WORKER] ✓ Generated audio for Group #{g.id} ({g.title})", file=sys.stderr, flush=True)
                except Exception as g_err:
                    print(f"[AUDIO-WORKER] Error on Group #{g.id}: {g_err}", file=sys.stderr, flush=True)

        print(f"[AUDIO-WORKER] Test #{test_id} complete: {success_q} questions, {success_g} groups generated.", file=sys.stderr, flush=True)

        # Invalidate cache so frontend immediately gets the updated audio URLs
        try:
            from tests.signals import invalidate_test_cache
            invalidate_test_cache(test_id)
        except Exception:
            pass

        return success_q, success_g

    except Exception as e:
        import traceback
        print(f"[AUDIO-WORKER] Worker exception: {traceback.format_exc()}", file=sys.stderr, flush=True)
        return 0, 0
    finally:
        try:
            connection.close()
        except Exception:
            pass


def import_questions_from_csv(test_instance, file_stream, auto_generate_audio=True, run_in_background=True):
    """
    Parses a CSV file or file-like object and creates Questions, QuestionGroups, and AnswerOptions for test_instance.
    If auto_generate_audio is True, generates TTS audio files for any rows with an audio_script.
    If run_in_background is True, audio generation runs in a background thread so the HTTP request returns instantly!
    Returns (created_count, errors_list).
    """
    raw_bytes = None
    if isinstance(file_stream, bytes):
        raw_bytes = file_stream
    elif hasattr(file_stream, 'read'):
        raw_bytes = file_stream.read()
        if isinstance(raw_bytes, str):
            raw_bytes = raw_bytes.encode('utf-8')
    elif isinstance(file_stream, str):
        raw_bytes = file_stream.encode('utf-8')

    if not raw_bytes:
        return 0, ["The uploaded file is empty."]

    # Check if user uploaded an Excel .xlsx or .xls file (Zip header PK\x03\x04 or OLE header \xd0\xcf\x11\xe0)
    if raw_bytes.startswith(b'PK\x03\x04') or raw_bytes.startswith(b'\xd0\xcf\x11\xe0'):
        raise ValueError(
            "You uploaded an Excel spreadsheet (.xlsx/.xls). Please export or save it as a CSV file (.csv) before uploading. In Google Sheets/Excel: File > Download/Save As > Comma Separated Values (.csv)."
        )

    # Decode using resilient multi-encoding fallback
    file_content = None
    for enc in ['utf-8-sig', 'utf-8', 'cp1252', 'latin-1', 'shift-jis']:
        try:
            file_content = raw_bytes.decode(enc)
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    if file_content is None:
        file_content = raw_bytes.decode('utf-8', errors='replace')

    # Remove any null bytes
    file_content = file_content.replace('\x00', '')

    # Automatically detect delimiter (comma, semicolon, tab)
    sample = file_content[:2048]
    delimiter = ','
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
    elif '\t' in sample and sample.count('\t') > sample.count(','):
        delimiter = '\t'

    reader = csv.DictReader(io.StringIO(file_content), delimiter=delimiter)
    
    # Normalize fieldnames to lowercase trimmed strings
    if reader.fieldnames:
        reader.fieldnames = [f.strip().lower() for f in reader.fieldnames if f]

    created_count = 0
    errors = []
    created_groups = {}  # Cache groups by title to link multiple questions to the same group

    def get_val(row, *aliases):
        for alias in aliases:
            norm = alias.strip().lower()
            if norm in row and row[norm]:
                return row[norm]
            for k, v in row.items():
                if k.replace('_', '').replace(' ', '') == norm.replace('_', '').replace(' ', ''):
                    if v:
                        return v
        return ''

    # First pass: collect all groups needed
    groups_to_create = {}  # title -> (instruction, order_idx, audio_script)
    rows_data = []

    row_num = 1
    for row in reader:
        row_num += 1
        if not row:
            continue
        clean_row = {str(k).strip().lower(): (str(v).strip() if v is not None else '') for k, v in row.items() if k is not None}

        prompt = get_val(clean_row, 'prompt', 'question', 'question_text', 'question text', 'problem', 'text', 'item')
        instruction = get_val(clean_row, 'instruction', 'instructions', 'pre_prompt', 'guide', 'direction', 'directions')
        audio_script = get_val(clean_row, 'audio_script', 'audio script', 'dialogue', 'script', 'audio_text', 'tts_script', 'tts')

        opt1 = get_val(clean_row, 'option_1', 'option 1', 'option1', 'option_a', 'option a', 'a', 'choice_1', 'choice 1')
        opt2 = get_val(clean_row, 'option_2', 'option 2', 'option2', 'option_b', 'option b', 'b', 'choice_2', 'choice 2')
        opt3 = get_val(clean_row, 'option_3', 'option 3', 'option3', 'option_c', 'option c', 'c', 'choice_3', 'choice 3')
        opt4 = get_val(clean_row, 'option_4', 'option 4', 'option4', 'option_d', 'option d', 'd', 'choice_4', 'choice 4')

        if not prompt and not opt1 and not audio_script:
            continue

        sec_str = get_val(clean_row, 'section', 'part', 'category', 'type_section').lower()
        is_skill_test = getattr(test_instance, 'category', '') == Test.Category.SKILL
        if sec_str:
            section_val = SECTION_MAP.get(sec_str, Question.Section.OCCUPATIONAL if is_skill_test else Question.Section.SCRIPT_VOCAB)
        else:
            # If section column is omitted, intelligently assign based on exam category & content
            if is_skill_test:
                section_val = Question.Section.AUDIO if (audio_script or 'audio' in str(clean_row.get('type', '')).lower()) else Question.Section.OCCUPATIONAL
            else:
                section_val = Question.Section.SCRIPT_VOCAB

        type_str = get_val(clean_row, 'type', 'question_type', 'q_type').lower()
        type_val = TYPE_MAP.get(type_str, Question.QuestionType.TEXT)

        # Auto-promote to audio type if section is listening or audio script is given without type
        if audio_script and type_val == Question.QuestionType.TEXT:
            if section_val == Question.Section.LISTENING:
                type_val = Question.QuestionType.AUDIO

        try:
            order_raw = get_val(clean_row, 'order_index', 'order', 'no', 'number', 'q_num')
            order_idx = int(order_raw) if order_raw else (row_num - 1)
        except ValueError:
            order_idx = row_num - 1

        group_title = get_val(clean_row, 'group_title', 'group', 'passage', 'reading_passage', 'context')
        if group_title:
            group_title_safe = str(group_title).strip()[:250]
            if group_title_safe not in groups_to_create:
                groups_to_create[group_title_safe] = (instruction, order_idx, audio_script if not prompt else '')

        # Determine correct option index
        correct_raw = str(get_val(clean_row, 'correct_option', 'correct option', 'correct_answer', 'correct answer', 'answer', 'correct', 'key', 'ans') or '1').strip().lower()
        if correct_raw in ['1', 'a', 'option a', 'opt 1', 'option 1', 'first']:
            correct_idx = 1
        elif correct_raw in ['2', 'b', 'option b', 'opt 2', 'option 2', 'second']:
            correct_idx = 2
        elif correct_raw in ['3', 'c', 'option c', 'opt 3', 'option 3', 'third']:
            correct_idx = 3
        elif correct_raw in ['4', 'd', 'option d', 'opt 4', 'option 4', 'fourth']:
            correct_idx = 4
        else:
            try:
                correct_idx = int(correct_raw)
            except ValueError:
                found_idx = 1
                for idx_cand, opt_cand in enumerate([opt1, opt2, opt3, opt4], start=1):
                    if opt_cand and opt_cand.lower() == correct_raw:
                        found_idx = idx_cand
                        break
                correct_idx = found_idx

        # Extract custom translations if provided
        custom_translations = {}
        for lang in ['Bengali', 'English', 'Chinese', 'Indonesian', 'Khmer', 'Mongolian', 'Myanmar', 'Nepali', 'Thai', 'Vietnamese']:
            val = get_val(clean_row, f'translation_{lang.lower()}', lang.lower())
            if val:
                custom_translations[lang] = str(val).strip()

        rows_data.append({
            'row_num': row_num,
            'section': section_val,
            'type': type_val,
            'instruction': instruction,
            'prompt': prompt,
            'audio_script': str(audio_script).strip() if audio_script else '',
            'translations': custom_translations if custom_translations else {},
            'order_index': order_idx,
            'group_title': str(group_title).strip()[:250] if group_title else None,
            'options': [opt1, opt2, opt3, opt4],
            'correct_idx': correct_idx,
        })

    with transaction.atomic():
        # Batch create all groups at once
        created_groups = {}
        for title, (instr, oidx, g_script) in groups_to_create.items():
            group_obj, _ = QuestionGroup.objects.get_or_create(
                test=test_instance,
                title=title,
                defaults={'instruction': instr, 'order_index': oidx, 'audio_script': g_script}
            )
            created_groups[title] = group_obj

        # Batch create all questions
        question_objects = []
        for rd in rows_data:
            group_obj = created_groups.get(rd['group_title']) if rd['group_title'] else None
            question_objects.append(Question(
                test=test_instance,
                group=group_obj,
                section=rd['section'],
                type=rd['type'],
                instruction=rd['instruction'],
                prompt=rd['prompt'],
                audio_script=rd['audio_script'],
                translations=rd['translations'],
                order_index=rd['order_index'],
            ))

        created_questions = Question.objects.bulk_create(question_objects)

        # Batch create all answer options
        option_objects = []
        for q, rd in zip(created_questions, rows_data):
            is_typing_q = q.type in [Question.QuestionType.TYPING, Question.QuestionType.AUDIO_TYPING]
            for i, label in enumerate(rd['options'], start=1):
                if label:
                    # For typing questions, any listed option is a valid accepted answer (e.g. hiragana, romaji)
                    is_corr = True if is_typing_q else (i == rd['correct_idx'])
                    option_objects.append(AnswerOption(
                        question=q,
                        label=str(label).strip()[:250],
                        is_correct=is_corr,
                        order_index=i,
                    ))

        AnswerOption.objects.bulk_create(option_objects)
        created_count = len(created_questions)

    # Auto-generate TTS audio if requested (outside transaction so files save safely)
    if auto_generate_audio:
        q_ids = [q.id for q, rd in zip(created_questions, rows_data) if rd.get('audio_script', '').strip() or (
            rd.get('type') in [Question.QuestionType.AUDIO, Question.QuestionType.IMAGE_AUDIO, Question.QuestionType.AUDIO_TYPING]
            and rd.get('prompt') and ('[' in rd.get('prompt') or '：' in rd.get('prompt') or ':' in rd.get('prompt'))
        )]
        g_ids = [g.id for g in created_groups.values() if g.audio_script]

        if q_ids or g_ids:
            if run_in_background:
                import threading
                t = threading.Thread(
                    target=generate_test_missing_audio_worker,
                    kwargs={
                        'test_id': test_instance.id,
                        'question_ids': q_ids,
                        'group_ids': g_ids,
                        'overwrite': True,
                    },
                    daemon=True,
                    name=f"AudioWorker-Test-{test_instance.id}"
                )
                t.start()
            else:
                # Synchronous execution (e.g. CLI management commands)
                generate_test_missing_audio_worker(
                    test_id=test_instance.id,
                    question_ids=q_ids,
                    group_ids=g_ids,
                    overwrite=True
                )

    return created_count, errors


