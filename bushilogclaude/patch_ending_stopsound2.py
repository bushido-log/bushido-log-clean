#!/usr/bin/env python3
"""
Fix footstep sounds not stopping.
Root cause: setTimeout callbacks fire even after phase changes.
Solution: Store timer IDs + use active flag to prevent sound creation after leaving.
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Add timer ref (after endingSounds ref)
old = "  const endingSounds = useRef<any[]>([]);"
new = "  const endingSounds = useRef<any[]>([]);\n  const endingTimers = useRef<any[]>([]);\n  const endingActive = useRef(false);"
if old in src:
    src = src.replace(old, new, 1)
    print('[OK]   1. timer refs')
else:
    print('[SKIP] 1. timer refs')

# 2. Replace the entire setTimeout sequence in ending1->ending3 transition
# Wrap each setTimeout with timer storage + active check
old_sequence = (
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500);\n"
    "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(1.0).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 3000);\n"
    "                setTimeout(() => {\n"
    "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
    "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});\n"
    "                }, 4000);\n"
    "                setTimeout(() => { storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。'); }, 5500);"
)

new_sequence = (
    "                endingActive.current = true;\n"
    "                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500));\n"
    "                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(1.0).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 3000));\n"
    "                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return;\n"
    "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
    "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});\n"
    "                }, 4000));\n"
    "                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。'); }, 5500));"
)

if old_sequence in src:
    src = src.replace(old_sequence, new_sequence, 1)
    print('[OK]   2. guarded timers')
else:
    print('[SKIP] 2. guarded timers')

# 3. Stop everything when tapping ending3 -> ending4
old_e4 = (
    "            <Pressable onPress={() => { if (storyTypingDone) {\n"
    "              endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = [];\n"
    "              endingW2Op.setValue(0);\n"
    "              setStoryPhase('ending4');"
)
new_e4 = (
    "            <Pressable onPress={() => { if (storyTypingDone) {\n"
    "              endingActive.current = false;\n"
    "              endingTimers.current.forEach(t => clearTimeout(t)); endingTimers.current = [];\n"
    "              endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = [];\n"
    "              endingW2Op.setValue(0);\n"
    "              setStoryPhase('ending4');"
)
if old_e4 in src:
    src = src.replace(old_e4, new_e4, 1)
    print('[OK]   3. cleanup on ending4')
else:
    print('[SKIP] 3. cleanup on ending4')

# 4. Also cleanup when completing story event (going back to main)
old_complete = "endingStarted.current = false; endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = []; setStoryPhase('ending1');"
new_complete = "endingStarted.current = false; endingActive.current = false; endingTimers.current.forEach(t => clearTimeout(t)); endingTimers.current = []; endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = []; setStoryPhase('ending1');"
if old_complete in src:
    src = src.replace(old_complete, new_complete, 1)
    print('[OK]   4. cleanup on enter')
else:
    print('[SKIP] 4. cleanup on enter')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
