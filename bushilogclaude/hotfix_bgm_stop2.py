"""エンディング音声完全停止: sfx_win + BGM"""
s = open('App.tsx').read()

# 1. sfx_win.mp3 → 3秒で停止（5箇所）
old_win = "try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}"
new_win = "try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}"
c = s.count(old_win)
s = s.replace(old_win, new_win)
print(f'[OK] sfx_win 3秒停止: {c}箇所')

# 2. ending1に入る時にBGM強制停止
old = "endingSounds.current = []; setStoryPhase('ending1');"
new = "endingSounds.current = []; if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('ending1');"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] ending1: BGM強制停止')

# 3. completeStoryEvent時にもBGM停止
old = "  const completeStoryEvent = async () => {"
new = "  const completeStoryEvent = async () => {\n    if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; }"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] completeStoryEvent: BGM強制停止')

open('App.tsx','w').write(s)
print('Done')
