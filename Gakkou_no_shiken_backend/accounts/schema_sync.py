"""
Database Schema Synchronization & Self-Healing Utilities.
Safely ensures all required tables, columns, and migration states exist in SQLite
without crashing on already-existing tables or duplicate columns on cPanel.
"""
import logging
from django.db import connection
from django.utils import timezone

logger = logging.getLogger(__name__)


def ensure_schema_synced():
    """
    Ensures that all tables and columns required by Password Reset and
    Country Registration are created, and that django_migrations is properly synced.
    Safe to run repeatedly on production SQLite databases.
    """
    logs = []
    with connection.cursor() as cursor:
        # 1. accounts_emailverificationotp table
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_emailverificationotp (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    email varchar(254) NOT NULL,
                    otp_code varchar(6) NOT NULL,
                    created_at datetime NOT NULL,
                    is_verified bool NOT NULL,
                    username varchar(150) NOT NULL,
                    first_name varchar(150) NOT NULL,
                    last_name varchar(150) NOT NULL,
                    password_hash varchar(255) NOT NULL,
                    country varchar(100) NOT NULL DEFAULT ''
                )
            """)
            # Check for country column
            cursor.execute("PRAGMA table_info(accounts_emailverificationotp)")
            existing_cols = [c[1] for c in cursor.fetchall()]
            if 'country' not in existing_cols:
                cursor.execute("ALTER TABLE accounts_emailverificationotp ADD COLUMN country varchar(100) NOT NULL DEFAULT ''")
                logs.append("Added 'country' column to accounts_emailverificationotp.")
        except Exception as e:
            logs.append(f"Note on accounts_emailverificationotp: {e}")

        # 2. accounts_userprofile country fields
        try:
            cursor.execute("PRAGMA table_info(accounts_userprofile)")
            profile_cols = [c[1] for c in cursor.fetchall()]
            if 'country' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN country varchar(100) NULL")
                logs.append("Added 'country' column to accounts_userprofile.")
            if 'country_source' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN country_source varchar(20) NOT NULL DEFAULT 'unknown'")
                logs.append("Added 'country_source' column to accounts_userprofile.")
            if 'last_known_ip' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN last_known_ip char(39) NULL")
                logs.append("Added 'last_known_ip' column to accounts_userprofile.")
        except Exception as e:
            logs.append(f"Note on accounts_userprofile columns: {e}")

        # 3. accounts_passwordresettoken table & indexes
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_passwordresettoken (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    token_hash varchar(64) NOT NULL,
                    created_at datetime NOT NULL,
                    expires_at datetime NOT NULL,
                    is_used bool NOT NULL,
                    used_at datetime NULL,
                    ip_address char(39) NULL,
                    user_id integer NOT NULL REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_pa_token_h_dab8fb_idx ON accounts_passwordresettoken (token_hash, is_used)")
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_passwordresettoken_expires_at ON accounts_passwordresettoken (expires_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_passwordresettoken_user_id ON accounts_passwordresettoken (user_id)")
            logs.append("Verified accounts_passwordresettoken table and indexes.")
        except Exception as e:
            logs.append(f"Note on accounts_passwordresettoken: {e}")

        # 4. Notice and Test columns
        try:
            cursor.execute("PRAGMA table_info(tests_question)")
            q_cols = [c[1] for c in cursor.fetchall()]
            if 'audio_script' not in q_cols:
                cursor.execute("ALTER TABLE tests_question ADD COLUMN audio_script text NOT NULL DEFAULT ''")
        except Exception:
            pass

        try:
            cursor.execute("PRAGMA table_info(tests_questiongroup)")
            qg_cols = [c[1] for c in cursor.fetchall()]
            if 'audio_script' not in qg_cols:
                cursor.execute("ALTER TABLE tests_questiongroup ADD COLUMN audio_script text NOT NULL DEFAULT ''")
        except Exception:
            pass

        try:
            cursor.execute("PRAGMA table_info(tests_test)")
            t_cols = [c[1] for c in cursor.fetchall()]
            if 'scheduled_release_at' not in t_cols:
                cursor.execute("ALTER TABLE tests_test ADD COLUMN scheduled_release_at datetime")
        except Exception:
            pass

        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tests_notice (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    title varchar(255) NOT NULL,
                    summary text NOT NULL,
                    content text NOT NULL,
                    notice_type varchar(32) NOT NULL,
                    target_audience varchar(32) NOT NULL,
                    image varchar(100),
                    pdf_file varchar(100),
                    file_size_text varchar(64) NOT NULL,
                    action_url varchar(500) NOT NULL,
                    action_button_text varchar(64) NOT NULL,
                    is_active bool NOT NULL,
                    is_pinned bool NOT NULL,
                    show_as_popup bool NOT NULL,
                    order_index integer unsigned NOT NULL,
                    views_count integer unsigned NOT NULL,
                    downloads_count integer unsigned NOT NULL,
                    created_at datetime NOT NULL,
                    updated_at datetime NOT NULL,
                    expires_at datetime,
                    related_test_id bigint REFERENCES tests_test (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
        except Exception:
            pass

        # 5. Synchronize django_migrations table
        try:
            required_migrations = [
                ('accounts', '0001_initial'),
                ('accounts', '0002_emailverificationotp'),
                ('accounts', '0003_emailverificationotp_country_userprofile_country_and_more'),
                ('tests', '0014_question_audio_script_questiongroup_audio_script_and_more'),
                ('tests', '0015_notice'),
                ('tests', '0016_test_scheduled_release_at'),
            ]
            for app, name in required_migrations:
                cursor.execute("SELECT id FROM django_migrations WHERE app = %s AND name = %s", [app, name])
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s)",
                        [app, name, timezone.now()]
                    )
                    logs.append(f"Recorded migration {app}.{name} in django_migrations.")
        except Exception as e:
            logs.append(f"Note on django_migrations sync: {e}")

    # 6. Ensure superuser 'admin' exists with initial credentials (does not overwrite custom password)
    try:
        from django.contrib.auth.models import User
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', '03698742Fayaz@')
            logs.append("Created superuser 'admin' with initial credentials.")
    except Exception as e:
        logs.append(f"Admin setup note: {e}")

    return logs
