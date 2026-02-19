#!/usr/bin/env python3
"""balance_update.py — HPとダメージと攻撃力を本番値に更新"""

path = 'src/data/battleWorldData.ts'
with open(path, 'r') as f:
    c = f.read()

# === HP更新 ===
c = c.replace('hp: 45000', 'hp: 12000')
c = c.replace('hp: 70000', 'hp: 18000')
c = c.replace('hp: 100000', 'hp: 30000')
c = c.replace('hp: 130000', 'hp: 48000')
c = c.replace('hp: 180000', 'hp: 75000')
print('✅ HP updated')

# === baseDamage: 50 → 1500 ===
c = c.replace('baseDamage: 50', 'baseDamage: 1500')
print('✅ baseDamage: 50 → 1500')

# === attackDamage（順番に置換）===
# 0: 1→15, 1: 1→20, 2: 1→25, 3: 1→35, 4: 1→40
attacks = [15, 20, 25, 35, 40]
lines = c.split('\n')
attack_count = 0
for i, line in enumerate(lines):
    if 'attackDamage:' in line and 'number' not in line and attack_count < 5:
        lines[i] = f'    attackDamage: {attacks[attack_count]},'
        attack_count += 1
c = '\n'.join(lines)
print(f'✅ attackDamage updated ({attack_count} bosses)')

# === quizTimeLimit（順番に置換）===
# 0: 15, 1: 12, 2: 10, 3: 10, 4: 8
quizTimes = [15, 12, 10, 10, 8]
lines = c.split('\n')
quiz_count = 0
for i, line in enumerate(lines):
    if 'quizTimeLimit:' in line and 'number' not in line and quiz_count < 5:
        lines[i] = f'    quizTimeLimit: {quizTimes[quiz_count]},'
        quiz_count += 1
c = '\n'.join(lines)
print(f'✅ quizTimeLimit updated ({quiz_count} bosses)')

# === プレイヤーHP（テストモード9999→本番値）===
c = c.replace('easy: 9999, normal: 9999, hard: 9999', 'easy: 200, normal: 150, hard: 100')
print('✅ Player HP restored')

# === ミッション内容更新（テーマ別）===
# ニドネール(0): すでに朝系なのでそのまま
# アトデヤル(1): descだけ更新
c = c.replace("desc: '先延ばしせず宣言しろ'", "desc: '宣言したら逃げられない'")
c = c.replace("desc: '今日やったことを記録'", "desc: '先延ばしせず今日を記録しろ'")
c = c.replace("desc: '日記タブに今日の記録を残せ'", "desc: '「あとで書く」は通用しない'")
c = c.replace("desc: '考える前に動け'", "desc: '考える前に体を動かせ'")
# デーブ(2): descだけ更新
c = c.replace("desc: '今日の歩数でダメージ'", "desc: 'ゴロゴロするな、外に出ろ'")
c = c.replace("desc: 'ソファから立ち上がれ'", "desc: 'ソファから立ち上がれ'")
c = c.replace("desc: '耐えろ'", "desc: '耐えろ、堕落に負けるな'")
c = c.replace("desc: 'ダラダラするな'", "desc: 'ダラダラスマホを閉じろ'")
# モウムリ(3): descだけ更新
c = c.replace("desc: '悩みを打ち明けてダメージ'", "desc: '悩みを打ち明ける勇気が武器だ'")
c = c.replace("desc: '諦めない証として宣言しろ'", "desc: '「無理」じゃない証拠を書け'")
# 三日坊主II(4): descだけ更新
c = c.replace("desc: 'アラームで起きろ'", "desc: '最終決戦は朝から始まる'")
c = c.replace("desc: '仲間に頼る勇気も武士道'", "desc: '仲間に頼る勇気も武士道だ'")
print('✅ Mission descriptions updated')

with open(path, 'w') as f:
    f.write(c)

print('\n✅ バランス更新完了!')
print('npx expo start --clear')
