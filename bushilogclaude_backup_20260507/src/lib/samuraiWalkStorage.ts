import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'samuraiWalk.progressById';

/** progressById: { [prefectureId: string]: 0 | 1 | 2 } */
export type ProgressMap = Record<string, number>;

export async function loadProgress(): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[SamuraiWalk] Failed to load progress:', e);
  }
  return {};
}

export async function saveProgress(progress: ProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('[SamuraiWalk] Failed to save progress:', e);
  }
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[SamuraiWalk] Failed to reset progress:', e);
  }
}
