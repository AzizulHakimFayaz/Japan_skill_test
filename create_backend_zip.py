import os
import zipfile
import shutil

zip_filenames = ["cpanel_backend_update.zip", "backend_production_update.zip"]
backend_dir = "Gakkou_no_shiken_backend"

exclude_dirs = {"__pycache__", ".venv", "venv", ".git", ".pytest_cache", "media"}
exclude_files = {".DS_Store", "db.sqlite3", ".env"}

primary_zip = zip_filenames[0]

with zipfile.ZipFile(primary_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(backend_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file not in exclude_files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, backend_dir)
                zipf.write(file_path, arcname)

for secondary_zip in zip_filenames[1:]:
    shutil.copyfile(primary_zip, secondary_zip)

for z in zip_filenames:
    size_mb = os.path.getsize(z) / (1024 * 1024)
    print(f"SUCCESS: ZIP Created: {z} ({size_mb:.2f} MB)")
