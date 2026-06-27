import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Linking, Modal
} from 'react-native';
import { useLang } from '../context/LanguageContext';
import { usePurchase } from '../context/PurchaseContext';
import PaywallScreen from './PaywallScreen';
import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from '../data/texts';

type Props = { onBack: () => void };

export default function SettingsScreen({ onBack }: Props) {
  const { lang, toggleLang } = useLang();
  const { purchaseType, premium, purchase } = usePurchase();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const t = (en: string, ja: string) => (lang === 'ja' ? ja : en);

  const appVersion = '1.0.0';

  const statusLabel = () => {
    if (purchaseType === 'lifetime') return t('Lifetime (Unlimited)', '買い切り（永久利用）');
    if (purchaseType === 'subscription') return t('Premium (Subscription)', 'プレミアム（サブスク）');
    return t('Free', '無料プラン');
  };

  const handleRestore = () => {
    setShowPaywall(true);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backBtn}>{t('← Back', '← 戻る')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('⚙ Settings', '⚙ 設定')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll}>
        {/* プラン・購入 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('👑 PLAN', '👑 プラン')}</Text>
          <View style={s.row}>
            <Text style={s.rowLabel}>{t('Current Plan', '現在のプラン')}</Text>
            <Text style={[s.rowValue, premium && s.premiumValue]}>{statusLabel()}</Text>
          </View>
          {purchaseType === 'subscription' && purchase?.expires_at && (
            <View style={s.row}>
              <Text style={s.rowLabel}>{t('Expires', '有効期限')}</Text>
              <Text style={s.rowValue}>{new Date(purchase.expires_at).toLocaleDateString()}</Text>
            </View>
          )}
          {!premium && (
            <TouchableOpacity style={s.upgradeBtn} onPress={() => setShowPaywall(true)}>
              <Text style={s.upgradeBtnText}>{t('Upgrade to Premium', 'プレミアムにアップグレード')}</Text>
            </TouchableOpacity>
          )}
          {purchaseType === 'subscription' && (
            <TouchableOpacity
              style={s.row}
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
            >
              <Text style={s.rowLabel}>{t('Manage Subscription', 'サブスクリプション管理')}</Text>
              <Text style={s.rowValue}>→</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.row} onPress={handleRestore}>
            <Text style={s.rowLabel}>{t('Restore Purchase', '購入を復元')}</Text>
            <Text style={s.rowValue}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 言語設定 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('🌐 Language', '🌐 言語')}</Text>
          <TouchableOpacity style={s.row} onPress={toggleLang}>
            <Text style={s.rowLabel}>{t('Current Language', '現在の言語')}</Text>
            <Text style={s.rowValue}>{lang === 'ja' ? '日本語 →EN' : 'English →JA'}</Text>
          </TouchableOpacity>
        </View>

        {/* サポート */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('📬 Support', '📬 サポート')}</Text>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL('mailto:oyaisyours@gmail.com')}>
            <Text style={s.rowLabel}>{t('Contact Us', 'お問い合わせ')}</Text>
            <Text style={s.rowValue}>oyaisyours@gmail.com →</Text>
          </TouchableOpacity>
        </View>

        {/* 法的情報 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('📄 Legal', '📄 法的情報')}</Text>
          <TouchableOpacity style={s.row} onPress={() => setShowPrivacy(!showPrivacy)}>
            <Text style={s.rowLabel}>{t('Privacy Policy', 'プライバシーポリシー')}</Text>
            <Text style={s.rowValue}>{showPrivacy ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showPrivacy && (
            <View style={s.textBox}>
              <Text style={s.textContent}>{PRIVACY_POLICY_TEXT}</Text>
            </View>
          )}

          <TouchableOpacity style={s.row} onPress={() => setShowTerms(!showTerms)}>
            <Text style={s.rowLabel}>{t('Terms of Service', '利用規約')}</Text>
            <Text style={s.rowValue}>{showTerms ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showTerms && (
            <View style={s.textBox}>
              <Text style={s.textContent}>{TERMS_OF_SERVICE_TEXT}</Text>
            </View>
          )}
        </View>

        {/* バージョン */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('ℹ️ App Info', 'ℹ️ アプリ情報')}</Text>
          <View style={s.row}>
            <Text style={s.rowLabel}>{t('Version', 'バージョン')}</Text>
            <Text style={s.rowValue}>{appVersion}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>{t('Developer', '開発者')}</Text>
            <Text style={s.rowValue}>HIROYA KOSHIISHI</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showPaywall} animationType="slide">
        <PaywallScreen onClose={() => setShowPaywall(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  backBtn: { color: '#C8860A', fontSize: 14 },
  title: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  scroll: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { color: '#C8860A', fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1408', borderRadius: 8, padding: 14, marginBottom: 2 },
  rowLabel: { color: '#E8D8A0', fontSize: 14 },
  rowValue: { color: '#C8860A', fontSize: 13 },
  premiumValue: { color: '#4CAF50', fontWeight: '800' },
  upgradeBtn: { backgroundColor: '#C8860A', borderRadius: 8, padding: 14, marginBottom: 2, alignItems: 'center' },
  upgradeBtnText: { color: '#0D0A05', fontSize: 14, fontWeight: '900' },
  textBox: { backgroundColor: '#1A1408', borderRadius: 8, padding: 16, marginBottom: 8 },
  textContent: { color: '#8B7355', fontSize: 12, lineHeight: 20 },
});
