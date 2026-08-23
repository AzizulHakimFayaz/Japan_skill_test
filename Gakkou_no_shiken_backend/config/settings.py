import os
from pathlib import Path
from datetime import timedelta
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env(
    DEBUG=(bool, True),
    ALLOWED_HOSTS=(list, ['*']),
)

# Take environment variables from .env file if it exists
env_file = BASE_DIR / '.env'
if env_file.exists():
    environ.Env.read_env(env_file)

# Quick-start development settings - unsuitable for production
SECRET_KEY = env('SECRET_KEY', default='django-insecure-z&v^**=kgkjkpil6$n=+k*r1na0cpd2(w0+d#0l4yle29bo!*t')

# Temporarily force DEBUG=True on Railway to diagnose 500 errors
DEBUG = True
ALLOWED_HOSTS = ['*']

# Ensure Vercel / Railway domains are always allowed
if os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV') or os.environ.get('RAILWAY_ENVIRONMENT'):
    ALLOWED_HOSTS = ['*']

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Logging — print all Django errors to stdout so they show in Railway deploy logs
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}


CSRF_TRUSTED_ORIGINS = [
    'https://gakkou-no-shiken.vercel.app',
    'https://*.vercel.app',
    'https://*.onrender.com',
    'https://*.up.railway.app',
    'https://*.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Use signed cookies for sessions to avoid unnecessary DB lookups
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'tests.apps.TestsConfig',
    'accounts.apps.AccountsConfig',
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

import dj_database_url

database_url = os.environ.get('DATABASE_URL') or env('DATABASE_URL', default=None)
if database_url:
    DATABASES = {
        'default': dj_database_url.parse(str(database_url), conn_max_age=600, ssl_require=True)
    }
    DATABASES['default'].setdefault('OPTIONS', {})
    DATABASES['default']['OPTIONS']['sslmode'] = 'require'
    DATABASES['default']['CONN_HEALTH_CHECKS'] = True
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True

else:
    db_path = '/tmp/db.sqlite3' if (os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV')) else BASE_DIR / 'db.sqlite3'
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': db_path,
        }
    }



# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# High-Performance In-Memory Cache (reduces database hits by 95%)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'gakkou-fast-cache',
        'TIMEOUT': 3600,  # 1 hour
    }
}

# Static files (CSS, JavaScript, Images)

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files (uploaded questions images/audio)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary Storage Configuration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': env('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': env('CLOUDINARY_API_SECRET', default=''),
    'INVALID_VIDEO_ERROR_MESSAGE': 'Please upload a valid audio/media file.',
}

# Configure Storages (Django 4.2+)
if env('CLOUDINARY_CLOUD_NAME', default=None):
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.RawMediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }
elif env('AWS_ACCESS_KEY_ID', default=None) and env('AWS_SECRET_ACCESS_KEY', default=None):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "access_key": env('AWS_ACCESS_KEY_ID'),
                "secret_key": env('AWS_SECRET_ACCESS_KEY'),
                "bucket_name": env('AWS_STORAGE_BUCKET_NAME'),
                "endpoint_url": env('AWS_S3_ENDPOINT_URL', default=None),
                "region_name": env('AWS_S3_REGION_NAME', default=None),
                "custom_domain": env('AWS_S3_CUSTOM_DOMAIN', default=None),
            }
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage" if not DEBUG else "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Auth configuration
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'landing_page'
LOGOUT_REDIRECT_URL = 'landing_page'

# Jazzmin Admin Panel Customization
JAZZMIN_SETTINGS = {
    # Window / Tab
    "site_title": "Gakkou No Shiken Admin",
    "site_header": "Gakkou No Shiken",
    "site_brand": "Gakkou No Shiken",

    # Logo / Icon
    "site_logo": "img/logo.png",
    "login_logo": None,
    "site_icon": "img/logo.png",
    "site_logo_classes": "img-fluid",
    "welcome_sign": "Gakkou No Shiken — Admin Management",
    "copyright": "Gakkou No Shiken © 2026",


    # Global search — single clean search bar
    "search_model": ["tests.Test"],

    # Top navigation links
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site ↗", "url": "/", "new_window": True},
    ],

    # User menu dropdown
    "usermenu_links": [
        {"name": "View Public Site", "url": "/", "new_window": True, "icon": "fas fa-globe"},
        {"model": "auth.user"},
    ],

    # Sidebar
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": ["tests", "tests.Test", "tests.QuestionGroup", "tests.Question", "tests.Attempt", "auth"],

    # Model icons (FontAwesome 5)
    "icons": {
        "auth": "fas fa-shield-alt",
        "auth.user": "fas fa-user-shield",
        "auth.Group": "fas fa-users-cog",
        "tests.Test": "fas fa-file-alt",
        "tests.Question": "fas fa-question-circle",
        "tests.QuestionGroup": "fas fa-layer-group",
        "tests.AnswerOption": "fas fa-tasks",
        "tests.Attempt": "fas fa-chart-line",
    },
    "default_icon_parents": "fas fa-folder-open",
    "default_icon_children": "fas fa-circle-notch",

    # Modals for related objects
    "related_modal_active": True,

    # UI Builder
    "show_ui_builder": False,

    # Change form layout
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },

    # Custom CSS/JS injected into every admin page
    "custom_css": "css/admin_custom.css",
    "custom_js": None,
}

JAZZMIN_UI_TWEAKS = {
    # Text sizing
    "navbar_small_text": False,
    "footer_small_text": True,
    "body_small_text": False,
    "brand_small_text": False,

    # Theme & Colors — unified midnight slate theme
    "brand_colour": "navbar-dark",
    "accent": "accent-danger",
    "navbar": "navbar-dark",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-danger",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,

    # Base Bootstrap theme
    "theme": "darkly",
    "dark_mode_theme": None,

    # Button variants
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },

    # Actions bar
    "actions_sticky_top": True,
}



