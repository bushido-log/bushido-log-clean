s = open('src/data/gameData.ts').read()

# Fix alarm phase specifically (match full alarm line)
old = "alarm: { icon: '\\u23f0', title: '\\u65e9\\u8d77\\u304d\\u5ba3\\u8a00', sub: '\\u660e\\u65e5\\u4f55\\u6642\\u306b\\u8d77\\u304d\\u308b\\u304b\\u5ba3\\u8a00\\u3057\\u308d', phase: 'mk2_text' }"
new = "alarm: { icon: '\\u23f0', title: '\\u65e9\\u8d77\\u304d\\u5ba3\\u8a00', sub: '\\u30a2\\u30e9\\u30fc\\u30e0\\u3092\\u30bb\\u30c3\\u30c8\\u3057\\u308d', phase: 'mk2_alarm' }"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] alarm: mk2_alarm + sub変更')
else:
    print('[SKIP] already patched or not found')

open('src/data/gameData.ts', 'w').write(s)
print('Done')
