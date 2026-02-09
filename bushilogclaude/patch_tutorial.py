#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Ritual Tutorial (after onboarding, first time only)"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD TUTORIAL KEY + STATE
# ============================================
content = content.replace(
    "const KEGARE_KEY = 'BUSHIDO_KEGARE_V1';",
    "const KEGARE_KEY = 'BUSHIDO_KEGARE_V1';\nconst TUTORIAL_KEY = 'BUSHIDO_TUTORIAL_DONE';"
)

tutorial_state = """
  // ===== Ritual Tutorial =====
  const [tutorialPhase, setTutorialPhase] = useState<number | null>(null);
  const [tutorialDone, setTutorialDone] = useState(false);
  const tutorialShadowAnim = useRef(new Animated.Value(0)).current;
"""

content = content.replace(
    "  // ===== IMINASHI (Anti-cheat Yokai) =====",
    tutorial_state + "  // ===== IMINASHI (Anti-cheat Yokai) ====="
)
print('1/5 Tutorial state OK')

# ============================================
# 2. ADD TUTORIAL LOAD + FUNCTIONS
# ============================================
tutorial_functions = """
  // ===== Tutorial Functions =====
  const startTutorial = async () => {
    const done = await AsyncStorage.getItem(TUTORIAL_KEY);
    if (done === 'true') {
      setTutorialDone(true);
      return;
    }
    setTutorialPhase(0);
  };

  const advanceTutorial = async (phase: number) => {
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 5) {
      // Tutorial complete
      setTutorialPhase(null);
      setTutorialDone(true);
      await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      return;
    }
    setTutorialPhase(phase);
  };

  const skipTutorial = async () => {
    playTapSound();
    setTutorialPhase(null);
    setTutorialDone(true);
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const triggerShadowFlicker = () => {
    Animated.sequence([
      Animated.timing(tutorialShadowAnim, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      Animated.timing(tutorialShadowAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

"""

content = content.replace(
    "  // ===== Yokai Tab Presence System =====",
    tutorial_functions + "  // ===== Yokai Tab Presence System ====="
)
print('2/5 Tutorial functions OK')

# ============================================
# 3. TRIGGER TUTORIAL AFTER ONBOARDING
# ============================================
# Hook into setIsOnboarding(false) at line ~6015 and ~6039
old_onboard1 = "                setIsOnboarding(false);\n"
# We need to add startTutorial() after onboarding finishes
# But be careful not to replace all instances
# Target the onboarding completion points (step 4)

# Better approach: add to useEffect that checks onboarding
tutorial_trigger = """
  // Start tutorial after onboarding
  useEffect(() => {
    if (!isOnboarding && !tutorialDone && tutorialPhase === null) {
      startTutorial();
    }
  }, [isOnboarding]);
"""

content = content.replace(
    "  // ===== Tutorial Functions =====",
    "  // ===== Tutorial Functions =====\n" + tutorial_trigger
)
print('3/5 Tutorial trigger OK')

# ============================================
# 4. ADD TUTORIAL SCREENS (MODAL)
# ============================================
skip_quotes = [
    '急ぐのも、修行だ',
    '道はいつでも開いている',
    '戻りたくなったら、また来い',
]

tutorial_modal = '''
      {/* Ritual Tutorial */}
      {tutorialPhase !== null && (
        <Modal visible={true} animationType="fade" transparent={tutorialPhase === 3}>

          {/* Phase 0: Silent opening */}
          {tutorialPhase === 0 && (
            <Pressable
              onPress={() => advanceTutorial(1)}
              style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}
            >
              <Image
                source={DOJO_LOGO}
                style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 40, opacity: 0.8 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '700', letterSpacing: 2 }}>
                ここは、修行の場だ
              </Text>
            </Pressable>
          )}

          {/* Phase 1: First action */}
          {tutorialPhase === 1 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginBottom: 16 }}>
                \u2500\u2500 \u30b5\u30e0\u30e9\u30a4\u30ad\u30f3\u30b0 \u2500\u2500
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 40, lineHeight: 36 }}>
                \u307e\u305a\u306f\u3001\u4eca\u65e5\u3092\u523b\u3081
              </Text>

              <Pressable
                onPress={() => {
                  advanceTutorial(2);
                }}
                style={({ pressed }) => [{
                  backgroundColor: pressed ? '#1a8a6a' : '#2dd4a8',
                  paddingVertical: 22,
                  paddingHorizontal: 60,
                  borderRadius: 16,
                  marginBottom: 30,
                }]}
              >
                <Text style={{ color: '#000', fontSize: 20, fontWeight: '900' }}>
                  \u4eca\u65e5\u306e\u76ee\u6a19\u3092\u66f8\u304f
                </Text>
              </Pressable>

              <Pressable onPress={skipTutorial} style={{ padding: 12 }}>
                <Text style={{ color: '#444', fontSize: 13 }}>
                  \u4eca\u306f\u3044\u3044
                </Text>
              </Pressable>
            </View>
          )}

          {/* Phase 2: Go to goal tab */}
          {tutorialPhase === 2 && (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
              <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 30, lineHeight: 30 }}>
                \u76ee\u6a19\u3092\u66f8\u3044\u3066\u4fdd\u5b58\u3059\u308b\u3068{'\n'}\u5996\u602a\u304c\u5012\u308c\u308b
              </Text>
              <Pressable
                onPress={() => {
                  setTutorialPhase(null);
                  setShowStartScreen(false);
                  setTab('goal');
                  // After goal save, tutorial will continue
                  setTimeout(() => {
                    if (tutorialPhase === null && !tutorialDone) {
                      setTutorialPhase(3);
                    }
                  }, 30000);
                }}
                style={({ pressed }) => [{
                  backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                  paddingVertical: 18,
                  paddingHorizontal: 50,
                  borderRadius: 14,
                }]}
              >
                <Text style={{ color: '#000', fontSize: 18, fontWeight: '900' }}>
                  \u76ee\u6a19\u30bf\u30d6\u3078
                </Text>
              </Pressable>
            </View>
          )}

          {/* Phase 3: Shadow flicker (transparent overlay) */}
          {tutorialPhase === 3 && (
            <Pressable
              onPress={() => advanceTutorial(4)}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
              <Animated.View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#0a0a0a',
                opacity: tutorialShadowAnim,
              }} />
            </Pressable>
          )}

          {/* Phase 4: Inner world hint */}
          {tutorialPhase === 4 && (
            <Pressable
              onPress={() => advanceTutorial(5)}
              style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 }}
            >
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginBottom: 16 }}>
                \u2500\u2500 \u30b5\u30e0\u30e9\u30a4\u30ad\u30f3\u30b0 \u2500\u2500
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 40 }}>
                \u4fee\u884c\u306b\u306f\u3001\u8868\u3068\u88cf\u304c\u3042\u308b
              </Text>
              <View style={{
                borderWidth: 1, borderColor: '#D4AF37', borderRadius: 20, padding: 3,
                shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15,
              }}>
                <Image
                  source={DOJO_LOGO}
                  style={{ width: 80, height: 80, borderRadius: 18, opacity: 0.9 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ color: '#555', fontSize: 12, marginTop: 20 }}>
                \u30bf\u30c3\u30d7\u3067\u7d9a\u3051\u308b
              </Text>
            </Pressable>
          )}

        </Modal>
      )}
'''

content = content.replace(
    "      {/* IMINASHI Overlay */}",
    tutorial_modal + "\n      {/* IMINASHI Overlay */}"
)
print('4/5 Tutorial modal OK')

# ============================================
# 5. HOOK GOAL SAVE TO ADVANCE TUTORIAL
# ============================================
old_goal_hook = """    showSaveSuccess('\u76ee\u6a19\u3092\u523b\u3093\u3060\u3002\u4eca\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('goal', 15);"""

new_goal_hook = """    showSaveSuccess('\u76ee\u6a19\u3092\u523b\u3093\u3060\u3002\u4eca\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('goal', 15);
    // Tutorial: advance after first goal save
    if (!tutorialDone && tutorialPhase === null) {
      setTimeout(() => setTutorialPhase(3), 2500);
    }"""

if old_goal_hook in content:
    content = content.replace(old_goal_hook, new_goal_hook, 1)
    print('5/5 Tutorial goal hook OK')
else:
    print('5/5 SKIP - goal hook not found')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== RITUAL TUTORIAL COMPLETE ===')
print('  Phase 0: Black screen + "ここは、修行の場だ"')
print('  Phase 1: "まずは、今日を刻め" + skip')
print('  Phase 2: Go to goal tab -> save -> yokai defeats')
print('  Phase 3: Shadow flicker')
print('  Phase 4: "修行には、表と裏がある" + glowing logo')
print('  Stored in AsyncStorage, only runs once')
