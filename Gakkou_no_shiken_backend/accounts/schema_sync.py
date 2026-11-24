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
        # 0. Enable SQLite WAL mode for non-blocking concurrent reads & writes on cPanel
        try:
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
        except Exception:
            pass

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
            if 'game_xp' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN game_xp integer NOT NULL DEFAULT 0")
                logs.append("Added 'game_xp' column to accounts_userprofile.")
            if 'game_level' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN game_level integer NOT NULL DEFAULT 1")
                logs.append("Added 'game_level' column to accounts_userprofile.")
            if 'game_streak' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN game_streak integer NOT NULL DEFAULT 0")
                logs.append("Added 'game_streak' column to accounts_userprofile.")
            if 'game_words_mastered' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN game_words_mastered integer NOT NULL DEFAULT 0")
                logs.append("Added 'game_words_mastered' column to accounts_userprofile.")
            if 'game_last_played' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN game_last_played date NULL")
                logs.append("Added 'game_last_played' column to accounts_userprofile.")
            if 'partner_school_id' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN partner_school_id bigint NULL REFERENCES accounts_partnerschool (id)")
                logs.append("Added 'partner_school_id' column to accounts_userprofile.")
            if 'partner_batch' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN partner_batch varchar(64) NOT NULL DEFAULT ''")
                logs.append("Added 'partner_batch' column to accounts_userprofile.")
            if 'student_roll_or_id' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN student_roll_or_id varchar(64) NOT NULL DEFAULT ''")
                logs.append("Added 'student_roll_or_id' column to accounts_userprofile.")
            if 'partner_joined_at' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN partner_joined_at datetime NULL")
                logs.append("Added 'partner_joined_at' column to accounts_userprofile.")
            if 'partner_status' not in profile_cols:
                cursor.execute("ALTER TABLE accounts_userprofile ADD COLUMN partner_status varchar(16) NOT NULL DEFAULT 'approved'")
                logs.append("Added 'partner_status' column to accounts_userprofile.")
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
            if 'partner_school_id' not in t_cols:
                cursor.execute("ALTER TABLE tests_test ADD COLUMN partner_school_id bigint NULL REFERENCES accounts_partnerschool (id)")
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

        # 5. Support Chat tables (accounts_supportthread & accounts_supportmessage)
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_supportthread (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    status varchar(20) NOT NULL DEFAULT 'needs_reply',
                    subject varchar(200) NOT NULL DEFAULT 'Candidate Support Chat',
                    unread_by_admin integer unsigned NOT NULL DEFAULT 0,
                    unread_by_user integer unsigned NOT NULL DEFAULT 0,
                    last_message_preview varchar(255) NOT NULL DEFAULT '',
                    last_message_at datetime NOT NULL,
                    created_at datetime NOT NULL,
                    updated_at datetime NOT NULL,
                    user_id integer NOT NULL UNIQUE REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_supportthread_status_idx ON accounts_supportthread (status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_supportthread_last_msg_idx ON accounts_supportthread (last_message_at)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_supportmessage (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    sender_type varchar(16) NOT NULL DEFAULT 'user',
                    sender_name varchar(150) NOT NULL DEFAULT '',
                    body text NOT NULL,
                    is_read bool NOT NULL DEFAULT 0,
                    created_at datetime NOT NULL,
                    thread_id bigint NOT NULL REFERENCES accounts_supportthread (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_supportmessage_thread_idx ON accounts_supportmessage (thread_id, id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_supportmessage_created_idx ON accounts_supportmessage (created_at)")
            logs.append("Verified accounts_supportthread and accounts_supportmessage tables.")
        except Exception as e:
            logs.append(f"Note on support chat tables: {e}")

        # 5b. Partner Schools & Applications (accounts_partnerschool & accounts_partnerapplication)
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnerschool (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    name varchar(200) NOT NULL,
                    slug varchar(120) NOT NULL UNIQUE,
                    country varchar(100) NOT NULL DEFAULT 'Indonesia',
                    city varchar(100) NOT NULL DEFAULT '',
                    contact_person varchar(150) NOT NULL DEFAULT '',
                    contact_whatsapp_or_email varchar(200) NOT NULL DEFAULT '',
                    website_url varchar(500) NOT NULL DEFAULT '',
                    welcome_message varchar(300) NOT NULL DEFAULT '',
                    access_token varchar(64) NOT NULL UNIQUE,
                    is_active bool NOT NULL DEFAULT 1,
                    is_featured bool NOT NULL DEFAULT 0,
                    created_at datetime NOT NULL,
                    updated_at datetime NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_partnerschool_slug_idx ON accounts_partnerschool (slug)")
            cursor.execute("CREATE INDEX IF NOT EXISTS accounts_partnerschool_active_idx ON accounts_partnerschool (is_active)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnerapplication (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    school_name varchar(200) NOT NULL,
                    country varchar(100) NOT NULL DEFAULT 'Indonesia',
                    city varchar(100) NOT NULL DEFAULT '',
                    contact_name varchar(150) NOT NULL,
                    whatsapp_or_phone varchar(100) NOT NULL DEFAULT '',
                    email varchar(254) NOT NULL DEFAULT '',
                    estimated_students integer unsigned NOT NULL DEFAULT 30,
                    message text NOT NULL DEFAULT '',
                    status varchar(20) NOT NULL DEFAULT 'pending',
                    created_at datetime NOT NULL
                )
            """)
            cursor.execute("PRAGMA table_info(accounts_partnerschool)")
            ps_cols = [c[1] for c in cursor.fetchall()]
            if 'owner_id' not in ps_cols:
                cursor.execute("ALTER TABLE accounts_partnerschool ADD COLUMN owner_id integer NULL REFERENCES auth_user (id)")
            if 'join_code' not in ps_cols:
                cursor.execute("ALTER TABLE accounts_partnerschool ADD COLUMN join_code varchar(16) NOT NULL DEFAULT ''")
            if 'require_join_pin' not in ps_cols:
                cursor.execute("ALTER TABLE accounts_partnerschool ADD COLUMN require_join_pin bool NOT NULL DEFAULT 0")
            if 'require_approval' not in ps_cols:
                cursor.execute("ALTER TABLE accounts_partnerschool ADD COLUMN require_approval bool NOT NULL DEFAULT 0")
            if 'enrollment_locked' not in ps_cols:
                cursor.execute("ALTER TABLE accounts_partnerschool ADD COLUMN enrollment_locked bool NOT NULL DEFAULT 0")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnerassignedexam (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    title varchar(200) NOT NULL DEFAULT '',
                    target_batch varchar(64) NOT NULL DEFAULT '',
                    attendance_pin varchar(12) NOT NULL DEFAULT '',
                    require_pin bool NOT NULL DEFAULT 0,
                    instructions varchar(400) NOT NULL DEFAULT '',
                    scheduled_date_label varchar(80) NOT NULL DEFAULT '',
                    is_active bool NOT NULL DEFAULT 1,
                    created_at datetime NOT NULL,
                    school_id bigint NOT NULL REFERENCES accounts_partnerschool (id) DEFERRABLE INITIALLY DEFERRED,
                    test_id bigint NOT NULL REFERENCES tests_test (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnerassignedexam_attended_users (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    partnerassignedexam_id bigint NOT NULL REFERENCES accounts_partnerassignedexam (id) DEFERRABLE INITIALLY DEFERRED,
                    user_id integer NOT NULL REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED,
                    UNIQUE (partnerassignedexam_id, user_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnerstudynote (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    title varchar(200) NOT NULL,
                    category varchar(32) NOT NULL DEFAULT 'vocabulary',
                    content text NOT NULL DEFAULT '',
                    external_url varchar(500) NOT NULL DEFAULT '',
                    target_batch varchar(64) NOT NULL DEFAULT '',
                    views_count integer unsigned NOT NULL DEFAULT 0,
                    is_pinned bool NOT NULL DEFAULT 0,
                    created_at datetime NOT NULL,
                    school_id bigint NOT NULL REFERENCES accounts_partnerschool (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts_partnernotification (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    title varchar(200) NOT NULL,
                    message text NOT NULL,
                    priority varchar(20) NOT NULL DEFAULT 'normal',
                    target_batch varchar(64) NOT NULL DEFAULT '',
                    is_active bool NOT NULL DEFAULT 1,
                    created_at datetime NOT NULL,
                    school_id bigint NOT NULL REFERENCES accounts_partnerschool (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            logs.append("Verified accounts_partnerschool, accounts_partnerapplication, and LMS classroom tables.")
        except Exception as e:
            logs.append(f"Note on partner school tables: {e}")

        # 5b. Ensure JLPT Mock Test Hub tables exist (N5-N1)
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tests_jlptset (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    level varchar(4) NOT NULL,
                    category varchar(64) NOT NULL,
                    external_test_id integer unsigned NOT NULL,
                    set_number integer unsigned NOT NULL DEFAULT 1,
                    title varchar(255) NOT NULL,
                    time_limit_seconds integer unsigned NOT NULL DEFAULT 1200,
                    question_count integer unsigned NOT NULL DEFAULT 0,
                    answered_count integer unsigned NOT NULL DEFAULT 0,
                    translated_count integer unsigned NOT NULL DEFAULT 0,
                    is_published bool NOT NULL DEFAULT 1,
                    is_ready bool NOT NULL DEFAULT 0,
                    created_at datetime NOT NULL,
                    updated_at datetime NOT NULL,
                    UNIQUE (level, external_test_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tests_jlptpassage (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    order_index integer unsigned NOT NULL DEFAULT 1,
                    body_ja text NOT NULL,
                    translations text NOT NULL DEFAULT '{}',
                    jlpt_set_id bigint NOT NULL REFERENCES tests_jlptset (id) DEFERRABLE INITIALLY DEFERRED,
                    UNIQUE (jlpt_set_id, order_index)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tests_jlptquestion (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    external_key varchar(64) NOT NULL,
                    order_index integer unsigned NOT NULL DEFAULT 1,
                    question_type varchar(24) NOT NULL DEFAULT 'mcq',
                    section varchar(64) NOT NULL DEFAULT '',
                    instruction text NOT NULL DEFAULT '',
                    question text NOT NULL,
                    underline varchar(255) NOT NULL DEFAULT '',
                    options text NOT NULL DEFAULT '[]',
                    answer_index smallint unsigned NULL,
                    answer_text varchar(255) NOT NULL DEFAULT '',
                    hints text NOT NULL DEFAULT '{}',
                    explanation text NOT NULL DEFAULT '{}',
                    jlpt_set_id bigint NOT NULL REFERENCES tests_jlptset (id) DEFERRABLE INITIALLY DEFERRED,
                    passage_id bigint NULL REFERENCES tests_jlptpassage (id) DEFERRABLE INITIALLY DEFERRED,
                    UNIQUE (jlpt_set_id, external_key)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tests_jlptattempt (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    score integer unsigned NOT NULL DEFAULT 0,
                    total_questions integer unsigned NOT NULL DEFAULT 0,
                    answers text NOT NULL DEFAULT '{}',
                    completed_at datetime NOT NULL,
                    jlpt_set_id bigint NOT NULL REFERENCES tests_jlptset (id) DEFERRABLE INITIALLY DEFERRED,
                    user_id integer NULL REFERENCES auth_user (id) DEFERRABLE INITIALLY DEFERRED
                )
            """)
            logs.append("Verified JLPT Mock Test Hub tables (tests_jlptset, tests_jlptpassage, tests_jlptquestion, tests_jlptattempt).")
        except Exception as e:
            logs.append(f"Note on JLPT tables: {e}")

        # 6. Synchronize django_migrations table
        try:
            required_migrations = [
                ('accounts', '0001_initial'),
                ('accounts', '0002_emailverificationotp'),
                ('accounts', '0003_emailverificationotp_country_userprofile_country_and_more'),
                ('accounts', '0004_userprofile_game_last_played_userprofile_game_level_and_more'),
                ('accounts', '0005_supportthread_supportmessage'),
                ('accounts', '0006_partnerapplication_partnerschool_and_more'),
                ('accounts', '0007_partnerschool_enrollment_locked_and_more'),
                ('tests', '0014_question_audio_script_questiongroup_audio_script_and_more'),
                ('tests', '0015_notice'),
                ('tests', '0016_test_scheduled_release_at'),
                ('tests', '0021_test_partner_school'),
                ('tests', '0022_jlptset_jlptpassage_jlptattempt_jlptquestion'),
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

    # 6. Ensure superuser exists if configured via environment variable
    try:
        import os
        from django.contrib.auth.models import User
        if not User.objects.filter(is_superuser=True).exists():
            admin_pwd = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
            if admin_pwd:
                User.objects.create_superuser('admin', 'admin@example.com', admin_pwd)
                logs.append("Created superuser 'admin' from environment variable.")
    except Exception as e:
        logs.append(f"Admin setup note: {e}")

    return logs
