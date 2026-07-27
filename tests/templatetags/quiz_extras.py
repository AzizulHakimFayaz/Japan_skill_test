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
    return "Skill" if cat == "skill" else "Basic"


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


