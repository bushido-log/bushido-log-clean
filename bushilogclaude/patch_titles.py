#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

old = """const LEVEL_TITLES: { [key: number]: string } = {
  0: '\u540d\u3082\u306a\u304d\u8005',
  1: '\u898b\u7fd2\u3044\u4f8d',
  2: '\u4fee\u884c\u4e2d',
  3: '\u4f8d',
  4: '\u5263\u8c6a',
  5: '\u4fee\u7f85',
  6: '\u5c06\u8ecd',
  7: '\u4f1d\u8aac',
  8: '\u795e\u901f',
  9: '\u8987\u738b',
  10: '\u7121\u53cc',
};"""

new = """const LEVEL_TITLES: { [key: number]: string } = {
  0: '\u540d\u3082\u306a\u304d\u8005',
  1: '\u7121\u4f4d',
  2: '\u898b\u7fd2',
  3: '\u8db3\u8efd',
  4: '\u6b66\u7ae5',
  5: '\u82e5\u4f8d',
  6: '\u4f8d',
  7: '\u4f8d\u5c06',
  8: '\u6b66\u5c06',
  9: '\u6b66\u795e',
  10: '\u9f8d\u795e',
};"""

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('OK! Titles updated!')
else:
    print('ERROR: not found')
