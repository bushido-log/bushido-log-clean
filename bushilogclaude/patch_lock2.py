#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Level Lock + Pro Bypass + Dojo Battle Button"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. LOCK ALARM BUTTON (Lv5, Pro bypass) on Start Screen
# ============================================
old_alarm = """      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>\u660e\u65e5\u306b\u5099\u3048\u308b</Text>
      </Pressable>"""

new_alarm = """      <Pressable
        style={[styles.startButton, !isPro && getLevelFromXp(totalXp).level < 5 && { opacity: 0.4 }]}
        onPress={() => {
          if (!isPro && getLevelFromXp(totalXp).level < 5) {
            playTapSound();
            showSaveSuccess('Lv.5\u300c\u82e5\u4f8d\u300d\u3067\u89e3\u653e');
            return;
          }
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>\u660e\u65e5\u306b\u5099\u3048\u308b{!isPro && getLevelFromXp(totalXp).level < 5 ? ' \U0001f512' : ''}</Text>
      </Pressable>"""

if old_alarm in content:
    content = content.replace(old_alarm, new_alarm)
    print('1/5 Alarm lock OK')
else:
    print('1/5 SKIP - alarm not found')

# ============================================
# 2. ADD BATTLE BUTTON TO DOJO (Lv3 lock, Pro bypass)
# ============================================
battle_dojo_btn = """
      <Pressable
        style={[styles.startButton, !isPro && getLevelFromXp(totalXp).level < 3 ? { opacity: 0.4 } : { borderColor: '#8B0000', borderWidth: 1 }]}
        onPress={() => {
          if (!isPro && getLevelFromXp(totalXp).level < 3) {
            playTapSound();
            showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
            return;
          }
          playAttackSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setBattleMode('select');
          setTab('battle');
          setShowStartScreen(false);
        }}
      >
        <Text style={[styles.startButtonText, (isPro || getLevelFromXp(totalXp).level >= 3) && { color: '#ef4444' }]}>\u2694\ufe0f \u4fee\u884c\u5bfe\u6226{!isPro && getLevelFromXp(totalXp).level < 3 ? ' \U0001f512' : ''}</Text>
      </Pressable>"""

content = content.replace(new_alarm, new_alarm + battle_dojo_btn)
print('2/5 Dojo battle button OK')

# ============================================
# 3. LOCK BATTLE IN CHARACTER TAB (Lv3, Pro bypass)
# ============================================
old_battle_btn = """        {/* Battle Button */}
        <Pressable
          onPress={() => {
            playAttackSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setBattleMode('select');
            setTab('battle');
          }}"""

new_battle_btn = """        {/* Battle Button */}
        <Pressable
          onPress={() => {
            if (!isPro && getLevelFromXp(totalXp).level < 3) {
              playTapSound();
              showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
              return;
            }
            playAttackSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setBattleMode('select');
            setTab('battle');
          }}"""

if old_battle_btn in content:
    content = content.replace(old_battle_btn, new_battle_btn)
    print('3/5 Battle lock OK')
else:
    print('3/5 SKIP - battle btn not found')

# ============================================
# 4. LOCK ALARM TAB (Lv5, Pro bypass)
# ============================================
old_alarm_render = "                      {tab === 'alarm' && renderAlarmTab()}"
new_alarm_render = """                      {tab === 'alarm' && ((isPro || getLevelFromXp(totalXp).level >= 5) ? renderAlarmTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>\U0001f512</Text>
                          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>\u30b5\u30e0\u30e9\u30a4\u30a2\u30e9\u30fc\u30e0</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.5\u300c\u82e5\u4f8d\u300d\u3067\u89e3\u653e</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>\u4fee\u884c\u3092\u7a4d\u307f\u3001\u5df1\u3092\u78e8\u3051</Text>
                        </View>
                      ))}"""

if old_alarm_render in content:
    content = content.replace(old_alarm_render, new_alarm_render)
    print('4/5 Alarm tab lock OK')
else:
    print('4/5 SKIP - alarm render not found')

# ============================================
# 5. LOCK BATTLE TAB (Lv3, Pro bypass)
# ============================================
old_battle_render = "                      {tab === 'battle' && renderBattleTab()}"
new_battle_render = """                      {tab === 'battle' && ((isPro || getLevelFromXp(totalXp).level >= 3) ? renderBattleTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>\U0001f512</Text>
                          <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>\u4fee\u884c\u5bfe\u6226</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>\u307e\u305a\u306f\u4fee\u884c\u3092\u7a4d\u3081</Text>
                        </View>
                      ))}"""

if old_battle_render in content:
    content = content.replace(old_battle_render, new_battle_render)
    print('5/5 Battle tab lock OK')
else:
    print('5/5 SKIP - battle render not found')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== LEVEL LOCK + PRO BYPASS COMPLETE ===')
print('  - Alarm: Lv5 lock (Pro bypasses)')
print('  - Battle: Lv3 lock (Pro bypasses)')
print('  - Dojo battle button added')
print('  - Lock screens with Pro bypass')
