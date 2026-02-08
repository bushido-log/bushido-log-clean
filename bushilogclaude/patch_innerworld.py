#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - Inner World (修行の間) Hub Screen"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD 'innerWorld' TO TAB TYPE
# ============================================
old_tab = "const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character' | 'battle'>('consult');"
new_tab = "const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character' | 'battle' | 'innerWorld'>('consult');"

if old_tab in content:
    content = content.replace(old_tab, new_tab)
    print('1/5 Tab type updated OK')
else:
    print('1/5 SKIP - tab type not found')

# ============================================
# 2. ADD innerWorld subview state
# ============================================
iw_state = """
  // ===== Inner World (修行の間) =====
  const [innerWorldView, setInnerWorldView] = useState<'menu' | 'yokaiDex'>('menu');
"""

content = content.replace(
    "  // ===== Kegare (Katana Polishing) System =====",
    iw_state + "  // ===== Kegare (Katana Polishing) System ====="
)
print('2/5 Inner world state OK')

# ============================================
# 3. CHANGE LOGO TAP: character -> innerWorld
# ============================================
old_logo = """          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setTab('character'); 
          }"""

new_logo = """          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setInnerWorldView('menu');
            setTab('innerWorld'); 
          }"""

if old_logo in content:
    content = content.replace(old_logo, new_logo)
    print('3/5 Logo tap -> innerWorld OK')
else:
    print('3/5 SKIP - logo tap not found')

# ============================================
# 4. ADD renderInnerWorldTab FUNCTION
# ============================================
iw_render = """
  // ===== Inner World (修行の間) =====
  const renderInnerWorldTab = () => {
    const levelInfo = getLevelFromXp(totalXp);

    if (innerWorldView === 'yokaiDex') {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ color: '#888', fontSize: 16 }}>\u2190 \u4fee\u884c\u306e\u9593</Text>
          </Pressable>

          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20 }}>\U0001f479 \u5996\u602a\u56f3\u9451</Text>

          <ScrollView>
            {YOKAI_LIST.map((yokai) => (
              <View key={yokai.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0a0a1a',
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#222',
              }}>
                <View style={{
                  width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
                  borderWidth: 2, borderColor: '#333', backgroundColor: '#0a0a0a', marginRight: 14,
                }}>
                  <Image source={YOKAI_IMAGES[yokai.id]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#ccc', fontSize: 16, fontWeight: '700' }}>{yokai.name}</Text>
                  <Text style={{ color: '#555', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
                    \u300c{yokai.quote}\u300d
                  </Text>
                  <Text style={{ color: '#444', fontSize: 10, marginTop: 4 }}>
                    {yokai.features.map((f: string) => (
                      f === 'consult' ? '\u76f8\u8ac7' : f === 'gratitude' ? '\u611f\u8b1d' : f === 'goal' ? '\u76ee\u6a19' : f === 'review' ? '\u632f\u308a\u8fd4\u308a' : f === 'focus' ? '\u96c6\u4e2d' : '\u30a2\u30e9\u30fc\u30e0'
                    )).join(' / ')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Pressable
          onPress={() => { playTapSound(); setTab('consult'); setShowStartScreen(true); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: '#888', fontSize: 16 }}>\u2190 \u9053\u5834\u306b\u623b\u308b</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 4, marginBottom: 8 }}>\u2500\u2500 \u4fee \u884c \u306e \u9593 \u2500\u2500</Text>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>\u4fee\u884c\u306e\u9593</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Lv.{levelInfo.level} {LEVEL_TITLES[levelInfo.level]}</Text>
        </View>

        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#1a0808' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: (isPro || levelInfo.level >= 3) ? '#8B0000' : '#222',
            opacity: (isPro || levelInfo.level >= 3) ? 1 : 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\u2694\ufe0f</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: (isPro || levelInfo.level >= 3) ? '#ef4444' : '#555', fontSize: 18, fontWeight: '900' }}>\u4fee\u884c\u5bfe\u6226</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{(isPro || levelInfo.level >= 3) ? '\u6575\u3068\u6226\u3044\u3001\u5df1\u3092\u78e8\u3051' : '\U0001f512 Lv.3\u3067\u89e3\u653e'}</Text>
            </View>
            {(isPro || levelInfo.level >= 3) && <Text style={{ color: '#555', fontSize: 18 }}>\u203a</Text>}
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('yokaiDex'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#333',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\U0001f479</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ccc', fontSize: 18, fontWeight: '900' }}>\u5996\u602a\u56f3\u9451</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>\u51fa\u4f1a\u3063\u305f\u5996\u602a\u305f\u3061</Text>
            </View>
            <Text style={{ color: '#555', fontSize: 18 }}>\u203a</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); setTab('character'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#333',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\U0001f9d1\u200d\U0001f393</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ccc', fontSize: 18, fontWeight: '900' }}>\u80b2\u6210</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>\u30b9\u30c6\u30fc\u30bf\u30b9\u30fb\u30ec\u30d9\u30eb\u78ba\u8a8d</Text>
            </View>
            <Text style={{ color: '#555', fontSize: 18 }}>\u203a</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); showSaveSuccess('Lv.9\u4ee5\u964d \u89e3\u653e\u4e88\u5b9a'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#222',
            opacity: 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\U0001f409</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 18, fontWeight: '900' }}>\u899a\u9192</Text>
              <Text style={{ color: '#444', fontSize: 11, marginTop: 2 }}>\U0001f512 Lv.9\u4ee5\u964d \u89e3\u653e\u4e88\u5b9a</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#222',
            opacity: 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\U0001f4dc</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 18, fontWeight: '900' }}>\u6226\u6b74</Text>
              <Text style={{ color: '#444', fontSize: 11, marginTop: 2 }}>\u8fd1\u65e5\u5b9f\u88c5</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

"""

# Insert before renderAlarmTab
content = content.replace(
    "  const renderAlarmTab",
    iw_render + "  const renderAlarmTab"
)
print('4/5 renderInnerWorldTab OK')

# ============================================
# 5. ADD RENDER IN MAIN RETURN
# ============================================
old_render = "                      {tab === 'character' && renderCharacterTab()}"
new_render = "                      {tab === 'innerWorld' && renderInnerWorldTab()}\n                      {tab === 'character' && renderCharacterTab()}"

if old_render in content:
    content = content.replace(old_render, new_render)
    print('5/5 Main render OK')
else:
    print('5/5 SKIP - render not found')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== INNER WORLD HUB COMPLETE ===')
print('  - Logo tap -> 修行の間')
print('  - Menu: 修行対戦 / 妖怪図鑑 / 育成 / 覚醒 / 戦歴')
print('  - ← 道場に戻る button')
print('  - Yokai Dex with 12 yokai list + images')
