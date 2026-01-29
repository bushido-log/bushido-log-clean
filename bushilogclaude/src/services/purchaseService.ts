import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (isInitialized) return;
  if (API_KEY === '') return;
  try {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEY });
      isInitialized = true;
    }
  } catch (e) {
    console.error('RevenueCat init error:', e);
  }
}

export async function checkProStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['pro'] !== undefined;
  } catch (e) {
    console.error('Check pro status error:', e);
    return false;
  }
}

export async function getOffering(): Promise<PurchasesPackage | null> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.monthly) {
      return offerings.current.monthly;
    }
    return null;
  } catch (e) {
    console.error('Get offering error:', e);
    return null;
  }
}

export async function purchasePro(): Promise<boolean> {
  try {
    const pkg = await getOffering();
    if (pkg === null) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['pro'] !== undefined;
  } catch (e: any) {
    if (e && e.userCancelled) return false;
    console.error('Purchase error:', e);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['pro'] !== undefined;
  } catch (e) {
    console.error('Restore error:', e);
    return false;
  }
}

export async function getMonthlyPrice(): Promise<string> {
  try {
    const pkg = await getOffering();
    if (pkg) return pkg.product.priceString;
    return '¥700/月';
  } catch (e) {
    return '¥700/月';
  }
}