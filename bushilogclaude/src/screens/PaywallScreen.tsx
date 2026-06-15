import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Alert,
} from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { useLang } from '../context/LanguageContext';
import { usePurchase } from '../context/PurchaseContext';

export const PRODUCT_ID_MONTHLY = 'com.hiroya.irie.premium.monthly';

type Props = {
  onClose: () => void;
  screenName?: string;
};

export default function PaywallScreen({ onClose, screenName }: Props) {
  const { lang } = useLang();
  const { submitReceipt } = usePurchase();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const t = (en: string, ja: string) => (lang === 'ja' ? ja : en);

  const [price, setPrice] = useState('¥700/月');
  const [iapReady, setIapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await initConnection();
        if (cancelled) return;
        setIapReady(true);
        const products = await fetchProducts({ skus: [PRODUCT_ID_MONTHLY], type: 'subs' });
        if (!cancelled && products.length > 0) {
          setPrice(products[0].displayPrice + '/月');
        }
      } catch (e) {
        console.warn('IAP init/fetchProducts failed:', e);
      }
    })();

    const purchaseUpdate = purchaseUpdatedListener(async (purchase: Purchase) => {
      const receiptData = {
        transactionId: purchase.transactionId,
        transactionReceipt: purchase.purchaseToken ?? null,
        originalTransactionId: ('originalTransactionIdentifierIOS' in purchase)
          ? purchase.originalTransactionIdentifierIOS ?? null
          : null,
        expiresDate: null,
      };

      try {
        const success = await submitReceipt(receiptData, PRODUCT_ID_MONTHLY);
        if (success) {
          await finishTransaction({ purchase, isConsumable: false });
          onClose();
        } else {
          Alert.alert(t('Error', 'エラー'), t('Receipt verification failed', 'レシート検証に失敗しました'));
        }
      } catch (e: any) {
        Alert.alert(t('Error', 'エラー'), e.message || t('Purchase failed', '購入に失敗しました'));
      } finally {
        setLoading(false);
      }
    });

    const purchaseError = purchaseErrorListener((error: PurchaseError) => {
      if (error.code === 'user-cancelled') {
        setLoading(false);
        return;
      }
      Alert.alert(t('Error', 'エラー'), error.message || t('Purchase failed', '購入に失敗しました'));
      setLoading(false);
    });

    return () => {
      cancelled = true;
      purchaseUpdate.remove();
      purchaseError.remove();
      endConnection();
    };
  }, []);

  const handleSubscribe = async () => {
    if (!iapReady) {
      Alert.alert(t('Please wait', '準備中'), t('Store is loading. Please try again shortly.', 'ストアを読み込み中です。少し待ってからお試しください。'));
      return;
    }
    setLoading(true);
    try {
      await requestPurchase({ type: 'subs', request: { apple: { sku: PRODUCT_ID_MONTHLY } } });
    } catch (e: any) {
      if (e.code !== 'user-cancelled') {
        Alert.alert(t('Error', 'エラー'), e.message || t('Purchase failed', '購入に失敗しました'));
      }
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!iapReady) {
      Alert.alert(t('Please wait', '準備中'), t('Store is loading. Please try again shortly.', 'ストアを読み込み中です。少し待ってからお試しください。'));
      return;
    }
    setRestoring(true);
    try {
      const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: false });
      console.log('[restore] getAvailablePurchases count:', purchases.length);
      console.log('[restore] purchases:', JSON.stringify(purchases.map(p => ({ productId: p.productId, transactionId: p.transactionId }))));
      if (purchases.length === 0) {
        console.log('[restore] FAIL: no purchases found');
        Alert.alert(
          t('Not Found', '見つかりません'),
          t('No previous purchase found.', '過去の購入が見つかりませんでした。'),
        );
        return;
      }

      const lifetimePurchase = purchases.find(
        (p) => !p.productId.includes('monthly') && !p.productId.includes('annual'),
      );
      const subscriptionPurchase = purchases.find(
        (p) => p.productId.includes('monthly') || p.productId.includes('annual'),
      );
      const target = lifetimePurchase || subscriptionPurchase;
      console.log('[restore] lifetimePurchase:', lifetimePurchase?.productId ?? 'none');
      console.log('[restore] subscriptionPurchase:', subscriptionPurchase?.productId ?? 'none');
      console.log('[restore] target:', target?.productId ?? 'none');

      if (!target) {
        console.log('[restore] FAIL: no target after filtering');
        Alert.alert(
          t('Not Found', '見つかりません'),
          t('No previous purchase found.', '過去の購入が見つかりませんでした。'),
        );
        return;
      }

      if (!target.purchaseToken) {
        console.log('[restore] FAIL: target has no purchaseToken');
        Alert.alert(
          t('Error', 'エラー'),
          t(
            'Could not retrieve receipt. Please try again.',
            'レシートが取得できませんでした。再度お試しください。',
          ),
        );
        return;
      }

      console.log('[restore] sending to submitReceipt, productId:', target.productId);
      const receiptData = {
        transactionId: target.transactionId,
        transactionReceipt: target.purchaseToken,
        originalTransactionId: ('originalTransactionIdentifierIOS' in target)
          ? target.originalTransactionIdentifierIOS ?? null
          : null,
        expiresDate: null,
      };
      const success = await submitReceipt(receiptData, target.productId);
      console.log('[restore] submitReceipt result:', success);
      if (success) {
        onClose();
      } else {
        console.log('[restore] FAIL: submitReceipt returned false');
        Alert.alert(t('Error', 'エラー'), t('Restore failed', '復元に失敗しました'));
      }
    } catch (e: any) {
      Alert.alert(t('Error', 'エラー'), e.message || t('Restore failed', '復元に失敗しました'));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Close button */}
      <TouchableOpacity style={s.closeBtn} onPress={onClose}>
        <Text style={s.closeBtnText}>×</Text>
      </TouchableOpacity>

      <View style={s.content}>
        {/* Header */}
        <Text style={s.logo}>IRIE</Text>
        <Text style={s.badge}>PREMIUM</Text>

        <Text style={s.headline}>
          {t('Unlock Unlimited AI Access', 'AI無制限アクセスを解放')}
        </Text>

        {/* Features */}
        <View style={s.features}>
          <FeatureRow emoji="🤖" text={t('Unlimited AI conversations', 'AI会話が無制限')} />
          <FeatureRow emoji="🎓" text={t('Patwa Tutor — no limits', 'パトワ講師 — 制限なし')} />
          <FeatureRow emoji="🎵" text={t('Culture deep dives — unlimited', 'カルチャー深掘り — 無制限')} />
          <FeatureRow emoji="🏝" text={t('Jamaica Guide — ask anything', 'ジャマイカガイド — 何でも聞ける')} />
        </View>

        {/* Price */}
        <Text style={s.price}>{price}</Text>
        <Text style={s.priceNote}>
          {t('Cancel anytime. Billed monthly.', 'いつでもキャンセル可能。月額課金。')}
        </Text>

        {/* Subscribe button */}
        <TouchableOpacity
          style={[s.subscribeBtn, loading && s.btnDisabled]}
          onPress={handleSubscribe}
          disabled={loading || restoring}
        >
          {loading ? (
            <ActivityIndicator color="#0D0A05" />
          ) : (
            <Text style={s.subscribeBtnText}>
              {t('Subscribe Now', 'サブスクリプション登録')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={s.restoreBtn}
          onPress={handleRestore}
          disabled={loading || restoring}
        >
          {restoring ? (
            <ActivityIndicator color="#C8860A" />
          ) : (
            <Text style={s.restoreBtnText}>
              {t('Restore Purchase', '購入を復元')}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={s.footerNote}>
          {t(
            'Already purchased the ¥1,000 unlock? Tap "Restore Purchase" above.',
            '¥1,000の買い切り版を購入済み？上の「購入を復元」をタップしてください。',
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={s.featureRow}>
      <Text style={s.featureEmoji}>{emoji}</Text>
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1408', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#8B7355', fontSize: 20, lineHeight: 22 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: { color: '#C8860A', fontSize: 36, fontWeight: '900', letterSpacing: 6 },
  badge: { color: '#0D0A05', backgroundColor: '#C8860A', fontSize: 11, fontWeight: '900', letterSpacing: 3, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  headline: { color: '#E8D8A0', fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 28, lineHeight: 28 },
  features: { marginTop: 28, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureEmoji: { fontSize: 20, width: 36 },
  featureText: { color: '#E8D8A0', fontSize: 15, flex: 1 },
  price: { color: '#C8860A', fontSize: 32, fontWeight: '900', marginTop: 28 },
  priceNote: { color: '#8B7355', fontSize: 12, marginTop: 6 },
  subscribeBtn: { backgroundColor: '#C8860A', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, marginTop: 28, width: '100%', alignItems: 'center' },
  subscribeBtnText: { color: '#0D0A05', fontSize: 16, fontWeight: '900' },
  btnDisabled: { opacity: 0.6 },
  restoreBtn: { marginTop: 16, paddingVertical: 12 },
  restoreBtnText: { color: '#C8860A', fontSize: 14, textDecorationLine: 'underline' },
  footerNote: { color: '#8B7355', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 16 },
});
