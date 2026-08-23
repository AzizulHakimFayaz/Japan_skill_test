from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """Template-side dict lookup: {{ mydict|get_item:key }}."""
    if dictionary is None:
        return None
    try:
        return dictionary[key]
    except (KeyError, TypeError, IndexError):
        return None


@register.filter
def category_chip_class(test_or_cat):
    """Return Tailwind chip classes for a Test or category string."""
    cat = (
        test_or_cat.category
        if hasattr(test_or_cat, "category")
        else test_or_cat
    )
    if cat == "skill":
        return "bg-amber-50 text-amber-700 border border-amber-100"
    return "bg-indigo-50 text-indigo-700 border border-indigo-100"


@register.filter
def category_label(test_or_cat):
    cat = (
        test_or_cat.category
        if hasattr(test_or_cat, "category")
        else test_or_cat
    )
    return "SSW Skill" if cat == "skill" else "JFT"


@register.filter
def format_time_limit(seconds):
    """Format time limit seconds into readable minutes/seconds."""
    if not seconds:
        return "Untimed Practice"
    try:
        seconds = int(seconds)
        mins = seconds // 60
        secs = seconds % 60
        if mins > 0 and secs == 0:
            return f"{mins} mins limit"
        elif mins > 0:
            return f"{mins}m {secs}s limit"
        return f"{secs}s limit"
    except (ValueError, TypeError):
        return "Untimed Practice"


SECTION_LABELS = {
    'script_vocab': 'Script and Vocabulary',
    'conversation': 'Conversation and Expression',
    'listening': 'Listening Comprehension',
    'reading': 'Reading Comprehension',
}


@register.filter
def section_label(sec_key):
    return SECTION_LABELS.get(sec_key, str(sec_key).replace('_', ' ').title())


@register.filter
def format_prompt(value):
    """Format question prompts, supporting multi-line CSV text, A: / B: speaker dialogues, and __underline__ markup."""
    if not value:
        return ""
    
    from django.utils.safestring import mark_safe
    from django.utils.html import escape
    import re

    val_str = str(value).replace("\r\n", "\n").replace("\r", "\n").strip()

    # First, escape HTML to prevent XSS, then apply __underline__ markup
    # We process underline AFTER escaping so user can't inject arbitrary HTML
    val_str = escape(val_str)
    val_str = re.sub(r'__((?:(?!__).)+?)__', r'<u>\1</u>', val_str)

    lines = [line.strip() for line in val_str.split("\n") if line.strip()]

    if not lines:
        return ""

    speaker_pattern = re.compile(r"^([A-Z0-9\u3000-\u30ff\uff00-\uffef\u4e00-\u9faf]+[:：])\s*(.*)", re.UNICODE | re.IGNORECASE)
    has_speakers = any(speaker_pattern.match(line) for line in lines)

    if has_speakers:
        html_lines = []
        for line in lines:
            match = speaker_pattern.match(line)
            if match:
                speaker, text = match.groups()
                html_lines.append(
                    f'<div class="flex items-start gap-2 py-0.5"><span class="font-black text-slate-900 flex-shrink-0">{speaker}</span><span class="flex-1">{text}</span></div>'
                )
            else:
                html_lines.append(f'<div class="py-0.5">{line}</div>')
        return mark_safe(f'<div class="space-y-1.5 my-1 font-sans">{ "".join(html_lines) }</div>')

    return mark_safe("<br>".join(lines))


@register.filter
def render_underline(value):
    """Render __word__ markup as <u>word</u> HTML tags for any text field (instructions, etc.)."""
    if not value:
        return ""
    
    from django.utils.safestring import mark_safe
    from django.utils.html import escape
    import re

    val_str = escape(str(value))
    val_str = re.sub(r'__((?:(?!__).)+?)__', r'<u>\1</u>', val_str)
    return mark_safe(val_str)

