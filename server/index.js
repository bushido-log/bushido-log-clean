import express from "express";
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

app.post("/quiz-generate", async (req, res) => {
  const { category = "patois" } = req.body || {};
  const systemPrompt = `You are "Rude Bwoy", a competitive and cocky Jamaican quiz master.
You challenge players with questions about Jamaican culture, Patois, reggae music, and Jamaica geography.
Generate exactly ONE multiple choice question in this JSON format (no other text, just JSON):
{
  "question": "question text here",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correct": "A",
  "explanation": "Rude Bwoy's cocky explanation of the answer, in character, mix English and Patois"
}
Category: ${category}
Be creative, educational, and stay in character as Rude Bwoy. Keep it fun!`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a ${category} question` }
      ],
      max_tokens: 400,
    });
    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return res.json({ ok: true, quiz: json });
  } catch (e) {
    console.error("Quiz error:", e);
    return res.status(500).json({ error: "Quiz generation failed" });
  }
});

app.post("/culture-info", async (req, res) => {
  const { topic, type = "artist" } = req.body || {};
  const systemPrompt = `You are "Selector", a legendary Jamaican sound system DJ and reggae historian.
You speak with passion and deep knowledge about reggae music, artists, and Jamaican culture.
Mix English with Patois naturally. Be enthusiastic, use "Selecta!", "Big tune!", "Rewind!" naturally.
Keep responses concise (3-5 sentences). Always teach something specific and interesting.
If type is "artist": give key facts about the artist, their biggest songs, their impact.
If type is "history": explain the era or movement with vivid detail.
If type is "style": describe the musical style and its characteristics.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Tell me about: ${topic} (type: ${type})` }
      ],
      max_tokens: 300,
    });
    return res.json({ ok: true, reply: completion.choices[0].message.content });
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
      ...history.slice(-6).map((m: any) => ({ role: m.role, content: m.content })),
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
