#!/usr/bin/env python3
path = 'App.tsx'
with open(path, 'r') as f:
    c = f.read()
c = c.replace(
    "onClose={() => { setBattleActive(false); setInnerWorldView('menu'); setTab('innerWorld'); }}",
    "onClose={() => { console.log('BATTLE CLOSE'); setBattleActive(false); setInnerWorldView('menu'); setTab('innerWorld'); }}"
)
with open(path, 'w') as f:
    f.write(c)
print('done')
