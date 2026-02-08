#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Yokai Battle System: each feature triggers yokai defeat"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. YOKAI IMAGE IMPORTS + DATA (after ENEMY_IMAGES)
# ============================================
yokai_code = '''
// ===== YOKAI SYSTEM =====
const YOKAI_IMAGES: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/yokai_mikkabozu.png'),
  hyakume: require('./assets/yokai/yokai_hyakume.png'),
  deebu: require('./assets/yokai/yokai_deebu.png'),
  atodeyaru: require('./assets/yokai/yokai_atodeyaru.png'),
  scroll: require('./assets/yokai/yokai_scroll.png'),
  tetsuya: require('./assets/yokai/yokai_tetsuya.png'),
  nidoneel: require('./assets/yokai/yokai_nidoneel.png'),
  hikakuzou: require('./assets/yokai/yokai_hikakuzou.png'),
  peeping: require('./assets/yokai/yokai_peeping.png'),
  mottemiteya: require('./assets/yokai/yokai_mottemiteya.png'),
  moumuri: require('./assets/yokai/yokai_moumuri.png'),
  atamadekkachi: require('./assets/yokai/yokai_atamadekkachi.png'),
};

const YOKAI_LOSE_IMAGES: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/loseyokai_mikkabozu.png'),
  hyakume: require('./assets/yokai/loseyokai_hyakume.png'),
  deebu: require('./assets/yokai/loseyokai_deebu.png'),
  atodeyaru: require('./assets/yokai/loseyokai_atodeyaru.png'),
  scroll: require('./assets/yokai/loseyokai_scroll.png'),
  tetsuya: require('./assets/yokai/loseyokai_tetsuya.png'),
  nidoneel: require('./assets/yokai/loseyokai_nidoneel.png'),
  hikakuzou: require('./assets/yokai/loseyokai_hikakuzou.png'),
  peeping: require('./assets/yokai/loseyokai_peeping.png'),
  mottemiteya: require('./assets/yokai/loseyokai_mottemiteya.png'),
  moumuri: require('./assets/yokai/loseyokai_moumuri.png'),
  atamadekkachi: require('./assets/yokai/loseyokai_atamadekkachi.png'),
};

const YOKAI_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/yokai_mikkabozu.mp4'),
  hyakume: require('./assets/yokai/yokai_hyakume.mp4'),
  deebu: require('./assets/yokai/yokai_deebu.mp4'),
  atodeyaru: require('./assets/yokai/yokai_atodeyaru.mp4'),
  scroll: require('./assets/yokai/yokai_scroll.mp4'),
  tetsuya: require('./assets/yokai/yokai_tetsuya.mp4'),
  nidoneel: require('./assets/yokai/yokai_nidoneel.mp4'),
  hikakuzou: require('./assets/yokai/yokai_hikakuzou.mp4'),
  peeping: require('./assets/yokai/yokai_peeping.mp4'),
  mottemiteya: require('./assets/yokai/yokai_mottemiteya.mp4'),
  moumuri: require('./assets/yokai/yokai_moumuri.mp4'),
  atamadekkachi: require('./assets/yokai/yokai_atamadekkachi.mp4'),
};

const YOKAI_LOSE_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('./assets/yokai/loseyokai_mikkabozu.mp4'),
  hyakume: require('./assets/yokai/loseyokai_hyakume.mp4'),
  deebu: require('./assets/yokai/loseyokai_deebu.mp4'),
  atodeyaru: require('./assets/yokai/loseyokai_atodeyaru.mp4'),
  scroll: require('./assets/yokai/loseyokai_scroll.mp4'),
  tetsuya: require('./assets/yokai/loseyokai_tetsuya.mp4'),
  nidoneel: require('./assets/yokai/loseyokai_nidoneel.mp4'),
  hikakuzou: require('./assets/yokai/loseyokai_hikakuzou.mp4'),
  peeping: require('./assets/yokai/loseyokai_peeping.mp4'),
  mottemiteya: require('./assets/yokai/loseyokai_mottemiteya.mp4'),
  moumuri: require('./assets/yokai/loseyokai_moumuri.mp4'),
  atamadekkachi: require('./assets/yokai/loseyokai_atamadekkachi.mp4'),
};

type YokaiFeature = 'consult' | 'gratitude' | 'goal' | 'review' | 'focus' | 'alarm';

interface YokaiData {
  id: string;
  name: string;
  quote: string;
  defeatQuote: string;
  features: YokaiFeature[];
}

const YOKAI_LIST: YokaiData[] = [
  { id: 'mikkabozu', name: '\\u4e09\\u65e5\\u574a\\u4e3b', quote: '\\u3069\\u3046\\u305b\\u307e\\u305f\\u3084\\u3081\\u308b\\u3093\\u3060\\u308d\\uff1f', defeatQuote: '\\u304f\\u305d\\u2026\\u7d9a\\u3051\\u3084\\u304c\\u3063\\u305f\\u306a\\u2026', features: ['consult', 'goal'] },
  { id: 'hyakume', name: '\\u901a\\u77e5\\u767e\\u76ee', quote: '\\u307b\\u3089\\u3001\\u307e\\u305f\\u901a\\u77e5\\u304c\\u6765\\u305f\\u305e\\uff01', defeatQuote: '\\u304a\\u524d\\u2026\\u901a\\u77e5\\u3092\\u7121\\u8996\\u3067\\u304d\\u308b\\u306e\\u304b\\u2026', features: ['focus'] },
  { id: 'deebu', name: '\\u30c7\\u30fc\\u30d6', quote: '\\u4eca\\u65e5\\u306f\\u3082\\u3046\\u4f11\\u3082\\u3046\\u305c\\u301c', defeatQuote: '\\u3046\\u305d\\u3060\\u308d\\u2026\\u307e\\u3060\\u52d5\\u3051\\u308b\\u306e\\u304b\\u2026', features: ['goal', 'focus'] },
  { id: 'atodeyaru', name: '\\u30a2\\u30c8\\u30c7\\u30e4\\u30eb', quote: '\\u660e\\u65e5\\u3084\\u308c\\u3070\\u3044\\u3044\\u3058\\u3083\\u3093', defeatQuote: '\\u30d0\\u30ab\\u306a\\u2026\\u4eca\\u3084\\u3063\\u3061\\u307e\\u3046\\u306e\\u304b\\u2026', features: ['consult', 'goal'] },
  { id: 'scroll', name: '\\u30b9\\u30af\\u30ed\\u30fc\\u30eb\\u5996\\u602a', quote: '\\u3082\\u3046\\u3061\\u3087\\u3063\\u3068\\u3060\\u3051\\u898b\\u3066\\u3044\\u3053\\u3046\\u3088', defeatQuote: '\\u30b9\\u30de\\u30db\\u3092\\u7f6e\\u3044\\u305f\\u3060\\u3068\\u2026\\uff01', features: ['focus'] },
  { id: 'tetsuya', name: '\\u5fb9\\u591c', quote: '\\u307e\\u3060\\u5bdd\\u306a\\u304f\\u3066\\u3044\\u3044\\u3060\\u308d\\uff1f', defeatQuote: '\\u304f\\u305d\\u2026\\u3061\\u3083\\u3093\\u3068\\u5bdd\\u308b\\u306e\\u304b\\u3088\\u2026', features: ['alarm', 'focus'] },
  { id: 'nidoneel', name: '\\u30cb\\u30c9\\u30cd\\u30fc\\u30eb', quote: '\\u3042\\u3068\\uff15\\u5206\\u3060\\u3051\\u2026\\u3042\\u3068\\uff15\\u5206\\u2026', defeatQuote: '\\u5634\\u2026\\u4e00\\u767a\\u3067\\u8d77\\u304d\\u305f\\u3060\\u3068\\u2026\\uff01', features: ['alarm'] },
  { id: 'hikakuzou', name: '\\u6bd4\\u8f03\\u5bf8\\u8535', quote: '\\u3042\\u3044\\u3064\\u306e\\u65b9\\u304c\\u4e0a\\u3060\\u305e\\uff1f', defeatQuote: '\\u304f\\u305d\\u2026\\u81ea\\u5206\\u3060\\u3051\\u898b\\u3066\\u3084\\u304c\\u308b\\u2026', features: ['gratitude'] },
  { id: 'peeping', name: '\\u30d4\\u30fc\\u30d4\\u30f3\\u30af\\u30c8\\u30e0', quote: '\\u4ed6\\u4eba\\u306e\\u3053\\u3068\\u304c\\u6c17\\u306b\\u306a\\u308b\\u3060\\u308d\\uff1f', defeatQuote: '\\u4ed6\\u4eba\\u3058\\u3083\\u306a\\u304f\\u81ea\\u5206\\u3092\\u898b\\u308b\\u306e\\u304b\\u2026', features: ['gratitude'] },
  { id: 'mottemiteya', name: '\\u30e2\\u30c3\\u30c8\\u30df\\u30c6\\u30e4', quote: '\\u3082\\u3063\\u3068\\u300c\\u3044\\u3044\\u306d\\u300d\\u304c\\u6b32\\u3057\\u3044\\u3060\\u308d\\uff1f', defeatQuote: '\\u81ea\\u5206\\u3067\\u81ea\\u5206\\u3092\\u8a8d\\u3081\\u3089\\u308c\\u308b\\u306e\\u304b\\u2026', features: ['gratitude'] },
  { id: 'moumuri', name: '\\u30e2\\u30a6\\u30e0\\u30ea', quote: '\\u304a\\u524d\\u306b\\u306f\\u7121\\u7406\\u3060\\u3088', defeatQuote: '\\u7121\\u7406\\u3058\\u3083\\u306a\\u304b\\u3063\\u305f\\u306e\\u304b\\u2026\\uff01', features: ['consult'] },
  { id: 'atamadekkachi', name: '\\u30a2\\u30bf\\u30de\\u30c7\\u30c3\\u30ab\\u30c1', quote: '\\u8003\\u3048\\u3066\\u308b\\u3060\\u3051\\u3058\\u3083\\u30c0\\u30e1\\u3060\\u305e', defeatQuote: '\\u884c\\u52d5\\u3057\\u305f\\u3060\\u3068\\u2026\\u8003\\u3048\\u308b\\u3060\\u3051\\u3058\\u3083\\u306a\\u3044\\u306e\\u304b\\u2026', features: ['review'] },
];

'''

content = content.replace(
    "// ===== BATTLE SYSTEM: Enemy Data =====",
    yokai_code + "// ===== BATTLE SYSTEM: Enemy Data ====="
)
print('1/5 Yokai data OK')

# ============================================
# 2. YOKAI STATE VARIABLES (after battle states)
# ============================================
yokai_state = """
  // ===== Yokai Defeat System =====
  const [yokaiEncounter, setYokaiEncounter] = useState<YokaiData | null>(null);
  const [yokaiPhase, setYokaiPhase] = useState<'appear' | 'attack' | 'defeated' | null>(null);
  const [yokaiXp, setYokaiXp] = useState(0);
  const [yokaiFeature, setYokaiFeature] = useState<string>('');
  const yokaiShakeAnim = useRef(new Animated.Value(0)).current;
"""

content = content.replace(
    "  const playerShakeAnim = useRef(new Animated.Value(0)).current;",
    "  const playerShakeAnim = useRef(new Animated.Value(0)).current;" + yokai_state
)
print('2/5 Yokai state OK')

# ============================================
# 3. YOKAI FUNCTIONS (before stats functions)
# ============================================
yokai_functions = """
  // ===== Yokai Encounter Functions =====
  const triggerYokaiDefeat = (feature: YokaiFeature, xpGain: number) => {
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature));
    if (pool.length === 0) return;
    const yokai = pool[Math.floor(Math.random() * pool.length)];
    setYokaiEncounter(yokai);
    setYokaiPhase('appear');
    setYokaiXp(xpGain);
    setYokaiFeature(feature);
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const yokaiAttack = async () => {
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
  };

  const closeYokaiModal = () => {
    setYokaiEncounter(null);
    setYokaiPhase(null);
    setYokaiXp(0);
    yokaiShakeAnim.setValue(0);
  };

"""

content = content.replace(
    "  // ===== Stats Functions =====",
    yokai_functions + "  // ===== Stats Functions ====="
)
print('3/5 Yokai functions OK')

# ============================================
# 4. YOKAI MODAL (before stats allocation modal)
# ============================================
yokai_modal = """
      {/* Yokai Defeat Modal */}
      {yokaiEncounter && (
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
          </View>
        </Modal>
      )}
"""

content = content.replace(
    "      {/* Stats Allocation Modal */}",
    yokai_modal + "\n      {/* Stats Allocation Modal */}"
)
print('4/5 Yokai modal OK')

# ============================================
# 5. HOOK INTO EXISTING COMPLETION POINTS
# ============================================
hooks_applied = 0

# 5a. Mission complete (相談→ミッション完了) - has backtick syntax bug
old_mission = "      showSaveSuccess`\u4fee\u884c\u9054\u6210\uff01+${xpGain} XP`);"
if old_mission in content:
    content = content.replace(old_mission,
        "      showSaveSuccess(`\u4fee\u884c\u9054\u6210\uff01+${xpGain} XP`);\n      triggerYokaiDefeat('consult', 0);")
    hooks_applied += 1
    print('  5a. Mission hook OK (also fixed backtick bug)')
else:
    print('  5a. SKIP - mission not found')

# 5b. Goal save (目標)
old_goal = "    showSaveSuccess('\u76ee\u6a19\u3092\u523b\u3093\u3060\u3002\u4eca\u65e5\u3082\u65ac\u308c\uff01');"
if old_goal in content:
    content = content.replace(old_goal,
        old_goal + "\n    triggerYokaiDefeat('goal', 15);", 1)
    hooks_applied += 1
    print('  5b. Goal hook OK')
else:
    print('  5b. SKIP - goal not found')

# 5c. Review save (振り返り)
old_review = "    showSaveSuccess('\u632f\u308a\u8fd4\u308a\u5b8c\u4e86\u3002\u660e\u65e5\u3082\u65ac\u308c\uff01');"
if old_review in content:
    content = content.replace(old_review,
        old_review + "\n    triggerYokaiDefeat('review', 20);", 1)
    hooks_applied += 1
    print('  5c. Review hook OK')
else:
    print('  5c. SKIP - review not found')

# 5d. Focus complete (集中完了)
old_focus = "            Alert.alert('\u96c6\u4e2d\u5b8c\u4e86', messages[Math.floor(Math.random() * messages.length)], ["
if old_focus in content:
    content = content.replace(old_focus,
        "            triggerYokaiDefeat('focus', 20);\n" + old_focus, 1)
    hooks_applied += 1
    print('  5d. Focus hook OK')
else:
    print('  5d. SKIP - focus not found')

# 5e. Alarm dismiss (アラーム解除)
old_alarm = "        showSaveSuccess('\u30a2\u30e9\u30fc\u30e0\u89e3\u9664\uff01\u4eca\u65e5\u3082\u9811\u5f35\u308d\u3046');"
alarm_count = content.count(old_alarm)
if alarm_count > 0:
    content = content.replace(old_alarm,
        old_alarm + "\n        triggerYokaiDefeat('alarm', 25);", 1)
    hooks_applied += 1
    print(f'  5e. Alarm hook OK (found {alarm_count})')
else:
    print('  5e. SKIP - alarm not found')

print(f'  Total hooks: {hooks_applied}')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== YOKAI SYSTEM COMPLETE ===')
print('  12 yokai with images + videos')
print('  3-phase modal: appear -> attack -> defeated')
print('  Hooks: mission, goal, review, focus, alarm')
print('  Each defeat gives XP + animation')
