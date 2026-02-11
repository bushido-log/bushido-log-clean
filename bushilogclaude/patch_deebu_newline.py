#!/usr/bin/env python3
"""Fix DEEBU_SCENES \\n -> actual newline in JS"""
import sys
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# Find and fix DEEBU_SCENES block - replace \\n with \n in scene text
import re

def fix_deebu_newlines(match):
    return match.group(0).replace('\\\\n', '\\n')

# Match each DEEBU_SCENES line
src = re.sub(r"(const DEEBU_SCENES = \[.*?\];)", fix_deebu_newlines, src, flags=re.DOTALL)

# Also fix photo section text
src = src.replace(
    "\\u4eca\\u6211\\u6162\\u3057\\u305f\\u3044\\u3082\\u306e\\u3092\\u64ae\\u308c\\u3002\\\\n\\u305d\\u308c\\u304c\\u304a\\u524d\\u306e\\u5f31\\u3055\\u3060\\u3002",
    "\\u4eca\\u6211\\u6162\\u3057\\u305f\\u3044\\u3082\\u306e\\u3092\\u64ae\\u308c\\u3002\\n\\u305d\\u308c\\u304c\\u304a\\u524d\\u306e\\u5f31\\u3055\\u3060\\u3002"
)

# Also fix atodeyaru mission brief
src = src.replace(
    "今日のルーティンを半分こなし\\\\nTODOを全て完了せよ",
    "今日のルーティンを半分こなし\\nTODOを全て完了せよ"
)

if src == original:
    print('[ERROR] No changes')
    sys.exit(1)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\u2705 Fixed DEEBU_SCENES newlines')
