import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const AI_COUNT_KEY = 'IRIE_AI_USE_COUNT';
const FREE_LIMIT = 3;

export async function checkAILimit(): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = !!customerInfo.entitlements.active['IRIE Pro'];
    if (isPro) return { allowed: true, remaining: 999, isPro: true };

    const raw = await AsyncStorage.getItem(AI_COUNT_KEY);
    const count = raw ? parseInt(raw) : 0;
    const remaining = Math.max(0, FREE_LIMIT - count);
    return { allowed: count < FREE_LIMIT, remaining, isPro: false };
  } catch {
    return { allowed: true, remaining: FREE_LIMIT, isPro: false };
  }
}

export async function incrementAICount(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(AI_COUNT_KEY);
    const count = raw ? parseInt(raw) : 0;
    await AsyncStorage.setItem(AI_COUNT_KEY, String(count + 1));
  } catch {}
}

export async function getAICount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(AI_COUNT_KEY);
    return raw ? parseInt(raw) : 0;
  } catch {
    return 0;
  }
}
