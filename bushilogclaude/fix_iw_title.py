#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

old = """          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 4, marginBottom: 8 }}>\u2500\u2500 \u4fee \u884c \u306e \u9593 \u2500\u2500</Text>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>\u4fee\u884c\u306e\u9593</Text>"""

new = """          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: '900', letterSpacing: 4 }}>\u2500\u2500 \u4fee\u884c\u306e\u9593 \u2500\u2500</Text>"""

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('OK! Duplicate title fixed')
else:
    print('Not found')
