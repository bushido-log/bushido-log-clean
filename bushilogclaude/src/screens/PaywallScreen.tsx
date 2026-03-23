import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onBack: () => void;
}

const T = {
  title: { en: 'IRIE Pro', ja: 'IRIE Pro' },
  subtitle: { en: 'Unlock the full Jamaica experience', ja: 'ジャマイカを完全に楽しもう' },
  features: {
    en: [
      '🎵 Full Music & Artist Guide',
      '🍽️ Complete Food & Culture',
      '🗺️ All Jamaica Locations',
      '🧠 Unlimited Ras Quiz',
      '🤖 Yardie AI — Unlimited Chat',
    ],
    ja: [
      '🎵 音楽・アーティスト完全ガイド',
      '🍽️ フード＆カルチャー全解放',
      '🗺️ ジャマイカ全スポット',
      '🧠 ラスクイズ無制限',
      '🤖 Yardie AI チャット無制限',
    ],
  },
  perMonth: { en: '/month', ja: '/月' },
  restore: { en: 'Restore Purchases', ja: '購入を復元' },
  legal: {
    en: 'Subscription auto-renews monthly. Cancel anytime in App Store settings.',
    ja: 'サブスクリプションは毎月自動更新されます。App Storeの設定からいつでもキャンセルできます。',
  },
  successTitle: { en: '🎉 Welcome to IRIE Pro!', ja: '🎉 IRIE Proへようこそ！' },
  successMsg: { en: 'Enjoy all premium features.', ja: 'すべてのプレミアム機能をお楽しみください。' },
  restored: { en: '✅ Restored!', ja: '✅ 復元完了！' },
  restoredMsg: { en: 'Your Pro access has been restored.', ja: 'Proアクセスが復元されました。' },
  noRestore: { en: 'No purchases found', ja: '購入履歴なし' },
  noRestoreMsg: { en: 'No active subscription found.', ja: 'アクティブなサブスクリプションが見つかりませんでした。' },
  ok: { en: 'OK', ja: 'OK' },
};

export default function PaywallScreen({ onBack }: Props) {
  const { language } = useLanguage();
  const lang = language === 'ja' ? 'ja' : 'en';
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (e) {
      console.error('Offerings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['IRIE Pro']) {
        Alert.alert(T.successTitle[lang], T.successMsg[lang], [
          { text: T.ok[lang], onPress: onBack }
        ]);
      }
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Error', e.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['IRIE Pro']) {
        Alert.alert(T.restored[lang], T.restoredMsg[lang], [
          { text: T.ok[lang], onPress: onBack }
        ]);
      } else {
        Alert.alert(T.noRestore[lang], T.noRestoreMsg[lang]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.emoji}>🇯🇲</Text>
      <Text style={styles.title}>{T.title[lang]}</Text>
      <Text style={styles.subtitle}>{T.subtitle[lang]}</Text>

      <View style={styles.features}>
        {T.features[lang].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 30 }} />
      ) : (
        packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={styles.purchaseBtn}
            onPress={() => handlePurchase(pkg)}
            disabled={purchasing}
          >
            <Text style={styles.purchaseBtnText}>
              {pkg.product.title} — {pkg.product.priceString}{T.perMonth[lang]}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {purchasing && <ActivityIndicator color="#FFD700" style={{ marginTop: 16 }} />}

      <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
        <Text style={styles.restoreText}>{T.restore[lang]}</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>{T.legal[lang]}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2e1a' },
  content: { alignItems: 'center', padding: 24, paddingTop: 60 },
  backBtn: { position: 'absolute', top: 20, right: 20, padding: 8 },
  backText: { color: '#FFD700', fontSize: 20 },
  emoji: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aed6b8', marginBottom: 32, textAlign: 'center' },
  features: { width: '100%', marginBottom: 32 },
  featureRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a4a2a' },
  featureText: { color: '#fff', fontSize: 16 },
  purchaseBtn: {
    backgroundColor: '#FFD700', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 32,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  purchaseBtnText: { color: '#0a2e1a', fontWeight: 'bold', fontSize: 16 },
  restoreBtn: { marginTop: 16 },
  restoreText: { color: '#aed6b8', fontSize: 14, textDecorationLine: 'underline' },
  legal: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 16 },
});
