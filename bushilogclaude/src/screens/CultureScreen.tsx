import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, ScrollView, Image, Linking
} from 'react-native';

const SPOTIFY_URL = 'https://irie-server.onrender.com/spotify-artist';
const CULTURE_URL = 'https://irie-server.onrender.com/culture-info';

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

const ERAS = [
  { id: 'ska', name: 'Ska', years: '1960s', icon: '🎺' },
  { id: 'rocksteady', name: 'Rocksteady', years: '1966-68', icon: '🥁' },
  { id: 'roots-reggae', name: 'Roots Reggae', years: '1970s', icon: '🌿' },
  { id: 'dancehall', name: 'Dancehall', years: '1980s', icon: '💃' },
  { id: 'ragga', name: 'Ragga', years: '1990s', icon: '🎛️' },
  { id: 'modern-reggae', name: 'Modern Reggae', years: '2010s+', icon: '🌍' },
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

  const fetchInfo = async (topic: string, type: string, artistData?: ArtistData) => {
    setSelected(topic);
    setInfo(null);
    setLoading(true);
    if (artistData) setSelectedArtist(artistData);
    else setSelectedArtist(null);
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
          }) : ERAS.map((era) => (
            <TouchableOpacity
              key={era.id}
              style={[styles.card, selected === era.name && styles.cardActive]}
              onPress={() => fetchInfo(era.name, 'history')}
            >
              <Text style={{ fontSize: 28 }}>{era.icon}</Text>
              <Text style={styles.cardName}>{era.name}</Text>
              <Text style={styles.cardEra}>{era.years}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(loading || info) && (
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
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#C8860A" />
                <Text style={styles.loadingText}>Selector is spinning...</Text>
              </View>
            ) : (
              <Text style={styles.infoText}>{info}</Text>
            )}
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