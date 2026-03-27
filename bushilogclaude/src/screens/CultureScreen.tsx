import { useLang } from '../context/LanguageContext';
import { checkAILimit, incrementAICount } from '../utils/aiLimit';
import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, ScrollView, Image, Linking, TextInput, Keyboard, Modal, KeyboardAvoidingView, Platform
} from 'react-native';

const SPOTIFY_URL = 'https://irie-server.onrender.com/spotify-artist';
const CULTURE_URL = 'https://irie-server.onrender.com/culture-info';
const TRACKS_URL = 'https://irie-server.onrender.com/spotify-tracks';

const ARTISTS = [
  { id: 'bob-marley', name: 'Bob Marley', era: '1970s' },
  { id: 'peter-tosh', name: 'Peter Tosh', era: '1970s' },
  { id: 'bunny-wailer', name: 'Bunny Wailer', era: '1970s' },
  { id: 'burning-spear', name: 'Burning Spear', era: '1970s' },
  { id: 'jacob-miller', name: 'Jacob Miller', era: '1970s' },
  { id: 'dennis-brown', name: 'Dennis Brown', era: '1970s' },
  { id: 'shabba-ranks', name: 'Shabba Ranks', era: '1990s' },
  { id: 'sizzla', name: 'Sizzla', era: '2000s' },
  { id: 'damian-marley', name: 'Damian Marley', era: '2000s' },
  { id: 'chronixx', name: 'Chronixx', era: '2010s' },
  { id: 'popcaan', name: 'Popcaan', era: '2010s' },
  { id: 'vybz-kartel', name: 'Vybz Kartel', era: '2000s' },
];

const HISTORY_CATEGORIES: Record<string, { id: string; name: string; sub: string; icon: string | null; img?: any }[]> = {
  music: [
    { id: 'ska', name: 'Ska', sub: '1960s', icon: null, img: require('../../assets/icons/icon_ska.png') },
    { id: 'rocksteady', name: 'Rocksteady', sub: '1966-68', icon: null, img: require('../../assets/icons/icon_rocksteady.png') },
    { id: 'roots-reggae', name: 'Roots Reggae', sub: '1970s', icon: null, img: require('../../assets/icons/icon_roots_reggae.png') },
    { id: 'dancehall', name: 'Dancehall', sub: '1980s-2000s', icon: null, img: require('../../assets/icons/icon_dancehall.png') },
    { id: 'contemporary-reggae', name: 'Contemporary Reggae', sub: '2010s', icon: null, img: require('../../assets/icons/icon_contemporary_reggae.png') },
    { id: 'trap-dancehall', name: 'Trap Dancehall', sub: 'Now', icon: null, img: require('../../assets/icons/icon_trap_dancehall.png') },
  ],
  food: [
    { id: 'jerk', name: 'Jerk', sub: 'BBQ Style', icon: '🔥', img: require('../../assets/icons/icon_jerk.png') },
    { id: 'ackee', name: 'Ackee & Saltfish', sub: 'National Dish', icon: '🍳', img: require('../../assets/icons/icon_ackee.png') },
    { id: 'patty', name: 'Patty', sub: 'Street Food', icon: '🥟', img: require('../../assets/icons/icon_patty.png') },
    { id: 'rice-peas', name: 'Rice & Peas', sub: 'Staple', icon: '🍚', img: require('../../assets/icons/icon_rice_peas.png') },
    { id: 'festival', name: 'Festival', sub: 'Fried Dumpling', icon: '🌽', img: require('../../assets/icons/icon_festival.png') },
    { id: 'rum', name: 'Rum', sub: 'Drink Culture', icon: '🥃', img: require('../../assets/icons/icon_rum.png') },
  ],
  history: [
    { id: 'taino', name: 'Taino People', sub: 'Indigenous', icon: '🪶', img: require('../../assets/icons/icon_taino.png') },
    { id: 'slavery', name: 'Slavery Era', sub: '1600s-1838', icon: '⛓️', img: require('../../assets/icons/icon_slavery.png') },
    { id: 'rastafari', name: 'Rastafari', sub: 'Movement', icon: '🦁', img: require('../../assets/icons/icon_rastafari.png') },
    { id: 'independence', name: 'Independence', sub: '1962', icon: '🇯🇲', img: require('../../assets/icons/icon_independence.png') },
    { id: 'marcus-garvey', name: 'Marcus Garvey', sub: 'Pan-Africanism', icon: '✊', img: require('../../assets/icons/icon_marcus_garvey.png') },
    { id: 'maroons', name: 'Maroons', sub: 'Resistance', icon: '🌴', img: require('../../assets/icons/icon_maroons.png') },
  ],
  people: [
    { id: 'usain-bolt', name: 'Usain Bolt', sub: 'Sprinter', icon: '⚡', img: require('../../assets/icons/icon_usain_bolt.png') },
    { id: 'marcus-garvey-p', name: 'Marcus Garvey', sub: 'Activist', icon: '✊', img: require('../../assets/icons/icon_marcus_garvey_p.png') },
    { id: 'nanny', name: 'Queen Nanny', sub: 'National Hero', icon: '👑', img: require('../../assets/icons/icon_queen_nanny.png') },
    { id: 'haile-selassie', name: 'Haile Selassie', sub: 'Rastafari', icon: '🦁', img: require('../../assets/icons/icon_haile_selassie.png') },
    { id: 'louise-bennett', name: 'Louise Bennett', sub: 'Poet', icon: '📜', img: require('../../assets/icons/icon_louise_bennett.png') },
    { id: 'shelly-ann', name: 'Shelly-Ann', sub: 'Sprinter', icon: '🏃', img: require('../../assets/icons/icon_shelly_ann.png') },
  ],
  places: [
    { id: 'negril', name: 'Negril', sub: 'West Coast', icon: '🌅', img: require('../../assets/icons/icon_negril.png') },
    { id: 'kingston', name: 'Kingston', sub: 'Capital', icon: '🏙️', img: require('../../assets/icons/icon_kingston.png') },
    { id: 'blue-mountains', name: 'Blue Mountains', sub: 'Nature', icon: '⛰️', img: require('../../assets/icons/icon_blue_mountains.png') },
    { id: 'port-royal', name: 'Port Royal', sub: 'Pirate City', icon: '🏴‍☠️', img: require('../../assets/icons/icon_port_royal.png') },
    { id: 'ocho-rios', name: 'Ocho Rios', sub: 'North Coast', icon: '🌊', img: require('../../assets/icons/icon_ocho_rios.png') },
    { id: 'trench-town', name: 'Trench Town', sub: 'Reggae Roots', icon: '🎵', img: require('../../assets/icons/icon_trench_town.png') },
  ],
};

const HISTORY_TABS = [
  { id: 'music', label: 'Music', icon: require('../../assets/icons/icon_music.png') },
  { id: 'food', label: 'Food', icon: require('../../assets/icons/icon_food.png') },
  { id: 'history', label: 'History', icon: require('../../assets/icons/icon_history.png') },
  { id: 'people', label: 'People', icon: require('../../assets/icons/icon_people.png') },
  { id: 'places', label: 'Places', icon: require('../../assets/icons/icon_places.png') },
];

type Tab = 'artists' | 'history';
type Props = { onBack: () => void };

type ArtistData = {
  name: string;
  image: string | null;
  followers: number;
  spotifyUrl: string;
};


const SELECTOR_TRIVIA_JA = ["ボブ・マーリーは世界で7500万枚以上のレコードを売り上げたラスタ。", "レゲエは1968年頃にジャマイカで誕生した音楽ジャンルラスタ。", "ダンスホールは1970年代後半にキングストンで生まれたラスタ。", "スカは1950年代末にジャマイカで誕生したポップミュージックラスタ。", "コキャンはスカとレゲエの間に生まれた音楽スタイルラスタ。", "サウンドシステムは1950年代にジャマイカで始まったDJ文化ラスタ。", "ロッカーズは1970年代のレゲエのサブジャンルでルーツレゲエとも呼ばれるラスタ。", "バーニング・スピアはジャマイカで最も尊敬されているルーツレゲエシンガーの一人ラスタ。", "シズラはダンスホール界で最も多作なアーティストの一人ラスタ。", "ダミアン・マーリーはボブ・マーリーの息子でグラミー賞を受賞しているラスタ。", "ヴァイブズ・カーテルはジャマイカで最も影響力のあるダンスホールアーティストの一人ラスタ。", "ピーター・トッシュはウェイラーズのメンバーで人権活動家でもあったラスタ。", "バニー・ウェイラーはボブ・マーリーとともにウェイラーズを結成したラスタ。", "スーパーキャットは1980年代のダンスホール界のパイオニアラスタ。", "バウンティ・キラーはジャマイカで最も影響力のあるDJの一人ラスタ。", "レゲエは2018年にユネスコの無形文化遺産に登録されたラスタ。", "ジャコブ・ミラーは1970年代のレゲエシーンで伝説的な存在ラスタ。", "デニス・ブラウンは「クラウン・プリンス・オブ・レゲエ」と呼ばれたラスタ。", "トーチャーはキングストンで生まれた革新的なダンスホールプロデューサーラスタ。", "スティーリー&クリービーは1980年代のダンスホールサウンドを定義したラスタ。"];
const SELECTOR_TRIVIA_EN = ["Bob Marley sold over 75 million records worldwide.", "Reggae music was born in Jamaica around 1968.", "Dancehall emerged in Kingston in the late 1970s.", "Ska was Jamaica's first pop music genre, born in the late 1950s.", "Rocksteady was the musical style between ska and reggae.", "Sound system culture began in Jamaica in the 1950s.", "Rockers is a 1970s reggae subgenre, also known as roots reggae.", "Burning Spear is one of the most respected roots reggae singers in Jamaica.", "Sizzla is one of the most prolific artists in dancehall history.", "Damian Marley is Bob Marley's son and a Grammy Award winner.", "Vybz Kartel is one of the most influential dancehall artists in Jamaica.", "Peter Tosh was a Wailers member and prominent human rights activist.", "Bunny Wailer co-founded The Wailers alongside Bob Marley.", "Super Cat was a pioneer of dancehall in the 1980s.", "Bounty Killer is one of the most influential DJs in Jamaica.", "Reggae was inscribed on UNESCO's Intangible Cultural Heritage list in 2018.", "Jacob Miller was a legendary figure in the 1970s reggae scene.", "Dennis Brown was known as the 'Crown Prince of Reggae'.", "Steely & Clevie defined the dancehall sound of the 1980s.", "King Jammy revolutionized dancehall with digital riddims in the 1980s."];
export default function CultureScreen({ onBack }: Props) {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>('artists');
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lyricsInput, setLyricsInput] = useState('');
  const [lyricsResult, setLyricsResult] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [trivia, setTrivia] = useState('');
  const [artistImages, setArtistImages] = useState<Record<string, ArtistData>>({});
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [historyTab, setHistoryTab] = useState('music');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (tab === 'artists') loadArtistImages();
  }, [tab]);

  const loadArtistImages = async () => {
    const results: Record<string, ArtistData> = {};
    await Promise.all(
      ARTISTS.map(async (a) => {
        try {
          const res = await fetch(`${SPOTIFY_URL}?name=${encodeURIComponent(a.name)}`);
          const data = await res.json();
          if (data.ok) results[a.id] = data.artist;
        } catch {}
      })
    );
    setArtistImages(results);
  };

  const handleHistorySearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await fetchInfo(searchQuery.trim(), historyTab);
    setIsSearching(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTracks([]);
    setSelectedArtist(null);
    try {
      const res = await fetch(`${SPOTIFY_URL}?name=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      const artistData = data.ok ? data.artist : undefined;
      await fetchInfo(searchQuery.trim(), 'artist', artistData);
    } catch {
      await fetchInfo(searchQuery.trim(), 'artist');
    }
    setIsSearching(false);
  };

  const fetchTracks = async (artistName: string) => {
    try {
      const res = await fetch(`${TRACKS_URL}?name=${encodeURIComponent(artistName)}`);
      const data = await res.json();
      if (data.ok) setTracks(data.tracks);
    } catch {}
  };

  const playTrack = async (track: any) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (playingId === track.id) {
      setPlayingId(null);
      return;
    }
    if (!track.preview_url) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: track.preview_url }, { shouldPlay: true });
      soundRef.current = sound;
      setPlayingId(track.id);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) setPlayingId(null);
      });
    } catch {}
  };

  const translateLyrics = async () => {
    if (!lyricsInput.trim()) return;
    const { allowed } = await checkAILimit();
    if (!allowed) {
      setLyricsResult(lang === 'ja'
        ? '無料プランのAI使用回数（3回）に達しました。\nIRIE Proにアップグレードすると無制限で使えます！🇯🇲'
        : 'You have used your 3 free AI credits.\nUpgrade to IRIE Pro for unlimited access! 🇯🇲');
      return;
    }
    await incrementAICount();
    Keyboard.dismiss();
    setLyricsLoading(true);
    setLyricsResult('');
    try {
      const res = await fetch('https://irie-server.onrender.com/lyrics-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: lyricsInput.trim(), lang }),
      });
      const data = await res.json();
      setLyricsResult(data.reply);
    } catch (e) {
      setLyricsResult(lang === 'ja' ? 'エラーが発生しました。もう一度試してください。' : 'Error occurred. Please try again.');
    } finally {
      setLyricsLoading(false);
    }
  };

  const fetchInfo = async (topic: string, type: string, artistData?: ArtistData) => {
    // typeをサーバー側の期待する値に変換
    const typeMap: Record<string, string> = {
      music: 'music',
      food: 'food',
      history: 'history',
      people: 'people',
      places: 'places',
    };
    const serverType = typeMap[type] || 'artist';
    const { allowed } = await checkAILimit();
    if (!allowed) {
      setInfo(lang === 'ja'
        ? '無料プランのAI使用回数（3回）に達しました。\nIRIE Proにアップグレードすると無制限で使えます！🇯🇲'
        : 'You have used your 3 free AI credits.\nUpgrade to IRIE Pro for unlimited access! 🇯🇲');
      return;
    }
    await incrementAICount();
    setSelected(topic);
    setInfo(null);
    const arr = lang === 'ja' ? SELECTOR_TRIVIA_JA : SELECTOR_TRIVIA_EN;
    setTrivia(arr[Math.floor(Math.random() * arr.length)]);
    setLoading(true);
    if (artistData) { setSelectedArtist(artistData); fetchTracks(topic); }
    else { setSelectedArtist(null); setTracks([]); }
    try {
      const res = await fetch(CULTURE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: serverType, lang }),
      });
      const data = await res.json();
      setInfo(data.reply);
    } catch {
      setInfo('Selector is not available right now!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎵 Selector's Culture</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.selectorBar}>
        <Text style={styles.selectorIcon}>🎛️</Text>
        <Text style={styles.selectorText}>
          {selected ? `Selecta! Big tune on ${selected}!` : 'Selecta! Pick an artist or era, mi show yuh di roots!'}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'artists' && styles.tabActive]}
          onPress={() => { setTab('artists'); setSelected(null); setInfo(null); }}
        >
          <Text style={[styles.tabText, tab === 'artists' && styles.tabTextActive]}>🎤 Artists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => { setTab('history'); setSelected(null); setInfo(null); }}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>📜 History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={tab === 'artists' ? (lang === 'ja' ? 'レゲエアーティストを検索...' : 'Search reggae artist...') : (lang === 'ja' ? 'ジャマイカのトピックを検索...' : 'Search Jamaica topic...')}
          placeholderTextColor="#5C5040"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={tab === 'artists' ? handleSearch : handleHistorySearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={tab === 'artists' ? handleSearch : handleHistorySearch}>
          {isSearching ? <ActivityIndicator color="#0D0A05" size="small" /> : <Text style={styles.searchBtnText}>🔍</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Lyrics Translator Button */}
        {tab === 'artists' && (
          <TouchableOpacity
            style={{ marginHorizontal: 12, marginBottom: 8, backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#C8860A', borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => { setLyricsInput(''); setLyricsResult(''); setShowLyricsModal(true); }}
          >
            <Text style={{ fontSize: 20 }}>🎵</Text>
            <View>
              <Text style={{ color: '#C8860A', fontWeight: '900', fontSize: 14 }}>{lang === 'ja' ? '歌詞を翻訳・解説する' : 'Translate & Explain Lyrics'}</Text>
              <Text style={{ color: '#5C5040', fontSize: 11, marginTop: 2 }}>{lang === 'ja' ? 'パトワ語歌詞を日本語で解説' : 'Patois lyrics explained in English'}</Text>
            </View>
          </TouchableOpacity>
        )}


        {tab === 'history' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 8, marginBottom: 8 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
            {HISTORY_TABS.map(ht => (
              <TouchableOpacity key={ht.id} onPress={() => setHistoryTab(ht.id)} style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: historyTab === ht.id ? '#C8860A' : '#2A2010', backgroundColor: historyTab === ht.id ? '#2A1A00' : 'transparent', gap: 4 }}>
                <Image source={ht.icon} style={{ width: 32, height: 32, opacity: historyTab === ht.id ? 1 : 0.5 }} />
                <Text style={{ color: historyTab === ht.id ? '#C8860A' : '#5C5040', fontWeight: '700', fontSize: 10 }}>{ht.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.grid}>
          {tab === 'artists' ? ARTISTS.map((a) => {
            const spotifyData = artistImages[a.id];
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.card, selected === a.name && styles.cardActive]}
                onPress={() => fetchInfo(a.name, 'artist', spotifyData)}
              >
                {spotifyData?.image ? (
                  <Image source={{ uri: spotifyData.image }} style={styles.artistImg} />
                ) : (
                  <View style={styles.artistImgPlaceholder}>
                    <Text style={{ fontSize: 24 }}>🎵</Text>
                  </View>
                )}
                <Text style={styles.cardName}>{a.name}</Text>
                <Text style={styles.cardEra}>{a.era}</Text>
              </TouchableOpacity>
            );
          }) : (
            <>
              {(HISTORY_CATEGORIES[historyTab] || []).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, selected === item.name && styles.cardActive]}
                  onPress={() => fetchInfo(item.name, historyTab)}
                >
                  {item.img ? (
                    <Image source={item.img} style={{ width: 56, height: 56 }} />
                  ) : (
                    <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                  )}
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardEra}>{item.sub}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {(loading || info || tracks.length > 0) && (
          <View style={styles.infoBox}>
            {selectedArtist && (
              <View style={styles.artistHeader}>
                {selectedArtist.image && (
                  <Image source={{ uri: selectedArtist.image }} style={styles.artistHeaderImg} />
                )}
                <View style={styles.artistHeaderInfo}>
                  <Text style={styles.artistHeaderName}>{selectedArtist.name}</Text>
                  <Text style={styles.artistFollowers}>
                    👥 {Number.isFinite(selectedArtist.followers) ? (selectedArtist.followers / 1000000).toFixed(1) + "M" : "–"} followers
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openURL(selectedArtist.spotifyUrl)}>
                    <Text style={styles.spotifyBtn}>▶ Open in Spotify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {tracks.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={{ color: '#C8860A', fontWeight: 'bold', fontSize: 13 }}>🎵 Top Tracks</Text>
                {tracks.map(track => (
                  <TouchableOpacity key={track.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0F0A05', borderRadius: 8, padding: 8 }} onPress={() => playTrack(track)}>
                    {track.image && <Image source={{ uri: track.image }} style={{ width: 40, height: 40, borderRadius: 4 }} />}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#E8D8A0', fontSize: 12, fontWeight: 'bold' }}>{track.name}</Text>
                      <Text style={{ color: '#5C5040', fontSize: 11 }}>{track.album}</Text>
                    </View>
                    <Text style={{ fontSize: 20 }}>{track.preview_url ? (playingId === track.id ? '⏸️' : '▶️') : '🚫'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {loading ? (
              <>
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#C8860A" />
                  <Text style={styles.loadingText}>Selector is spinning...</Text>
                </View>
                {trivia ? (
                  <View style={{ marginTop: 12, paddingHorizontal: 8 }}>
                    <Text style={{ color: '#C8860A', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>🎵 RASTA WISDOM</Text>
                    <Text style={{ color: '#666', fontSize: 12, lineHeight: 18 }}>{trivia}</Text>
                  </View>
                ) : null}
                <Text style={{ color: '#444', fontSize: 11, textAlign: 'center', marginTop: 8, paddingHorizontal: 24, lineHeight: 16 }}>
                  {lang === 'ja' ? '本AIの情報は参考目的です。最新情報は各公式サイトをご確認ください。' : "AI-generated content for reference only. Please check official sources for latest info."}
                </Text>
              </>
            ) : info ? (
              <Text style={styles.infoText}>{info}</Text>
            ) : null}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Lyrics Modal */}
      <Modal visible={showLyricsModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0D0A05' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2010' }}>
            <Text style={{ color: '#C8860A', fontWeight: '900', fontSize: 16 }}>🎵 {lang === 'ja' ? '歌詞を解析する' : 'Analyze Lyrics'}</Text>
            <TouchableOpacity onPress={() => setShowLyricsModal(false)}>
              <Text style={{ color: '#C8860A', fontSize: 14 }}>✕ {lang === 'ja' ? '閉じる' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ color: '#5C5040', fontSize: 12, marginBottom: 8 }}>{lang === 'ja' ? '歌詞をコピペして貼り付けてください' : 'Paste lyrics below to translate & analyze'}</Text>
            <TextInput
              style={{ backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, padding: 12, color: '#E8D8A0', fontSize: 14, minHeight: 200, textAlignVertical: 'top', lineHeight: 22 }}
              placeholder={lang === 'ja' ? '歌詞をここに貼り付け...' : 'Paste lyrics here...'}
              placeholderTextColor="#3A2A10"
              value={lyricsInput}
              onChangeText={setLyricsInput}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={{ backgroundColor: '#C8860A', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 }}
              onPress={translateLyrics}
              disabled={lyricsLoading}
            >
              {lyricsLoading
                ? <ActivityIndicator color="#0D0A05" size="small" />
                : <Text style={{ color: '#0D0A05', fontWeight: '900', fontSize: 15, letterSpacing: 2 }}>{lang === 'ja' ? '🔍 解析する' : '🔍 Analyze'}</Text>
              }
            </TouchableOpacity>
            {lyricsResult ? (
              <View style={{ backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, padding: 16, marginTop: 16 }}>
                <Text style={{ color: '#E8D8A0', fontSize: 14, lineHeight: 24 }}>{lyricsResult}</Text>
              </View>
            ) : null}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  backBtn: { color: '#C8860A', fontSize: 14 },
  headerTitle: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  selectorBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1200', padding: 12, margin: 12, borderRadius: 8, borderWidth: 1, borderColor: '#3A2A10', gap: 8 },
  selectorIcon: { fontSize: 24 },
  selectorText: { color: '#A89060', fontSize: 12, flex: 1, lineHeight: 18 },
  tabs: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginBottom: 8 },
  tab: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#2A2010', alignItems: 'center' },
  tabActive: { borderColor: '#C8860A', backgroundColor: '#2A1A00' },
  tabText: { color: '#5C5040', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#C8860A' },
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 },
  card: { width: '30%', backgroundColor: '#0F0A05', borderWidth: 1, borderColor: '#2A2010', borderRadius: 8, padding: 8, alignItems: 'center', gap: 4 },
  cardActive: { borderColor: '#C8860A', backgroundColor: '#2A1A00' },
  artistImg: { width: 64, height: 64, borderRadius: 32 },
  artistImgPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A1200', justifyContent: 'center', alignItems: 'center' },
  cardName: { color: '#E8D8A0', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  cardEra: { color: '#5C5040', fontSize: 10 },
  searchRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#1A1200', color: '#E8D8A0', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  searchBtn: { backgroundColor: '#C8860A', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { fontSize: 18 },
  infoBox: { margin: 12, backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, padding: 16, paddingBottom: 200, gap: 12 },
  artistHeader: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  artistHeaderImg: { width: 72, height: 72, borderRadius: 36 },
  artistHeaderInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  artistHeaderName: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  artistFollowers: { color: '#A89060', fontSize: 12 },
  spotifyBtn: { color: '#1DB954', fontSize: 12, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingText: { color: '#5C5040', fontSize: 13 },
  infoText: { color: '#E8D8A0', fontSize: 13, lineHeight: 20, paddingBottom: 16 },
});