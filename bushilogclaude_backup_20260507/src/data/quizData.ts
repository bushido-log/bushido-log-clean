// src/data/quizData.ts
// ボス攻撃用クイズデータ

export type QuizCategory = 'lifestyle' | 'english_basic' | 'english_mid' | 'math' | 'proverb' | 'trivia';

export type BossQuiz = {
  id: string;
  category: QuizCategory;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

// ============================
// ボス0: ニドネール — 生活習慣クイズ
// ============================
export const LIFESTYLE_QUIZZES: BossQuiz[] = [
  { id: 'ls01', category: 'lifestyle', question: '質の良い睡眠に良いのは？', choices: ['寝る前にスマホを見る', '寝る前に軽くストレッチ', '寝る直前にコーヒーを飲む'], correctIndex: 1, explanation: 'ストレッチで体をリラックスさせよう' },
  { id: 'ls02', category: 'lifestyle', question: '朝スッキリ起きるコツは？', choices: ['毎日同じ時間に起きる', '目覚ましを何個もセット', '前日に12時間寝る'], correctIndex: 0, explanation: '体内時計を整えるのが一番' },
  { id: 'ls03', category: 'lifestyle', question: '二度寝を防ぐのに効果的なのは？', choices: ['布団の中でSNSを見る', '目覚ましを止めてまた寝る', '起きたらすぐカーテンを開ける'], correctIndex: 2, explanation: '太陽光で体内時計がリセットされる' },
  { id: 'ls04', category: 'lifestyle', question: '集中力を高める飲み物は？', choices: ['エナジードリンク大量', '水をこまめに飲む', 'コーラを一気飲み'], correctIndex: 1, explanation: '脱水は集中力を下げる' },
  { id: 'ls05', category: 'lifestyle', question: '運動に最適な時間帯は？', choices: ['寝る直前', '午前中〜夕方', '深夜2時'], correctIndex: 1, explanation: '寝る前の激しい運動は睡眠を妨げる' },
  { id: 'ls06', category: 'lifestyle', question: 'ストレス解消に効果的なのは？', choices: ['深呼吸をする', 'SNSで愚痴を書く', 'お菓子を大量に食べる'], correctIndex: 0, explanation: '深呼吸は自律神経を整える' },
  { id: 'ls07', category: 'lifestyle', question: '勉強の休憩に良いのは？', choices: ['スマホゲーム1時間', '5分の軽い散歩', '休憩なしでぶっ通し'], correctIndex: 1, explanation: '短い散歩で脳がリフレッシュされる' },
  { id: 'ls08', category: 'lifestyle', question: '記憶力を上げるのに効果的なのは？', choices: ['徹夜で詰め込む', '寝る前に復習する', 'テスト直前だけ勉強'], correctIndex: 1, explanation: '睡眠中に記憶が定着する' },
  { id: 'ls09', category: 'lifestyle', question: '目が疲れた時にすべきことは？', choices: ['もっとスマホを見る', '20-20-20ルール（20分ごとに20秒遠くを見る）', '目薬を1時間ごとにさす'], correctIndex: 1, explanation: '定期的に遠くを見て目を休めよう' },
  { id: 'ls10', category: 'lifestyle', question: '朝食で脳に良いのは？', choices: ['菓子パンだけ', 'バランスの良い食事', '朝食を抜く'], correctIndex: 1, explanation: 'タンパク質と炭水化物のバランスが大事' },
  { id: 'ls11', category: 'lifestyle', question: 'やる気が出ない時にすべきことは？', choices: ['とりあえず5分だけやる', 'やる気が出るまで待つ', 'SNSで気分転換する'], correctIndex: 0, explanation: '行動が先、やる気は後からついてくる' },
  { id: 'ls12', category: 'lifestyle', question: '姿勢が悪いと起こるのは？', choices: ['背が伸びる', '集中力が下がる', '視力が良くなる'], correctIndex: 1, explanation: '姿勢は呼吸と集中力に直結する' },
  { id: 'ls13', category: 'lifestyle', question: '習慣化に必要な平均日数は？', choices: ['3日', '21日', '約66日'], correctIndex: 2, explanation: '研究では平均66日で自動化される' },
  { id: 'ls14', category: 'lifestyle', question: '水は1日どのくらい飲むべき？', choices: ['コップ1杯', '約1.5〜2リットル', '5リットル以上'], correctIndex: 1, explanation: '体重や活動量で変わるけど目安はこれ' },
  { id: 'ls15', category: 'lifestyle', question: 'スマホ依存を防ぐ方法は？', choices: ['通知を全部オンにする', '使用時間を決めてタイマーをセット', '常に手元に置く'], correctIndex: 1, explanation: 'ルールを決めるのが第一歩' },
];

// ============================
// ボス1: アトデヤル — 英単語（初級）
// ============================
export const ENGLISH_BASIC_QUIZZES: BossQuiz[] = [
  { id: 'eb01', category: 'english_basic', question: '"begin" の意味は？', choices: ['終わる', '始める', '休む', '続ける'], correctIndex: 1 },
  { id: 'eb02', category: 'english_basic', question: '"努力" を英語で？', choices: ['result', 'talent', 'effort', 'dream'], correctIndex: 2 },
  { id: 'eb03', category: 'english_basic', question: '"continue" の意味は？', choices: ['止める', '始める', '壊す', '続ける'], correctIndex: 3 },
  { id: 'eb04', category: 'english_basic', question: '"habit" の意味は？', choices: ['帽子', '習慣', '生息地', 'ウサギ'], correctIndex: 1 },
  { id: 'eb05', category: 'english_basic', question: '"challenge" の意味は？', choices: ['変化', '挑戦', '偶然', 'チャンネル'], correctIndex: 1 },
  { id: 'eb06', category: 'english_basic', question: '"目標" を英語で？', choices: ['gold', 'goal', 'goat', 'good'], correctIndex: 1 },
  { id: 'eb07', category: 'english_basic', question: '"improve" の意味は？', choices: ['証明する', '輸入する', '改善する', '印象づける'], correctIndex: 2 },
  { id: 'eb08', category: 'english_basic', question: '"strength" の意味は？', choices: ['ストレッチ', '強さ', '戦略', 'ストレス'], correctIndex: 1 },
  { id: 'eb09', category: 'english_basic', question: '"practice" の意味は？', choices: ['完璧', '練習', '実用的', '約束'], correctIndex: 1 },
  { id: 'eb10', category: 'english_basic', question: '"成功" を英語で？', choices: ['success', 'surprise', 'support', 'survive'], correctIndex: 0 },
  { id: 'eb11', category: 'english_basic', question: '"courage" の意味は？', choices: ['コース', '勇気', '礼儀', 'いとこ'], correctIndex: 1 },
  { id: 'eb12', category: 'english_basic', question: '"決心する" を英語で？', choices: ['design', 'desire', 'decide', 'destroy'], correctIndex: 2 },
  { id: 'eb13', category: 'english_basic', question: '"patient" の意味は？', choices: ['患者/忍耐強い', '情熱的', '愛国的', 'パターン'], correctIndex: 0 },
  { id: 'eb14', category: 'english_basic', question: '"failure" の意味は？', choices: ['公正', '失敗', '家族', '有名'], correctIndex: 1 },
  { id: 'eb15', category: 'english_basic', question: '"believe" の意味は？', choices: ['去る', '信じる', '受け取る', '達成する'], correctIndex: 1 },
  { id: 'eb16', category: 'english_basic', question: '"知識" を英語で？', choices: ['knowledge', 'knee', 'knight', 'knock'], correctIndex: 0 },
  { id: 'eb17', category: 'english_basic', question: '"achieve" の意味は？', choices: ['認める', '避ける', '達成する', '到着する'], correctIndex: 2 },
  { id: 'eb18', category: 'english_basic', question: '"focus" の意味は？', choices: ['力', '集中', '食べ物', '馬鹿'], correctIndex: 1 },
  { id: 'eb19', category: 'english_basic', question: '"progress" の意味は？', choices: ['問題', '進歩', 'プロ', '約束'], correctIndex: 1 },
  { id: 'eb20', category: 'english_basic', question: '"経験" を英語で？', choices: ['experiment', 'experience', 'expensive', 'expert'], correctIndex: 1 },
];

// ============================
// ボス2: デーブ — 計算・数学
// ============================
export const MATH_QUIZZES: BossQuiz[] = [
  { id: 'mt01', category: 'math', question: '12 × 8 = ?', choices: ['86', '96', '104', '88'], correctIndex: 1 },
  { id: 'mt02', category: 'math', question: '156 ÷ 12 = ?', choices: ['14', '12', '13', '15'], correctIndex: 2 },
  { id: 'mt03', category: 'math', question: '7² + 3² = ?', choices: ['52', '58', '49', '100'], correctIndex: 1 },
  { id: 'mt04', category: 'math', question: '√144 = ?', choices: ['14', '11', '12', '16'], correctIndex: 2 },
  { id: 'mt05', category: 'math', question: '25 × 16 = ?', choices: ['350', '400', '375', '425'], correctIndex: 1 },
  { id: 'mt06', category: 'math', question: '1000 - 387 = ?', choices: ['613', '623', '603', '633'], correctIndex: 0 },
  { id: 'mt07', category: 'math', question: '15 × 15 = ?', choices: ['215', '225', '235', '200'], correctIndex: 1 },
  { id: 'mt08', category: 'math', question: '48 ÷ 6 + 17 = ?', choices: ['23', '24', '25', '26'], correctIndex: 2 },
  { id: 'mt09', category: 'math', question: '3 × 4 × 5 = ?', choices: ['50', '55', '60', '65'], correctIndex: 2 },
  { id: 'mt10', category: 'math', question: '999 + 111 = ?', choices: ['1010', '1100', '1110', '1001'], correctIndex: 2 },
  { id: 'mt11', category: 'math', question: '2⁵ = ?', choices: ['16', '25', '32', '64'], correctIndex: 2 },
  { id: 'mt12', category: 'math', question: '√81 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
  { id: 'mt13', category: 'math', question: '72 ÷ 8 × 3 = ?', choices: ['24', '27', '30', '21'], correctIndex: 1 },
  { id: 'mt14', category: 'math', question: '13 × 7 = ?', choices: ['84', '87', '91', '97'], correctIndex: 2 },
  { id: 'mt15', category: 'math', question: '500 ÷ 25 = ?', choices: ['15', '20', '25', '30'], correctIndex: 1 },
  { id: 'mt16', category: 'math', question: '11² = ?', choices: ['111', '121', '131', '101'], correctIndex: 1 },
  { id: 'mt17', category: 'math', question: '(8 + 7) × 4 = ?', choices: ['56', '60', '64', '68'], correctIndex: 1 },
  { id: 'mt18', category: 'math', question: '1024 ÷ 16 = ?', choices: ['62', '64', '66', '68'], correctIndex: 1 },
  { id: 'mt19', category: 'math', question: '17 × 6 = ?', choices: ['96', '98', '102', '112'], correctIndex: 2 },
  { id: 'mt20', category: 'math', question: '√196 = ?', choices: ['12', '13', '14', '15'], correctIndex: 2 },
];

// ============================
// ボス3: モウムリ — 名言穴埋め + 英語中級
// ============================
export const PROVERB_QUIZZES: BossQuiz[] = [
  { id: 'pv01', category: 'proverb', question: '「千里の道も＿＿から」', choices: ['百歩', '一歩', '千歩', '半歩'], correctIndex: 1, explanation: '小さく始めろ。それが全ての始まりだ' },
  { id: 'pv02', category: 'proverb', question: '"Never give ___."', choices: ['in', 'out', 'up', 'away'], correctIndex: 2, explanation: '絶対に諦めるな — チャーチル' },
  { id: 'pv03', category: 'proverb', question: '「継続は＿＿なり」', choices: ['成功', '力', '勝利', '努力'], correctIndex: 1, explanation: '続けることが最強の才能だ' },
  { id: 'pv04', category: 'proverb', question: '"The only way to do great work is to ___ what you do."', choices: ['hate', 'love', 'know', 'fear'], correctIndex: 1, explanation: 'スティーブ・ジョブズの言葉' },
  { id: 'pv05', category: 'proverb', question: '「七転び＿＿起き」', choices: ['七', '八', '九', '十'], correctIndex: 1, explanation: '何度倒れても立ち上がれ' },
  { id: 'pv06', category: 'proverb', question: '"perseverance" の意味は？', choices: ['完璧', '許可', '忍耐', '性格'], correctIndex: 2, explanation: '忍耐こそ武士の道' },
  { id: 'pv07', category: 'proverb', question: '「為せば＿＿」', choices: ['成る', '終わる', '始まる', '変わる'], correctIndex: 0, explanation: 'やれば出来る。上杉鷹山の言葉' },
  { id: 'pv08', category: 'proverb', question: '"discipline" の意味は？', choices: ['弟子', '規律・自制', '割引', '発見'], correctIndex: 1, explanation: '自制心が最強の武器だ' },
  { id: 'pv09', category: 'proverb', question: '"I think, therefore I ___." — デカルト', choices: ['dream', 'am', 'fight', 'win'], correctIndex: 1, explanation: '我思う、ゆえに我あり' },
  { id: 'pv10', category: 'proverb', question: '「初心＿＿べからず」', choices: ['忘る', '捨つ', '変わる', '消す'], correctIndex: 0, explanation: '最初の志を忘れるな — 世阿弥' },
  { id: 'pv11', category: 'proverb', question: '"resilience" の意味は？', choices: ['抵抗', '回復力', '関連', '信頼'], correctIndex: 1, explanation: '折れない心、それが回復力' },
  { id: 'pv12', category: 'proverb', question: '"Be the change you wish to ___ in the world."', choices: ['make', 'see', 'find', 'build'], correctIndex: 1, explanation: 'ガンジーの言葉' },
  { id: 'pv13', category: 'proverb', question: '「石の上にも＿＿年」', choices: ['一', '三', '五', '十'], correctIndex: 1, explanation: '辛抱強く続ければ報われる' },
  { id: 'pv14', category: 'proverb', question: '"integrity" の意味は？', choices: ['知性', '誠実さ', '強さ', '利息'], correctIndex: 1, explanation: '誠実さは人格の土台' },
  { id: 'pv15', category: 'proverb', question: '"It does not matter how slowly you go as long as you do not ___."', choices: ['sleep', 'stop', 'cry', 'change'], correctIndex: 1, explanation: '孔子の言葉。止まらなければいい' },
  { id: 'pv16', category: 'proverb', question: '「虎穴に入らずんば＿＿を得ず」', choices: ['虎子', '宝物', '勝利', '名誉'], correctIndex: 0, explanation: 'リスクを取らなければ何も得られない' },
  { id: 'pv17', category: 'proverb', question: '"gratitude" の意味は？', choices: ['等級', '感謝', '重力', '偉大さ'], correctIndex: 1, explanation: '感謝の心が全てを変える' },
  { id: 'pv18', category: 'proverb', question: '"What we fear doing most is usually what we most need to ___."', choices: ['avoid', 'do', 'forget', 'plan'], correctIndex: 1, explanation: 'ティム・フェリスの言葉' },
  { id: 'pv19', category: 'proverb', question: '「武士道とは＿＿ことと見つけたり」', choices: ['勝つ', '死ぬ', '生きる', '戦う'], correctIndex: 1, explanation: '葉隠より。覚悟を持て' },
  { id: 'pv20', category: 'proverb', question: '"determination" の意味は？', choices: ['目的地', '決意', '破壊', '探偵'], correctIndex: 1, explanation: '決意が道を切り開く' },
];

// ============================
// 三日坊主II追加: 雑学
// ============================
export const TRIVIA_QUIZZES: BossQuiz[] = [
  { id: 'tr01', category: 'trivia', question: '人間の体で最も硬い部分は？', choices: ['骨', '歯のエナメル質', '爪', '頭蓋骨'], correctIndex: 1 },
  { id: 'tr02', category: 'trivia', question: '日本で一番長い川は？', choices: ['利根川', '信濃川', '石狩川', '北上川'], correctIndex: 1 },
  { id: 'tr03', category: 'trivia', question: '光の速さは秒速約何km？', choices: ['3万km', '30万km', '300万km', '3000万km'], correctIndex: 1 },
  { id: 'tr04', category: 'trivia', question: '日本の都道府県はいくつ？', choices: ['43', '45', '47', '50'], correctIndex: 2 },
  { id: 'tr05', category: 'trivia', question: '太陽系で一番大きい惑星は？', choices: ['土星', '木星', '天王星', '海王星'], correctIndex: 1 },
  { id: 'tr06', category: 'trivia', question: '人体の骨の数は約何本？', choices: ['106', '156', '206', '306'], correctIndex: 2 },
  { id: 'tr07', category: 'trivia', question: '1年で一番日が短い日は？', choices: ['冬至', '夏至', '春分', '秋分'], correctIndex: 0 },
  { id: 'tr08', category: 'trivia', question: '水の化学式は？', choices: ['CO2', 'H2O', 'O2', 'NaCl'], correctIndex: 1 },
  { id: 'tr09', category: 'trivia', question: '日本一高い山の標高は？', choices: ['2776m', '3456m', '3776m', '4776m'], correctIndex: 2 },
  { id: 'tr10', category: 'trivia', question: '地球から月までの距離は約何km？', choices: ['3.8万km', '38万km', '380万km', '3800万km'], correctIndex: 1 },
];

// ============================
// ボス別クイズ取得
// ============================
export const getQuizzesForBoss = (bossIndex: number): BossQuiz[] => {
  switch (bossIndex) {
    case 0: return LIFESTYLE_QUIZZES;
    case 1: return ENGLISH_BASIC_QUIZZES;
    case 2: return MATH_QUIZZES;
    case 3: return PROVERB_QUIZZES;
    case 4: return [
      ...LIFESTYLE_QUIZZES,
      ...ENGLISH_BASIC_QUIZZES,
      ...MATH_QUIZZES,
      ...PROVERB_QUIZZES,
      ...TRIVIA_QUIZZES,
    ];
    default: return LIFESTYLE_QUIZZES;
  }
};

// ランダムにクイズを1問取得（前回と被らないように）
export const getRandomQuiz = (bossIndex: number, usedIds: string[] = []): BossQuiz => {
  const pool = getQuizzesForBoss(bossIndex).filter(q => !usedIds.includes(q.id));
  const available = pool.length > 0 ? pool : getQuizzesForBoss(bossIndex);
  return available[Math.floor(Math.random() * available.length)];
};
