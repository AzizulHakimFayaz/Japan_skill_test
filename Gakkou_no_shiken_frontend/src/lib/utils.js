// Helper utility functions matching Django custom template tags

export function renderUnderline(text) {
  if (!text) return '';
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/__((?:(?!__).)+?)__/g, '<u>$1</u>');
}

export function formatPrompt(text) {
  if (!text) return '';
  const valStr = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Escape HTML then apply __underline__ and [red]...[/red]
  const escaped = valStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/__((?:(?!__).)+?)__/g, '<u>$1</u>')
    .replace(/\[red\](.*?)\[\/red\]/gi, '<span style="color:#DC2626;font-weight:bold;">$1</span>');

  const lines = escaped.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return '';

  const speakerPattern = /^([A-Z0-9\u3000-\u30ff\uff00-\uffef\u4e00-\u9faf]+[:：])\s*(.*)/i;
  const hasSpeakers = lines.some(l => speakerPattern.test(l));

  if (hasSpeakers) {
    const htmlLines = lines.map(line => {
      const match = line.match(speakerPattern);
      if (match) {
        const [, speaker, content] = match;
        return `<div class="flex items-start gap-2 py-0.5"><span class="font-black text-slate-900 flex-shrink-0">${speaker}</span><span class="flex-1">${content}</span></div>`;
      }
      return `<div class="py-0.5">${line}</div>`;
    });
    return `<div class="space-y-1.5 my-1 font-sans">${htmlLines.join('')}</div>`;
  }

  return lines.join('<br>');
}

export function formatTimeLimit(seconds) {
  if (!seconds) return 'Untimed Practice';
  const s = parseInt(seconds, 10);
  if (isNaN(s)) return 'Untimed Practice';
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (mins > 0 && secs === 0) return `${mins} mins limit`;
  if (mins > 0) return `${mins}m ${secs}s limit`;
  return `${secs}s limit`;
}

export function getCategoryLabel(category) {
  return category === 'skill' ? 'SSW Skill' : 'JFT';
}

export function getCategoryChipClass(category) {
  if (category === 'skill') {
    return 'bg-amber-50 text-amber-700 border border-amber-100';
  }
  return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
}

export const COUNTRY_FLAG_MAP = {
  'Bangladesh': '🇧🇩',
  'Nepal': '🇳🇵',
  'Vietnam': '🇻🇳',
  'Viet Nam': '🇻🇳',
  'Indonesia': '🇮🇩',
  'Japan': '🇯🇵',
  'India': '🇮🇳',
  'Myanmar': '🇲🇲',
  'Burma': '🇲🇲',
  'Sri Lanka': '🇱🇰',
  'Philippines': '🇵🇭',
  'Pakistan': '🇵🇰',
  'Uzbekistan': '🇺🇿',
  'Mongolia': '🇲🇳',
  'Cambodia': '🇰🇭',
  'Thailand': '🇹🇭',
  'China': '🇨🇳',
  'Brazil': '🇧🇷',
  'Peru': '🇵🇪',
  'Malaysia': '🇲🇾',
  'Bhutan': '🇧🇹',
  'Laos': '🇱🇦',
  'Taiwan': '🇹🇼',
  'South Korea': '🇰🇷',
  'Korea': '🇰🇷',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Italy': '🇮🇹',
  'Singapore': '🇸🇬',
  'United Arab Emirates': '🇦🇪',
  'UAE': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Qatar': '🇶🇦',
  'Oman': '🇴🇲',
  'Kuwait': '🇰🇼',
  'Egypt': '🇪🇬',
  'Turkey': '🇹🇷',
};

export function getCountryFlag(countryNameOrCode) {
  if (!countryNameOrCode) return '🌐';
  const trimmed = String(countryNameOrCode).trim();
  if (COUNTRY_FLAG_MAP[trimmed]) return COUNTRY_FLAG_MAP[trimmed];
  if (/^[a-zA-Z]{2}$/.test(trimmed)) {
    try {
      return trimmed
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join('');
    } catch {
      return '🌐';
    }
  }
  const lower = trimmed.toLowerCase();
  for (const [name, flag] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (name.toLowerCase() === lower || lower.includes(name.toLowerCase())) {
      return flag;
    }
  }
  return '🌐';
}

