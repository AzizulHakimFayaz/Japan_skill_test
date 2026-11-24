import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError

from tests.jlpt_importer import import_jlpt_directory, import_jlpt_json_data
from tests.models import JLPTQuestion, JLPTSet


class Command(BaseCommand):
    help = "Import or patch JLPT mock tests (N5-N1) from a directory (e.g. D:\\JLPT questions) or a single JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "source",
            type=str,
            help="Path to the JLPT questions directory or a single JSON file.",
        )
        parser.add_argument(
            "--levels",
            nargs="*",
            default=None,
            help="Optional list of levels to import when source is a directory (e.g. --levels N5 N1).",
        )
        parser.add_argument(
            "--level",
            type=str,
            default=None,
            help="Optional level override when importing a single JSON file (e.g. --level N1).",
        )

    def handle(self, *args, **options):
        src = Path(options["source"])
        if not src.exists():
            raise CommandError(f"Source path does not exist: {src}")

        if src.is_dir():
            self.stdout.write(self.style.NOTICE(f"Importing JLPT dataset from directory: {src}"))
            summary = import_jlpt_directory(src, levels=options.get("levels"))
        else:
            self.stdout.write(self.style.NOTICE(f"Importing JLPT JSON file: {src}"))
            with src.open("r", encoding="utf-8") as fh:
                payload = json.load(fh)
            summary = import_jlpt_json_data(payload, level_override=options.get("level"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done! Files: {summary.get('files_processed', 1)} | "
                f"Sets created: {summary.get('sets_created', 0)}, updated: {summary.get('sets_updated', 0)} | "
                f"Questions created: {summary.get('questions_created', 0)}, updated: {summary.get('questions_updated', 0)}"
            )
        )

        # Print per-level DB summary
        for lvl in ["N5", "N4", "N3", "N2", "N1"]:
            total_sets = JLPTSet.objects.filter(level=lvl).count()
            ready_sets = JLPTSet.objects.filter(level=lvl, is_ready=True).count()
            total_q = JLPTQuestion.objects.filter(jlpt_set__level=lvl).count()
            answered_q = JLPTQuestion.objects.filter(jlpt_set__level=lvl, answer_index__isnull=False).count()
            self.stdout.write(
                f"  {lvl}: {total_sets:>4} sets ({ready_sets:>3} ready) | {total_q:>5} questions ({answered_q:>4} answered)"
            )
