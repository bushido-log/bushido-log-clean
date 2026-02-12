#!/usr/bin/env python3
"""
Fix:
1. Remove ??? node from map (clutters title)
2. Fix footstep infinite loop (guard ref)
3. Reduce footsteps 3->2, shorten overall timing
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Remove ??? node from stage map
old_node = "\n        { id: 6, name: '???', icon: NODE_LOCKED, cleared: false, x: 0.5, y: 0.08 },"
if old_node in src:
    src = src.replace(old_node, '', 1)
    print('[OK]   1. removed ??? node')
else:
    print('[SKIP] 1. ??? node')

# 2. Remove ??? tap handler
old_tap = " else if (stage.id === 6) { showSaveSuccess('新たな敵が待っている…'); }"
if old_tap in src:
    src = src.replace(old_tap, '', 1)
    print('[OK]   2. removed ??? tap')
else:
    print('[SKIP] 2. ??? tap')

# 3. Add guard ref
old_ref = "  const endingSilhouetteOp = useRef(new Animated.Value(0)).current;"
new_ref = "  const endingSilhouetteOp = useRef(new Animated.Value(0)).current;\n  const endingStarted = useRef(false);"
if old_ref in src:
    src = src.replace(old_ref, new_ref, 1)
    print('[OK]   3. guard ref')
else:
    print('[SKIP] 3. guard ref')

# 4. Guard ending1 tap
old_press = "            <Pressable onPress={() => { if (storyTypingDone) {\n              endingW1Op.setValue(0);\n              setStoryPhase('ending2');"
new_press = "            <Pressable onPress={() => { if (storyTypingDone && !endingStarted.current) {\n              endingStarted.current = true;\n              endingW1Op.setValue(0);\n              setStoryPhase('ending2');"
if old_press in src:
    src = src.replace(old_press, new_press, 1)
    print('[OK]   4. guard on tap')
else:
    print('[SKIP] 4. guard on tap')

# 5. Reset guard on enter
old_enter = "setStoryPhase('ending1'); setTimeout(() => storyTypewriter("
new_enter = "endingStarted.current = false; setStoryPhase('ending1'); setTimeout(() => storyTypewriter("
if old_enter in src:
    src = src.replace(old_enter, new_enter, 1)
    print('[OK]   5. reset guard')
else:
    print('[SKIP] 5. reset guard')

# 6. Reduce footsteps 3->2 and shorten timings
# Old: 3 footsteps at 1500, 2800, 4100 + silhouette at 5500 + text at 7500
# New: 2 footsteps at 1500, 3000 + silhouette at 4000 + text at 5500
old_footsteps = (
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.7).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.8).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2800);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.9).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 4100);\n"
    "                setTimeout(() => {\n"
    "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
    "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => sound.setVolumeAsync(0.6).then(() => sound.playAsync())).catch(e => {});\n"
    "                }, 5500);\n"
    "                setTimeout(() => { storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。'); }, 7500);"
)

new_footsteps = (
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.8).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(1.0).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 3000);\n"
    "                setTimeout(() => {\n"
    "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
    "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => sound.setVolumeAsync(0.6).then(() => sound.playAsync())).catch(e => {});\n"
    "                }, 4000);\n"
    "                setTimeout(() => { storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。'); }, 5500);"
)

if old_footsteps in src:
    src = src.replace(old_footsteps, new_footsteps, 1)
    print('[OK]   6. footsteps 3->2 + shorter')
else:
    print('[SKIP] 6. footsteps')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! {len(src)-len(original):+d} chars')
