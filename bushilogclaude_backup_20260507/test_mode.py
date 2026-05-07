#!/usr/bin/env python3
"""test_mode.py on|off"""
import sys, shutil, re, glob

if len(sys.argv) < 2 or sys.argv[1] not in ('on', 'off'):
    print('Usage: python3 test_mode.py on|off')
    sys.exit(1)

mode = sys.argv[1]
bwd = 'src/data/battleWorldData.ts'
app = 'App.tsx'

if mode == 'on':
    shutil.copy2(bwd, bwd + '.bak_pretest')
    shutil.copy2(app, app + '.bak_pretest')
    
    with open(bwd, 'r') as f:
        lines = f.readlines()
    new_lines = []
    for line in lines:
        if re.match(r'\s+hp:\s*\d{4,}', line):
            line = re.sub(r'(hp:\s*)\d+', r'\g<1>100', line)
        if 'baseDamage:' in line:
            line = re.sub(r'(baseDamage:\s*)\d+', r'\g<1>50', line)
        if 'attackDamage:' in line:
            line = re.sub(r'(attackDamage:\s*)\d+', r'\g<1>1', line)
        if 'quizTimeLimit:' in line:
            line = re.sub(r'(quizTimeLimit:\s*)\d+', r'\g<1>60', line)
        if 'easy: 200, normal: 150, hard: 100' in line:
            line = line.replace('easy: 200, normal: 150, hard: 100', 'easy: 9999, normal: 9999, hard: 9999')
        new_lines.append(line)
    with open(bwd, 'w') as f:
        f.writelines(new_lines)
    print('✅ battleWorldData.ts → テストモード')
    print('🧪 テストモード ON！  npx expo start --clear')

elif mode == 'off':
    if glob.glob(bwd + '.bak_pretest'):
        shutil.copy2(bwd + '.bak_pretest', bwd)
        print('✅ battleWorldData.ts ← 復元')
    if glob.glob(app + '.bak_pretest'):
        shutil.copy2(app + '.bak_pretest', app)
        print('✅ App.tsx ← 復元')
    print('🎮 通常モード！ npx expo start --clear')
