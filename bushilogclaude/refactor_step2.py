#!/usr/bin/env python3
"""
BUSHIDO LOG Refactoring Step 2
Extracts:
  1. StyleSheet (2300+ lines) -> src/styles.ts
  2. Privacy/Terms text -> src/data/texts.ts
  3. SamuraiAvatar component -> src/components/SamuraiAvatar.tsx

Run from: bushilogclaude/ directory (after Step 1)
"""
import os

FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original_len = len(src)
original_lines = src.count('\n')

os.makedirs('src/components', exist_ok=True)

# ============================================================
# 1. Extract StyleSheet -> src/styles.ts
# ============================================================
styles_marker = "const styles = StyleSheet.create({"
styles_start = src.index(styles_marker)
styles_end = src.rindex("});") + 3

styles_block = src[styles_start:styles_end]

styles_ts = f"import {{ StyleSheet }} from 'react-native';\n\nexport {styles_block}\n"

with open('src/styles.ts', 'w', encoding='utf-8') as f:
    f.write(styles_ts)
print(f'[OK] src/styles.ts ({styles_block.count(chr(10))} lines)')

# Remove styles block from App.tsx
src = src[:styles_start].rstrip('\n') + '\n' + src[styles_end:].lstrip('\n')

# Add styles import
import_anchor = "import { callSamuraiKing, callSamuraiMissionGPT } from './src/utils/api';\n"
src = src.replace(import_anchor, import_anchor + "import { styles } from './src/styles';\n", 1)
print('[OK] styles import added')

# ============================================================
# 2. Extract Privacy/Terms -> src/data/texts.ts
# ============================================================
privacy_marker = "const PRIVACY_POLICY_TEXT = `"
privacy_start = src.index(privacy_marker)

terms_marker = "const TERMS_OF_SERVICE_TEXT = `"
terms_start = src.index(terms_marker)
terms_end = src.index("`;", terms_start + len(terms_marker)) + 2

texts_block = src[privacy_start:terms_end]
texts_ts = texts_block.replace('const PRIVACY_POLICY_TEXT', 'export const PRIVACY_POLICY_TEXT', 1)
texts_ts = texts_ts.replace('const TERMS_OF_SERVICE_TEXT', 'export const TERMS_OF_SERVICE_TEXT', 1)
texts_ts += '\n'

with open('src/data/texts.ts', 'w', encoding='utf-8') as f:
    f.write(texts_ts)
print('[OK] src/data/texts.ts')

src = src[:privacy_start].rstrip('\n') + '\n\n' + src[terms_end:].lstrip('\n')

src = src.replace(
    "import { styles } from './src/styles';\n",
    "import { styles } from './src/styles';\nimport { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from './src/data/texts';\n",
    1
)
print('[OK] texts import added')

# ============================================================
# 3. Extract SamuraiAvatar -> src/components/SamuraiAvatar.tsx
# ============================================================
avatar_section_start = "// =========================\n// UI: Samurai Avatar\n// =========================\n"
avatar_section_end = "// =========================\n// Main App\n// ========================="

start_idx = src.index(avatar_section_start)
end_idx = src.index(avatar_section_end)

avatar_block = src[start_idx + len(avatar_section_start):end_idx].strip()

avatar_tsx = """import React from 'react';
import { View, Text } from 'react-native';
import { MAX_LEVEL } from '../data/constants';
import { styles } from '../styles';

export """ + avatar_block + "\n"

with open('src/components/SamuraiAvatar.tsx', 'w', encoding='utf-8') as f:
    f.write(avatar_tsx)
print('[OK] src/components/SamuraiAvatar.tsx')

src = src[:start_idx] + '\n' + src[end_idx:]

src = src.replace(
    "import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from './src/data/texts';\n",
    "import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from './src/data/texts';\nimport { SamuraiAvatar } from './src/components/SamuraiAvatar';\n",
    1
)
print('[OK] SamuraiAvatar import added')

# ============================================================
# 4. Write updated App.tsx
# ============================================================
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)

new_lines = src.count('\n')
print(f'\n✅ Refactoring Step 2 complete!')
print(f'   App.tsx: {original_lines} -> {new_lines} lines ({original_lines - new_lines} lines removed)')
print(f'   App.tsx: {original_len:,} -> {len(src):,} chars')
