#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Logo tap -> battle entry, remove battle buttons from dojo & character tab"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. CHANGE LOGO TAP: character -> battle
# ============================================
old_logo = """      <Pressable 
        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setTab('character'); 
          } else { 
            showSaveSuccess('\u4fee\u884c\u306e\u6210\u679c\u306f\u3001\u3084\u304c\u3066\u59ff\u3092\u6301\u3064'); 
          } 
        }}"""

new_logo = """      <Pressable 
        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setTab('character'); 
          } else { 
            showSaveSuccess('\u4fee\u884c\u306e\u6210\u679c\u306f\u3001\u3084\u304c\u3066\u59ff\u3092\u6301\u3064'); 
          } 
        }}
        onLongPress={() => {
          if (!isPro && getLevelFromXp(totalXp).level < 3) {
            playTapSound();
            showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
            return;
          }
          playAttackSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setBattleMode('select');
          setTab('battle');
          setShowStartScreen(false);
        }}"""

if old_logo in content:
    content = content.replace(old_logo, new_logo)
    print('1/3 Logo long-press -> battle OK')
else:
    print('1/3 SKIP - logo not found')

# ============================================
# 2. REMOVE DOJO BATTLE BUTTON
# ============================================
# Find the battle button in dojo menu (between alarm button and end)
import re

dojo_btn_pattern = r'\n      <Pressable\n        style=\{\[styles\.startButton, !isPro && getLevelFromXp\(totalXp\)\.level < 3.*?修行対戦.*?</Pressable>'
match = re.search(dojo_btn_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + content[match.end():]
    print('2/3 Dojo battle button removed OK')
else:
    print('2/3 SKIP - dojo battle button not found')

# ============================================
# 3. REMOVE CHARACTER TAB BATTLE BUTTON
# ============================================
char_btn_pattern = r'\n        \{/\* Battle Button \*/\}\n        <Pressable.*?修行対戦.*?</Pressable>'
match2 = re.search(char_btn_pattern, content, re.DOTALL)
if match2:
    content = content[:match2.start()] + content[match2.end():]
    print('3/3 Character tab battle button removed OK')
else:
    print('3/3 SKIP - character battle button not found')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== DONE ===')
print('  Logo long-press -> battle (hidden entrance!)')
print('  Dojo & character tab battle buttons removed')
