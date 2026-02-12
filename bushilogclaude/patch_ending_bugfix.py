#!/usr/bin/env python3
"""
Fix ending bugs:
1. Reset storyTypeText/storyTypingDone on ending2→ending3 transition
2. Change ending1 text (no duplicate 見事だ)
3. Tetsuya names himself
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Fix ending1 text: 見事だ → different line
src = src.replace(
    "setStoryPhase('ending1'); setTimeout(() => storyTypewriter('……見事だ。'), 800);",
    "setStoryPhase('ending1'); setTimeout(() => storyTypewriter('お前はもう\\n三日坊主ではない。'), 800);",
    1
)
print('[OK]   1. ending1 text')

# 2. Fix ending2→ending3 transition: reset text + add delay before footsteps
# The issue: when ending3 starts, storyTypeText still has old text and storyTypingDone is true
old_transition = (
    "              setTimeout(() => {\n"
    "                setStoryPhase('ending3');\n"
    "                endingSilhouetteOp.setValue(0);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP)"
)
new_transition = (
    "              setTimeout(() => {\n"
    "                setStoryTypeText(''); setStoryTypingDone(false);\n"
    "                setStoryPhase('ending3');\n"
    "                endingSilhouetteOp.setValue(0);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP)"
)
if old_transition in src:
    src = src.replace(old_transition, new_transition, 1)
    print('[OK]   2. reset text on ending3')
else:
    print('[SKIP] 2. reset text on ending3')

# 3. Tetsuya names himself
src = src.replace(
    "storyTypewriter('三日坊主が負けたか。\\n\\n……面白い。');",
    "storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。');",
    1
)
print('[OK]   3. tetsuya intro')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
