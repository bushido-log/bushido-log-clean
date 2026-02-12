import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVEL_XP_THRESHOLDS, LEVEL_TITLES, MAX_LEVEL, DAYS_PER_LEVEL, SESSION_KEY } from '../data/constants';
import { DailyLog } from '../data/types';

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string) {
  return dateStr.slice(5);
}

export function daysDiff(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStreakCount(logs: DailyLog[]): number {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...logs].sort((x, y) => x.date.localeCompare(y.date));
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const today = sorted[i].date;
    const prev = sorted[i - 1].date;
    if (daysDiff(today, prev) === 1) streak++;
    else break;
  }
  return streak;
}

export function getRankFromXp(xp: number) {
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const label = LEVEL_TITLES[level] || '名もなき者';
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const next = level >= 10 ? 0 : nextThreshold - xp;
  return { label, next, level };
}

export function getLevelFromXp(xp: number) {
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_XP_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const xpInLevel = xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const progress = level >= 10 ? 1 : xpInLevel / xpForLevel;
  return { 
    level, 
    title: LEVEL_TITLES[level] || '名もなき者',
    xp,
    xpInLevel,
    xpForLevel,
    progress,
    nextLevelXp: nextThreshold,
  };
}

export function getSamuraiLevelInfo(streak: number) {
  if (streak <= 0) {
    return { level: 1, progress: 0, daysToClear: MAX_LEVEL * DAYS_PER_LEVEL };
  }
  const rawLevel = Math.floor((streak - 1) / DAYS_PER_LEVEL) + 1;
  const level = Math.min(MAX_LEVEL, Math.max(1, rawLevel));
  const currentLevelStartDay = (level - 1) * DAYS_PER_LEVEL + 1;
  const daysInThisLevel = streak - currentLevelStartDay + 1;
  const progress = Math.max(0, Math.min(1, daysInThisLevel / DAYS_PER_LEVEL));
  const totalDaysForClear = MAX_LEVEL * DAYS_PER_LEVEL;
  const daysToClear = Math.max(0, totalDaysForClear - streak);
  return { level, progress, daysToClear };
}

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
