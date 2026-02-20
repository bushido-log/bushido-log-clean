import { SAMURAI_CHAT_URL, SAMURAI_MISSION_URL } from '../data/constants';
import { getSessionId, getTodayStr } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_SECRET = 'bushido-samurai-2026';

async function getIsPro(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem('bushido_is_pro');
    return val === 'true';
  } catch { return false; }
}

export async function callSamuraiKing(message: string): Promise<string> {
  const sessionId = await getSessionId();
  const isPro = await getIsPro();
  const res = await fetch(SAMURAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_SECRET,
    },
    body: JSON.stringify({ text: message, sessionId, isPro }),
  });
  if (res.status === 429) {
    const data = await res.json();
    throw new Error(data.message || '相談上限に達したでござる');
  }
  if (!res.ok) {
    throw new Error('Server error');
  }
  const data = await res.json();
  return data.reply || data.text || data.message || '（返答が空だったでござる）';
}

export async function callSamuraiMissionGPT(): Promise<string> {
  const sessionId = await getSessionId();
  const isPro = await getIsPro();
  const res = await fetch(SAMURAI_MISSION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_SECRET,
    },
    body: JSON.stringify({ todayStr: getTodayStr(), sessionId, isPro }),
  });
  if (!res.ok) {
    throw new Error('Mission server error');
  }
  const data: { mission?: string; text?: string; reply?: string } = await res.json();
  return (
    data.mission ||
    data.text ||
    data.reply ||
    '今日は「スマホ時間を30分減らして、その分だけ自分の未来のために動く」でいこう。'
  );
}
