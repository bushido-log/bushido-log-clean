#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

idx = c.find('LEVEL_TITLES[levelInfo.level + 1]')
if idx > 0:
    snippet = c[idx:idx+120]
    print(repr(snippet))
