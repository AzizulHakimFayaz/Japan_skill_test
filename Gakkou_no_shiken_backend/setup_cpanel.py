import os
import sys
import subprocess

def run():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    print("=== [1/3] Installing Dependencies via PIP ===")
    req_file = os.path.join(current_dir, 'requirements.txt')
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", req_file],
            capture_output=True,
            text=True
        )
        print(proc.stdout)
        if proc.returncode != 0:
            print("Pip Errors:", proc.stderr)
    except Exception as e:
        print("Pip Exception:", e)

    print("\n=== [2/3] Running Django Database Migrations ===")
    try:
        proc = subprocess.run(
            [sys.executable, "manage.py", "migrate"],
            capture_output=True,
            text=True
        )
        print(proc.stdout)
        if proc.returncode != 0:
            print("Migrate Errors:", proc.stderr)
    except Exception as e:
        print("Migrate Exception:", e)

    print("\n=== [3/3] Importing Full Database Backup ===")
    backup_file = os.path.join(current_dir, 'full_database_backup.json')
    if os.path.exists(backup_file):
        try:
            proc = subprocess.run(
                [sys.executable, "manage.py", "loaddata", backup_file],
                capture_output=True,
                text=True
            )
            print(proc.stdout)
            if proc.returncode != 0:
                print("Loaddata Errors:", proc.stderr)
        except Exception as e:
            print("Loaddata Exception:", e)
    else:
        print("full_database_backup.json not found in", current_dir)

    print("\n=== ALL SETUP TASKS COMPLETED! ===")

if __name__ == '__main__':
    run()
