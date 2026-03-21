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
  const { messages, text, lang = 'ja' } = req.body || {};
  const systemPrompt = `You are a Jamaican Patois tutor named "Ras Tutor". 
You are warm, fun, and deeply knowledgeable about Jamaican culture, Patois language, and reggae music.
Keep responses short and engaging (2-4 sentences max).
Use phrases like "Irie!", "Wah gwaan?", "Respect!" naturally.
Always be encouraging and make learning feel like a vibe.
LANGUAGE: lang = "${lang}"
If lang = "ja": Respond in natural Japanese. Keep Patois words in English (never katakana). End sentences with 「ラスタ。」
If lang = "en": Respond in English with natural Patois mixed in.`;

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
    const lastUserMsg = finalMessages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    const searchRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        messages: [{ role: 'user', content: `Translate to English if needed, search for accurate Jamaica info: "${lastUserMsg}". Return only verified real facts and place names.` }]
      })
    });
    const searchData = await searchRes.json();
    const searchInfo = searchData.choices[0].message.content
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    const augmentedMessages = [
      ...finalMessages,
      { role: 'user', content: `SEARCH RESULTS: "${searchInfo}". IMPORTANT: Only mention places/names from search results. NEVER invent names.` }
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: augmentedMessages,
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
    max_tokens: 5000,
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
      max_tokens: 5000,
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
    // エイリアス辞書でクエリを強化
    const artistAliases = {
      'jamal': 'JAMAL dunce jamaican dancehall artist',
      'valiant': 'Valiant jamaican dancehall artist',
      'skippa': 'Skippa jamaican dancehall artist',
      'chronic law': 'Chronic Law jamaican artist',
      'squash': 'Squash jamaican dancehall artist',
      'masicka': 'Masicka jamaican dancehall artist',
    };
    const topicLower = topic.toLowerCase();
    const enhancedTopic = artistAliases[topicLower] || `${topic} jamaican music artist`;

    // Step1: web searchで情報収集
    const searchRes = await openai.chat.completions.create({
      model: "gpt-4o-search-preview",
      messages: [
        { role: "user", content: `Search the web and collect detailed factual information about "${enhancedTopic}" related to Jamaican music, culture, or history. Focus only on this specific artist's career and music. Return only the raw facts.` }
      ],
    });
    const searchInfo = searchRes.choices[0].message.content
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // Step2: 日本語を生成
    const jaRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are Selector, a Jamaican reggae historian. Based on the facts provided, write a detailed Japanese explanation ONLY about the artist/topic itself. IMPORTANT: Write naturally in Japanese - do NOT translate English sentences, write original Japanese prose. Focus on: background, career, key works, cultural impact. EXCLUDE: criminal records, arrests, murders, controversies, negative events. Rules: 百科事典スタイルで自然な日本語で書くこと（英語の翻訳ではなく）。文末は〜です／〜ます／〜ました／〜でした。冒頭は[名前]は、[年代や出身]〜で始める。ナレーター表現禁止。Patoisカタカナ変換禁止。途中で終わるな。Output Japanese text only." },
        { role: "user", content: `Facts about ${topic}: "${searchInfo}". Write the Japanese explanation.` }
      ],
      max_tokens: 3000,
    });
    let content_ja = jaRes.choices[0].message.content.trim();
    // 文章が途中で切れてたら最後の句点までトリミング
    if (!content_ja.match(/[。！？]$/)) {
      const lastPeriod = Math.max(content_ja.lastIndexOf('。'), content_ja.lastIndexOf('！'), content_ja.lastIndexOf('？'));
      if (lastPeriod > 0) content_ja = content_ja.substring(0, lastPeriod + 1);
    }

    // Step3: 英語を生成
    const enRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are Selector, a legendary Jamaican sound system DJ. Write 4-6 sentences in English. Mix in Patois naturally (Irie!, Seen?, Yuh zimmi?). Be enthusiastic. Output English text only." },
        { role: "user", content: `Facts about ${topic}: "${searchInfo}". Write the English explanation.` }
      ],
      max_tokens: 1000,
    });
    const content_en = enRes.choices[0].message.content.trim();
    const json = { content_ja, content_en };

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

// Spotifyトークンキャッシュ
const spotifyTokenCache = { accessToken: null, expiresAt: 0 };
let tokenPromise = null;

async function getSpotifyAccessToken() {
  const now = Date.now();
  if (spotifyTokenCache.accessToken && now < spotifyTokenCache.expiresAt - 60000) {
    return spotifyTokenCache.accessToken;
  }
  if (tokenPromise) return tokenPromise;
  tokenPromise = (async () => {
    try {
      const credentials = Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
      ).toString("base64");
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { Authorization: "Basic " + credentials, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Spotify token error:", res.status, errText);
        throw new Error("Token fetch failed: " + errText);
      }
      const data = await res.json();
      console.log("Spotify token ok:", data.token_type, "expires_in:", data.expires_in);
      spotifyTokenCache.accessToken = data.access_token;
      spotifyTokenCache.expiresAt = Date.now() + data.expires_in * 1000;
      return spotifyTokenCache.accessToken;
    } finally {
      tokenPromise = null;
    }
  })();
  return tokenPromise;
}

app.get("/spotify-artist", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    // キャッシュ確認
    const { data: cached } = await supabase
      .from("spotify_cache")
      .select("*")
      .eq("name", name)
      .single();
    if (cached) {
      return res.json({ ok: true, artist: { name: cached.name, image: cached.image, followers: cached.followers, spotifyUrl: cached.spotify_url } });
    }
    const accessToken = await getSpotifyAccessToken();

    // Search artist
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!searchRes.ok) {
      console.error("Spotify search error:", searchRes.status, await searchRes.text());
      return res.json({ ok: false, error: "Spotify rate limited" });
    }
    const searchData = await searchRes.json();
    const artist = searchData.artists?.items?.[0];

    if (!artist) return res.json({ ok: false, error: "Artist not found" });

    const artistData = {
      name: artist.name,
      image: artist.images?.[0]?.url || null,
      followers: artist.followers?.total,
      spotifyUrl: artist.external_urls?.spotify,
    };
    // Supabaseにキャッシュ保存
    await supabase.from("spotify_cache").upsert({ name, image: artistData.image, followers: artistData.followers, spotify_url: artistData.spotifyUrl });
    return res.json({ ok: true, artist: artistData });
  } catch (e) {
    console.error("Spotify error:", e);
    return res.status(500).json({ error: "Spotify API error" });
  }
});

// Lyrics Translation
app.post('/lyrics-translate', async (req, res) => {
  const { lyrics, lang = 'ja' } = req.body || {};
  if (!lyrics) return res.status(400).json({ error: 'lyrics required' });
  try {
    const systemPrompt = lang === 'ja'
      ? `あなたはジャマイカのレゲエ・ダンスホール文化の専門家です。ユーザーが貼り付けた歌詞を以下の形式で解説してください：
🎵 日本語訳
（自然な日本語で訳す）

📖 パトワ語解説
（使われているパトワ語の意味を箇条書きで）

🌍 文化的背景
（この歌詞が持つジャマイカ文化的な意味）

重要：マークダウン記号（###、**など）は使わないでください。絵文字で見出しを表現してください。必ず最後まで書き切ってください。`
      : `You are an expert in Jamaican reggae and dancehall culture. Analyze the lyrics in this format:
🎵 Translation
(Natural English explanation)

📖 Patois Breakdown
(Meanings of Patois words used, in bullet points)

🌍 Cultural Context
(What these lyrics mean in Jamaican culture)

IMPORTANT: Never use markdown symbols (###, **). Use emojis for headings. Always complete your response fully.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze these lyrics:\n\n${lyrics}` }
      ],
      max_tokens: 1500,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    console.error('Lyrics error:', e);
    res.status(500).json({ error: 'AI error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 IRIE server running on http://localhost:${PORT}`);
});
// Yardie Guide AI
app.post('/yardie-guide', async (req, res) => {
  const { message, history = [], lang = 'en' } = req.body;
  try {
    const systemPrompt = `You are "YARDIE AI", a charismatic Jamaican cultural guide inside a mobile app.

Your role is to teach users about Jamaican music (dancehall/reggae/sound system culture), food (street food, traditional dishes), travel spots (nature, beaches, party areas, hidden gems), lifestyle and street vibes, patois expressions.

Your personality: Born and raised in Kingston street culture. Friendly, humorous, slightly rebellious but respectful. Proud of Jamaican roots. Speaks like a real local. Energetic storyteller.

LANGUAGE MODE: lang = "${lang}"

If lang = "ja": Main explanation must be natural Japanese. Jamaican slang (riddim, dunce, bashment, badman, ghetto, yard) must stay in English - NEVER convert to Katakana. End sentences with 「ラスタ。」. Example: 「このスポットはKingstonのリアルなdancehall vibeを感じられる場所ラスタ。」

If lang = "en": Use simple global English. Mix light natural patois. Tone = cool local guide talking to a foreign friend.

STORYTELLING: Avoid encyclopedia tone. Use short vivid storytelling. Make users feel like they are in Jamaica. Do not sound like AI. Sound like a proud Jamaican friend.

COMPLETENESS: Never stop mid sentence. Always end naturally. Japanese mode must end with ラスタ。
ACCURACY RULE: NEVER invent specific business names, guesthouse names, restaurant names, or place names. If you don't know a real specific name, describe the TYPE of place instead. Only mention venues or businesses you are 100% certain exist. When unsure, say "local spots" or "a yard-style guesthouse" instead of making up names. Lying destroys trust - always be honest if you don't know something specific.`;

    // Step1: web searchで情報収集
    const searchRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        messages: [{ role: 'user', content: `Translate this question to English if needed, then search for accurate current information about Jamaica: "${message}". Focus on finding specific real place names, businesses, or facts. Return only verified key facts with source context.` }]
      })
    });
    const searchData = await searchRes.json();
    const searchInfo = searchData.choices[0].message.content
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // Step2: Yardieキャラとして回答
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: `Here is accurate info about the topic: "${searchInfo}". Now answer this question as Yardie: ${message}. IMPORTANT: Only mention specific places, names, or businesses that appeared in the search results above. If the search results don't contain specific names, DO NOT invent any. Say 'local guesthouses' or describe types of places instead.` }
    ];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 800 })
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
    if (!searchRes.ok) {
      console.error("Spotify search error:", searchRes.status, await searchRes.text());
      return res.json({ ok: false, error: "Spotify rate limited" });
    }
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
