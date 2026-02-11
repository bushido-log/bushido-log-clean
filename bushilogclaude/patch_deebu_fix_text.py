#!/usr/bin/env python3
"""デーブのセリフ位置（上へ）+ セリフ内容変更"""
import sys
FILE = 'App.tsx'

def patch(content, old, new, label):
    if old not in content:
        print(f'[SKIP] {label}')
        return content
    content = content.replace(old, new, 1)
    print(f'[OK]   {label}')
    return content

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. セリフ位置をデーブのときだけ上に移動（吹き出しの中に入るように）
src = patch(src,
    "position: 'absolute', top: SCREEN_H * 0.50, left: 55, right: 55",
    "position: 'absolute', top: storyStage === 3 ? SCREEN_H * 0.28 : SCREEN_H * 0.50, left: 55, right: 55",
    '1. text position up (stage3 only)')

# 2. Scene 1 セリフ変更
src = patch(src,
    "{ img: 1, text: '\\u3075\\u3041\\u301c...\\u52d5\\u304f\\u306e\\u3060\\u308b\\u3044\\u3002\\\\n\\u98df\\u3063\\u3066\\u5bdd\\u3066\\u308c\\u3070\\u3044\\u3044\\u3058\\u3083\\u3093\\u3002' }",
    "{ img: 1, text: '\\u4ffa\\u307f\\u305f\\u3044\\u306b\\u306a\\u308c\\u3088\\u3002\\\\n\\u98df\\u3063\\u3066\\u5bdd\\u3066\\u308c\\u3070\\u3044\\u3044\\u3058\\u3083\\u3093\\u3002' }",
    '2. scene1 text')

# 3. Scene 4 セリフ変更
src = patch(src,
    "{ img: 1, text: '\\u3067\\u304d\\u308b\\u3082\\u3093\\u306a\\u3089\\\\n\\u4f53\\u52d5\\u304b\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\\\n\\u3069\\u3046\\u305b\\u7121\\u7406\\u3060\\u308d\\uff1f' }",
    "{ img: 1, text: '\\u3067\\u304d\\u308b\\u3082\\u3093\\u306a\\u3089\\u3001\\\\n\\u4f53\\u52d5\\u304b\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\\\n\\u304a\\u83d3\\u5b50\\u3082\\u6211\\u6162\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\\\n\\u3069\\u3046\\u305b\\u7121\\u7406\\u3060\\u308d\\uff1f' }",
    '3. scene4 text')

if src == original:
    print('\n[ERROR] No changes')
    sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
