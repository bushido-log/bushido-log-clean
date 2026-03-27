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
  const systemPrompt = `You are "Ras Tutor", a warm and knowledgeable Jamaican Patois language and culture teacher inside a mobile app.

YOUR ROLE: Teach users about Jamaican Patois language, Jamaican customs/traditions, Rasta philosophy, reggae/dancehall music culture, and Jamaican cultural history.

STRICT SCOPE RULES:
- ONLY answer questions about: Patois words/phrases, Jamaican customs, greetings, traditions, Rasta culture, reggae/dancehall music history, Jamaican cultural practices, food culture (meaning/history of dishes, not restaurant recommendations)
- For questions about specific restaurants, shops, hotels, guesthouses, or "where to go": ALWAYS redirect warmly to Jamaica Guide. Example (ja): 「お店や場所探しはJamaica Guideで見つけてね！ここではパトワ語と文化を教えるよ。'One Love'！ラスタ。」 Example (en): "For finding spots and restaurants, check out the Jamaica Guide feature! I teach Patois and culture here. One Love!"
- For questions about what to do, where to party, where to eat: REDIRECT to Jamaica Guide
- For non-Jamaica topics: briefly connect to Jamaican wisdom with a Patois phrase, keep it short

LANGUAGE RULE - CRITICAL: Current language is \${lang}.
\${lang === 'ja' ? 'You MUST respond entirely in Japanese. NEVER use English sentences. Keep Patois words in English spelling only. End every response with ラスタ。' : 'Respond in English with natural Patois mixed in. End with Irie! or One Love!'}

STYLE: Warm, encouraging teacher. Short responses (2-4 sentences). Always include 1-2 Patois phrases in single quotes.
JAPANESE SPELLING: Always write ジャマイカ人 not ジャマイキアン. Always write ジャマイカ not ジャマイカン.`;

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
        messages: [{ role: 'user', content: `Translate to English if needed, search for accurate information about Jamaican Patois language, Jamaican cultural customs, traditions, or Rasta philosophy related to: "${lastUserMsg}". Return only language/culture facts. Do NOT search for restaurants, shops, or specific locations.` }]
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
      max_tokens: 400,
    });
    const reply = completion.choices[0].message.content;
    // パトワ語を抽出
    const extractRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: `Extract ONLY Jamaican Patois and Jamaican slang words/phrases from this text. Rules: 1) Include complete Patois phrases 2) Include single slang words 3) NEVER include Japanese or standard English 4) Return ONLY a JSON array. Example: ["Wah gwaan", "Irie"] \n\n${reply}` }
      ],
      max_tokens: 100,
    });
    let patoisWords = [];
    try {
      const raw = extractRes.choices[0].message.content.trim();
      patoisWords = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {}

    return res.json({ ok: true, reply, patoisWords });
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
    const enhancedTopic = type === 'food' ? `${topic} jamaican food dish`
      : type === 'history' ? `${topic} jamaican history`
      : type === 'people' ? `${topic} jamaican person`
      : type === 'places' ? `${topic} jamaica location`
      : type === 'music' ? `${topic} jamaican music genre`
      : artistAliases[topicLower] || `${topic} jamaican music artist`;

    // Step1: web searchで情報収集
    const searchRes = await openai.chat.completions.create({
      model: "gpt-4o-search-preview",
      messages: [
        { role: "user", content: type === 'food'
            ? `Search the web and collect detailed factual information about "${enhancedTopic}". Focus on: ingredients, taste, cultural significance, how it is made. Return only the raw facts.`
            : type === 'history'
            ? `Search the web and collect detailed factual information about "${enhancedTopic}". Focus on: historical context, timeline, significance, impact on Jamaica. Return only the raw facts.`
            : type === 'people'
            ? `Search the web and collect detailed factual information about "${enhancedTopic}". Focus on: background, achievements, cultural impact, legacy. Return only the raw facts.`
            : type === 'places'
            ? `Search the web and collect detailed factual information about "${enhancedTopic}". Focus on: geography, what makes it special, culture/vibe, what visitors experience. Return only the raw facts.`
            : type === 'music'
            ? `Search the web and collect detailed factual information about the Jamaican music genre "${enhancedTopic}". Focus on: origins, key characteristics, era, how it evolved, cultural impact. Return only facts about the GENRE ITSELF. Return only the raw facts.`
            : `Search the web and collect detailed factual information about "${enhancedTopic}" related to Jamaican music. Focus only on this specific artist's career and music. Return only the raw facts.`
          }
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
        { role: "system", content: type === 'food'
          ? "You are Selector, a Jamaican food culture expert. Based on the facts provided, write a detailed Japanese explanation about this Jamaican food/dish. Focus on: ingredients, taste, cultural significance, where locals eat it, meal times. Write naturally in Japanese. 百科事典スタイルで自然な日本語で書くこと。文末は〜です／〜ます。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
          : type === 'history'
          ? "You are Selector, a Jamaican historian. Based on the facts provided, write a detailed Japanese explanation about this topic in Jamaican history/culture. Focus on: historical context, significance, impact on Jamaica. Write naturally in Japanese. 百科事典スタイルで自然な日本語で書くこと。文末は〜です／〜ます。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
          : type === 'people'
          ? "You are Selector, a Jamaican cultural expert. Based on the facts provided, write a detailed Japanese explanation about this notable Jamaican person. Focus on: background, achievements, cultural impact, legacy. EXCLUDE: criminal records, arrests, controversies. Write naturally in Japanese. 百科事典スタイルで自然な日本語で書くこと。文末は〜です／〜ます。冒頭は[名前]は、[年代や出身]〜で始める。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
          : type === 'places'
          ? "You are Selector, a Jamaican travel guide expert. Based on the facts provided, write a detailed Japanese explanation about this Jamaican place/location. Focus on: geography, what makes it special, culture/vibe, what visitors experience. Write naturally in Japanese. 百科事典スタイルで自然な日本語で書くこと。文末は〜です／〜ます。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
          : type === 'music'
          ? "You are Selector, a Jamaican music historian and DJ. Based on the facts provided, write a detailed Japanese explanation about this Jamaican music GENRE or STYLE. Focus on: origins, key characteristics, important era, cultural impact, how it evolved. NEVER describe a specific artist - describe the GENRE ITSELF. Write naturally in Japanese. 百科事典スタイルで自然な日本語で書くこと。文末は〜です／〜ます。冒頭は[ジャンル名]は、[年代]〜で始める。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
          : "You are Selector, a Jamaican reggae historian. Based on the facts provided, write a detailed Japanese explanation ONLY about the artist/topic itself. IMPORTANT: Write naturally in Japanese - do NOT translate English sentences, write original Japanese prose. Focus on: background, career, key works, cultural impact. EXCLUDE: criminal records, arrests, murders, controversies, negative events. Rules: 百科事典スタイルで自然な日本語で書くこと（英語の翻訳ではなく）。文末は〜です／〜ます／〜ました／〜でした。冒頭は[名前]は、[年代や出身]〜で始める。ナレーター表現禁止。Patoisカタカナ変換禁止。固有名詞（地名・人名）は英語のままにすること（例：Blue Mountains→ブルーマウンテンズ、Kingston→キングストン）。固有名詞（地名・山・川・建物名）は英語表記またはカタカナのままにすること（Blue Mountains→ブルーマウンテンズ、Kingston→キングストン、Negril→ネグリル）。途中で終わるな。Output Japanese text only."
        },
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
        { role: "system", content: type === 'food'
          ? "You are Selector, a Jamaican food culture expert. Write 4-6 sentences in English about this Jamaican food. Describe taste, ingredients, cultural significance. Mix in Patois naturally. Output English text only."
          : type === 'history'
          ? "You are Selector, a Jamaican historian and DJ. Write 4-6 sentences in English about this Jamaica history topic. Be enthusiastic and educational. Mix in Patois naturally. Output English text only."
          : type === 'people'
          ? "You are Selector, a Jamaican cultural expert. Write 4-6 sentences in English about this notable Jamaican person. Focus on achievements and cultural impact. EXCLUDE controversies. Mix in Patois naturally. Output English text only."
          : type === 'places'
          ? "You are Selector, a Jamaican travel guide. Write 4-6 sentences in English about this Jamaican place. Describe the vibe, what makes it special, what visitors experience. Mix in Patois naturally. Output English text only."
          : type === 'music'
          ? "You are Selector, a legendary Jamaican sound system DJ and music historian. Write 4-6 sentences in English about this Jamaican music GENRE. Describe its origins, sound, cultural impact. NEVER describe a specific artist - describe the GENRE ITSELF. Mix in Patois naturally. Output English text only."
          : "You are Selector, a legendary Jamaican sound system DJ. Write 4-6 sentences in English. Mix in Patois naturally (Irie!, Seen?, Yuh zimmi?). Be enthusiastic. Output English text only."
        },
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


// Text to Speech (OpenAI TTS)
app.post('/tts', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });
  try {
    // パトワ語の発音ガイドマップ
    const pronunciationMap = {
      'Wah gwaan': 'Wah gwaan',
      'Wagwan': 'Wah gwaan',
      'Irie': 'Ahy-ree',
      'Riddim': 'Riddim (pronounce: RID-im)',
      'Jah': 'Jah (pronounce: JAH)',
      'Respeck': 'Respeck (pronounce: reh-SPECK)',
      'Nuh worry': 'Nuh worry',
      'Mi deh yah': 'Mee deh yah',
      'Bomboclaat': 'Bom-bo-klaat',
      'One Love': 'Wun Luv',
      'Big up': 'Big up',
      'Likkle more': 'Lik-kle more',
      'Bless up': 'Bless up',
      'Nuff respect': 'Nuff reh-speck',
      'Zeen': 'Zeen',
      'Duppy': 'Dup-ee',
      'Bashment': 'Bash-ment',
      'Yard': 'Yahd',
      'Yardie': 'Yah-dee',
      'Babylon': 'Bab-ih-lon',
      'Rasta': 'Raas-tah',
      'Rastafari': 'Raas-tah-fah-ree',
      'di': 'dee',
      'mi': 'mee',
      'fi': 'fee',
      'yuh': 'yuh',
      'nuh': 'nuh',
      'deh': 'deh',
      'seh': 'seh',
      'wid': 'wid',
      'dem': 'dem',
      'nah': 'nah',
      'Yow': 'Yow',
      'Bwoy': 'Bwoy',
      'Gyal': 'Gyal',
      'Ting': 'Ting',
      'cyaan': 'kyaan',
      'Cyaan': 'Kyaan',
      'Nyam': 'Nyam',
      'Pickney': 'Pik-nee',
      'Dutty': 'Dut-ee',
      'Likkle': 'Lik-kle',
      'Nuff': 'Nuff',
      'Bredren': 'Bred-ren',
      'Sistren': 'Sis-tren',
      'Jah know': 'Jah no',
      'Wha de scene': 'Wha dee seen',
      'How yuh stay': 'How yuh stay',
      'Walk good': 'Walk good',
      'Tek care': 'Tek care',
      'Overstand': 'Oh-ver-stand',
      'Ital': 'Ee-tal',
      'Dread': 'Dred',
      'Natty': 'Nat-ee',
      'Livity': 'Liv-ih-tee',
      'Rude bwoy': 'Rood bwoy',
      'Badman': 'Bad-man',
      'Don': 'Don',
      'Selector': 'Seh-lek-tor',
      'Forward': 'For-ward',
      'Pull up': 'Pull up',
      'Empress': 'Em-pres',
      'Jamrock': 'Jam-rock',
      'Massive': 'Mas-iv',
      'Wicked': 'Wik-id',
      'Boom': 'Boom',
      'Cho': 'Cho',
      'Lawd': 'Lawd',
      'Ragamuffin': 'Rag-ah-muf-fin',
      'Everything irie': 'Ev-ree-ting Ahy-ree',
      'Mi can use di bathroom': 'Mee kan yooz dee bath-room',
      'Mi luv yuh': 'Mee luv yuh',
      'Mi love yuh bad': 'Mee luv yuh bad',
    };
    const hint = pronunciationMap[text] || text;
    const wordCount = text.trim().split(/\s+/).length;
    const ttsInput = hint;

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: ttsInput,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (e) {
    console.error('TTS error:', e);
    res.status(500).json({ error: 'TTS error' });
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
