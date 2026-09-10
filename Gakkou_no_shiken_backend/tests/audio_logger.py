import os
import json
import logging
from datetime import datetime
from pathlib import Path
from django.conf import settings

logger = logging.getLogger('tests.audio')


def _get_log_dir() -> Path:
    media_root = getattr(settings, 'MEDIA_ROOT', None)
    if media_root:
        log_dir = Path(media_root) / "audio_logs"
    else:
        log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir


def _get_log_file(test_id: int) -> Path:
    return _get_log_dir() / f"test_{test_id}.json"


def append_audio_log(test_id: int, message: str, level: str = "info", details: str = ""):
    """
    Appends a structured log entry for test_id to a JSON file in MEDIA_ROOT/audio_logs/
    Levels: 'info', 'success', 'warning', 'error'
    """
    try:
        log_file = _get_log_file(test_id)
        entries = []
        if log_file.exists():
            try:
                with open(log_file, "r", encoding="utf-8") as f:
                    entries = json.load(f)
            except Exception:
                entries = []

        entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "level": level,
            "message": str(message),
            "details": str(details) if details else "",
        }
        entries.append(entry)

        # Retain last 200 log entries
        entries = entries[-200:]

        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)

        # Also print to stderr for server logs
        import sys
        print(f"[AUDIO-LOG test={test_id}] [{level.upper()}] {message}", file=sys.stderr, flush=True)

    except Exception as e:
        import sys
        print(f"[AUDIO-LOG FAILED TO WRITE] {e}", file=sys.stderr, flush=True)


def get_audio_logs(test_id: int):
    """Returns the list of log entries for test_id (most recent first or chronological)."""
    try:
        log_file = _get_log_file(test_id)
        if log_file.exists():
            with open(log_file, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return []


def clear_audio_logs(test_id: int):
    """Deletes the log file for test_id."""
    try:
        log_file = _get_log_file(test_id)
        if log_file.exists():
            log_file.unlink()
    except Exception:
        pass
