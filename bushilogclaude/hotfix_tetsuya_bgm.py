s = open('App.tsx').read()

# SFX_TETSUYA_APPEAR → 10秒で停止
old = "playVoice(SFX_TETSUYA_APPEAR, 0.8);"
new = "Audio.Sound.createAsync(SFX_TETSUYA_APPEAR).then(({sound}) => { sound.setVolumeAsync(0.8).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 10000); }).catch(e => {});"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] テツヤBGM: 10秒停止')

open('App.tsx','w').write(s)
print('Done')
