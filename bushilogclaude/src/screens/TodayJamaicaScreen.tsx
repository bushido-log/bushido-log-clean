import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, Linking, Image,
} from 'react-native';
import { useLang } from '../context/LanguageContext';
import { usePurchase } from '../context/PurchaseContext';
import PaywallScreen from './PaywallScreen';
import { supabase } from '../lib/supabase';

const COLORS = {
  bg: '#0D0A05', card: '#1A1408', gold: '#C8860A', green: '#2D5A1B',
  text: '#F5E6C8', muted: '#8B7355', border: '#2A2010',
};

const CATEGORY_EMOJI: Record<string, string> = { music: '🎵', culture: '🌴', sport: '🏃', news: '📰' };

// 1F fallback pool: shown in rotation until daily_content rows exist for the date (MM-DD)
const FALLBACK_DAILY = [
  { event_ja: '1962年8月6日、ジャマイカはイギリスから独立しました。', event_en: 'On August 6, 1962, Jamaica gained independence from Britain.', trivia_ja: 'ブルーマウンテンコーヒーは世界で最も高価なコーヒーの一つです。', trivia_en: 'Blue Mountain Coffee is among the most expensive coffees in the world.', patwa: 'Wah gwaan?', patwa_ja: '「調子どう?」— 定番のあいさつ。', patwa_en: '"What\'s going on?" — the classic greeting.' },
  { event_ja: '1945年2月6日、ボブ・マーリーがナインマイルで生まれました。', event_en: 'On February 6, 1945, Bob Marley was born in Nine Mile.', trivia_ja: 'ジャマイカは人口あたりのオリンピックメダル数が世界トップクラスです。', trivia_en: 'Jamaica has one of the highest per-capita Olympic medal counts in the world.', patwa: 'Irie', patwa_ja: '「最高・いい感じ」— この島の心を表す言葉。', patwa_en: '"Everything is alright" — the heart of the island in one word.' },
  { event_ja: 'ポートロイヤルはかつて「世界で最も豊かな街」と呼ばれました。', event_en: 'Port Royal was once called "the richest city in the world."', trivia_ja: 'ジャークチキンのピメント(オールスパイス)はジャマイカ原産です。', trivia_en: 'Pimento (allspice), the soul of jerk chicken, is native to Jamaica.', patwa: 'Likkle more', patwa_ja: '「またね」— 別れ際のあいさつ。', patwa_en: '"See you later" — how you say goodbye.' },
  { event_ja: 'レゲエは2018年にユネスコ無形文化遺産に登録されました。', event_en: 'Reggae was inscribed on the UNESCO Intangible Cultural Heritage list in 2018.', trivia_ja: 'ジャマイカの国民食はアキー&ソルトフィッシュです。', trivia_en: "Jamaica's national dish is ackee and saltfish.", patwa: 'Big up', patwa_ja: '「リスペクト!」— 称賛や感謝を伝える言葉。', patwa_en: '"Respect!" — how you show love and appreciation.' },
  { event_ja: 'ウサイン・ボルトは2009年に100m 9秒58の世界記録を樹立しました。', event_en: 'Usain Bolt set the 100m world record of 9.58 seconds in 2009.', trivia_ja: 'ジャマイカには120以上の川があります。', trivia_en: 'Jamaica has more than 120 rivers.', patwa: 'Bless up', patwa_ja: '「良い一日を」— 祝福を込めたあいさつ。', patwa_en: '"Have a blessed day" — a greeting full of good vibes.' },
  { event_ja: 'キングストンのトレンチタウンはレゲエ発祥の地とされています。', event_en: 'Trench Town in Kingston is known as the birthplace of reggae.', trivia_ja: 'ジャマイカ国旗の黒・緑・金は「困難・大地・太陽」を表します。', trivia_en: 'The black, green and gold of the flag stand for hardship, land and sun.', patwa: 'Zeen', patwa_ja: '「了解・いいね」— 相づちの定番。', patwa_en: '"Understood / cool" — the go-to word of agreement.' },
  { event_ja: 'ダンスホールは1970年代末のキングストンで生まれました。', event_en: 'Dancehall was born in late-1970s Kingston.', trivia_ja: 'ジャマイカのモットーは「Out of Many, One People」です。', trivia_en: "Jamaica's motto is 'Out of Many, One People.'", patwa: 'Nuff respect', patwa_ja: '「最大限のリスペクトを」— 深い敬意の表現。', patwa_en: '"Maximum respect" — deep appreciation.' },
];

const DIGEST_URL = 'https://irie-server.onrender.com/daily-digest';
const CHART_URL = 'https://irie-server.onrender.com/weekly-chart';

// Both floors share the same "today": Jamaica time (America/Jamaica = fixed UTC-5, no DST),
// matching the server's digest date key. For JST users this lags device time by 14h — by design.
const jamaicaNow = () => new Date(Date.now() - 5 * 3600 * 1000);

export default function TodayJamaicaScreen({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const { premium } = usePurchase();
  const [showPaywall, setShowPaywall] = useState(false);
  const [daily, setDaily] = useState<any>(null);
  const [digest, setDigest] = useState<any>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestError, setDigestError] = useState(false);
  const [chart, setChart] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(false);

  useEffect(() => { fetchDaily(); }, []);
  useEffect(() => { if (premium) { fetchDigest(); fetchChart(); } }, [premium]);

  const fetchDaily = async () => {
    const now = jamaicaNow();
    const mmdd = `${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
    try {
      const { data } = await supabase.from('daily_content').select('*').eq('mm_dd', mmdd).maybeSingle();
      if (data) { setDaily(data); return; }
    } catch { /* table not ready yet — fall through */ }
    const dayOfYear = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000);
    setDaily(FALLBACK_DAILY[dayOfYear % FALLBACK_DAILY.length]);
  };

  const fetchDigest = async () => {
    setDigestLoading(true);
    setDigestError(false);
    try {
      const res = await fetch(DIGEST_URL);
      const data = await res.json();
      if (data.ok) setDigest(data);
      else setDigestError(true);
    } catch {
      setDigestError(true);
    }
    setDigestLoading(false);
  };

  const fetchChart = async () => {
    setChartLoading(true);
    setChartError(false);
    try {
      const res = await fetch(CHART_URL);
      const data = await res.json();
      if (data.ok) setChart(data);
      else setChartError(true);
    } catch {
      setChartError(true);
    }
    setChartLoading(false);
  };

  const openVideo = (videoId: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`).catch(() => {});
  };

  const dateLabel = () => {
    const now = jamaicaNow();
    const m = now.getUTCMonth() + 1, d = now.getUTCDate();
    const monthEn = ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1];
    return lang === 'ja' ? `${m}月${d}日 (ジャマイカ時間)` : `${monthEn} ${d} (Jamaica time)`;
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text></TouchableOpacity>
        <Text style={s.headerTitle}>☀️ {lang === 'ja' ? '今日のジャマイカ' : "Today's Jamaica"}</Text>
        <Text style={[s.backBtn, { opacity: 0 }]}>·</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={s.dateLabel}>{dateLabel()}</Text>

        {/* ===== 1F: free daily content ===== */}
        {daily && (
          <>
            <View style={s.card}>
              <Text style={s.cardTag}>
                {daily.is_dated
                  ? `📅 ${lang === 'ja' ? '今日は何の日' : 'On This Day'}`
                  : `📖 ${lang === 'ja' ? '今日のジャマイカ話' : "Today's Jamaica Story"}`}
              </Text>
              <Text style={s.cardBody}>{lang === 'ja' ? daily.event_ja : daily.event_en}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTag}>💡 {lang === 'ja' ? '豆知識' : 'Did You Know?'}</Text>
              <Text style={s.cardBody}>{lang === 'ja' ? daily.trivia_ja : daily.trivia_en}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTag}>🗣️ {lang === 'ja' ? '今日のパトワ' : "Today's Patois"}</Text>
              <Text style={s.patwaWord}>{daily.patwa}</Text>
              {daily.patwa_kana ? <Text style={s.patwaKana}>{daily.patwa_kana}</Text> : null}
              <Text style={s.cardBody}>{lang === 'ja' ? daily.patwa_ja : daily.patwa_en}</Text>
            </View>
          </>
        )}

        {/* ===== 2F: Pro news digest ===== */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>📰 {lang === 'ja' ? 'ジャマイカ・ニュース' : 'Jamaica News'}</Text>
          <Text style={s.proBadge}>PRO</Text>
        </View>

        {!premium ? (
          <TouchableOpacity style={[s.card, s.lockedCard]} onPress={() => setShowPaywall(true)}>
            <Text style={{ fontSize: 34, textAlign: 'center' }}>🔒</Text>
            <Text style={s.lockedTitle}>
              {lang === 'ja' ? '毎日のジャマイカ・ニュースをAIが日本語でお届け' : 'Daily Jamaica news, summarized by AI'}
            </Text>
            <Text style={s.lockedSub}>
              {lang === 'ja'
                ? '音楽・カルチャー・観光・スポーツの実際のニュースを、毎日要約・翻訳。すべて出典リンク付き。さらに週間ダンスホールチャートも。'
                : 'Real music, culture, tourism and sports news — summarized daily with source links. Plus a weekly dancehall chart.'}
            </Text>
            <View style={s.lockedBtn}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>{lang === 'ja' ? 'Proで読む →' : 'Read with Pro →'}</Text>
            </View>
          </TouchableOpacity>
        ) : digestLoading ? (
          <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 24 }} />
        ) : digestError ? (
          <View style={s.card}>
            <Text style={s.cardBody}>{lang === 'ja' ? 'ニュースを取得できませんでした。' : 'Could not load the news.'}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchDigest}>
              <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>{lang === 'ja' ? '再試行' : 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : digest?.holiday || !digest?.stories?.length ? (
          <View style={s.card}>
            <Text style={s.cardBody}>
              {lang === 'ja' ? '今日のニュースはお休みです。また明日! 🌴' : 'No news today. Check back tomorrow! 🌴'}
            </Text>
          </View>
        ) : (
          digest.stories.map((story: any, i: number) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTag}>
                {CATEGORY_EMOJI[story.category] || '📰'} {story.category.toUpperCase()}
              </Text>
              <Text style={s.newsHeadline}>{lang === 'ja' ? story.headline_ja : story.headline_en}</Text>
              <Text style={s.cardBody}>{lang === 'ja' ? story.summary_ja : story.summary_en}</Text>
              <TouchableOpacity style={s.sourceBtn} onPress={() => Linking.openURL(story.source_url)}>
                <Text style={s.sourceBtnText}>
                  {story.source_name} — {lang === 'ja' ? '記事を読む ↗' : 'Read article ↗'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {premium && digest?.date && !digest.holiday && (
          <Text style={s.digestFooter}>
            {lang === 'ja' ? `ジャマイカ時間 ${digest.date} のニュース` : `News for ${digest.date} (Jamaica time)`}
          </Text>
        )}

        {/* ===== 2F: weekly dancehall chart (Pro) ===== */}
        {premium && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>🎵 {lang === 'ja' ? '今週のダンスホール' : "This Week's Dancehall"}</Text>
              <Text style={s.proBadge}>PRO</Text>
            </View>

            {chartLoading ? (
              <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 24 }} />
            ) : chartError ? (
              <View style={s.card}>
                <Text style={s.cardBody}>{lang === 'ja' ? 'チャートを取得できませんでした。' : 'Could not load the chart.'}</Text>
                <TouchableOpacity style={s.retryBtn} onPress={fetchChart}>
                  <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>{lang === 'ja' ? '再試行' : 'Retry'}</Text>
                </TouchableOpacity>
              </View>
            ) : chart?.holiday || !chart?.items?.length ? (
              <View style={s.card}>
                <Text style={s.cardBody}>
                  {lang === 'ja' ? '今週のチャートはお休みです。また来週! 🎧' : 'No chart this week. Check back soon! 🎧'}
                </Text>
              </View>
            ) : (
              <>
                {chart.selector_pick?.videoId && (
                  <TouchableOpacity style={[s.card, s.pickCard]} onPress={() => openVideo(chart.selector_pick.videoId)}>
                    <Text style={s.cardTag}>🎤 {lang === 'ja' ? '現地セレクターの一曲' : "Selector's Pick"}</Text>
                    <Image
                      source={{ uri: `https://i.ytimg.com/vi/${chart.selector_pick.videoId}/hqdefault.jpg` }}
                      style={s.pickThumb}
                    />
                    {(() => {
                      const it = chart.items.find((x: any) => x.video_id === chart.selector_pick.videoId);
                      return it ? <Text style={s.pickTitle}>{it.artist} - {it.song}</Text> : null;
                    })()}
                    {chart.selector_pick.comment ? <Text style={s.cardBody}>{chart.selector_pick.comment}</Text> : null}
                  </TouchableOpacity>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                  {chart.items.map((it: any, i: number) => (
                    <TouchableOpacity key={it.video_id} style={s.trackCard} onPress={() => openVideo(it.video_id)}>
                      <Image source={{ uri: it.thumbnail_url }} style={s.trackThumb} />
                      <Text style={s.trackRank}>{i + 1}</Text>
                      <Text style={s.trackArtist} numberOfLines={1}>{it.artist}</Text>
                      <Text style={s.trackSong} numberOfLines={2}>{it.song}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={s.digestFooter}>
                  {lang === 'ja' ? `${chart.week_key} 週のチャート · タップでYouTube` : `Week of ${chart.week_key} · tap to open YouTube`}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showPaywall} animationType="slide">
        <PaywallScreen onClose={() => setShowPaywall(false)} screenName="today" />
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: 'bold' },
  backBtn: { color: COLORS.gold, fontSize: 15 },
  dateLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 12, letterSpacing: 1 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTag: { color: COLORS.gold, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  cardBody: { color: COLORS.text, fontSize: 15, lineHeight: 23 },
  patwaWord: { color: COLORS.gold, fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  patwaKana: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: 'bold' },
  proBadge: {
    color: '#000', backgroundColor: COLORS.gold, fontSize: 10, fontWeight: 'bold',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, overflow: 'hidden',
  },
  lockedCard: { borderColor: COLORS.gold, borderWidth: 1.5, alignItems: 'center', paddingVertical: 24 },
  lockedTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  lockedSub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  lockedBtn: {
    backgroundColor: COLORS.gold, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10, marginTop: 16,
  },
  newsHeadline: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', lineHeight: 23, marginBottom: 6 },
  sourceBtn: {
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#241A08', borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-start',
  },
  sourceBtnText: { color: COLORS.gold, fontSize: 13 },
  retryBtn: { marginTop: 12, alignSelf: 'flex-start' },
  digestFooter: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  pickCard: { borderColor: COLORS.gold, borderWidth: 1.5 },
  pickThumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, marginBottom: 10, backgroundColor: '#000' },
  pickTitle: { color: COLORS.gold, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  trackCard: {
    width: 150, backgroundColor: COLORS.card, borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  trackThumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: '#000' },
  trackRank: { color: COLORS.gold, fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  trackArtist: { color: COLORS.text, fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  trackSong: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
});
