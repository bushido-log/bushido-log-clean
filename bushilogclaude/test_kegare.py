#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

# checkKegare の先頭で同日チェックをスキップしてテスト
old = """      if (json) {
        const data = JSON.parse(json);
        if (data.lastDate === today) {
          setShowKatanaPolish(false);
          return;
        }"""

new = """      if (json) {
        const data = JSON.parse(json);
        // TODO: REMOVE - テスト用に同日チェックを無効化
        // if (data.lastDate === today) {
        //   setShowKatanaPolish(false);
        //   return;
        // }"""

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('OK! Same-day check disabled for testing')
else:
    print('Not found')
