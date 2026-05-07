import { ENEMY_IMAGES } from './assets';

export const ENEMIES = [
  { id: 'enemy01', name: '風の忍', image: ENEMY_IMAGES.enemy01, minLv: 1, maxLv: 3, power: 18, isBoss: false, quote: '影に潜む者、光を恐れる' },
  { id: 'enemy02', name: '紅の侍', image: ENEMY_IMAGES.enemy02, minLv: 2, maxLv: 5, power: 30, isBoss: false, quote: '刃に迷いなし' },
  { id: 'enemy03', name: '金剛の将', image: ENEMY_IMAGES.enemy03, minLv: 3, maxLv: 7, power: 45, isBoss: false, quote: '鏧は心の壁なり' },
  { id: 'enemy04', name: '蒼穹の僧兵', image: ENEMY_IMAGES.enemy04, minLv: 4, maxLv: 8, power: 58, isBoss: false, quote: '祈りは刃よりも鋭し' },
  { id: 'enemy05', name: '黒鉄の武将', image: ENEMY_IMAGES.enemy05, minLv: 5, maxLv: 9, power: 72, isBoss: false, quote: '天下を望む者、まず己に勝て' },
  { id: 'dragon_boss01', name: '蒼龍', image: ENEMY_IMAGES.dragon_boss01, minLv: 7, maxLv: 10, power: 85, isBoss: true, quote: '龍の怒り、天を裂く' },
  { id: 'dragon_boss02', name: '紫龍', image: ENEMY_IMAGES.dragon_boss02, minLv: 7, maxLv: 10, power: 90, isBoss: true, quote: '時の果てに、我は待つ' },
  { id: 'dragon_boss03', name: '翠龍', image: ENEMY_IMAGES.dragon_boss03, minLv: 8, maxLv: 10, power: 95, isBoss: true, quote: '風は自由、されど容赦なし' },
  { id: 'dragon_boss04', name: '紅龍', image: ENEMY_IMAGES.dragon_boss04, minLv: 8, maxLv: 10, power: 100, isBoss: true, quote: '炎は全てを浄化する' },
];

export const BATTLE_WIN_QUOTES = [
  '見事。だが、慢心するな。',
  'その一太刀、侍の魂を感じた。',
  '勝利は修行の証。驕ることなかれ。',
  '強くなったな。だが道はまだ続く。',
  '今日の勝利を、明日の糧とせよ。',
];

export const BATTLE_LOSE_QUOTES = [
  '剣は強い。だが、心が追いついていない。',
  '敗北もまた修行。立ち上がれ。',
  '負けを恐れるな。恐れよ、学ばぬことを。',
  '今はまだ早い。修行を積め。',
  '痛みを知る者だけが、真の強さを得る。',
];
