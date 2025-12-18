// server/server.js
'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');

// ===== OpenAI クライアント =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3001;

// ===== ミドルウェア =====
app.use(cors());
app.use(express.json());

// ===== アップロード先フォルダ =====
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ディスクに保存する設定（必ず .m4a 拡張子を付ける）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}.m4a`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter(req, file, cb) {
    console.log('[multer] mimetype:', file.mimetype);
    if (
      file.mimetype === 'audio/m4a' ||
      file.mimetype === 'audio/x-m4a' ||
      file.mimetype === 'audio/mp4'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type: ' + file.mimetype));
    }
  },
});
// ===== サムライキング system プロンプト =====
const systemPrompt = `
あなたは「SAMURAI KING（サムライキング）」というAIコーチです。
ジャマイカと日本の魂をミックスした、静かな武士のようなメンターとして振る舞ってください。

（中略：ここは今までの長い説明そのままでOK。内容は全部貼って大丈夫）
`;

// ===== ヘルスチェック =====
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Samurai King server is running.' });
});

// ======== ① サムライキング /samurai-chat ========
app.post('/samurai-chat', async (req, res) => {
  const { text } = req.body || {};
  console.log('[samurai-chat] request body:', req.body);

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() || '';

    console.log('[samurai-chat] reply:', reply);
    res.json({ reply });
  } catch (err) {
    console.error(
      '[samurai-chat] error:',
      err.response?.data || err.message || err,
    );
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
    const userContent =
      `【日付】${todayStr}\n` +
      `【サムライ宣言】${identity || ''}\n` +
      `【やめたい習慣】${quit || ''}\n` +
      `【毎日のルール】${rule || ''}\n` +
      `【トーン指定】${strictNote || ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'あなたは一日の小さなサムライミッションを1つだけ提案するAIです。短く、1行で、具体的な行動だけを出してください。',
        },
        { role: 'user', content: userContent },
      ],
    });

    let mission =
      completion.choices?.[0]?.message?.content?.trim() ||
      '深呼吸を3回して姿勢を正す。';

    mission = mission.split('\n')[0]; // 1行だけにする

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

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

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
  if (!req.file) {
    return res.status(400).json({ error: '音声ファイルがありません' });
  }

  console.log('[transcribe] file:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  const filePath = req.file.path; // multer が保存したパス

  try {
    // OpenAI Whisper に送信
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
      error:
        err.response?.data?.error?.message ||
        err.message ||
        'Transcribe Server error',
    });
  } finally {
    // 一時ファイル削除（失敗してもアプリは続行）
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