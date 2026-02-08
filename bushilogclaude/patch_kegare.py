#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Katana Polishing / Kegare System"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD STORAGE KEY + IMPORTS
# ============================================
content = content.replace(
    "const STATS_KEY = 'BUSHIDO_STATS_V1';",
    "const STATS_KEY = 'BUSHIDO_STATS_V1';\nconst KEGARE_KEY = 'BUSHIDO_KEGARE_V1';"
)
print('1/6 Storage key OK')

# ============================================
# 2. ADD KATANA IMAGES + SOUNDS
# ============================================
katana_assets = """
// ===== Kegare (Katana Polishing) =====
const KATANA_RUSTY = require('./assets/images/katana_rusty.png');
const KATANA_CLEAN = require('./assets/images/katana_clean.png');
const SFX_POLISH = require('./sounds/sfx_polish.mp3');
const SFX_KATANA_SHINE = require('./sounds/sfx_katana_shine.mp3');

const KEGARE_QUOTES = [
  '\u5200\u3092\u78e8\u304f\u8005\u3001\u5fc3\u3082\u78e8\u304b\u308c\u308b',
  '\u9306\u3073\u305f\u5200\u3067\u306f\u3001\u5df1\u306f\u65ac\u308c\u306c',
  '\u65e5\u3005\u306e\u624b\u5165\u308c\u304c\u3001\u771f\u306e\u5f37\u3055\u3092\u751f\u3080',
  '\u6b66\u58eb\u306e\u671d\u306f\u3001\u5200\u3068\u5171\u306b\u59cb\u307e\u308b',
  '\u78e8\u304b\u308c\u305f\u5203\u306f\u3001\u8ff7\u3044\u3092\u65ad\u3064',
];

"""

content = content.replace(
    "// ===== YOKAI SYSTEM =====",
    katana_assets + "// ===== YOKAI SYSTEM ====="
)
print('2/6 Katana assets OK')

# ============================================
# 3. ADD KEGARE STATE
# ============================================
kegare_state = """
  // ===== Kegare (Katana Polishing) System =====
  const [showKatanaPolish, setShowKatanaPolish] = useState(false);
  const [polishCount, setPolishCount] = useState(0);
  const [polishRequired, setPolishRequired] = useState(5);
  const [polishComplete, setPolishComplete] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [kegareQuote, setKegareQuote] = useState('');
  const katanaGlowAnim = useRef(new Animated.Value(0)).current;
  const katanaScaleAnim = useRef(new Animated.Value(1)).current;
"""

content = content.replace(
    "  // ===== Yokai Defeat System =====",
    kegare_state + "\n  // ===== Yokai Defeat System ====="
)
print('3/6 Kegare state OK')

# ============================================
# 4. ADD KEGARE LOAD + FUNCTIONS (before yokai functions)
# ============================================
kegare_functions = """
  // ===== Kegare Functions =====
  const checkKegare = async () => {
    try {
      const json = await AsyncStorage.getItem(KEGARE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (json) {
        const data = JSON.parse(json);
        if (data.lastDate === today) {
          setShowKatanaPolish(false);
          return;
        }
        
        const lastDate = new Date(data.lastDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          setLoginStreak((data.streak || 0) + 1);
          setPolishRequired(3);
        } else if (diffDays <= 3) {
          setLoginStreak(1);
          setPolishRequired(5);
        } else if (diffDays <= 7) {
          setLoginStreak(1);
          setPolishRequired(8);
        } else {
          setLoginStreak(1);
          setPolishRequired(12);
        }
      } else {
        setLoginStreak(1);
        setPolishRequired(5);
      }
      
      setPolishCount(0);
      setPolishComplete(false);
      setShowKatanaPolish(true);
      setKegareQuote(KEGARE_QUOTES[Math.floor(Math.random() * KEGARE_QUOTES.length)]);
    } catch (e) {
      console.log('Kegare check error', e);
    }
  };

  const handlePolish = async () => {
    if (polishComplete) return;
    
    const newCount = polishCount + 1;
    setPolishCount(newCount);
    
    try {
      const { sound } = await Audio.Sound.createAsync(SFX_POLISH);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {}
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(katanaScaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(katanaScaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    
    if (newCount >= polishRequired) {
      setPolishComplete(true);
      
      try {
        const { sound } = await Audio.Sound.createAsync(SFX_KATANA_SHINE);
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s: any) => {
          if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
        });
      } catch (e) {}
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(katanaGlowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(katanaGlowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
      
      const streakXp = loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5;
      await addXpWithLevelCheck(streakXp);
      
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(KEGARE_KEY, JSON.stringify({
        lastDate: today,
        streak: loginStreak,
      }));
    }
  };

  const dismissKatanaPolish = () => {
    setShowKatanaPolish(false);
    katanaGlowAnim.setValue(0);
    katanaScaleAnim.setValue(1);
  };

"""

content = content.replace(
    "  // ===== Yokai Encounter Functions =====",
    kegare_functions + "  // ===== Yokai Encounter Functions ====="
)
print('4/6 Kegare functions OK')

# ============================================
# 5. TRIGGER checkKegare on app load (after handleEnterDojo)
# ============================================
old_enter = """  const handleEnterDojo = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(KATANA_SOUND);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('katana sound error', e);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // 150ms\u5f8c\u306b\u9077\u79fb
    setTimeout(async () => {
      setShowDojoGate(false);
      // Intro\u3092\u30b9\u30ad\u30c3\u30d7\u3057\u3066\u3044\u306a\u3051\u308c\u3070\u8868\u793a
      if (!introSkipped) {
        setShowIntro(true);
      }
    }, 150);
  };"""

new_enter = """  const handleEnterDojo = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(KATANA_SOUND);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('katana sound error', e);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // 150ms\u5f8c\u306b\u9077\u79fb
    setTimeout(async () => {
      setShowDojoGate(false);
      // \u7a62\u308c\u30c1\u30a7\u30c3\u30af
      await checkKegare();
      // Intro\u3092\u30b9\u30ad\u30c3\u30d7\u3057\u3066\u3044\u306a\u3051\u308c\u3070\u8868\u793a
      if (!introSkipped) {
        setShowIntro(true);
      }
    }, 150);
  };"""

if old_enter in content:
    content = content.replace(old_enter, new_enter)
    print('5/6 Kegare trigger OK')
else:
    print('5/6 SKIP - handleEnterDojo not found')

# ============================================
# 6. ADD KATANA POLISH MODAL
# ============================================
polish_modal = """
      {/* Katana Polishing Modal */}
      {showKatanaPolish && (
        <Modal visible={true} animationType="fade" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            
            <Text style={{ color: '#8B0000', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
              \u2500\u2500 \u5200\u306e\u624b\u5165\u308c \u2500\u2500
            </Text>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', marginBottom: 24 }}>
              {polishComplete ? '\u78e8\u304d\u4e0a\u3052\u5b8c\u4e86' : '\u5203\u3092\u78e8\u3051'}
            </Text>
            
            <Pressable
              onPress={handlePolish}
              disabled={polishComplete}
              style={{ alignItems: 'center' }}
            >
              <Animated.View style={{
                transform: [{ scale: katanaScaleAnim }],
                opacity: katanaGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                }),
              }}>
                <Animated.View style={{
                  shadowColor: '#D4AF37',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: katanaGlowAnim,
                  shadowRadius: 30,
                }}>
                  <Image
                    source={polishComplete ? KATANA_CLEAN : KATANA_RUSTY}
                    style={{ width: 280, height: 280 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>

            {!polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{ width: 200, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{
                    height: '100%',
                    width: (polishCount / polishRequired * 100) + '%',
                    backgroundColor: '#D4AF37',
                    borderRadius: 4,
                  }} />
                </View>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
                  {polishCount} / {polishRequired}
                </Text>
                <Text style={{ color: '#444', fontSize: 12, marginTop: 16 }}>
                  \u5200\u3092\u30bf\u30c3\u30d7\u3057\u3066\u78e8\u3051
                </Text>
              </View>
            )}

            {polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  width: '100%',
                  borderLeftWidth: 3,
                  borderLeftColor: '#D4AF37',
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: 12, marginBottom: 4 }}>\u30b5\u30e0\u30e9\u30a4\u30ad\u30f3\u30b0\u306e\u8a00\u8449</Text>
                  <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic' }}>
                    \u300c{kegareQuote}\u300d
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold' }}>
                    +{loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5} XP
                  </Text>
                </View>

                {loginStreak > 1 && (
                  <Text style={{ color: '#f59e0b', fontSize: 14, marginBottom: 16 }}>
                    \U0001f525 {loginStreak}\u65e5\u9023\u7d9a\u30ed\u30b0\u30a4\u30f3\uff01
                  </Text>
                )}

                <Pressable
                  onPress={dismissKatanaPolish}
                  style={({ pressed }) => [{
                    backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                    paddingVertical: 18,
                    paddingHorizontal: 50,
                    borderRadius: 14,
                  }]}
                >
                  <Text style={{ color: '#000', fontSize: 18, fontWeight: '900' }}>\u9053\u5834\u3078</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>
      )}
"""

content = content.replace(
    "      {/* Yokai Defeat Modal */}",
    polish_modal + "\n      {/* Yokai Defeat Modal */}"
)
print('6/6 Katana polish modal OK')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== KEGARE SYSTEM COMPLETE ===')
print('  - Katana polishing screen on login')
print('  - Rust level based on days since last login')
print('  - Tap to polish with sound + haptics')
print('  - Streak XP: 1day=5, 3day=10, 7day=20')
print('  - Samurai King quote on completion')
print('  - Golden glow animation when complete')
