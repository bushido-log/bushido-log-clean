// src/utils/stepCounter.ts
import { Pedometer } from 'expo-sensors';

/**
 * 今日の0:00からの歩数を取得
 */
export const getTodaySteps = async (): Promise<number> => {
  const available = await Pedometer.isAvailableAsync();
  if (!available) return 0;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  try {
    const result = await Pedometer.getStepCountAsync(start, now);
    return result.steps;
  } catch (e) {
    console.warn('Step count error:', e);
    return 0;
  }
};

/**
 * リアルタイム歩数更新を購読
 * @returns unsubscribe function
 */
export const subscribeToSteps = (
  callback: (steps: number) => void
): (() => void) => {
  let subscription: any = null;
  let baseSteps = 0;

  // まず今日の累計を取得
  getTodaySteps().then(steps => {
    baseSteps = steps;
    callback(steps);
  });

  // リアルタイム更新を購読（差分が来る）
  Pedometer.isAvailableAsync().then(available => {
    if (!available) return;
    subscription = Pedometer.watchStepCount(result => {
      // watchStepCountは購読開始からの差分を返す
      callback(baseSteps + result.steps);
    });
  });

  return () => {
    if (subscription) subscription.remove();
  };
};

/**
 * 難易度に応じたダメージ計算
 */
export const calculateWalkDamage = (
  steps: number,
  difficulty: 'easy' | 'normal' | 'hard',
  streak: number = 0,
  goalReached: boolean = false,
  missionDone: boolean = false,
): number => {
  if (difficulty === 'easy') return 0;

  const damagePerStep = difficulty === 'normal' ? 1 : 1.5;
  const goalBonus = goalReached ? (difficulty === 'normal' ? 1.5 : 2.0) : 1.0;
  const missionBonus = (difficulty === 'hard' && missionDone) ? 1.3 : 1.0;

  // 7日ごとのストリークボーナス
  const streakMultiplier = streak >= 7
    ? (difficulty === 'normal' ? 1.2 : 1.5)
    : 1.0;

  return Math.floor(steps * damagePerStep * goalBonus * missionBonus * streakMultiplier);
};

/**
 * 日次目標
 */
export const getDailyGoal = (difficulty: 'easy' | 'normal' | 'hard'): number => {
  if (difficulty === 'normal') return 5000;
  if (difficulty === 'hard') return 10000;
  return 0;
};

/**
 * 今日の日付文字列 (YYYY-MM-DD)
 */
export const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
