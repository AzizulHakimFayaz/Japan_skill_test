import csv
import io
from django.db import transaction
from .models import Test, Question, QuestionGroup, AnswerOption

SECTION_MAP = {
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
}

TYPE_MAP = {
    'text': Question.QuestionType.TEXT,
    'image': Question.QuestionType.IMAGE,
    'audio': Question.QuestionType.AUDIO,
    'image_audio': Question.QuestionType.IMAGE_AUDIO,
    'image+audio': Question.QuestionType.IMAGE_AUDIO,
}

def generate_sample_csv_string():
    """Generates a sample CSV template string for bulk question import with QuestionGroup support."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'group_title', 'section', 'type', 'instruction', 'prompt',
        'option_1', 'option_2', 'option_3', 'option_4',
        'correct_option', 'order_index'
    ])
    writer.writerow([
        '', 'Script and Vocabulary', 'text', 'How do you write the __underlined__ kanji word in hiragana? Choose the correct one.',
        '__水道__が こわれた ときは、 ここに でんわして ください。',
        'すいどう', 'すいとう', 'ずいどう', '',
        '1', '1'
    ])
    writer.writerow([
        '', 'Conversation and Expression', 'text', 'Complete the sentence:',
        'わたしは はるが ______ です。 (I like spring.)',
        'すき (suki)', 'きらい (kirai)', 'へた (heta)', '',
        '1', '2'
    ])
    writer.writerow([
        'Reading Passage 1 - Town Magazine', 'Reading Comprehension', 'image',
        'You are reading a town public magazine. Answer questions (1) and (2).',
        '(1) フェスティバルに 行った 人は 何が できましたか。',
        '歌と おどりを 見ること', 'がっきを 買うこと', 'アクセサリーを 作ること', '',
        '1', '3'
    ])
    writer.writerow([
        'Reading Passage 1 - Town Magazine', 'Reading Comprehension', 'image',
        'You are reading a town public magazine. Answer questions (1) and (2).',
        '(2) ホアさんは スピーチコンテストに 参加して どう 思いましたか。',
        'スピーチの けいけんが なかったけど、うまく いった', '自分の スピーチを わられて、かなしかった', '日本人の 英語の スピーチが 上手で、びっくりした', '',
        '1', '4'
    ])
    return output.getvalue()


def import_questions_from_csv(test_instance, file_stream):
    """
    Parses a CSV file or file-like object and creates Questions, QuestionGroups, and AnswerOptions for test_instance.
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

    with transaction.atomic():
        row_num = 1
        for row in reader:
            row_num += 1
            if not row:
                continue
            # Clean dictionary values
            clean_row = {str(k).strip().lower(): (str(v).strip() if v is not None else '') for k, v in row.items() if k is not None}
            
            prompt = get_val(clean_row, 'prompt', 'question', 'question_text', 'question text', 'problem', 'text', 'item')
            instruction = get_val(clean_row, 'instruction', 'instructions', 'pre_prompt', 'guide', 'direction', 'directions')
            
            opt1 = get_val(clean_row, 'option_1', 'option 1', 'option1', 'option_a', 'option a', 'a', 'choice_1', 'choice 1')
            opt2 = get_val(clean_row, 'option_2', 'option 2', 'option2', 'option_b', 'option b', 'b', 'choice_2', 'choice 2')
            opt3 = get_val(clean_row, 'option_3', 'option 3', 'option3', 'option_c', 'option c', 'c', 'choice_3', 'choice 3')
            opt4 = get_val(clean_row, 'option_4', 'option 4', 'option4', 'option_d', 'option d', 'd', 'choice_4', 'choice 4')

            if not prompt and not opt1:
                # Empty row, skip
                continue

            sec_str = get_val(clean_row, 'section', 'part', 'category', 'type_section').lower()
            section_val = SECTION_MAP.get(sec_str, Question.Section.SCRIPT_VOCAB)

            type_str = get_val(clean_row, 'type', 'question_type', 'q_type').lower()
            type_val = TYPE_MAP.get(type_str, Question.QuestionType.TEXT)

            try:
                order_raw = get_val(clean_row, 'order_index', 'order', 'no', 'number', 'q_num')
                order_idx = int(order_raw) if order_raw else (row_num - 1)
            except ValueError:
                order_idx = row_num - 1

            # Check if group_title is provided
            group_title = get_val(clean_row, 'group_title', 'group', 'passage', 'reading_passage', 'context')
            group_obj = None
            if group_title:
                if group_title not in created_groups:
                    group_obj, _ = QuestionGroup.objects.get_or_create(
                        test=test_instance,
                        title=group_title,
                        defaults={
                            'instruction': instruction,
                            'order_index': order_idx
                        }
                    )
                    created_groups[group_title] = group_obj
                else:
                    group_obj = created_groups[group_title]

            # Determine correct option index (1-based integer, supporting 1-4, A-D, or label match)
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
                    # Match by option text
                    found_idx = 1
                    for idx_cand, opt_cand in enumerate([opt1, opt2, opt3, opt4], start=1):
                        if opt_cand and opt_cand.lower() == correct_raw:
                            found_idx = idx_cand
                            break
                    correct_idx = found_idx

            # Extract custom translations if provided in CSV
            custom_translations = {}
            for lang in ['Bengali', 'English', 'Chinese', 'Indonesian', 'Khmer', 'Mongolian', 'Myanmar', 'Nepali', 'Thai', 'Vietnamese']:
                val = get_val(clean_row, f'translation_{lang.lower()}', lang.lower())
                if val:
                    custom_translations[lang] = val

            # Create Question
            question = Question.objects.create(
                test=test_instance,
                group=group_obj,
                section=section_val,
                type=type_val,
                instruction=instruction,
                prompt=prompt,
                translations=custom_translations if custom_translations else {},
                order_index=order_idx
            )

            # Collect options
            option_labels = [opt1, opt2, opt3, opt4]
            opt_created = 0
            for i, label in enumerate(option_labels, start=1):
                if label:
                    is_corr = (i == correct_idx)
                    AnswerOption.objects.create(
                        question=question,
                        label=label,
                        is_correct=is_corr,
                        order_index=i
                    )
                    opt_created += 1

            if opt_created == 0:
                errors.append(f"Row {row_num}: Question '{prompt[:30]}' created with no answer options.")
            
            created_count += 1

    return created_count, errors
