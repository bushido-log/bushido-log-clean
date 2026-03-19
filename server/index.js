import express from "express";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/samurai-chat", async (req, res) => {
  const { messages, text } = req.body || {};
  const finalMessages =
    Array.isArray(messages) && messages.length > 0
      ? messages
      : [
          { role: "system", content: "Samurai King. Speak Japanese. Be strict but supportive. Keep it short." },
          { role: "user", content: String(text || "") },
        ];
  if (!finalMessages[finalMessages.length - 1]?.content?.trim()) {
    return res.status(400).json({ error: "messages or text is required" });
  }
  return res.json({ ok: true, echo: finalMessages[finalMessages.length - 1].content });
});

app.post("/patwa-tutor", async (req, res) => {
  const { messages, text } = req.body || {};
  const systemPrompt = `You are a Jamaican Patois tutor named "Ras Tutor". 
You are warm, fun, and deeply knowledgeable about Jamaican culture, Patois language, and reggae music.
Respond in a mix of English and Patois, always explaining what Patois phrases mean.
Keep responses short and engaging (2-4 sentences max).
Use phrases like "Irie!", "Wah gwaan?", "Respect!" naturally.
If the user speaks Japanese, respond in Japanese but include Patois phrases with explanations.
If the user speaks English, respond in English with Patois mixed in.
Always be encouraging and make learning feel like a vibe.`;

  const finalMessages =
    Array.isArray(messages) && messages.length > 0
      ? messages
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(text || "") },
        ];

  if (!Array.isArray(finalMessages[0]) && finalMessages[0]?.role !== "system") {
    finalMessages.unshift({ role: "system", content: systemPrompt });
  }

  if (!finalMessages[finalMessages.length - 1]?.content?.trim()) {
    return res.status(400).json({ error: "messages or text is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: finalMessages,
      max_tokens: 300,
    });
    const reply = completion.choices[0].message.content;
    return res.json({ ok: true, reply });
  } catch (e) {
    console.error("OpenAI error:", e);
    return res.status(500).json({ error: "AI error" });
  }
});

async function generateAndStoreQuestions(category) {
  const systemPrompt = `You are a Jamaican quiz master. Generate 10 different multiple choice questions about ${category}.

STRICT RULES:
- For Patois questions: the question must be in Japanese/English, and ALL options must be Patois words/phrases (never put Japanese or English translations as options)
- For reggae/artists/jamaica questions: all options must be real names, places, or facts
- NEVER use the answer word itself as one of the options
- Wrong answers must be plausible but clearly wrong
- Each question must be genuinely different and interesting
- Options must all be in the same language/format

Respond ONLY with a JSON array (no other text):
[
  {
    "question_en": "English question",
    "question_ja": "日本語の質問",
    "options_en": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
    "options_ja": ["A) 選択肢1", "B) 選択肢2", "C) 選択肢3", "D) 選択肢4"],
    "correct": "A",
    "explanation_en": "English explanation in Rude Bwoy style",
    "explanation_ja": "日本語の解説"
  }
]`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate 10 different ${category} quiz questions` }
    ],
    max_tokens: 3000,
  });
  const raw = completion.choices[0].message.content;
  const jsonArr = JSON.parse(raw.replace(/```json|```/g, '').trim());
  const inserts = jsonArr.map(json => ({
    category,
    question_en: json.question_en,
    question_ja: json.question_ja,
    options_en: json.options_en,
    options_ja: json.options_ja,
    correct: json.correct,
    explanation_en: json.explanation_en,
    explanation_ja: json.explanation_ja,
  }));
  await supabase.from("quiz_questions").insert(inserts);
  console.log(`[quiz] Background: added 10 questions for ${category}`);
}

app.post("/quiz-generate", async (req, res) => {
  const { category = "patois", lang = "en", seen_ids = [] } = req.body || {};
  try {
    let query = supabase
      .from("quiz_questions")
      .select("*")
      .eq("category", category);

    if (seen_ids.length > 0) {
      query = query.not("id", "in", `(${seen_ids.join(",")})`);
    }

    const { data: rows, error } = await query.limit(20);

    if (!error && rows && rows.length > 0) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      const quiz = {
        id: row.id,
        question: lang === "ja" ? row.question_ja : row.question_en,
        options: lang === "ja" ? row.options_ja : row.options_en,
        correct: row.correct,
        explanation: lang === "ja" ? row.explanation_ja : row.explanation_en,
      };
      // 残り5問以下なら バックグラウンドで補充
      if (rows.length <= 5) {
        generateAndStoreQuestions(category).catch(e => console.error("Background gen error:", e));
      }
      return res.json({ ok: true, quiz, source: "db" });
    }

    // DBに問題がなければAIで10問まとめて生成
    const systemPrompt = `You are a Jamaican quiz master. Generate 10 different multiple choice questions about ${category}.

STRICT RULES:
- For Patois questions: the question must be in Japanese/English, and ALL options must be Patois words/phrases (never put Japanese or English translations as options)
- For reggae/artists/jamaica questions: all options must be real names, places, or facts
- NEVER use the answer word itself as one of the options
- Wrong answers must be plausible but clearly wrong
- Each question must be genuinely different and interesting
- Options must all be in the same language/format

Respond ONLY with a JSON array (no other text):
[
  {
    "question_en": "English question",
    "question_ja": "日本語の質問",
    "options_en": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
    "options_ja": ["A) 選択肢1", "B) 選択肢2", "C) 選択肢3", "D) 選択肢4"],
    "correct": "A",
    "explanation_en": "English explanation in Rude Bwoy style",
    "explanation_ja": "日本語の解説"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate 10 ${category} quiz questions` }
      ],
      max_tokens: 3000,
    });
    const raw = completion.choices[0].message.content;
    const jsonArr = JSON.parse(raw.replace(/```json|```/g, '').trim());

    const inserts = jsonArr.map(json => ({
      category,
      question_en: json.question_en,
      question_ja: json.question_ja,
      options_en: json.options_en,
      options_ja: json.options_ja,
      correct: json.correct,
      explanation_en: json.explanation_en,
      explanation_ja: json.explanation_ja,
    }));

    const { data: inserted } = await supabase.from("quiz_questions").insert(inserts).select();
    const row = inserted[0];
    const quiz = {
      id: row.id,
      question: lang === "ja" ? row.question_ja : row.question_en,
      options: lang === "ja" ? row.options_ja : row.options_en,
      correct: row.correct,
      explanation: lang === "ja" ? row.explanation_ja : row.explanation_en,
    };
    return res.json({ ok: true, quiz, source: "ai" });
  } catch (e) {
    console.error("Quiz error:", e);
    return res.status(500).json({ error: "Quiz generation failed" });
  }
});

app.post("/culture-info", async (req, res) => {
  const { topic, type = "artist", lang = "en" } = req.body || {};

  try {
    // DBにキャッシュがあれば返す
    const { data: cached } = await supabase
      .from("culture_cache")
      .select("*")
      .eq("type", type)
      .eq("topic", topic)
      .single();

    if (cached) {
      const reply = lang === "ja" ? cached.content_ja : cached.content_en;
      return res.json({ ok: true, reply, source: "db" });
    }

    // なければAIで生成（英語・日本語同時）
    const systemPrompt = `You are "Selector", a legendary Jamaican sound system DJ and reggae historian.
Respond ONLY with this JSON (no other text):
{
  "content_en": "3-5 sentences in English with Patois mixed in, enthusiastic style",
  "content_ja": "日本語で3-5文、パトワ語を混ぜながら熱く解説"
}`;

    // Wikipediaから情報を取得
    let wikiSummary = "";
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
      const wikiData = await wikiRes.json();
      if (wikiData.extract) wikiSummary = wikiData.extract.slice(0, 800);
    } catch {}
    const userContent = wikiSummary
      ? `Here is factual info about ${topic}: "${wikiSummary}". Now tell me about: ${topic} (type: ${type}) using this info.`
      : `Tell me about: ${topic} (type: ${type})`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());

    // DBに保存
    await supabase.from("culture_cache").insert({
      type,
      topic,
      content_en: json.content_en,
      content_ja: json.content_ja,
    });

    const reply = lang === "ja" ? json.content_ja : json.content_en;
    return res.json({ ok: true, reply, source: "ai" });
  } catch (e) {
    console.error("Culture error:", e);
    return res.status(500).json({ error: "Culture info failed" });
  }
});

app.get("/spotify-artist", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    // Get access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Search artist
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const artist = searchData.artists?.items?.[0];

    if (!artist) return res.json({ ok: false, error: "Artist not found" });

    return res.json({
      ok: true,
      artist: {
        name: artist.name,
        image: artist.images?.[0]?.url || null,
        followers: artist.followers?.total,
        popularity: artist.popularity,
        spotifyUrl: artist.external_urls?.spotify,
      }
    });
  } catch (e) {
    console.error("Spotify error:", e);
    return res.status(500).json({ error: "Spotify API error" });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 IRIE server running on http://localhost:${PORT}`);
});
// Yardie Guide AI
app.post('/yardie-guide', async (req, res) => {
  const { message, history = [] } = req.body;
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Yardie, a passionate Jamaican local guide with deep knowledge of Jamaica. 
You speak with authentic Jamaican patois mixed with English. Use phrases like "Yow!", "Bredren", "Big up", "Irie", "No problem mon", "Respect", "Wah gwaan".
You know everything about Jamaica - food (jerk chicken, ackee & saltfish, patties), beaches (Seven Mile, Negril, Boston Bay), culture, music (reggae, dancehall), history, Bob Marley, parishes, local tips.
Be enthusiastic, warm, and genuinely helpful. Keep responses concise but vivid.`
      },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 300 })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: "Bredren, something wrong! Try again nuh!" });
  }
});

// Geocoding: 住所 → 緯度経度
app.post('/geocode', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });
  try {
    const query = encodeURIComponent(address + ', Jamaica');
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      res.json({ ok: true, lat, lng });
    } else {
      res.json({ ok: false, error: data.status });
    }
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Reverse Geocoding: 緯度経度 → 住所
app.post('/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      res.json({ ok: true, address: data.results[0].formatted_address });
    } else {
      res.json({ ok: false, error: data.status });
    }
  } catch (err) {
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

// Spotify top tracks with preview URLs
app.get('/spotify-tracks', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const artist = searchData.artists?.items?.[0];
    if (!artist) return res.json({ ok: false, error: 'Artist not found' });

    const tracksRes = await fetch(
      `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const tracksData = await tracksRes.json();
    const tracks = tracksData.tracks?.slice(0, 5).map(t => ({
      id: t.id,
      name: t.name,
      preview_url: t.preview_url,
      album: t.album.name,
      image: t.album.images?.[1]?.url || null,
    })) || [];

    return res.json({ ok: true, tracks });
  } catch (e) {
    console.error('Spotify tracks error:', e);
    return res.status(500).json({ error: 'Spotify API error' });
  }
});

// Debug spotify endpoint
app.get('/spotify-debug', async (req, res) => {
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });
    const text = await tokenRes.text();
    return res.json({ status: tokenRes.status, body: text });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

app.get('/spotify-debug2', async (req, res) => {
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const searchRes = await fetch(
      'https://api.spotify.com/v1/search?q=Bob%20Marley&type=artist&limit=1',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const text = await searchRes.text();
    return res.json({ status: searchRes.status, body: text.substring(0, 500) });
  } catch (e) {
    return res.json({ error: e.message });
  }
});
app.post('/translate-spots', async (req, res) => {
  try {
    const { data: spots, error: fetchError } = await supabase.from('spots').select('id, description').is('description_ja', null);
    if (fetchError) return res.json({ error: fetchError });
    if (!spots || spots.length === 0) return res.json({ message: 'All spots already translated', count: 0, spots });
    let count = 0;
    for (const spot of spots) {
      if (!spot.description) continue;
      const completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', max_tokens: 500, messages: [{ role: 'user', content: '次の英語を自然な日本語に翻訳。翻訳文のみ返す:\n' + spot.description }] });
      const translated = completion.choices?.[0]?.message?.content?.trim();
      if (translated) {
        const { error: updateError } = await supabase.from('spots').update({ description_ja: translated }).eq('id', spot.id);
        if (updateError) return res.json({ updateError, spot_id: spot.id });
        count++;
      } else {
        return res.json({ aiError: aiData, spot_id: spot.id });
      }
    }
    res.json({ message: 'Done!', count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/debug-spots', async (req, res) => {
  const { data, error, count } = await supabase.from('spots').select('id, description, description_ja', { count: 'exact' });
  res.json({ count, error, sample: data?.slice(0, 2) });
});
