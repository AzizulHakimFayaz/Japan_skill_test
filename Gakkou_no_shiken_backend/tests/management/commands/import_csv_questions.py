import os
from django.core.management.base import BaseCommand, CommandError
from tests.models import Test
from tests.utils import import_questions_from_csv

class Command(BaseCommand):
    help = 'Bulk import questions and answer options from a CSV file into a specified Test'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file to import')
        parser.add_argument('--test-id', type=int, required=True, help='ID of the target Test instance')
        parser.add_argument('--clear-existing', action='store_true', help='Clear existing questions for this test before importing')
        parser.add_argument('--no-audio', action='store_true', help='Skip auto-generating TTS audio files on import')

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        test_id = options['test_id']
        clear_existing = options['clear_existing']
        auto_generate_audio = not options.get('no_audio', False)

        if not os.path.exists(csv_path):
            raise CommandError(f"CSV file not found at: {csv_path}")

        try:
            test_obj = Test.objects.get(pk=test_id)
        except Test.DoesNotExist:
            raise CommandError(f"Test with ID {test_id} does not exist.")

        if clear_existing:
            deleted_count, _ = test_obj.questions.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted_count} existing questions/options from '{test_obj.title}'."))

        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            created_count, errors = import_questions_from_csv(test_obj, f, auto_generate_audio=auto_generate_audio)


        if errors:
            for err in errors:
                self.stdout.write(self.style.NOTICE(f"Warning: {err}"))

        self.stdout.write(self.style.SUCCESS(
            f"Successfully imported {created_count} question(s) into '{test_obj.title}' (ID: {test_obj.id})."
        ))
