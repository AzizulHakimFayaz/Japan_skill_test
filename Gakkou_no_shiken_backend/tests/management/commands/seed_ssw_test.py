from django.core.management.base import BaseCommand
from tests.data.seed_ssw_demo import seed_ssw_demo_exam

class Command(BaseCommand):
    help = "Seeds an official-standard SSW Prometric CBT practice test with Phase 1 Audio/Typing and Phase 2 Occupational questions."

    def handle(self, *args, **options):
        self.stdout.write("Starting SSW Prometric Test Seeding...")
        test = seed_ssw_demo_exam()
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded SSW Practice Test: '{test.title}' (ID: {test.id})"))
