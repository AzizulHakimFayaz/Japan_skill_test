import os
import zipfile

zip_filename = "backend_production_update.zip"
backend_dir = "Gakkou_no_shiken_backend"

exclude_dirs = {"__pycache__", ".venv", "venv", ".git", ".pytest_cache", "media"}
exclude_files = {".DS_Store", "db.sqlite3", ".env"}


with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(backend_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file not in exclude_files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, backend_dir)
                zipf.write(file_path, arcname)

print("ZIP Created successfully:", zip_filename, "Size:", os.path.getsize(zip_filename), "bytes")
