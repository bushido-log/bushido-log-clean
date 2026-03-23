import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Linking, Alert
} from 'react-native';
import { useLang } from '../context/LanguageContext';
import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from '../data/texts';

type Props = { onBack: () => void; onPaywall: () => void };

export default function SettingsScreen({ onBack, onPaywall }: Props) {
  const { lang, toggleLang } = useLang();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const appVersion = '1.0.0';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lang === 'ja' ? '⚙️ 設定' : '⚙️ Settings'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll}>
        {/* IRIE Pro */}
        <View style={s.section}>
          <TouchableOpacity style={s.proBtn} onPress={onPaywall}>
            <Text style={s.proBtnEmoji}>🇯🇲</Text>
            <View>
              <Text style={s.proBtnTitle}>IRIE Pro</Text>
              <Text style={s.proBtnSub}>{lang === 'ja' ? 'フル機能を解放する' : 'Unlock full experience'}</Text>
            </View>
            <Text style={s.proBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 言語設定 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'ja' ? '🌐 言語' : '🌐 Language'}</Text>
          <TouchableOpacity style={s.row} onPress={toggleLang}>
            <Text style={s.rowLabel}>{lang === 'ja' ? '現在の言語' : 'Current Language'}</Text>
            <Text style={s.rowValue}>{lang === 'ja' ? '日本語 →EN' : 'English →JA'}</Text>
          </TouchableOpacity>
        </View>

        {/* サポート */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'ja' ? '📬 サポート' : '📬 Support'}</Text>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL('mailto:oyaisyours@gmail.com')}>
            <Text style={s.rowLabel}>{lang === 'ja' ? 'お問い合わせ' : 'Contact Us'}</Text>
            <Text style={s.rowValue}>oyaisyours@gmail.com →</Text>
          </TouchableOpacity>
        </View>

        {/* 法的情報 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'ja' ? '📄 法的情報' : '📄 Legal'}</Text>
          <TouchableOpacity style={s.row} onPress={() => setShowPrivacy(!showPrivacy)}>
            <Text style={s.rowLabel}>{lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}</Text>
            <Text style={s.rowValue}>{showPrivacy ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showPrivacy && (
            <View style={s.textBox}>
              <Text style={s.textContent}>{PRIVACY_POLICY_TEXT}</Text>
            </View>
          )}

          <TouchableOpacity style={s.row} onPress={() => setShowTerms(!showTerms)}>
            <Text style={s.rowLabel}>{lang === 'ja' ? '利用規約' : 'Terms of Service'}</Text>
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
          <Text style={s.sectionTitle}>{lang === 'ja' ? 'ℹ️ アプリ情報' : 'ℹ️ App Info'}</Text>
          <View style={s.row}>
            <Text style={s.rowLabel}>{lang === 'ja' ? 'バージョン' : 'Version'}</Text>
            <Text style={s.rowValue}>{appVersion}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>{lang === 'ja' ? '開発者' : 'Developer'}</Text>
            <Text style={s.rowValue}>HIROYA KOSHIISHI</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  textBox: { backgroundColor: '#1A1408', borderRadius: 8, padding: 16, marginBottom: 8 },
  textContent: { color: '#8B7355', fontSize: 12, lineHeight: 20 },
  proBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a3a20', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FFD700', marginBottom: 2 },
  proBtnEmoji: { fontSize: 28, marginRight: 12 },
  proBtnTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  proBtnSub: { color: '#aed6b8', fontSize: 12, marginTop: 2 },
  proBtnArrow: { color: '#FFD700', fontSize: 18, marginLeft: 'auto' },
});
