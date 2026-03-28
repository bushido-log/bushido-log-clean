import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const FREE_LIMIT = 3;

export const AI_KEYS = {
  patwa: 'IRIE_AI_COUNT_PATWA',
  culture: 'IRIE_AI_COUNT_CULTURE',
  guide: 'IRIE_AI_COUNT_GUIDE',
};

export async function checkAILimit(key: string): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  try {
    let isPro = false;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      isPro = !!customerInfo.entitlements.active['IRIE Pro'];
    } catch {
      isPro = false;
    }
    if (isPro) return { allowed: true, remaining: 999, isPro: true };
    const raw = await AsyncStorage.getItem(key);
    const count = raw ? parseInt(raw) : 0;
    const remaining = Math.max(0, FREE_LIMIT - count);
    return { allowed: count < FREE_LIMIT, remaining, isPro: false };
  } catch {
    return { allowed: true, remaining: FREE_LIMIT, isPro: false };
  }
}

export async function incrementAICount(key: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const count = raw ? parseInt(raw) : 0;
    await AsyncStorage.setItem(key, String(count + 1));
  } catch {}
}

export async function getAICount(key: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? parseInt(raw) : 0;
  } catch {
    return 0;
  }
}
