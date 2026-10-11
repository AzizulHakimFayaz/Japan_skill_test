'use client';

// Persistent client-side game stats store with background backend sync
const STORAGE_KEY = 'gakkou_game_progress_v2';

export const GUEST_INITIAL_PROGRESS = {
  xp: 0,
  level: 1,
  streak: 0,
  mastered: 0,
  learning: 0,
  needsPractice: 0,
  lastPlayedDate: null,
};

export function getInitialGameProgress() {
  if (typeof window === 'undefined') {
    return { ...GUEST_INITIAL_PROGRESS };
  }

  // Clear legacy mock seed if present
  try {
    if (localStorage.getItem('gakkou_game_progress_v1')) {
      localStorage.removeItem('gakkou_game_progress_v1');
    }
  } catch {}

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.xp === 'number') {
        return {
          xp: parsed.xp,
          level: Math.max(1, Math.floor(parsed.xp / 100) + 1),
          streak: parsed.streak || 0,
          mastered: parsed.mastered || 0,
          learning: parsed.learning || 0,
          needsPractice: parsed.needsPractice || 0,
          lastPlayedDate: parsed.lastPlayedDate || null,
        };
      }
    }
  } catch {}

  return { ...GUEST_INITIAL_PROGRESS };
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
  
  // Calculate level dynamically based on actual XP (100 XP per level)
  const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

  // Check streak
  const today = new Date().toISOString().split('T')[0];
  let newStreak = current.streak;
  if (!current.lastPlayedDate || current.streak === 0) {
    newStreak = 1;
  } else if (current.lastPlayedDate !== today) {
    newStreak = current.streak + 1;
  }

  const updated = {
    ...current,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    mastered: current.mastered + wordsMastered,
    learning: Math.max(0, current.learning + wordsMastered),
    lastPlayedDate: today,
  };

  saveGameProgress(updated);

  // Background sync if logged in
  trySyncWithBackend(updated);

  return updated;
}

export async function fetchBackendGameProgress() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gakkounoshiken.site';
  try {
    const res = await fetch(`${apiUrl}/api/games/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      const current = getInitialGameProgress();
      // Combine with any local achievements if higher
      const mergedXp = Math.max(data.xp || 0, current.xp);
      const merged = {
        xp: mergedXp,
        level: Math.max(1, Math.floor(mergedXp / 100) + 1),
        streak: Math.max(data.streak || 0, current.streak),
        mastered: Math.max(data.mastered || 0, current.mastered),
        learning: current.learning || 0,
        needsPractice: current.needsPractice || 0,
        lastPlayedDate: data.last_played || current.lastPlayedDate,
      };
      saveGameProgress(merged);
      if (mergedXp > (data.xp || 0)) {
        trySyncWithBackend(merged);
      }
      return merged;
    }
  } catch {}
  return null;
}

export async function trySyncWithBackend(progress) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gakkounoshiken.site';
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
  } catch {}
}
