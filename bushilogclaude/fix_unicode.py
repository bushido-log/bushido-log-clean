#!/usr/bin/env python3
# -*- coding: utf-8 -*-
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

import re

# Find renderBattleTab and fix all \\uXXXX sequences
# These are literal \u in the source that should be actual unicode chars
start = c.find('const renderBattleTab = () => {')
end = c.find('const renderCharacterTab', start)

if start > 0 and end > start:
    section = c[start:end]
    
    # Replace \\uXXXX with actual unicode
    def fix_unicode(match):
        code = int(match.group(1), 16)
        return chr(code)
    
    fixed = re.sub(r'\\u([0-9a-fA-F]{4})', fix_unicode, section)
    
    # Also fix \\U0001fXXX (emoji)
    def fix_unicode_long(match):
        code = int(match.group(1), 16)
        return chr(code)
    
    fixed = re.sub(r'\\U([0-9a-fA-F]{8})', fix_unicode_long, fixed)
    
    c = c[:start] + fixed + c[end:]
    print('Battle tab unicode fixed!')

# Also fix renderYokaiBanner
start2 = c.find('const renderYokaiBanner = ')
if start2 > 0:
    end2 = c.find('\n  };', start2) + 5
    section2 = c[start2:end2]
    fixed2 = re.sub(r'\\u([0-9a-fA-F]{4})', fix_unicode, section2)
    fixed2 = re.sub(r'\\U([0-9a-fA-F]{8})', fix_unicode_long, fixed2)
    c = c[:start2] + fixed2 + c[end2:]
    print('Yokai banner unicode fixed!')

with open('App.tsx','w',encoding='utf-8') as f:
    f.write(c)

print('=== Unicode fix done ===')
