#!/usr/bin/env python3
"""Fix: stop all ending sounds when transitioning to ending4"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Add sound ref array
src = src.replace(
    "  const endingStarted = useRef(false);",
    "  const endingStarted = useRef(false);\n"
    "  const endingSounds = useRef<any[]>([]);",
    1
)
print('[OK]   1. sound ref')

# 2. Store sounds when creating them - replace all footstep createAsync
src = src.replace(
    "Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.8).then(() => sound.playAsync())).catch(e => {});",
    "Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {});",
)
print('[OK]   2. store footstep sounds')

# Store eye glow sound
src = src.replace(
    "Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => sound.setVolumeAsync(0.6).then(() => sound.playAsync())).catch(e => {});",
    "Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});",
    1
)
print('[OK]   3. store eye glow sound')

# 3. Stop all sounds when tapping ending3 -> ending4
src = src.replace(
    "            <Pressable onPress={() => { if (storyTypingDone) {\n"
    "              endingW2Op.setValue(0);\n"
    "              setStoryPhase('ending4');",

    "            <Pressable onPress={() => { if (storyTypingDone) {\n"
    "              endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = [];\n"
    "              endingW2Op.setValue(0);\n"
    "              setStoryPhase('ending4');",
    1
)
print('[OK]   4. stop sounds on ending4')

# 4. Clear sounds array when entering ending sequence
src = src.replace(
    "endingStarted.current = false; setStoryPhase('ending1');",
    "endingStarted.current = false; endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = []; setStoryPhase('ending1');",
    1
)
print('[OK]   5. clear sounds on enter')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
