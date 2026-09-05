import os
import zipfile
from pathlib import Path

def package():
    base_dir = Path(r"e:\Study\Python Projects\Japan_skill_test")
    backend_dir = base_dir / "Gakkou_no_shiken_backend"
    output_zip = base_dir / "cpanel_backend_update.zip"

    # Remove any old inner zip in Gakkou_no_shiken_backend if exists
    inner_zip = backend_dir / "cpanel_backend_update.zip"
    if inner_zip.exists():
        inner_zip.unlink()

    # Remove output zip if exists
    if output_zip.exists():
        output_zip.unlink()

    ignored_extensions = {'.pyc', '.sqlite3', '.zip'}
    ignored_names = {'.env', 'db.sqlite3', '.git', '__pycache__', '.pytest_cache'}

    total_added = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(backend_dir):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignored_names and not d.startswith('.')]
            if 'media' in dirs:
                # Exclude media folder uploads from update package
                dirs.remove('media')

            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(backend_dir)

                if file in ignored_names or file_path.suffix in ignored_extensions:
                    continue
                if any(part in ignored_names for part in rel_path.parts):
                    continue

                z.write(file_path, arcname=str(rel_path).replace('\\', '/'))
                total_added += 1

    print(f"Successfully packaged {total_added} files into {output_zip} ({output_zip.stat().st_size / (1024*1024):.2f} MB)")

if __name__ == '__main__':
    package()
