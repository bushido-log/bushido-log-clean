#!/usr/bin/env python3
"""add_battle_v2.py - ボスデータにv2フィールド追加 + プレイヤーHP計算"""

import shutil
from datetime import datetime

# === Step 1: Update battleWorldData.ts ===
path = 'src/data/battleWorldData.ts'
shutil.copy2(path, path + f'.bak_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add v2 types
old_type = """export type BattleMission = {
  id: string;
  label: string;
  emoji: string;
  type: MissionType;
  tab?: string;
  desc: string;
  baseDamage: number;
  target?: number;
  perRep?: number;
  unit?: string;
  cooldownHours: number;
};"""

new_type = """export type BattleMission = {
  id: string;
  label: string;
  emoji: string;
  type: MissionType;
  tab?: string;
  desc: string;
  baseDamage: number;
  target?: number;
  perRep?: number;
  unit?: string;
  cooldownHours: number;
};

// v2: ボス攻撃パラメータ
export type BossAttackConfig = {
  attackDamage: number;
  attackFrequency: number;     // 何ターンごと（1=毎ターン）
  weaknessStat: 'power' | 'mind' | 'technique' | 'virtue';
  quizTimeLimit: number;       // 秒
  attackQuote: string;
  damagedQuote: string;
  specialAbility?: string;
};

export const BOSS_ATTACK_CONFIG: { [bossIndex: number]: BossAttackConfig } = {
  0: {
    attackDamage: 15,
    attackFrequency: 1,
    weaknessStat: 'power',
    quizTimeLimit: 15,
    attackQuote: 'あと5分…あと5分…',
    damagedQuote: 'うっ…起きたのか…',
  },
  1: {
    attackDamage: 25,
    attackFrequency: 2,
    weaknessStat: 'technique',
    quizTimeLimit: 12,
    attackQuote: '明日やればよくない？',
    damagedQuote: 'バカな…今やっちまうのか…',
  },
  2: {
    attackDamage: 20,
    attackFrequency: 1,
    weaknessStat: 'power',
    quizTimeLimit: 10,
    attackQuote: 'もう休もうぜ〜',
    damagedQuote: 'うそだろ…まだ動けるのか…',
  },
  3: {
    attackDamage: 35,
    attackFrequency: 3,
    weaknessStat: 'mind',
    quizTimeLimit: 10,
    attackQuote: 'だから無理って言ったろ',
    damagedQuote: '無理じゃ…なかったのか…',
  },
  4: {
    attackDamage: 30,
    attackFrequency: 1,
    weaknessStat: 'virtue',
    quizTimeLimit: 8,
    attackQuote: 'ほら、また3日目だ',
    damagedQuote: 'くそ…続けやがったな…',
    specialAbility: 'sneakAttack',  // 正解でも10%で追加攻撃
  },
};

// プレイヤーHP計算
export const calculatePlayerMaxHp = (
  difficulty: 'easy' | 'normal' | 'hard',
  level: number,
  mindStat: number
): number => {
  const baseHp: Record<string, number> = { easy: 200, normal: 150, hard: 100 };
  return (baseHp[difficulty] || 150) + (level * 5) + (mindStat * 3);
};

// 相性による被ダメ軽減計算
export const calculateActualDamage = (
  baseDamage: number,
  statValue: number
): number => {
  return Math.max(1, Math.floor(baseDamage * (100 / (100 + statValue * 2))));
};

// HP回復量
export const HEAL_AMOUNTS: Record<string, number> = {
  gratitude: 20,
  review: 15,
  goal: 10,
  consult: 10,
  steps10k: 30,
  comboBonus3: 10,
  comboBonus5: 20,
  comboBonus10: 30,
  ougi: 15,
};"""

if old_type in content:
    content = content.replace(old_type, new_type)
    print('✅ battleWorldData.ts updated with v2 types')
else:
    print('⚠  BattleMission type not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Done! Phase 1 complete.')
print('Next: copy quizData.ts to src/data/')
