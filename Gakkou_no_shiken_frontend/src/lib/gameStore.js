'use client';

// Persistent client-side game stats store with background backend sync
const STORAGE_KEY = 'gakkou_game_progress_v1';

export function getInitialGameProgress() {
  if (typeof window === 'undefined') {
    return {
      xp: 850,
      level: 12,
      streak: 6,
      mastered: 420,
      learning: 86,
      needsPractice: 27,
      lastPlayedDate: null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Initial defaults matching the design demo
  const defaults = {
    xp: 850,
    level: 12,
    streak: 6,
    mastered: 420,
    learning: 86,
    needsPractice: 27,
    lastPlayedDate: new Date().toISOString().split('T')[0],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {}
  return defaults;
}

export function saveGameProgress(progress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event('game_progress_updated'));
  } catch {}
}

export function addGameReward({ xpGain = 50, wordsMastered = 1 }) {
  const current = getInitialGameProgress();
  const newXp = current.xp + xpGain;
  
  // Calculate level based on XP (e.g. 100 XP per level)
  const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

  // Check streak
  const today = new Date().toISOString().split('T')[0];
  let newStreak = current.streak;
  if (current.lastPlayedDate !== today) {
    newStreak = current.streak + 1;
  }

  const updated = {
    ...current,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    mastered: current.mastered + wordsMastered,
    learning: Math.max(0, current.learning - wordsMastered + 1),
    lastPlayedDate: today,
  };

  saveGameProgress(updated);

  // Background sync if logged in
  trySyncWithBackend(updated);

  return updated;
}

async function trySyncWithBackend(progress) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  try {
    await fetch(`${apiUrl}/api/games/sync/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        xp: progress.xp,
        level: progress.level,
        streak: progress.streak,
        mastered: progress.mastered,
      }),
    });
  } catch {
    // Fail silently in background
  }
}
