#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

old = "      showSaveSuccess`\u4fee\u884c\u9054\u6210\uff01+${xpGain} XP`);"
new = "      showSaveSuccess(`\u4fee\u884c\u9054\u6210\uff01+${xpGain} XP`);\n      triggerYokaiDefeat('consult', 0);"

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('Fixed! Mission hook + backtick bug')
else:
    print('Not found')
