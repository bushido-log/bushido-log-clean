#!/usr/bin/env python3
"""merge_difficulty.py - 難易度とサムライキングの厳しさを統合"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_merge_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Map: easy->soft, normal->normal, hard->hard
STRICTNESS_MAP = "const DIFF_TO_STRICT: Record<string,string> = { easy: 'soft', normal: 'normal', hard: 'hard' };"

# 1. Add strictness sync wherever setDifficulty is called in settings
# Find the difficulty onPress handler in settings
old_diff_handler = """setDifficulty(opt.key as Difficulty);
                  try {
                    await AsyncStorage.setItem(DIFFICULTY_KEY, opt.key);
                  } catch(e) {}
                  showSaveSuccess('難易度を「' + opt.label + '」に変更');"""

new_diff_handler = """setDifficulty(opt.key as Difficulty);
                  const strictMap: Record<string,string> = { easy: 'soft', normal: 'normal', hard: 'hard' };
                  updateSettings({ strictness: strictMap[opt.key] as AppSettings['strictness'] });
                  try {
                    await AsyncStorage.setItem(DIFFICULTY_KEY, opt.key);
                  } catch(e) {}
                  showSaveSuccess('難易度を「' + opt.label + '」に変更');"""

if old_diff_handler in content:
    content = content.replace(old_diff_handler, new_diff_handler)
    print('✅ Settings difficulty handler: strictness sync added')
else:
    print('⚠  Settings difficulty handler not found (may already be modified)')

# 2. Also sync in the onboarding difficulty set (line ~6621)
# Find: setDifficulty(d); pattern near onboarding
old_onboard = "setDifficulty(d);"
count = content.count(old_onboard)
if count > 0:
    # Replace only instances that don't already have strictness nearby
    idx = 0
    replaced = 0
    while True:
        pos = content.find(old_onboard, idx)
        if pos == -1:
            break
        # Check if strictness sync already follows
        after = content[pos:pos+200]
        if 'strictMap' not in after and 'strictness' not in after:
            new_code = "setDifficulty(d);\n      { const sm: Record<string,string> = { easy: 'soft', normal: 'normal', hard: 'hard' }; updateSettings({ strictness: sm[d] as AppSettings['strictness'] }); }"
            content = content[:pos] + new_code + content[pos+len(old_onboard):]
            replaced += 1
        idx = pos + len(old_onboard) + 100
    if replaced > 0:
        print(f'✅ Onboarding setDifficulty: {replaced} sync(s) added')

# 3. Also sync when difficulty is loaded from storage
old_load = "setDifficulty(val as Difficulty);"
if old_load in content:
    new_load = "setDifficulty(val as Difficulty);\n          { const sm: Record<string,string> = { easy: 'soft', normal: 'normal', hard: 'hard' }; if (sm[val]) updateSettings({ strictness: sm[val] as AppSettings['strictness'] }); }"
    content = content.replace(old_load, new_load, 1)
    print('✅ Storage load: strictness sync added')

# 4. Remove the "サムライキングの厳しさ" UI section from settings
start_marker = "        <Text style={styles.sectionTitle}>サムライキングの厳しさ</Text>"
end_marker = "        <Text style={styles.sectionTitle}>サムライタイム"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    print('✅ Removed サムライキングの厳しさ UI')
else:
    print('⚠  Strictness UI not found (may already be removed)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Done! 難易度とAI口調が統合されました')
print('  見習い侍 → ゆるめ')
print('  侍 → ふつう')
print('  武士道 → 鬼コーチ')
print('\nnpx expo start --clear')
