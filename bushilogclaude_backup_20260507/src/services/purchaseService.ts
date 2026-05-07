import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SERVER_URL = 'https://irie-server.onrender.com';
const DEVICE_ID_KEY = 'IRIE_DEVICE_ID';

export type PurchaseType = 'free' | 'subscription' | 'lifetime';

export type UserPurchase = {
  device_id: string;
  purchase_type: PurchaseType;
  original_transaction_id: string | null;
  expires_at: string | null;
  patwa_count: number;
  culture_count: number;
  guide_count: number;
};

export type ScreenKey = 'patwa' | 'culture' | 'guide';

const SCREEN_LIMIT = 2;

// --- Device ID ---

export async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

// --- Server API ---

export async function fetchUsage(deviceId: string): Promise<UserPurchase> {
  const res = await fetch(`${SERVER_URL}/get-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId }),
  });
  if (!res.ok) throw new Error('Failed to fetch usage');
  return res.json();
}

export async function incrementUsage(deviceId: string, screen: ScreenKey): Promise<UserPurchase> {
  const res = await fetch(`${SERVER_URL}/increment-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, screen }),
  });
  if (!res.ok) throw new Error('Failed to increment usage');
  return res.json();
}

export async function verifyReceipt(
  deviceId: string,
  receiptData: Record<string, unknown>,
  productId: string,
): Promise<{ success: boolean; purchase: UserPurchase }> {
  const res = await fetch(`${SERVER_URL}/verify-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, receipt_data: receiptData, product_id: productId }),
  });
  if (!res.ok) throw new Error('Failed to verify receipt');
  return res.json();
}

export async function restorePurchase(
  deviceId: string,
  transactionId: string,
): Promise<{ success: boolean; purchase?: UserPurchase; message?: string }> {
  const res = await fetch(`${SERVER_URL}/restore-purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, transaction_id: transactionId }),
  });
  if (!res.ok) throw new Error('Failed to restore purchase');
  return res.json();
}

// --- Helpers ---

export function getCountForScreen(purchase: UserPurchase, screen: ScreenKey): number {
  const map = { patwa: 'patwa_count', culture: 'culture_count', guide: 'guide_count' } as const;
  return purchase[map[screen]];
}

export function isPremium(purchase: UserPurchase): boolean {
  if (purchase.purchase_type === 'lifetime') return true;
  if (purchase.purchase_type === 'subscription') {
    if (!purchase.expires_at) return false;
    return new Date(purchase.expires_at) > new Date();
  }
  return false;
}

export function canUseAI(purchase: UserPurchase, screen: ScreenKey): { allowed: boolean; remaining: number } {
  if (isPremium(purchase)) return { allowed: true, remaining: Infinity };
  const count = getCountForScreen(purchase, screen);
  const remaining = Math.max(0, SCREEN_LIMIT - count);
  return { allowed: count < SCREEN_LIMIT, remaining };
}
