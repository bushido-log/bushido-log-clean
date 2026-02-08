#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Yokai appears on tabs + Battle becomes mission-based"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD YOKAI TAB PRESENCE STATE + FUNCTIONS
# ============================================
yokai_tab_code = """
  // ===== Yokai Tab Presence System =====
  const [defeatedYokaiToday, setDefeatedYokaiToday] = useState<string[]>([]);

  const getTabYokai = (feature: YokaiFeature): YokaiData | null => {
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature) && !defeatedYokaiToday.includes(y.id));
    if (pool.length === 0) return null;
    // Deterministic: use today's date as seed
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const featureHash = feature.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return pool[(hash + featureHash) % pool.length];
  };

  const markYokaiDefeated = (yokaiId: string) => {
    setDefeatedYokaiToday(prev => prev.includes(yokaiId) ? prev : [...prev, yokaiId]);
  };

  const renderYokaiBanner = (feature: YokaiFeature) => {
    const yokai = getTabYokai(feature);
    if (!yokai) return null;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a0808',
        borderRadius: 14,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#8B0000',
      }}>
        <View style={{
          width: 50, height: 50, borderRadius: 10, overflow: 'hidden',
          borderWidth: 2, borderColor: '#8B0000', backgroundColor: '#0a0a0a', marginRight: 12,
        }}>
          <Image source={YOKAI_IMAGES[yokai.id]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '800' }}>{yokai.name}</Text>
          <Text style={{ color: '#888', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
            \\u300c{yokai.quote}\\u300d
          </Text>
        </View>
        <Text style={{ color: '#ef4444', fontSize: 20 }}>\\u2620\\ufe0f</Text>
      </View>
    );
  };

"""

content = content.replace(
    "  // ===== IMINASHI Functions =====",
    yokai_tab_code + "  // ===== IMINASHI Functions ====="
)
print('1/4 Yokai tab presence OK')

# ============================================
# 2. INSERT YOKAI BANNER INTO EACH TAB
# ============================================
hooks = 0

# 2a. Goal tab
old_goal = """      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>今日のサムライ目標</Text>"""

new_goal = """      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {renderYokaiBanner('goal')}
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>今日のサムライ目標</Text>"""

if old_goal in content:
    content = content.replace(old_goal, new_goal, 1)
    hooks += 1
    print('  2a. Goal banner OK')
else:
    print('  2a. SKIP - goal tab not found')

# 2b. Gratitude tab
old_grat = """      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>感謝</Text>
        <Text style={styles.goalSub}>今日は感謝を10個書けるか？</Text>"""

new_grat = """      {renderYokaiBanner('gratitude')}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>感謝</Text>
        <Text style={styles.goalSub}>今日は感謝を10個書けるか？</Text>"""

if old_grat in content:
    content = content.replace(old_grat, new_grat, 1)
    hooks += 1
    print('  2b. Gratitude banner OK')
else:
    print('  2b. SKIP - gratitude tab not found')

# 2c. Review tab - find the right spot
old_review_tab = "  const renderReviewTab = () => ("
if old_review_tab in content:
    # Find the first <ScrollView or <View after renderReviewTab
    import re
    m = re.search(r'const renderReviewTab = \(\) => \(\s*\n\s*<(ScrollView|View)', content)
    if m:
        insert_pos = content.find('\n', m.start()) + 1
        # Find the opening tag line
        tag_line_start = content.find('<', insert_pos)
        tag_line_end = content.find('\n', tag_line_start)
        tag_line = content[tag_line_start:tag_line_end]
        
        # Insert banner after the opening ScrollView/View tag's next line
        after_open = content.find('>', tag_line_start) + 1
        next_newline = content.find('\n', after_open)
        content = content[:next_newline+1] + '        {renderYokaiBanner(\'review\')}\n' + content[next_newline+1:]
        hooks += 1
        print('  2c. Review banner OK')
    else:
        print('  2c. SKIP - review structure not found')
else:
    print('  2c. SKIP - renderReviewTab not found')

# 2d. Focus tab
old_focus_tab = "  const renderFocusTab = () => ("
if old_focus_tab in content:
    m2 = re.search(r'const renderFocusTab = \(\) => \(\s*\n\s*<(ScrollView|View)', content)
    if m2:
        tag_start = content.find('<', m2.start() + 30)
        after_open = content.find('>', tag_start) + 1
        next_newline = content.find('\n', after_open)
        content = content[:next_newline+1] + '        {renderYokaiBanner(\'focus\')}\n' + content[next_newline+1:]
        hooks += 1
        print('  2d. Focus banner OK')
    else:
        print('  2d. SKIP - focus structure not found')
else:
    print('  2d. SKIP - renderFocusTab not found')

print(f'  Tab banners: {hooks}/4')

# ============================================
# 3. UPDATE DEFEAT TRIGGERS TO MARK YOKAI AS DEFEATED
# ============================================
# Modify triggerYokaiDefeat to also use the tab's current yokai
old_trigger = """  const triggerYokaiDefeat = (feature: YokaiFeature, xpGain: number) => {
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature));
    if (pool.length === 0) return;
    const yokai = pool[Math.floor(Math.random() * pool.length)];"""

new_trigger = """  const triggerYokaiDefeat = (feature: YokaiFeature, xpGain: number) => {
    // Use the yokai that was showing on the tab (deterministic)
    const tabYokai = getTabYokai(feature);
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature));
    if (pool.length === 0) return;
    const yokai = tabYokai || pool[Math.floor(Math.random() * pool.length)];
    markYokaiDefeated(yokai.id);"""

if old_trigger in content:
    content = content.replace(old_trigger, new_trigger)
    print('3/4 Defeat trigger updated OK')
else:
    print('3/4 SKIP - trigger not found')

# ============================================
# 4. REPLACE BATTLE TAB WITH MISSION-BASED SYSTEM
# ============================================

# Define mission data for each yokai
# Find renderBattleTab and replace entirely
old_battle_start = "  const renderBattleTab = () => {"
old_battle_end_marker = "  const renderCharacterTab"

idx_start = content.find(old_battle_start)
idx_end = content.find(old_battle_end_marker)

if idx_start > 0 and idx_end > idx_start:
    mission_battle = """  const renderBattleTab = () => {
    const levelInfo = getLevelFromXp(totalXp);

    const YOKAI_MISSIONS: { [key: string]: { mission: string; tab: YokaiFeature; action: string } } = {
      mikkabozu: { mission: '\\u4eca\\u65e5\\u306e\\u76ee\\u6a19\\u3092\\u66f8\\u3051', tab: 'goal', action: '\\u76ee\\u6a19\\u30bf\\u30d6\\u3067\\u76ee\\u6a19\\u3092\\u4fdd\\u5b58\\u3059\\u308b' },
      hyakume: { mission: '10\\u5206\\u4ee5\\u4e0a\\u96c6\\u4e2d\\u3057\\u308d', tab: 'focus', action: '\\u96c6\\u4e2d\\u30bf\\u30a4\\u30de\\u30fc\\u3092\\u5b8c\\u4e86\\u3059\\u308b' },
      deebu: { mission: '\\u76ee\\u6a19\\u3092\\u7acb\\u3066\\u3066\\u52d5\\u3051', tab: 'goal', action: '\\u76ee\\u6a19\\u30bf\\u30d6\\u3067\\u76ee\\u6a19\\u3092\\u4fdd\\u5b58\\u3059\\u308b' },
      atodeyaru: { mission: '\\u4eca\\u3059\\u3050\\u76ee\\u6a19\\u3092\\u66f8\\u3051', tab: 'goal', action: '\\u76ee\\u6a19\\u30bf\\u30d6\\u3067\\u76ee\\u6a19\\u3092\\u4fdd\\u5b58\\u3059\\u308b' },
      scroll: { mission: 'SNS\\u3092\\u3084\\u3081\\u3066\\u96c6\\u4e2d\\u3057\\u308d', tab: 'focus', action: '\\u96c6\\u4e2d\\u30bf\\u30a4\\u30de\\u30fc\\u3092\\u5b8c\\u4e86\\u3059\\u308b' },
      tetsuya: { mission: '\\u660e\\u65e5\\u306e\\u30a2\\u30e9\\u30fc\\u30e0\\u3092\\u30bb\\u30c3\\u30c8\\u3057\\u308d', tab: 'alarm', action: '\\u30a2\\u30e9\\u30fc\\u30e0\\u3092\\u30bb\\u30c3\\u30c8\\u3059\\u308b' },
      nidoneel: { mission: '\\u660e\\u65e5\\u3061\\u3083\\u3093\\u3068\\u8d77\\u304d\\u308d', tab: 'alarm', action: '\\u30a2\\u30e9\\u30fc\\u30e0\\u3092\\u89e3\\u9664\\u3059\\u308b' },
      hikakuzou: { mission: '\\u611f\\u8b1d\\u3092\\uff13\\u3064\\u4ee5\\u4e0a\\u66f8\\u3051', tab: 'gratitude', action: '\\u611f\\u8b1d\\u3092\\uff13\\u3064\\u4ee5\\u4e0a\\u66f8\\u304f' },
      peeping: { mission: '\\u81ea\\u5206\\u306e\\u3053\\u3068\\u306b\\u611f\\u8b1d\\u3057\\u308d', tab: 'gratitude', action: '\\u611f\\u8b1d\\u3092\\uff13\\u3064\\u4ee5\\u4e0a\\u66f8\\u304f' },
      mottemiteya: { mission: '\\u4ed6\\u4eba\\u3058\\u3083\\u306a\\u304f\\u81ea\\u5206\\u3092\\u898b\\u308d', tab: 'gratitude', action: '\\u611f\\u8b1d\\u3092\\uff13\\u3064\\u4ee5\\u4e0a\\u66f8\\u304f' },
      moumuri: { mission: '\\u76f8\\u8ac7\\u3057\\u3066\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u3092\\u3053\\u306a\\u305b', tab: 'consult', action: '\\u76f8\\u8ac7\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u3092\\u5b8c\\u4e86\\u3059\\u308b' },
      atamadekkachi: { mission: '\\u632f\\u308a\\u8fd4\\u308a\\u3092\\u66f8\\u3051', tab: 'review', action: '\\u632f\\u308a\\u8fd4\\u308a\\u3092\\u4fdd\\u5b58\\u3059\\u308b' },
    };

    return (
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('menu'); setTab('innerWorld'); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={{ color: '#888', fontSize: 16 }}>\\u2190 \\u4fee\\u884c\\u306e\\u9593</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: '900' }}>\\u2694\\ufe0f \\u4fee\\u884c\\u5bfe\\u6226 \\u2694\\ufe0f</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>\\u5996\\u602a\\u3092\\u9078\\u3093\\u3067\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u3092\\u3053\\u306a\\u305b</Text>
        </View>

        {YOKAI_LIST.map((yokai) => {
          const mission = YOKAI_MISSIONS[yokai.id];
          const isDefeated = defeatedYokaiToday.includes(yokai.id);
          if (!mission) return null;
          return (
            <Pressable
              key={yokai.id}
              onPress={() => {
                if (isDefeated) {
                  showSaveSuccess('\\u3053\\u306e\\u5996\\u602a\\u306f\\u4eca\\u65e5\\u5012\\u3057\\u305f');
                  return;
                }
                playTapSound();
                setTab(mission.tab === 'consult' ? 'consult' : mission.tab as any);
                setShowStartScreen(false);
              }}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDefeated ? '#0a1a0a' : (pressed ? '#1a0808' : '#0a0a1a'),
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: isDefeated ? '#1a3a1a' : '#8B0000',
                opacity: isDefeated ? 0.5 : 1,
              }]}
            >
              <View style={{
                width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
                borderWidth: 2, borderColor: isDefeated ? '#1a3a1a' : '#8B0000',
                backgroundColor: '#0a0a0a', marginRight: 14,
              }}>
                <Image
                  source={isDefeated ? YOKAI_LOSE_IMAGES[yokai.id] : YOKAI_IMAGES[yokai.id]}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: isDefeated ? '#4a4a4a' : '#ccc', fontSize: 15, fontWeight: '800' }}>{yokai.name}</Text>
                  {isDefeated && <Text style={{ color: '#2a6a2a', fontSize: 11, marginLeft: 8, fontWeight: '700' }}>\\u2713 \\u8a0e\\u4f10\\u6e08</Text>}
                </View>
                <Text style={{ color: isDefeated ? '#333' : '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                  {isDefeated ? '\\u2500' : mission.mission}
                </Text>
                <Text style={{ color: '#444', fontSize: 10, marginTop: 2 }}>
                  {isDefeated ? '' : mission.action}
                </Text>
              </View>
              {!isDefeated && <Text style={{ color: '#555', fontSize: 18 }}>\\u203a</Text>}
            </Pressable>
          );
        })}

        {defeatedYokaiToday.length > 0 && (
          <Text style={{ color: '#D4AF37', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
            \\U0001f525 \\u4eca\\u65e5\\u306e\\u8a0e\\u4f10: {defeatedYokaiToday.length} / {YOKAI_LIST.length}
          </Text>
        )}
      </ScrollView>
    );
  };

"""
    content = content[:idx_start] + mission_battle + content[idx_end:]
    print('4/4 Battle tab replaced with mission system OK')
else:
    print('4/4 SKIP - renderBattleTab not found')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== YOKAI MISSION SYSTEM COMPLETE ===')
print('  A: Each tab shows yokai banner based on behavior')
print('  B: Battle tab is now mission-based (select yokai -> do task -> defeat)')
print('  Defeated yokai tracked per day')
print('  Tab banners disappear after defeating yokai')
