import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, ScrollView, Image, Linking, TextInput
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
];

const HISTORY_CATEGORIES: Record<string, { id: string; name: string; sub: string; icon: string }[]> = {
  music: [
    { id: 'ska', name: 'Ska', sub: '1960s', icon: '🎺' },
    { id: 'rocksteady', name: 'Rocksteady', sub: '1966-68', icon: '🥁' },
    { id: 'roots-reggae', name: 'Roots Reggae', sub: '1970s', icon: '🌿' },
    { id: 'dancehall', name: 'Dancehall', sub: '1980s-2000s', icon: '💃' },
    { id: 'contemporary-reggae', name: 'Contemporary Reggae', sub: '2010s', icon: '🌍' },
    { id: 'trap-dancehall', name: 'Trap Dancehall', sub: 'Now', icon: '🔥' },
  ],
  food: [
    { id: 'jerk', name: 'Jerk', sub: 'BBQ Style', icon: '🔥' },
    { id: 'ackee', name: 'Ackee & Saltfish', sub: 'National Dish', icon: '🍳' },
    { id: 'patty', name: 'Patty', sub: 'Street Food', icon: '🥟' },
    { id: 'rice-peas', name: 'Rice & Peas', sub: 'Staple', icon: '🍚' },
    { id: 'festival', name: 'Festival', sub: 'Fried Dumpling', icon: '🌽' },
    { id: 'rum', name: 'Rum', sub: 'Drink Culture', icon: '🥃' },
  ],
  history: [
    { id: 'taino', name: 'Taino People', sub: 'Indigenous', icon: '🪶' },
    { id: 'slavery', name: 'Slavery Era', sub: '1600s-1838', icon: '⛓️' },
    { id: 'rastafari', name: 'Rastafari', sub: 'Movement', icon: '🦁' },
    { id: 'independence', name: 'Independence', sub: '1962', icon: '🇯🇲' },
    { id: 'marcus-garvey', name: 'Marcus Garvey', sub: 'Pan-Africanism', icon: '✊' },
    { id: 'maroons', name: 'Maroons', sub: 'Resistance', icon: '🌴' },
  ],
  people: [
    { id: 'usain-bolt', name: 'Usain Bolt', sub: 'Sprinter', icon: '⚡' },
    { id: 'marcus-garvey-p', name: 'Marcus Garvey', sub: 'Activist', icon: '✊' },
    { id: 'nanny', name: 'Queen Nanny', sub: 'National Hero', icon: '👑' },
    { id: 'haile-selassie', name: 'Haile Selassie', sub: 'Rastafari', icon: '🦁' },
    { id: 'louise-bennett', name: 'Louise Bennett', sub: 'Poet', icon: '📜' },
    { id: 'shelly-ann', name: 'Shelly-Ann', sub: 'Sprinter', icon: '🏃' },
  ],
  places: [
    { id: 'negril', name: 'Negril', sub: 'West Coast', icon: '🌅' },
    { id: 'kingston', name: 'Kingston', sub: 'Capital', icon: '🏙️' },
    { id: 'blue-mountains', name: 'Blue Mountains', sub: 'Nature', icon: '⛰️' },
    { id: 'port-royal', name: 'Port Royal', sub: 'Pirate City', icon: '🏴‍☠️' },
    { id: 'ocho-rios', name: 'Ocho Rios', sub: 'North Coast', icon: '🌊' },
    { id: 'trench-town', name: 'Trench Town', sub: 'Reggae Roots', icon: '🎵' },
  ],
};

const HISTORY_TABS = [
  { id: 'music', label: '🎵 Music' },
  { id: 'food', label: '🍛 Food' },
  { id: 'history', label: '🏛️ History' },
  { id: 'people', label: '👑 People' },
  { id: 'places', label: '📍 Places' },
];

type Tab = 'artists' | 'history';
type Props = { onBack: () => void };

type ArtistData = {
  name: string;
  image: string | null;
  followers: number;
  spotifyUrl: string;
};

export default function CultureScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('artists');
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const fetchInfo = async (topic: string, type: string, artistData?: ArtistData) => {
    setSelected(topic);
    setInfo(null);
    setLoading(true);
    if (artistData) { setSelectedArtist(artistData); fetchTracks(topic); }
    else { setSelectedArtist(null); setTracks([]); }
    try {
      const res = await fetch(CULTURE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type }),
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
          <Text style={styles.backBtn}>← 戻る</Text>
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
          placeholder={tab === 'artists' ? 'Search reggae artist...' : 'Search Jamaica topic...'}
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
      <ScrollView style={styles.scroll}>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                {HISTORY_TABS.map(ht => (
                  <TouchableOpacity key={ht.id} onPress={() => setHistoryTab(ht.id)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: historyTab === ht.id ? '#C8860A' : '#2A2010', backgroundColor: historyTab === ht.id ? '#2A1A00' : 'transparent' }}>
                    <Text style={{ color: historyTab === ht.id ? '#C8860A' : '#5C5040', fontWeight: '700', fontSize: 12 }}>{ht.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {(HISTORY_CATEGORIES[historyTab] || []).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, selected === item.name && styles.cardActive]}
                  onPress={() => fetchInfo(item.name, historyTab)}
                >
                  <Text style={{ fontSize: 28 }}>{item.icon}</Text>
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
                    👥 {(selectedArtist.followers / 1000000).toFixed(1)}M followers
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
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#C8860A" />
                <Text style={styles.loadingText}>Selector is spinning...</Text>
              </View>
            ) : info ? (
              <Text style={styles.infoText}>{info}</Text>
            ) : null}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  infoBox: { margin: 12, backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, padding: 16, gap: 12 },
  artistHeader: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  artistHeaderImg: { width: 72, height: 72, borderRadius: 36 },
  artistHeaderInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  artistHeaderName: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  artistFollowers: { color: '#A89060', fontSize: 12 },
  spotifyBtn: { color: '#1DB954', fontSize: 12, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingText: { color: '#5C5040', fontSize: 13 },
  infoText: { color: '#E8D8A0', fontSize: 14, lineHeight: 22 },
});