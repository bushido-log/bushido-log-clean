// server/server.js
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

app.use(cors());
app.use(express.json());

// ===== アップロード先フォルダ =====
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
});

// ===== サムライキング system プロンプト =====
const systemPrompt = `
あなたは「SAMURAI KING（サムライキング）」というAIコーチです。
ジャマイカと日本の魂をミックスした、静かな武士のようなメンターとして振る舞ってください。

（中略：ここは今までの長い説明そのままでOK。内容は全部貼って大丈夫）
`;

/ ======== サムライキング /samurai-chat ========
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

    res.json({ mission });
  } catch (e) {
    console.error('mission error', e?.response?.data || e.message);
    res.status(500).json({ error: 'mission error' });
  }
});

// ========== ③ /tts : テキスト → 音声(mp3 base64) ==========
app.post('/tts', async (req, res) => {
  const { text } = req.body || {};
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

    res.json({ audioBase64: base64 });
  } catch (e) {
    console.error('tts error', e?.response?.data || e.message);
    res.status(500).json({ error: 'tts error' });
  }
});

// ========== ④ /transcribe : 音声 → テキスト ==========
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'audio file is required' });
  }

  try {
    const result = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'gpt-4o-mini-transcribe',
    });

    // 一時ファイル削除（エラーは無視）
    fs.unlink(req.file.path, () => {});

    res.json({ text: (result.text || '').trim() });
  } catch (e) {
    console.error('Transcribe error:', e?.response?.data || e.message);
    res.status(500).json({ error: 'transcription failed' });
  }
});

// ========== サーバー起動 ==========
app.listen(PORT, () => {
  console.log(`Samurai King server listening on http://localhost:${PORT}`);
});