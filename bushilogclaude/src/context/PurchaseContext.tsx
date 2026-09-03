import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDeviceId,
  fetchUsage,
  incrementUsage,
  verifyReceipt,
  restorePurchase,
  canUseAI,
  isPremium,
  getCountForScreen,
  type UserPurchase,
  type ScreenKey,
  type PurchaseType,
} from '../services/purchaseService';

type PurchaseContextType = {
  /** true while loading initial data from server */
  loading: boolean;
  /** Current device ID */
  deviceId: string | null;
  /** Current purchase/usage data */
  purchase: UserPurchase | null;
  /** 'free' | 'subscription' | 'lifetime' */
  purchaseType: PurchaseType;
  /** Whether user has premium access */
  premium: boolean;
  /** Check if AI is available for a screen */
  checkAI: (screen: ScreenKey) => { allowed: boolean; remaining: number };
  /** Increment usage after successful AI call */
  recordUsage: (screen: ScreenKey) => Promise<void>;
  /** Submit receipt after purchase. premium=false with success=true means e.g. an expired restored subscription */
  submitReceipt: (receiptData: Record<string, unknown>, productId: string) => Promise<{ success: boolean; premium: boolean }>;
  /** Restore previous purchase */
  restore: (transactionId: string) => Promise<boolean>;
  /** Refresh data from server */
  refresh: () => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType>({
  loading: true,
  deviceId: null,
  purchase: null,
  purchaseType: 'free',
  premium: false,
  checkAI: () => ({ allowed: true, remaining: 2 }),
  recordUsage: async () => {},
  submitReceipt: async () => ({ success: false, premium: false }),
  restore: async () => false,
  refresh: async () => {},
});

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<UserPurchase | null>(null);

  // Initialize: get device ID then fetch usage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getDeviceId();
        if (cancelled) return;
        setDeviceId(id);
        const data = await fetchUsage(id);
        if (cancelled) return;
        setPurchase(data);
      } catch (e) {
        console.warn('PurchaseContext init failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      const data = await fetchUsage(deviceId);
      setPurchase(data);
    } catch (e) {
      console.warn('PurchaseContext refresh failed:', e);
    }
  }, [deviceId]);

  const checkAI = useCallback((screen: ScreenKey) => {
    if (!purchase) return { allowed: false, remaining: 0 };
    return canUseAI(purchase, screen);
  }, [purchase]);

  const recordUsage = useCallback(async (screen: ScreenKey) => {
    if (!deviceId) return;
    try {
      const updated = await incrementUsage(deviceId, screen);
      setPurchase(updated);
    } catch (e) {
      console.warn('Failed to record usage:', e);
    }
  }, [deviceId]);

  const submitReceipt = useCallback(async (receiptData: Record<string, unknown>, productId: string) => {
    console.log('[submitReceipt] called, deviceId:', deviceId, 'productId:', productId);
    if (!deviceId) { console.log('[submitReceipt] FAIL: no deviceId'); return { success: false, premium: false }; }
    try {
      const result = await verifyReceipt(deviceId, receiptData, productId);
      console.log('[submitReceipt] server response:', JSON.stringify(result));
      if (result.success) {
        console.log('[submitReceipt] SUCCESS, purchase_type:', result.purchase?.purchase_type);
        setPurchase(result.purchase);
        return { success: true, premium: result.purchase ? isPremium(result.purchase) : false };
      }
      console.log('[submitReceipt] FAIL: result.success is false');
      return { success: false, premium: false };
    } catch (e) {
      console.warn('[submitReceipt] ERROR:', e);
      return { success: false, premium: false };
    }
  }, [deviceId]);

  const restoreHandler = useCallback(async (transactionId: string) => {
    if (!deviceId) return false;
    try {
      const result = await restorePurchase(deviceId, transactionId);
      if (result.success && result.purchase) {
        setPurchase(result.purchase);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Restore failed:', e);
      return false;
    }
  }, [deviceId]);

  const purchaseType = purchase?.purchase_type ?? 'free';
  const premium = purchase ? isPremium(purchase) : false;

  return (
    <PurchaseContext.Provider value={{
      loading,
      deviceId,
      purchase,
      purchaseType,
      premium,
      checkAI,
      recordUsage,
      submitReceipt,
      restore: restoreHandler,
      refresh,
    }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export const usePurchase = () => useContext(PurchaseContext);
