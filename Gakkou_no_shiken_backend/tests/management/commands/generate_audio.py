import sys
from django.core.management.base import BaseCommand, CommandError
from tests.models import Test, Question, QuestionGroup
from tests.audio_generator import generate_and_save_question_audio, generate_and_save_group_audio


class Command(BaseCommand):
    help = 'Generate or regenerate Edge-TTS AI audio for Questions and Question Groups with audio scripts'

    def add_arguments(self, parser):
        parser.add_argument('--test-id', type=int, help='ID of specific Test to process')
        parser.add_argument('--question-id', type=int, help='ID of specific Question to process')
        parser.add_argument('--group-id', type=int, help='ID of specific QuestionGroup to process')
        parser.add_argument('--force', action='store_true', help='Force regeneration even if audio already exists')

    def handle(self, *args, **options):
        test_id = options.get('test_id')
        q_id = options.get('question_id')
        g_id = options.get('group_id')
        force = options.get('force', False)

        success_count = 0
        skip_count = 0
        error_count = 0

        # Handle specific Question
        if q_id:
            try:
                question = Question.objects.get(pk=q_id)
            except Question.DoesNotExist:
                raise CommandError(f"Question with ID {q_id} does not exist.")

            self.stdout.write(f"Processing Question #{question.id} (Order: {question.order_index})...")
            if generate_and_save_question_audio(question, overwrite=force):
                self.stdout.write(self.style.SUCCESS(f"✓ Generated audio for Question #{question.id}"))
                success_count += 1
            else:
                self.stdout.write(self.style.WARNING(f"✕ Skipped or failed Question #{question.id} (already has audio or no script)"))
                skip_count += 1
            return

        # Handle specific Group
        if g_id:
            try:
                group = QuestionGroup.objects.get(pk=g_id)
            except QuestionGroup.DoesNotExist:
                raise CommandError(f"QuestionGroup with ID {g_id} does not exist.")

            self.stdout.write(f"Processing QuestionGroup #{group.id} ({group.title})...")
            if generate_and_save_group_audio(group, overwrite=force):
                self.stdout.write(self.style.SUCCESS(f"✓ Generated audio for QuestionGroup #{group.id}"))
                success_count += 1
            else:
                self.stdout.write(self.style.WARNING(f"✕ Skipped or failed QuestionGroup #{group.id}"))
                skip_count += 1
            return

        # Query questions
        q_qs = Question.objects.all()
        g_qs = QuestionGroup.objects.all()
        if test_id:
            try:
                test = Test.objects.get(pk=test_id)
                self.stdout.write(f"Targeting Test: {test.title} (ID: {test.id})")
                q_qs = q_qs.filter(test=test)
                g_qs = g_qs.filter(test=test)
            except Test.DoesNotExist:
                raise CommandError(f"Test with ID {test_id} does not exist.")

        self.stdout.write(self.style.NOTICE(f"Scanning {q_qs.count()} questions and {g_qs.count()} groups..."))

        # Process Groups
        for group in g_qs:
            if group.audio_script and (force or not group.audio):
                self.stdout.write(f"Generating group audio for: {group.title or group.id}...")
                try:
                    if generate_and_save_group_audio(group, overwrite=force):
                        self.stdout.write(self.style.SUCCESS(f"✓ Generated group audio: {group.title or group.id}"))
                        success_count += 1
                    else:
                        error_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error on group {group.id}: {str(e)}"))
                    error_count += 1

        # Process Questions
        for q in q_qs:
            has_script = bool(q.audio_script) or (q.type in ['audio', 'image_audio'] and bool(q.prompt))
            if has_script and (force or not q.audio):
                self.stdout.write(f"Generating audio for Question #{q.order_index} (ID: {q.id})...")
                try:
                    if generate_and_save_question_audio(q, overwrite=force):
                        self.stdout.write(self.style.SUCCESS(f"✓ Generated audio for Question #{q.id} (Order: {q.order_index})"))
                        success_count += 1
                    else:
                        skip_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error on Question #{q.id}: {str(e)}"))
                    error_count += 1
            else:
                skip_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nFinished TTS Audio Generation: {success_count} generated, {skip_count} skipped, {error_count} errors."
        ))
