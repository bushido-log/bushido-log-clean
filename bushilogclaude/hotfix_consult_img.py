"""相談画面を画像そのまま使用
BEFORE: cp ~/Downloads/相談する_-_2.PNG assets/consult_select.png
"""
import os
if not os.path.exists('assets/consult_select.png'):
    print('[WARN] assets/consult_select.png がない！先にコピーして: cp ~/Downloads/相談する_-_2.PNG assets/consult_select.png')

# 2. Add asset to assets.ts
a = open('src/data/assets.ts').read()
if 'CONSULT_SELECT_IMG' not in a:
    a += "\nexport const CONSULT_SELECT_IMG = require('../../assets/consult_select.png');\n"
    open('src/data/assets.ts','w').write(a)
    print('[OK] assets.ts追加')

# 3. Add import in App.tsx
s = open('App.tsx').read()
if 'CONSULT_SELECT_IMG' not in s:
    s = s.replace("  DOJO_GATE_DIM, DOJO_GATE_LIGHT, CONSULT_BG, INTRO_VIDEO,",
                   "  DOJO_GATE_DIM, DOJO_GATE_LIGHT, CONSULT_BG, CONSULT_SELECT_IMG, INTRO_VIDEO,", 1)
    print('[OK] import追加')

# 4. Replace consult select screen
# Find current implementation (could be original or patched)
# Try patched version first
old_patched = """    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 80 }}>"""

old_original = """    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={styles.consultSelectContainer}>"""

# Find the end marker
end_marker = """        </ImageBackground>
      );
    }

    return (
      <ScrollView"""

if old_patched in s:
    start_idx = s.index(old_patched)
    end_idx = s.index(end_marker, start_idx) + len(end_marker.split('\n')[0]) + len(end_marker.split('\n')[1]) + len(end_marker.split('\n')[2]) + 3
    # Get everything from start to end of the closing block
    block_end = s.index("    return (\n      <ScrollView", start_idx)
    old_block = s[start_idx:block_end]
    found = 'patched'
elif old_original in s:
    start_idx = s.index(old_original)
    block_end = s.index("    return (\n      <ScrollView", start_idx)
    old_block = s[start_idx:block_end]
    found = 'original'
else:
    print('[ERROR] 相談画面が見つからない')
    found = None

if found:
    new_block = """    if (consultMode === 'select') {
      return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Image source={CONSULT_SELECT_IMG} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          {/* 上ボタン: サムライキングに相談する */}
          <Pressable
            onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            style={{ position: 'absolute', top: '30%', left: '10%', right: '10%', height: '16%', borderRadius: 28 }}
          />
          {/* 下ボタン: サムライキングに欲望を見せろ */}
          <Pressable
            onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            style={{ position: 'absolute', top: '56%', left: '10%', right: '10%', height: '16%', borderRadius: 28 }}
          />
        </View>
      );
    }

"""
    s = s[:start_idx] + new_block + s[block_end:]
    print(f'[OK] 相談画面置換 ({found})')

open('App.tsx','w').write(s)
print('Done')
