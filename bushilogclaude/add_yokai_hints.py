#!/usr/bin/env python3
"""
add_hints.py - 妖怪がヒントを教えてくれるシステム

各タブ初回表示時に妖怪キャラが説明。タップで閉じる。
AsyncStorageで表示済みを記録。
"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_hints_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(marker, start=0):
    for i in range(start, len(lines)):
        if marker in lines[i]:
            return i
    return -1

def has(marker):
    return any(marker in l for l in lines)

changes = 0

# ──────────────────────────────────────────
# 1. State + hint data
# ──────────────────────────────────────────
if has('activeHint'):
    print('\u23ed Hint state already exists')
else:
    idx = find_line('const [saveToastMessage, setSaveToastMessage]')
    if idx == -1:
        idx = find_line('const [showSaveToast')

    hint_state = [
        '\n',
        '  // === Yokai Hints ===\n',
        '  const [hintsShown, setHintsShown] = useState<Set<string>>(new Set());\n',
        '  const [activeHint, setActiveHint] = useState<{yokai: string; msg: string} | null>(null);\n',
        '  const YOKAI_HINTS: Record<string, {yokai: string; msg: string}> = {\n',
        "    consult: { yokai: '\U0001F47A', msg: '\u30B5\u30E0\u30E9\u30A4\u306B\u4F55\u3067\u3082\u76F8\u8AC7\u3057\u3066\u307F\u308D\\n\u304A\u524D\u306E\u60A9\u307F\u3001\u805E\u3044\u3066\u3084\u308B\u305E' },\n",
        "    goal: { yokai: '\U0001F479', msg: '\u4ECA\u65E5\u306E\u201C\u305F\u3063\u305F\u4E00\u6B69\u201D\u3092\u6C7A\u3081\u308D\\n\u5C0F\u3055\u304F\u3066\u3044\u3044\u3002\u52D5\u3051' },\n",
        "    review: { yokai: '\U0001F47B', msg: '\u4E00\u65E5\u3092\u632F\u308A\u8FD4\u308C\\n\u7D99\u7D9A\u3053\u305D\u6700\u5F37\u306E\u6B66\u5668\u3060' },\n",
        "    gratitude: { yokai: '\u2728', msg: '\u611F\u8B1D\u30923\u3064\u66F8\u3044\u3066\u5FC3\u3092\u78E8\u3051\\n\u5FC3\u306E\u5F37\u3055\u304C\u6B66\u58EB\u306E\u57FA\u672C\u3060' },\n",
        "    focus: { yokai: '\U0001F525', msg: '\u96C6\u4E2D\u30BF\u30A4\u30DE\u30FC\u3067\u6CA1\u982D\u3057\u308D\\n\u96D1\u5FF5\u3092\u65AC\u308C' },\n",
        "    alarm: { yokai: '\u23F0', msg: '\u30B5\u30E0\u30E9\u30A4\u304C\u671D\u3092\u53E9\u304D\u8D77\u3053\u3059\\n\u4E8C\u5EA6\u5BDD\u306F\u6575\u3060\u305E' },\n",
        "    character: { yokai: '\U0001F9D1\u200D\U0001F393', msg: '\u30EC\u30D9\u30EB\u3092\u4E0A\u3052\u3066\u30B5\u30E0\u30E9\u30A4\u3092\u80B2\u3066\u308D\\n\u304A\u524D\u306E\u6210\u9577\u304C\u5F7C\u306E\u529B\u3060' },\n",
        "    innerWorld: { yokai: '\u2694\uFE0F', msg: '\u4FEE\u884C\u306E\u9593\u3078\u3088\u3046\u3053\u305D\\n\u5DF1\u3092\u77E5\u308A\u3001\u5DF1\u3092\u8D85\u3048\u308D' },\n",
        "    battle: { yokai: '\U0001F479', msg: '\u30DF\u30C3\u30B7\u30E7\u30F3\u3092\u3053\u306A\u3057\u3066\u653B\u6483\u3060\\n\u4FFA\u305F\u3061\u3092\u5012\u3057\u3066\u307F\u308D' },\n",
        "    samuraiWalk: { yokai: '\U0001F5FE', msg: '\u6B69\u3044\u305F\u6B69\u6570\u3067\u65E5\u672C\u3092\u5236\u8987\u3057\u308D\\n5,000\u6B69\u3067\u8DB3\u8DE1\u300110,000\u6B69\u3067\u5236\u8987\u3060' },\n",
        '  };\n',
        '\n',
    ]
    for j, sl in enumerate(hint_state):
        lines.insert(idx + 1 + j, sl)
    changes += 1
    print(f'\u2705 Hint state added at line {idx + 2}')

# ──────────────────────────────────────────
# 2. Load hints from AsyncStorage
# ──────────────────────────────────────────
if has('bushilog.hintsShown'):
    print('\u23ed Hint loader already exists')
else:
    idx = find_line('// Samurai Walk: \u6b69\u6570\u30c8\u30e9\u30c3\u30ad\u30f3\u30b0')
    if idx == -1:
        idx = find_line('useEffect(() => {', 200)

    loader = [
        '\n',
        '  // Load yokai hints\n',
        '  useEffect(() => {\n',
        '    (async () => {\n',
        '      try {\n',
        "        const raw = await AsyncStorage.getItem('bushilog.hintsShown');\n",
        '        if (raw) setHintsShown(new Set(JSON.parse(raw)));\n',
        '      } catch(e) {}\n',
        '    })();\n',
        '  }, []);\n',
        '\n',
    ]
    for j, sl in enumerate(loader):
        lines.insert(idx + j, sl)
    changes += 1
    print(f'\u2705 Hint loader added at line {idx}')

# ──────────────────────────────────────────
# 3. showHintForTab function + tab watcher
# ──────────────────────────────────────────
if has('showHintForTab'):
    print('\u23ed showHintForTab already exists')
else:
    idx = find_line('Load yokai hints')
    if idx == -1:
        idx = find_line('const [hintsShown')
    for i in range(idx, min(idx + 20, len(lines))):
        if '}, []);' in lines[i]:
            idx = i + 1
            break

    watcher = [
        '\n',
        '  const showHintForTab = useCallback((key: string) => {\n',
        '    if (hintsShown.has(key)) return;\n',
        '    const hint = YOKAI_HINTS[key];\n',
        '    if (!hint) return;\n',
        '    setTimeout(() => setActiveHint(hint), 500);\n',
        '    const next = new Set(hintsShown);\n',
        '    next.add(key);\n',
        '    setHintsShown(next);\n',
        "    AsyncStorage.setItem('bushilog.hintsShown', JSON.stringify([...next])).catch(() => {});\n",
        '  }, [hintsShown]);\n',
        '\n',
        '  useEffect(() => {\n',
        '    showHintForTab(tab);\n',
        '  }, [tab]);\n',
        '\n',
    ]
    for j, sl in enumerate(watcher):
        lines.insert(idx + 1 + j, sl)
    changes += 1
    print(f'\u2705 showHintForTab added at line {idx + 2}')

# ──────────────────────────────────────────
# 4. SamuraiWalk hint on open
# ──────────────────────────────────────────
if has("showHintForTab('samuraiWalk"):
    print('\u23ed SamuraiWalk hint already exists')
else:
    idx = find_line('setShowSamuraiWalk(true)')
    if idx != -1:
        # Check if it's in the Pressable onPress
        lines.insert(idx + 1, "            showHintForTab('samuraiWalk');\n")
        changes += 1
        print(f'\u2705 SamuraiWalk hint at line {idx + 2}')
    else:
        print('\u26a0  setShowSamuraiWalk(true) not found')

# ──────────────────────────────────────────
# 5. Render the hint modal (before battleActive)
# ──────────────────────────────────────────
if has('activeHint && ('):
    print('\u23ed Hint modal already exists')
else:
    idx = find_line('{battleActive && w1BossIndex')
    if idx == -1:
        idx = find_line('showSamuraiWalk && (')
    if idx == -1:
        print('\u26a0  Could not find modal insertion point')
    else:
        modal = [
            '      {/* Yokai Hint Modal */}\n',
            '      {activeHint && (\n',
            "        <Pressable\n",
            "          onPress={() => setActiveHint(null)}\n",
            "          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' }}\n",
            '        >\n',
            "          <View style={{ backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28, marginHorizontal: 40, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF3744' }}>\n",
            "            <Text style={{ fontSize: 48, marginBottom: 12 }}>{activeHint.yokai}</Text>\n",
            "            <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{activeHint.msg}</Text>\n",
            "            <Text style={{ color: '#555', fontSize: 12, marginTop: 16 }}>{'\u30BF\u30C3\u30D7\u3067\u9589\u3058\u308B'}</Text>\n",
            '          </View>\n',
            '        </Pressable>\n',
            '      )}\n',
        ]
        for j, ml in enumerate(modal):
            lines.insert(idx + j, ml)
        changes += 1
        print(f'\u2705 Hint modal at line {idx}')

# ──────────────────────────────────────────
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'\n\u2705 Done! {changes} changes. npx expo start --clear')
