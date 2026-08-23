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
    if isinstance(file_stream, bytes):
        file_content = file_stream.decode('utf-8-sig', errors='replace')
    elif isinstance(file_stream, str):
        file_content = file_stream
    else:
        # File-like object (e.g. UploadedFile)
        file_content = file_stream.read()
        if isinstance(file_content, bytes):
            file_content = file_content.decode('utf-8-sig', errors='replace')

    reader = csv.DictReader(io.StringIO(file_content))
    
    # Normalize fieldnames to lowercase trimmed strings
    if reader.fieldnames:
        reader.fieldnames = [f.strip().lower() for f in reader.fieldnames]

    created_count = 0
    errors = []
    created_groups = {}  # Cache groups by title to link multiple questions to the same group

    with transaction.atomic():
        row_num = 1
        for row in reader:
            row_num += 1
            # Clean dictionary values
            clean_row = {k.strip(): (v.strip() if v else '') for k, v in row.items() if k}
            
            prompt = clean_row.get('prompt', '')
            instruction = clean_row.get('instruction', '')
            if not prompt and not clean_row.get('option_1'):
                # Empty row, skip
                continue

            sec_str = clean_row.get('section', '').lower()
            section_val = SECTION_MAP.get(sec_str, Question.Section.SCRIPT_VOCAB)

            type_str = clean_row.get('type', 'text').lower()
            type_val = TYPE_MAP.get(type_str, Question.QuestionType.TEXT)

            try:
                order_idx = int(clean_row.get('order_index', row_num - 1))
            except ValueError:
                order_idx = row_num - 1

            # Check if group_title is provided
            group_title = clean_row.get('group_title', '') or clean_row.get('group', '')
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

            # Determine correct option index (1-based integer)
            correct_raw = clean_row.get('correct_option', '1')
            try:
                correct_idx = int(correct_raw)
            except ValueError:
                correct_idx = 1

            # Extract custom translations if provided in CSV
            custom_translations = {}
            for lang in ['Bengali', 'English', 'Chinese', 'Indonesian', 'Khmer', 'Mongolian', 'Myanmar', 'Nepali', 'Thai', 'Vietnamese']:
                val = clean_row.get(f'translation_{lang.lower()}', '') or clean_row.get(lang.lower(), '')
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
            option_labels = [
                clean_row.get('option_1', ''),
                clean_row.get('option_2', ''),
                clean_row.get('option_3', ''),
                clean_row.get('option_4', ''),
            ]

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
