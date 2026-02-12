#!/usr/bin/env python3
"""Fix duplicate const declarations"""
FILE = 'App.tsx'
with open(FILE, 'r') as f:
    lines = f.readlines()

seen = set()
out = []
dupes = 0
for line in lines:
    stripped = line.strip()
    if stripped.startswith('const ') and "require(" in stripped:
        if stripped in seen:
            dupes += 1
            print(f'[REMOVED] {stripped[:60]}...')
            continue
        seen.add(stripped)
    out.append(line)

with open(FILE, 'w') as f:
    f.writelines(out)
print(f'\n✅ Removed {dupes} duplicate declarations')
