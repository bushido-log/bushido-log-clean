"""ホットフィックス: エンディング音うるさい問題"""
with open('App.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# 1. WIN_SOUND 3秒で停止
old = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())).catch(e => {});"
new = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => { sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); }).catch(e => {});"
if old in src:
    src = src.replace(old, new, 1); print('[OK] WIN_SOUND: 3秒停止')

# 2. SFX_EYE_GLOW削除
old = """                  playVoice(SFX_TETSUYA_APPEAR, 0.8);
                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});"""
new = """                  playVoice(SFX_TETSUYA_APPEAR, 0.8);"""
if old in src:
    src = src.replace(old, new, 1); print('[OK] EYE_GLOW削除')

# 3. 足音音量下げ
src = src.replace(
    "sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
src = src.replace(
    "sound.setVolumeAsync(1.0).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
print('[OK] 足音音量下げ')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('✅ 完了')
