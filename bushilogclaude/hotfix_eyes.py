s = open('App.tsx').read()
old = "Audio.Sound.createAsync(require('./sounds/sfx_eyes.mp3')).then(({sound}) => sound.setVolumeAsync(0.5).then(() => sound.playAsync())).catch(e => {});"
c = s.count(old)
s = s.replace(old, '')
open('App.tsx','w').write(s)
print(f'Done: {c}箇所削除')
