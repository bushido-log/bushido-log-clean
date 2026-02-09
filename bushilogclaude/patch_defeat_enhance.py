#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Enhanced yokai defeat: fullscreen, shake, samurai king quote"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ENHANCE yokaiAttack - stronger shake + multi haptics
# ============================================
old_attack = """  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Shake animation
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXpWithLevelCheck(yokaiXp);
    }, 1200);
  };"""

new_attack = """  const SAMURAI_KING_DEFEAT_QUOTES = [
    '\u3088\u304f\u3084\u3063\u305f\u3002\u3060\u304c\u3001\u6cb9\u65ad\u3059\u308b\u306a',
    '\u305d\u308c\u304c\u304a\u524d\u306e\u529b\u3060',
    '\u884c\u52d5\u3057\u305f\u8005\u3060\u3051\u304c\u3001\u659c\u308c\u308b',
    '\u4fee\u884c\u306f\u7d9a\u304f\u3002\u6b62\u307e\u308b\u306a',
    '\u4e00\u592a\u5200\u3001\u898b\u4e8b\u3060',
    '\u5f31\u3044\u5fc3\u3092\u65ac\u3063\u305f\u306e\u306f\u3001\u304a\u524d\u81ea\u8eab\u3060',
  ];

  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();

    // Triple haptic burst for impact
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);

    // Aggressive shake animation
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();

    // Extra haptic during shake
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 500);

    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
      addXpWithLevelCheck(yokaiXp);
    }, 1500);
  };"""

if old_attack in content:
    content = content.replace(old_attack, new_attack)
    print('1/2 Enhanced yokaiAttack OK')
else:
    print('1/2 SKIP - yokaiAttack not found')

# ============================================
# 2. REPLACE YOKAI MODAL WITH FULLSCREEN VERSION
# ============================================
old_modal_start = """      {yokaiEncounter && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { alignItems: 'center', paddingVertical: 30 }]}>

              {yokaiPhase === 'appear' && (
                <>
                  <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>\u2620\ufe0f \u5996\u602a\u51fa\u73fe\uff01</Text>
                  <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 12 }}>{yokaiEncounter.name}</Text>

                  <View style={{ width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a', marginBottom: 16 }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a0a0a', borderRadius: 12, padding: 14, marginBottom: 20, width: '100%', borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                    <Text style={{ color: '#ef4444', fontSize: 16, fontStyle: 'italic', textAlign: 'center' }}>
                      \u300c{yokaiEncounter.quote}\u300d
                    </Text>
                  </View>

                  <Pressable
                    onPress={yokaiAttack}
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#8B6914' : '#D4AF37', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 14 }]}
                  >
                    <Text style={{ color: '#000', fontSize: 22, fontWeight: '900' }}>\u2694\ufe0f \u65ac\u308b\uff01</Text>
                  </Pressable>
                </>
              )}

              {yokaiPhase === 'attack' && (
                <>
                  <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>\u2694\ufe0f \u4e00\u592a\u5200\uff01</Text>
                  <Animated.View style={{ transform: [{ translateX: yokaiShakeAnim }], width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a' }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </Animated.View>
                </>
              )}

              {yokaiPhase === 'defeated' && (
                <>
                  <Text style={{ color: '#D4AF37', fontSize: 32, fontWeight: '900', marginBottom: 8 }}>\u8a0e\u4f10\u6210\u529f\uff01</Text>
                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{yokaiEncounter.name}\u3092\u5012\u3057\u305f\uff01</Text>

                  <View style={{ width: 180, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#555', backgroundColor: '#1a0a0a', marginBottom: 16 }}>
                    <Video
                      source={YOKAI_LOSE_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, marginBottom: 16, width: '100%', borderLeftWidth: 3, borderLeftColor: '#D4AF37' }}>
                    <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{yokaiEncounter.name}\u306e\u6700\u671f</Text>
                    <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic', textAlign: 'center' }}>
                      \u300c{yokaiEncounter.defeatQuote}\u300d
                    </Text>
                  </View>

                  <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>+{yokaiXp} XP</Text>

                  <Pressable
                    onPress={closeYokaiModal}
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#8B6914' : '#D4AF37', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14 }]}
                  >
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>\u7d9a\u3051\u308b</Text>
                  </Pressable>
                </>
              )}

            </View>
          </View>"""

new_modal = """      {yokaiEncounter && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>

              {yokaiPhase === 'appear' && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700', letterSpacing: 3, marginBottom: 12 }}>\u2620\ufe0f \u5996\u602a\u51fa\u73fe \u2620\ufe0f</Text>
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 20 }}>{yokaiEncounter.name}</Text>

                  <View style={{ width: 240, height: 240, borderRadius: 24, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a', marginBottom: 24, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20 }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a0808', borderRadius: 14, padding: 18, marginBottom: 30, width: '90%', borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
                    <Text style={{ color: '#ef4444', fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 28 }}>
                      \u300c{yokaiEncounter.quote}\u300d
                    </Text>
                  </View>

                  <Pressable
                    onPress={yokaiAttack}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                      paddingVertical: 22,
                      paddingHorizontal: 70,
                      borderRadius: 16,
                      shadowColor: '#D4AF37',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: pressed ? 0.3 : 0.7,
                      shadowRadius: 15,
                    }]}
                  >
                    <Text style={{ color: '#000', fontSize: 26, fontWeight: '900' }}>\u2694\ufe0f \u65ac\u308b\uff01</Text>
                  </Pressable>
                </View>
              )}

              {yokaiPhase === 'attack' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#D4AF37', fontSize: 36, fontWeight: '900', marginBottom: 24, letterSpacing: 4 }}>\u2694\ufe0f \u4e00\u592a\u5200\uff01</Text>
                  <Animated.View style={{
                    transform: [{ translateX: yokaiShakeAnim }],
                    width: 260, height: 260, borderRadius: 24, overflow: 'hidden',
                    borderWidth: 4, borderColor: '#D4AF37', backgroundColor: '#1a0a0a',
                    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 25,
                  }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </Animated.View>
                </View>
              )}

              {yokaiPhase === 'defeated' && (
                <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }} style={{ width: '100%' }}>
                  <Text style={{ color: '#D4AF37', fontSize: 40, fontWeight: '900', marginBottom: 6, letterSpacing: 2 }}>\u8a0e\u4f10\u6210\u529f\uff01</Text>
                  <Text style={{ color: '#aaa', fontSize: 16, marginBottom: 24 }}>{yokaiEncounter.name}\u3092\u5012\u3057\u305f\uff01</Text>

                  <View style={{ width: 280, height: 280, borderRadius: 24, overflow: 'hidden', borderWidth: 3, borderColor: '#333', backgroundColor: '#0a0a0a', marginBottom: 24 }}>
                    <Video
                      source={YOKAI_LOSE_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#0a0a1a', borderRadius: 14, padding: 18, marginBottom: 16, width: '90%', borderLeftWidth: 4, borderLeftColor: '#555' }}>
                    <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>{yokaiEncounter.name}\u306e\u6700\u671f</Text>
                    <Text style={{ color: '#999', fontSize: 17, fontStyle: 'italic', textAlign: 'center', lineHeight: 26 }}>
                      \u300c{yokaiEncounter.defeatQuote}\u300d
                    </Text>
                  </View>

                  <View style={{ backgroundColor: '#1a1a0a', borderRadius: 14, padding: 18, marginBottom: 20, width: '90%', borderLeftWidth: 4, borderLeftColor: '#D4AF37' }}>
                    <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>\u2500\u2500 \u30b5\u30e0\u30e9\u30a4\u30ad\u30f3\u30b0 \u2500\u2500</Text>
                    <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 26 }}>
                      \u300c{SAMURAI_KING_DEFEAT_QUOTES[Math.floor(Math.random() * SAMURAI_KING_DEFEAT_QUOTES.length)]}\u300d
                    </Text>
                  </View>

                  <Text style={{ color: '#D4AF37', fontSize: 36, fontWeight: '900', marginBottom: 24, textShadowColor: '#D4AF37', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>+{yokaiXp} XP</Text>

                  <Pressable
                    onPress={closeYokaiModal}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                      paddingVertical: 20,
                      paddingHorizontal: 60,
                      borderRadius: 16,
                      shadowColor: '#D4AF37',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                      marginBottom: 20,
                    }]}
                  >
                    <Text style={{ color: '#000', fontSize: 20, fontWeight: '900' }}>\u7d9a\u3051\u308b</Text>
                  </Pressable>
                </ScrollView>
              )}

          </View>"""

if old_modal_start in content:
    content = content.replace(old_modal_start, new_modal)
    print('2/2 Fullscreen yokai modal OK')
else:
    print('2/2 SKIP - modal not found')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== YOKAI DEFEAT ENHANCED ===')
print('  - Fullscreen dark modal')
print('  - Bigger video (240px appear, 260px attack, 280px defeated)')
print('  - Triple haptic burst on attack')
print('  - Aggressive 11-step shake')
print('  - Samurai King quote on defeat')
print('  - Glowing XP text')
print('  - Shadow effects on buttons')
