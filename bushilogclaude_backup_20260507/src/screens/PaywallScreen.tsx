import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLang } from '../context/LanguageContext';
import { usePurchase } from '../context/PurchaseContext';

// TODO: Replace with actual product ID from App Store Connect
export const PRODUCT_ID_MONTHLY = 'com.hiroya.irie.premium.monthly';

type Props = {
  onClose: () => void;
  screenName?: string;
};

export default function PaywallScreen({ onClose, screenName }: Props) {
  const { lang } = useLang();
  const { submitReceipt, restore } = usePurchase();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const t = (en: string, ja: string) => (lang === 'ja' ? ja : en);

  // TODO: Get dynamic price from react-native-iap (Step 8)
  const price = '¥500/月';

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // TODO: react-native-iap purchase flow (Step 8)
      // const purchase = await requestSubscription({ sku: PRODUCT_ID_MONTHLY });
      // const success = await submitReceipt(
      //   { transactionId: purchase.transactionId, ...purchase },
      //   PRODUCT_ID_MONTHLY,
      // );
      // if (success) onClose();

      Alert.alert(
        t('Coming Soon', '準備中'),
        t('Subscription will be available soon.', 'サブスクリプションは近日公開予定です。'),
      );
    } catch (e: any) {
      Alert.alert(t('Error', 'エラー'), e.message || t('Purchase failed', '購入に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      // TODO: react-native-iap restore flow (Step 8)
      // const purchases = await getAvailablePurchases();
      // if (purchases.length > 0) {
      //   const success = await restore(purchases[0].transactionId);
      //   if (success) { onClose(); return; }
      // }

      Alert.alert(
        t('Coming Soon', '準備中'),
        t('Restore will be available soon.', '復元機能は近日公開予定です。'),
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
