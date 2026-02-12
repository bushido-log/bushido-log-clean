// Game data: missions, exercises, quips, quiz

export const MISSION_TARGET = 10;

export const SQ_TOTAL = 3;

export const MOUMURI_KANSHA_TARGET = 10;

export const DEEBU_HIT_TARGET = 20;

export const MK2_DAY1 = ['goal', 'alarm', 'training', 'photo', 'focus', 'consult', 'kansha', 'zen', 'diary', 'routines', 'todos', 'training3'];

export const MK2_DAY2 = ['goal'];

export const MK2_DAY3 = ['goal'];

export const DEEBU_EXERCISES = [
    { id: 'pushup', label: '\u8155\u7acb\u3066\u3075\u305b', icon: '\u2694\uFE0F' },
    { id: 'squat', label: '\u30b9\u30af\u30ef\u30c3\u30c8', icon: '\u2B50' },
    { id: 'situp', label: '\u8179\u7b4b', icon: '\u2604\uFE0F' },
  ];

export const ATODEYARU_QUIPS = [
    'まだやってないの？',
    'あとでやるって言ったよね？',
    '明日でもいいんじゃない？',
    'どうせ途中でやめるんでしょ',
    'ルーティン終わった？',
    'TODO残ってるよ？',
  ];

export const PHYSICAL_MISSIONS = [
    { id: 'pushup', label: '腕立てふせ', icon: '⚔️', count: MISSION_TARGET },
    { id: 'squat', label: 'スクワット', icon: '⭐', count: MISSION_TARGET },
    { id: 'situp', label: '腹筋', icon: '☄️', count: MISSION_TARGET },
  ];

export const SQ_MISSIONS = [
    { id: 'english', label: '英単語クイズ', icon: 'EN' },
    { id: 'kotowaza', label: 'ことわざクイズ', icon: '✂️' },
    { id: 'trivia', label: '雑学クイズ', icon: '❓' },
  ];

export const IMINASHI_MESSAGES = [
    '……それ、本当に意味あったか？',
    '虚無が立ちはだかった',
    '形だけの修行は、力にならない',
  ];

export const SAMURAI_KING_DEFEAT_QUOTES = [
    'よくやった。だが、油断するな',
    'それがお前の力だ',
    '行動した者だけが、斜れる',
    '修行は続く。止まるな',
    '一太刀、見事だ',
    '弱い心を斜ったのは、お前自身だ',
  ];

export const MK2_MISSIONS: { [k: string]: { icon: string; title: string; sub: string; phase: string } } = {
    goal: { icon: '\u{1f3af}', title: '\u76ee\u6a19\u8a2d\u5b9a', sub: '\u4eca\u65e5\u306e\u76ee\u6a19\u3092\u66f8\u3051', phase: 'mk2_text' },
    alarm: { icon: '\u23f0', title: '\u65e9\u8d77\u304d\u5ba3\u8a00', sub: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\u304b\u5ba3\u8a00\u3057\u308d', phase: 'mk2_text' },
    training: { icon: '\u2694\uFE0F', title: '\u7b4b\u30c8\u30ec3\u56de', sub: '\u7b4b\u30c8\u30ec\u306730\u56de\u30c0\u30e1\u30fc\u30b8', phase: 'mk2_ts' },
    photo: { icon: '\u{1f4f8}', title: '\u6b32\u671b\u3092\u65ad\u3066', sub: '\u6211\u6162\u3059\u308b\u3082\u306e\u3092\u64ae\u3063\u3066\u7406\u7531\u3092\u66f8\u3051', phase: 'mk2_photo' },
    focus: { icon: '\u{1f9d8}', title: '\u96c6\u4e2d5\u79d2', sub: '\u96d1\u5ff5\u3092\u6368\u306630\u79d2\u96c6\u4e2d\u305b\u3088', phase: 'mk2_focus' },
    consult: { icon: '\u{1f3ef}', title: '\u4f8d\u30ad\u30f3\u30b0\u306b\u76f8\u8ac7', sub: '\u60a9\u307f\u3092\u4f8d\u306b\u6253\u3061\u660e\u3051\u308d', phase: 'mk2_text' },
    kansha: { icon: '\u{1f64f}', title: '\u611f\u8b1d15\u500b', sub: '\u611f\u8b1d\u304c\u30c0\u30e1\u30fc\u30b8\u306b\u306a\u308b', phase: 'mk2_list' },
    zen: { icon: '\u2728', title: '\u4e00\u65e5\u4e09\u5584', sub: '\u5584\u3044\u884c\u3044\u30923\u3064\u8a18\u9332\u3057\u308d', phase: 'mk2_list' },
    diary: { icon: '\u{1f4d6}', title: '\u65e5\u8a18', sub: '\u4eca\u65e5\u306e\u632f\u308a\u8fd4\u308a\u3092\u66f8\u3051', phase: 'mk2_text' },
    routines: { icon: '\u{1f4cb}', title: '\u30eb\u30fc\u30c6\u30a3\u30f3\u5168\u5b8c\u4e86', sub: '\u30eb\u30fc\u30c6\u30a3\u30f3\u3092\u5168\u3066\u3053\u306a\u305b', phase: 'mk2_check' },
    todos: { icon: '\u2705', title: 'TODO\u5168\u5b8c\u4e86', sub: 'TODO\u3092\u5168\u3066\u5b8c\u4e86\u3057\u308d', phase: 'mk2_check' },
    training3: { icon: '\u{1f525}', title: '\u7b4b\u30c8\u30ec5\u56de', sub: '\u6700\u5f8c\u306e\u8a66\u7df4\u3060', phase: 'mk2_ts' },
  };

export const MK2_TEXT_CFG: { [k: string]: { title: string; prompt: string; ph: string; btn: string } } = {
    goal: { title: '\u{1f3af} \u76ee\u6a19\u8a2d\u5b9a', prompt: '\u4eca\u65e5\u306e\u76ee\u6a19\u3092\u66f8\u3051', ph: '\u4f8b\uff1a\u8155\u7acb\u3066100\u56de\u3067\u304d\u308b\u3088\u3046\u306b\u306a\u308b', btn: '\u76ee\u6a19\u3092\u8a2d\u5b9a' },
    alarm: { title: '\u23f0 \u65e9\u8d77\u304d\u5ba3\u8a00', prompt: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\uff1f', ph: '\u4f8b\uff1a6:00\u306b\u8d77\u304d\u308b', btn: '\u5ba3\u8a00\u3059\u308b' },
    consult: { title: '\u{1f3ef} \u4f8d\u30ad\u30f3\u30b0\u306b\u76f8\u8ac7', prompt: '\u60a9\u307f\u3084\u8ab2\u984c\u3092\u4f8d\u306b\u6253\u3061\u660e\u3051\u308d', ph: '\u4f8b\uff1a\u6700\u8fd1\u3084\u308b\u6c17\u304c\u51fa\u306a\u3044...', btn: '\u76f8\u8ac7\u3059\u308b' },
    diary: { title: '\u{1f4d6} \u65e5\u8a18', prompt: '\u4eca\u65e5\u3092\u632f\u308a\u8fd4\u308c', ph: '\u4eca\u65e5\u3042\u3063\u305f\u3053\u3068\u3001\u611f\u3058\u305f\u3053\u3068\u3001\u5b66\u3093\u3060\u3053\u3068...', btn: '\u8a18\u9332\u3059\u308b' },
  };

export const MK2_LIST_CFG: { [k: string]: { title: string; target: number; ph: string } } = {
    kansha: { title: '\u{1f64f} \u611f\u8b1d\u3092\u66f8\u3051', target: 3, ph: '\u611f\u8b1d\u3057\u3066\u3044\u308b\u3053\u3068\u3092\u66f8\u3051' },
    zen: { title: '\u2728 \u4e00\u65e5\u4e09\u5584', target: 3, ph: '\u5584\u3044\u884c\u3044\u3092\u66f8\u3051' },
  };

export const SQ_DATA: { [key: string]: { q: string; choices: string[]; answer: number }[] } = {
    english: [
      { q: '"apple" の意味は？', choices: ['りんご', 'みかん', 'ぶどう', 'もも'], answer: 0 },
      { q: '"strong" の意味は？', choices: ['弱い', '強い', '早い', '遅い'], answer: 1 },
      { q: '"continue" の意味は？', choices: ['止める', '始める', '続ける', '終わる'], answer: 2 },
    ],
    kotowaza: [
      { q: '「石の上にも___」', choices: ['三年', '五年', '十年', '百年'], answer: 0 },
      { q: '「継続は___なり」', choices: ['金', '力', '夢', '技'], answer: 1 },
      { q: '「千里の道も___から」', choices: ['三歩', '百歩', '一歩', '十歩'], answer: 2 },
    ],
    trivia: [
      { q: '人間の骨の数は約何本？', choices: ['106本', '206本', '306本', '406本'], answer: 1 },
      { q: '日本で一番高い山は？', choices: ['富士山', '北岳', '様が岳', '立山'], answer: 0 },
      { q: '太陽系で一番大きい惑星は？', choices: ['土星', '木星', '天王星', '海王星'], answer: 1 },
    ],
  };
