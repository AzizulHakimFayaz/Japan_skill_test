from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Alias for generate_audio: Generate or regenerate Edge-TTS AI audio for Questions and Question Groups'

    def add_arguments(self, parser):
        parser.add_argument('--test-id', type=int, help='ID of specific Test to process')
        parser.add_argument('--question-id', type=int, help='ID of specific Question to process')
        parser.add_argument('--group-id', type=int, help='ID of specific QuestionGroup to process')
        parser.add_argument('--force', action='store_true', help='Force regeneration even if audio already exists')

    def handle(self, *args, **options):
        # Call generate_audio with forwarded arguments
        call_command('generate_audio', *args, **options)
