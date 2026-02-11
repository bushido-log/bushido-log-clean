#!/usr/bin/env python3
APP_PATH = "App.tsx"
lines = open(APP_PATH, 'r').readlines()
# Find first countMissionTap
for i, line in enumerate(lines):
    if 'const countMissionTap' in line:
        # Find end of this function
        depth = 0
        end = i
        for j in range(i, len(lines)):
            depth += lines[j].count('{') - lines[j].count('}')
            if depth == 0 and j > i:
                end = j
                break
        del lines[i:end+1]
        print(f"Removed lines {i+1}-{end+1}")
        break
open(APP_PATH, 'w').writelines(lines)
n = sum(1 for l in lines if 'countMissionTap' in l)
print(f"Remaining countMissionTap defs: {sum(1 for l in lines if 'const countMissionTap' in l)}")
