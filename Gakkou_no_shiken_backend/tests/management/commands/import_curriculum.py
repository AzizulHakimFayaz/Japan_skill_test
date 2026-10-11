import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from tests.models import CurriculumLesson, CurriculumVocabulary, CurriculumKanji

class Command(BaseCommand):
    help = "Import curriculum lessons (vocabulary and kanji) from curriculum_seed.json into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default=None,
            help='Path to curriculum_seed.json file (defaults to tests/data/curriculum_seed.json)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing curriculum records before importing'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        if not file_path:
            # __file__ is in Gakkou_no_shiken_backend/tests/management/commands/import_curriculum.py
            # parent: commands -> management -> tests -> Gakkou_no_shiken_backend
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            file_path = os.path.join(base_dir, 'tests', 'data', 'curriculum_seed.json')

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        self.stdout.write(f"Loading seed data from: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        vocab_lessons = data.get('vocabulary_lessons', [])
        kanji_lessons = data.get('kanji_lessons', [])

        self.stdout.write(f"Found {len(vocab_lessons)} vocab lessons and {len(kanji_lessons)} kanji lessons.")

        with transaction.atomic():
            if options['clear']:
                self.stdout.write("Clearing existing curriculum data...")
                CurriculumVocabulary.objects.all().delete()
                CurriculumKanji.objects.all().delete()
                CurriculumLesson.objects.all().delete()

            # 1. Process Vocabulary Lessons
            total_vocab_words = 0
            for v_data in vocab_lessons:
                lesson, created = CurriculumLesson.objects.update_or_create(
                    lesson_type=CurriculumLesson.LessonType.VOCABULARY,
                    level=v_data.get('level', 'N5'),
                    lesson_number=v_data.get('lesson_number', 1),
                    defaults={
                        'title': v_data.get('title', ''),
                        'items_count': v_data.get('items_count', 0),
                    }
                )

                # Remove existing vocabularies for clean bulk re-insert
                lesson.vocabularies.all().delete()

                words_to_create = []
                for w in v_data.get('words', []):
                    words_to_create.append(CurriculumVocabulary(
                        lesson=lesson,
                        order_index=w.get('order', 0),
                        word=w.get('word', ''),
                        furigana=w.get('furigana', ''),
                        romaji=w.get('romaji', ''),
                        meaning_en=w.get('meaning_en', ''),
                        meaning_bn=w.get('meaning_bn', ''),
                        speech=w.get('speech', ''),
                    ))

                CurriculumVocabulary.objects.bulk_create(words_to_create)
                lesson.items_count = len(words_to_create)
                lesson.save(update_fields=['items_count'])
                total_vocab_words += len(words_to_create)

            # 2. Process Kanji Lessons
            total_kanji_items = 0
            for k_data in kanji_lessons:
                lesson, created = CurriculumLesson.objects.update_or_create(
                    lesson_type=CurriculumLesson.LessonType.KANJI,
                    level=k_data.get('level', 'N5'),
                    lesson_number=k_data.get('lesson_number', 1),
                    defaults={
                        'title': k_data.get('title', ''),
                        'items_count': k_data.get('items_count', 0),
                    }
                )

                # Remove existing kanjis for clean bulk re-insert
                lesson.kanjis.all().delete()

                kanji_to_create = []
                for k in k_data.get('kanji_items', []):
                    kanji_to_create.append(CurriculumKanji(
                        lesson=lesson,
                        order_index=k.get('order', 0),
                        character=k.get('character', ''),
                        onyomi=k.get('onyomi', ''),
                        kunyomi=k.get('kunyomi', ''),
                        romaji=k.get('romaji', ''),
                        meaning_en=k.get('meaning_en', ''),
                        meaning_bn=k.get('meaning_bn', ''),
                        speech=k.get('speech', ''),
                    ))

                CurriculumKanji.objects.bulk_create(kanji_to_create)
                lesson.items_count = len(kanji_to_create)
                lesson.save(update_fields=['items_count'])
                total_kanji_items += len(kanji_to_create)

        self.stdout.write(self.style.SUCCESS(
            f"Successfully imported!\n"
            f"  - Vocab: {len(vocab_lessons)} lessons ({total_vocab_words} words)\n"
            f"  - Kanji: {len(kanji_lessons)} lessons ({total_kanji_items} characters)\n"
            f"  - Total Lessons: {len(vocab_lessons) + len(kanji_lessons)}"
        ))
