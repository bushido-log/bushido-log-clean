#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

# Fix the broken newline in tutorial
old = "目標を書いて保存すると{'\n'}妖怪が倒れる"
new = '目標を書いて保存すると{"\\n"}妖怪が倒れる'

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('Fixed!')
else:
    print('Not found - trying raw fix')
    # The actual issue is a literal newline between {' and '}
    import re
    c2 = re.sub(r"目標を書いて保存すると\{'\n'\}妖怪が倒れる", '目標を書いて保存すると{"\\n"}妖怪が倒れる', c)
    if c2 != c:
        with open('App.tsx','w',encoding='utf-8') as f:
            f.write(c2)
        print('Fixed with regex!')
    else:
        # Direct line fix
        lines = c.split('\n')
        for i, line in enumerate(lines):
            if "目標を書いて保存すると{'" in line:
                lines[i] = '                目標を書いて保存すると{"\\n"}妖怪が倒れる'
                if i+1 < len(lines) and "'}妖怪が倒れる" in lines[i+1]:
                    lines[i+1] = ''
                print(f'Fixed at line {i+1}!')
                break
        with open('App.tsx','w',encoding='utf-8') as f:
            f.write('\n'.join(lines))
