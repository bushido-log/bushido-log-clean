#!/usr/bin/env python3
"""
BUSHIDO LOG Refactoring Step 3
Extracts game data constants from inside App() to external files.
Uses line-based extraction (indent-aware) to avoid unicode brace issues.
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()
original_count = len(lines)

# Helper: remove lines containing a block, return the block text
def extract_block(lines, start_pattern, end_pattern):
    """Find block from start_pattern to end_pattern, remove from lines, return block."""
    start_idx = None
    end_idx = None
    for i, l in enumerate(lines):
        if start_pattern in l and start_idx is None:
            start_idx = i
        if start_idx is not None and end_pattern in l and i > start_idx:
            end_idx = i + 1
            break
    if start_idx is None or end_idx is None:
        print(f'[WARN] Could not find: {start_pattern}')
        return lines, ''
    block = ''.join(lines[start_idx:end_idx])
    # Remove from lines
    del lines[start_idx:end_idx]
    return lines, block

# Helper: remove single line
def extract_line(lines, pattern):
    for i, l in enumerate(lines):
        if pattern in l:
            block = lines[i]
            del lines[i]
            return lines, block
    print(f'[WARN] Could not find: {pattern}')
    return lines, ''

# ============================================================
# 1. Extract story scenes
# ============================================================
scenes = []
for name in ['STORY_SCENES', 'ATODEYARU_SCENES', 'DEEBU_SCENES', 'MOUMURI_SCENES', 'MK2_SCENES']:
    lines, block = extract_block(lines, f'  const {name} = [', '  ];')
    block = block.strip().replace('const ', 'export const ', 1)
    scenes.append(block)
    print(f'[OK] {name}')

with open('src/data/storyScenes.ts', 'w', encoding='utf-8') as f:
    f.write('// Story scenes for each stage\n\n' + '\n\n'.join(scenes) + '\n')
print('[OK] src/data/storyScenes.ts')

# ============================================================
# 2. Extract game data
# ============================================================
data_blocks = []

# Single-line consts
for name in ['MISSION_TARGET', 'SQ_TOTAL', 'MOUMURI_KANSHA_TARGET', 'DEEBU_HIT_TARGET']:
    lines, block = extract_line(lines, f'  const {name} = ')
    block = block.strip().replace('const ', 'export const ', 1)
    data_blocks.append(block)
    print(f'[OK] {name}')

# Single-line arrays
for name in ['MK2_DAY1', 'MK2_DAY2', 'MK2_DAY3']:
    lines, block = extract_line(lines, f'  const {name} = [')
    block = block.strip().replace('const ', 'export const ', 1)
    data_blocks.append(block)
    print(f'[OK] {name}')

# Multi-line arrays
for name in ['DEEBU_EXERCISES', 'ATODEYARU_QUIPS', 'PHYSICAL_MISSIONS', 'SQ_MISSIONS', 'IMINASHI_MESSAGES', 'SAMURAI_KING_DEFEAT_QUOTES']:
    lines, block = extract_block(lines, f'  const {name} = [', '  ];')
    block = block.strip().replace('const ', 'export const ', 1)
    data_blocks.append(block)
    print(f'[OK] {name}')

# Multi-line objects (use `  };` as end marker)
for name in ['MK2_MISSIONS', 'MK2_TEXT_CFG', 'MK2_LIST_CFG', 'SQ_DATA']:
    lines, block = extract_block(lines, f'  const {name}:', '  };')
    block = block.strip().replace('const ', 'export const ', 1)
    data_blocks.append(block)
    print(f'[OK] {name}')

with open('src/data/gameData.ts', 'w', encoding='utf-8') as f:
    f.write('// Game data: missions, exercises, quips, quiz\n\n' + '\n\n'.join(data_blocks) + '\n')
print('[OK] src/data/gameData.ts')

# ============================================================
# 3. Add imports
# ============================================================
# Find the line with SamuraiAvatar import
for i, l in enumerate(lines):
    if "import { SamuraiAvatar }" in l:
        new_imports = [
            l,  # keep original
            "import { STORY_SCENES, ATODEYARU_SCENES, DEEBU_SCENES, MOUMURI_SCENES, MK2_SCENES } from './src/data/storyScenes';\n",
            "import {\n",
            "  MISSION_TARGET, SQ_TOTAL, MOUMURI_KANSHA_TARGET, DEEBU_HIT_TARGET,\n",
            "  MK2_DAY1, MK2_DAY2, MK2_DAY3, MK2_MISSIONS, MK2_TEXT_CFG, MK2_LIST_CFG,\n",
            "  DEEBU_EXERCISES, ATODEYARU_QUIPS, PHYSICAL_MISSIONS, SQ_MISSIONS, SQ_DATA,\n",
            "  IMINASHI_MESSAGES, SAMURAI_KING_DEFEAT_QUOTES,\n",
            "} from './src/data/gameData';\n",
        ]
        lines[i:i+1] = new_imports
        break
print('[OK] imports added')

# ============================================================
# 4. Clean up stray // TEST MODE comment if orphaned
# ============================================================
for i, l in enumerate(lines):
    if l.strip() == '// TEST MODE: all missions in 1 day':
        if i+1 < len(lines) and lines[i+1].strip() == '':
            del lines[i]
            break

# ============================================================
# 5. Write
# ============================================================
with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(lines)

new_count = len(lines)
print(f'\n✅ Step 3 complete!')
print(f'   App.tsx: {original_count} -> {new_count} lines ({original_count - new_count} lines removed)')
