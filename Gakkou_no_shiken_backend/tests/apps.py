from django.apps import AppConfig
from django.conf import settings
import os


class TestsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tests'

    def ready(self):
        try:
            import tests.signals
        except Exception:
            pass

        # Automatically ensure all media directories exist with full permissions
        media_root = getattr(settings, 'MEDIA_ROOT', None)
        if media_root:
            subdirs = [
                'questions/images',
                'questions/audio',
                'groups/images',
                'groups/audio',
                'options/images',
                'tests/images',
            ]
            for sub in subdirs:
                try:
                    p = os.path.join(str(media_root), sub)
                    os.makedirs(p, mode=0o777, exist_ok=True)
                    try:
                        os.chmod(p, 0o777)
                    except Exception:
                        pass
                except Exception:
                    pass
