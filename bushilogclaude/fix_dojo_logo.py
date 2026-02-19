#!/usr/bin/env python3
"""fix_dojo_logo.py — 道場ロゴのタップ問題を修正"""

path = 'App.tsx'
with open(path, 'r') as f:
    c = f.read()

# Replace the logo handler to always work (remove level gate)
old = """        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setInnerWorldView('menu');
            if (mikkabozuEventDone || innerWorldUnlocked) { setTab('innerWorld'); setShowStartScreen(false); } // gated by mikkabozu
          } else { 
            showSaveSuccess('修行の成果は、やがて姿を持つ'); 
          } 
        }}"""

new = """        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          console.log('DOJO LOGO TAP');
          setShowStartScreen(false); 
          setInnerWorldView('menu');
          setTab('innerWorld');
        }}"""

if old in c:
    c = c.replace(old, new)
    print('✅ Logo handler simplified')
else:
    print('⚠  Exact match not found, trying line-based fix')
    lines = c.split('\n')
    for i, line in enumerate(lines):
        if 'getLevelFromXp(totalXp)' in line and i > 2750 and i < 2780:
            print(f'  Found level check at line {i+1}: {line.strip()[:60]}')
    
with open(path, 'w') as f:
    f.write(c)

print('done')
