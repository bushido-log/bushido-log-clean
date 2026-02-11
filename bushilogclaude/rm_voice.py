#!/usr/bin/env python3
APP_PATH = "App.tsx"
f=open(APP_PATH,'r'); c=f.read(); f.close()
lines = c.split('\n')
for i, line in enumerate(lines):
    if 'speakSamurai' in line and i > 5000 and i < 5040:
        if 'やってみろ' in line or '\u3084\u3063\u3066\u307f\u308d' in line:
            lines[i] = '      // silent'
            print(f"[OK] Removed line {i+1}")
            break
c = '\n'.join(lines)
f=open(APP_PATH,'w'); f.write(c); f.close()
