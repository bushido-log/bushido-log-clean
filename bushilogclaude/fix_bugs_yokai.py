#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix bugs + remove yokai from daily tabs (game only)"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

fixes = 0

# ============================================
# 1. REMOVE IMINASHI CHECKS (causing save block)
# ============================================
old_imi1 = """    // IMINASHI check
    const goalText = missionInput.trim() + ' ' + (todos || []).map((t: any) => t.text).join(' ');
    if (checkIminashi(goalText)) return;

    showSaveSuccess('目標を刻んだ。今日も斬れ！');"""

new_imi1 = """    showSaveSuccess('目標を刻んだ。今日も斬れ！');"""

if old_imi1 in c:
    c = c.replace(old_imi1, new_imi1)
    fixes += 1
    print('1. Goal IMINASHI removed OK')
else:
    print('1. SKIP - goal iminashi')

old_imi2 = """    // IMINASHI check
    const reviewText = proudInput.trim() + ' ' + lessonInput.trim() + ' ' + nextActionInput.trim();
    if (checkIminashi(reviewText)) return;

    showSaveSuccess('振り返り完了。明日も斬れ！');"""

new_imi2 = """    showSaveSuccess('振り返り完了。明日も斬れ！');"""

if old_imi2 in c:
    c = c.replace(old_imi2, new_imi2)
    fixes += 1
    print('2. Review IMINASHI removed OK')
else:
    print('2. SKIP - review iminashi')

# ============================================
# 3. REMOVE YOKAI BANNERS FROM TABS
# ============================================
# Goal tab
old_goal_banner = "        {renderYokaiBanner('goal')}\n"
if old_goal_banner in c:
    c = c.replace(old_goal_banner, '', 1)
    fixes += 1
    print('3a. Goal banner removed OK')
else:
    print('3a. SKIP')

# Gratitude tab
old_grat_banner = "      {renderYokaiBanner('gratitude')}\n"
if old_grat_banner in c:
    c = c.replace(old_grat_banner, '', 1)
    fixes += 1
    print('3b. Gratitude banner removed OK')
else:
    print('3b. SKIP')

# Review tab
old_review_banner = "        {renderYokaiBanner('review')}\n"
if old_review_banner in c:
    c = c.replace(old_review_banner, '', 1)
    fixes += 1
    print('3c. Review banner removed OK')
else:
    print('3c. SKIP')

# Focus tab
old_focus_banner = "        {renderYokaiBanner('focus')}\n"
if old_focus_banner in c:
    c = c.replace(old_focus_banner, '', 1)
    fixes += 1
    print('3d. Focus banner removed OK')
else:
    print('3d. SKIP')

# ============================================
# 4. REMOVE triggerYokaiDefeat FROM TASK COMPLETIONS
# ============================================
# Goal save
old_goal_defeat = "    triggerYokaiDefeat('goal', 15);\n"
if old_goal_defeat in c:
    c = c.replace(old_goal_defeat, '', 1)
    fixes += 1
    print('4a. Goal yokai trigger removed OK')
else:
    print('4a. SKIP')

# Review save
old_review_defeat = "    triggerYokaiDefeat('review', 20);\n"
if old_review_defeat in c:
    c = c.replace(old_review_defeat, '', 1)
    fixes += 1
    print('4b. Review yokai trigger removed OK')
else:
    print('4b. SKIP')

# Focus complete
old_focus_defeat = "    triggerYokaiDefeat('focus', 20);\n"
if old_focus_defeat in c:
    c = c.replace(old_focus_defeat, '', 1)
    fixes += 1
    print('4c. Focus yokai trigger removed OK')
else:
    print('4c. SKIP')

# Alarm dismiss
old_alarm_defeat = "    triggerYokaiDefeat('alarm', 25);\n"
if old_alarm_defeat in c:
    c = c.replace(old_alarm_defeat, '', 1)
    fixes += 1
    print('4d. Alarm yokai trigger removed OK')
else:
    print('4d. SKIP')

# Consult/mission
old_consult_defeat = "      triggerYokaiDefeat('consult', 0);\n"
if old_consult_defeat in c:
    c = c.replace(old_consult_defeat, '', 1)
    fixes += 1
    print('4e. Consult yokai trigger removed OK')
else:
    print('4e. SKIP')

# Gratitude (if exists)
old_grat_defeat = "    triggerYokaiDefeat('gratitude', 15);\n"
if old_grat_defeat in c:
    c = c.replace(old_grat_defeat, '', 1)
    fixes += 1
    print('4f. Gratitude yokai trigger removed OK')
else:
    print('4f. SKIP - no gratitude trigger')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print(f'\n=== {fixes} fixes applied ===')
print('  - IMINASHI checks removed from saves')
print('  - Yokai banners removed from all tabs')
print('  - Yokai defeat triggers removed from tasks')
print('  - Yokai now only in game (修行の間/対戦場)')
