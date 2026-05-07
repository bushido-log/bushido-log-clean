import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const API_BASE = "https://bushido-log-server.onrender.com";
const CHAT_URL = `${API_BASE}/samurai-chat`;

const USER_ID_KEY = "samuraiUserId";

async function getUserId() {
  const existing = await AsyncStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id = uuidv4();
  await AsyncStorage.setItem(USER_ID_KEY, id);
  return id;
}

export const getSamuraiMessage = async (text: string) => {
  const userId = await getUserId();

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId }),
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(raw);

  const data = JSON.parse(raw);
  return { text: data.reply ?? "…返事がない。" };
};