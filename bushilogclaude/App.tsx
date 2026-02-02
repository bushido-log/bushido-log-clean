// App.tsx (refactor / rewrite)
// BUSHIDO LOG - single file version (keeps your current features)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  Image,
  ImageBackground,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { initializePurchases, checkProStatus, getOffering, purchasePro, restorePurchases, getMonthlyPrice } from './src/services/purchaseService';
import { PurchasesPackage } from 'react-native-purchases';

// =========================
// Config / Constants
// =========================

const API_BASE = "https://bushido-log-server.onrender.com";
const SAMURAI_TTS_URL = `${API_BASE}/tts`;
const SAMURAI_CHAT_URL = `${API_BASE}/samurai-chat`;
const SAMURAI_MISSION_URL = `${API_BASE}/mission`;

// 音ファイル
const STARTUP_SOUND = require('./sounds/startup.mp3');
const TAP_SOUND = require('./sounds/tap.mp3');
const CONFIRM_SOUND = require('./sounds/confirm.mp3');
const RITUAL_SOUND = require('./sounds/ritual.mp3');
const CHECK_SOUND = require('./sounds/check.mp3');
const CORRECT_SOUND = require('./sounds/correct.mp3');
const WRONG_SOUND = require('./sounds/wrong.mp3');
const ENTER_SOUND = require('./sounds/enter.mp3');
const FOCUS_START_SOUND = require('./sounds/focus_start.mp3');
const KATANA_SOUND = require('./sounds/katana_swish.mp3');

// 道場の門 画像
const DOJO_GATE_DIM = require('./assets/images/dojo_gate_dim.png');
const DOJO_GATE_LIGHT = require('./assets/images/dojo_gate_light.png');
const CONSULT_BG = require('./assets/images/consult_bg.png');

// Intro動画
const INTRO_VIDEO = require('./assets/intro_video.mov');

const SESSION_KEY = 'samurai_session_id';

// AsyncStorage Keys
const HISTORY_KEY = 'BUSHIDO_LOG_HISTORY_V1';
const DAILY_LOGS_KEY = 'BUSHIDO_DAILY_LOGS_V1';
const ONBOARDING_KEY = 'BUSHIDO_ONBOARDING_V1';
const XP_KEY = 'BUSHIDO_TOTAL_XP_V1';
const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';
const BLOCKLIST_KEY = 'BUSHIDO_BLOCKLIST_V1';
const SAMURAI_TIME_KEY = 'BUSHIDO_SAMURAI_TIME_V1';
const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';
const FIRST_LAUNCH_KEY = 'BUSHIDO_FIRST_LAUNCH_V1';
const INTRO_SKIP_KEY = 'BUSHIDO_INTRO_SKIP_V1';
const FREE_TRIAL_DAYS = 3;

const MAX_LEVEL = 10;
const DAYS_PER_LEVEL = 3;

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

const urgeMessage = 'その欲望、一刀両断！サムライキング参上。';

const PRIVACY_POLICY_TEXT = `
プライバシーポリシー

本プライバシーポリシーは、BUSHIDO LOG（以下「本アプリ」）において、利用者の皆さまの情報をどのように取り扱うかを定めるものです。
本アプリを利用する前に、必ずお読みください。

1. 事業者情報
・アプリ名：BUSHIDO LOG
・運営者名：HIROYA KOSHIISHI
・連絡先：oyaisyours@gmail.com

2. 取得する情報
本アプリでは、次の情報を取得する場合があります。
1. ユーザーが入力するテキスト
・日記・ログ・目標・相談内容などの文章
2. マイクから取得される音声データ
・音声入力で相談した内容
・音声は、AIによる文字起こしのために一時的にサーバーに保存される場合があります。
3. 利用ログ
・利用日時
・どのボタンを押したか など、アプリの改善のための基本的なログ
4. デバイス情報
・OSの種類やバージョン、アプリのバージョン など
※個人を特定することを目的とした情報は取得しません。

3. 情報の利用目的
取得した情報は、主に以下の目的で利用します。
1. AIコーチ機能の提供（チャット・アドバイス・読み上げ等）
2. アプリの品質向上・不具合の調査
3. 利用状況の分析による機能改善
4. 法令への遵守、安全対策のため

4. 外部サービスの利用
本アプリでは、AI機能の提供のため、以下の外部サービスを利用する場合があります。
・OpenAI, L.L.C. が提供する API（テキスト生成・音声合成・文字起こし 等）

AIに送信されるデータには、ユーザーの入力テキストや、音声を文字起こしした内容が含まれる場合があります。
外部サービスの利用にあたっては、各サービスのプライバシーポリシーも合わせてご確認ください。

5. 第三者提供
次の場合を除き、取得した情報を第三者に提供することはありません。
1. ユーザー本人の同意がある場合
2. 法令に基づき開示を求められた場合
3. 人の生命・身体・財産を守るために必要であり、本人の同意を得ることが難しい場合

6. 保存期間
利用ログやテキストデータは、アプリの継続的な利用に必要な範囲で保存します。
不要になった情報は、適切な方法で削除・匿名化します。

7. 安全管理
取得した情報については、不正アクセスや漏えい等を防ぐため、
アクセス権限の管理、通信の暗号化など、合理的な安全対策を行います。

8. 未成年の利用について
本アプリは、13歳以上の利用を想定しています。
未成年の方は、保護者の同意を得た上で利用してください。

9. プライバシーポリシーの変更
本ポリシーの内容は、必要に応じて変更されることがあります。
重要な変更がある場合は、アプリ内でお知らせします。

10. お問い合わせ窓口
本ポリシーに関するお問い合わせは、下記までご連絡ください。
・メールアドレス：oyaisyours@gmail.com
`;

// =========================
// Types
// =========================

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
  imageUri?: string;
};

type GoodDeedEntry = {
  id: string;
  date: string;
  text: string;
  imageUri?: string;
  tag?: string;
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
  goodDeeds?: string[];
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

type SamuraiTimeState = {
  date: string;
  seconds: number;
  dailyMinutes: number; // 0 = 無制限
};

// =========================
// Defaults
// =========================

const DEFAULT_SETTINGS: AppSettings = {
  autoVoice: true,
  readingSpeed: 'normal',
  enableHaptics: true,
  enableSfx: true,
  strictness: 'normal',
};

// =========================
// Utils
// =========================

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

function getRankFromXp(xp: number) {
  if (xp < 30) return { label: '見習い侍', next: 30 - xp };
  if (xp < 100) return { label: '一人前侍', next: 100 - xp };
  if (xp < 300) return { label: '修羅の侍', next: 300 - xp };
  return { label: '伝説の侍', next: 0 };
}

function getSamuraiLevelInfo(streak: number) {
  if (streak <= 0) {
    return { level: 1, progress: 0, daysToClear: MAX_LEVEL * DAYS_PER_LEVEL };
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

async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// =========================
// Audio helpers
// =========================

// マスター音量（0.0〜1.0）
const MASTER_VOLUME = 0.3;

async function playSound(source: any) {
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.setVolumeAsync(MASTER_VOLUME);
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
  await playSound(STARTUP_SOUND);
}

// 各種サウンド再生
async function playTapSound() {
  await playSound(TAP_SOUND);
}

async function playConfirmSound() {
  await playSound(CONFIRM_SOUND);
}

async function playRitualSound() {
  await playSound(RITUAL_SOUND);
}

async function playCheckSound() {
  await playSound(CHECK_SOUND);
}

async function playCorrectSound() {
  await playSound(CORRECT_SOUND);
}

async function playWrongSound() {
  await playSound(WRONG_SOUND);
}

async function playEnterSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(ENTER_SOUND);
    await sound.setVolumeAsync(0.15); // 他より小さめ
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.log('enter sound error', e);
  }
}

async function playFocusStartSound() {
  await playSound(FOCUS_START_SOUND);
}

// =========================
// API
// =========================

async function callSamuraiKing(message: string): Promise<string> {
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

async function callSamuraiMissionGPT(): Promise<string> {
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

// =========================
// UI: Samurai Avatar
// =========================

function SamuraiAvatar({ level, rankLabel }: { level: number; rankLabel: string }) {
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
    desc = '1ヶ月以上やり切った、本物のサムライだ。ここからは守りではなく拡張だな。';
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

// =========================
// Main App
// =========================

export default function App() {
  const todayStr = useMemo(() => getTodayStr(), []);

  // 保存成功時のフィードバック
  // タイプライター効果
  const typeWriter = (fullText: string, msgId: string, callback?: () => void) => {
    setTypingMessageId(msgId);
    setTypingText('');
    let index = 0;
    const speed = 250; // ミリ秒/文字
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTypingMessageId(null);
        if (callback) callback();
      }
    }, speed);
  };

  const showSaveSuccess = (message: string = '一太刀入魂。保存した。') => {
    playConfirmSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaveToastMessage(message);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };
  const messagesRef = useRef<ScrollView | null>(null);

  const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm'>('consult');
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  
  // 感謝機能
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showGratitudeComplete, setShowGratitudeComplete] = useState(false);
  const [gratitudeAiComment, setGratitudeAiComment] = useState('');
  const [isLoadingGratitudeComment, setIsLoadingGratitudeComment] = useState(false);
  // 1日1善
  const [goodDeedList, setGoodDeedList] = useState<GoodDeedEntry[]>([]);
  const [goodDeedText, setGoodDeedText] = useState('');
  const [goodDeedImage, setGoodDeedImage] = useState<string | null>(null);
  const [goodDeedTag, setGoodDeedTag] = useState('');
  const GOOD_DEED_KEY = 'BUSHIDO_GOOD_DEED_V1';
  const GOOD_DEED_TAGS = ['掃除', '寄付', '家族', '仕事', '学び', '健康', '他者'];
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  
  // 集中機能
  const [focusPurpose, setFocusPurpose] = useState('');
  const [focusUrl, setFocusUrl] = useState('https://www.google.com');
  const [showFocusEntry, setShowFocusEntry] = useState(true);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusMinutesLeft, setFocusMinutesLeft] = useState(25);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const [focusMode, setFocusMode] = useState<'work' | 'break'>('work');
  const [focusTimerRunning, setFocusTimerRunning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com', 'youtube.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');
  
  // アラーム機能
  const [showDojoGate, setShowDojoGate] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [introSkipped, setIntroSkipped] = useState(false);
  const [skipIntroNext, setSkipIntroNext] = useState(false);
  const [gatePhase, setGatePhase] = useState<'dim' | 'light' | 'button'>('dim');
  const dimOpacity = useRef(new Animated.Value(1)).current;
  const lightOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  
  // 道場の門アニメーション
  useEffect(() => {
    if (showDojoGate) {
      // 0.8秒後に暗い門→明るい門へクロスフェード
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(dimOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(lightOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start(() => {
          setGatePhase('light');
          // 200ms待ってからボタンをフェードイン
          setTimeout(() => {
            setGatePhase('button');
            Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
          }, 200);
        });
      }, 100);
    }
  }, [showDojoGate]);
  
  // Introスキップ設定を読み込み
  useEffect(() => {
    (async () => {
      const skipped = await AsyncStorage.getItem(INTRO_SKIP_KEY);
      setIntroSkipped(skipped === 'true');
    })();
  }, []);
  
  // 道場の門を閉じる（刀音付き）
  const handleEnterDojo = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(KATANA_SOUND);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('katana sound error', e);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // 150ms後に遷移
    setTimeout(async () => {
      setShowDojoGate(false);
      // Introをスキップしていなければ表示
      if (!introSkipped) {
        setShowIntro(true);
      }
    }, 150);
  };
  
  // Introを閉じてホームへ
  const handleCloseIntro = async () => {
    // 動画を一度見たら次回からスキップ
    await AsyncStorage.setItem(INTRO_SKIP_KEY, 'true');
    setIntroSkipped(true);
    setVideoFinished(false);
    setShowIntro(false);
  };
  
  // Introを再表示（設定から）
  const resetIntroSkip = async () => {
    await AsyncStorage.removeItem(INTRO_SKIP_KEY);
    setIntroSkipped(false);
    Alert.alert('完了', '次回起動時にIntroが表示されます');
  };
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmMission, setAlarmMission] = useState<'冷蔵庫' | '洗面台' | '玄関'>('洗面台');
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [alarmLevel, setAlarmLevel] = useState(1);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const alarmMessages = {
    1: [
      '素晴らしい朝だ。今日という日は二度と来ない。',
      '今日はお前の人生で最高の日になる。',
      '新しい朝だ。昨日の自分を超えるチャンスだ。',
      '今日はお前にしかできない何かがある。',
    ],
    2: [
      '今日という贈り物を受け取れ。',
      '今日を最高の一日にしよう。',
      '布団から出れば、素晴らしい世界が待っている。',
      'お前には無限の可能性がある。',
    ],
    3: [
      'さあ、そろそろ起きる時間だ。',
      '今日という日が待っているぞ。',
      'あと少しの勇気だ。立ち上がれ。',
      'お前ならできる。さあ、起きよう。',
    ],
    4: [
      'おい。そろそろ起きろ。',
      'いつまで寝ている？',
      '甘えるな。起きろ。',
      'もう時間だ。',
    ],
    5: [
      'おい！そろそろ起きろ！', 
      '何をしている！起きろ！',
      '立て！今すぐ！',
      'いつまで甘えている！',
    ],
    6: [
      '起きろ！', 
      '行動！', 
      '立て！', 
      'いい加減起きろ！',
      '最高の日にしろ！',
      '誰かが生きたかった今日だぞ！',
      'お前ならできる！',
      '今日を無駄にするな！',
      'さあ立て！',
    ],
  };
  
  const alarmStartTimeRef = useRef<number>(0);
  
  const scheduleNextShout = () => {
    const elapsedSec = (Date.now() - alarmStartTimeRef.current) / 1000;
    let level = 1;
    let interval = 12000;
    
    if (elapsedSec > 180) {
      level = 6; interval = 2500;  // 3分以上：くるってくる
    } else if (elapsedSec > 150) {
      level = 6; interval = 4000;
    } else if (elapsedSec > 120) {
      level = 5; interval = 6000;
    } else if (elapsedSec > 90) {
      level = 4; interval = 8000;
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000;
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000;
    }
    
    const displayLevel = level <= 3 ? 1 : Math.min(level - 2, 4);
    setAlarmLevel(displayLevel);
    
    const msgs = alarmMessages[level as 1|2|3|4|5|6];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    let fullMsg = msg;
    if (level <= 3) {
      fullMsg += ' ' + alarmMission + 'を撮影して最高の一日を始めよう。';
    } else if (level === 4) {
      fullMsg += ' ' + alarmMission + 'を撮れ。';
    } else if (level === 5) {
      fullMsg += ' 今すぐ' + alarmMission + '撮影しろ！';
    } else {
      fullMsg += ' ' + alarmMission + '撮れ！！今すぐ！！';
    }
    
    speakSamurai(fullMsg);
    if (level >= 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, interval);
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    
    speakSamurai('おはよう！今日という日は、お前の人生で最も素晴らしい日になる。さあ、' + alarmMission + 'を撮影して、最高の一日を始めよう！');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, 12000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearTimeout(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarmRinging(false);
    setAlarmSet(false);
    speakSamurai('よくやった。今日も己に勝て。武士道とは毎朝の勝利から始まる。');
  };
  
  const takeMissionPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラ許可が必要', 'アラームを止めるにはカメラを許可してください');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    
    if (!result.canceled) {
      stopAlarm();
      setShowStartScreen(true);
    }
  };
  const [focusDuration, setFocusDuration] = useState(25);
  const [ngWords, setNgWords] = useState<string[]>(['エロ', 'アダルト', 'porn', 'sex', 'ギャンブル', 'カジノ', 'パチンコ']);
  const [newNgWord, setNewNgWord] = useState('');
  const [ngLevel, setNgLevel] = useState<3 | 5 | 10>(5);
  const [showNgQuiz, setShowNgQuiz] = useState(false);
  const [ngQuizRemaining, setNgQuizRemaining] = useState(0);
  const [pendingUrl, setPendingUrl] = useState('');
  const [currentNgQ, setCurrentNgQ] = useState({ q: '', a: '' });
  const [ngAnswer, setNgAnswer] = useState('');
  const [focusQuestionAnswer, setFocusQuestionAnswer] = useState('');
  const [showFocusQuestion, setShowFocusQuestion] = useState(false);
  const [currentFocusQ, setCurrentFocusQ] = useState({ q: '', a: '' });

  // 英語の問題（摩擦を生む）
  const focusQuestions = [
    { q: 'What is the opposite of "success"?', a: 'failure' },
    { q: 'What is the past tense of "go"?', a: 'went' },
    { q: 'What is the capital of Japan?', a: 'tokyo' },
    { q: 'How do you say "時間" in English?', a: 'time' },
    { q: 'What is 7 x 8?', a: '56' },
    { q: 'What is the opposite of "hot"?', a: 'cold' },
    { q: 'How many days in a week?', a: '7' },
    { q: 'What color is the sky?', a: 'blue' },
    { q: 'What is the plural of "child"?', a: 'children' },
    { q: 'What comes after Wednesday?', a: 'thursday' },
  ];
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // 自己啓発クイズデータ
  const quizData = [
    { q: '「継続は___なり」', a: '力', hint: '続けることで得られるもの' },
    { q: '「思考は___化する」', a: '現実', hint: '考えたことがなるもの' },
    { q: '「行動なき___に価値なし」', a: '知識', hint: '学んだだけでは意味がないもの' },
    { q: '「今日できることを___に延ばすな」', a: '明日', hint: '今日の次の日' },
    { q: '「失敗は___の母」', a: '成功', hint: '失敗から生まれるもの' },
    { q: '「千里の道も___から」', a: '一歩', hint: '最初の小さな行動' },
    { q: '「時は___なり」', a: '金', hint: 'お金と同じくらい大切' },
    { q: '「七転び___起き」', a: '八', hint: '7+1' },
    { q: '「早起きは三文の___」', a: '徳', hint: '良いこと' },
    { q: '「塵も積もれば___となる」', a: '山', hint: '高いもの' },
  ];

  // onboarding
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [obIdentity, setObIdentity] = useState('');
  const [obQuit, setObQuit] = useState('');
  const [obRule, setObRule] = useState('');

  // settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  // 課金関連
  const [isPro, setIsPro] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState('¥700/月');
  const [samuraiKingUses, setSamuraiKingUses] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // chat
  const [isSummoned, setIsSummoned] = useState(false);
  // 欲望可視化モード
  const [consultMode, setConsultMode] = useState<'select' | 'text' | 'visualize'>('select');
  const [yokubouImage, setYokubouImage] = useState<string | null>(null);
  const [yokubouReason, setYokubouReason] = useState('');
  const [yokubouAiReply, setYokubouAiReply] = useState('');
  const [isLoadingYokubou, setIsLoadingYokubou] = useState(false);
  const [yokubouSaved, setYokubouSaved] = useState(false);
  const [mode, setMode] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'first', from: 'king', text: 'おいおいどうした？その欲望を断ち切るぞ。' },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // daily logs
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // edit existing review
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editProud, setEditProud] = useState('');
  const [editLesson, setEditLesson] = useState('');
  const [editNextAction, setEditNextAction] = useState('');

  // goal tab inputs
  const [missionInput, setMissionInput] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [todoInput, setTodoInput] = useState('');

  // review tab inputs
  const [proudInput, setProudInput] = useState('');
  const [lessonInput, setLessonInput] = useState('');
  const [nextActionInput, setNextActionInput] = useState('');

  // samurai mission
  const [samuraiMissionText, setSamuraiMissionText] = useState('');
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [missionCompletedToday, setMissionCompletedToday] = useState(false);

  // XP
  const [totalXp, setTotalXp] = useState(0);

  // browser
  const [browserUrl, setBrowserUrl] = useState('https://google.com');
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [blocklistInput, setBlocklistInput] = useState('');

  // samurai time
  const [samuraiTime, setSamuraiTime] = useState<SamuraiTimeState>({
    date: todayStr,
    seconds: 0,
    dailyMinutes: 60,
  });

  const isTimeLimited = samuraiTime.dailyMinutes > 0;
  const maxSeconds = samuraiTime.dailyMinutes * 60;
  const isTimeOver = isTimeLimited && samuraiTime.seconds >= maxSeconds;
  const usedMinutes = Math.floor(samuraiTime.seconds / 60);
  const remainingMinutes = isTimeLimited ? Math.max(0, samuraiTime.dailyMinutes - usedMinutes) : null;

  // =========================
  // Startup sound
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(STARTUP_SOUND);
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
        });
      } catch (e) {
        console.log('start sound error', e);
      }
    })();
  }, []);

  // =========================
  // Keyboard watcher
  // =========================
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // =========================
  // Loaders
  // =========================

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

  useEffect(() => {
    loadHistory();
  }, []);

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

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(BLOCKLIST_KEY);
        if (json) {
          const arr = JSON.parse(json);
          if (Array.isArray(arr)) setBlockedDomains(arr);
        }
      } catch (e) {
        console.error('Failed to load blocklist', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_TIME_KEY);
        if (json) {
          const parsed = JSON.parse(json) as SamuraiTimeState;
          if (
            parsed &&
            typeof parsed.dailyMinutes === 'number' &&
            typeof parsed.seconds === 'number' &&
            typeof parsed.date === 'string'
          ) {
            const today = getTodayStr();
            if (parsed.date !== today) {
              setSamuraiTime({ date: today, seconds: 0, dailyMinutes: parsed.dailyMinutes });
            } else {
              setSamuraiTime(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load samurai time', e);
      }
    })();
  }, []);

  // =========================
  // Tab change sync (Goal/Review)
  // =========================
  useEffect(() => {
    const todayLog = dailyLogs.find(l => l.date === getTodayStr());

    if (tab === 'goal') {
      setMissionInput(todayLog?.mission ?? '');
      setRoutineText(todayLog?.routines?.join('\n') ?? '');
      setTodoInput(todayLog?.todos?.map(t => t.text).join('\n') ?? '');
      setSamuraiMissionText(todayLog?.samuraiMission ?? '');
      setMissionCompletedToday(todayLog?.missionCompleted ?? false);
    }

    if (tab === 'review') {
      const targetDate = selectedDate || (todayLog ? todayLog.date : undefined);
      const targetLog = targetDate ? dailyLogs.find(l => l.date === targetDate) : undefined;

      setProudInput(targetLog?.review?.proud ?? '');
      setLessonInput(targetLog?.review?.lesson ?? '');
      setNextActionInput(targetLog?.review?.nextAction ?? '');

      if (!selectedDate && todayLog) setSelectedDate(todayLog.date);
    }
  }, [tab, dailyLogs, selectedDate]);

  // =========================
  // Auto scroll chat
  // =========================
  useEffect(() => {
    if (mode !== 'chat') return;
    setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, mode, isKeyboardVisible]);

  // =========================
  // Samurai time ticker
  // =========================
  useEffect(() => {
    if (isOnboarding) return;
    if (!samuraiTime.dailyMinutes || samuraiTime.dailyMinutes <= 0) return;

    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled) return;

      setSamuraiTime(prev => {
        const today = getTodayStr();
        let base = prev;

        if (prev.date !== today) {
          base = { ...prev, date: today, seconds: 0 };
        }

        const maxSec = base.dailyMinutes * 60;
        if (base.seconds >= maxSec) return base;

        const updated: SamuraiTimeState = { ...base, seconds: base.seconds + 1 };
        AsyncStorage.setItem(SAMURAI_TIME_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnboarding, samuraiTime.dailyMinutes]);

  // =========================
  // Settings save
  // =========================
  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const updateSamuraiDailyMinutes = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const num = parseInt(numeric, 10);
    const minutes = Number.isNaN(num) ? 0 : Math.max(0, Math.min(600, num)); // max 10h

    setSamuraiTime(prev => {
      const next: SamuraiTimeState = { ...prev, dailyMinutes: minutes };
      AsyncStorage.setItem(SAMURAI_TIME_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // =========================
  // Storage helpers: daily logs
  // =========================
  const saveDailyLogsToStorage = async (logs: DailyLog[]) => {
    try {
      await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save daily logs', e);
    }
  };

  const upsertLogForDate = async (date: string, updater: (prev: DailyLog | undefined) => DailyLog) => {
    const prev = dailyLogs.find(l => l.date === date);
    const updated = updater(prev);
    const others = dailyLogs.filter(l => l.date !== date);
    const newLogs = [...others, updated].sort((a, b) => a.date.localeCompare(b.date));
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const upsertTodayLog = async (updater: (prev: DailyLog | undefined) => DailyLog) => {
    return upsertLogForDate(getTodayStr(), updater);
  };

  // =========================
  // TTS (server audio)
  // =========================
  const speakSamurai = async (text: string) => {
    if (!text || !settings.autoVoice) return;

    const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('[TTS] error', e);
    }
  };

  // =========================
  // Haptics/SFX wrappers
  // =========================
  const tap = async (type: 'light' | 'medium' | 'select' | 'success' = 'select') => {
    if (!settings.enableHaptics && !settings.enableSfx) return;

    if (settings.enableHaptics) {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (type === 'select') Haptics.selectionAsync().catch(() => {});
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (settings.enableSfx) await playTapSound();
  };

  // =========================
  // Chat actions
  // =========================
  const handleUrgePress = async () => {
    setIsSummoned(true);
    await tap('medium');
    speakSamurai(urgeMessage);
  };

  // 欲望可視化: 画像選択
  const pickYokubouImage = async () => {
    playTapSound();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setYokubouImage(result.assets[0].uri);
      setYokubouAiReply('');
      setYokubouSaved(false);
    }
  };

  // 欲望可視化: カメラ撮影
  const takeYokubouPhoto = async () => {
    playTapSound();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('カメラの許可が必要です', 'カメラを使うには設定から許可してください。');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setYokubouImage(result.assets[0].uri);
      setYokubouAiReply('');
      setYokubouSaved(false);
    }
  };

  // 欲望可視化: AI送信
  const handleYokubouSubmit = async () => {
    if (!yokubouImage || !yokubouReason.trim()) return;
    playTapSound();
    setIsLoadingYokubou(true);
    try {
      // 欲望可視化専用のプロンプト
      const yokubouPrompt = `ユーザーが「今やりたいこと」の写真を撮り、その理由を書きました。

ユーザーの理由：「${yokubouReason}」

あなたはサムライキングとして、ユーザーの言葉を深く理解した上で返答してください。
- ユーザーが書いた内容に具体的に触れること
- 説教や否定ではなく、気づきを与える一言
- 最大2〜3文で短く
- 最後は考えさせる問いかけで締める
- もし前向きな行動（勉強、運動、仕事など）なら応援する`;

      const res = await fetch(SAMURAI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: yokubouPrompt,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'その行動、本当に今のお前に必要か？';
      setYokubouAiReply(reply);
      if (settings.autoVoice) speakSamurai(reply);
    } catch {
      setYokubouAiReply('立ち止まれ。呼吸しろ。今じゃない。');
    }
    setIsLoadingYokubou(false);
  };

  // 欲望可視化: 保存
  const handleYokubouSave = async () => {
    if (!yokubouImage || !yokubouAiReply) return;
    playTapSound();
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      issue: '[欲望可視化] ' + yokubouReason,
      reflection: '',
      reply: yokubouAiReply,
      imageUri: yokubouImage,
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setYokubouSaved(true);
    showSaveSuccess('止まれ。呼吸しろ。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 欲望可視化: リセット
  const resetYokubou = () => {
    playTapSound();
    setYokubouImage(null);
    setYokubouReason('');
    setYokubouAiReply('');
    setYokubouSaved(false);
  };

  const handleSend = async () => {
    // 課金チェック: Proでない場合、2回目以降はPaywall表示
    if (!isPro && samuraiKingUses >= 1) {
      setShowPaywall(true);
      return;
    }
    if (!input.trim() || isSending) return;

    await tap('select');

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    const userMsg: Message = {
      id: `${Date.now()}`,
      from: 'user',
      text: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const replyText = await callSamuraiKing(userText);

      const msgId = `${Date.now()}-samurai`;
      const kingMsg: Message = {
        id: msgId,
        from: 'king',
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      typeWriter(replyText, msgId);

      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        issue: userText,
        reflection: '',
        reply: replyText,
      };
      const updatedHistory = [...history, entry];
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      // 使用回数カウントアップ（Pro以外）
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        const newUses = samuraiKingUses + 1;
        setSamuraiKingUses(newUses);
        await AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: newUses }));
      }
    } catch (error) {
      console.log('SamuraiKing error', error);
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
    await tap('select');
    setMode('chat');
  };

  const handleSwitchToHistory = async () => {
    await tap('select');
    setMode('history');
    await loadHistory();
  };

  // =========================
  // Daily log actions (goal/review)
  // =========================

  const handleSaveTodayMission = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    await tap('light');

    await upsertTodayLog(prev => {
      const prevTodos = prev?.todos ?? [];
      const todoLines = todoInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const todos: TodoItem[] = todoLines.map((text, index) => {
        const existing = prevTodos.find(t => t.text === text);
        return existing ?? { id: `${getTodayStr()}-${index}`, text, done: false };
      });

      const routineLines = routineText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const prevDone = prev?.routineDone ?? [];
      const newRoutineDone = prevDone.filter(r => routineLines.includes(r));

      return {
        date: getTodayStr(),
        mission: missionInput.trim(),
        routines: routineLines,
        todos,
        review: prev?.review,
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: newRoutineDone,
      };
    });
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
  const handleSaveNightReview = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    await tap('light');

    const targetDate = selectedDate || getTodayStr();

    await upsertLogForDate(targetDate, prev => ({
      date: targetDate,
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
    showSaveSuccess('振り返り完了。明日も斬れ！');
  };

  const toggleTodoDone = async (date: string, todoId: string) => {
    playCheckSound();
    await tap('select');

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      return {
        ...log,
        todos: log.todos.map(t => (t.id === todoId ? { ...t, done: !t.done } : t)),
      };
    });

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const toggleRoutineDone = async (date: string, label: string) => {
    playCheckSound();
    await tap('select');

    const newLogs = dailyLogs.map(log => {
      if (log.date !== date) return log;
      const prevDone = log.routineDone ?? [];
      const exists = prevDone.includes(label);
      const updatedDone = exists ? prevDone.filter(r => r !== label) : [...prevDone, label];
      return { ...log, routineDone: updatedDone };
    });

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const handleGenerateSamuraiMission = async () => {
    if (isGeneratingMission) return;

    await tap('medium');

    setIsGeneratingMission(true);
    try {
      const mission = await callSamuraiMissionGPT();
      setSamuraiMissionText(mission);

      await upsertTodayLog(prev => ({
        date: getTodayStr(),
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
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-mission-err`,
          from: 'king',
          text: 'サムライミッション生成でエラーが出たでござる。ネット環境とサーバーを確認してほしいでござる。',
        },
      ]);
    } finally {
      setIsGeneratingMission(false);
    }
  };

  const handleCompleteSamuraiMission = async () => {
    if (!samuraiMissionText || missionCompletedToday) return;

    await tap('success');

    const gainedXp = 10;
    const newXp = totalXp + gainedXp;
    setTotalXp(newXp);
    await AsyncStorage.setItem(XP_KEY, String(newXp));

    setMissionCompletedToday(true);

    await upsertTodayLog(prev => ({
      date: getTodayStr(),
      mission: prev?.mission ?? missionInput.trim(),
      routines: prev?.routines ?? [],
      todos: prev?.todos ?? [],
      review: prev?.review,
      samuraiMission: samuraiMissionText,
      missionCompleted: true,
      routineDone: prev?.routineDone ?? [],
    }));

    const praiseText = `よくやった。今日のサムライミッション「${samuraiMissionText}」は達成だ。\n10XP獲得でござる。`;
    setMessages(prev => [...prev, { id: `${Date.now()}-xp`, from: 'king', text: praiseText }]);
    speakSamurai(praiseText);
  };

  // =========================
  // Onboarding save
  // =========================
  const handleSaveOnboarding = async () => {
    const identity = obIdentity.trim();
    const quit = obQuit.trim();
    const rule = obRule.trim();
    if (!identity) return;

    await tap('light');

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

  // =========================
  // Blocklist actions
  // =========================
  const handleAddBlockDomain = async () => {
    const value = blocklistInput.trim();
    if (!value) return;

    const normalized = value.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    const newList = Array.from(new Set([...blockedDomains, normalized]));

    setBlockedDomains(newList);
    setBlocklistInput('');
    try {
      await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save blocklist', e);
    }
  };

  const handleRemoveBlockDomain = async (domain: string) => {
    const newList = blockedDomains.filter(d => d !== domain);
    setBlockedDomains(newList);
    try {
      await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save blocklist', e);
    }
  };

  const handleOpenBrowserUrl = async () => {
    let url = browserUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;

    setBrowserUrl(url);
    setCurrentUrl(url);
    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
  };

  // =========================
  // Reset actions
  // =========================
  const handleClearHistory = () => {
    Alert.alert('相談履歴を削除', 'これまでのサムライ相談の履歴をすべて消すでござる。よろしいか？', [
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
    ]);
  };

  const handleClearChatMessages = () => {
    Alert.alert('チャット画面をリセット', '会話バブルを全部消して、最初の一言だけに戻すでござる。よろしいか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセットする',
        style: 'destructive',
        onPress: () => {
          setMessages([{ id: 'first', from: 'king', text: 'おいおいどうした？その欲望を断ち切るぞ。' }]);
          setInput('');
          setIsSending(false);
        },
      },
    ]);
  };

  const handleResetTodayLog = () => {
    Alert.alert('今日の目標・日記をリセット', `${getTodayStr()} の目標・ルーティン・振り返りを消すでござる。よろしいか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセットする',
        style: 'destructive',
        onPress: async () => {
          try {
            const t = getTodayStr();
            const newLogs = dailyLogs.filter(log => log.date !== t);
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
    ]);
  };

  // =========================
  // Calendar edit actions
  // =========================
  const handleEditLogFromCalendar = (log: DailyLog) => {
    playTapSound();
    setEditingLogDate(log.date);
    setEditProud(log.review?.proud ?? '');
    setEditLesson(log.review?.lesson ?? '');
    setEditNextAction(log.review?.nextAction ?? '');
  };

  const handleSaveEditedLog = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }
    if (!editingLogDate) return;

    const newLogs = dailyLogs.map(log =>
      log.date === editingLogDate
        ? {
            ...log,
            review: { proud: editProud, lesson: editLesson, nextAction: editNextAction },
          }
        : log,
    );

    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);

    showSaveSuccess('編集完了。記録を更新した！');
    setEditingLogDate(null);
    setEditProud('');
    setEditLesson('');
    setEditNextAction('');
  };

  const handleDeleteLog = async (date: string) => {
    const newLogs = dailyLogs.filter(log => log.date !== date);
    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);

    if (selectedDate === date) setSelectedDate(null);
  };

  // =========================
  // Routine chip toggle
  // =========================
  const handleToggleRoutineChip = (label: string) => {
    playTapSound();
    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
    const lines = routineText.split('\n').map(l => l.trim()).filter(Boolean);
    const exists = lines.includes(label);
    const newLines = exists ? lines.filter(l => l !== label) : [...lines, label];
    setRoutineText(newLines.join('\n'));
  };

  // =========================
  // Derived values
  // =========================
  const sortedDailyLogs: DailyLog[] = useMemo(() => {
    return Array.isArray(dailyLogs) ? [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date)) : [];
  }, [dailyLogs]);

  const streakCount = useMemo(() => getStreakCount(sortedDailyLogs), [sortedDailyLogs]);
  const { level: samuraiLevel, progress: levelProgress, daysToClear } = useMemo(
    () => getSamuraiLevelInfo(streakCount),
    [streakCount],
  );
  const rank = useMemo(() => getRankFromXp(totalXp), [totalXp]);

  const activeDate = useMemo(() => {
    return (
      selectedDate ||
      (sortedDailyLogs.length ? sortedDailyLogs[sortedDailyLogs.length - 1].date : null)
    );
  }, [selectedDate, sortedDailyLogs]);

  const activeLog = useMemo(() => {
    return activeDate ? sortedDailyLogs.find(log => log.date === activeDate) : null;
  }, [activeDate, sortedDailyLogs]);

  // =========================
  // Render helpers
  // =========================
  // スタート画面
  const startScreenQuotes = [
    '今日も一刀両断。',
    '迷いを斬れ。',
    '己に克て。',
    '武士道とは、死ぬことと見つけたり。',
    '行動こそが、すべてを変える。',
  ];
  const randomQuote = startScreenQuotes[Math.floor(Math.random() * startScreenQuotes.length)];

  // Intro画面（動画版）
  const renderIntroScreen = () => (
    <View style={styles.introScreen}>
      <Video
        source={INTRO_VIDEO}
        style={styles.introVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        volume={MASTER_VOLUME}
        onPlaybackStatusUpdate={(status: any) => {
          if (status.didJustFinish && !videoFinished) {
            setVideoFinished(true);
          }
        }}
      />
      {/* 動画再生中はスキップボタン、終了後はホームへボタン */}
      {videoFinished ? (
        <View style={styles.introBottomContainer}>
          <Pressable style={styles.introHomeButton} onPress={() => { playTapSound(); handleCloseIntro(); }}>
            <Text style={styles.introHomeButtonText}>ホームへ →</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.introSkipButton} onPress={() => { playTapSound(); handleCloseIntro(); }}>
          <Text style={styles.introSkipButtonText}>スキップ →</Text>
        </Pressable>
      )}
    </View>
  );

  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      {/* 道場入口 */}
      {showDojoGate && (
        <View style={styles.dojoGateOverlay}>
          {/* 暗い門 */}
          <Animated.Image
            source={DOJO_GATE_DIM}
            style={[styles.dojoGateImage, { opacity: dimOpacity }]}
            resizeMode="cover"
          />
          {/* 明るい門 */}
          <Animated.Image
            source={DOJO_GATE_LIGHT}
            style={[styles.dojoGateImage, { opacity: lightOpacity, position: 'absolute' }]}
            resizeMode="cover"
          />
          {/* 道場に入るボタン */}
          <Animated.View style={[styles.dojoGateButtonContainer, { opacity: buttonOpacity }]}>
            <Pressable style={styles.dojoGateButton} onPress={handleEnterDojo}>
              <Text style={styles.dojoGateButtonText}>道場に入る</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
      
      <Pressable
        style={styles.settingsIconButton}
        onPress={() => {
          playTapSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTab('settings');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.settingsIconText}>⚙️</Text>
      </Pressable>
      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
      <Text style={styles.dojoTitle}>道場</Text>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('consult');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>相談する</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('gratitude');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>感謝を書く</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('goal');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>今日の目標</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('review');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>振り返り</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('focus');
          setShowStartScreen(false);
          setShowFocusEntry(true);
          setFocusType('select');
        }}
      >
        <Text style={styles.startButtonText}>集中する</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>明日に備える</Text>
      </Pressable>
    </View>
  );

  // トースト表示（済マーク付き）
  const renderSaveToast = () => (
    showSaveToast ? (
      <View style={styles.toastContainer}>
        <Text style={styles.toastCheckmark}>✓</Text>
        <Text style={styles.toastText}>{saveToastMessage}</Text>
      </View>
    ) : null
  );

  const renderTabButton = (value: typeof tab, label: string) => (
    <Pressable
      onPress={() => {
        playTapSound();
        if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
        setTab(value);
      }}
      style={[styles.tabButton, tab === value && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, tab === value && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );

  // =========================
  // Tabs
  // =========================

  const renderConsultTab = () => {
    const historyToShow = history.length > 50 ? history.slice(history.length - 50) : history;

    // 選択画面
    if (consultMode === 'select') {
      return (
        <ImageBackground source={CONSULT_BG} style={styles.consultSelectBg} resizeMode="cover">
          <View style={styles.consultSelectContainer}>
            {/* タイトル */}
            <View style={styles.consultTitleBox}>
              <Text style={styles.consultTitle}>サムライ相談所</Text>
              <Text style={styles.consultSubtitle}>〜欲望を一刀両断〜</Text>
            </View>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を話してみろ</Text>
            </Pressable>
            
            <Pressable
              style={styles.consultSelectButton}
              onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            >
              <Text style={styles.consultSelectButtonText}>君の欲望を見せてみろ</Text>
            </Pressable>
          </View>
        </ImageBackground>
      );
    }

    return (
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 24 }} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* 戻るボタン */}
        <Pressable style={styles.consultBackButton} onPress={() => { playTapSound(); setConsultMode('select'); setIsSummoned(false); }}>
          <Text style={styles.consultBackButtonText}>← 戻る</Text>
        </Pressable>

        {consultMode === 'visualize' ? (
          <View style={styles.yokubouBox}>
            <Text style={styles.yokubouTitle}>📸 欲望を可視化せよ</Text>
            <Text style={styles.yokubouSub}>今やりたいことの写真を撮り、なぜやりたいか書け。AIが核心を突く。</Text>

            {yokubouImage ? (
              <Pressable style={styles.yokubouImagePicker} onPress={() => { playTapSound(); pickYokubouImage(); }}>
                <Image source={{ uri: yokubouImage }} style={styles.yokubouImagePreview} />
              </Pressable>
            ) : (
              <View style={styles.yokubouImagePicker}>
                <Text style={styles.yokubouImagePlaceholder}>欲望の対象を撮影せよ</Text>
              </View>
            )}

            <View style={styles.yokubouButtonRow}>
              <Pressable style={styles.yokubouCameraButton} onPress={() => { playTapSound(); takeYokubouPhoto(); }}>
                <Text style={styles.yokubouCameraButtonText}>📷 撮影</Text>
              </Pressable>
              <Pressable style={styles.yokubouGalleryButton} onPress={() => { playTapSound(); pickYokubouImage(); }}>
                <Text style={styles.yokubouGalleryButtonText}>🖼 選択</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.yokubouInput}
              value={yokubouReason}
              onChangeText={setYokubouReason}
              placeholder="なぜ今それをやりたい？正直に書け。"
              placeholderTextColor="#666"
              multiline
            />

            <Pressable
              style={[styles.yokubouSubmitButton, (!yokubouImage || !yokubouReason.trim()) && { opacity: 0.5 }]}
              onPress={handleYokubouSubmit}
              disabled={!yokubouImage || !yokubouReason.trim() || isLoadingYokubou}
            >
              {isLoadingYokubou ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.yokubouSubmitText}>AIに問う</Text>
              )}
            </Pressable>

            {yokubouAiReply !== '' && (
              <View style={styles.yokubouReplyBox}>
                <Text style={styles.yokubouReplyLabel}>サムライキング：</Text>
                <Text style={styles.yokubouReplyText}>{yokubouAiReply}</Text>

                {!yokubouSaved && (
                  <Pressable style={styles.yokubouSaveButton} onPress={handleYokubouSave}>
                    <Text style={styles.yokubouSaveText}>ログに保存</Text>
                  </Pressable>
                )}
                {yokubouSaved && (
                  <Text style={styles.yokubouSavedText}>✓ 保存済み</Text>
                )}
              </View>
            )}

            {(yokubouImage || yokubouReason || yokubouAiReply) && (
              <Pressable style={styles.yokubouResetButton} onPress={() => { playTapSound(); resetYokubou(); }}>
                <Text style={styles.yokubouResetText}>リセット</Text>
              </Pressable>
            )}
          </View>
        ) : !isSummoned ? (
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
              <Pressable style={[styles.modeButton, mode === 'chat' && styles.modeButtonActive]} onPress={handleSwitchToChat}>
                <Text style={[styles.modeButtonText, mode === 'chat' && styles.modeButtonTextActive]}>チャット</Text>
              </Pressable>

              <Pressable
                style={[styles.modeButton, mode === 'history' && styles.modeButtonActive, { marginRight: 0, marginLeft: 4 }]}
                onPress={handleSwitchToHistory}
              >
                <Text style={[styles.modeButtonText, mode === 'history' && styles.modeButtonTextActive]}>履歴</Text>
              </Pressable>
            </View>

            <View style={styles.chatBox}>
              {mode === 'chat' ? (
                <>
                  <Text style={styles.chatTitle}>Samurai King Chat</Text>

                  <ScrollView
                    ref={messagesRef}
                    style={[styles.messages, { maxHeight: 320 }]}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}
                  >
                    {messages.map(m => (
                      <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.kingBubble]}>
                        <Text style={styles.bubbleLabel}>{m.from === 'user' ? 'You' : 'Samurai King'}</Text>
                        <Text style={styles.bubbleText}>{m.id === typingMessageId ? typingText : m.text}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={input}
                      onChangeText={setInput}
                      placeholder="今のムラムラや悩みを正直に書くのだ…"
                      placeholderTextColor="#666"
                      multiline
                      blurOnSubmit
                      returnKeyType="done"
                      onSubmitEditing={handleSend}
                    />
                    <Pressable
                      style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
                      onPress={handleSend}
                      disabled={!input.trim() || isSending}
                    >
                      {isSending ? <ActivityIndicator color="#022c22" /> : <Text style={styles.sendText}>送信</Text>}
                    </Pressable>
                  </View>

                  <Text style={styles.privacyNote}>
                    ※ 相談内容はこのスマホとサムライキングAIだけに使われる。{'\n'}
                    開発者本人が個別の相談内容を見ることはないでござる。
                  </Text>

                  <Pressable style={styles.secondaryButton} onPress={() => { playTapSound(); handleClearChatMessages(); }}>
                    <Text style={styles.secondaryButtonText}>チャット画面をリセット</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.chatTitle}>Samurai Log History</Text>

                  {isLoadingHistory ? (
                    <Text style={styles.historyInfo}>履歴を読み込み中でござる…</Text>
                  ) : historyToShow.length === 0 ? (
                    <Text style={styles.historyInfo}>まだ記録はないでござる。最初の相談をすると自動でここにたまっていくでござる。</Text>
                  ) : (
                    <>
                      {historyToShow
                        .slice(-50)
                        .reverse()
                        .map(entry => {
                          let dateLabel = '';
                          try {
                            const d = new Date(entry.date);
                            dateLabel = Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
                          } catch {
                            dateLabel = '';
                          }

                          return (
                            <View key={entry.id} style={styles.historyEntry}>
                              {dateLabel !== '' && <Text style={styles.historyDate}>{dateLabel}</Text>}

                              {entry.imageUri && (
                                <Image source={{ uri: entry.imageUri }} style={styles.historyImage} />
                              )}

                              <Text style={styles.historyLabel}>◆ 相談：</Text>
                              <Text style={styles.historyText}>{entry.issue}</Text>

                              <Text style={styles.historyLabel}>◆ 本当はこうなりたい：</Text>
                              <Text style={styles.historyText}>
                                {entry.reflection && entry.reflection.trim() !== '' ? entry.reflection : '（未記入）'}
                              </Text>

                              <Text style={styles.historyLabel}>◆ サムライキング：</Text>
                              <Text style={styles.historyText}>{entry.reply}</Text>
                            </View>
                          );
                        })}

                      <Pressable style={styles.secondaryButton} onPress={() => { playTapSound(); handleClearHistory(); }}>
                        <Text style={styles.secondaryButtonText}>相談履歴を全部削除</Text>
                      </Pressable>
                    </>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  const renderGoalTab = () => {
    const currentRoutineLines = routineText.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>今日のサムライ目標</Text>
          <Text style={styles.goalSub}>{getTodayStr()} のミッションを 1つだけ決めるのだ。</Text>

          <View style={{ marginBottom: 12 }}>
            <View style={styles.samuraiMissionHeaderRow}>
              <Text style={styles.samuraiMissionTitle}>サムライミッション</Text>
              <Text style={styles.samuraiMissionXp}>達成で 10XP</Text>
            </View>
            <Text style={styles.goalSub}>AIが「今日やるといい一手」をくれるでござる。</Text>

            {samuraiMissionText ? (
              <View style={styles.samuraiMissionBox}>
                <Text style={styles.samuraiMissionText}>{samuraiMissionText}</Text>
                <Pressable
                  style={[styles.samuraiMissionButton, missionCompletedToday && { opacity: 0.5 }]}
                  onPress={() => { playTapSound(); handleCompleteSamuraiMission(); }}
                  disabled={missionCompletedToday}
                >
                  <Text style={styles.samuraiMissionButtonText}>
                    {missionCompletedToday ? '達成済み！' : 'ミッション達成！XPゲット'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.samuraiMissionButton} onPress={() => { playTapSound(); handleGenerateSamuraiMission(); }}>
                <Text style={styles.samuraiMissionButtonText}>{isGeneratingMission ? '生成中…' : 'サムライミッションを受け取る'}</Text>
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

          <Text style={styles.goalSub}>今日のルーティン（タップで追加 or 手入力）</Text>
          <View style={styles.chipRow}>
            {DEFAULT_ROUTINES.map(r => {
              const active = currentRoutineLines.includes(r);
              return (
                <Pressable
                  key={r}
                  style={[styles.routineChip, active && styles.routineChipActive]}
                  onPress={() => handleToggleRoutineChip(r)}
                >
                  <Text style={[styles.routineChipText, active && styles.routineChipTextActive]}>{r}</Text>
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

          <Text style={[styles.goalSub, { marginTop: 16 }]}>ToDo（改行で複数入力できる）</Text>
          <TextInput
            style={styles.todoInput}
            value={todoInput}
            onChangeText={setTodoInput}
            placeholder={'例）\nYouTube編集を30分\nレゲエの曲を1曲書く'}
            placeholderTextColor="#666"
            multiline
          />

          <Pressable style={styles.primaryButton} onPress={() => { playTapSound(); handleSaveTodayMission(); }}>
            <Text style={styles.primaryButtonText}>今日の目標を保存する</Text>
          </Pressable>

          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => { playTapSound(); handleResetTodayLog(); }}>
            <Text style={styles.secondaryButtonText}>今日の目標・日記をリセット</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderReviewTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      {onboardingData && (
        <View style={styles.goalCard}>
          <View style={styles.samuraiHeaderTopRow}>
            <Text style={styles.samuraiHeaderTitle}>サムライ宣言</Text>
            <Pressable
              onPress={() => {
                if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                showSaveSuccess('サムライ宣言を編集するでござる');
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
              <TextInput style={styles.onboardingInput} value={obIdentity} onChangeText={setObIdentity} multiline />
              <Text style={styles.onboardingLabel}>2. やめたい習慣は？</Text>
              <TextInput style={styles.onboardingInput} value={obQuit} onChangeText={setObQuit} multiline />
              <Text style={styles.onboardingLabel}>3. 毎日のマイルール</Text>
              <TextInput style={styles.onboardingInput} value={obRule} onChangeText={setObRule} multiline />

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Pressable style={[styles.onboardingButton, { flex: 1, marginRight: 4 }]} onPress={() => { playTapSound(); handleSaveOnboarding(); }}>
                  <Text style={styles.onboardingButtonText}>保存</Text>
                </Pressable>
                <Pressable
                  style={[styles.onboardingButton, { flex: 1, marginLeft: 4, backgroundColor: '#374151' }]}
                  onPress={() => {
                    if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                    setIsEditingOnboarding(false);
                    setObIdentity(onboardingData.identity ?? '');
                    setObQuit(onboardingData.quit ?? '');
                    setObRule(onboardingData.rule ?? '');
                  }}
                >
                  <Text style={[styles.onboardingButtonText, { color: '#e5e7eb' }]}>キャンセル</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.samuraiHeaderLabel}>◆ 俺が目指すサムライ像</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.identity || '（未入力）'}</Text>
              <Text style={styles.samuraiHeaderLabel}>◆ やめる習慣</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.quit || '（未入力）'}</Text>
              <Text style={styles.samuraiHeaderLabel}>◆ 毎日のルール</Text>
              <Text style={styles.samuraiHeaderText}>{onboardingData.rule || '（未入力）'}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>サムライRPGダッシュボード</Text>
        <Text style={styles.goalSub}>連続ログ：{streakCount} 日でござる🔥</Text>
        <Text style={styles.goalSub}>
          サムライレベル：Lv.{samuraiLevel} / {MAX_LEVEL}{' '}
          {samuraiLevel >= MAX_LEVEL ? '（伝説の侍クリア！）' : `（あと ${daysToClear} 日で伝説の侍）`}
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(levelProgress * 100)}%` }]} />
        </View>
        <Text style={styles.progressHint}>3日続けるごとにレベルアップ。1ヶ月やり切れば伝説クリアでござる。</Text>

        <Text style={styles.goalSub}>
          総経験値：{totalXp} XP（ランク：{rank.label}
          {rank.next > 0 ? ` / 次のランクまで ${rank.next} XP` : ' / MAX'}）
        </Text>

        <SamuraiAvatar level={samuraiLevel} rankLabel={rank.label} />

        <Text style={[styles.goalTitle, { fontSize: 16, marginTop: 6 }]}>サムライ日記カレンダー</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
          {sortedDailyLogs.map(log => {
            const isActive = log.date === activeDate;
            return (
              <Pressable
                key={log.date}
                onPress={() => {
                  if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                  setSelectedDate(log.date);
                }}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>{formatDateLabel(log.date)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeLog ? (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.historyDate}>{activeLog.date}</Text>

            <Text style={styles.historyLabel}>◆ 目標</Text>
            <Text style={styles.historyText}>{activeLog.mission || '（未入力だぞ）'}</Text>

            <Text style={styles.historyLabel}>◆ サムライミッション</Text>
            <Text style={styles.historyText}>
              {activeLog.samuraiMission
                ? `${activeLog.samuraiMission} ${activeLog.missionCompleted ? '（達成済み）' : '（未達成）'}`
                : '（まだ受け取っていないぞ）'}
            </Text>

            <Text style={styles.historyLabel}>◆ サムライルーティン</Text>
            {activeLog.routines.length === 0 ? (
              <Text style={styles.historyText}>（まだ選ばれていないぞ）</Text>
            ) : (
              activeLog.routines.map(r => {
                const done = activeLog.routineDone?.includes(r);
                return (
                  <Pressable key={r} style={styles.todoRow} onPress={() => toggleRoutineDone(activeLog.date, r)}>
                    <View style={[styles.checkbox, done && styles.checkboxChecked]} />
                    <Text style={[styles.todoText, done && styles.todoTextDone]}>{r}</Text>
                  </Pressable>
                );
              })
            )}

            <Text style={styles.historyLabel}>◆ ToDo</Text>
            {activeLog.todos.length === 0 ? (
              <Text style={styles.historyText}>（登録なしだ）</Text>
            ) : (
              activeLog.todos.map(todo => (
                <Pressable key={todo.id} style={styles.todoRow} onPress={() => toggleTodoDone(activeLog.date, todo.id)}>
                  <View style={[styles.checkbox, todo.done && styles.checkboxChecked]} />
                  <Text style={[styles.todoText, todo.done && styles.todoTextDone]}>{todo.text}</Text>
                </Pressable>
              ))
            )}

            <Text style={styles.historyLabel}>◆ 今日の善行</Text>
            {!activeLog.goodDeeds || activeLog.goodDeeds.length === 0 ? (
              <Text style={styles.historyText}>（記録なし）</Text>
            ) : (
              activeLog.goodDeeds.map((deed, idx) => (
                <View key={idx} style={styles.goodDeedLogItem}>
                  <Text style={styles.goodDeedLogText}>🌟 {deed}</Text>
                </View>
              ))
            )}

            {editingLogDate === activeLog.date ? (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editProud}
                  onChangeText={setEditProud}
                  placeholder="今日一番誇れる行動を書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 気づき・学び（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editLesson}
                  onChangeText={setEditLesson}
                  placeholder="気づき・学びを書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動（編集）</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={editNextAction}
                  onChangeText={setEditNextAction}
                  placeholder="明日変えてみる行動を書いてくだされ。"
                  placeholderTextColor="#666"
                />

                <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveEditedLog(); }}>
                  <Text style={styles.appleMainButtonText}>変更を保存</Text>
                </Pressable>
                <Pressable
                  style={styles.appleCancelLink}
                  onPress={() => {
                    setEditingLogDate(null);
                    setEditProud('');
                    setEditLesson('');
                    setEditNextAction('');
                  }}
                >
                  <Text style={styles.appleCancelLinkText}>キャンセル</Text>
                </Pressable>
              </>
            ) : activeLog.date === getTodayStr() ? (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={proudInput}
                  onChangeText={setProudInput}
                  placeholder="今日一番誇れる行動は？"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={lessonInput}
                  onChangeText={setLessonInput}
                  placeholder="気づいたこと・学んだことは？"
                  placeholderTextColor="#666"
                />

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
                <TextInput
                  style={styles.bigInput}
                  multiline
                  value={nextActionInput}
                  onChangeText={setNextActionInput}
                  placeholder="明日ひとつだけ変えてみる行動は？"
                  placeholderTextColor="#666"
                />

                <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveNightReview(); }}>
                  <Text style={styles.appleMainButtonText}>振り返りを保存</Text>
                </Pressable>
                <Pressable style={styles.appleDeleteLink} onPress={() => { playTapSound(); handleDeleteLog(activeLog.date); }}>
                  <Text style={styles.appleDeleteLinkText}>この日の記録を削除</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
                <Text style={styles.historyText}>{activeLog.review?.proud || '（未入力）'}</Text>

                <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
                <Text style={styles.historyText}>{activeLog.review?.lesson || '（未入力）'}</Text>

                <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
                <Text style={styles.historyText}>{activeLog.review?.nextAction || '（未入力）'}</Text>

                <Pressable style={styles.appleEditButton} onPress={() => { playTapSound(); handleEditLogFromCalendar(activeLog); }}>
                  <Text style={styles.appleEditButtonText}>編集する</Text>
                </Pressable>
                <Pressable style={styles.appleDeleteLink} onPress={() => { playTapSound(); handleDeleteLog(activeLog.date); }}>
                  <Text style={styles.appleDeleteLinkText}>この日の記録を削除</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.historyDate}>{getTodayStr()}</Text>
            <Text style={styles.goalSub}>今日の振り返りを書いてみよう</Text>

            <Text style={styles.historyLabel}>◆ 今日一番誇れる行動</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={proudInput}
              onChangeText={setProudInput}
              placeholder="今日一番誇れる行動は？"
              placeholderTextColor="#666"
            />

            <Text style={styles.historyLabel}>◆ 気づき・学び</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={lessonInput}
              onChangeText={setLessonInput}
              placeholder="気づいたこと・学んだことは？"
              placeholderTextColor="#666"
            />

            <Text style={styles.historyLabel}>◆ 明日変えてみる行動</Text>
            <TextInput
              style={styles.bigInput}
              multiline
              value={nextActionInput}
              onChangeText={setNextActionInput}
              placeholder="明日ひとつだけ変えてみる行動は？"
              placeholderTextColor="#666"
            />

            <Pressable style={styles.appleMainButton} onPress={() => { playTapSound(); handleSaveNightReview(); }}>
              <Text style={styles.appleMainButtonText}>振り返りを保存</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderBrowserTab = () => {
    const normalizedCurrent = currentUrl.replace(/^https?:\/\//, '').toLowerCase();
    const isBlocked = blockedDomains.some(domain => normalizedCurrent.startsWith(domain));

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>サムライブラウザ</Text>
          <Text style={styles.goalSub}>
            禁欲・集中モード用のブラウザでござる。ここでだけネットをする、というマイルールもオススメ。
          </Text>

          <View style={styles.urlRow}>
            <TextInput
              style={styles.urlInput}
              value={browserUrl}
              onChangeText={setBrowserUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="例）twitter.com / youtube.com"
              placeholderTextColor="#666"
            />
            <Pressable style={styles.urlOpenButton} onPress={handleOpenBrowserUrl}>
              <Text style={styles.urlOpenButtonText}>開く</Text>
            </Pressable>
          </View>

          <Text style={styles.browserInfo}>ブロック対象：{blockedDomains.length ? blockedDomains.join(', ') : '（未設定）'}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>ブロックリスト</Text>
          <Text style={styles.goalSub}>見たくないサイト（ドメイン）を登録しておくと、自動でブロックされる。</Text>

          <View style={styles.urlRow}>
            <TextInput
              style={styles.urlInput}
              value={blocklistInput}
              onChangeText={setBlocklistInput}
              autoCapitalize="none"
              placeholder="例）twitter.com"
              placeholderTextColor="#666"
            />
            <Pressable style={styles.urlOpenButton} onPress={handleAddBlockDomain}>
              <Text style={styles.urlOpenButtonText}>追加</Text>
            </Pressable>
          </View>

          {blockedDomains.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {blockedDomains.map(domain => (
                <View key={domain} style={styles.blockRow}>
                  <Text style={styles.blockDomain}>{domain}</Text>
                  <Pressable onPress={() => handleRemoveBlockDomain(domain)}>
                    <Text style={styles.blockRemove}>解除</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.browserContainer, { height: 420 }]}>
          {isBlocked ? (
            <View style={styles.blockedCard}>
              <Text style={styles.blockedTitle}>⚔️ そこは罠のサイトだぞ</Text>
              <Text style={styles.blockedText}>
                今アクセスしようとした場所は、お主が「封印」すると決めた領域だ。{'\n'}
                ここで時間やエネルギーを溶かすより、サムライミッションか目標に一手を打とう。
              </Text>

              <Pressable style={styles.blockedButton} onPress={() => setTab('consult')}>
                <Text style={styles.blockedButtonText}>今の気持ちを相談する</Text>
              </Pressable>
            </View>
          ) : (
            <WebView source={{ uri: currentUrl }} style={{ flex: 1 }} />
          )}
        </View>
      </ScrollView>
    );
  };

  // Paywallモーダル
  const renderPaywall = () => (
    <Modal visible={showPaywall} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>この先はPro</Text>
          <Text style={styles.paywallSubtitle}>決断を続けたい人のために。</Text>
          <Text style={styles.paywallPrice}>{monthlyPrice}</Text>
          <Pressable
            style={styles.paywallButton}
            onPress={async () => {
              const success = await purchasePro();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallButtonText}>Proにする</Text>
          </Pressable>
          <Pressable
            style={styles.paywallRestoreButton}
            onPress={async () => {
              const success = await restorePurchases();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallRestoreText}>購入を復元</Text>
          </Pressable>
          <Pressable onPress={() => { playTapSound(); setShowPaywall(false); }}>
            <Text style={styles.paywallCloseText}>今はやめる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // クイズ処理
  const handleQuizSubmit = () => {
    const current = quizData[quizIndex];
    if (quizAnswer.trim() === current.a) {
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuizResult('correct');
      setQuizScore(quizScore + 1);
    } else {
      playWrongSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setQuizResult('wrong');
    }
  };

  const handleNextQuiz = () => {
    setQuizAnswer('');
    setQuizResult(null);
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowQuiz(false);
      setQuizIndex(0);
      showSaveSuccess('クイズ完了！' + quizScore + '/' + quizData.length + '問正解');
    }
  };

  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            // タイマー終了
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (focusMode === 'work') {
              setFocusSessions(s => s + 1);
              setFocusMode('break');
              setFocusMinutesLeft(5); // 5分休憩
              Alert.alert('集中完了！', '5分間の休憩に入る。', [{ text: '了解' }]);
            } else {
              setFocusMode('work');
              setFocusMinutesLeft(25); // 25分集中
              Alert.alert('休憩終了', '再び集中せよ。', [{ text: '了解' }]);
            }
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft, focusMode]);

  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            clearInterval(timer);
            setFocusTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const messages = [
              'よくやった。武士の集中力だ。',
              '見事。この調子で進め。',
              '集中完了。次の戦いに備えよ。',
              '時間を制した者が、己を制す。',
            ];
            Alert.alert('集中完了', messages[Math.floor(Math.random() * messages.length)], [
              { text: '道場に戻る', onPress: () => {
                setShowStartScreen(true);
                setShowFocusEntry(true);
                setFocusType('select');
              }}
            ]);
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft]);

  // 集中タブ
  const isUrlBlocked = (url: string) => {
    return blockedSites.some(site => url.toLowerCase().includes(site.toLowerCase()));
  };

  const containsNgWord = (url: string) => {
    const decoded = decodeURIComponent(url).toLowerCase();
    return ngWords.some(word => decoded.includes(word.toLowerCase()));
  };

  const startNgQuiz = (url: string) => {
    setPendingUrl(url);
    setNgQuizRemaining(ngLevel);
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentNgQ(randomQ);
    setNgAnswer('');
    setShowNgQuiz(true);
  };

  const handleNgQuizAnswer = () => {
    if (ngAnswer.trim().toLowerCase() === currentNgQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const remaining = ngQuizRemaining - 1;
      setNgQuizRemaining(remaining);
      
      if (remaining === 0) {
        setShowNgQuiz(false);
        setFocusUrl(pendingUrl);
        setPendingUrl('');
        showSaveSuccess('通過を許可する。');
      } else {
        const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
        setCurrentNgQ(randomQ);
        setNgAnswer('');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '本当に必要な検索か考えよ。');
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentNgQ(randomQ);
      setNgAnswer('');
    }
  };

  const handleStartFocus = () => {
    if (!focusPurpose.trim()) {
      Alert.alert('目的が必要', '何のために開くのか、目的を入力せよ。');
      return;
    }
    playTapSound();
    // ランダムな問題を選択
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentFocusQ(randomQ);
    setFocusQuestionAnswer('');
    setShowFocusQuestion(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFocusQuestionSubmit = () => {
    if (focusQuestionAnswer.trim().toLowerCase() === currentFocusQ.a.toLowerCase()) {
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playFocusStartSound();
      setShowFocusQuestion(false);
      setShowFocusEntry(false);
      setFocusStartTime(new Date());
      setFocusTimerRunning(true);
      setFocusMinutesLeft(25);
      setFocusSecondsLeft(0);
      setFocusMode('work');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '答えが違う。集中する覚悟はあるか？');
      // 新しい問題に変更
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentFocusQ(randomQ);
      setFocusQuestionAnswer('');
    }
  };

  const renderAlarmTab = () => {
    // アラーム発動中の画面
    if (alarmRinging) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1a0000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ef4444', fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>
            {alarmLevel >= 3 ? '起きろ！！！' : '起きろ。'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 20, marginBottom: 30, textAlign: 'center' }}>
            📸 {alarmMission}を撮影せよ
          </Text>
          <Text style={{ color: '#ef4444', fontSize: 16, marginBottom: 30 }}>
            怒りレベル: {'🔥'.repeat(alarmLevel)}
          </Text>
          <Pressable
            style={{ backgroundColor: '#ef4444', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 12 }}
            onPress={takeMissionPhoto}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>📷 撮影してアラームを止める</Text>
          </Pressable>
        </View>
      );
    }
    
    return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌅 SAMURAI KING ALARM</Text>
        <Text style={styles.goalSub}>カメラで撮影しないと止まらない。逃げ場なし。</Text>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>⏰ 起床時間</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h + 1) % 24); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
            <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h - 1 + 24) % 24); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
          <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>:</Text>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m + 15) % 60); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
            <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m - 15 + 60) % 60); }} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
        </View>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>📸 撮影ミッション</Text>
        <Text style={styles.goalSub}>この場所を撮影しないとアラームが止まらない</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => { playTapSound(); setAlarmMission(m); }}
              style={{
                backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginHorizontal: 4,
              }}
            >
              <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold' }}>{m}</Text>
            </Pressable>
          ))}
        </View>
        
        <Pressable
          style={[styles.primaryButton, { marginTop: 24, backgroundColor: alarmSet ? '#ef4444' : '#2DD4BF' }]}
          onPress={() => {
            playTapSound();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setAlarmSet(!alarmSet);
            if (!alarmSet) {
              Alert.alert('アラーム設定完了', 
                alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\n撮影場所：' + alarmMission + '\n\n※実際のアラーム機能は次のアップデートで追加予定');
            }
          }}
        >
          <Text style={styles.primaryButtonText}>{alarmSet ? 'アラーム解除' : 'アラームを設定'}</Text>
        </Pressable>
        
        {alarmSet && (
          <Text style={{ color: '#2DD4BF', textAlign: 'center', marginTop: 12 }}>
            ⏰ {alarmHour}:{String(alarmMinute).padStart(2, '0')} にセット済み
          </Text>
        )}
        
        {/* テスト用ボタン */}
        <Pressable
          style={[styles.secondaryButton, { marginTop: 20 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            startAlarmShout();
          }}
        >
          <Text style={styles.secondaryButtonText}>🔔 テスト：アラームを鳴らす</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
  };

  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {/* モード選択画面 */}
      {focusType === 'select' && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>集中</Text>
          <Text style={styles.focusQuestion}>何に集中する？</Text>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              playTapSound();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('net');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>🌐</Text>
            <Text style={styles.focusTypeButtonText}>ネットを使う</Text>
            <Text style={styles.focusTypeButtonSub}>封印サイト・NGワード監視付き</Text>
          </Pressable>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              playTapSound();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('study');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>📚</Text>
            <Text style={styles.focusTypeButtonText}>勉強する</Text>
            <Text style={styles.focusTypeButtonSub}>タイマーで集中管理</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード設定 */}
      {focusType === 'study' && showFocusEntry && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>勉強タイマー</Text>
          <Text style={styles.focusQuestion}>集中せよ。</Text>
          
          <View style={styles.timerSettingSection}>
            <Text style={styles.timerSettingLabel}>集中時間</Text>
            <View style={styles.timerButtons}>
              {[15, 25, 45, 60].map(min => (
                <Pressable
                  key={min}
                  style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                  onPress={() => setFocusDuration(min)}
                >
                  <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              playFocusStartSound();
              setShowFocusEntry(false);
              setFocusTimerRunning(true);
              setFocusMinutesLeft(focusDuration);
              setFocusSecondsLeft(0);
            }}
          >
            <Text style={styles.primaryButtonText}>開始</Text>
          </Pressable>
          
          <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
            <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード実行中 */}
      {focusType === 'study' && !showFocusEntry && (
        <View style={styles.studyTimerScreen}>
          <Text style={styles.studyTimerLabel}>集中中</Text>
          <Text style={styles.studyTimerDisplay}>
            {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
          </Text>
          <View style={styles.studyTimerControls}>
            <Pressable
              style={styles.studyControlButton}
              onPress={() => setFocusTimerRunning(!focusTimerRunning)}
            >
              <Text style={styles.studyControlText}>{focusTimerRunning ? '一時停止' : '再開'}</Text>
            </Pressable>
            <Pressable
              style={[styles.studyControlButton, { backgroundColor: '#333' }]}
              onPress={() => {
                Alert.alert('終了する？', '集中を終了しますか？', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '終了', style: 'destructive', onPress: () => {
                    setFocusTimerRunning(false);
                    setShowFocusEntry(true);
                    setFocusType('select');
                    setShowStartScreen(true);
                  }}
                ]);
              }}
            >
              <Text style={styles.studyControlText}>終了</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ネットモード設定 */}
      {focusType === 'net' && showFocusEntry && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>ネット</Text>
            <Text style={styles.focusQuestion}>必要な検索だけせよ。</Text>
            <Text style={styles.goalSub}>封印サイト→ブロック / NGワード→問題{ngLevel}問</Text>
            
            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>制限時間</Text>
              <View style={styles.timerButtons}>
                {[15, 25, 45, 60].map(min => (
                  <Pressable
                    key={min}
                    style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                    onPress={() => setFocusDuration(min)}
                  >
                    <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>NGワード問題数</Text>
              <View style={styles.timerButtons}>
                {[3, 5, 10].map(num => (
                  <Pressable
                    key={num}
                    style={[styles.timerButton, ngLevel === num && styles.timerButtonActive]}
                    onPress={() => setNgLevel(num as 3 | 5 | 10)}
                  >
                    <Text style={[styles.timerButtonText, ngLevel === num && styles.timerButtonTextActive]}>{num}問</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                playFocusStartSound();
                setShowFocusEntry(false);
                setFocusTimerRunning(true);
                setFocusMinutesLeft(focusDuration);
                setFocusSecondsLeft(0);
                setFocusUrl('https://www.google.com');
              }}
            >
              <Text style={styles.primaryButtonText}>ブラウザを開く</Text>
            </Pressable>
            
            <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
              <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
            </Pressable>
            
            {/* 封印サイト管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>🚫 封印サイト（完全ブロック）</Text>
              {blockedSites.map((site, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{site}</Text>
                  <Pressable onPress={() => setBlockedSites(blockedSites.filter((_, i) => i !== index))}>
                    <Text style={styles.removeSiteText}>解除</Text>
                  </Pressable>
                </View>
              ))}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.addSiteInput}
                  value={newBlockedSite}
                  onChangeText={setNewBlockedSite}
                  placeholder="サイトを追加..."
                  placeholderTextColor="#6b7280"
                />
                <Pressable style={styles.addSiteButton} onPress={() => {
                  if (newBlockedSite.trim()) {
                    setBlockedSites([...blockedSites, newBlockedSite.trim()]);
                    setNewBlockedSite('');
                  }
                }}>
                  <Text style={styles.addSiteButtonText}>封印</Text>
                </Pressable>
              </View>
            </View>

            {/* NGワード管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>⚠️ NGワード（問題で通過）</Text>
              {ngWords.map((word, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{word}</Text>
                  <Pressable onPress={() => setNgWords(ngWords.filter((_, i) => i !== index))}>
                    <Text style={styles.removeSiteText}>削除</Text>
                  </Pressable>
                </View>
              ))}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.addSiteInput}
                  value={newNgWord}
                  onChangeText={setNewNgWord}
                  placeholder="NGワードを追加..."
                  placeholderTextColor="#6b7280"
                />
                <Pressable style={styles.addSiteButton} onPress={() => {
                  if (newNgWord.trim()) {
                    setNgWords([...ngWords, newNgWord.trim()]);
                    setNewNgWord('');
                  }
                }}>
                  <Text style={styles.addSiteButtonText}>追加</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ネットモード実行中（ブラウザ） */}
      {focusType === 'net' && !showFocusEntry && (
        <View style={{ flex: 1 }}>
          <View style={styles.focusTopBar}>
            <Pressable onPress={() => {
              Alert.alert('終了する？', 'ネット利用を終了しますか？', [
                { text: 'キャンセル', style: 'cancel' },
                { text: '終了', style: 'destructive', onPress: () => {
                  setFocusTimerRunning(false);
                  setShowFocusEntry(true);
                  setFocusType('select');
                  setShowStartScreen(true);
                }}
              ]);
            }}>
              <Text style={styles.focusEndText}>終了</Text>
            </Pressable>
            <View style={styles.focusTimerBox}>
              <Text style={styles.focusTimerText}>
                {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
              </Text>
            </View>
            <Pressable onPress={() => setFocusTimerRunning(!focusTimerRunning)}>
              <Text style={styles.focusTimerControl}>{focusTimerRunning ? '⏸' : '▶️'}</Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: focusUrl }}
            style={{ flex: 1 }}
            onShouldStartLoadWithRequest={(request) => {
              if (isUrlBlocked(request.url)) {
                Alert.alert('封印されたサイト', 'このサイトは開けない。');
                return false;
              }
              if (containsNgWord(request.url)) {
                startNgQuiz(request.url);
                return false;
              }
              return true;
            }}
          />
        </View>
      )}

      {/* NGワード問題モーダル */}
      <Modal visible={showNgQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.ngQuizTitle}>⚠️ NGワード検出</Text>
            <Text style={styles.ngQuizSub}>この先に行きたいなら問題に答えよ</Text>
            <Text style={styles.ngQuizRemaining}>残り {ngQuizRemaining} 問</Text>
            
            <View style={styles.focusQBox}>
              <Text style={styles.focusQText}>{currentNgQ.q}</Text>
            </View>
            
            <TextInput
              style={styles.quizInput}
              value={ngAnswer}
              onChangeText={setNgAnswer}
              placeholder="Answer..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoFocus
            />
            
            <Pressable style={styles.quizSubmitButton} onPress={handleNgQuizAnswer}>
              <Text style={styles.quizSubmitText}>回答</Text>
            </Pressable>
            
            <Pressable onPress={() => { setShowNgQuiz(false); setPendingUrl(''); }}>
              <Text style={styles.quizCloseText}>やめる（検索を中止）</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );

  // 感謝タブ
  // 10個達成時にAIが感謝リストを見て感想を生成
  const generateGratitudeComment = async (list: string[]) => {
    // 10個達成の特別演出
    playRitualSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoadingGratitudeComment(true);
    try {
      const gratitudeText = list.join('、');
      const res = await fetch('https://bushido-log-server.onrender.com/api/gratitude-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gratitudes: gratitudeText }),
      });
      const data = await res.json();
      if (data.comment) {
        setGratitudeAiComment(data.comment);
      } else {
        setGratitudeAiComment('10個達成だ。よくやった。今日はもう勝っている。');
      }
    } catch {
      setGratitudeAiComment('10個達成だ。よくやった。今日はもう勝っている。');
    }
    setIsLoadingGratitudeComment(false);
  };

  // AIが感謝に反応するフレーズ
  const gratitudeResponses = [
    (text: string) => `「${text.slice(0, 10)}」か。良いことに気づいたな。`,
    (text: string) => `その感謝、心に刻め。`,
    (text: string) => `小さなことに感謝できる者は強い。`,
    (text: string) => `「${text.slice(0, 10)}」。忘れるな。`,
    (text: string) => `感謝は武士の基本だ。よくやった。`,
    (text: string) => `その気づき、大事にせよ。`,
    (text: string) => `一つ一つの感謝が、お前を強くする。`,
    (text: string) => `良い目を持っているな。`,
    (text: string) => `感謝できる心、それが武士道だ。`,
    (text: string) => `その調子だ。続けよ。`,
  ];

  // 1日1善: 読み込み
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(GOOD_DEED_KEY);
        if (saved) {
          const list: GoodDeedEntry[] = JSON.parse(saved);
          // 今日の分だけフィルタ
          const today = getTodayStr();
          const todayDeeds = list.filter(d => d.date.startsWith(today));
          setGoodDeedList(todayDeeds);
        }
      } catch {}
    })();
  }, []);

  // 1日1善: 画像選択
  const pickGoodDeedImage = async () => {
    playTapSound();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setGoodDeedImage(result.assets[0].uri);
    }
  };

  // 1日1善: カメラ撮影
  const takeGoodDeedPhoto = async () => {
    playTapSound();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('カメラの許可が必要です');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setGoodDeedImage(result.assets[0].uri);
    }
  };

  // 1日1善: 保存
  const handleSaveGoodDeed = async () => {
    if (!goodDeedText.trim()) return;
    // 無料ユーザーは1日1件まで
    if (!isPro && goodDeedList.length >= 1) {
      showSaveSuccess('Proなら無制限に記録できる');
      return;
    }
    const entry: GoodDeedEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: goodDeedText.trim(),
      imageUri: goodDeedImage || undefined,
      tag: goodDeedTag || undefined,
    };
    const newList = [...goodDeedList, entry];
    setGoodDeedList(newList);
    // 全履歴を保存
    try {
      const saved = await AsyncStorage.getItem(GOOD_DEED_KEY);
      const allList: GoodDeedEntry[] = saved ? JSON.parse(saved) : [];
      allList.push(entry);
      await AsyncStorage.setItem(GOOD_DEED_KEY, JSON.stringify(allList));
    } catch {}
    setGoodDeedText('');
    setGoodDeedImage(null);
    setGoodDeedTag('');
    showSaveSuccess('善行を記録した。続けよ。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // 善行を日記に追加
  const addGoodDeedToDiary = async (deed: GoodDeedEntry) => {
    const deedText = deed.tag ? `【${deed.tag}】${deed.text}` : deed.text;
    await upsertTodayLog(prev => {
      const currentDeeds = prev?.goodDeeds || [];
      return {
        date: getTodayStr(),
        mission: prev?.mission || '',
        routines: prev?.routines || [],
        todos: prev?.todos || [],
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted,
        routineDone: prev?.routineDone || [],
        review: prev?.review,
        goodDeeds: [...currentDeeds, deedText],
      };
    });
    showSaveSuccess('日記に追加した。');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddGratitude = () => {
    if (!gratitudeInput.trim()) return;
    if (gratitudeList.length >= 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const inputText = gratitudeInput.trim();
    const newList = [...gratitudeList, inputText];
    setGratitudeList(newList);
    setGratitudeInput('');
    
    // AIの反応をトーストで表示（音声なし）
    const response = gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)](inputText);
    showSaveSuccess(response);
    
    if (newList.length === 10) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowGratitudeComplete(true);
        generateGratitudeComment(newList);
      }, 2000);
    }
  };

  const renderGratitudeTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>感謝</Text>
        <Text style={styles.goalSub}>今日は感謝を10個書けるか？</Text>
        
        <Text style={styles.gratitudeProgress}>{gratitudeList.length} / 10</Text>
        
        {gratitudeList.length < 10 ? (
          <>
            <TextInput
              style={styles.gratitudeInput}
              value={gratitudeInput}
              onChangeText={setGratitudeInput}
              placeholder="感謝を1つ書く..."
              placeholderTextColor="#6b7280"
              onSubmitEditing={handleAddGratitude}
              returnKeyType="done"
            />
            <Pressable style={styles.primaryButton} onPress={handleAddGratitude}>
              <Text style={styles.primaryButtonText}>追加</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.gratitudeCompleteBox}>
            <Text style={styles.gratitudeCompleteTitle}>🎉 10個達成！</Text>
            {isLoadingGratitudeComment ? (
              <Text style={styles.gratitudeCompleteText}>侍キングが感想を考え中...</Text>
            ) : (
              <Text style={styles.gratitudeCompleteText}>{gratitudeAiComment || 'よくやった。今日はもう勝っている。'}</Text>
            )}
            {isPro ? (
              <Pressable
                style={styles.quizButton}
                onPress={() => { playTapSound(); setShowQuiz(true); }}
              >
                <Text style={styles.quizButtonText}>学びのクイズに挑戦</Text>
              </Pressable>
            ) : (
              <Text style={styles.proOnlyText}>Proで学びクイズ解放</Text>
            )}
          </View>
        )}
        
        {gratitudeList.length > 0 && (
          <View style={styles.gratitudeListContainer}>
            {gratitudeList.map((item, index) => (
              <View key={index} style={styles.gratitudeItem}>
                <Text style={styles.gratitudeItemNumber}>{index + 1}.</Text>
                <Text style={styles.gratitudeItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 1日1善セクション */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌟 1日1善</Text>
        <Text style={styles.goalSub}>今日やった良いことを記録せよ</Text>

        {goodDeedImage ? (
          <Pressable style={styles.goodDeedImagePreviewContainer} onPress={pickGoodDeedImage}>
            <Image source={{ uri: goodDeedImage }} style={styles.goodDeedImagePreview} />
          </Pressable>
        ) : (
          <View style={styles.goodDeedImageButtons}>
            <Pressable style={styles.goodDeedCameraBtn} onPress={takeGoodDeedPhoto}>
              <Text style={styles.goodDeedCameraBtnText}>📷 撮影</Text>
            </Pressable>
            <Pressable style={styles.goodDeedGalleryBtn} onPress={pickGoodDeedImage}>
              <Text style={styles.goodDeedGalleryBtnText}>🖼 選択</Text>
            </Pressable>
          </View>
        )}

        <TextInput
          style={styles.goodDeedInput}
          value={goodDeedText}
          onChangeText={setGoodDeedText}
          placeholder="今日やった良いことを書く..."
          placeholderTextColor="#6b7280"
          multiline
        />

        <View style={styles.goodDeedTagRow}>
          {GOOD_DEED_TAGS.map(tag => (
            <Pressable
              key={tag}
              style={[styles.goodDeedTagChip, goodDeedTag === tag && styles.goodDeedTagChipActive]}
              onPress={() => setGoodDeedTag(goodDeedTag === tag ? '' : tag)}
            >
              <Text style={[styles.goodDeedTagText, goodDeedTag === tag && styles.goodDeedTagTextActive]}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.primaryButton, !goodDeedText.trim() && { opacity: 0.5 }]}
          onPress={handleSaveGoodDeed}
          disabled={!goodDeedText.trim()}
        >
          <Text style={styles.primaryButtonText}>善行を記録</Text>
        </Pressable>

        {!isPro && goodDeedList.length >= 1 && (
          <Text style={styles.proOnlyText}>Proなら無制限に記録できる</Text>
        )}

        {goodDeedList.length > 0 && (
          <View style={styles.goodDeedListContainer}>
            <Text style={styles.goodDeedListTitle}>今日の善行</Text>
            {goodDeedList.map((deed) => (
              <View key={deed.id} style={styles.goodDeedItem}>
                {deed.imageUri && (
                  <Image source={{ uri: deed.imageUri }} style={styles.goodDeedItemImage} />
                )}
                <View style={styles.goodDeedItemContent}>
                  <Text style={styles.goodDeedItemText}>{deed.text}</Text>
                  {deed.tag && <Text style={styles.goodDeedItemTag}>#{deed.tag}</Text>}
                  <Pressable style={styles.addToDiaryButton} onPress={() => addGoodDeedToDiary(deed)}>
                    <Text style={styles.addToDiaryButtonText}>📝 日記に追加</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>設定</Text>
        <Text style={styles.goalSub}>サムライキングの声やバイブの強さを、自分好みにカスタムできるでござる。</Text>

        <Text style={styles.sectionTitle}>プラン</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>{isPro ? 'Pro会員' : '無料プラン'}</Text>
            <Text style={styles.settingsHint}>{isPro ? 'サムライキング相談が無制限' : '相談 ' + samuraiKingUses + '/1回使用済み'}</Text>
          </View>
          {!isPro && (
            <Pressable style={styles.proButton} onPress={() => setShowPaywall(true)}>
              <Text style={styles.proButtonText}>Proにする</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.restoreButton} onPress={async () => {
          const success = await restorePurchases();
          if (success) setIsPro(true);
        }}>
          <Text style={styles.restoreButtonText}>購入を復元</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>サムライボイス</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>自動で声を再生する</Text>
            <Text style={styles.settingsHint}>OFFにすると、テキストだけ静かに読むモードになるでござる。</Text>
          </View>
          <Switch value={settings.autoVoice} onValueChange={v => updateSettings({ autoVoice: v })} />
        </View>

        <Text style={[styles.settingsLabel, { marginTop: 8 }]}>読み上げスピード</Text>
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
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => updateSettings({ readingSpeed: opt.key as AppSettings['readingSpeed'] })}
              >
                <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>フィードバック</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>バイブ（Haptics）</Text>
            <Text style={styles.settingsHint}>ボタン操作のときに、手応えを少しだけ返すでござる。</Text>
          </View>
          <Switch value={settings.enableHaptics} onValueChange={v => updateSettings({ enableHaptics: v })} />
        </View>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>効果音</Text>
            <Text style={styles.settingsHint}>ボタンを押したときの太鼓の音などをON/OFFできる。</Text>
          </View>
          <Switch value={settings.enableSfx} onValueChange={v => updateSettings({ enableSfx: v })} />
        </View>

        <Text style={styles.sectionTitle}>その他</Text>
        <Pressable style={styles.settingsButton} onPress={resetIntroSkip}>
          <Text style={styles.settingsButtonText}>Introをもう一度表示する</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>サムライキングの厳しさ</Text>
        <View style={styles.segmentRow}>
          {[
            { key: 'soft', label: 'ゆるめ' },
            { key: 'normal', label: 'ふつう' },
            { key: 'hard', label: '鬼コーチ' },
          ].map(opt => {
            const active = settings.strictness === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => updateSettings({ strictness: opt.key as AppSettings['strictness'] })}
              >
                <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>サムライタイム（1日の使用時間制限）</Text>
        <Text style={styles.settingsHint}>このアプリを1日に何分まで使うかを決めるでござる。0分なら無制限。</Text>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>1日の上限（分）</Text>
            <Text style={styles.settingsHint}>例）30なら、今日トータル30分までだけ使える。</Text>
          </View>
          <TextInput
            style={styles.timeInput}
            keyboardType="number-pad"
            value={String(samuraiTime.dailyMinutes ?? 0)}
            onChangeText={updateSamuraiDailyMinutes}
          />
        </View>

        {isTimeLimited && (
          <Text style={styles.settingsHint}>
            今日の使用時間：{usedMinutes} 分 / 上限 {samuraiTime.dailyMinutes} 分{'\n'}
            残り：{remainingMinutes} 分
          </Text>
        )}

        <Text style={styles.sectionTitle}>その他</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setShowPrivacy(true)}>
          <Text style={styles.secondaryButtonText}>プライバシーポリシーを見る</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderOnboarding = () => (
    <View style={styles.onboardingContainer}>
      <Text style={styles.appTitle}>BUSHIDO LOG</Text>
      <Text style={styles.onboardingLead}>まずは「どんなサムライとして生きるか」を決めるところから始めよう。</Text>

      <Text style={styles.onboardingLabel}>1. どんなサムライとして生きたい？</Text>
      <TextInput
        style={styles.onboardingInput}
        value={obIdentity}
        onChangeText={setObIdentity}
        multiline
        placeholder="例）家族に優しく、世界で戦うサムライアーティスト"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.onboardingLabel}>2. やめたい習慣は？</Text>
      <TextInput
        style={styles.onboardingInput}
        value={obQuit}
        onChangeText={setObQuit}
        multiline
        placeholder="例）ダラダラSNS、夜更かし"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.onboardingLabel}>3. 毎日のマイルール</Text>
      <TextInput
        style={styles.onboardingInput}
        value={obRule}
        onChangeText={setObRule}
        multiline
        placeholder="例）毎日1つは未来のための行動をする"
        placeholderTextColor="#6b7280"
      />

      <Pressable style={styles.primaryButton} onPress={() => { playTapSound(); handleSaveOnboarding(); }}>
        <Text style={styles.primaryButtonText}>サムライ宣言を保存して始める</Text>
      </Pressable>
    </View>
  );

  const renderTimeOver = () => (
    <View style={styles.timeOverContainer}>
      <View style={styles.timeOverCard}>
        <Text style={styles.timeOverTitle}>本日のサムライタイム終了</Text>
        <Text style={styles.timeOverText}>
          今日の「BUSHIDO LOG」を使える時間は使い切ったでござる。{'\n'}
          ここから先は、現実世界でサムライミッションを遂行する時間だ。
        </Text>
        <Text style={[styles.timeOverText, { marginTop: 6 }]}>※ 明日になると、時間は自動でリセットされる。</Text>

        <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setTab('settings')}>
          <Text style={styles.primaryButtonText}>サムライタイムの設定を見直す</Text>
        </Pressable>
      </View>
    </View>
  );

  // =========================
  // Loading
  // =========================
  if (isLoadingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DD4BF" />
        <Text style={styles.loadingText}>サムライキングを呼び出し中…</Text>
      </View>
    );
  }

  // Intro画面表示
  if (showIntro) {
    return renderIntroScreen();
  }

  // スタート画面表示（オンボーディング完了後）
  if (showStartScreen && !isOnboarding) {
    return renderStartScreen();
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Pressable
                  onPress={() => {
                    playTapSound();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStartScreen(true);
                  }}
                  style={styles.homeButton}
                >
                  <Text style={styles.homeButtonText}>道場に戻る</Text>
                </Pressable>
                <Image source={require('./assets/icon.png')} style={styles.headerIcon} />
                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
              </View>
            </View>

            {isOnboarding ? (
              renderOnboarding()
            ) : (
              <>

                <View style={{ flex: 1 }}>
                  {isTimeOver && tab !== 'settings' ? (
                    renderTimeOver()
                  ) : (
                    <>
                      {tab === 'consult' && renderConsultTab()}
                      {tab === 'goal' && renderGoalTab()}
                      {tab === 'review' && renderReviewTab()}
                      {tab === 'browser' && renderBrowserTab()}
                      {tab === 'focus' && renderFocusTab()}
                      {tab === 'alarm' && renderAlarmTab()}
                      {tab === 'gratitude' && renderGratitudeTab()}
                      {tab === 'settings' && renderSettingsTab()}
                    </>
                  )}
                </View>
              </>
            )}
          </View>
      </KeyboardAvoidingView>

      <Modal visible={showPrivacy} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>プライバシーポリシー</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.modalText}>{PRIVACY_POLICY_TEXT}</Text>
            </ScrollView>
            <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.primaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {renderSaveToast()}
      {renderPaywall()}
      
      {/* クイズモーダル */}
      <Modal visible={showQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.quizProgress}>{quizIndex + 1} / {quizData.length}</Text>
            <Text style={styles.quizQuestion}>{quizData[quizIndex].q}</Text>
            
            {quizResult === null ? (
              <>
                <TextInput
                  style={styles.quizInput}
                  value={quizAnswer}
                  onChangeText={setQuizAnswer}
                  placeholder="答えを入力"
                  placeholderTextColor="#666"
                  autoFocus
                />
                <Text style={styles.quizHint}>ヒント: {quizData[quizIndex].hint}</Text>
                <Pressable style={styles.quizSubmitButton} onPress={handleQuizSubmit}>
                  <Text style={styles.quizSubmitText}>回答</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.quizResultText, quizResult === 'correct' ? styles.quizCorrect : styles.quizWrong]}>
                  {quizResult === 'correct' ? '正解！' : '不正解... 答え: ' + quizData[quizIndex].a}
                </Text>
                <Pressable style={styles.quizNextButton} onPress={handleNextQuiz}>
                  <Text style={styles.quizNextText}>{quizIndex < quizData.length - 1 ? '次の問題' : '終了'}</Text>
                </Pressable>
              </>
            )}
            
            <Pressable onPress={() => { playTapSound(); setShowQuiz(false); setQuizIndex(0); setQuizResult(null); }}>
              <Text style={styles.quizCloseText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// =========================
// Styles (complete)
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
  },
  headerSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  timeBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  timeBadgeText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#D4AF37',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#1a1a1a',
  },

  urgeButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  urgeText: {
    color: '#1a1a1a',
    fontWeight: '800',
  },
  caption: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  summonBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    backgroundColor: '#000000',
  },
  summonTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  summonText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  modeRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginRight: 4,
  },
  modeButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  modeButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modeButtonTextActive: {
    color: '#e5e7eb',
    fontWeight: '700',
  },

  chatBox: {
    flex: 1,
    minHeight: 0,

    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 8,
  },
  chatTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  messages: {
    flex: 1,
    marginBottom: 6,
  },
  bubble: {
    maxWidth: '88%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 6,
  },
  userBubble: {
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-end',
  },
  kingBubble: {
    backgroundColor: '#D4AF37',
    alignSelf: 'flex-start',
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    color: '#000000',
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#e5e7eb',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#e5e7eb',
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 12,
  },
  privacyNote: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },

  secondaryButton: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 11,
    color: '#e5e7eb',
  },

  historyInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  historyEntry: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#000000',
  },
  historyDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  historyLabel: {
    fontSize: 11,
    color: '#e5e7eb',
    marginTop: 4,
    fontWeight: '700',
  },
  historyText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  goalCard: {
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginTop: 8,
  },
  goalTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 4,
  },
  goalSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  bigInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 56,
    marginTop: 4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  routineChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 4,
    marginBottom: 4,
  },
  routineChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  routineChipText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  routineChipTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  todoInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 48,
  },

  primaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 13,
  },

  questionText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 8,
  },

  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
  },
  progressHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },

  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 4,
  },
  dateChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  dateChipText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dateChipTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },

  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6b7280',
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: '#2DD4BF',
    borderColor: '#2DD4BF',
  },
  todoText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  todoTextDone: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  historyButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  historyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginRight: 4,
  },
  historyDeleteButton: {
    backgroundColor: '#7f1d1d',
    marginLeft: 4,
    marginRight: 0,
  },
  historyButtonText: {
    fontSize: 12,
    color: '#e5e7eb',
    fontWeight: '600',
  },

  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginTop: 8,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  avatarRank: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
  },
  avatarDesc: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  samuraiMissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  samuraiMissionTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  samuraiMissionXp: {
    fontSize: 11,
    color: '#facc15',
    fontWeight: '600',
  },
  samuraiMissionBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginTop: 4,
  },
  samuraiMissionText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 8,
  },
  samuraiMissionButton: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  samuraiMissionButtonText: {
    fontSize: 12,
    color: '#022c22',
    fontWeight: '700',
  },

  samuraiHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  samuraiHeaderTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  samuraiEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  samuraiEditText: {
    fontSize: 11,
    color: '#e5e7eb',
  },

  onboardingLabel: {
    fontSize: 12,
    color: '#e5e7eb',
    marginTop: 8,
    marginBottom: 2,
  },
  onboardingInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    fontSize: 13,
    color: '#e5e7eb',
    minHeight: 48,
  },
  onboardingButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
  },
  onboardingButtonText: {
    fontSize: 13,
    color: '#022c22',
    fontWeight: '700',
  },
  samuraiHeaderLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  samuraiHeaderText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 2,
  },

  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  urlInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#e5e7eb',
    marginRight: 4,
  },
  urlOpenButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  urlOpenButtonText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  browserInfo: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '700',
    marginTop: 10,
  },

  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  blockDomain: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  blockRemove: {
    fontSize: 11,
    color: '#D4AF37',
  },

  browserContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },

  blockedCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  blockedTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  blockedButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  blockedButtonText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '700',
  },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  settingsRowText: {
    flex: 1,
    marginRight: 8,
  },
  settingsLabel: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  settingsHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  segmentRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 6,
    alignItems: 'center',
    marginRight: 4,
  },
  segmentButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  segmentButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  segmentButtonTextActive: {
    color: '#1a1a1a',
    fontWeight: '700',
  },

  timeInput: {
    width: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 13,
    color: '#e5e7eb',
    textAlign: 'center',
  },

  onboardingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  onboardingLead: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
    marginBottom: 8,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#e5e7eb',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 6,
  },
  modalText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  timeOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOverCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
    padding: 16,
    backgroundColor: '#000000',
    width: '100%',
  },
  timeOverTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 8,
  },
  timeOverText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  // スタート画面スタイル
  // Intro画面スタイル
  introScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  introVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  introSkipButton: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 77, 0.5)',
  },
  introSkipButtonText: {
    color: '#C9A24D',
    fontSize: 16,
    fontWeight: '600',
  },
  introBottomContainer: {
    position: 'absolute',
    bottom: 50,
    right: 24,
  },
  introHomeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 77, 0.5)',
  },
  introHomeButtonText: {
    color: '#C9A24D',
    fontSize: 16,
    fontWeight: '600',
  },
  introScrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C9A24D',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  introSection: {
    marginBottom: 20,
    paddingLeft: 8,
  },
  introSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  introSectionText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  skipIntroCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4b5563',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C9A24D',
    borderColor: '#C9A24D',
  },
  checkboxMark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipIntroText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  introButton: {
    backgroundColor: '#C9A24D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  introButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  settingsButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#C9A24D',
    textAlign: 'center',
  },
  dojoGateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  dojoGateImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dojoGateButtonContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dojoGateButton: {
    backgroundColor: 'rgba(201, 162, 77, 0.9)',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9A24D',
  },
  dojoGateButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  dojoGateTitle: {
    fontSize: 64,
    color: '#C9A24D',
    fontWeight: 'bold',
    letterSpacing: 16,
    marginBottom: 16,
  },
  dojoGateSubtitle: {
    fontSize: 16,
    color: '#C9A24D',
    opacity: 0.7,
    letterSpacing: 4,
  },
  startScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  startQuote: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  startSubtitle: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  // トーストスタイル
  toastContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Paywallスタイル
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  paywallCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  paywallPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 24,
  },
  paywallButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paywallRestoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallRestoreText: {
    color: '#888',
    fontSize: 14,
  },
  paywallCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // Proボタンスタイル
  proButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  proButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#888',
    fontSize: 13,
  },
  // 無効ボタンスタイル
  startButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  startButtonTextDisabled: {
    color: '#555',
  },
  // 感謝スタイル
  gratitudeProgress: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginVertical: 16,
  },
  gratitudeInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  gratitudeCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    textAlign: 'center',
  },
  gratitudeCompleteBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  gratitudeCompleteText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  gratitudeListContainer: {
    marginTop: 16,
  },
  gratitudeItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gratitudeItemNumber: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
  },
  gratitudeItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
  },
  quizButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  quizButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proOnlyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // クイズスタイル
  quizOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quizCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  quizProgress: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 16,
  },
  quizQuestion: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  quizInput: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: 12,
  },
  quizHint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  quizSubmitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizSubmitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quizCorrect: {
    color: '#2DD4BF',
  },
  quizWrong: {
    color: '#ef4444',
  },
  quizNextButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizNextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // ホームボタン
  homeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  homeButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  // ヘッダーアイコン
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  // 道場タイトル
  dojoTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsIconButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 24,
  },
  // 集中機能スタイル
  focusQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
  },
  focusInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  focusPurposeBar: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  focusPurposeLabel: {
    color: '#D4AF37',
    fontSize: 14,
  },
  blockedSitesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  blockedSitesTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  blockedSiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  blockedSiteText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  removeSiteText: {
    color: '#ef4444',
    fontSize: 12,
  },
  addSiteRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  addSiteInput: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  addSiteButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSiteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  focusQBox: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  // 集中モード選択
  focusTypeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  focusTypeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  focusTypeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTypeButtonSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // 勉強タイマー画面
  studyTimerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  studyTimerLabel: {
    color: '#D4AF37',
    fontSize: 18,
    marginBottom: 16,
  },
  studyTimerDisplay: {
    color: '#FFF',
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  studyTimerControls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  studyControlButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  studyControlText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // タイマー設定
  timerSettingSection: {
    marginBottom: 16,
  },
  timerSettingLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timerButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  // ネットモードトップバー
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  focusTimerControl: {
    fontSize: 24,
  },
  // NGクイズ
  ngQuizTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ngQuizSub: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  ngQuizRemaining: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerBreak: {
    backgroundColor: '#2DD4BF',
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTimerControl: {
    fontSize: 24,
  },
  focusSessionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 8,
    paddingHorizontal: 12,
  },
  focusSessionsText: {
    color: '#D4AF37',
    fontSize: 12,
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  timerSettingSection: {
    marginBottom: 16,
  },
  timerSettingLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timerButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  focusHistorySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  focusHistoryTitle: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  focusHistoryItem: {
    color: '#9ca3af',
    fontSize: 13,
    paddingVertical: 6,
  },
  dojoIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  // 欲望可視化スタイル
  // 相談選択画面
  consultSelectBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  consultSelectContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingTop: 150,
  },
  consultTitleBox: {
    marginBottom: 40,
    alignItems: 'center',
  },
  consultTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
  },
  consultSubtitle: {
    color: '#666',
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 1,
  },
  consultSelectButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  consultSelectButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '500',
  },
  consultBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  consultBackButtonText: {
    color: '#C9A24D',
    fontSize: 14,
  },
  consultModeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  consultModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  consultModeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  consultModeText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  consultModeTextActive: {
    color: '#000',
  },
  yokubouBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  yokubouTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  yokubouSub: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 16,
  },
  yokubouImagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#262626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  yokubouImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  yokubouImagePlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  yokubouInput: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  yokubouSubmitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  yokubouSubmitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yokubouReplyBox: {
    backgroundColor: '#0d2818',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2DD4BF',
  },
  yokubouReplyLabel: {
    color: '#2DD4BF',
    fontSize: 12,
    marginBottom: 4,
  },
  yokubouReplyText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  yokubouSaveButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  yokubouSaveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yokubouSavedText: {
    color: '#2DD4BF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  yokubouResetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  yokubouResetText: {
    color: '#666',
    fontSize: 14,
  },
  yokubouButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  yokubouCameraButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  yokubouCameraButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  yokubouGalleryButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  yokubouGalleryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // 1日1善スタイル
  goodDeedImageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  goodDeedCameraBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goodDeedCameraBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goodDeedGalleryBtn: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  goodDeedGalleryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goodDeedImagePreviewContainer: {
    marginBottom: 12,
  },
  goodDeedImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  goodDeedInput: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  goodDeedTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  goodDeedTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
  },
  goodDeedTagChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  goodDeedTagText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  goodDeedTagTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  goodDeedListContainer: {
    marginTop: 16,
  },
  goodDeedListTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goodDeedItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  goodDeedItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  goodDeedItemContent: {
    flex: 1,
  },
  goodDeedItemText: {
    color: '#FFF',
    fontSize: 14,
  },
  goodDeedItemTag: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 4,
  },
  // 履歴画像スタイル
  historyImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  addToDiaryButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addToDiaryButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  goodDeedLogItem: {
    paddingVertical: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#D4AF37',
    marginBottom: 6,
  },
  goodDeedLogText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveReviewButton: {
    flex: 1,
    backgroundColor: '#2DD4BF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  saveReviewButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Apple風ボタンスタイル
  appleMainButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  appleMainButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appleEditButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  appleEditButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appleDeleteLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  appleDeleteLinkText: {
    color: '#FF3B30',
    fontSize: 15,
  },
  appleCancelLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  appleCancelLinkText: {
    color: '#007AFF',
    fontSize: 15,
  },
});