const API_BASE = "http://192.168.100.235:3001"; // ここは今のままでOK
const CHAT_URL = `${API_BASE}/api/chat`;

export const getSamuraiMessage = async () => {
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "サムライキングとして一言くれ" }
      ]
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);

  const data = JSON.parse(text);
  // chat.completionsの返りに合わせる
  const reply = data?.choices?.[0]?.message?.content ?? "…返事がない。";
  return { text: reply };
};