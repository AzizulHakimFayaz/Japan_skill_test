import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError

from tests.learn_importer import import_learn_directory, import_learn_json_data
from tests.models import LearnLesson, LearnTopic, LearnWord


class Command(BaseCommand):
    help = "Import Learn Japanese topic JSONs (e.g. D:\\JLPT questions\\Learn_Japanese\\json) or apply a 7-language translation bundle."

    def add_arguments(self, parser):
        parser.add_argument("source", type=str, help="Path to Learn_Japanese/json directory or a single JSON file.")

    def handle(self, *args, **options):
        src = Path(options["source"])
        if not src.exists():
            raise CommandError(f"Path not found: {src}")

        if src.is_dir():
            summary = import_learn_directory(src)
        else:
            payload = json.load(src.open("r", encoding="utf-8"))
            summary = import_learn_json_data(payload)

        self.stdout.write(self.style.SUCCESS(f"Import complete: {summary}"))
        self.stdout.write(
            f"DB Totals: {LearnTopic.objects.count()} topics | "
            f"{LearnLesson.objects.count()} lessons/parts | "
            f"{LearnWord.objects.count()} words"
        )
