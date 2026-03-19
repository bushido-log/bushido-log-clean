import { useLang } from '../context/LanguageContext';
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { supabase } from '../lib/supabase';

const COLORS = {
  bg: '#0D0A05', card: '#1A1408', gold: '#C8860A', green: '#2D5A1B',
  text: '#F5E6C8', muted: '#8B7355', border: '#2A2010',
};

const CATEGORIES = [
  { key: 'all', label_en: '🌴 All', label_ja: '🌴 全て' },
  { key: 'restaurant', label_en: '🍽️ Food', label_ja: '🍽️ グルメ' },
  { key: 'tourist', label_en: '🏛️ Sights', label_ja: '🏛️ 観光' },
  { key: 'beach', label_en: '🏖️ Beach', label_ja: '🏖️ ビーチ' },
  { key: 'bar', label_en: '🍺 Bar', label_ja: '🍺 バー' },
  { key: 'other', label_en: '✨ Other', label_ja: '✨ その他' },
];

const PARISHES = ['Kingston','Portland','St. Ann','Negril','Montego Bay','Ocho Rios','St. Elizabeth','Westmoreland','Other'];

export default function JamaicaGuideScreen({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [showYardie, setShowYardie] = useState(false);
  const [activeView, setActiveView] = useState<'form'|'map'>('form');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('restaurant');
  const [newDescription, setNewDescription] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newParish, setNewParish] = useState('Kingston');
  const [newSubmittedBy, setNewSubmittedBy] = useState('');
  const [newDescriptionJa, setNewDescriptionJa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: "Yow! Mi name Yardie, di real Jamaica guide! Ask mi anyting bout Jamaica - di food, di vibes, di spots. Mi know every corner a dis island! 🇯🇲" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => { fetchSpots(); }, [activeCategory]);

  const fetchSpots = async () => {
    setLoading(true);
    let query = supabase.from('spots').select('*').order('likes', { ascending: false });
    if (activeCategory !== 'all') query = query.eq('category', activeCategory);
    const { data, error } = await query;
    if (!error && data) setSpots(data);
    setLoading(false);
  };

  const fetchReviews = async (spotId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('spot_id', spotId).order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const openSpot = (spot: any) => { setSelectedSpot(spot); fetchReviews(spot.id); };

  const handleDeleteSpot = async (spot: any) => {
    Alert.alert(lang === 'ja' ? 'スポット削除' : 'Delete Spot', lang === 'ja' ? '本当に削除しますか？' : 'Are you sure?', [
      { text: lang === 'ja' ? 'キャンセル' : 'Cancel', style: 'cancel' },
      { text: lang === 'ja' ? '削除' : 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('reviews').delete().eq('spot_id', spot.id);
        await supabase.from('spots').delete().eq('id', spot.id);
        setSelectedSpot(null);
        fetchSpots();
        Alert.alert(lang === 'ja' ? '完了' : 'Done', lang === 'ja' ? 'スポットを削除しました！' : 'Spot deleted!');
      }},
    ]);
  };

  const handleLike = async (spot: any) => {
    await supabase.from('spots').update({ likes: spot.likes + 1 }).eq('id', spot.id);
    fetchSpots();
  };

  const handleAddSpot = async () => {
    if (!newName || !newDescription) { Alert.alert(lang === 'ja' ? 'エラー' : 'Error', lang === 'ja' ? '名前と説明を入力してください！' : 'Name and description required!'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('spots').insert({
      name: newName, category: newCategory, description: newDescription,
      address: newAddress, parish: newParish, submitted_by: newSubmittedBy || 'Anonymous', latitude: newLatitude, longitude: newLongitude, description_ja: newDescriptionJa || null,
    });
    setSubmitting(false);
    if (error) { Alert.alert(lang === 'ja' ? 'エラー' : 'Error', lang === 'ja' ? 'スポットの追加に失敗しました' : 'Failed to add spot'); }
    else {
      setShowAddSpot(false);
      setNewName(''); setNewDescription(''); setNewAddress(''); setNewSubmittedBy(''); setNewLatitude(null); setNewLongitude(null); setNewDescriptionJa('');
      fetchSpots();
      Alert.alert(lang === 'ja' ? 'IRIE!' : 'IRIE!', lang === 'ja' ? 'スポットを追加しました！' : 'Spot added! Big up!');
    }
  };

  const handleAddReview = async () => {
    if (!reviewComment || !selectedSpot) return;
    const { error } = await supabase.from('reviews').insert({
      spot_id: selectedSpot.id, comment: reviewComment, rating: reviewRating, submitted_by: reviewName || 'Anonymous',
    });
    if (!error) { setReviewComment(''); setReviewName(''); fetchReviews(selectedSpot.id); }
  };

  const sendYardieMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const res = await fetch('https://irie-server.onrender.com/yardie-guide', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: newMessages.slice(-6) }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: lang === 'ja' ? "接続エラー！もう一度試してください！" : "Connection error! Please try again!" }]);
    }
    setChatLoading(false);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const getCategoryEmoji = (cat: string) => ({ restaurant:'🍽️', tourist:'🏛️', beach:'🏖️', bar:'🍺', other:'✨' }[cat] || '📍');

  const renderStars = (rating: number, onPress?: (r: number) => void) => (
    <View style={{ flexDirection: 'row' }}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onPress?.(i)} disabled={!onPress}>
          <Text style={{ fontSize: 18, color: i <= rating ? '#FFD700' : COLORS.muted }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const mapSpots = spots.filter(s => s.latitude && s.longitude);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text></TouchableOpacity>
        <Text style={s.headerTitle}>🇯🇲 Jamaica Guide</Text>
        <TouchableOpacity onPress={() => setShowYardie(true)}><Text style={s.backBtn}>🗣️</Text></TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={s.toggleRow}>
        <TouchableOpacity style={[s.toggleBtn, viewMode === 'map' && s.toggleActive]} onPress={() => setViewMode('map')}>
          <Text style={[s.toggleText, viewMode === 'map' && s.toggleTextActive]}>{lang === 'ja' ? '🗺️ マップ' : '🗺️ Map'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.toggleBtn, viewMode === 'list' && s.toggleActive]} onPress={() => setViewMode('list')}>
          <Text style={[s.toggleText, viewMode === 'list' && s.toggleTextActive]}>{lang === 'ja' ? '📋 リスト' : '📋 List'}</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categoryBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.key} style={[s.chip, activeCategory === cat.key && s.chipActive]} onPress={() => setActiveCategory(cat.key)}>
            <Text style={[s.chipText, activeCategory === cat.key && s.chipTextActive]}>{lang === 'ja' ? cat.label_ja : cat.label_en}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map View */}
      <View style={{ flex: 1, display: viewMode === 'map' ? 'flex' : 'none' }}>
          <MapView
            style={{ flex: 1 }}
            ref={mapRef}
            initialRegion={{
              latitude: 18.1096,
              longitude: -77.2975,
              latitudeDelta: 2.5,
              longitudeDelta: 2.5,
            }}
          >
            {mapSpots.map(spot => (
              <Marker
                key={spot.id}
                coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                title={spot.name}
              >
                <View style={s.markerPin}>
                  <Text style={{ fontSize: 20 }}>{getCategoryEmoji(spot.category)}</Text>
                </View>
                <Callout tooltip={false} onPress={() => openSpot(spot)}>
                  <View style={{ width: 200, padding: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{spot.name}</Text>
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>📍 {spot.parish}</Text>
                    <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }} numberOfLines={2}>{lang === 'ja' && spot.description_ja ? spot.description_ja : spot.description}</Text>
                    <Text style={{ color: '#C8860A', fontSize: 12, marginTop: 4 }}>{lang === 'ja' ? '詳細を見る →' : 'Tap for details →'}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>

      {/* List View */}
      {viewMode === 'list' && (
        loading ? <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 40 }} /> : (
          <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: 100 }}>
            {spots.length === 0 && (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: 'bold' }}>No spots yet!</Text>
                <Text style={{ color: COLORS.muted, marginTop: 8 }}>Be the first to add one 🌴</Text>
              </View>
            )}
            {spots.map(spot => (
              <TouchableOpacity key={spot.id} style={s.card} onPress={() => {
                if (spot.latitude && spot.longitude) {
                  setViewMode('map');
                  setTimeout(() => {
                    mapRef.current?.animateToRegion({
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }, 800);
                  }, 600);
                }
                openSpot(spot);
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 28, marginRight: 10 }}>{getCategoryEmoji(spot.category)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.spotName}>{spot.name}</Text>
                    <Text style={s.spotMuted}>📍 {spot.parish}</Text>
                  </View>
                  <TouchableOpacity style={s.likeBtn} onPress={() => handleLike(spot)}>
                    <Text style={{ color: '#FF6B6B', fontSize: 13 }}>❤️ {spot.likes}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.spotMuted} numberOfLines={2}>{lang === 'ja' && spot.description_ja ? spot.description_ja : spot.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      )}

      <TouchableOpacity style={s.fab} onPress={() => setShowAddSpot(true)}>
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>{lang === 'ja' ? '+ スポット追加' : '+ Add Spot'}</Text>
      </TouchableOpacity>

      {/* Spot Detail Modal */}
      <Modal visible={!!selectedSpot} animationType="slide" presentationStyle="pageSheet">
        {selectedSpot && (
          <View style={s.modal}>
            <View style={s.header}>
              <TouchableOpacity onPress={() => {
                const spot = selectedSpot;
                setSelectedSpot(null);
                if (spot?.latitude && spot?.longitude) {
                  setViewMode('map');
                  setTimeout(() => {
                    mapRef.current?.animateToRegion({
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }, 800);
                  }, 300);
                }
              }}><Text style={s.backBtn}>{lang === 'ja' ? '🗺️ マップ' : '🗺️ Map'}</Text></TouchableOpacity>
              <Text style={s.headerTitle}>{getCategoryEmoji(selectedSpot.category)} {selectedSpot.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteSpot(selectedSpot)}><Text style={{ color: '#FF4444', fontSize: 13 }}>{lang === 'ja' ? '🗑️ 削除' : '🗑️ Delete'}</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View style={s.card}>
                <Text style={{ color: COLORS.gold, fontSize: 14 }}>📍 {selectedSpot.parish}</Text>
                {selectedSpot.address ? <Text style={s.spotMuted}>{selectedSpot.address}</Text> : null}
                <Text style={{ color: COLORS.text, fontSize: 15, lineHeight: 22, marginVertical: 10 }}>{lang === 'ja' && selectedSpot.description_ja ? selectedSpot.description_ja : selectedSpot.description}</Text>
                <TouchableOpacity style={s.likeBtn} onPress={() => handleLike(selectedSpot)}>
                  <Text style={{ color: '#FF6B6B' }}>❤️ {selectedSpot.likes} IRIE</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.sectionTitle}>{lang === 'ja' ? `レビュー (${reviews.length})` : `Reviews (${reviews.length})`}</Text>
              {reviews.map(r => (
                <View key={r.id} style={s.card}>
                  {renderStars(r.rating)}
                  <Text style={{ color: COLORS.text, fontSize: 14, marginTop: 6 }}>{r.comment}</Text>
                  <Text style={s.spotMuted}>— {r.submitted_by}</Text>
                </View>
              ))}
              <Text style={s.sectionTitle}>{lang === 'ja' ? 'レビューを書く' : 'Leave a Review'}</Text>
              <View style={s.card}>
                {renderStars(reviewRating, setReviewRating)}
                <TextInput style={s.input} placeholder={lang === 'ja' ? 'レビューを書く...' : 'Your review...'} placeholderTextColor={COLORS.muted} value={reviewComment} onChangeText={setReviewComment} multiline />
                <TextInput style={s.input} placeholder={lang === 'ja' ? 'お名前（任意）' : 'Your name (optional)'} placeholderTextColor={COLORS.muted} value={reviewName} onChangeText={setReviewName} />
                <TouchableOpacity style={s.submitBtn} onPress={handleAddReview}>
                  <Text style={{ color: '#000', fontWeight: 'bold' }}>{lang === 'ja' ? '投稿する' : 'Post Review'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Add Spot Modal */}
      <Modal visible={showAddSpot} animationType="slide" presentationStyle="fullScreen">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.header}>
              <TouchableOpacity onPress={() => { if (activeView === 'map') { setActiveView('form'); } else { setShowAddSpot(false); } }}>
                <Text style={s.backBtn}>{activeView === 'map' ? (lang === 'ja' ? '← 戻る' : '← Back') : (lang === 'ja' ? '← キャンセル' : '← Cancel')}</Text>
              </TouchableOpacity>
              <Text style={s.headerTitle}>{activeView === 'map' ? '📍 Tap to set location' : 'Add a Spot'}</Text>
            </View>
            {activeView === 'map' ? (
              <View style={{ flex: 1 }}>
                <MapView
                  style={{ flex: 1 }}
                  region={newLatitude && newLongitude ? {
                    latitude: newLatitude, longitude: newLongitude,
                    latitudeDelta: 0.05, longitudeDelta: 0.05,
                  } : { latitude: 18.1096, longitude: -77.2975, latitudeDelta: 2.5, longitudeDelta: 2.5 }}
                  onPress={async (e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setNewLatitude(latitude);
                    setNewLongitude(longitude);
                    try {
                      const res = await fetch('https://irie-server.onrender.com/reverse-geocode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat: latitude, lng: longitude }),
                      });
                      const data = await res.json();
                      if (data.ok) setNewAddress(data.address);
                    } catch {}
                  }}
                >
                  {newLatitude && newLongitude && (
                    <Marker coordinate={{ latitude: newLatitude, longitude: newLongitude }}>
                      <View style={s.markerPin}><Text style={{ fontSize: 24 }}>📍</Text></View>
                    </Marker>
                  )}
                </MapView>
                <View style={{ padding: 16, backgroundColor: '#1A1408', borderTopWidth: 1, borderTopColor: '#2A2010' }}>
                  <Text style={{ color: '#8B7355', textAlign: 'center', marginBottom: 12 }}>
                    {newLatitude ? 'ピンを設置しました！確認または調整してください。' : 'マップをタップしてピンを設置'}
                  </Text>
                  {newLatitude && (
                    <TouchableOpacity style={s.submitBtn} onPress={() => setActiveView('form')}>
                      <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>{lang === 'ja' ? '✅ 場所を確定' : '✅ Confirm Location'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={s.label}>{lang === 'ja' ? '名前 *' : 'Name *'}</Text>
              <TextInput style={s.input} value={newName} onChangeText={setNewName} placeholder={lang === 'ja' ? '例：スコッチーズ・ジャーク・センター' : 'e.g. Scotchies Jerk Centre'} placeholderTextColor={COLORS.muted} />
              <Text style={s.label}>{lang === 'ja' ? 'カテゴリー' : 'Category'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                  <TouchableOpacity key={cat.key} style={[s.chip, newCategory === cat.key && s.chipActive]} onPress={() => setNewCategory(cat.key)}>
                    <Text style={[s.chipText, newCategory === cat.key && s.chipTextActive]}>{lang === 'ja' ? cat.label_ja : cat.label_en}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.label}>{lang === 'ja' ? '説明 *' : 'Description *'}</Text>
              <TextInput style={[s.input, { height: 80 }]} value={newDescription} onChangeText={setNewDescription} multiline placeholder={lang === 'ja' ? 'どんな魅力がありますか？' : 'What makes it special?'} placeholderTextColor={COLORS.muted} />
              <Text style={s.label}>{lang === 'ja' ? '日本語説明（任意）' : 'Japanese Description (optional)'}</Text>
              <TextInput style={[s.input, { height: 80 }]} value={newDescriptionJa} onChangeText={setNewDescriptionJa} multiline placeholder={lang === 'ja' ? '日本語で説明を入力...' : 'Description in Japanese...'} placeholderTextColor={COLORS.muted} />
              <Text style={s.label}>{lang === 'ja' ? '住所' : 'Address'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[s.input, { flex: 1 }]} value={newAddress} onChangeText={setNewAddress} placeholder={lang === 'ja' ? '住所（ジャマイカ）' : 'Street address, Jamaica'} placeholderTextColor={COLORS.muted} />
                <TouchableOpacity
                  style={{ backgroundColor: COLORS.gold, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center', marginBottom: 4, marginTop: 4 }}
                  onPress={async () => {
                    if (!newAddress) return;
                    try {
                      const geoRes = await fetch('https://irie-server.onrender.com/geocode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address: newAddress }),
                      });
                      const geoData = await geoRes.json();
                      if (geoData.ok) {
                        setNewLatitude(geoData.lat);
                        setNewLongitude(geoData.lng);
                      }
                      setActiveView('map');
                    } catch {
                      setActiveView('map');
                    }
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>🔍</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.label}>{lang === 'ja' ? '教区' : 'Parish'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {PARISHES.map(p => (
                  <TouchableOpacity key={p} style={[s.chip, newParish === p && s.chipActive]} onPress={() => setNewParish(p)}>
                    <Text style={[s.chipText, newParish === p && s.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.label}>{lang === 'ja' ? '📍 場所（マップでタップ）' : '📍 Location (tap map to set)'}</Text>
              <TouchableOpacity style={[s.input, { justifyContent: 'center', height: 44 }]} onPress={() => setActiveView('map')}>
                <Text style={{ color: newLatitude ? '#C8860A' : '#8B7355' }}>
                  {newLatitude ? (lang === 'ja' ? '✅ 場所設定済み！タップで調整' : '✅ Location set! Tap to adjust') : (lang === 'ja' ? '🗺️ タップして場所を設定' : '🗺️ Tap to pick location on map')}
                </Text>
              </TouchableOpacity>
              <Text style={s.label}>{lang === 'ja' ? 'お名前' : 'Your Name'}</Text>
              <TextInput style={s.input} value={newSubmittedBy} onChangeText={setNewSubmittedBy} placeholder={lang === 'ja' ? '匿名' : 'Anonymous'} placeholderTextColor={COLORS.muted} />
              <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleAddSpot} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>{lang === 'ja' ? '🌴 ジャマイカガイドに追加' : '🌴 Add to Jamaica Guide'}</Text>}
              </TouchableOpacity>
            </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Location Picker Fullscreen Modal */}
      <Modal visible={showLocationPicker} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#0D0A05' }}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Text style={s.backBtn}>{lang === 'ja' ? '← キャンセル' : '← Cancel'}</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>📍 Tap to set location</Text>
            {newLatitude && (
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Text style={{ color: '#2D5A1B', fontSize: 15, fontWeight: 'bold' }}>{lang === 'ja' ? '✅ 完了' : '✅ Done'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <MapView
            style={{ flex: 1 }}
            region={newLatitude && newLongitude ? {
              latitude: newLatitude,
              longitude: newLongitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : {
              latitude: 18.1096,
              longitude: -77.2975,
              latitudeDelta: 2.5,
              longitudeDelta: 2.5,
            }}
            onPress={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setNewLatitude(latitude);
              setNewLongitude(longitude);
              try {
                const res = await fetch('https://irie-server.onrender.com/reverse-geocode', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lat: latitude, lng: longitude }),
                });
                const data = await res.json();
                if (data.ok) setNewAddress(data.address);
              } catch {}
            }}
          >
            {newLatitude && newLongitude && (
              <Marker coordinate={{ latitude: newLatitude, longitude: newLongitude }}>
                <View style={s.markerPin}>
                  <Text style={{ fontSize: 24 }}>📍</Text>
                </View>
              </Marker>
            )}
          </MapView>
          <View style={{ padding: 16, backgroundColor: '#1A1408', borderTopWidth: 1, borderTopColor: '#2A2010' }}>
            <Text style={{ color: '#8B7355', textAlign: 'center', fontSize: 13 }}>
              {newLatitude ? (lang === 'ja' ? '✅ ピン設置完了！完了を押すか調整' : '✅ Pin placed! Tap Done or adjust the pin') : (lang === 'ja' ? 'マップをタップしてピンを設置' : 'Tap anywhere on the map to place your pin')}
            </Text>
            {newLatitude && (
              <TouchableOpacity
                style={{ backgroundColor: '#C8860A', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 }}
                onPress={() => setShowLocationPicker(false)}
              >
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>✅ Confirm Location</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Yardie Modal */}
      <Modal visible={showYardie} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => setShowYardie(false)}><Text style={s.backBtn}>← Close</Text></TouchableOpacity>
            <Text style={s.headerTitle}>🗣️ Yardie Guide</Text>
          </View>
          <ScrollView ref={chatScrollRef} style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {chatMessages.map((msg, i) => (
              <View key={i} style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
                {msg.role === 'assistant' && <Text style={{ color: COLORS.gold, fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>🇯🇲 Yardie</Text>}
                <Text style={{ color: COLORS.text, fontSize: 14, lineHeight: 20 }}>{msg.content}</Text>
              </View>
            ))}
            {chatLoading && <View style={s.bubbleBot}><ActivityIndicator color={COLORS.gold} size="small" /></View>}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border }}>
              <TextInput style={s.chatInput} value={chatInput} onChangeText={setChatInput} placeholder={lang === 'ja' ? 'ヤーディーに何でも聞く...' : 'Ask Yardie anything...'} placeholderTextColor={COLORS.muted} onSubmitEditing={sendYardieMessage} />
              <TouchableOpacity style={{ backgroundColor: COLORS.gold, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center' }} onPress={sendYardieMessage}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>{lang === 'ja' ? '送信' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  headerTitle: { color: '#C8860A', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  backBtn: { color: '#C8860A', fontSize: 15 },
  toggleRow: { flexDirection: 'row', margin: 12, backgroundColor: '#1A1408', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#2A2010' },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: '#C8860A' },
  toggleText: { color: '#8B7355', fontSize: 14, fontWeight: 'bold' },
  toggleTextActive: { color: '#000' },
  categoryBar: { paddingHorizontal: 12, paddingBottom: 10, maxHeight: 50 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#2A2010', marginRight: 8, backgroundColor: '#1A1408' },
  chipActive: { backgroundColor: '#C8860A', borderColor: '#C8860A' },
  chipText: { color: '#8B7355', fontSize: 13 },
  chipTextActive: { color: '#000', fontWeight: 'bold' },
  list: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  card: { backgroundColor: '#1A1408', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2010' },
  spotName: { color: '#F5E6C8', fontSize: 16, fontWeight: 'bold' },
  spotMuted: { color: '#8B7355', fontSize: 13, marginTop: 2 },
  likeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#2A1515', borderWidth: 1, borderColor: '#4A2020' },
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#C8860A', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28 },
  modal: { flex: 1, backgroundColor: '#0D0A05' },
  sectionTitle: { color: '#C8860A', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#0A0806', borderWidth: 1, borderColor: '#2A2010', borderRadius: 8, color: '#F5E6C8', padding: 10, fontSize: 14, marginBottom: 4, marginTop: 4 },
  submitBtn: { backgroundColor: '#C8860A', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 14 },
  label: { color: '#8B7355', fontSize: 13, marginBottom: 4, marginTop: 12 },
  bubble: { borderRadius: 12, padding: 12, marginBottom: 10, maxWidth: '85%' },
  bubbleBot: { backgroundColor: '#1A1408', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#2A2010' },
  bubbleUser: { backgroundColor: '#2D5A1B', alignSelf: 'flex-end' },
  chatInput: { flex: 1, backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#2A2010', borderRadius: 20, color: '#F5E6C8', paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  markerPin: { backgroundColor: '#1A1408', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#C8860A' },
});
