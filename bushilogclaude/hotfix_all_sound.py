"""全音修正 - ローカル現状対応版"""
s = open('App.tsx').read()
c = 0

# 1. BGM+ボイス → タイミング分離 + 音量制御
for voice in ['VOICE_MK_APPEAR', 'VOICE_ATO_APPEAR', 'VOICE_DEEBU_APPEAR', 'VOICE_MOUMURI_APPEAR', 'VOICE_MK2_APPEAR']:
    old = f'playVoice(BGM_MONSTER_APPEAR); playVoice({voice});'
    new = f'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice({voice}), 1500);'
    if old in s:
        s = s.replace(old, new, 1); c += 1

print(f'[OK] BGM+ボイス分離: {c}箇所')

# 2. playVoice に stopAfterMs 追加
old_pv = """  const playVoice = async (voiceAsset: any, volume: number = 1.0) => {
    try {
      const { sound } = await Audio.Sound.createAsync(voiceAsset);
      await sound.setVolumeAsync(Math.min(volume, MASTER_VOLUME));
      await sound.playAsync();
    } catch(e) { console.log('voice play error', e); }
  };"""
new_pv = """  const playVoice = async (voiceAsset: any, volume: number = 1.0, stopAfterMs?: number) => {
    try {
      const { sound } = await Audio.Sound.createAsync(voiceAsset);
      await sound.setVolumeAsync(Math.min(volume, MASTER_VOLUME));
      await sound.playAsync();
      if (stopAfterMs) {
        setTimeout(async () => { try { await sound.stopAsync(); await sound.unloadAsync(); } catch(e) {} }, stopAfterMs);
      }
    } catch(e) { console.log('voice play error', e); }
  };"""
if old_pv in s:
    s = s.replace(old_pv, new_pv, 1)
    print('[OK] playVoice: stopAfterMs追加')

# 3. 見事だ削除
old_m = "    speakSamurai('見事だ'); samuraiSpeak('見事だ');\n"
mc = s.count(old_m)
if mc > 0:
    s = s.replace(old_m, ''); print(f'[OK] 見事だ削除: {mc}箇所')

# 4. WIN_SOUND 3秒停止
old_w = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())).catch(e => {});"
new_w = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => { sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); }).catch(e => {});"
if old_w in s:
    s = s.replace(old_w, new_w, 1); print('[OK] WIN_SOUND: 3秒停止')

# 5. EYE_GLOW削除
old_e = """                  playVoice(SFX_TETSUYA_APPEAR, 0.8);
                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});"""
new_e = """                  playVoice(SFX_TETSUYA_APPEAR, 0.8);"""
if old_e in s:
    s = s.replace(old_e, new_e, 1); print('[OK] EYE_GLOW削除')

# 6. 足音音量下げ
s = s.replace(
    "sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
s = s.replace(
    "sound.setVolumeAsync(1.0).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
print('[OK] 足音音量下げ')

open('App.tsx', 'w').write(s)
print('\n✅ 完了')
