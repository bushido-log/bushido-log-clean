// src/data/battleWorldData.ts
// World 1 バトルシステム - ボス＆ミッション定義

// === ミッション種別 ===
export type MissionType = 'text' | 'exercise' | 'focus' | 'gratitude' | 'steps' | 'app';

export type BattleMission = {
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

export const BATTLE_MISSIONS: { [bossIndex: number]: BattleMission[] } = {
  0: [
    { id: 'alarm', label: 'サムライアラームで起床', emoji: '⏰', type: 'app', desc: 'アラームで起きてダメージ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'goal', label: '今日の目標を書く', emoji: '🎯', type: 'text', desc: '目標を宣言して1日スタート', baseDamage: 3000, cooldownHours: 24 },
    { id: 'focus', label: '5分集中', emoji: '🧘', type: 'focus', target: 5, desc: '集中して目を覚ませ', baseDamage: 3000, cooldownHours: 24 },
    { id: 'pushup', label: '腕立て10回', emoji: '💪', type: 'exercise', target: 10, perRep: 300, unit: '回', desc: '朝イチで体を起こせ', baseDamage: 3000, cooldownHours: 24 },
    { id: 'squat', label: 'スクワット15回', emoji: '🦵', type: 'exercise', target: 15, perRep: 220, unit: '回', desc: '血を巡らせろ', baseDamage: 3300, cooldownHours: 24 },
  ],
  1: [
    { id: 'goal', label: '今日の目標を書く', emoji: '🎯', type: 'text', desc: '先延ばしせず宣言しろ', baseDamage: 3500, cooldownHours: 24 },
    { id: 'review', label: '振り返りを書く', emoji: '📝', type: 'text', desc: '今日やったことを記録', baseDamage: 3500, cooldownHours: 24 },
    { id: 'focus', label: '10分集中', emoji: '🧘', type: 'focus', target: 10, desc: '後回しにせず今やれ', baseDamage: 4000, cooldownHours: 24 },
    { id: 'pushup', label: '腕立て20回', emoji: '💪', type: 'exercise', target: 20, perRep: 200, unit: '回', desc: '考える前に動け', baseDamage: 4000, cooldownHours: 24 },
    { id: 'diary', label: '日記を書く', emoji: '📖', type: 'text', desc: '日記タブに今日の記録を残せ', baseDamage: 3000, cooldownHours: 24 },
  ],
  2: [
    { id: 'steps', label: '3000歩チャレンジ', emoji: '🚶', type: 'steps', target: 3000, desc: '今日の歩数でダメージ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'pushup', label: '腕立て25回', emoji: '💪', type: 'exercise', target: 25, perRep: 200, unit: '回', desc: 'ソファから立ち上がれ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'squat', label: 'スクワット30回', emoji: '🦵', type: 'exercise', target: 30, perRep: 180, unit: '回', desc: '怠けた体に喝を入れろ', baseDamage: 5400, cooldownHours: 24 },
    { id: 'plank', label: 'プランク30秒', emoji: '🔥', type: 'exercise', target: 30, perRep: 180, unit: '秒', desc: '耐えろ', baseDamage: 5400, cooldownHours: 24 },
    { id: 'situp', label: '腹筋20回', emoji: '🔥', type: 'exercise', target: 20, perRep: 250, unit: '回', desc: '腹を引き締めろ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'focus', label: '10分集中', emoji: '🧘', type: 'focus', target: 10, desc: 'ダラダラするな', baseDamage: 4000, cooldownHours: 24 },
  ],
  3: [
    { id: 'gratitude', label: '感謝を5つ書く', emoji: '🙏', type: 'gratitude', target: 5, desc: '感謝の気持ちで闇を払え', baseDamage: 5000, cooldownHours: 24 },
    { id: 'consult', label: 'サムライ相談で悩みを書く', emoji: '💬', type: 'app', desc: '悩みを打ち明けてダメージ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'review', label: '振り返りを書く', emoji: '📝', type: 'text', desc: '諦めずに今日を振り返れ', baseDamage: 4000, cooldownHours: 24 },
    { id: 'focus', label: '15分集中', emoji: '🧘', type: 'focus', target: 15, desc: '心を落ち着けろ', baseDamage: 5500, cooldownHours: 24 },
    { id: 'goal', label: '明日の目標を書く', emoji: '🎯', type: 'text', desc: '諦めない証として宣言しろ', baseDamage: 4000, cooldownHours: 24 },
    { id: 'pushup', label: '腕立て20回', emoji: '💪', type: 'exercise', target: 20, perRep: 250, unit: '回', desc: '体を動かして気分を変えろ', baseDamage: 5000, cooldownHours: 24 },
  ],
  4: [
    { id: 'alarm', label: 'サムライアラームで起床', emoji: '⏰', type: 'app', desc: 'アラームで起きろ', baseDamage: 6000, cooldownHours: 24 },
    { id: 'goal', label: '今日の目標を書く', emoji: '🎯', type: 'text', desc: '毎日の宣言を怠るな', baseDamage: 5000, cooldownHours: 24 },
    { id: 'gratitude', label: '感謝を7つ書く', emoji: '🙏', type: 'gratitude', target: 7, desc: '感謝の力で最終決戦', baseDamage: 6000, cooldownHours: 24 },
    { id: 'focus', label: '20分集中', emoji: '🧘', type: 'focus', target: 20, desc: '集中力の限界を超えろ', baseDamage: 7000, cooldownHours: 24 },
    { id: 'review', label: '振り返りを書く', emoji: '📝', type: 'text', desc: 'ここまでの道を振り返れ', baseDamage: 5000, cooldownHours: 24 },
    { id: 'steps', label: '5000歩チャレンジ', emoji: '🚶', type: 'steps', target: 5000, desc: '足で証明しろ', baseDamage: 8000, cooldownHours: 24 },
    { id: 'pushup', label: '腕立て40回', emoji: '💪', type: 'exercise', target: 40, perRep: 180, unit: '回', desc: '全力を出し切れ', baseDamage: 7200, cooldownHours: 24 },
    { id: 'consult', label: 'サムライ相談', emoji: '💬', type: 'app', desc: '仲間に頼る勇気も武士道', baseDamage: 5000, cooldownHours: 24 },
  ],
};

export type WorldBoss = {
  id: string;
  yokaiId: string;
  name: string;
  hp: number;
  quote: string;
  defeatQuote: string;
  introLines: string[];
  idleQuotes: string[];
  hitQuotes: string[];
  tauntQuotes: string[];
  maxMissionsPerDay: number;
};

export const WORLD1_BOSSES: WorldBoss[] = [
  {
    id: 'w1_nidoneel', yokaiId: 'nidoneel', name: 'ニドネール', hp: 45000,
    quote: 'もう少し寝ようよ…', defeatQuote: '嘘でしょ…起きちゃったの…？',
    idleQuotes: ['布団の中が一番幸せだろ…？','あと5分だけ…あと5分…','今日は休みでいいじゃん…','アラーム止めちゃえよ…'],
    hitQuotes: ['うそ…起きた…？','目覚まし効いてる…だと…','くっ…早起きの力が…','まぶしい…朝日が…'],
    tauntQuotes: ['やっぱり二度寝したでしょ？','アラーム止めて寝たの知ってるよ','布団から出られなかったでしょ？'],
    maxMissionsPerDay: 3,
  },
  {
    id: 'w1_atodeyaru', yokaiId: 'atodeyaru', name: 'アトデヤル', hp: 70000,
    quote: 'あー…めんどくさ。また明日でいいっしょ。', defeatQuote: 'マジかよ…今日やっちゃうのかよ…',
    idleQuotes: ['明日やればいいじゃん…','まだ締め切りじゃないでしょ…？','今日はもう無理っしょ…','やる気が出たらやればいいって…'],
    hitQuotes: ['え…今やるの…？','先延ばしにしないだと…','うそ…本当に始めちゃうの…','ぐっ…行動力が…'],
    tauntQuotes: ['また後回しにしたでしょ？','「明日やろう」って言ったよね','結局やらなかったでしょ？'],
    maxMissionsPerDay: 3,
  },
  {
    id: 'w1_deebu', yokaiId: 'deebu', name: 'デーブ', hp: 100000,
    quote: '俺みたいになれよ。食って寝てればいいじゃん。', defeatQuote: 'はぁ…お前…動けるのかよ…',
    idleQuotes: ['運動なんてめんどくさいだろ…','今日くらいサボっていいって…','汗かくとか最悪じゃん…','ソファでゴロゴロが最高だろ？'],
    hitQuotes: ['え…体動かすの…？','筋トレだと…！？','うそ…マジで走るのかよ…','ぐっ…体力が…'],
    tauntQuotes: ['今日も運動サボったでしょ？','また食べすぎたでしょ','ゴロゴロしてたの知ってるよ'],
    maxMissionsPerDay: 4,
  },
  {
    id: 'w1_moumuri', yokaiId: 'moumuri', name: 'モウムリ', hp: 130000,
    quote: 'もう無理だって。諦めちまえよ。', defeatQuote: 'なんだよ…まだ諦めないのかよ…',
    idleQuotes: ['どうせ続かないって…','お前には無理だよ…','才能ないんだから諦めろ…','みんなやめてくのに…'],
    hitQuotes: ['まだ続けるのかよ…！','感謝…だと…！？','振り返りなんて無駄だ…','ぐっ…諦めないだと…'],
    tauntQuotes: ['「もう無理」って思ったでしょ？','心折れかけたでしょ','そろそろ限界でしょ？'],
    maxMissionsPerDay: 4,
  },
  {
    id: 'w1_mikkabozu2', yokaiId: 'mikkabozu', name: '三日坊主II', hp: 180000,
    quote: 'また会ったな…今度こそ終わらせてやる', defeatQuote: 'バカな…二度も負けるなんて…',
    idleQuotes: ['前は俺に負けたよな…？','また三日で終わるんだろ？','続いてるのは偶然だ…','お前の根性なんて知ってるよ…'],
    hitQuotes: ['なんだと…成長してやがる…','この力…前とは違う…！','くそ…本気かよ…','ぐああ…ミッション全部こなすだと…'],
    tauntQuotes: ['そろそろ飽きてきたでしょ？','最初のやる気どこ行った？','今日サボりたいって思ったでしょ'],
    maxMissionsPerDay: 5,
  },
];

export type OugiLevel = { name: string; stepsRequired: number; damageRate: number; emoji: string; };

export const OUGI_LEVELS: OugiLevel[] = [
  { name: '疾風の太刀', stepsRequired: 50, damageRate: 0.12, emoji: '🌪️' },
  { name: '雷光一閃', stepsRequired: 30, damageRate: 0.18, emoji: '🌩️' },
  { name: '一刀両断', stepsRequired: 50, damageRate: 0.25, emoji: '⚡' },
];

export const getAvailableOugi = (steps: number): OugiLevel | null => {
  for (let i = OUGI_LEVELS.length - 1; i >= 0; i--) {
    if (steps >= OUGI_LEVELS[i].stepsRequired) return OUGI_LEVELS[i];
  }
  return null;
};

export const RUN_FAIL_RATE = 0.4;
export const RUN_RECOVERY_RATE = 0.05;

export const getSaboriRecovery = (days: number): number => {
  if (days <= 0) return 0;
  if (days === 1) return 0.08;
  if (days === 2) return 0.15;
  if (days === 3) return 0.25;
  return 0.35;
};
