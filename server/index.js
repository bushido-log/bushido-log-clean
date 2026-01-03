import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  const { messages, text } = req.body || {};

  // textだけ来たとき用に messages を作る
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

  // ここでは仮レス（OpenAI呼ぶ前に疎通確認）
  return res.json({ ok: true, echo: finalMessages[finalMessages.length - 1].content });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Samurai server running on http://localhost:${PORT}`);
});