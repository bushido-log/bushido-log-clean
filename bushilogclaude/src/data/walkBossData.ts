// src/data/walkBossData.ts
// サムライウォーク World 1 ボスデータ

export type WalkBoss = {
  id: string;
  name: string;
  quote: string;
  defeatQuote: string;
  normalHp: number;
  hardHp: number;
  taunt1day: string;   // 1日サボり
  taunt2day: string;   // 2日サボり
  taunt3day: string;   // 3日以上サボり
};

export const WALK_BOSSES: WalkBoss[] = [
  {
    id: 'wb_mikkabozu',
    name: '三日坊主',
    quote: '3日も続かない奴に用はない',
    defeatQuote: 'バカな…お前が続くとは…',
    normalHp: 30000,
    hardHp: 60000,
    taunt1day: '1日休んだな？甘いぞ',
    taunt2day: 'もう諦めたのか？',
    taunt3day: 'やっぱり三日坊主だったな',
  },
  {
    id: 'wb_atodeyaru',
    name: 'アトデヤル',
    quote: '明日やればいいさ…',
    defeatQuote: '今やるのか…見直したぞ',
    normalHp: 40000,
    hardHp: 80000,
    taunt1day: '明日でいいだろ？',
    taunt2day: 'ほら、やっぱり後回しだ',
    taunt3day: '永遠に「あとで」だな',
  },
  {
    id: 'wb_deebu',
    name: 'デーブ',
    quote: '動くの面倒くさい…',
    defeatQuote: 'お前…本気で動いたのか…',
    normalHp: 50000,
    hardHp: 100000,
    taunt1day: '今日はゴロゴロしようぜ',
    taunt2day: '歩くなんて無駄だろ？',
    taunt3day: '仲間になれよ、楽だぞ',
  },
  {
    id: 'wb_moumuri',
    name: 'モウムリ',
    quote: 'お前には無理だ',
    defeatQuote: '…無理じゃなかったのか',
    normalHp: 60000,
    hardHp: 120000,
    taunt1day: 'ほら、やっぱり無理だろ？',
    taunt2day: '限界だろ、認めろよ',
    taunt3day: '完全に証明されたな。お前には無理だ',
  },
  {
    id: 'wb_mikkabozu2',
    name: '三日坊主II',
    quote: '覚えているか？俺はお前の弱さそのものだ',
    defeatQuote: 'お前は…もう三日坊主じゃない',
    normalHp: 80000,
    hardHp: 160000,
    taunt1day: '戻ってきたか、俺の中に',
    taunt2day: 'やはり、お前は変われない',
    taunt3day: '最初に戻っただけだ。全て無駄だった',
  },
];

/**
 * 敵回復率（サボり日数 × 難易度）
 */
export const getRecoveryRate = (saboriDays: number, difficulty: 'normal' | 'hard'): number => {
  if (saboriDays <= 0) return 0;
  if (difficulty === 'normal') {
    if (saboriDays === 1) return 0.10;
    if (saboriDays === 2) return 0.15;
    if (saboriDays === 3) return 0.25;
    return 0.35; // 4+
  } else {
    if (saboriDays === 1) return 0.15;
    if (saboriDays === 2) return 0.25;
    if (saboriDays === 3) return 0.40;
    return 0.50; // 4+
  }
};
