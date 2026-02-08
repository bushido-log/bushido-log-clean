#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

old = """        // TODO: REMOVE - テスト用に同日チェックを無効化
        // if (data.lastDate === today) {
        //   setShowKatanaPolish(false);
        //   return;
        // }"""

new = """        if (data.lastDate === today) {
          setShowKatanaPolish(false);
          return;
        }"""

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('OK! Same-day check restored')
else:
    print('Not found')
