#!/usr/bin/env python3
"""Insert walk card into character tab + fix overlay props"""
import shutil, sys

path = sys.argv[1] if len(sys.argv) > 1 else 'App.tsx'
shutil.copy2(path, path + '.bak_walkfix')

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Insert card before line 4592 (</ScrollView> of character tab)
card = [
    '\n',
    '        {/* \u6b66\u58eb\u306e\u9053\uff08\u5168\u56fd\u5236\u8987\uff09 */}\n',
    "        <View style={{ marginTop: 24, width: '100%' }}>\n",
    "          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>\n",
    "            <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />\n",
    "            <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900', marginHorizontal: 12 }}>{'\U0001f5fe \u6b66\u58eb\u306e\u9053 \U0001f5fe'}</Text>\n",
    "            <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />\n",
    '          </View>\n',
    '          <Pressable\n',
    '            onPress={() => { playTapSound(); setShowSamuraiWalk(true); }}\n',
    "            style={({ pressed }) => [{ backgroundColor: '#0a0a1a', borderRadius: 16, borderWidth: 1, borderColor: '#D4AF3744', opacity: pressed ? 0.8 : 1, padding: 20, alignItems: 'center' }]}\n",
    '          >\n',
    "            <Text style={{ color: '#D4AF37', fontSize: 14, fontWeight: '800', marginBottom: 4 }}>{'\u6b69\u3044\u3066\u5168\u56fd\u5236\u8987'}</Text>\n",
    "            <Text style={{ color: '#888', fontSize: 11 }}>{'\u6b69\u6570\u3067\u65e5\u672c\u5730\u56f3\u3092\u5857\u308a\u3064\u3076\u305b \u2192'}</Text>\n",
    '          </Pressable>\n',
    '        </View>\n',
    '\n',
]

# Find </ScrollView> after renderCharacterTab
char_start = None
insert_idx = None
for i, line in enumerate(lines):
    if 'const renderCharacterTab' in line:
        char_start = i
    if char_start and '</ScrollView>' in line and i > char_start:
        insert_idx = i
        break

if insert_idx and '\u6b66\u58eb\u306e\u9053' not in ''.join(lines):
    for j, cl in enumerate(card):
        lines.insert(insert_idx + j, cl)
    print(f'\u2705 Card inserted at line {insert_idx}')
else:
    print('\u23ed Card already exists or not found')

# 2. Fix overlay: add todaySteps and playTapSound props
for i, line in enumerate(lines):
    if 'SamuraiWalkScreen' in line and 'onClose' in line and 'todaySteps' not in line:
        lines[i] = '          <SamuraiWalkScreen\n            todaySteps={walkData.todaySteps}\n            onClose={() => setShowSamuraiWalk(false)}\n            playTapSound={playTapSound}\n          />\n'
        print(f'\u2705 Overlay props fixed at line {i}')
        break
    elif 'SamuraiWalkScreen' in line and 'todaySteps' in line:
        print('\u23ed Overlay props already correct')
        break

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('\u2705 Done!')
