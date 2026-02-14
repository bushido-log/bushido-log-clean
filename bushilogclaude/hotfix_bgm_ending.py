s = open('App.tsx').read()
stop = "if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } "
old = "setTimeout(() => { setStoryPhase('defeat');"
new = "setTimeout(() => { " + stop + "setStoryPhase('defeat');"
c = s.count(old)
s = s.replace(old, new)
open('App.tsx','w').write(s)
print(f'Done: {c}箇所')
