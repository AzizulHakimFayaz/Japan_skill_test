import os
import shutil
import zipfile
from pathlib import Path

def package():
    base_dir = Path(r"e:\Study\Python Projects\Japan_skill_test")
    backend_dir = base_dir / "Gakkou_no_shiken_backend"
    output_zip = base_dir / "cpanel_backend_update.zip"
    alt_zip = base_dir / "backend_production_update.zip"

    # Remove any old inner zip in Gakkou_no_shiken_backend if exists
    for inner in [backend_dir / "cpanel_backend_update.zip", backend_dir / "backend_production_update.zip"]:
        if inner.exists():
            inner.unlink()

    # Remove output zip if exists
    if output_zip.exists():
        output_zip.unlink()
    if alt_zip.exists():
        alt_zip.unlink()

    ignored_extensions = {'.pyc', '.pyo', '.sqlite3', '.sqlite3-wal', '.sqlite3-shm', '.db', '.zip'}
    ignored_names = {'.env', 'db.sqlite3', '.git', '__pycache__', '.pytest_cache', '.venv', 'venv'}

    total_added = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(backend_dir):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignored_names and not d.startswith('.')]
            if 'media' in dirs:
                # Exclude media folder uploads to ensure existing user files/audio are NEVER touched
                dirs.remove('media')

            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(backend_dir)
                rel_path_str = str(rel_path).replace('\\', '/')

                if file in ignored_names or file_path.suffix.lower() in ignored_extensions:
                    continue
                if any(part in ignored_names for part in rel_path.parts):
                    continue
                if 'media' in rel_path.parts:
                    continue

                z.write(file_path, arcname=rel_path_str)
                total_added += 1

    # Safety validation: Ensure NO database file exists in zip
    with zipfile.ZipFile(output_zip, 'r') as verify_z:
        namelist = verify_z.namelist()
        for name in namelist:
            assert 'sqlite3' not in name.lower(), f"CRITICAL: Found sqlite file in zip: {name}"
            assert not name.startswith('media/'), f"CRITICAL: Found media file in zip: {name}"
            assert name != '.env', f"CRITICAL: Found .env in zip: {name}"

        # Ensure our crucial fixed files are present
        required_fixes = [
            'tests/admin.py',
            'tests/audio_generator.py',
            'tests/audio_logger.py',
            'tests/utils.py',
            'tests/templates/admin/csv_import.html',
            'tests/templates/admin/audio_hub.html',
            'tests/management/commands/generate_test_audio.py',
            'accounts/geolocation.py',
            'accounts/admin.py',
            'accounts/admin_views.py',
            'api/views.py',
        ]
        for req in required_fixes:
            assert req in namelist, f"CRITICAL: Required fix file missing from zip: {req}"

    # Also copy to backend_production_update.zip
    shutil.copy2(output_zip, alt_zip)

    size_mb = output_zip.stat().st_size / (1024 * 1024)
    print(f"SUCCESS: Packaged {total_added} files into {output_zip.name} ({size_mb:.2f} MB)")
    print(f"Copied update to {alt_zip.name} ({size_mb:.2f} MB)")
    print("Database check passed: db.sqlite3, .sqlite3 files, and media/ folder are 100% EXCLUDED.")

if __name__ == '__main__':
    package()
