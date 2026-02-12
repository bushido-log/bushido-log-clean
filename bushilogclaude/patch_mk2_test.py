#!/usr/bin/env python3
"""
MK2 tweaks:
1. Test mode: 3 days -> all in 1 session, reduced counts
2. Game diary/zen/kansha -> save to dailyLogs goodDeeds
"""
import sys
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Test mode: all 3 days missions in 1 day
# Change day structure to combine all into day 1
src = src.replace(
    "  const MK2_DAY1 = ['goal', 'alarm', 'training', 'photo'];\n"
    "  const MK2_DAY2 = ['focus', 'consult', 'kansha', 'zen'];\n"
    "  const MK2_DAY3 = ['diary', 'routines', 'todos', 'training3'];",
    "  // TEST MODE: all missions in 1 day\n"
    "  const MK2_DAY1 = ['goal', 'alarm', 'training', 'photo', 'focus', 'consult', 'kansha', 'zen', 'diary', 'routines', 'todos', 'training3'];\n"
    "  const MK2_DAY2 = ['goal'];\n"
    "  const MK2_DAY3 = ['goal'];",
)
print('[OK]   1. test mode: all in 1 day')

# 2. Reduce training counts for testing
src = src.replace(
    "    training: { icon: '\\u2694\\uFE0F', title: '\\u7b4b\\u30c8\\u30ec30\\u56de',",
    "    training: { icon: '\\u2694\\uFE0F', title: '\\u7b4b\\u30c8\\u30ec3\\u56de',",
)
src = src.replace(
    "    training3: { icon: '\\u{1f525}', title: '\\u7b4b\\u30c8\\u30ec50\\u56de',",
    "    training3: { icon: '\\u{1f525}', title: '\\u7b4b\\u30c8\\u30ec5\\u56de',",
)
print('[OK]   2. reduced training titles')

# Reduce actual targets
src = src.replace(
    "    const target = mk2CM === 'training3' ? 50 : 30;\n",
    "    const target = mk2CM === 'training3' ? 5 : 3;\n",
)
print('[OK]   3. reduced training targets')

# Reduce kansha to 3 for testing
src = src.replace(
    "    kansha: { title: '\\u{1f64f} \\u611f\\u8b1d\\u3092\\u66f8\\u3051', target: 15,",
    "    kansha: { title: '\\u{1f64f} \\u611f\\u8b1d\\u3092\\u66f8\\u3051', target: 3,",
)
print('[OK]   4. reduced kansha target')

# Focus to 5 seconds
src = src.replace(
    "    let sec = 30; setMk2FocusLeft(30);\n",
    "    let sec = 5; setMk2FocusLeft(5);\n",
)
src = src.replace(
    "    focus: { icon: '\\u{1f9d8}', title: '\\u96c6\\u4e2d30\\u79d2',",
    "    focus: { icon: '\\u{1f9d8}', title: '\\u96c6\\u4e2d5\\u79d2',",
)
print('[OK]   5. reduced focus to 5s')

# Fix all remaining FocusLeft(30) and display references
src = src.replace('setMk2FocusLeft(30)', 'setMk2FocusLeft(5)')
src = src.replace('mk2FocusLeft === 30', 'mk2FocusLeft === 5')
src = src.replace('30 - mk2FocusLeft) / 30', '5 - mk2FocusLeft) / 5')
print('[OK]   5b. fixed all focus 30 refs')

# 3 day check -> just complete day 1 and defeat
src = src.replace(
    "    if (mk2Day === 3) { triggerMk2Defeat(); }\n"
    "    else { setMk2Phase('day_clear'); }\n",
    "    // TEST MODE: defeat immediately\n"
    "    triggerMk2Defeat();\n",
)
print('[OK]   6. test mode: immediate defeat')

# 6. Save diary/goal/alarm/consult text to dailyLogs as goodDeeds
src = src.replace(
    "  const mk2SubmitText = () => {\n"
    "    if (!mk2TextVal.trim()) return;\n"
    "    playTapSound();\n"
    "    setMk2Done(prev => [...prev, mk2CM]);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    setMk2TextVal(''); setMk2Phase('menu');\n"
    "  };",
    "  const mk2SubmitText = () => {\n"
    "    if (!mk2TextVal.trim()) return;\n"
    "    playTapSound();\n"
    "    setMk2Done(prev => [...prev, mk2CM]);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    // Save to dailyLogs\n"
    "    const tagMap: { [k: string]: string } = { goal: '\\u76ee\\u6a19', alarm: '\\u65e9\\u8d77\\u304d', consult: '\\u76f8\\u8ac7', diary: '\\u65e5\\u8a18' };\n"
    "    const tag = tagMap[mk2CM] || mk2CM;\n"
    "    const deedText = '\\u3010' + tag + '\\u3011' + mk2TextVal.trim();\n"
    "    upsertTodayLog(prev => ({\n"
    "      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],\n"
    "      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,\n"
    "      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],\n"
    "      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deedText],\n"
    "    }));\n"
    "    setMk2TextVal(''); setMk2Phase('menu');\n"
    "  };",
)
print('[OK]   7. diary/text -> dailyLogs')

# 7. Save kansha/zen list items to dailyLogs
src = src.replace(
    "    const next = [...mk2ListItems, mk2ListInput.trim()];\n"
    "    setMk2ListItems(next); setMk2ListInput('');\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}",
    "    const itemText = mk2ListInput.trim();\n"
    "    const next = [...mk2ListItems, itemText];\n"
    "    setMk2ListItems(next); setMk2ListInput('');\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    // Save to dailyLogs\n"
    "    const listTag = mk2CM === 'kansha' ? '\\u611f\\u8b1d' : '\\u5584\\u884c';\n"
    "    const deed = '\\u3010' + listTag + '\\u3011' + itemText;\n"
    "    upsertTodayLog(prev => ({\n"
    "      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],\n"
    "      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,\n"
    "      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],\n"
    "      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deed],\n"
    "    }));",
)
print('[OK]   8. kansha/zen -> dailyLogs')

if src == original:
    print('\n[ERROR] No changes')
    sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
