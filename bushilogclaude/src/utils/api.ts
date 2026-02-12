import { SAMURAI_CHAT_URL, SAMURAI_MISSION_URL } from '../data/constants';
import { getSessionId, getTodayStr } from './helpers';

export async function callSamuraiKing(message: string): Promise<string> {
  const sessionId = await getSessionId();

  const res = await fetch(SAMURAI_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message, sessionId }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log('SamuraiKing server error body:', errorText);
    throw new Error('Server error');
  }

  const data = await res.json();
  return data.reply || data.text || data.message || '（返答が空だったでござる）';
}

export async function callSamuraiMissionGPT(): Promise<string> {
  const res = await fetch(SAMURAI_MISSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todayStr: getTodayStr() }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log('SamuraiMission error body:', text);
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
