#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Stats System + Level Unlock Patch"""

import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD STORAGE KEY
# ============================================
content = content.replace(
    "const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';",
    "const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';\nconst STATS_KEY = 'BUSHIDO_STATS_V1';"
)
print('1/7 Storage key OK')

# ============================================
# 2. ADD STATS STATE (after battleXpGained state area)
# ============================================
stats_state = """
  // ===== Stats System =====
  const [samuraiStats, setSamuraiStats] = useState<{power: number, mind: number, skill: number, virtue: number}>({power: 75, mind: 75, skill: 75, virtue: 75});
  const [statsAllocated, setStatsAllocated] = useState(false);
  const [showStatsAlloc, setShowStatsAlloc] = useState(false);
  const [tempStats, setTempStats] = useState({power: 75, mind: 75, skill: 75, virtue: 75});
  const [lastRealloc, setLastRealloc] = useState<string | null>(null);
  const [showReallocModal, setShowReallocModal] = useState(false);
  const [reallocBudget] = useState(30);
"""

content = content.replace(
    '  const playerShakeAnim = useRef(new Animated.Value(0)).current;',
    '  const playerShakeAnim = useRef(new Animated.Value(0)).current;\n' + stats_state
)
print('2/7 Stats state OK')

# ============================================
# 3. ADD STATS LOAD (find XP load pattern)
# ============================================
# Find where XP is loaded and add stats loading after it
xp_load_pattern = "const saved = await AsyncStorage.getItem(XP_KEY);"
xp_load_idx = content.find(xp_load_pattern)
if xp_load_idx > 0:
    # Find the next line after setTotalXp
    after_xp = content.find('\n', content.find('setTotalXp', xp_load_idx))
    # Find end of that block
    insert_after = content.find('\n', after_xp + 1)
    
    stats_load = """
        // Load stats
        const statsJson = await AsyncStorage.getItem(STATS_KEY);
        if (statsJson) {
          const parsed = JSON.parse(statsJson);
          setSamuraiStats(parsed.stats || {power: 75, mind: 75, skill: 75, virtue: 75});
          setStatsAllocated(parsed.allocated || false);
          setLastRealloc(parsed.lastRealloc || null);
        }"""
    
    content = content[:insert_after] + stats_load + content[insert_after:]
    print('3/7 Stats load OK')
else:
    print('3/7 SKIP - XP load not found')

# ============================================
# 4. ADD STATS SAVE FUNCTION (before renderCharacterTab... actually before battle functions)
# ============================================
stats_functions = """
  // ===== Stats Functions =====
  const saveStats = async (stats: any, allocated: boolean, realloc: string | null) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
        stats, allocated, lastRealloc: realloc
      }));
    } catch (e) { console.log('Stats save error', e); }
  };

  const confirmStatsAllocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    setSamuraiStats(tempStats);
    setStatsAllocated(true);
    setShowStatsAlloc(false);
    await saveStats(tempStats, true, lastRealloc);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('\u6b66\u58eb\u306e\u5668\u3001\u5b9a\u307e\u308c\u308a');
  };

  const canReallocate = () => {
    if (!lastRealloc) return true;
    const last = new Date(lastRealloc);
    const now = new Date();
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  };

  const startReallocation = () => {
    if (!canReallocate()) {
      showSaveSuccess('\u6708\u306b\u4e00\u5ea6\u306e\u307f\u518d\u914d\u5206\u53ef\u80fd');
      return;
    }
    setTempStats({...samuraiStats});
    setShowReallocModal(true);
  };

  const confirmReallocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    const diff = Math.abs(tempStats.power - samuraiStats.power) + Math.abs(tempStats.mind - samuraiStats.mind) + Math.abs(tempStats.skill - samuraiStats.skill) + Math.abs(tempStats.virtue - samuraiStats.virtue);
    if (diff > reallocBudget * 2) {
      showSaveSuccess('\u6700\u5927' + reallocBudget + '\u30dd\u30a4\u30f3\u30c8\u307e\u3067');
      return;
    }
    const now = new Date().toISOString();
    setSamuraiStats(tempStats);
    setLastRealloc(now);
    setShowReallocModal(false);
    await saveStats(tempStats, true, now);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('\u904e\u53bb\u306f\u5909\u3048\u3089\u308c\u306c\u3002\u3060\u304c\u3001\u89e3\u91c8\u306f\u5909\u3048\u3089\u308c\u308b');
  };

  const adjustTempStat = (key: 'power' | 'mind' | 'skill' | 'virtue', delta: number) => {
    const newVal = tempStats[key] + delta;
    if (newVal < 20 || newVal > 100) return;
    const others = Object.entries(tempStats).filter(([k]) => k !== key).reduce((s, [, v]) => s + v, 0);
    if (others + newVal > 300) return;
    setTempStats(prev => ({...prev, [key]: newVal}));
  };

"""

content = content.replace(
    '  // ===== Battle System Functions =====',
    stats_functions + '  // ===== Battle System Functions ====='
)
print('4/7 Stats functions OK')

# ============================================
# 5. REPLACE CHARACTER TAB with stats display
# ============================================
# Find renderCharacterTab and replace the content between return( and the Battle Button
old_char_start = "        <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>\n          \u30b5\u30e0\u30e9\u30a4\u80b2\u6210\n        </Text>"

new_char_start = """        <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          \u30b5\u30e0\u30e9\u30a4\u80b2\u6210
        </Text>"""

# Now find and replace the section between EXP bar and level unlock section
# Add stats display after EXP bar

old_unlock = """        {/* \u30ec\u30d9\u30eb\u5225\u89e3\u653e\u8981\u7d20\uff08\u5c06\u6765\u5b9f\u88c5\uff09 */}
        <View style={{ 
          marginTop: 32, 
          padding: 16, 
          backgroundColor: '#1a1a2e',
          borderRadius: 12,
          width: '100%',
        }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            \u89e3\u653e\u6e08\u307f\u80fd\u529b
          </Text>
          {levelInfo.level >= 1 && (
            <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>\u2705 \u30b5\u30e0\u30e9\u30a4\u76f8\u8ac7</Text>
          )}
          {levelInfo.level >= 2 && (
            <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>\u2705 \u30b5\u30e0\u30e9\u30a4\u30df\u30c3\u30b7\u30e7\u30f3</Text>
          )}
          {levelInfo.level >= 3 && (
            <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>\u2705 \u9b3c\u30b3\u30fc\u30c1\u30e2\u30fc\u30c9</Text>
          )}
          {levelInfo.level >= 5 && (
            <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>\u2705 \u30b5\u30e0\u30e9\u30a4\u30a2\u30e9\u30fc\u30e0</Text>
          )}
          {levelInfo.level < 10 && (
            <Text style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
              \u6b21\u306e\u30ec\u30d9\u30eb\u307e\u3067: {levelInfo.nextLevelXp - totalXp} XP
            </Text>
          )}
        </View>"""

new_unlock = """        {/* \u30b9\u30c6\u30fc\u30bf\u30b9\u8868\u793a */}
        <View style={{ marginTop: 28, width: '100%', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700' }}>\u6b66\u58eb\u306e\u5668</Text>
            {statsAllocated && canReallocate() && (
              <Pressable onPress={startReallocation}>
                <Text style={{ color: '#888', fontSize: 12 }}>\u518d\u914d\u5206</Text>
              </Pressable>
            )}
          </View>
          
          {!statsAllocated && levelInfo.level >= 1 ? (
            <Pressable
              onPress={() => { setTempStats({power: 75, mind: 75, skill: 75, virtue: 75}); setShowStatsAlloc(true); playTapSound(); }}
              style={{ backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>\u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u914d\u5206\u3059\u308b</Text>
              <Text style={{ color: '#333', fontSize: 12, marginTop: 4 }}>300\u30dd\u30a4\u30f3\u30c8\u3092\u81ea\u7531\u306b\u914d\u5206</Text>
            </Pressable>
          ) : statsAllocated ? (
            <View>
              {[
                {key: 'power', label: '\u529b', color: '#ef4444', icon: '\u2694\ufe0f'},
                {key: 'mind', label: '\u5fc3', color: '#3b82f6', icon: '\U0001f9d8'},
                {key: 'skill', label: '\u6280', color: '#22c55e', icon: '\U0001f3af'},
                {key: 'virtue', label: '\u5fb3', color: '#a855f7', icon: '\u2728'},
              ].map(stat => (
                <View key={stat.key} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>
                      {stat.icon} {stat.label}
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 15, fontWeight: 'bold' }}>
                      {samuraiStats[stat.key as keyof typeof samuraiStats]}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: samuraiStats[stat.key as keyof typeof samuraiStats] + '%', backgroundColor: stat.color, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
              <Text style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                \u5408\u8a08: {samuraiStats.power + samuraiStats.mind + samuraiStats.skill + samuraiStats.virtue} / 300
              </Text>
            </View>
          ) : (
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Lv.1\u3067\u89e3\u653e</Text>
          )}
        </View>

        {/* \u30ec\u30d9\u30eb\u5225\u89e3\u653e\u8981\u7d20 */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 12, width: '100%' }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            \u89e3\u653e\u6e08\u307f\u80fd\u529b
          </Text>
          {[
            { lv: 1, label: '\u30b5\u30e0\u30e9\u30a4\u76f8\u8ac7', icon: '\U0001f4ac' },
            { lv: 1, label: '\u30b9\u30c6\u30fc\u30bf\u30b9\u914d\u5206', icon: '\U0001f4ca' },
            { lv: 2, label: '\u30b5\u30e0\u30e9\u30a4\u30df\u30c3\u30b7\u30e7\u30f3', icon: '\U0001f3af' },
            { lv: 3, label: '\u4fee\u884c\u5bfe\u6226', icon: '\u2694\ufe0f' },
            { lv: 3, label: '\u9b3c\u30b3\u30fc\u30c1\u30e2\u30fc\u30c9', icon: '\U0001f525' },
            { lv: 5, label: '\u30b5\u30e0\u30e9\u30a4\u30a2\u30e9\u30fc\u30e0', icon: '\u23f0' },
            { lv: 7, label: '\u30c9\u30e9\u30b4\u30f3\u30dc\u30b9\u6311\u6226', icon: '\U0001f409' },
            { lv: 9, label: '\u899a\u9192\u306e\u6249', icon: '\U0001f30a' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, width: 28 }}>{item.icon}</Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#ccc' : '#444', fontSize: 14, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#22c55e' : '#555', fontSize: 12 }}>
                {levelInfo.level >= item.lv ? '\u2705' : 'Lv.' + item.lv}
              </Text>
            </View>
          ))}
          {levelInfo.level < 10 && (
            <Text style={{ color: '#555', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
              \u6b21\u306e\u30ec\u30d9\u30eb\u307e\u3067: {levelInfo.nextLevelXp - totalXp} XP
            </Text>
          )}
        </View>"""

if old_unlock in content:
    content = content.replace(old_unlock, new_unlock)
    print('5/7 Character tab updated OK')
else:
    print('5/7 ERROR - unlock section not found')

# ============================================
# 6. ADD STATS ALLOCATION MODAL (before showPrivacy modal)
# ============================================
stats_modal = """
      {/* Stats Allocation Modal */}
      <Modal visible={showStatsAlloc} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              \u6b66\u58eb\u306e\u5668\u3092\u5b9a\u3081\u3088
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              300\u30dd\u30a4\u30f3\u30c8\u3092\u914d\u5206\u305b\u3088\uff08\u5404\u6700\u4f4e20\uff09
            </Text>

            {[
              {key: 'power', label: '\u529b (Power)', color: '#ef4444'},
              {key: 'mind', label: '\u5fc3 (Mind)', color: '#3b82f6'},
              {key: 'skill', label: '\u6280 (Skill)', color: '#22c55e'},
              {key: 'virtue', label: '\u5fb3 (Virtue)', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 16, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <View style={{ height: '100%', width: tempStats[stat.key as keyof typeof tempStats] + '%', backgroundColor: stat.color, borderRadius: 3 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>-</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>-1</Text>
                  </Pressable>
                  <View style={{ width: 50, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 11 }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>+1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign: 'center', marginVertical: 12, fontWeight: 'bold' }}>
              \u5408\u8a08: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
              {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300 ? ' (\u8abf\u6574\u304c\u5fc5\u8981)' : ' \u2705'}
            </Text>

            <Pressable
              onPress={confirmStatsAllocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#000' : '#888', fontSize: 16, fontWeight: 'bold' }}>
                \u6c7a\u5b9a\u3059\u308b
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowStatsAlloc(false)}
              style={{ padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>\u623b\u308b</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Reallocation Modal */}
      <Modal visible={showReallocModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              \u4fee\u884c\u56de\u60f3
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 4, fontStyle: 'italic' }}>
              \u300c\u904e\u53bb\u306f\u5909\u3048\u3089\u308c\u306c\u3002{'\n'}\u3060\u304c\u3001\u89e3\u91c8\u306f\u5909\u3048\u3089\u308c\u308b\u300d
            </Text>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
              \u6708\u306b\u4e00\u5ea6\u3001\u6700\u5927{reallocBudget}\u30dd\u30a4\u30f3\u30c8\u307e\u3067\u518d\u914d\u5206\u53ef\u80fd
            </Text>

            {[
              {key: 'power', label: '\u529b', color: '#ef4444'},
              {key: 'mind', label: '\u5fc3', color: '#3b82f6'},
              {key: 'skill', label: '\u6280', color: '#22c55e'},
              {key: 'virtue', label: '\u5fb3', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {samuraiStats[stat.key as keyof typeof samuraiStats]} \u2192 {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={{ color: '#ccc', fontSize: 18, fontWeight: 'bold' }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              \u5408\u8a08: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
            </Text>

            <Pressable
              onPress={confirmReallocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>\u518d\u914d\u5206\u3092\u78ba\u5b9a</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowReallocModal(false)}
              style={{ padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>\u623b\u308b</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
"""

# Insert before the privacy modal
content = content.replace(
    '      <Modal visible={showPrivacy}',
    stats_modal + '\n      <Modal visible={showPrivacy}'
)
print('6/7 Modals added OK')

# ============================================
# 7. MAKE BATTLE POWER USE STATS
# ============================================
# Update player attack to factor in stats
old_atk = "const playerAtk = playerLevel * 11 + Math.floor(Math.random() * 15) + 5;"
new_atk = "const playerAtk = playerLevel * 8 + Math.floor(samuraiStats.power * 0.3) + Math.floor(Math.random() * 15) + 5;"

content = content.replace(old_atk, new_atk)
print('7/7 Battle stats integration OK')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== STATS + LEVEL UNLOCK COMPLETE ===')
print('  - 4 stats: Power/Mind/Skill/Virtue')
print('  - 300 point allocation (min 20 each)')
print('  - Monthly reallocation (max 30 pts)')
print('  - Stats bars in character tab')
print('  - Level unlock display')
print('  - Battle damage uses Power stat')
