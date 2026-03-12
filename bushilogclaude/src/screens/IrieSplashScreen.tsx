import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = { onFinish: () => void };

export default function IrieSplashScreen({ onFinish }: Props) {
  const flagAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(flagAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(subAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeOut, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.Text style={[styles.flag, {
        opacity: flagAnim,
        transform: [{ scale: flagAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
      }]}>🇯🇲</Animated.Text>

      <Animated.Text style={[styles.title, {
        opacity: titleAnim,
        transform: [{ scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
      }]}>IRIE</Animated.Text>

      <Animated.View style={{ opacity: subAnim, alignItems: 'center', gap: 8 }}>
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.star}>✦</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.sub}>Reggae · Jamaica · Culture</Text>
        <Text style={styles.tagline}>One Love. One Heart.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0A05',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  flag: { fontSize: 80 },
  title: {
    fontSize: 88,
    fontWeight: '900',
    color: '#C8860A',
    letterSpacing: 16,
    textShadowColor: 'rgba(200, 134, 10, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: 200, gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#3A2A10' },
  star: { color: '#5C4A1E', fontSize: 12 },
  sub: { color: '#6B5A2A', fontSize: 13, letterSpacing: 5 },
  tagline: { color: '#3A2A10', fontSize: 11, letterSpacing: 4, marginTop: 4 },
});
