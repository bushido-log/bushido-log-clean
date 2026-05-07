lines = open('App.tsx', 'r').readlines()

# 1. Remove the misplaced overlay block (find and delete 10 lines)
remove_start = None
for i, line in enumerate(lines):
    if '{/* === Samurai Walk === */}' in line:
        remove_start = i
        break

if remove_start is not None:
    # Remove from comment to closing )}
    remove_end = remove_start
    for j in range(remove_start, min(remove_start + 12, len(lines))):
        if ')}' in lines[j] and 'showSamuraiWalk' not in lines[j]:
            remove_end = j + 1
            break
    del lines[remove_start:remove_end]
    print(f'Removed old overlay from line {remove_start+1} ({remove_end - remove_start} lines)')

# 2. Insert at top level, right before battleActive
insert_block = [
    '      {/* === Samurai Walk === */}\n',
    '      {showSamuraiWalk && (\n',
    "        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997, backgroundColor: '#0a0a10' }}>\n",
    '          <SamuraiWalkScreen\n',
    '            todaySteps={walkData.todaySteps}\n',
    '            onClose={() => setShowSamuraiWalk(false)}\n',
    '            playTapSound={playTapSound}\n',
    '          />\n',
    '        </View>\n',
    '      )}\n',
]

for i, line in enumerate(lines):
    if '{battleActive && w1BossIndex' in line:
        for j, bl in enumerate(insert_block):
            lines.insert(i + j, bl)
        print(f'Inserted overlay at line {i+1} (before battleActive)')
        break

open('App.tsx', 'w').writelines(lines)
print('Done!')
