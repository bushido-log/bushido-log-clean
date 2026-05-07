// AI usage limit — thin re-export from PurchaseContext/purchaseService
// Screens should use usePurchase() hook directly:
//   const { checkAI, recordUsage } = usePurchase();
//   checkAI('patwa')      → { allowed, remaining }
//   recordUsage('patwa')  → call after successful AI response

export type { ScreenKey } from '../services/purchaseService';
export { canUseAI, getCountForScreen, isPremium } from '../services/purchaseService';
