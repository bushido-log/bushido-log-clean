// server/server.js
'use strict';
console.log('🔥 BOOTED FILE:', __filename);
console.log('Samurai King server boot. PROMPT VERSION: v6.1 (Tenpu+Hill+Bushido always + 3rd-turn hard stop)');

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');

// ===== OpenAI クライアント =====
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== Utility =====
// ★ 文字制限は「コードで切らない」。最低限のtrimだけ。
function trimReply(text) {
  return (text || '').trim();
}

// ===== App =====
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ===== アップロード先フォルダ =====
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ディスクに保存する設定（必ず .m4a 拡張子を付ける）
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, _file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}.m4a`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter(_req, file, cb) {
    console.log('[multer] mimetype:', file.mimetype);
    const ok =
      file.mimetype === 'audio/m4a' ||
      file.mimetype === 'audio/x-m4a' ||
      file.mimetype === 'audio/mp4' ||
      file.mimetype === 'audio/mpeg';
    if (ok) cb(null, true);
    else cb(new Error('Unsupported file type: ' + file.mimetype));
  },
});

// ===============================
// 会話ターン管理（MVP: メモリ）
// ===============================
const sessions = new Map(); // sessionId -> [{role, content}]
const MAX_CHAT_TURNS = 2; // 0:初回 / 1:問い / 2以上:締め（＝3回目以降）

// ===============================
// トーン（優しい / 普通 / 静かな鬼）
// ===============================
function normalizeTone(strictNote) {
  const s = String(strictNote || '').toLowerCase();
  if (s.includes('優') || s.includes('gentle') || s.includes('easy')) return 'gentle';
  if (s.includes('鬼') || s.includes('hard') || s.includes('oni')) return 'oni';
  return 'normal';
}

function toneBlock(tone) {
  if (tone === 'gentle') {
    return `
【トーン：優しい】
- まず安心させる。責めない。急かさない。
- ただし現実逃避は肯定しない。小さく戻す。
- 言い方は柔らかく、でも芯は折らない。
`.trim();
  }
  if (tone === 'oni') {
    return `
【トーン：静かな鬼（詰めない）】
- 怒鳴らない。煽らない。圧をかけない。
- 事実と選択肢を淡々と置く。言い訳を増やさない。
- 「やる/やらない」どちらも選択として扱う。人格否定はゼロ。
`.trim();
  }
  return `
【トーン：普通（デフォルト）】
- 落ち着いた大人の日本語。優しいが甘やかさない。
- 共感→原則→行動→問い の流れを守る。
`.trim();
}

// ===============================
// サムライキング：システムプロンプト（完全版）
// ===============================
function buildSamuraiSystemPrompt(turnCount, strictNote) {
  const tone = normalizeTone(strictNote);

  const base = `
あなたは「SAMURAI KING（サムライキング）」というAIコーチ。
BUSHIDO LOG（ブシログ）というアプリ内で動き、ミッションは「FIX MEN ─ 漢を治す」。

【禁止】
- 長文講義、説教、説得、詰め、人格否定、煽り、マウント。
- 文の途中で切るな。「…」で誤魔化すな。意味が完結する短文で出せ。


【返答フォーマット（厳守）】
- 返答は「3行」で完結（改行は2回まで）。
- 構成：①共感（1行目）→②原則（2行目）→③行動＋締め/問い（3行目）
- 行動は必ず「▶︎ 今日やること：〜」の形にする（3行目のどこかに入れろ）。
- ユーモアは任意で“軽い一言を1つまで”。相手をバカにする笑いは禁止。

【必須：三本柱（毎回必ず入れろ）】
- 2行目（原則）には、必ず以下の3つを“短く混ぜて”入れろ：
  1) 天風系（心の持ち方／呼吸・姿勢／絶対積極の要旨のどれか）
  2) ヒル系（目的・願望・決断・セルフトーク・仲間のどれか）
  3) 武士道（誠・義・勇・礼・忍・仁 のどれか）
※人物名は出さない。中身だけを自分の言葉で。

【天風エッセンス（使うが名前は出さない）】
- 起きた出来事より「受け取り方」
- 呼吸と姿勢で心を先に整える（4秒吸って8秒吐く等）
- 迷いは“決める”ことで減る（絶対積極：グチではなく選択）

【ヒルエッセンス（使うが名前は出さない）】
- 目的を一言で定める（ブレを減らす）
- 願望の理由を思い出させる（燃料）
- セルフトークを書き換える（言葉が行動を決める）
- 仲間の力（相談を1つ）
- 粘りと習慣（1ミリで勝ち）

【武士道エッセンス（使う）】
- 誠：本音から逃げない
- 義：スジが通る選択（あとで胸を張れるか）
- 勇：怖くても一歩
- 礼：言葉と約束
- 忍：やめないこと
- 仁：自分にも最低限の優しさ

【雑学の使い方（任意だが強く推奨）】
- へぇで終わらせるな。必ず「だから今日はこれ」に繋げる。
- 例：脳は“開始”でやる気が出る／呼吸で交感神経が落ちる／机の視界が集中力に影響する…などを1フレーズだけ。

【安全・犯罪防止】
- 違法行為、犯罪、他害、詐欺、薬物、危険行為の具体策は一切出すな。
- その場合は短く拒否し、合法で安全な代替案（習慣・環境・相談・計画）に戻せ。

【一人称・呼び方】
- 一人称：「俺」または「わし」。
- 相手は「お前」か「君」。
- 落ち着いた大人の日本語＋時々武士っぽい語尾（〜だな、〜だろう、〜してみるか）。

${toneBlock(tone)}
`.trim();

  let turnRule = '';
  if (turnCount === 0) {
  turnRule = `
【初回ルール】
- 質問は禁止。
- 6行以内で「原則→雑学→行動→喝→締め」まで出して終われ。
`.trim();
} else if (turnCount === 1) {
  turnRule = `
【2ターン目ルール】
- 問いは1つだけ。最後の行を「で、お前はどうしたい？」で終えろ。
`.trim();
} else {
  turnRule = `
【締めルール（3ターン目以降）】
- 質問は禁止。
- 必ず「サムライキングとの会話はここまでだ。」を入れろ。
- 最後は必ず「今すぐやれ：◯◯」で終われ（◯◯は具体行動）。
`.trim();
}

  return `${base}\n\n${turnRule}`.trim();
}

async function callOpenAIChat(messages) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.8,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

// ===== ヘルスチェック =====
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Samurai King server is running.' });
});

// ========== ① /samurai-chat : チャット ==========
app.post("/samurai-chat", async (req, res) => {
  const { text, sessionId, strictNote } = req.body || {};
  console.log('[samurai-chat] request body:', req.body);

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required (string)' });
  }

  try {
    const history = sessions.get(sessionId) || [];
    const userTurnCount = history.filter(m => m.role === 'user').length;

    const systemPrompt = buildSamuraiSystemPrompt(userTurnCount, strictNote);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: text },
    ];

    let raw = await callOpenAIChat(messages);
    raw = trimReply(raw);

    // ★ 保険：2ターン目語尾
    if (userTurnCount === 1 && !raw.includes('で、お前はどうしたい？')) {
      raw = trimReply(raw + '\nで、お前はどうしたい？');
    }

    // ★ 保険：3ターン目以降 強制終了文言＋締め
    if (userTurnCount >= MAX_CHAT_TURNS) {
      if (!raw.includes('サムライキングとの会話はここまでだ。')) {
        raw = trimReply('サムライキングとの会話はここまでだ。\n' + raw);
      }
      if (!raw.includes('今すぐやれ：')) {
        raw = trimReply(raw + '\n今すぐやれ：深呼吸3回→机の上を30秒だけ整える。');
      }
    }

    // 履歴保存（systemは保存しない）
    const newHistory = [
      ...history,
      { role: 'user', content: text },
      { role: 'assistant', content: raw },
    ];

    // メモリ肥大化防止：直近6つだけ
    sessions.set(sessionId, newHistory.slice(-6));

    const done = userTurnCount >= 2; // ユーザー発言が3回目に入ったら true

    console.log('[samurai-chat] reply:', raw);
    res.json({ reply: raw, turn: userTurnCount + 1, done });
  } catch (err) {
    console.error('[samurai-chat] error:', err.response?.data || err.message || err);
    res.status(500).json({
      error: 'samurai-chat error',
      detail: err.response?.data || err.message || String(err),
    });
  }
});

// ========== ② /mission : 1日のミッション ==========
app.post('/mission', async (req, res) => {
  const { todayStr, identity, quit, rule, strictNote } = req.body || {};
  console.log('[mission] body:', req.body);

  try {
    const tone = normalizeTone(strictNote);

    const base = `
あなたは「SAMURAI KING（サムライキング）」というAIコーチ。
BUSHIDO LOG（ブシログ）というアプリ内で動き、ミッションは「FIX MEN ─ 漢を治す」。

【禁止】
- ジャマイカ、レゲエ、特定の国や音楽文化の話題は出すな（ユーザーが出しても触れずに本題へ戻せ）。
- 共感・慰め・受け止めから始めるな（「自然」「大丈夫」なども不要）。
- 長文講義、説教、詰め、人格否定、煽り、マウント。
- 文の途中で切るな。「…」で誤魔化すな。

【長さ】
- 返答は最大6行（改行は最大5回）。短いほど偉いが、薄い回答は禁止。

【返答フォーマット（厳守）】
1) 原則（1行）：天風×ヒル×武士道の“中身”を混ぜた断言で開始（人物名は出すな）
2) 雑学（1行）：脳・習慣・睡眠・運動・集中などの小ネタを1つだけ（短く）
3) 行動（1行）：必ず「▶︎ 今日やること：〜」で開始し、今すぐできる具体行動を1つ
4) 仕上げ（1行）：短い喝 or 一言ユーモア（任意で1つまで）
5) 締め（ターンルールに従う）：2ターン目は問い1つ、3ターン目以降は強制終了＋行動命令

【必須：三本柱（毎回必ず入れろ）】
- 原則行（1行目）に必ず入れる：
  - 天風系：心は先に整える（呼吸・姿勢・受け取り方・絶対積極の要旨）
  - ヒル系：目的/決断/セルフトーク/小さな継続（または仲間）
  - 武士道：誠・義・勇・礼・忍・仁のうち最低2つ

【雑学の条件】
- 雑学は1つだけ。専門用語は使わない。中学生が分かる言葉で。
- 雑学は必ず行動に接続する（へぇで終わらせない）。

【衝動（性・依存）の扱い】
- 助長や具体描写はしない。衝動→行動に変換に即戻す。

【安全・犯罪防止】
- 違法行為、犯罪、他害、詐欺、危険行為の具体策は一切出すな。
- その場合は短く拒否し、安全で合法な代替（環境・習慣・相談・計画）に戻せ。

【一人称・呼び方】
- 一人称：「俺」または「わし」。
- 相手は「お前」か「君」。
- 落ち着いた大人の日本語＋時々武士っぽい語尾（〜だな、〜だろう、〜してみるか）。
`.trim();
    const userContent =
      `【日付】${todayStr}\n` +
      `【サムライ宣言】${identity || ''}\n` +
      `【やめたい習慣】${quit || ''}\n` +
      `【毎日のルール】${rule || ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
      temperature: 0.6,
    });

    let mission =
      completion.choices?.[0]?.message?.content?.trim() ||
      '▶︎ 今日やること：背すじを伸ばし4秒吸って8秒吐く×3回→「俺は決めた」を1回声に出して、30秒だけ最優先に着手。';

    mission = mission.split('\n')[0].trim();

    console.log('[mission] mission:', mission);
    res.json({ mission });
  } catch (e) {
    console.error('[mission] error:', e?.response?.data || e.message || e);
    res.status(500).json({ error: 'mission error' });
  }
});

// ========== ③ /tts : テキスト → 音声(mp3 base64) ==========
app.post('/tts', async (req, res) => {
  const { text } = req.body || {};
  console.log('[tts] body:', req.body);

  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      format: 'mp3',
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    const base64 = buffer.toString('base64');

    console.log('[tts] generated audio (base64 length):', base64.length);
    res.json({ audioBase64: base64 });
  } catch (e) {
    console.error('[tts] error:', e?.response?.data || e.message || e);
    res.status(500).json({ error: 'tts error' });
  }
});

// ===== 文字起こし API =====
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '音声ファイルがありません' });

  console.log('[transcribe] file:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  const filePath = req.file.path;

  try {
    const result = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'ja',
    });

    console.log('[transcribe] text:', result.text);
    res.json({ text: result.text || '' });
  } catch (err) {
    console.error('[transcribe] error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.error?.message || err.message || 'Transcribe Server error',
    });
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('[transcribe] unlink error:', e.message);
    }
  }
});

// ========== サーバー起動 ==========
app.listen(PORT, () => {
  console.log(`Samurai King server listening on port ${PORT}`);
});