import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Alert, ScrollView, Linking,
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
  getAppTransactionIOS,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { useLang } from '../context/LanguageContext';
import { usePurchase } from '../context/PurchaseContext';

export const PRODUCT_ID_MONTHLY = 'com.hiroya.irie.premium.monthly';
export const PRODUCT_ID_ANNUAL = 'com.hiroya.irie.premium.annual';

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

  const [monthlyPrice, setMonthlyPrice] = useState('¥700');
  const [annualPrice, setAnnualPrice] = useState('¥7,000');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [iapReady, setIapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await initConnection();
        if (cancelled) return;
        setIapReady(true);
        const products = await fetchProducts({ skus: [PRODUCT_ID_MONTHLY, PRODUCT_ID_ANNUAL], type: 'subs' });
        if (!cancelled && products) {
          products.forEach((p) => {
            if (p.id.includes('monthly')) setMonthlyPrice(p.displayPrice);
            if (p.id.includes('annual')) setAnnualPrice(p.displayPrice);
          });
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
        const success = await submitReceipt(receiptData, purchase.productId);
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
      const sku = selectedPlan === 'annual' ? PRODUCT_ID_ANNUAL : PRODUCT_ID_MONTHLY;
      await requestPurchase({ type: 'subs', request: { apple: { sku } } });
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
      // --- Step 1: Try IAP-based restore (subscriptions & IAP lifetime) ---
      const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: false });
      console.log('[restore] getAvailablePurchases count:', purchases.length);
      console.log('[restore] purchases:', JSON.stringify(purchases.map(p => ({ productId: p.productId, transactionId: p.transactionId }))));

      if (purchases.length > 0) {
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

        if (target && target.purchaseToken) {
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
          if (success) { onClose(); return; }
        }
      }

      // --- Step 2: Legacy paid app check (pre-free, Build <= 58) ---
      console.log('[restore] No IAP purchase found, checking legacy paid app...');
      try {
        const appTx = await getAppTransactionIOS();
        console.log('[restore-appTx] result:', appTx ? JSON.stringify(appTx) : 'null');

        if (appTx) {
          const originalBuild = parseInt(appTx.originalAppVersion, 10);
          console.log('[restore-appTx] originalAppVersion:', appTx.originalAppVersion, 'parsed:', originalBuild);
          // Note: Sandbox returns originalAppVersion='1', will false-positive in test. Correct in production.
          // appTx.environment can distinguish 'Sandbox' vs 'Production' if needed.
          const LEGACY_MAX_BUILD = 58;

          if (!isNaN(originalBuild) && originalBuild <= LEGACY_MAX_BUILD) {
            console.log('[restore-appTx] LEGACY PAID USER detected, granting lifetime');
            const receiptData = {
              transactionId: appTx.appTransactionId ?? appTx.originalAppVersion,
              transactionReceipt: null,
              originalTransactionId: appTx.appTransactionId ?? null,
              expiresDate: null,
            };
            const success = await submitReceipt(receiptData, 'legacy.paid.lifetime');
            console.log('[restore-appTx] submitReceipt result:', success);
            if (success) { onClose(); return; }
            Alert.alert(t('Error', 'エラー'), t('Restore failed', '復元に失敗しました'));
            return;
          } else {
            console.log('[restore-appTx] not a legacy paid user (build > 58 or NaN)');
          }
        }
      } catch (appTxErr) {
        console.warn('[restore-appTx] getAppTransactionIOS failed:', appTxErr);
      }

      // --- Step 3: Nothing found ---
      console.log('[restore] No purchase or legacy entitlement found');
      Alert.alert(
        t('Not Found', '見つかりません'),
        t('No previous purchase found.', '過去の購入が見つかりませんでした。'),
      );
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

      <ScrollView contentContainerStyle={s.content} bounces={false}>
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

        {/* Plan selection */}
        <View style={s.planCards}>
          {/* Annual plan */}
          <TouchableOpacity
            style={[s.planCard, selectedPlan === 'annual' && s.planCardSelected]}
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.8}
          >
            <View style={s.planCardHeader}>
              <Text style={s.planLabel}>{t('Annual Plan', '年額プラン')}</Text>
              <View style={s.recommendBadge}>
                <Text style={s.recommendBadgeText}>{t('Best value', 'おすすめ')}</Text>
              </View>
            </View>
            <Text style={s.planPrice}>{annualPrice}/{t('year', '年')}</Text>
            <Text style={s.planSubtext}>
              {t('¥583/mo · Save 2 months', '月あたり¥583 ・ 2ヶ月分お得')}
            </Text>
          </TouchableOpacity>

          {/* Monthly plan */}
          <TouchableOpacity
            style={[s.planCard, selectedPlan === 'monthly' && s.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={s.planLabel}>{t('Monthly Plan', '月額プラン')}</Text>
            <Text style={s.planPrice}>{monthlyPrice}/{t('mo', '月')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.priceNote}>
          {selectedPlan === 'annual'
            ? t('Cancel anytime. Billed annually.', 'いつでもキャンセル可能。年額課金。')
            : t('Cancel anytime. Billed monthly.', 'いつでもキャンセル可能。月額課金。')}
        </Text>

        <Text style={s.legalNote}>
          {t(
            'Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID account at confirmation of purchase. You can manage or cancel subscriptions in Settings > Apple ID > Subscriptions.',
            'サブスクリプションは期間終了の24時間前までにキャンセルしない限り自動更新されます。お支払いは購入確定時にApple IDアカウントに請求されます。サブスクの管理・解約は 設定 > Apple ID > サブスクリプション からいつでも可能です。',
          )}
        </Text>

        <View style={s.legalLinks}>
          <TouchableOpacity onPress={() => Linking.openURL('https://irie-server.onrender.com/terms')}>
            <Text style={s.legalLinkText}>{t('Terms of Use', '利用規約')}</Text>
          </TouchableOpacity>
          <Text style={s.legalSep}>・</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://irie-server.onrender.com/privacy')}>
            <Text style={s.legalLinkText}>{t('Privacy Policy', 'プライバシーポリシー')}</Text>
          </TouchableOpacity>
        </View>

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
      </ScrollView>
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
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  logo: { color: '#C8860A', fontSize: 36, fontWeight: '900', letterSpacing: 6 },
  badge: { color: '#0D0A05', backgroundColor: '#C8860A', fontSize: 11, fontWeight: '900', letterSpacing: 3, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  headline: { color: '#E8D8A0', fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 28, lineHeight: 28, paddingHorizontal: 28 },
  features: { marginTop: 28, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureEmoji: { fontSize: 20, width: 36 },
  featureText: { color: '#E8D8A0', fontSize: 15, flex: 1 },
  planCards: { width: '100%', marginTop: 28, gap: 12 },
  planCard: { borderWidth: 2, borderColor: '#2A2010', borderRadius: 12, padding: 16, backgroundColor: '#1A1408' },
  planCardSelected: { borderColor: '#C8860A' },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { color: '#E8D8A0', fontSize: 15, fontWeight: '700' },
  planPrice: { color: '#C8860A', fontSize: 24, fontWeight: '900', marginTop: 4 },
  planSubtext: { color: '#8B7355', fontSize: 12, marginTop: 2 },
  recommendBadge: { backgroundColor: '#C8860A', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  recommendBadgeText: { color: '#0D0A05', fontSize: 10, fontWeight: '900' },
  priceNote: { color: '#8B7355', fontSize: 12, marginTop: 6 },
  legalNote: { color: '#8B7355', fontSize: 10, textAlign: 'center', marginTop: 12, lineHeight: 15, paddingHorizontal: 8 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  legalLinkText: { color: '#C8860A', fontSize: 11, textDecorationLine: 'underline' },
  legalSep: { color: '#8B7355', fontSize: 11, marginHorizontal: 6 },
  subscribeBtn: { backgroundColor: '#C8860A', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48, marginTop: 28, width: '100%', alignItems: 'center' },
  subscribeBtnText: { color: '#0D0A05', fontSize: 16, fontWeight: '900' },
  btnDisabled: { opacity: 0.6 },
  restoreBtn: { marginTop: 16, paddingVertical: 12 },
  restoreBtnText: { color: '#C8860A', fontSize: 14, textDecorationLine: 'underline' },
  footerNote: { color: '#8B7355', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 16 },
});
