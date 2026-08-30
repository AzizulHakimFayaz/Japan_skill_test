import os
import io
import re
import sys
import shutil
import asyncio
import tempfile
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Any

# Python 3.13 audioop compatibility for pydub
try:
    import audioop
except ImportError:
    try:
        import audioop_lts as audioop
        sys.modules['audioop'] = audioop
    except ImportError:
        pass

from django.core.files.base import ContentFile
import edge_tts
from pydub import AudioSegment



# ============================================================
# FFmpeg & Environment Configuration
# ============================================================

def configure_ffmpeg():
    """
    Locates and sets up FFmpeg/FFprobe binaries for pydub.
    Checks system PATH, common Windows WinGet paths, and custom environment variables.
    """
    # 1. Custom ENV override if provided
    custom_ffmpeg = os.environ.get("FFMPEG_PATH") or os.environ.get("FFMPEG_BIN")
    if custom_ffmpeg and os.path.exists(custom_ffmpeg):
        if os.path.isdir(custom_ffmpeg):
            os.environ["PATH"] = custom_ffmpeg + os.pathsep + os.environ.get("PATH", "")
            AudioSegment.converter = os.path.join(custom_ffmpeg, "ffmpeg.exe" if os.name == 'nt' else "ffmpeg")
            AudioSegment.ffprobe = os.path.join(custom_ffmpeg, "ffprobe.exe" if os.name == 'nt' else "ffprobe")
            return
        elif os.path.isfile(custom_ffmpeg):
            bin_dir = os.path.dirname(custom_ffmpeg)
            os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")
            AudioSegment.converter = custom_ffmpeg
            AudioSegment.ffprobe = os.path.join(bin_dir, "ffprobe.exe" if os.name == 'nt' else "ffprobe")
            return

    # 2. Check if ffmpeg is directly in system PATH
    sys_ffmpeg = shutil.which("ffmpeg") or shutil.which("ffmpeg.exe")
    if sys_ffmpeg:
        AudioSegment.converter = sys_ffmpeg
        sys_ffprobe = shutil.which("ffprobe") or shutil.which("ffprobe.exe")
        if sys_ffprobe:
            AudioSegment.ffprobe = sys_ffprobe
        return

    # 3. Known fallback paths for Windows (WinGet, Chocolatey, Scoop, Local)
    candidate_dirs = [
        r"C:\Users\Azizul Hakim\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build-shared\bin",
        r"C:\ffmpeg\bin",
        r"C:\Program Files\ffmpeg\bin",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links"),
        os.path.expandvars(r"%USERPROFILE%\AppData\Local\Microsoft\WinGet\Links"),
    ]

    # Dynamically find Gyan.FFmpeg in WinGet packages if version differs
    winget_pkg_dir = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages")
    if os.path.exists(winget_pkg_dir):
        try:
            for item in os.listdir(winget_pkg_dir):
                if "FFmpeg" in item:
                    full_p = os.path.join(winget_pkg_dir, item)
                    for root, dirs, files in os.walk(full_p):
                        if "ffmpeg.exe" in files:
                            candidate_dirs.append(root)
                            break
        except Exception:
            pass

    for candidate in candidate_dirs:
        if candidate and os.path.exists(candidate):
            ffmpeg_exe = os.path.join(candidate, "ffmpeg.exe" if os.name == 'nt' else "ffmpeg")
            if os.path.exists(ffmpeg_exe):
                os.environ["PATH"] = candidate + os.pathsep + os.environ.get("PATH", "")
                AudioSegment.converter = ffmpeg_exe
                ffprobe_exe = os.path.join(candidate, "ffprobe.exe" if os.name == 'nt' else "ffprobe")
                if os.path.exists(ffprobe_exe):
                    AudioSegment.ffprobe = ffprobe_exe
                return

# Run configuration on module load
configure_ffmpeg()


# ============================================================
# Voice Mapping Configuration
# ============================================================

# High quality Edge TTS voices
DEFAULT_FEMALE_VOICE = "ja-JP-NanamiNeural"
DEFAULT_MALE_VOICE = "ja-JP-KeitaNeural"

VOICE_MAP = {
    # Japanese Female (ja-JP-NanamiNeural)
    "nanami": "ja-JP-NanamiNeural",
    "aoi": "ja-JP-NanamiNeural",
    "mayu": "ja-JP-NanamiNeural",
    "shiori": "ja-JP-NanamiNeural",
    "female": "ja-JP-NanamiNeural",
    "woman": "ja-JP-NanamiNeural",
    "girl": "ja-JP-NanamiNeural",
    "女": "ja-JP-NanamiNeural",
    "女性": "ja-JP-NanamiNeural",
    "f": "ja-JP-NanamiNeural",
    
    # Japanese Male (ja-JP-KeitaNeural)
    "keita": "ja-JP-KeitaNeural",
    "daichi": "ja-JP-KeitaNeural",
    "naoki": "ja-JP-KeitaNeural",
    "male": "ja-JP-KeitaNeural",
    "man": "ja-JP-KeitaNeural",
    "boy": "ja-JP-KeitaNeural",
    "男": "ja-JP-KeitaNeural",
    "男性": "ja-JP-KeitaNeural",
    "m": "ja-JP-KeitaNeural",
    
    # Common names
    "tanaka": "ja-JP-KeitaNeural",
    "yamada": "ja-JP-KeitaNeural",
    "sato": "ja-JP-KeitaNeural",
    "suzuki": "ja-JP-KeitaNeural",
    "ken": "ja-JP-KeitaNeural",
    "loh": "ja-JP-KeitaNeural",
    "guo": "ja-JP-KeitaNeural",
    "maria": "ja-JP-NanamiNeural",
    "anna": "ja-JP-NanamiNeural",
    "mary": "ja-JP-NanamiNeural",
    "sakura": "ja-JP-NanamiNeural",
    "yui": "ja-JP-NanamiNeural",
    "hana": "ja-JP-NanamiNeural",

    # Generic Speakers
    "speaker 1": "ja-JP-NanamiNeural",
    "speaker1": "ja-JP-NanamiNeural",
    "speaker a": "ja-JP-NanamiNeural",
    "a": "ja-JP-NanamiNeural",
    
    "speaker 2": "ja-JP-KeitaNeural",
    "speaker2": "ja-JP-KeitaNeural",
    "speaker b": "ja-JP-KeitaNeural",
    "b": "ja-JP-KeitaNeural",
}



def resolve_voice_for_speaker(speaker_name: str, index: int = 0) -> str:
    """
    Maps a speaker name or label to an Edge-TTS voice identifier.
    If the speaker_name is already a valid full voice name (e.g. 'ja-JP-NanamiNeural'), returns it directly.
    Otherwise looks up aliases or alternates female/male by turn index.
    """
    raw = str(speaker_name).strip()
    if not raw:
        return DEFAULT_FEMALE_VOICE if index % 2 == 0 else DEFAULT_MALE_VOICE

    # Direct voice name check (e.g. ja-JP-..., en-US-..., etc.)
    if "-" in raw and ("Neural" in raw or len(raw.split("-")) >= 3):
        return raw

    clean_key = raw.lower().replace("_", " ").replace("-", " ")
    if clean_key in VOICE_MAP:
        return VOICE_MAP[clean_key]

    # Check partial / substring matches
    for k, v in VOICE_MAP.items():
        if k in clean_key:
            return v

    # Fallback: alternate between female and male based on speaker index
    return DEFAULT_FEMALE_VOICE if index % 2 == 0 else DEFAULT_MALE_VOICE


# ============================================================
# Script Parsing
# ============================================================

def parse_dialogue_script(script_text: str) -> List[Dict[str, str]]:
    """
    Parses dialogue script in various user-friendly formats:
    
    Format 1: Bracketed list (User Demo):
      [speaker name],[sentence],[speakername], [sentence]
      e.g. [Nanami], [田中さん、今週の日曜日にみんなでバーベキューをしませんか。], [Keita], [日曜日ですね。]
      
    Format 2: Comma-separated pairs:
      Nanami, 田中さん、今週の日曜日に..., Keita, 日曜日ですね。...
      
    Format 3: Multi-line colon separated:
      Nanami: 田中さん、今週の日曜日に...
      Keita: 日曜日ですね。...
      A：しごとは どうですか。
      B：たのしいです。
      
    Format 4: JSON array:
      [{"speaker": "Nanami", "text": "..."}, {"speaker": "Keita", "text": "..."}]
      
    Format 5: Plain text (Single speaker narration):
      田中さん、こんにちは。
    """
    if not script_text or not str(script_text).strip():
        return []

    text = str(script_text).strip()

    # 1. Check if it's JSON
    if text.startswith("[") and "{" in text and "}" in text:
        try:
            import json
            data = json.loads(text)
            if isinstance(data, list):
                turns = []
                for i, item in enumerate(data):
                    spk = item.get("speaker") or ("Nanami" if i % 2 == 0 else "Keita")
                    txt = item.get("text") or item.get("sentence") or item.get("line") or ""
                    voice = item.get("voice") or resolve_voice_for_speaker(spk, i)
                    if txt.strip():
                        turns.append({"speaker": spk, "voice": voice, "text": txt.strip()})
                if turns:
                    return turns
        except Exception:
            pass

    # 2. Check for bracketed tokens: [Speaker], [Sentence], [Speaker], [Sentence]...
    # Regex extracts text inside brackets [ ... ]
    bracket_matches = re.findall(r'\[(.*?)\]', text, flags=re.DOTALL)
    if len(bracket_matches) >= 2:
        # Paired items: speaker, sentence, speaker, sentence
        turns = []
        # If odd number, last item could be orphan text
        pairs_count = len(bracket_matches) // 2
        for i in range(pairs_count):
            spk = bracket_matches[i * 2].strip()
            sentence = bracket_matches[i * 2 + 1].strip()
            if sentence:
                voice = resolve_voice_for_speaker(spk, i)
                turns.append({"speaker": spk, "voice": voice, "text": sentence})
        
        # If there were valid paired brackets, return them
        if turns:
            return turns

    # 3. Check for Multiline colon / Japanese colon dialogue (e.g. A: ... \n B: ... or Nanami: ... \n Keita: ...)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    colon_turns = []
    has_colon_pattern = False
    for i, line in enumerate(lines):
        # Match "Speaker: sentence" or "[Speaker]: sentence" or "Speaker： sentence"
        m = re.match(r'^(?:\[([^\]]+)\]|([^：:\n]+))[：:](.+)$', line, flags=re.DOTALL)
        if m:
            has_colon_pattern = True
            spk = (m.group(1) or m.group(2) or "").strip()
            sentence = m.group(3).strip()
            voice = resolve_voice_for_speaker(spk, i)
            if sentence:
                colon_turns.append({"speaker": spk, "voice": voice, "text": sentence})
        else:
            # If a line didn't have colon but previous line had colon, it might be multiline continuation
            if colon_turns:
                colon_turns[-1]["text"] += " " + line

    if has_colon_pattern and colon_turns:
        return colon_turns

    # 4. Check for comma-separated pairs without brackets if length is even
    # Use csv reader to handle quotes
    try:
        csv_reader = list(io.StringIO(text))
        if csv_reader:
            import csv
            row_items = []
            for r in csv.reader(io.StringIO(text)):
                row_items.extend([col.strip() for col in r if col.strip()])
            
            if len(row_items) >= 2 and len(row_items) % 2 == 0:
                comma_turns = []
                for i in range(0, len(row_items), 2):
                    spk = row_items[i]
                    sentence = row_items[i + 1]
                    voice = resolve_voice_for_speaker(spk, i // 2)
                    comma_turns.append({"speaker": spk, "voice": voice, "text": sentence})
                if comma_turns:
                    return comma_turns
    except Exception:
        pass

    # 5. Fallback: Single speaker narration using default female voice
    return [{
        "speaker": "Nanami",
        "voice": DEFAULT_FEMALE_VOICE,
        "text": text
    }]


# ============================================================
# Audio Generation Engine
# ============================================================

async def generate_single_line_tts(text: str, voice: str, output_path: str) -> bool:
    """
    Uses edge_tts to generate a single speech clip and writes it to output_path.
    """
    clean_text = text.strip()
    if not clean_text:
        return False

    communicate = edge_tts.Communicate(text=clean_text, voice=voice)
    await communicate.save(output_path)
    return os.path.exists(output_path) and os.path.getsize(output_path) > 0


async def generate_dialogue_audio_bytes(dialogue_turns: List[Dict[str, str]], pause_ms: int = 600) -> bytes:
    """
    Generates audio clips for each dialogue turn, stitches them with pause_ms silence gaps,
    and returns the combined MP3 bytes.
    """
    if not dialogue_turns:
        return b""

    configure_ffmpeg()
    temp_dir = tempfile.mkdtemp(prefix="tts_gen_")
    temp_files = []

    try:
        if len(dialogue_turns) == 1:
            # Single turn does not need stitching - generate and return directly without FFmpeg requirement
            temp_file = os.path.join(temp_dir, "single.mp3")
            temp_files.append(temp_file)
            turn = dialogue_turns[0]
            voice = turn.get("voice") or resolve_voice_for_speaker(turn.get("speaker", ""), 0)
            if await generate_single_line_tts(text=turn["text"].strip(), voice=voice, output_path=temp_file):
                with open(temp_file, "rb") as f:
                    return f.read()
            return b""

        # Multiple turns: generate clips
        for i, turn in enumerate(dialogue_turns):
            text = turn["text"].strip()
            voice = turn.get("voice") or resolve_voice_for_speaker(turn.get("speaker", ""), i)
            temp_file = os.path.join(temp_dir, f"turn_{i}.mp3")
            temp_files.append(temp_file)

            # Generate TTS MP3
            await generate_single_line_tts(text=text, voice=voice, output_path=temp_file)

        # Try pydub stitch with silence gaps (needs FFmpeg)
        try:
            combined_audio = AudioSegment.empty()
            silence_gap = AudioSegment.silent(duration=pause_ms)

            for i, temp_file in enumerate(temp_files):
                if os.path.exists(temp_file) and os.path.getsize(temp_file) > 0:
                    line_seg = AudioSegment.from_file(temp_file, format="mp3")
                    combined_audio += line_seg
                    if i < len(temp_files) - 1:
                        combined_audio += silence_gap

            if len(combined_audio) > 0:
                buffer = io.BytesIO()
                combined_audio.export(buffer, format="mp3", bitrate="192k")
                return buffer.getvalue()
        except Exception:
            # Fallback for shared hosting without FFmpeg: concatenate raw MP3 frame streams
            combined_bytes = bytearray()
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        combined_bytes.extend(f.read())
            if combined_bytes:
                return bytes(combined_bytes)

        return b""


    finally:
        # Clean up temporary files
        for f in temp_files:
            try:
                if os.path.exists(f):
                    os.remove(f)
            except Exception:
                pass
        try:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


def generate_audio_from_script(script_text: str, pause_ms: int = 600) -> bytes:
    """
    Synchronous wrapper to parse a script and generate stitched MP3 bytes.
    Safe to call from Django views, signals, or management commands.
    """
    dialogue_turns = parse_dialogue_script(script_text)
    if not dialogue_turns:
        return b""

    try:
        # If an event loop is already running in this thread
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
            return loop.run_until_complete(generate_dialogue_audio_bytes(dialogue_turns, pause_ms))
        else:
            return loop.run_until_complete(generate_dialogue_audio_bytes(dialogue_turns, pause_ms))
    except RuntimeError:
        # No loop in current thread
        return asyncio.run(generate_dialogue_audio_bytes(dialogue_turns, pause_ms))


# ============================================================
# Django Model Helpers
# ============================================================

def generate_and_save_question_audio(question, script_text: Optional[str] = None, overwrite: bool = False) -> bool:
    """
    Generates TTS audio for a Question instance and attaches it to question.audio.
    
    Args:
        question: Question model instance.
        script_text: Optional script text. Defaults to question.audio_script or question.prompt.
        overwrite: If False, skips if question.audio is already set.
        
    Returns:
        bool: True if audio was generated and saved, False otherwise.
    """
    if not question:
        return False

    if question.audio and not overwrite:
        return False

    script = script_text or getattr(question, 'audio_script', '') or ''
    if not script.strip():
        # Fallback to question.prompt if question is of type audio and contains dialogue markers
        prompt = getattr(question, 'prompt', '') or ''
        if (question.type in ['audio', 'image_audio'] or question.section == 'listening') and ('[' in prompt or '：' in prompt or ':' in prompt):
            script = prompt
        else:
            return False

    audio_bytes = generate_audio_from_script(script)
    if not audio_bytes:
        return False

    filename = f"q_{question.id or question.order_index or 'tts'}_audio.mp3"
    question.audio.save(filename, ContentFile(audio_bytes), save=True)
    return True


def generate_and_save_group_audio(group, script_text: Optional[str] = None, overwrite: bool = False) -> bool:
    """
    Generates TTS audio for a QuestionGroup instance and attaches it to group.audio.
    """
    if not group:
        return False

    if group.audio and not overwrite:
        return False

    script = script_text or getattr(group, 'audio_script', '') or ''
    if not script.strip():
        return False

    audio_bytes = generate_audio_from_script(script)
    if not audio_bytes:
        return False

    filename = f"group_{group.id or group.order_index or 'tts'}_audio.mp3"
    group.audio.save(filename, ContentFile(audio_bytes), save=True)
    return True
