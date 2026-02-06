#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    content = f.read()

old = '「過去は変えられぬ。\nだが、解釈は変えられる」'
new = '「過去は変えられぬ。だが、解釈は変えられる」'

if old in content:
    content = content.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(content)
    print('Fixed!')
else:
    print('Not found')
