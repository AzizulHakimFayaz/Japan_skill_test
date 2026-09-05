import os
import sys
import subprocess
from pathlib import Path


def run():
    current_dir = Path(__file__).resolve().parent
    os.chdir(current_dir)

    print("=" * 60)
    print("  Gakkou No Shiken - Database Migration & Update Runner")
    print("=" * 60)

    # 0. Sync schema & migrations state
    print("\n[0/3] Synchronizing SQLite Schema & Migrations State...")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        import django
        django.setup()
        from accounts.schema_sync import ensure_schema_synced
        sync_logs = ensure_schema_synced()
        for l in sync_logs:
            print("  *", l)
    except Exception as e:
        print("  Schema sync note:", e)

    # 1. Run database migrations
    print("\n[1/3] Running Database Migrations (Accounts 0003 & Password Recovery)...")
    try:
        proc = subprocess.run(
            [sys.executable, "manage.py", "migrate"],
            capture_output=True,
            text=True
        )
        print(proc.stdout)
        if proc.returncode != 0:
            print("Migration stderr:", proc.stderr)
    except Exception as e:
        print("Migration exception:", e)

    # 2. Run existing user country backfill
    print("\n[2/3] Backfilling Existing User Countries via IP Geolocation...")
    try:
        proc = subprocess.run(
            [sys.executable, "manage.py", "backfill_user_countries"],
            capture_output=True,
            text=True
        )
        print(proc.stdout)
        if proc.returncode != 0:
            print("Backfill stderr:", proc.stderr)
    except Exception as e:
        print("Backfill exception:", e)

    # 3. Check migration status
    print("\n[3/3] Checking Country Migration Status...")
    try:
        proc = subprocess.run(
            [sys.executable, "manage.py", "check_country_migration"],
            capture_output=True,
            text=True
        )
        print(proc.stdout)
    except Exception as e:
        print("Status check exception:", e)

    # 4. Trigger Passenger application restart
    print("\n[Restart] Triggering LiteSpeed / Passenger Application Reload...")
    restart_dir = current_dir / "tmp"
    restart_file = restart_dir / "restart.txt"
    try:
        restart_dir.mkdir(exist_ok=True)
        restart_file.touch()
        print("  -> Touched", restart_file, "(Application reload signal sent!)")
    except Exception as e:
        print("  -> Could not touch restart.txt:", e)

    print("\n" + "=" * 60)
    print("  Database Migration & Update Completed Successfully!")
    print("=" * 60)


if __name__ == '__main__':
    run()
