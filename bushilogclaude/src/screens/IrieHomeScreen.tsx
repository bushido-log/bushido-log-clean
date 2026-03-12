import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  onNavigate: (screen: 'patwa' | 'culture' | 'jamaica' | 'quiz') => void;
};

const MENU_ITEMS = [
  {
    screen: 'patwa' as const,
    icon: '🎙',
    title: 'Ras Tutor',
    sub: 'AI Patois & Language',
    tag: 'SPEAK',
    color: '#C8860A',
    bg: '#2A1A00',
  },
  {
    screen: 'culture' as const,
    icon: '♪',
    title: 'Culture',
    sub: 'History & Artists',
    tag: 'LEARN',
    color: '#4A7C3F',
    bg: '#0A1A08',
  },
  {
    screen: 'jamaica' as const,
    icon: '✦',
    title: 'Jamaica Guide',
    sub: 'Spots & Reviews',
    tag: 'EXPLORE',
    color: '#8B3A3A',
    bg: '#1A0808',
  },
  {
    screen: 'quiz' as const,
    icon: '★',
    title: 'Quiz',
    sub: 'Test Your Knowledge',
    tag: 'PLAY',
    color: '#5C4A1E',
    bg: '#1A1208',
  },
];

export default function IrieHomeScreen({ onNavigate }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = MENU_ITEMS.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + i * 120,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.grainOverlay} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.vintageBadge}>
            <View style={styles.vintageLine} />
            <Text style={styles.vintageBadgeText}>ROOTS & CULTURE</Text>
            <View style={styles.vintageLine} />
          </View>

          <View style={styles.recordContainer}>
            <View style={styles.recordOuter}>
              <View style={styles.recordMiddle}>
                <Text style={styles.flagEmoji}>🇯🇲</Text>
              </View>
            </View>
          </View>


          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerStar}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.yearLabel}>EST. KINGSTON, JAMAICA</Text>
        </Animated.View>

        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, i) => (
            <Animated.View
              key={item.screen}
              style={{
                opacity: cardAnims[i],
                transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              }}
            >
              <TouchableOpacity
                style={[styles.card, { backgroundColor: item.bg, borderColor: item.color }]}
                onPress={() => onNavigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.cardTag, { color: item.color }]}>{item.tag}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSub}>{item.sub}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.cardIcon, { color: item.color }]}>{item.icon}</Text>
                    <Text style={[styles.cardArrow, { color: item.color }]}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.footerStar}>✦ ✦ ✦</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.footerText}>ONE LOVE · ONE HEART · ONE DESTINY</Text>
          <Text style={styles.footerSubText}>Likkle more, bredren 🌿</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  grainOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent', opacity: 0.03, zIndex: 1 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 28, paddingHorizontal: 24, backgroundColor: '#0D0A05', borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  vintageBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  vintageLine: { width: 40, height: 1, backgroundColor: '#5C4A1E' },
  vintageBadgeText: { color: '#5C4A1E', fontSize: 10, fontWeight: '700', letterSpacing: 4 },
  recordContainer: { marginBottom: 16 },
  recordOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A1408', borderWidth: 2, borderColor: '#3A2A10', justifyContent: 'center', alignItems: 'center', shadowColor: '#C8860A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 },
  recordMiddle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0D0A05', borderWidth: 1, borderColor: '#2A2010', justifyContent: 'center', alignItems: 'center' },
  flagEmoji: { fontSize: 36 },
  title: { fontSize: 64, fontWeight: '900', color: '#C8860A', letterSpacing: 12, textShadowColor: 'rgba(200, 134, 10, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  subtitle: { color: '#6B5A2A', fontSize: 12, letterSpacing: 5, marginTop: 4, marginBottom: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '70%', gap: 10, marginBottom: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2010' },
  dividerStar: { color: '#5C4A1E', fontSize: 12 },
  yearLabel: { color: '#3A2A10', fontSize: 9, letterSpacing: 4, fontWeight: '700' },
  menuContainer: { padding: 16, gap: 12 },
  card: { borderRadius: 4, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  cardAccent: { width: 3 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 18, paddingLeft: 16 },
  cardLeft: { flex: 1 },
  cardTag: { fontSize: 9, fontWeight: '800', letterSpacing: 4, marginBottom: 6 },
  cardTitle: { color: '#E8D8A0', fontSize: 22, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  cardSub: { color: '#5C5040', fontSize: 12, letterSpacing: 1 },
  cardRight: { alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 28, fontWeight: '300' },
  cardArrow: { fontSize: 22, fontWeight: '300' },
  footer: { alignItems: 'center', padding: 32, gap: 8 },
  footerDivider: { flexDirection: 'row', alignItems: 'center', width: '80%', gap: 10, marginBottom: 8 },
  footerStar: { color: '#2A2010', fontSize: 10, letterSpacing: 4 },
  footerText: { color: '#3A2A10', fontSize: 10, letterSpacing: 4, fontWeight: '700' },
  footerSubText: { color: '#2A1A08', fontSize: 12 },
});
