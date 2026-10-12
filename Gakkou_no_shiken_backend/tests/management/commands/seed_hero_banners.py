from django.core.management.base import BaseCommand
from tests.models import HeroBanner

class Command(BaseCommand):
    help = "Seeds initial dynamic hero banner slides for Game Zone, Lessons, CBT Mock Exams, JAC Textbooks, and SSW Careers"

    def handle(self, *args, **options):
        initial_banners = [
            {
                "order": 1,
                "title": "Play & Master Japanese in Game Zone",
                "title_highlight": "Game Zone Arcade",
                "subtitle": "Interactive arcade games with sound effects! Kanji Hunter, Word Match, Sentence Builder & 3 Lives challenge.",
                "badge_text": "🎮 JAPANESE ARCADE GAME ZONE",
                "badge_icon": "gamepad",
                "image_url": "/img/game_banner.jpg",
                "mobile_image_url": "/img/game_banner.jpg",
                "primary_btn_text": "Play Games Now",
                "primary_btn_url": "/game-zone",
                "secondary_btn_text": "Hall of Fame",
                "secondary_btn_url": "/game-zone/ranks",
                "theme_color": "purple",
                "is_active": True,
            },
            {
                "order": 2,
                "title": "Master Structured JLPT N5 & N4 Lessons",
                "title_highlight": "Japanese Lessons",
                "subtitle": "Structured vocabulary, Kanji stroke orders, and native pronunciation with English and Bengali translations.",
                "badge_text": "📚 STRUCTURED LESSONS (N5 • N4)",
                "badge_icon": "book",
                "image_url": "/img/hero_anime_student.jpg",
                "mobile_image_url": "/img/hero_anime_student.jpg",
                "primary_btn_text": "Start Lessons",
                "primary_btn_url": "/lessons",
                "secondary_btn_text": "Study Flashcards",
                "secondary_btn_url": "/tools/flashcards",
                "theme_color": "cyan",
                "is_active": True,
            },
            {
                "order": 3,
                "title": "Authentic Prometric CBT Mock Examination",
                "title_highlight": "CBT Mock Exams",
                "subtitle": "Bangladesh's #1 official Prometric test simulator with native listening audio, 10 language aids & instant CEFR certificates.",
                "badge_text": "🇧🇩 BANGLADESH'S #1 CBT SIMULATOR",
                "badge_icon": "zap",
                "image_url": "/img/hero_professional_cbt.jpg",
                "mobile_image_url": "/img/hero_professional_cbt.jpg",
                "primary_btn_text": "Start Practice",
                "primary_btn_url": "/jft-basic",
                "secondary_btn_text": "SSW Skill Tests",
                "secondary_btn_url": "/ssw-skill-test",
                "theme_color": "rose",
                "is_active": True,
            },
            {
                "order": 4,
                "title": "26 Official JAC Textbooks & Synchronized Audio",
                "title_highlight": "JAC Textbooks",
                "subtitle": "Official JAC construction textbooks across 15 languages with synchronized cloud PDF reader and native audio player.",
                "badge_text": "📖 26 JAC TEXTBOOKS (15 LANGUAGES)",
                "badge_icon": "book",
                "image_url": "/img/japanese_night_street.jpg",
                "mobile_image_url": "/img/japanese_night_street.jpg",
                "primary_btn_text": "Read Textbooks",
                "primary_btn_url": "/books",
                "secondary_btn_text": "JAC Guide",
                "secondary_btn_url": "/guides/jac-textbooks-guide",
                "theme_color": "emerald",
                "is_active": True,
            },
            {
                "order": 5,
                "title": "Launch Your Career in Japan with SSW Visa",
                "title_highlight": "Japan with SSW",
                "subtitle": "Prepare for Nursing Care, Food Service, Agriculture, Construction, and all 12 Specified Skilled Worker sectors.",
                "badge_text": "💼 12 SSW INDUSTRY SECTORS",
                "badge_icon": "shield",
                "image_url": "/img/hero_professional_cbt.jpg",
                "mobile_image_url": "/img/hero_professional_cbt.jpg",
                "primary_btn_text": "Explore Sectors",
                "primary_btn_url": "/ssw-skill-test",
                "secondary_btn_text": "SSW Guide",
                "secondary_btn_url": "/guides/ssw-skill-test-guide",
                "theme_color": "emerald",
                "is_active": True,
            },
        ]

        count = 0
        for item in initial_banners:
            obj, created = HeroBanner.objects.update_or_create(
                order=item["order"],
                defaults=item
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded/updated {len(initial_banners)} Hero Banners ({count} newly created)."))
