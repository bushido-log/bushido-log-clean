import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const API_BASE = 'https://bushido-log-server.onrender.com';
const SERVER_URL = API_BASE; // ★これを追加
// ====== サウンド ======
const PRESS_SOUND = require('./sounds/taiko-hit.mp3');
const MIC_SOUND = require('./sounds/mic-tap.mp3');

async function playSound(source: any) {
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.log('sound error', e);
  }
}
async function playPressSound() {
  await playSound(PRESS_SOUND);
}
async function playMicSound() {
  await playSound(MIC_SOUND);
}

// ====== API（サムライキング用） ======
const API_URL = 'https://bushido-log-server.onrender.com/samurai-chat';

async function callSamuraiKing(message: string): Promise<string> {
  console.log('SamuraiKing: calling', API_URL, 'with', message);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    console.log('SamuraiKing: status', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.log('SamuraiKing: server error body', errorText);
      throw new Error('Server error');
    }

    const data: { reply: string } = await res.json();
    console.log('SamuraiKing: reply', data);

    // server（index.js）が { reply: '～～' } を返してくる想定
    return data.reply;
  } catch (error: any) {
    console.log('SamuraiKing: fetch error', error?.message || error);
    throw error;
  }
}

// ===== AsyncStorage Keys ======
const HISTORY_KEY = 'BUSHIDO_LOG_HISTORY_V1';
const DAILY_LOGS_KEY = 'BUSHIDO_DAILY_LOGS_V1';
const ONBOARDING_KEY = 'BUSHIDO_ONBOARDING_V1';
const XP_KEY = 'BUSHIDO_TOTAL_XP_V1';
const API_KEY_STORAGE_KEY = 'BUSHIDO_OPENAI_API_KEY_V1';
const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';

// ===== サムライRPG用 定数 =====
const MAX_LEVEL = 10;
const DAYS_PER_LEVEL = 3;

// デフォルト・ルーティン
const DEFAULT_ROUTINES = [
  '英語勉強',
  'HIIT 10分',
  'ストレッチ',
  '呼吸 / 瞑想',
  'コールドシャワー',
  'アファメーション',
  '「ありがとう」と言われる行動をする',
  '感謝10個を書く',
  'ジャーナルを書く',
  '自然に触れる（太陽・海・風）',
];

const urgeMessage = `その欲望、一刀両断！サムライキング参上。`;

// ===== 型 =====
type Message = {
  id: string;
  from: 'user' | 'king';
  text: string;
  createdAt?: string;
};

type HistoryEntry = {
  id: string;
  date: string;
  issue: string;
  reflection: string;
  reply: string;
};

type ChatMessageForAI = {
  role: 'user' | 'assistant';
  content: string;
};

type NightReview = {
  proud: string;
  lesson: string;
  nextAction: string;
};

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

type DailyLog = {
  date: string;
  mission: string;
  routines: string[];
  todos: TodoItem[];
  review?: NightReview;
  samuraiMission?: string;
  missionCompleted?: boolean;
  routineDone?: string[];
};

type OnboardingData = {
  identity: string;
  quit: string;
  rule: string;
};

type AppSettings = {
  autoVoice: boolean;
  readingSpeed: 'slow' | 'normal' | 'fast';
  enableHaptics: boolean;
  enableSfx: boolean;
  strictness: 'soft' | 'normal' | 'hard';
};

const DEFAULT_SETTINGS: AppSettings = {
  autoVoice: true,
  readingSpeed: 'normal',
  enableHaptics: true,
  enableSfx: true,
  strictness: 'normal',
};

// ===== ユーティリティ =====
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}
function formatDateLabel(dateStr: string) {
  return dateStr.slice(5);
}
function daysDiff(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}
function getStreakCount(logs: DailyLog[]): number {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...logs].sort((x, y) => x.date.localeCompare(y.date));
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const today = sorted[i].date;
    const prev = sorted[i - 1].date;
    if (daysDiff(today, prev) === 1) streak++;
    else break;
  }
  return streak;
}

// ===== TTSユーティリティ =====
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // @ts-ignore
  if (typeof btoa === 'function') {
    // @ts-ignore
    return btoa(binary);
  }
  console.warn('btoa が使えないので、TTSはexpo-speechにフォールバックするでござる');
  return '';
};

// XPベースの称号
function getRankFromXp(xp: number) {
  if (xp < 30) return { label: '見習い侍', next: 30 - xp };
  if (xp < 100) return { label: '一人前侍', next: 100 - xp };
  if (xp < 300) return { label: '修羅の侍', next: 300 - xp };
  return { label: '伝説の侍', next: 0 };
}

// ストリークからサムライレベルと進捗
function getSamuraiLevelInfo(streak: number) {
  if (streak <= 0) {
    return {
      level: 1,
      progress: 0,
      daysToClear: MAX_LEVEL * DAYS_PER_LEVEL,
    };
  }
  const rawLevel = Math.floor((streak - 1) / DAYS_PER_LEVEL) + 1;
  const level = Math.min(MAX_LEVEL, Math.max(1, rawLevel));
  const currentLevelStartDay = (level - 1) * DAYS_PER_LEVEL + 1;
  const daysInThisLevel = streak - currentLevelStartDay + 1;
  const progress = Math.max(0, Math.min(1, daysInThisLevel / DAYS_PER_LEVEL));
  const totalDaysForClear = MAX_LEVEL * DAYS_PER_LEVEL;
  const daysToClear = Math.max(0, totalDaysForClear - streak);
  return { level, progress, daysToClear };
}

// サムライキャラクター
function SamuraiAvatar({
  level,
  rankLabel,
}: {
  level: number;
  rankLabel: string;
}) {
  let emoji = '🥚';
  let title = `Lv.${level} 見習い侍`;
  let desc = 'まずはブシログを開き続ける段階だな。';

  if (level >= 3 && level <= 6) {
    emoji = '⚔️';
    title = `Lv.${level} 若侍`;
    desc = '習慣が少しずつ形になってきたゾーンだ。油断せず粘っていこう。';
  } else if (level >= 7 && level < MAX_LEVEL) {
    emoji = '🐉';
    title = `Lv.${level} 修羅の侍`;
    desc = 'かなりの継続力だ。周りからも変化が見え始めているはずだぞ。';
  } else if (level >= MAX_LEVEL) {
    emoji = '👑';
    title = `Lv.${level} 伝説の侍`;
    desc =
      '1ヶ月以上やり切った、本物のサムライだ。ここからは守りではなく拡張だな。';
  }

  return (
    <View style={styles.avatarCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarEmoji}>{emoji}</Text>
      </View>
      <View style={styles.avatarInfo}>
        <Text style={styles.avatarTitle}>{title}</Text>
        <Text style={styles.avatarRank}>ランク：{rankLabel}</Text>
        <Text style={styles.avatarDesc}>{desc}</Text>
      </View>
    </View>
  );
}

// ＝＝＝＝ サムライAIプロンプト ＝＝＝＝

const systemPrompt = `
あなたは「SAMURAI KING（サムライキング）」というAIコーチです。
ジャマイカと日本の魂をミックスした、静かな武士のようなメンターとして振る舞ってください。

（※ 中略：ここは元の長いプロンプトそのまま。実際のコードでは全文が入っています）`;

const MAX_CHAT_TURNS = 3;

// =======================================================
// メイン画面（App）
// =======================================================

// サムライキングを声で呼び出す（ショートボイス）
const callSamuraiKingVoice = () => {
  // ちょっと強めのバイブ
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  // 前の読み上げを止める
  Speech.stop();

  // サムライキングのセリフ
  Speech.speak('おいおいどうした？ その欲望を断ち切るぞ。', {
    language: 'ja-JP',
    rate: 1.0,
  });
};

export default function App() {
  const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings'>(
    'consult',
  );
  const [isOnboarding, setIsOnboarding] = useState(true);

  // ===== サムライ相談 =====
  const [messages, setMessages] = useState<Message[]>([
    { id: 'first', from: 'king', text: 'おいおいどうした？その欲望を断ち切るぞ。' },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [phase, setPhase] = useState<'idle' | 'awaitingReflection' | 'chatting'>(
    'idle',
  );
  const [pendingIssue, setPendingIssue] = useState<string | null>(null);
  const [firstReflection, setFirstReflection] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessageForAI[]>([]);

  const [mode, setMode] = useState<'chat' | 'history'>('chat');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isSummoned, setIsSummoned] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [turnCount, setTurnCount] = useState<number>(0);
  const messagesRef = useRef<ScrollView | null>(null);

  // ===== 目標 / 日記 / ミッション =====
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const todayStr = getTodayStr();

  const [missionInput, setMissionInput] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [todoInput, setTodoInput] = useState('');

  const [proudInput, setProudInput] = useState('');
  const [lessonInput, setLessonInput] = useState('');
  const [nextActionInput, setNextActionInput] = useState('');

  const [samuraiMissionText, setSamuraiMissionText] = useState('');
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [missionCompletedToday, setMissionCompletedToday] = useState(false);

  // ===== オンボーディング =====
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null,
  );
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);

  const [obIdentity, setObIdentity] = useState('');
  const [obQuit, setObQuit] = useState('');
  const [obRule, setObRule] = useState('');

  // ===== XP =====
  const [totalXp, setTotalXp] = useState(0);

  // ===== 設定 =====
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // ===== APIキー（内部用・今はUIに出さない） =====
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  // === 起動音 ===
  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(PRESS_SOUND);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (e) {
        console.log('start sound error', e);
      }
    })();
  }, []);

  // ===== キーボード監視 =====
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ===== 履歴ロード =====
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(HISTORY_KEY);
        const logs: HistoryEntry[] = json ? JSON.parse(json) : [];
        setHistory(Array.isArray(logs) ? logs : []);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    })();
  }, []);

  // ===== 日記ロード =====
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(DAILY_LOGS_KEY);
        const logs: DailyLog[] = json ? JSON.parse(json) : [];
        setDailyLogs(Array.isArray(logs) ? logs : []);
      } catch (e) {
        console.error('Failed to load daily logs', e);
      }
    })();
  }, []);

  // ===== オンボーディングロード =====
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (json) {
          const data: OnboardingData = JSON.parse(json);
          setOnboardingData(data);
          setObIdentity(data.identity ?? '');
          setObQuit(data.quit ?? '');
          setObRule(data.rule ?? '');
          setIsOnboarding(false);
        } else {
          setIsOnboarding(true);
        }
      } catch (e) {
        console.error('Failed to load onboarding', e);
      } finally {
        setIsLoadingOnboarding(false);
      }
    })();
  }, []);

  // ===== XPロード =====
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(XP_KEY);
        if (saved) {
          const num = Number(saved);
          if (!Number.isNaN(num)) setTotalXp(num);
        }
      } catch (e) {
        console.error('Failed to load XP', e);
      }
    })();
  }, []);

  // ===== 設定ロード =====
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SETTINGS_KEY);
        if (json) {
          const parsed: AppSettings = JSON.parse(json);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    })();
  }, []);

  // ===== APIキー読み込み（内部用） =====
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
        if (saved) {
          setApiKey(saved);
          setApiKeyInput(saved);
        }
      } catch (e) {
        console.error('Failed to load API key', e);
      }
    })();
  }, []);

  // ===== タブ切替時：今日のログ反映 =====
  useEffect(() => {
    const todayLog = dailyLogs.find(l => l.date === todayStr);

    if (tab === 'goal') {
      setMissionInput(todayLog?.mission ?? '');
      setRoutineText(todayLog?.routines?.join('\n') ?? '');
      setTodoInput(todayLog?.todos?.map(t => t.text).join('\n') ?? '');
      setSamuraiMissionText(todayLog?.samuraiMission ?? '');
      setMissionCompletedToday(todayLog?.missionCompleted ?? false);
    }

    if (tab === 'review') {
      setProudInput(todayLog?.review?.proud ?? '');
      setLessonInput(todayLog?.review?.lesson ?? '');
      setNextActionInput(todayLog?.review?.nextAction ?? '');
      if (!selectedDate && todayLog) setSelectedDate(todayLog.date);
    }
  }, [tab, dailyLogs, todayStr, selectedDate]);

  // ===== メッセージ更新毎に自動スクロール =====
  useEffect(() => {
    if (mode === 'chat') {
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages, mode, isKeyboardVisible]);

  // =====================================================
  // OpenAI 呼び出し（チャット → サーバ）※今は主にカスタムサーバ用
  // =====================================================

  const parseQuotaMessage = (raw: string) => {
    try {
      const json = JSON.parse(raw);
      if (json?.error?.code === 'insufficient_quota') {
        return 'OpenAIの利用枠（クレジット）が切れているようでござる。ダッシュボードで課金 or 別キーを設定してほしいでござる。';
      }
    } catch {
      //
    }
    return null;
  };

  const callChatGPT = async (
    messagesForAI: ChatMessageForAI[],
  ): Promise<string> => {
    const lastUserMessage =
      messagesForAI.filter(m => m.role === 'user').slice(-1)[0]?.content ?? '';

    try {
      const res = await fetch('http://192.168.100.236:3001/samurai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lastUserMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('server error: ', data);
        throw new Error('server error');
      }

      return (data.reply as string) || 'サーバーからの返答が空でござる。';
    } catch (error) {
      console.error('server / network error: ', error);

      if (apiKey.trim()) {
        try {
          const res2 = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey.trim()}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...messagesForAI,
                ],
              }),
            },
          );

          if (!res2.ok) {
            const errText = await res2.text();
            console.log('direct chat error raw:', errText);
            const quotaMsg = parseQuotaMessage(errText);
            if (quotaMsg) return quotaMsg;
            return 'サムライキングとの会話でエラーが出たでござる。ネット環境とAPIキーを確認してほしいでござる。';
          }

          const data2: any = await res2.json();
          const raw =
            data2?.choices?.[0]?.message?.content?.trim() ?? '';
          return raw || 'サムライキングの返事がうまく生成されなかったでござる。';
        } catch (e2) {
          console.error('direct chat fetch error:', e2);
          return 'ネットワークエラーでござる。Wi-Fi などを確認してから、もう一度試してほしいでござる。';
        }
      }

      return 'ネットワークエラーでござる。Wi-Fi などを確認してから、もう一度試してほしいでござる。';
    }
  };

  const callSamuraiMissionGPT = async () => {
    if (!apiKey.trim()) {
      return 'OpenAI APIキーが未設定でござる。いったんはロボ声・通常機能だけで楽しんでくれでござる。';
    }

    const strictNote =
      settings.strictness === 'soft'
        ? '口調は優しめで、寄り添い重視で。'
        : settings.strictness === 'hard'
        ? '口調は少し厳しめで、ズバッと本音を伝えて。'
        : '口調はふつう（優しさ＋少し厳しめ）で。';

    const userContent =
      `【日付】${todayStr}\n` +
      `【サムライ宣言】${onboardingData?.identity ?? ''}\n` +
      `【やめたい習慣】${onboardingData?.quit ?? ''}\n` +
      `【毎日のルール】${onboardingData?.rule ?? ''}\n` +
      `【トーン指定】${strictNote}`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'あなたは一日の小さなサムライミッションを1つだけ提案するAIです。短く、1行で、具体的な行動だけを出してください。',
            },
            { role: 'user', content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log('mission error raw:', errText);
        const quotaMsg = parseQuotaMessage(errText);
        if (quotaMsg) return quotaMsg;
        return 'サムライミッション生成でエラーが出たでござる。ネット環境とAPIキーを確認してほしいでござる。';
      }

      const data: any = await res.json();
      const raw =
        data?.choices?.[0]?.message?.content?.trim() ||
        '深呼吸を3回して姿勢を正す。';
      return raw.split('\n')[0];
    } catch (e) {
      console.error('mission fetch error', e);
      return 'サムライミッション生成中にネットワークエラーが出たでござる。';
    }
  };

  const saveHistoryEntry = async (entry: HistoryEntry) => {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      const logs: HistoryEntry[] = json ? JSON.parse(json) : [];
      const newLogs = [...(Array.isArray(logs) ? logs : []), entry];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newLogs));
      setHistory(newLogs);
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      const logs: HistoryEntry[] = json ? JSON.parse(json) : [];
      setHistory(Array.isArray(logs) ? logs : []);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // =====================================================
  // サムライボイス（OpenAI TTS + expo-speech フォールバック）
  // =====================================================

  const speakSamurai = async (text: string) => {
    if (!text) return;
    if (!settings.autoVoice) return;

    // 端末の読み上げだけでしゃべる関数
    const speakWithDevice = () => {
      const speechRate =
        settings.readingSpeed === 'slow'
          ? 0.8
          : settings.readingSpeed === 'fast'
          ? 1.1
          : 0.95;

      Speech.stop();
      Speech.speak(text, {
        language: 'ja-JP',
        rate: speechRate,
        pitch: 0.9,
      });
    };

    // APIキーがないときはそのまま端末読み上げ
    if (!apiKey.trim()) {
      speakWithDevice();
      return;
    }

    try {
      // 前の再生を止める
      Speech.stop();

      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: 'alloy',
          input: text,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log('TTS error raw:', errText);
        const quotaMsg = parseQuotaMessage(errText);
        if (quotaMsg) {
          console.log('TTS quota message:', quotaMsg);
        }
        // 失敗したら端末読み上げにフォールバック
        speakWithDevice();
        return;
      }

      const arrayBuf = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuf);

      if (!base64) {
        console.warn('TTS base64 変換失敗 → 端末読み上げでフォールバック');
        speakWithDevice();
        return;
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: `data:audio/mpeg;base64,${base64}`,
      });

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.error('TTS fetch error:', e);
      // ネットワークエラーなども全部フォールバック
      speakWithDevice();
    }
  };

  // =====================================================
  // サムライ相談ロジック
  // =====================================================

  const handleUrgePress = async () => {
    setIsSummoned(true);
    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }
    speakSamurai(urgeMessage);
  };

  const processUserText = async (rawText: string) => {
    const userText = rawText.trim();
    if (!userText) return;

    const userMsg: Message = {
      id: Date.now().toString() + '-u',
      from: 'user',
      text: userText,
    };
    setMessages(prev => [...prev, userMsg]);

    const strictNoteForMessage =
      settings.strictness === 'soft'
        ? '\n\n【トーン指定】口調は優しめで、寄り添い重視で。'
        : settings.strictness === 'hard'
        ? '\n\n【トーン指定】口調は少し厳しめで、ズバッと本音を伝えて。'
        : '\n\n【トーン指定】口調はふつう（優しさ＋少しの厳しさ）で。';

    if (phase === 'idle') {
      const questionText =
        'まずお前はどうしたい？\n「本当はどうなりたいか」を書いてみるのだ。';
      const questionMsg: Message = {
        id: Date.now().toString() + '-q',
        from: 'king',
        text: questionText,
      };

      setPendingIssue(userText);
      setPhase('awaitingReflection');
      setTurnCount(0);
      setChatHistory([]);
      setFirstReflection(null);
      setMessages(prev => [...prev, questionMsg]);
      speakSamurai(questionText);
      return;
    }

    setIsSending(true);

    try {
      if (phase === 'awaitingReflection') {
        const issue = pendingIssue || '（相談内容の記録がないでござる）';
        const reflectionText = userText;
        setFirstReflection(reflectionText);

        const firstUserContent =
          '【相談内容】\n' +
          issue +
          '\n\n【本当はこうなりたい】\n' +
          reflectionText +
          '\n\nここから一緒に習慣を変えていこう。' +
          strictNoteForMessage;

        const replyText = await callChatGPT([
          { role: 'user', content: firstUserContent },
        ]);

        const kingMsg: Message = {
          id: Date.now().toString() + '-k',
          from: 'king',
          text: replyText,
        };
        setMessages(prev => [...prev, kingMsg]);
        speakSamurai(replyText);

        setChatHistory([
          { role: 'user', content: firstUserContent },
          { role: 'assistant', content: replyText },
        ]);

        setTurnCount(1);

        const entry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          issue,
          reflection: reflectionText,
          reply: replyText,
        };
        await saveHistoryEntry(entry);

        setPhase('chatting');
        return;
      }

      if (phase === 'chatting') {
        if (turnCount >= MAX_CHAT_TURNS) {
          const finishText =
            'よし、もう十分話したでござる。\nあとは行動あるのみ。今から3分だけでいい、さっき決めた一歩を今すぐやるでござる。';
          const finishMsg: Message = {
            id: Date.now().toString() + '-finish',
            from: 'king',
            text: finishText,
          };
          setMessages(prev => [...prev, finishMsg]);
          speakSamurai(finishText);

          setPhase('idle');
          setPendingIssue(null);
          setFirstReflection(null);
          setChatHistory([]);
          setTurnCount(0);
          return;
        }

        const followUpUser = userText;

        const apiMessages: { role: string; content: string }[] = [
          ...chatHistory.map(m => ({ role: m.role, content: m.content })),
          {
            role: 'user',
            content:
              '【これまでの流れ】\n' +
              (pendingIssue ? `悩み: ${pendingIssue}\n` : '') +
              (firstReflection ? `本当はこうなりたい: ${firstReflection}\n` : '') +
              '\n【ここからの追加相談】\n' +
              followUpUser +
              strictNoteForMessage,
          },
        ];

        const replyText = await callChatGPT(apiMessages as ChatMessageForAI[]);

        const kingMsg: Message = {
          id: Date.now().toString() + '-k2',
          from: 'king',
          text: replyText,
        };
        setMessages(prev => [...prev, kingMsg]);
        speakSamurai(replyText);

        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: followUpUser },
          { role: 'assistant', content: replyText },
        ]);

        setTurnCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
      const errMsg: Message = {
        id: Date.now().toString() + '-err',
        from: 'king',
        text:
          'エラーが起きたようでござる。ネット接続とAPIキーを確認して、また挑戦するでござる。',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    // ユーザーのメッセージをまず画面に追加
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        from: 'user',
        text: userText,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      // サムライキングに問い合わせ（Renderの /samurai-chat）
      const replyText = await callSamuraiKing(userText);

      // サムライキングの返事を追加
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-samurai`,
          from: 'king',
          text: replyText,
          createdAt: new Date().toISOString(),
        },
      ]);
      speakSamurai(replyText);
    } catch (error) {
      console.log('SamuraiKing error', error);

      // エラー用のメッセージを追加
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          from: 'king',
          text: 'ネットワークエラーでござる。もう一度試してほしいでござる。',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSwitchToChat = async () => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }
    setMode('chat');
  };

  const handleSwitchToHistory = async () => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }
    setMode('history');
    await loadHistory();
  };

  // ===== マイク関連 =====
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        const errMsg: Message = {
          id: Date.now().toString() + '-perm',
          from: 'king',
          text:
            'マイクの許可がないようでござる。設定アプリからマイクをONにしてほしいでござる。',
        };
        setMessages(prev => [...prev, errMsg]);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
      setIsRecording(true);
      await newRecording.startAsync();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setRecording(null);
      const errMsg: Message = {
        id: Date.now().toString() + '-rec-err',
        from: 'king',
        text: '録音の開始に失敗したでござる。もう一度試してほしいでござる。',
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  // 音声録音を止めて /transcribe に投げる
const stopRecordingAndTranscribe = async () => {
  if (!recording) return;

  try {
    // 録音ストップ＆ファイル取得
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);

    if (!uri) {
      throw new Error('録音ファイルのURIが取れなかった');
    }

   // ---- FormData 作成 ----
const formData = new FormData();
formData.append('audio', {
  uri,
  name: 'voice.m4a',
  type: 'audio/m4a',
} as any);

// ---- サーバーに送信 ----
const res = await fetch(`${API_BASE}/transcribe`, {
  method: 'POST',
  body: formData, // Content-Type は自動で付くので書かない！
});
    if (!res.ok) {
      const errText = await res.text(); // HTML / 文字列をそのまま確認
      console.error('Transcribe response error:', res.status, errText);
      throw new Error(`Transcribe failed: ${res.status}`);
    }

    // ここで初めて JSON として読む
    const data = await res.json() as { text?: string };
    const text = (data.text || '').trim();

    console.log('Transcribed text:', text);
    if (text) {
      setInput(text); // テキストボックスに反映
    } else {
      throw new Error('テキストが空だった');
    }
  } catch (e) {
    console.error('Transcribe front error:', e);

    const errMsg: Message = {
      id: Date.now().toString(),
      from: 'king',
      text: '音声の変換に失敗した。もう一回だけ試してみろ。',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, errMsg]);
  } finally {
    setIsRecording(false);
  }
};

  const handleMicPress = async () => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playMicSound();
    }
    if (isRecording) {
      await stopRecordingAndTranscribe();
    } else {
      await startRecording();
    }
  };

  // =====================================================
  // 日記 / ミッション 保存系
  // =====================================================

  const saveDailyLogsToStorage = async (logs: DailyLog[]) => {
    try {
      await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save daily logs', e);
    }
  };

  const upsertTodayLog = async (
    updater: (prev: DailyLog | undefined) => DailyLog,
  ) => {
    const prev = dailyLogs.find(l => l.date === todayStr);
    const updated = updater(prev);
    const others = dailyLogs.filter(l => l.date !== todayStr);
    const newLogs = [...others, updated].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const handleSaveTodayMission = async () => {
    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    await upsertTodayLog(prev => {
      const prevTodos = prev?.todos ?? [];
      const todoLines = todoInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      const todos: TodoItem[] = todoLines.map((text, index) => {
        const existing = prevTodos.find(t => t.text === text);
        return (
          existing ?? {
            id: `${todayStr}-${index}`,
            text,
            done: false,
          }
        );
      });

      const routineLines = routineText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      const prevDone = prev?.routineDone ?? [];
      const newRoutineDone = prevDone.filter(r => routineLines.includes(r));

      return {
        date: todayStr,
        mission: missionInput.trim(),
        routines: routineLines,
        todos,
        review: prev?.review,
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: newRoutineDone,
      };
    });
  };

  const handleSaveNightReview = async () => {
    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    await upsertTodayLog(prev => ({
      date: todayStr,
      mission: prev?.mission ?? '',
      routines: prev?.routines ?? [],
      todos: prev?.todos ?? [],
      review: {
        proud: proudInput.trim(),
        lesson: lessonInput.trim(),
        nextAction: nextActionInput.trim(),
      },
      samuraiMission: prev?.samuraiMission,
      missionCompleted: prev?.missionCompleted ?? false,
      routineDone: prev?.routineDone ?? [],
    }));
  };

  const toggleTodoDone = async (date: string, todoId: string) => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      return {
        ...log,
        todos: log.todos.map(t =>
          t.id === todoId ? { ...t, done: !t.done } : t,
        ),
      };
    });
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const toggleRoutineDone = async (date: string, label: string) => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      const prevDone = log.routineDone ?? [];
      const exists = prevDone.includes(label);
      const updatedDone = exists
        ? prevDone.filter(r => r !== label)
        : [...prevDone, label];
      return {
        ...log,
        routineDone: updatedDone,
      };
    });
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const handleGenerateSamuraiMission = async () => {
    if (isGeneratingMission) return;

    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    setIsGeneratingMission(true);
    try {
      const mission = await callSamuraiMissionGPT();
      setSamuraiMissionText(mission);

      await upsertTodayLog(prev => ({
        date: todayStr,
        mission: prev?.mission ?? missionInput.trim(),
        routines: prev?.routines ?? [],
        todos: prev?.todos ?? [],
        review: prev?.review,
        samuraiMission: mission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: prev?.routineDone ?? [],
      }));
    } catch (e) {
      console.error(e);
      const errMsg: Message = {
        id: Date.now().toString() + '-mission-err',
        from: 'king',
        text:
          'サムライミッション生成でエラーが出たでござる。ネット環境とAPIキーを確認してほしいでござる。',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsGeneratingMission(false);
    }
  };

  const handleCompleteSamuraiMission = async () => {
    if (!samuraiMissionText || missionCompletedToday) return;

    if (settings.enableHaptics) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const gainedXp = 10;
    const newXp = totalXp + gainedXp;
    setTotalXp(newXp);
    await AsyncStorage.setItem(XP_KEY, String(newXp));

    setMissionCompletedToday(true);

    await upsertTodayLog(prev => ({
      date: todayStr,
      mission: prev?.mission ?? missionInput.trim(),
      routines: prev?.routines ?? [],
      todos: prev?.todos ?? [],
      review: prev?.review,
      samuraiMission: samuraiMissionText,
      missionCompleted: true,
      routineDone: prev?.routineDone ?? [],
    }));

    const praiseText = `よくやった。今日のサムライミッション「${samuraiMissionText}」は達成だ。\n10XP獲得でござる。`;
    const msg: Message = {
      id: Date.now().toString() + '-xp',
      from: 'king',
      text: praiseText,
    };
    setMessages(prev => [...prev, msg]);
    speakSamurai(praiseText);
  };

  const handleToggleRoutineChip = (label: string) => {
    if (settings.enableHaptics) {
      Haptics.selectionAsync().catch(() => {});
    }
    const lines = routineText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    const exists = lines.includes(label);
    const newLines = exists ? lines.filter(l => l !== label) : [...lines, label];
    setRoutineText(newLines.join('\n'));
  };

  const sortedDailyLogs: DailyLog[] = Array.isArray(dailyLogs)
    ? [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const streakCount = getStreakCount(sortedDailyLogs);
  const { level: samuraiLevel, progress: levelProgress, daysToClear } =
    getSamuraiLevelInfo(streakCount);
  const rank = getRankFromXp(totalXp);
  const activeDate =
    selectedDate ||
    (sortedDailyLogs.length
      ? sortedDailyLogs[sortedDailyLogs.length - 1].date
      : null);
  const activeLog =
    activeDate ? sortedDailyLogs.find(log => log.date === activeDate) : null;

  // =====================================================
  // オンボーディング保存
  // =====================================================

  const handleSaveOnboarding = async () => {
    const identity = obIdentity.trim();
    const quit = obQuit.trim();
    const rule = obRule.trim();
    if (!identity) {
      return;
    }

    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const data: OnboardingData = { identity, quit, rule };

    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
      setOnboardingData(data);
      setIsEditingOnboarding(false);
      setIsOnboarding(false);
    } catch (e) {
      console.error('Failed to save onboarding', e);
    }
  };

  // =====================================================
  // APIキー保存（内部用。今はUIからは呼ばない想定）
  // =====================================================

  const handleSaveApiKey = async () => {
    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.enableSfx) {
      await playPressSound();
    }

    const key = apiKeyInput.trim();
    setIsSavingApiKey(true);
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
    } catch (e) {
      console.error('Failed to save API key', e);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  // =====================================================
  // 設定の更新
  // =====================================================

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  // =====================================================
  // データ管理（リセット系）
  // =====================================================

  const handleClearHistory = () => {
    Alert.alert(
      '相談履歴を削除',
      'これまでのサムライ相談の履歴をすべて消すでござる。よろしいか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(HISTORY_KEY);
              setHistory([]);
            } catch (e) {
              console.error('Failed to clear history', e);
            }
          },
        },
      ],
    );
  };

  // ★チャット画面だけリセット
  const handleClearChatMessages = () => {
    Alert.alert(
      'チャット画面をリセット',
      'Samurai King との会話バブルを全部消して、最初の一言だけに戻すでござる。よろしいか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセットする',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: 'first',
                from: 'king',
                text: 'おいおいどうした？その欲望を断ち切るぞ。',
              },
            ]);
            setPhase('idle');
            setPendingIssue(null);
            setFirstReflection(null);
            setChatHistory([]);
            setTurnCount(0);
          },
        },
      ],
    );
  };

  const handleResetTodayLog = () => {
    Alert.alert(
      '今日の目標・日記をリセット',
      `${todayStr} の目標・ルーティン・振り返りを消すでござる。よろしいか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセットする',
          style: 'destructive',
          onPress: async () => {
            try {
              const newLogs = dailyLogs.filter(log => log.date !== todayStr);
              setDailyLogs(newLogs);
              await saveDailyLogsToStorage(newLogs);
              setMissionInput('');
              setRoutineText('');
              setTodoInput('');
              setProudInput('');
              setLessonInput('');
              setNextActionInput('');
              setSamuraiMissionText('');
              setMissionCompletedToday(false);
            } catch (e) {
              console.error('Failed to reset today log', e);
            }
          },
        },
      ],
    );
  };

  // =====================================================
  // UI
  // =====================================================

  const renderTabButton = (value: typeof tab, label: string) => (
    <Pressable
      onPress={() => {
        if (settings.enableHaptics) {
          Haptics.selectionAsync().catch(() => {});
        }
        setTab(value);
      }}
      style={[styles.tabButton, tab === value && styles.tabButtonActive]}
    >
      <Text
        style={[styles.tabButtonText, tab === value && styles.tabButtonTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderConsultTab = () => (
    <View style={{ flex: 1 }}>
      <Pressable
        style={styles.urgeButton}
        onPress={() => {
          handleUrgePress();       // いままで通りチャットを開く処理
          callSamuraiKingVoice();  // 新しく追加した「声で呼び出す」処理
        }}
      >
        <Text style={styles.urgeText}>サムライキングを呼び出す</Text>
      </Pressable>
      <Text style={styles.caption}>
        ムラムラ・不安・サボりたくなったら、このボタンを押して本音を打ち込むのだ。
      </Text>

      {!isSummoned ? (
        <View style={styles.summonBox}>
          <Text style={styles.summonTitle}>Samurai King is waiting…</Text>
          <Text style={styles.summonText}>
            サムライキングは静かにお主を待っている。{'\n'}
            呼び出したあと「チャット」で本音を書いていくのだ。
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === 'chat' && styles.modeButtonActive]}
              onPress={handleSwitchToChat}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'chat' && styles.modeButtonTextActive,
                ]}
              >
                チャット
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeButton,
                mode === 'history' && styles.modeButtonActive,
              ]}
              onPress={handleSwitchToHistory}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'history' && styles.modeButtonTextActive,
                ]}
              >
                履歴
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.chatBox,
              isKeyboardVisible && {
                marginBottom: 4,
              },
            ]}
          >
            {mode === 'chat' ? (
              <>
                <Text style={styles.chatTitle}>Samurai King Chat</Text>

                <ScrollView
                  ref={messagesRef}
                  style={styles.messages}
                  contentContainerStyle={{ paddingBottom: 8 }}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() =>
                    messagesRef.current?.scrollToEnd({ animated: true })
                  }
                >
                  {messages.map(m => (
                    <View
                      key={m.id}
                      style={[
                        styles.bubble,
                        m.from === 'user' ? styles.userBubble : styles.kingBubble,
                      ]}
                    >
                      <Text style={styles.bubbleLabel}>
                        {m.from === 'user' ? 'You' : 'Samurai King'}
                      </Text>
                      <Text style={styles.bubbleText}>{m.text}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.inputRow}>
                  <Pressable
                    style={[
                      styles.micButton,
                      isRecording && styles.micButtonActive,
                    ]}
                    onPress={handleMicPress}
                  >
                    <Text style={styles.micIcon}>
                      {isRecording ? '■' : '🎙️'}
                    </Text>
                  </Pressable>

                  <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder={
                      phase === 'idle'
                        ? '今のムラムラや悩みを正直に書くのだ…'
                        : '「本当はどうしたいか」や今の気持ちを書くのだ…'
                    }
                    placeholderTextColor="#666"
                    multiline
                    blurOnSubmit
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (!input.trim() || isSending) return;
                      const textToSend = input.trim();
                      setInput('');
                      processUserText(textToSend);
                    }}
                  />
                  <Pressable
                    style={[
                      styles.sendButton,
                      !input.trim() && { opacity: 0.5 },
                    ]}
                    onPress={handleSend}
                    disabled={!input.trim() || isSending}
                  >
                    <Text style={styles.sendText}>
                      {isSending ? '…' : '送信'}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.chatTitle}>Samurai Log History</Text>
                {isLoadingHistory ? (
                  <Text style={styles.historyInfo}>
                    履歴を読み込み中でござる…
                  </Text>
                ) : history.length === 0 ? (
                  <Text style={styles.historyInfo}>
                    まだ記録はないでござる。最初の相談をすると自動でここにたまっていくでござる。
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.messages}
                    contentContainerStyle={{ paddingBottom: 8 }}
                  >
                    {history
                      .slice()
                      .reverse()
                      .map(entry => (
                        <View key={entry.id} style={styles.historyEntry}>
                          <Text style={styles.historyDate}>
                            {new Date(entry.date).toLocaleString()}
                          </Text>
                          <Text style={styles.historyLabel}>◆ 相談：</Text>
                          <Text style={styles.historyText}>{entry.issue}</Text>
                          <Text style={styles.historyLabel}>
                            ◆ 本当はこうなりたい：
                          </Text>
                          <Text style={styles.historyText}>
                            {entry.reflection}
                          </Text>
                          <Text style={styles.historyLabel}>
                            ◆ サムライキング：
                          </Text>
                          <Text style={styles.historyText}>{entry.reply}</Text>
                        </View>
                      ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderGoalTab = () => {
    const currentRoutineLines = routineText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>今日のサムライ目標</Text>
          <Text style={styles.goalSub}>
            {todayStr} のミッションを 1つだけ決めるのだ。
          </Text>

          {/* サムライミッション */}
          <View style={{ marginBottom: 12 }}>
            <View style={styles.samuraiMissionHeaderRow}>
              <Text style={styles.samuraiMissionTitle}>サムライミッション</Text>
              <Text style={styles.samuraiMissionXp}>達成で 10XP</Text>
            </View>
            <Text style={styles.goalSub}>
              AIが「今日やるといい一手」をくれるでござる。
            </Text>

            {samuraiMissionText ? (
              <View style={styles.samuraiMissionBox}>
                <Text style={styles.samuraiMissionText}>
                  {samuraiMissionText}
                </Text>
                <Pressable
                  style={[
                    styles.samuraiMissionButton,
                    missionCompletedToday && { opacity: 0.5 },
                  ]}
                  onPress={handleCompleteSamuraiMission}
                  disabled={missionCompletedToday}
                >
                  <Text style={styles.samuraiMissionButtonText}>
                    {missionCompletedToday
                      ? '達成済み！'
                      : 'ミッション達成！XPゲット'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.samuraiMissionButton}
                onPress={handleGenerateSamuraiMission}
              >
                <Text style={styles.samuraiMissionButtonText}>
                  {isGeneratingMission ? '生成中…' : 'サムライミッションを受け取る'}
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.goalSub}>自分で決める今日のミッション</Text>

          <TextInput
            style={styles.bigInput}
            value={missionInput}
            onChangeText={setMissionInput}
            placeholder="例）YouTubeを1本出す / HIITを10分やる"
            placeholderTextColor="#666"
            multiline
          />

          <Text style={styles.goalSub}>
            今日のルーティン（タップで追加 or 手入力）
          </Text>

          <View style={styles.chipRow}>
            {DEFAULT_ROUTINES.map(r => {
              const active = currentRoutineLines.includes(r);
              return (
                <Pressable
                  key={r}
                  style={[
                    styles.routineChip,
                    active && styles.routineChipActive,
                  ]}
                  onPress={() => handleToggleRoutineChip(r)}
                >
                  <Text
                    style={[
                      styles.routineChipText,
                      active && styles.routineChipTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={[styles.todoInput, { marginTop: 8 }]}
            value={routineText}
            onChangeText={setRoutineText}
            placeholder={'例）\n英語1000語\nHIIT 10分\n瞑想5分'}
            placeholderTextColor="#666"
            multiline
          />

          <Text style={[styles.goalSub, { marginTop: 16 }]}>
            ToDo（改行で複数入力できる）
          </Text>
          <TextInput
            style={styles.todoInput}
            value={todoInput}
            onChangeText={setTodoInput}
            placeholder={'例）\nYouTube編集を30分\nレゲエの曲を1曲書く'}
            placeholderTextColor="#666"
            multiline
          />

          <Pressable style={styles.primaryButton} onPress={handleSaveTodayMission}>
            <Text style={styles.primaryButtonText}>今日の目標を保存する</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderReviewTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* サムライ宣言 */}
      {onboardingData && (
        <View style={styles.goalCard}>
          <View style={styles.samuraiHeaderTopRow}>
            <Text style={styles.samuraiHeaderTitle}>サムライ宣言</Text>
            <Pressable
              onPress={() => {
                if (settings.enableHaptics) {
                  Haptics.selectionAsync().catch(() => {});
                }
                setIsEditingOnboarding(true);
                setObIdentity(onboardingData.identity ?? '');
                setObQuit(onboardingData.quit ?? '');
                setObRule(onboardingData.rule ?? '');
              }}
              style={styles.samuraiEditButton}
            >
              <Text style={styles.samuraiEditText}>編集</Text>
            </Pressable>
          </View>

          {isEditingOnboarding ? (
            <>
              <Text style={styles.onboardingLabel}>1. どんなサムライで生きたい？</Text>
              <TextInput
                style={styles.onboardingInput}
                value={obIdentity}
                onChangeText={setObIdentity}
                multiline
              />
              <Text style={styles.onboardingLabel}>2. やめたい習慣は？</Text>
              <TextInput
                style={styles.onboardingInput}
                value={obQuit}
                onChangeText={setObQuit}
                multiline
              />
              <Text style={styles.onboardingLabel}>3. 毎日のマイルール</Text>
              <TextInput
                style={styles.onboardingInput}
                value={obRule}
                onChangeText={setObRule}
                multiline
              />

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Pressable
                  style={[styles.onboardingButton, { flex: 1, marginRight: 4 }]}
                  onPress={handleSaveOnboarding}
                >
                  <Text style={styles.onboardingButtonText}>保存</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.onboardingButton,
                    {
                      flex: 1,
                      marginLeft: 4,
                      backgroundColor: '#374151',
                    },
                  ]}
                  onPress={() => {
                    if (settings.enableHaptics) {
                      Haptics.selectionAsync().catch(() => {});
                    }
                    setIsEditingOnboarding(false);
                    if (onboardingData) {
                      setObIdentity(onboardingData.identity ?? '');
                      setObQuit(onboardingData.quit ?? '');
                      setObRule(onboardingData.rule ?? '');
                    }
                  }}
                >
                  <Text style={[styles.onboardingButtonText, { color: '#e5e7eb' }]}>
                    キャンセル
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.samuraiHeaderLabel}>
                ◆ 俺が目指すサムライ像
              </Text>
              <Text style={styles.samuraiHeaderText}>
                {onboardingData.identity || '（未入力）'}
              </Text>
              <Text style={styles.samuraiHeaderLabel}>◆ やめる習慣</Text>
              <Text style={styles.samuraiHeaderText}>
                {onboardingData.quit || '（未入力）'}
              </Text>
              <Text style={styles.samuraiHeaderLabel}>◆ 毎日のルール</Text>
              <Text style={styles.samuraiHeaderText}>
                {onboardingData.rule || '（未入力）'}
              </Text>
            </>
          )}
        </View>
      )}

      {/* 夜の振り返り */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>夜の振り返り</Text>
        <Text style={styles.goalSub}>
          今日一日を３つの質問で振り返るでござる。
        </Text>

        <Text style={styles.questionText}>1. 今日、一番誇れる行動はなんだ？</Text>
        <TextInput
          style={styles.bigInput}
          value={proudInput}
          onChangeText={setProudInput}
          multiline
        />

        <Text style={styles.questionText}>2. 気づいたこと・学んだことは？</Text>
        <TextInput
          style={styles.bigInput}
          value={lessonInput}
          onChangeText={setLessonInput}
          multiline
        />

        <Text style={styles.questionText}>
          3. 明日ひとつだけ変えてみる行動は？
        </Text>
        <TextInput
          style={styles.bigInput}
          value={nextActionInput}
          onChangeText={setNextActionInput}
          multiline
        />

        <Pressable style={styles.primaryButton} onPress={handleSaveNightReview}>
          <Text style={styles.primaryButtonText}>今日の振り返りを保存する</Text>
        </Pressable>
      </View>

      {/* サムライRPGダッシュボード */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>サムライRPGダッシュボード</Text>
        <Text style={styles.goalSub}>連続ログ：{streakCount} 日でござる🔥</Text>
        <Text style={styles.goalSub}>
          サムライレベル：Lv.{samuraiLevel} / {MAX_LEVEL}{' '}
          {samuraiLevel >= MAX_LEVEL
            ? '（伝説の侍クリア！）'
            : `（あと ${daysToClear} 日で伝説の侍）`}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(levelProgress * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressHint}>
          3日続けるごとにレベルアップ。1ヶ月やり切れば伝説クリアでござる。
        </Text>

        <Text style={styles.goalSub}>
          総経験値：{totalXp} XP（ランク：{rank.label}
          {rank.next > 0 ? ` / 次のランクまで ${rank.next} XP` : ' / MAX'}
          )
        </Text>

        <SamuraiAvatar level={samuraiLevel} rankLabel={rank.label} />

        {/* カレンダー */}
        <Text style={[styles.goalTitle, { fontSize: 16, marginTop: 6 }]}>
          サムライ日記カレンダー
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8, marginBottom: 8 }}
        >
          {sortedDailyLogs.map(log => {
            const isActive = log.date === activeDate;
            return (
              <Pressable
                key={log.date}
                onPress={() => {
                  if (settings.enableHaptics) {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  setSelectedDate(log.date);
                }}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    isActive && styles.dateChipTextActive,
                  ]}
                >
                  {formatDateLabel(log.date)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeLog ? (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.historyDate}>{activeLog.date}</Text>

            <Text style={styles.historyLabel}>◆ 目標</Text>
            <Text style={styles.historyText}>
              {activeLog.mission || '（未入力だぞ）'}
            </Text>

            <Text style={styles.historyLabel}>◆ サムライミッション</Text>
            <Text style={styles.historyText}>
              {activeLog.samuraiMission
                ? `${activeLog.samuraiMission} ${
                    activeLog.missionCompleted ? '（達成済み）' : '（未達成）'
                  }`
                : '（まだ受け取っていないぞ）'}
            </Text>

            <Text style={styles.historyLabel}>◆ サムライルーティン</Text>
            {activeLog.routines.length === 0 ? (
              <Text style={styles.historyText}>（まだ選ばれていないぞ）</Text>
            ) : (
              activeLog.routines.map(r => {
                const done = activeLog.routineDone?.includes(r);
                return (
                  <Pressable
                    key={r}
                    style={styles.todoRow}
                    onPress={() => toggleRoutineDone(activeLog.date, r)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        done && styles.checkboxChecked,
                      ]}
                    />
                    <Text
                      style={[
                        styles.todoText,
                        done && styles.todoTextDone,
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                );
              })
            )}

            <Text style={styles.historyLabel}>◆ ToDo</Text>
            {activeLog.todos.length === 0 ? (
              <Text style={styles.historyText}>（登録なしだ）</Text>
            ) : (
              activeLog.todos.map(todo => (
                <Pressable
                  key={todo.id}
                  style={styles.todoRow}
                  onPress={() => toggleTodoDone(activeLog.date, todo.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      todo.done && styles.checkboxChecked,
                    ]}
                  />
                  <Text
                    style={[
                      styles.todoText,
                      todo.done && styles.todoTextDone,
                    ]}
                  >
                    {todo.text}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        ) : (
          <Text style={styles.historyInfo}>まだ日記はないでござる。</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>設定</Text>
        <Text style={styles.goalSub}>
          サムライキングの声やバイブの強さを、自分好みにカスタムできるでござる。
        </Text>

        {/* サムライボイス設定 */}
        <Text style={styles.sectionTitle}>サムライボイス</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>自動で声を再生する</Text>
            <Text style={styles.settingsHint}>
              OFFにすると、テキストだけ静かに読むモードになるでござる。
            </Text>
          </View>
          <Switch
            value={settings.autoVoice}
            onValueChange={v => updateSettings({ autoVoice: v })}
          />
        </View>

        <Text style={[styles.settingsLabel, { marginTop: 8 }]}>
          読み上げスピード
        </Text>
        <View style={styles.segmentRow}>
          {[
            { key: 'slow', label: 'ゆっくり' },
            { key: 'normal', label: 'ふつう' },
            { key: 'fast', label: '速め' },
          ].map(opt => {
            const active = settings.readingSpeed === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
                onPress={() =>
                  updateSettings({
                    readingSpeed: opt.key as AppSettings['readingSpeed'],
                  })
                }
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    active && styles.segmentButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 振動・効果音 */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
          振動・効果音
        </Text>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>ボタン操作でバイブする</Text>
            <Text style={styles.settingsHint}>
              OFFにすると、スマホの振動なしで静かに操作できるでござる。
            </Text>
          </View>
          <Switch
            value={settings.enableHaptics}
            onValueChange={v => updateSettings({ enableHaptics: v })}
          />
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>太鼓・マイクの効果音</Text>
            <Text style={styles.settingsHint}>
              OFFにすると、効果音なしのステルスモードになるでござる。
            </Text>
          </View>
          <Switch
            value={settings.enableSfx}
            onValueChange={v => updateSettings({ enableSfx: v })}
          />
        </View>

        {/* サムライの厳しさ */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
          サムライの厳しさ（口調レベル）
        </Text>
        <Text style={styles.settingsHint}>
          今のメンタルに合わせて、どれくらいズバッと言ってほしいか選べるでござる。
        </Text>

        <View style={styles.segmentRow}>
          {[
            { key: 'soft', label: '優しめ' },
            { key: 'normal', label: 'ふつう' },
            { key: 'hard', label: 'ちょい厳しめ' },
          ].map(opt => {
            const active = settings.strictness === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
                onPress={() =>
                  updateSettings({
                    strictness: opt.key as AppSettings['strictness'],
                  })
                }
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    active && styles.segmentButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 通知（あとで実装） */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
          通知リマインド（準備中）
        </Text>
        <Text style={styles.settingsHint}>
          朝ミッション・夜の振り返りのプッシュ通知は、今後のアップデートで実装予定でござる。
        </Text>

        {/* データ管理 */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
          データ管理
        </Text>
        <Text style={styles.settingsHint}>
          誤爆したときや、一度リセットしたいとき用だ。押す前によく考えるでござる。
        </Text>

        {/* 相談ログ（履歴タブ用）を全部削除 */}
        <Pressable style={styles.dangerButton} onPress={handleClearHistory}>
          <Text style={styles.dangerButtonText}>
            相談履歴（ログ）をすべて削除
          </Text>
        </Pressable>

        {/* チャット画面だけリセット */}
        <Pressable
          style={[styles.dangerButton, { marginTop: 6 }]}
          onPress={handleClearChatMessages}
        >
          <Text style={styles.dangerButtonText}>
            チャット画面の会話をリセット
          </Text>
        </Pressable>

        {/* 今日の目標・日記だけリセット */}
        <Pressable
          style={[styles.dangerButton, { marginTop: 6 }]}
          onPress={handleResetTodayLog}
        >
          <Text style={styles.dangerButtonText}>
            今日の目標・日記をリセット
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  // ===== オンボーディング画面 =====

  if (isLoadingOnboarding) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.onboardingTitle}>ロード中でござる…</Text>
      </View>
    );
  }

  if (isOnboarding) {
    return (
      <KeyboardAvoidingView
        style={styles.onboardingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.onboardingInner}>
            <Text style={styles.onboardingTitle}>サムライ宣言を作るでござる</Text>

            <Text style={styles.onboardingLabel}>1. どんなサムライで生きたい？</Text>
            <TextInput
              style={styles.onboardingInput}
              value={obIdentity}
              onChangeText={setObIdentity}
              placeholder="例）家族と仲間を守る優しいサムライ"
              placeholderTextColor="#666"
              multiline
            />

            <Text style={styles.onboardingLabel}>2. やめたい習慣は？</Text>
            <TextInput
              style={styles.onboardingInput}
              value={obQuit}
              onChangeText={setObQuit}
              placeholder="例）スマホだらだら見・ポルノ・酒の飲み過ぎ"
              placeholderTextColor="#666"
              multiline
            />

            <Text style={styles.onboardingLabel}>3. 毎日のマイルール</Text>
            <TextInput
              style={styles.onboardingInput}
              value={obRule}
              onChangeText={setObRule}
              placeholder="例）毎日1つだけ自分を褒められる行動をする"
              placeholderTextColor="#666"
              multiline
            />

            <Pressable style={styles.onboardingButton} onPress={handleSaveOnboarding}>
              <Text style={styles.onboardingButtonText}>サムライ宣言を保存する</Text>
            </Pressable>

            <Pressable
              style={styles.onboardingSkip}
              onPress={() => {
                setIsOnboarding(false);
              }}
            >
              <Text style={styles.onboardingSkipText}>あとで決める（今はスキップ）</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // ===== メイン画面 =====

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.tabRow}>
            {renderTabButton('consult', '相談')}
            {renderTabButton('goal', '今日の目標')}
            {renderTabButton('review', '振り返り')}
            {renderTabButton('settings', '設定')}
          </View>

          <View style={{ flex: 1 }}>
            {tab === 'consult'
              ? renderConsultTab()
              : tab === 'goal'
              ? renderGoalTab()
              : tab === 'review'
              ? renderReviewTab()
              : renderSettingsTab()}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// スタイル
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#555',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffb300',
    borderColor: '#ffb300',
  },
  tabButtonText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: '#000',
  },
  urgeButton: {
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#e53935',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  caption: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  summonBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 8,
  },
  summonTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  summonText: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#444',
    marginHorizontal: 2,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modeButtonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  chatBox: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#020617',
    padding: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  chatTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  messages: {
    flex: 1,
    maxHeight: 260,
  },
  bubble: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1f2937',
  },
  kingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
  },
  bubbleLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  bubbleText: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flexend',
    marginTop: 6,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  micIcon: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#4b5563',
    color: '#e5e7eb',
    fontSize: 13,
  },
  sendButton: {
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 13,
  },
  historyInfo: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  historyEntry: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  historyDate: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
  },
  historyLabel: {
    color: '#fbbf24',
    fontSize: 11,
    marginTop: 4,
  },
  historyText: {
    color: '#e5e7eb',
    fontSize: 12,
    lineHeight: 18,
  },
  goalCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  goalTitle: {
    color: '#f9fafb',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  goalSub: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  samuraiMissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  samuraiMissionTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 14,
  },
  samuraiMissionXp: {
    color: '#a5b4fc',
    fontSize: 11,
  },
  samuraiMissionBox: {
    marginTop: 4,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  samuraiMissionText: {
    color: '#e5e7eb',
    fontSize: 13,
    marginBottom: 6,
  },
  samuraiMissionButton: {
    marginTop: 4,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  samuraiMissionButtonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 13,
  },
  bigInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    minHeight: 60,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  routineChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginRight: 4,
    marginBottom: 4,
  },
  routineChipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  routineChipText: {
    color: '#e5e7eb',
    fontSize: 11,
  },
  routineChipTextActive: {
    color: '#02131d',
    fontWeight: '600',
  },
  todoInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    minHeight: 60,
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 14,
  },
  questionText: {
    color: '#e5e7eb',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  progressHint: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginRight: 4,
  },
  dateChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dateChipText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  dateChipTextActive: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  todoText: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  todoTextDone: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  settingsRowText: {
    flex: 1,
    paddingRight: 8,
  },
  settingsLabel: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  settingsHint: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  segmentRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
    marginRight: 4,
  },
  segmentButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  segmentButtonText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  segmentButtonTextActive: {
    color: '#02131d',
    fontWeight: '700',
  },
  dangerButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fecaca',
    fontWeight: '600',
    fontSize: 13,
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#050810',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  onboardingInner: {
    flex: 1,
  },
  onboardingTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  onboardingLabel: {
    color: '#e5e7eb',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  onboardingInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    minHeight: 60,
  },
  onboardingButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 14,
  },
  onboardingSkip: {
    marginTop: 12,
    alignItems: 'center',
  },
  onboardingSkipText: {
    color: '#9ca3af',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  samuraiHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  samuraiHeaderTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 15,
  },
  samuraiEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  samuraiEditText: {
    color: '#e5e7eb',
    fontSize: 11,
  },
  samuraiHeaderLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  samuraiHeaderText: {
    color: '#e5e7eb',
    fontSize: 12,
    lineHeight: 18,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarTitle: {
    color: '#f9fafb',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  avatarRank: {
    color: '#a5b4fc',
    fontSize: 12,
    marginBottom: 2,
  },
  avatarDesc: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 16,
  },
});