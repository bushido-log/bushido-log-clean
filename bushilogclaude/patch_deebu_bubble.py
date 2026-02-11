#!/usr/bin/env python3
"""Fix deebu text position to fit inside speech bubble"""
import sys
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# Adjust position down slightly and add more horizontal padding + smaller font for stage 3
src = src.replace(
    "position: 'absolute', top: storyStage === 3 ? SCREEN_H * 0.28 : SCREEN_H * 0.50, left: 55, right: 55, justifyContent: 'center', alignItems: 'center'",
    "position: 'absolute', top: storyStage === 3 ? SCREEN_H * 0.32 : SCREEN_H * 0.50, left: storyStage === 3 ? 70 : 55, right: storyStage === 3 ? 70 : 55, justifyContent: 'center', alignItems: 'center'",
    1
)

# Make font slightly smaller for stage 3 to fit bubble
src = src.replace(
    "<Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>{storyTypeText}</Text>",
    "<Text style={{ color: '#333', fontSize: storyStage === 3 ? 15 : 17, fontWeight: 'bold', textAlign: 'center', lineHeight: storyStage === 3 ? 24 : 28, letterSpacing: 1 }}>{storyTypeText}</Text>",
    1
)

if src == original:
    print('[ERROR] No changes')
    sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print('\u2705 Fixed bubble text position')
