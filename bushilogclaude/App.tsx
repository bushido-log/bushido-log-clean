// App.tsx (refactor / rewrite)
// BUSHIDO LOG - single file version (keeps your current features)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
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
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { initializePurchases, checkProStatus, getOffering, purchasePro, restorePurchases, getMonthlyPrice, getAnnualPrice, purchaseAnnual } from './src/services/purchaseService';
import { PurchasesPackage } from 'react-native-purchases';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// === Extracted modules ===
import {
  API_BASE, SAMURAI_TTS_URL, SESSION_KEY,
  HISTORY_KEY, DAILY_LOGS_KEY, ONBOARDING_KEY, XP_KEY, SETTINGS_KEY, STATS_KEY,
  KEGARE_KEY, TUTORIAL_KEY, BLOCKLIST_KEY, SAMURAI_TIME_KEY, SAMURAI_KING_USES_KEY,
  SAMURAI_MISSION_KEY, FIRST_LAUNCH_KEY, INTRO_SKIP_KEY, FIRST_OPEN_DATE_KEY,
  MIKKABOZU_DAY_KEY, MIKKABOZU_EVENT_KEY, ATODEYARU_EVENT_KEY, ATODEYARU_ACTIVE_KEY,
  DEEBU_EVENT_KEY, DEEBU_ACTIVE_KEY, MOUMURI_EVENT_KEY, MOUMURI_ACTIVE_KEY,
  MK2_EVENT_KEY, MK2_ACTIVE_KEY, MK2_PROGRESS_KEY,
  FREE_TRIAL_DAYS, MAX_LEVEL, DAYS_PER_LEVEL, MASTER_VOLUME,
  LEVEL_TITLES, LEVEL_XP_THRESHOLDS, DEFAULT_ROUTINES, urgeMessage, KEGARE_QUOTES,
} from './src/data/constants';
import {
  YokaiFeature, YokaiData, Message, HistoryEntry, GoodDeedEntry,
  NightReview, TodoItem, DailyLog, OnboardingData, AppSettings, SamuraiTimeState,
  DEFAULT_SETTINGS,
} from './src/data/types';
import {
  STARTUP_SOUND, TAP_SOUND, CONFIRM_SOUND, RITUAL_SOUND, CHECK_SOUND,
  CORRECT_SOUND, WRONG_SOUND, LEVELUP_SOUND, EXP_SOUND, EVOLUTION_SOUND,
  WIN_SOUND, FAIL_SOUND, ATTACK_SOUND, ENTER_SOUND, FOCUS_START_SOUND,
  KATANA_SOUND, SFX_POLISH, SFX_KATANA_SHINE, SFX_FOOTSTEP, SFX_EYE_GLOW,
  VOICE_MK_APPEAR, VOICE_MK_DEFEAT, VOICE_ATO_APPEAR, VOICE_ATO_DEFEAT,
  VOICE_DEEBU_APPEAR, VOICE_DEEBU_DEFEAT, VOICE_MOUMURI_APPEAR, VOICE_MOUMURI_DEFEAT,
  VOICE_MK2_APPEAR, VOICE_MK2_DEFEAT, VOICE_TETSUYA_APPEAR,
  BGM_MONSTER_APPEAR, SFX_TETSUYA_APPEAR, SCREAM_VOICES,
  ENDING_CLEAR_BG, ENDING_W1_COMPLETE_BG,
  DOJO_GATE_DIM, DOJO_GATE_LIGHT, CONSULT_BG, CONSULT_SELECT_IMG, INTRO_VIDEO,
  CHARACTER_IMAGES, KATANA_RUSTY, KATANA_CLEAN,
  YOKAI_IMAGES, YOKAI_LOSE_IMAGES, YOKAI_VIDEOS, YOKAI_LOSE_VIDEOS,
  MIKKABOZU_EYES, STORY_SCENE1_IMG, STORY_SCENE2_IMG,
  ATODEYARU_SCENE1_IMG, ATODEYARU_SCENE2_IMG, ATODEYARU_DEFEAT_VIDEO,
  DEEBU_SCENE1_IMG, DEEBU_SCENE2_IMG, DEEBU_DEFEAT_VIDEO,
  MOUMURI_SCENE1_IMG, MOUMURI_SCENE2_IMG, MOUMURI_DEFEAT_VIDEO,
  TETSUYA_SILHOUETTE, MIKKABOZU_DEFEAT_VIDEO,
  WORLD1_BG, NODE_FIST, NODE_KATANA, NODE_SCROLL, NODE_BRAIN, NODE_BOSS, NODE_LOCKED,
  ENEMY_IMAGES,
} from './src/data/assets';
import { YOKAI_LIST } from './src/data/yokaiData';
import { ENEMIES, BATTLE_WIN_QUOTES, BATTLE_LOSE_QUOTES } from './src/data/battleData';
import { getTodayStr, formatDateLabel, daysDiff, getStreakCount, getRankFromXp, getLevelFromXp, getSamuraiLevelInfo, getSessionId } from './src/utils/helpers';
import { playSound, playPressSound, playTapSound, playConfirmSound, playRitualSound, playCheckSound, playCorrectSound, playWrongSound, playLevelupSound, playExpSound, playEvolutionSound, playWinSound, playFailSound, playAttackSound, playEnterSound, playFocusStartSound } from './src/utils/sounds';
import { callSamuraiKing, callSamuraiMissionGPT } from './src/utils/api';
import { styles } from './src/styles';
import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from './src/data/texts';
import { SamuraiAvatar } from './src/components/SamuraiAvatar';
import { STORY_SCENES, ATODEYARU_SCENES, DEEBU_SCENES, MOUMURI_SCENES, MK2_SCENES } from './src/data/storyScenes';
import {
  MISSION_TARGET, SQ_TOTAL, MOUMURI_KANSHA_TARGET, DEEBU_HIT_TARGET,
  MK2_DAY1, MK2_DAY2, MK2_DAY3, MK2_MISSIONS, MK2_TEXT_CFG, MK2_LIST_CFG,
  DEEBU_EXERCISES, ATODEYARU_QUIPS, PHYSICAL_MISSIONS, SQ_MISSIONS, SQ_DATA,
  IMINASHI_MESSAGES, SAMURAI_KING_DEFEAT_QUOTES,
} from './src/data/gameData';


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

  const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character' | 'battle' | 'innerWorld'>('consult');
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

  // RevenueCat初期化とPro状態チェック
  useEffect(() => {
    (async () => {
      try {
        await initializePurchases();
        const proStatus = await checkProStatus();
        // setIsPro(proStatus); // TEST
        const monthly = await getMonthlyPrice();
        const annual = await getAnnualPrice();
        setMonthlyPrice(monthly);
        setAnnualPrice(annual);
      } catch (e) {
        console.log('RevenueCat init error', e);
      }
    })();
  }, []);
  
  // 通知の権限リクエスト
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
      }
    })();
  }, []);

  // 通知タップ時のハンドラー
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'wakeup_alarm') {
        // 起床アラームの通知タップ → アラームタブへ移動して鳴らす
        setTab('alarm');
        setAlarmRinging(true);
      } else if (data?.type === 'mission_deadline') {
        // ミッション期限通知タップ → アラーム画面表示
        setMissionStatus('expired');
        setMissionAlarmActive(true);
        setShowMissionAlarm(true);
      }
    });
    return () => subscription.remove();
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
      // 穢れチェック
      await checkKegare();
      checkMikkabozuEvent();
      // Atodeyaru state restore
      AsyncStorage.getItem(ATODEYARU_EVENT_KEY).then(v => { if (v === 'true') { setAtodeyaruEventDone(true); setInnerWorldUnlocked(true); } }).catch(e => {});
      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});
      AsyncStorage.getItem(DEEBU_EVENT_KEY).then(v => { if (v === 'true') { setDeebuEventDone(true); setInnerWorldUnlocked(true); } }).catch(e => {});
      AsyncStorage.getItem(DEEBU_ACTIVE_KEY).then(v => { if (v === 'true') setDeebuActive(true); }).catch(e => {});
      AsyncStorage.getItem(MOUMURI_EVENT_KEY).then(v => { if (v === 'true') { setMoumuriEventDone(true); } }).catch(e => {});
      AsyncStorage.getItem(MOUMURI_ACTIVE_KEY).then(v => { if (v === 'true') setMoumuriActive(true); }).catch(e => {});
      AsyncStorage.getItem(MK2_EVENT_KEY).then(v => { if (v === 'true') setMk2EventDone(true); }).catch(e => {});
      AsyncStorage.getItem(MK2_ACTIVE_KEY).then(v => { if (v === 'true') setMk2Active(true); }).catch(e => {});
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
  const [alarmNotificationId, setAlarmNotificationId] = useState<string | null>(null);
  const [missionNotificationId, setMissionNotificationId] = useState<string | null>(null);
  
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
  const [onboardingStep, setOnboardingStep] = useState(1); // 新オンボーディング: 1-4
  const [userStartChoice, setUserStartChoice] = useState<'free' | 'serious' | null>(null);

  // settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  // 課金関連
  const [isPro, setIsPro] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState('¥700');
  const [annualPrice, setAnnualPrice] = useState('¥7,000');
  const [samuraiKingUses, setSamuraiKingUses] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
  
  // サムライミッション（Lv2機能）
  type MissionStatus = 'none' | 'offered' | 'accepted' | 'started' | 'completed' | 'expired' | 'amnesty';
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('none');
  const [missionSource, setMissionSource] = useState<'ai' | 'self'>('ai');
  const [missionAcceptedAt, setMissionAcceptedAt] = useState<number | null>(null);
  const [missionDeadlineAt, setMissionDeadlineAt] = useState<number | null>(null);
  const [missionStarted, setMissionStarted] = useState(false);
  const [dailyMissionUsed, setDailyMissionUsed] = useState(false);
  const [amnestyUsedToday, setAmnestyUsedToday] = useState(false);
  const [missionAlarmActive, setMissionAlarmActive] = useState(false);
  const [missionDeadlineMinutes, setMissionDeadlineMinutes] = useState(10);
  
  // ミッションアラーム解除用
  const [showMissionAlarm, setShowMissionAlarm] = useState(false);
  const [missionQuizCorrectStreak, setMissionQuizCorrectStreak] = useState(0);
  const [missionQuizQuestion, setMissionQuizQuestion] = useState({ q: '', a: '' });
  const [missionQuizAnswer, setMissionQuizAnswer] = useState('');
  const [missionQuizTimeLeft, setMissionQuizTimeLeft] = useState(10);
  const [showAlternativeAction, setShowAlternativeAction] = useState(false);
  const [alternativeAction, setAlternativeAction] = useState('');
  
  // 相談からのミッション提案
  const [showMissionProposal, setShowMissionProposal] = useState(false);
  const [proposedMission, setProposedMission] = useState('');
  const [lastConsultText, setLastConsultText] = useState(''); // 最後の相談内容
  const [lastConsultReply, setLastConsultReply] = useState(''); // 最後の返答
  const [canCreateMission, setCanCreateMission] = useState(false); // ミッション生成可能か
  const [isGeneratingMissionFromConsult, setIsGeneratingMissionFromConsult] = useState(false);

  // XP
  const [totalXp, setTotalXp] = useState(0);

  // ===== Battle System State =====
  const [battleMode, setBattleMode] = useState<'select' | 'fighting' | 'result' | null>(null);
  const [battleEnemy, setBattleEnemy] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [battleWinStreak, setBattleWinStreak] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleTurnLog, setBattleTurnLog] = useState<string[]>([]);
  const [battleAnimating, setBattleAnimating] = useState(false);
  const [battleQuote, setBattleQuote] = useState('');
  const [battleXpGained, setBattleXpGained] = useState(0);
  const battleShakeAnim = useRef(new Animated.Value(0)).current;
  const playerShakeAnim = useRef(new Animated.Value(0)).current;



  // ===== Inner World (修行の間) =====
  const [innerWorldView, setInnerWorldView] = useState<'menu' | 'yokaiDex' | 'stageMap'>('menu');
  // ===== Kegare (Katana Polishing) System =====
  const [showKatanaPolish, setShowKatanaPolish] = useState(false);
  const [polishCount, setPolishCount] = useState(0);
  const [polishRequired, setPolishRequired] = useState(5);
  const [polishComplete, setPolishComplete] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [kegareQuote, setKegareQuote] = useState('');
  const katanaGlowAnim = useRef(new Animated.Value(0)).current;
  const katanaScaleAnim = useRef(new Animated.Value(1)).current;

  // ===== Yokai Defeat System =====
  const [yokaiEncounter, setYokaiEncounter] = useState<YokaiData | null>(null);
  const [yokaiPhase, setYokaiPhase] = useState<'appear' | 'attack' | 'defeated' | null>(null);
  const [yokaiXp, setYokaiXp] = useState(0);
  const [yokaiFeature, setYokaiFeature] = useState<string>('');
  const yokaiShakeAnim = useRef(new Animated.Value(0)).current;


  // ===== Stats System =====
  const [samuraiStats, setSamuraiStats] = useState<{power: number, mind: number, skill: number, virtue: number}>({power: 75, mind: 75, skill: 75, virtue: 75});
  const [statsAllocated, setStatsAllocated] = useState(false);
  const [showStatsAlloc, setShowStatsAlloc] = useState(false);
  const [tempStats, setTempStats] = useState({power: 75, mind: 75, skill: 75, virtue: 75});
  const [lastRealloc, setLastRealloc] = useState<string | null>(null);
  const [showReallocModal, setShowReallocModal] = useState(false);
  const [reallocBudget] = useState(30);


  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const logoGlowAnim = useRef(new Animated.Value(0)).current;

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
          const data = JSON.parse(json);
          // 新フォーマット: { completed: true, choice: 'free' | 'serious' }
          // 旧フォーマット: OnboardingData { identity, quit, rule }
          if (data.completed) {
            // 新フォーマット
            setUserStartChoice(data.choice || 'free');
            setIsOnboarding(false);
          } else if (data.identity !== undefined) {
            // 旧フォーマット（既存ユーザー対応）
            setOnboardingData(data);
            setObIdentity(data.identity ?? '');
            setObQuit(data.quit ?? '');
            setObRule(data.rule ?? '');
            setIsOnboarding(false);
          } else {
            setIsOnboarding(true);
          }
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
        // Load stats
        const statsJson = await AsyncStorage.getItem(STATS_KEY);
        if (statsJson) {
          const parsed = JSON.parse(statsJson);
          setSamuraiStats(parsed.stats || {power: 75, mind: 75, skill: 75, virtue: 75});
          setStatsAllocated(parsed.allocated || false);
          setLastRealloc(parsed.lastRealloc || null);
        }
      } catch (e) {
        console.error('Failed to load XP', e);
      }
    })();
  }, []);

  // ロゴの光るアニメーション（Lv1以上で常時）
  useEffect(() => {
    const level = getLevelFromXp(totalXp).level;
    if (level >= 1) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(logoGlowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [totalXp]);

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

  // samuraiKingUsesを読み込み（初回無料体験の管理）
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_KING_USES_KEY);
        if (json) {
          const data = JSON.parse(json);
          const today = new Date().toISOString().split('T')[0];
          if (data.date === today) {
            setSamuraiKingUses(data.count);
          } else {
            setSamuraiKingUses(0);
          }
        }
      } catch (e) {
        console.error('Failed to load samuraiKingUses', e);
      }
    })();
  }, []);

  // サムライミッションの読み込みと日付リセット
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SAMURAI_MISSION_KEY);
        const today = new Date().toISOString().split('T')[0];
        if (json) {
          const data = JSON.parse(json);
          if (data.date !== today) {
            console.log('Mission: New day, resetting...');
            setMissionStatus('none');
            setDailyMissionUsed(false);
            setAmnestyUsedToday(false);
            setMissionStarted(false);
            setMissionAlarmActive(false);
            setSamuraiMissionText('');
            setMissionAcceptedAt(null);
            setMissionDeadlineAt(null);
          } else {
            setSamuraiMissionText(data.missionText || '');
            setMissionStatus(data.status || 'none');
            setMissionSource(data.source || 'ai');
            setMissionAcceptedAt(data.acceptedAt || null);
            setMissionDeadlineAt(data.deadlineAt || null);
            setMissionStarted(data.started || false);
            setDailyMissionUsed(data.dailyUsed || false);
            setAmnestyUsedToday(data.amnestyUsed || false);
            setMissionAlarmActive(data.alarmActive || false);
            console.log('Mission: Restored state:', data.status);
          }
        }
      } catch (e) {
        console.error('Failed to load mission', e);
      }
    })();
  }, []);

  // ミッションデータを保存する関数
  const saveMissionState = async (updates: Partial<{
    missionText: string;
    status: MissionStatus;
    source: 'ai' | 'self';
    acceptedAt: number | null;
    deadlineAt: number | null;
    started: boolean;
    dailyUsed: boolean;
    amnestyUsed: boolean;
    alarmActive: boolean;
  }>) => {
    const today = new Date().toISOString().split('T')[0];
    const current = {
      date: today,
      missionText: updates.missionText ?? samuraiMissionText,
      status: updates.status ?? missionStatus,
      source: updates.source ?? missionSource,
      acceptedAt: updates.acceptedAt ?? missionAcceptedAt,
      deadlineAt: updates.deadlineAt ?? missionDeadlineAt,
      started: updates.started ?? missionStarted,
      dailyUsed: updates.dailyUsed ?? dailyMissionUsed,
      amnestyUsed: updates.amnestyUsed ?? amnestyUsedToday,
      alarmActive: updates.alarmActive ?? missionAlarmActive,
    };
    await AsyncStorage.setItem(SAMURAI_MISSION_KEY, JSON.stringify(current));
  };

  // ミッションタイマー監視
  useEffect(() => {
    if (missionStatus !== 'accepted' || !missionDeadlineAt) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now > missionDeadlineAt && !missionStarted) {
        console.log('Mission: Deadline exceeded, alarm triggered!');
        setMissionStatus('expired');
        setMissionAlarmActive(true);
        setShowMissionAlarm(true);
        saveMissionState({ status: 'expired', alarmActive: true });
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [missionStatus, missionDeadlineAt, missionStarted]);

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
      markMissionStarted(); // サムライミッション開始判定
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
      
      // 相談内容を保持（ミッション生成用）- 自動提案はしない
      console.log("Mission button check:", { isPro, dailyMissionUsed, missionStatus }); if (isPro && !dailyMissionUsed && missionStatus === 'none') {
        setLastConsultText(userText);
        setLastConsultReply(replyText);
        setCanCreateMission(true);
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
  // サムライミッション機能
  // =========================

  // クイズ問題を生成
  const generateMissionQuiz = () => {
    const quizTypes = ['add', 'multiply', 'sequence'];
    const type = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    
    if (type === 'add') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      return { q: `${a} + ${b} = ?`, a: String(a + b) };
    } else if (type === 'multiply') {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      return { q: `${a} × ${b} = ?`, a: String(a * b) };
    } else {
      const start = Math.floor(Math.random() * 5) + 1;
      const diff = Math.floor(Math.random() * 3) + 2;
      const seq = [start, start + diff, start + diff * 2];
      return { q: `${seq.join(', ')}, ? (次の数)`, a: String(start + diff * 3) };
    }
  };

  // 代替行動を生成
  const generateAlternativeAction = () => {
    const actions = [
      '立って深呼吸を5回する',
      '冷たい水で顔を洗う',
      '今日の最重要タスクを1行で書く',
      '立ったまま30秒間目を閉じる',
      '窓を開けて外の空気を吸う',
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  // 相談内容からミッションを生成
  const generateMissionFromConsult = async () => {
    if (!lastConsultReply || isGeneratingMissionFromConsult) return;
    
    setIsGeneratingMissionFromConsult(true);
    
    try {
      // サムライキングの返答からミッションを抽出するプロンプト
      const missionPrompt = `【ミッション抽出依頼】
以下はサムライキングがユーザーに提案した返答です。
この返答から「具体的な行動」を1つだけ抽出してミッション形式にしてください。

サムライキングの返答：
「${lastConsultReply}」

ルール：
- 返答に含まれる行動をそのまま使う（勝手に変えない）
- 時間・場所・回数が明記されていればそのまま含める
- 明記されていなければ最低限だけ補足
- 1〜2文で簡潔に

出力形式：
ミッション内容のみ。説明や前置きは不要。`;

      const missionText = await callSamuraiKing(missionPrompt);
      
      // 余計な前置きを削除
      const cleanMission = missionText
        .replace(/^(ミッション[：:]\s*|では[、,]\s*|よし[、,]\s*|了解[、,]\s*)/i, '')
        .trim();
      
      setProposedMission(cleanMission);
      setShowMissionProposal(true);
      setCanCreateMission(false);
      
    } catch (error) {
      console.error('Mission generation error:', error);
      Alert.alert('エラー', 'ミッション生成に失敗しました');
    } finally {
      setIsGeneratingMissionFromConsult(false);
    }
  };

  // 相談からのミッション提案を受諾
  const acceptProposedMission = async () => {
    setShowMissionProposal(false);
    
    // ミッションを設定
    setSamuraiMissionText(proposedMission);
    setMissionSource('ai');
    setMissionStatus('offered');
    
    await saveMissionState({
      missionText: proposedMission,
      source: 'ai',
      status: 'offered',
    });
    
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // トーストで表示（チャットに流さない）
    showSaveSuccess('契約成立！目標タブで期限を設定せよ');
    
    // 目標タブに自動移動
    setTimeout(() => setTab('goal'), 500);
  };

  // 相談からのミッション提案を拒否
  const rejectProposedMission = () => {
    setShowMissionProposal(false);
    
    playWrongSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // トーストで表示（チャットに流さない）
    const angryMessages = [
      '今回は逃げたな…だが次がある',
      '臆病者め…次は逃げるなよ',
      'やらぬか。まあいい、お前の人生だ',
    ];
    const angryMsg = angryMessages[Math.floor(Math.random() * angryMessages.length)];
    showSaveSuccess(angryMsg);
  };

  // ミッション受諾
  const acceptMission = async () => {
    if (dailyMissionUsed) {
      Alert.alert('今日のミッションは終了', '明日また挑戦しよう！');
      return;
    }
    
    const now = Date.now();
    const deadline = now + missionDeadlineMinutes * 60 * 1000;
    
    setMissionStatus('accepted');
    setMissionAcceptedAt(now);
    setMissionDeadlineAt(deadline);
    setDailyMissionUsed(true);
    setMissionStarted(false);
    
    await saveMissionState({
      status: 'accepted',
      acceptedAt: now,
      deadlineAt: deadline,
      dailyUsed: true,
      started: false,
    });
    
    // 期限切れ通知をスケジュール
    if (missionNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
    }
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ ミッション期限切れ',
        body: '逃げたな？アプリを開いてアラームを解除せよ！',
        sound: true,
        data: { type: 'mission_deadline' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(deadline),
      },
    });
    setMissionNotificationId(notifId);
    
    playTapSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('契約成立！', `${missionDeadlineMinutes}分以内に行動を開始せよ`);
    console.log('Mission: Accepted, deadline:', new Date(deadline).toLocaleTimeString());
  };

  // ミッション開始を記録
  const markMissionStarted = async () => {
    if (missionStatus === 'accepted' && !missionStarted) {
      console.log('Mission: Started!');
      setMissionStarted(true);
      setMissionStatus('started');
      await saveMissionState({ started: true, status: 'started' });
      
      // 期限通知をキャンセル（開始したので不要）
      if (missionNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
        setMissionNotificationId(null);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // XP付与とレベルアップチェック
  const addXpWithLevelCheck = async (xpGain: number) => {
    const oldLevel = getLevelFromXp(totalXp).level;
    const newXp = totalXp + xpGain;
    const newLevel = getLevelFromXp(newXp).level;
    
    setTotalXp(newXp);
    await AsyncStorage.setItem(XP_KEY, String(newXp));
    
    // レベルアップした場合
    if (newLevel > oldLevel) {
      setLevelUpInfo({ oldLevel, newLevel });
      playLevelupSound(); setTimeout(() => setShowLevelUpModal(true), 500);
    }
    
    return newXp;
  };

  // ミッション完了
  const completeMission = async () => {
    if (missionStatus === 'started' || missionStatus === 'accepted') {
      console.log('Mission: Completed!');
      setMissionStatus('completed');
      setMissionCompletedToday(true);
      await saveMissionState({ status: 'completed' });
      
      // 期限通知をキャンセル
      if (missionNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(missionNotificationId);
        setMissionNotificationId(null);
      }
      
      const xpGain = 50;
      await addXpWithLevelCheck(xpGain);
      
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSaveSuccess(`修行達成！+${xpGain} XP`);
    }
  };

  // クイズ解答チェック
  const checkMissionQuizAnswer = () => {
    if (missionQuizAnswer.trim() === missionQuizQuestion.a) {
      const newStreak = missionQuizCorrectStreak + 1;
      setMissionQuizCorrectStreak(newStreak);
      playCorrectSound();
      
      if (newStreak >= 3) {
        setMissionAlarmActive(false);
        setShowMissionAlarm(false);
        setMissionQuizCorrectStreak(0);
        saveMissionState({ alarmActive: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSaveSuccess('アラーム解除！今日も頑張ろう');
          } else {
        setMissionQuizQuestion(generateMissionQuiz());
        setMissionQuizAnswer('');
        setMissionQuizTimeLeft(10);
      }
    } else {
      playWrongSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMissionQuizCorrectStreak(0);
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizTimeLeft(10);
    }
  };

  // カメラでアラーム解除
  const dismissAlarmWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラ権限が必要です');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setMissionAlarmActive(false);
      setShowMissionAlarm(false);
      saveMissionState({ alarmActive: false });
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSaveSuccess('アラーム解除！今日も頑張ろう');
    }
  };

  // 恩赦（1日1回）
  const grantAmnesty = async () => {
    if (amnestyUsedToday) {
      Alert.alert('恩赦は1日1回のみ', '今日はもう使用済みです');
      return;
    }
    
    setAmnestyUsedToday(true);
    setMissionAlarmActive(false);
    setShowMissionAlarm(false);
    setMissionStatus('amnesty');
    
    setAlternativeAction(generateAlternativeAction());
    setShowAlternativeAction(true);
    
    await saveMissionState({
      status: 'amnesty',
      alarmActive: false,
      amnestyUsed: true,
    });
    
    const xpGain = 25;
    await addXpWithLevelCheck(xpGain);
  };

  // 代替行動完了
  const completeAlternativeAction = () => {
    setShowAlternativeAction(false);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('代替行動完了！+25 XP');
  };

  // 自作ミッションのバリデーション
  const validateSelfMission = (text: string): { valid: boolean; error?: string } => {
    const timePatterns = /(\d+秒|\d+分|\d+時間|[0-9]+sec|[0-9]+min)/i;
    if (!timePatterns.test(text)) {
      return { valid: false, error: '時間を含めてください（例：3分、60秒）' };
    }
    
    const placePatterns = /(立って|座って|机|玄関|風呂|洗面|トイレ|外|ベッド|リビング|キッチン|で)/i;
    if (!placePatterns.test(text)) {
      return { valid: false, error: '場所か姿勢を含めてください（例：立って、机で）' };
    }
    
    return { valid: true };
  };

  // 自作ミッションを設定
  const setSelfMission = async (text: string) => {
    const validation = validateSelfMission(text);
    if (!validation.valid) {
      Alert.alert('ミッションの形式', validation.error);
      return false;
    }
    
    setSamuraiMissionText(text);
    setMissionSource('self');
    setMissionStatus('offered');
    await saveMissionState({
      missionText: text,
      source: 'self',
      status: 'offered',
    });
    return true;
  };

  // クイズタイマー
  useEffect(() => {
    if (!showMissionAlarm || missionQuizTimeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setMissionQuizTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showMissionAlarm, missionQuizTimeLeft]);

  // タイムアウトで不正解扱い
  useEffect(() => {
    if (showMissionAlarm && missionQuizTimeLeft === 0) {
      playWrongSound();
      setMissionQuizCorrectStreak(0);
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizTimeLeft(10);
    }
  }, [missionQuizTimeLeft, showMissionAlarm]);

  // アラーム表示時にクイズ初期化
  useEffect(() => {
    if (showMissionAlarm) {
      setMissionQuizQuestion(generateMissionQuiz());
      setMissionQuizAnswer('');
      setMissionQuizCorrectStreak(0);
      setMissionQuizTimeLeft(10);
    }
  }, [showMissionAlarm]);

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
    // Tutorial: advance after first goal save
    if (!tutorialDone && tutorialPhase === null) {
      setTimeout(() => setTutorialPhase(3), 2500);
    }
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
    checkAtodeyaruCondition(newLogs);
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
    checkAtodeyaruCondition(newLogs);
  };

  const handleGenerateSamuraiMission = async () => {
    if (isGeneratingMission) return;

    await tap('medium');

    setIsGeneratingMission(true);
    try {
      const mission = await callSamuraiMissionGPT();
      setSamuraiMissionText(mission);
      setMissionSource('ai');
      setMissionStatus('offered');
      
      // ミッション状態を保存
      await saveMissionState({
        missionText: mission,
        source: 'ai',
        status: 'offered',
      });

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
    await addXpWithLevelCheck(gainedXp);

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
      <Pressable 
        onPress={() => { 
          playTapSound(); 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
          const levelInfo = getLevelFromXp(totalXp); 
          if (levelInfo.level >= 1) { 
            setShowStartScreen(false); 
            setInnerWorldView('menu');
            if (mikkabozuEventDone || innerWorldUnlocked) { setTab('innerWorld'); setShowStartScreen(false); } // gated by mikkabozu
          } else { 
            showSaveSuccess('修行の成果は、やがて姿を持つ'); 
          } 
        }}
 
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, alignItems: 'center' }]}
      >
        <Animated.View style={{ 
          opacity: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
          transform: [{ scale: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
          shadowColor: getLevelFromXp(totalXp).level >= 1 ? '#D4AF37' : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: getLevelFromXp(totalXp).level >= 1 ? 0.8 : 0,
          shadowRadius: 15,
        }}>
          <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
        </Animated.View>
        {getLevelFromXp(totalXp).level >= 1 && (
          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', marginTop: 4 }}>
            Lv.{getLevelFromXp(totalXp).level}
          </Text>
        )}
      </Pressable>
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
        style={[styles.startButton, !isPro && getLevelFromXp(totalXp).level < 5 && { opacity: 0.4 }]}
        onPress={() => {
          if (!isPro && getLevelFromXp(totalXp).level < 5) {
            playTapSound();
            showSaveSuccess('Lv.5「若侍」で解放');
            return;
          }
          playEnterSound();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>明日に備える{!isPro && getLevelFromXp(totalXp).level < 5 ? ' 🔒' : ''}</Text>
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
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Image source={CONSULT_SELECT_IMG} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          {/* 上ボタン: サムライキングに相談する */}
          <Pressable
            onPress={() => { playEnterSound(); setConsultMode('text'); setIsSummoned(true); }}
            style={{ position: 'absolute', top: '30%', left: '10%', right: '10%', height: '16%', borderRadius: 28 }}
          />
          {/* 下ボタン: サムライキングに欲望を見せろ */}
          <Pressable
            onPress={() => { playEnterSound(); setConsultMode('visualize'); }}
            style={{ position: 'absolute', top: '56%', left: '10%', right: '10%', height: '16%', borderRadius: 28 }}
          />
        </View>
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

                  {/* 相談からミッションを作るボタン（Pro限定・送信中は非表示） */}
                  {canCreateMission && isPro && !dailyMissionUsed && missionStatus === 'none' && !isSending && !typingMessageId && (
                    <Pressable
                      style={styles.createMissionButton}
                      onPress={() => { playTapSound(); generateMissionFromConsult(); }}
                      disabled={isGeneratingMissionFromConsult}
                    >
                      <Text style={styles.createMissionButtonText}>
                        {isGeneratingMissionFromConsult ? 'ミッション生成中...' : '⚔️ この相談からミッションを作る'}
                      </Text>
                    </Pressable>
                  )}

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
              <Text style={styles.samuraiMissionXp}>{isPro ? '達成で 50XP' : 'Pro限定'}</Text>
            </View>
            
            {isPro ? (
              <>
                <Text style={styles.goalSub}>AIが「今日やるといい一手」をくれるでござる。</Text>

                {/* ミッションステータス表示 */}
                {missionStatus !== 'none' && missionStatus !== 'offered' && (
                  <View style={{ backgroundColor: '#2a2a3e', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                    <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>
                      ステータス: {
                        missionStatus === 'accepted' ? '⏳ 受諾済み（行動待ち）' :
                        missionStatus === 'started' ? '🔥 行動開始' :
                        missionStatus === 'completed' ? '✅ 完了' :
                        missionStatus === 'expired' ? '⚠️ 期限切れ' :
                        missionStatus === 'amnesty' ? '🙏 恩赦' : ''
                      }
                    </Text>
                    {missionStatus === 'accepted' && missionDeadlineAt && (
                      <Text style={{ color: '#FF4444', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                        残り: {Math.max(0, Math.floor((missionDeadlineAt - Date.now()) / 1000 / 60))}分
                      </Text>
                    )}
                  </View>
                )}

                {samuraiMissionText ? (
                  <View style={styles.samuraiMissionBox}>
                    <Text style={styles.samuraiMissionText}>{samuraiMissionText}</Text>
                    
                    {/* 受諾前：受諾ボタン表示 */}
                    {missionStatus === 'offered' && (
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ color: '#888', marginRight: 8 }}>期限:</Text>
                          <Pressable onPress={() => setMissionDeadlineMinutes(5)} style={{ backgroundColor: missionDeadlineMinutes === 5 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 5 ? '#000' : '#FFF' }}>5分</Text>
                          </Pressable>
                          <Pressable onPress={() => setMissionDeadlineMinutes(10)} style={{ backgroundColor: missionDeadlineMinutes === 10 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 10 ? '#000' : '#FFF' }}>10分</Text>
                          </Pressable>
                          <Pressable onPress={() => setMissionDeadlineMinutes(30)} style={{ backgroundColor: missionDeadlineMinutes === 30 ? '#D4AF37' : '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: missionDeadlineMinutes === 30 ? '#000' : '#FFF' }}>30分</Text>
                          </Pressable>
                        </View>
                        <Pressable
                          style={[styles.samuraiMissionButton, { backgroundColor: '#D4AF37' }]}
                          onPress={acceptMission}
                        >
                          <Text style={[styles.samuraiMissionButtonText, { color: '#000' }]}>契約する（{missionDeadlineMinutes}分以内に行動開始）</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* 受諾後〜完了前：完了ボタン表示 */}
                    {(missionStatus === 'accepted' || missionStatus === 'started') && (
                      <Pressable
                        style={styles.samuraiMissionButton}
                        onPress={completeMission}
                      >
                        <Text style={styles.samuraiMissionButtonText}>ミッション完了！</Text>
                      </Pressable>
                    )}

                    {/* 完了済み */}
                    {(missionStatus === 'completed' || missionStatus === 'amnesty') && (
                      <View style={[styles.samuraiMissionButton, { opacity: 0.5 }]}>
                        <Text style={styles.samuraiMissionButtonText}>
                          {missionStatus === 'completed' ? '✅ 達成済み！' : '🙏 恩赦済み'}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Pressable 
                    style={[styles.samuraiMissionButton, dailyMissionUsed && { opacity: 0.5 }]} 
                    onPress={() => { 
                      if (dailyMissionUsed) {
                        Alert.alert('今日のミッションは終了', '明日また挑戦しよう！');
                        return;
                      }
                      playTapSound(); 
                      handleGenerateSamuraiMission(); 
                    }}
                    disabled={dailyMissionUsed}
                  >
                    <Text style={styles.samuraiMissionButtonText}>
                      {dailyMissionUsed ? '今日のミッション終了' : isGeneratingMission ? '生成中…' : 'サムライミッションを受け取る'}
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              // 無料ユーザー向け：Proへのアップグレード促進
              <View>
                <Text style={styles.goalSub}>Proになると、サムライキングからミッションを受け取り、期限付きで挑戦できる。逃げたらアラームが鳴る。本気で変わりたい者だけの機能だ。</Text>
                <Pressable 
                  style={[styles.samuraiMissionButton, { backgroundColor: '#D4AF37' }]}
                  onPress={() => setShowPaywall(true)}
                >
                  <Text style={[styles.samuraiMissionButtonText, { color: '#000' }]}>🔓 Proで解放する</Text>
                </Pressable>
              </View>
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

  // Paywallモーダル（App Store審査対応版）
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  const renderPaywall = () => (
    <Modal visible={showPaywall} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>道場に入る</Text>
          <Text style={styles.paywallSubtitle}>ここから先は、{'\n'}自分と向き合い続ける人のための場所です。</Text>
          
          {/* プラン選択 */}
          <View style={styles.planContainer}>
            <Pressable
              style={[styles.planOption, selectedPlan === 'annual' && styles.planSelected]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>2ヶ月分お得</Text></View>
              <Text style={styles.planName}>年額プラン</Text>
              <Text style={styles.planPrice}>{annualPrice}/年</Text>
            </Pressable>
            <Pressable
              style={[styles.planOption, selectedPlan === 'monthly' && styles.planSelected]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={styles.planName}>月額プラン</Text>
              <Text style={styles.planPrice}>{monthlyPrice}/月</Text>
            </Pressable>
          </View>

          {/* 購入ボタン */}
          <Pressable
            style={styles.paywallButton}
            onPress={async () => {
              const success = selectedPlan === 'annual' 
                ? await purchaseAnnual() 
                : await purchasePro();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallButtonText}>
              {selectedPlan === 'annual' ? '年額プランで始める' : '月額プランで始める'}
            </Text>
          </Pressable>

          {/* 購入を復元 */}
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

          {/* 今は入らない */}
          <Pressable onPress={() => { playTapSound(); setShowPaywall(false); }}>
            <Text style={styles.paywallCloseText}>今は入らない</Text>
          </Pressable>

          {/* 法的説明（Apple必須） */}
          <Text style={styles.paywallLegal}>
            サブスクリプションは購入確認時にiTunesアカウントに請求されます。
            現在の期間終了の24時間前までにキャンセルしない限り、自動的に更新されます。
            購入後、設定アプリからいつでも管理・キャンセルできます。
          </Text>

          {/* 利用規約・プライバシーポリシー */}
          <View style={styles.paywallLinks}>
            <Pressable onPress={() => { setShowPaywall(false); setShowTerms(true); }}>
              <Text style={styles.paywallLinkText}>利用規約</Text>
            </Pressable>
            <Text style={styles.paywallLinkDivider}>｜</Text>
            <Pressable onPress={() => { setShowPaywall(false); setShowPrivacy(true); }}>
              <Text style={styles.paywallLinkText}>プライバシーポリシー</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ミッションアラームモーダル
  const renderMissionAlarm = () => (
    <Modal visible={showMissionAlarm} animationType="slide" transparent={false}>
      <View style={styles.missionAlarmContainer}>
        <Text style={styles.missionAlarmTitle}>⚠️ ミッション期限切れ ⚠️</Text>
        <Text style={styles.missionAlarmSubtitle}>アラームを解除するには以下のいずれかを実行</Text>
        
        {/* クイズ解除 */}
        <View style={styles.missionAlarmSection}>
          <Text style={styles.missionAlarmSectionTitle}>🧠 クイズ解除（{missionQuizCorrectStreak}/3問正解）</Text>
          <Text style={styles.missionQuizTimer}>残り {missionQuizTimeLeft}秒</Text>
          <Text style={styles.missionQuizQuestion}>{missionQuizQuestion.q}</Text>
          <TextInput
            style={styles.missionQuizInput}
            value={missionQuizAnswer}
            onChangeText={setMissionQuizAnswer}
            placeholder="答えを入力"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            autoFocus
          />
          <Pressable style={styles.missionAlarmButton} onPress={checkMissionQuizAnswer}>
            <Text style={styles.missionAlarmButtonText}>回答</Text>
          </Pressable>
        </View>

        {/* カメラ解除 */}
        <Pressable style={styles.missionAlarmSecondaryButton} onPress={dismissAlarmWithCamera}>
          <Text style={styles.missionAlarmSecondaryText}>📸 写真を撮って解除</Text>
        </Pressable>

        {/* 恩赦 */}
        {!amnestyUsedToday && (
          <Pressable style={styles.missionAmnestyButton} onPress={grantAmnesty}>
            <Text style={styles.missionAmnestyText}>🙏 今日は許してやろう（1日1回）</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );

  // 代替行動モーダル
  const renderAlternativeAction = () => (
    <Modal visible={showAlternativeAction} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>代替行動</Text>
          <Text style={styles.paywallSubtitle}>恩赦の代わりにこれをやれ</Text>
          <Text style={[styles.paywallPrice, { fontSize: 18, lineHeight: 28 }]}>{alternativeAction}</Text>
          <Pressable style={styles.paywallButton} onPress={completeAlternativeAction}>
            <Text style={styles.paywallButtonText}>完了した</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // ミッション提案モーダル（相談後に表示）
  const renderMissionProposal = () => (
    <Modal visible={showMissionProposal} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>⚔️ ミッション提案</Text>
          <Text style={styles.paywallSubtitle}>相談内容に基づく挑戦状</Text>
          
          <View style={styles.missionProposalBox}>
            <Text style={styles.missionProposalText}>{proposedMission}</Text>
          </View>
          
          <Text style={styles.missionProposalHint}>
            このミッションを受けると、期限内に行動を開始する必要があります。
            逃げると…サムライアラームが鳴り響きます。
          </Text>
          
          <Pressable 
            style={[styles.paywallButton, { backgroundColor: '#D4AF37' }]} 
            onPress={acceptProposedMission}
          >
            <Text style={[styles.paywallButtonText, { color: '#000' }]}>このミッションを受ける</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.paywallRestoreButton, { marginTop: 12 }]} 
            onPress={() => {
              playTapSound();
              setShowMissionProposal(false);
              setTab('goal'); // 目標タブに移動
            }}
          >
            <Text style={[styles.paywallRestoreText, { color: '#2DD4BF' }]}>自分でミッションを作る</Text>
          </Pressable>
          
          <Pressable 
            style={{ marginTop: 8, padding: 8 }} 
            onPress={rejectProposedMission}
          >
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>今はやらない</Text>
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
      markMissionStarted(); // サムライミッション開始判定
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

  // キャラクター育成画面







  // ===== Tutorial Functions =====

  // Start tutorial after onboarding
  useEffect(() => {
    if (!isOnboarding && !tutorialDone && tutorialPhase === null) {
      startTutorial();
    }
  }, [isOnboarding]);

  const startTutorial = async () => {
    const done = await AsyncStorage.getItem(TUTORIAL_KEY);
    if (done === 'true') {
      setTutorialDone(true);
      return;
    }
    setTutorialPhase(0);
  };

  const advanceTutorial = async (phase: number) => {
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 5) {
      // Tutorial complete
      setTutorialPhase(null);
      setTutorialDone(true);
      await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      return;
    }
    setTutorialPhase(phase);
  };

  const skipTutorial = async () => {
    playTapSound();
    setTutorialPhase(null);
    setTutorialDone(true);
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const triggerShadowFlicker = () => {
    Animated.sequence([
      Animated.timing(tutorialShadowAnim, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      Animated.timing(tutorialShadowAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  // ===== Yokai Tab Presence System =====
  const [defeatedYokaiToday, setDefeatedYokaiToday] = useState<string[]>([]);

  const getTabYokai = (feature: YokaiFeature): YokaiData | null => {
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature) && !defeatedYokaiToday.includes(y.id));
    if (pool.length === 0) return null;
    // Deterministic: use today's date as seed
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const featureHash = feature.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return pool[(hash + featureHash) % pool.length];
  };

  const markYokaiDefeated = (yokaiId: string) => {
    setDefeatedYokaiToday(prev => prev.includes(yokaiId) ? prev : [...prev, yokaiId]);
  };

  const renderYokaiBanner = (feature: YokaiFeature) => {
    const yokai = getTabYokai(feature);
    if (!yokai) return null;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a0808',
        borderRadius: 14,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#8B0000',
      }}>
        <View style={{
          width: 50, height: 50, borderRadius: 10, overflow: 'hidden',
          borderWidth: 2, borderColor: '#8B0000', backgroundColor: '#0a0a0a', marginRight: 12,
        }}>
          <Image source={YOKAI_IMAGES[yokai.id]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '800' }}>{yokai.name}</Text>
          <Text style={{ color: '#888', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
            「{yokai.quote}」
          </Text>
        </View>
        <Text style={{ color: '#ef4444', fontSize: 20 }}>☠️</Text>
      </View>
    );
  };

  // ===== IMINASHI Functions =====

  const checkIminashi = (text: string): boolean => {
    const trimmed = text.trim();
    const elapsed = Date.now() - actionStartTimeRef.current;

    // Check 1: Too short
    if (trimmed.length < 5) {
      triggerIminashi();
      return true;
    }

    // Check 2: Same as last input
    if (trimmed === lastUserInputRef.current && trimmed.length > 0) {
      triggerIminashi();
      return true;
    }

    // Check 3: Completed too fast (under 3 seconds)
    if (elapsed <= 3000) {
      triggerIminashi();
      return true;
    }

    lastUserInputRef.current = trimmed;
    return false;
  };

  const triggerIminashi = () => {
    const msg = IMINASHI_MESSAGES[Math.floor(Math.random() * IMINASHI_MESSAGES.length)];
    setIminashiMessage(msg);
    setIsIminashiActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const clearIminashi = () => {
    setIsIminashiActive(false);
    setIminashiMessage('');
    showSaveSuccess('虚無が霧散した');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startActionTimer = () => {
    actionStartTimeRef.current = Date.now();
  };

  // ===== Kegare Functions =====
  const checkKegare = async () => {
    try {
      const json = await AsyncStorage.getItem(KEGARE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (json) {
        const data = JSON.parse(json);
        if (data.lastDate === today) {
          setShowKatanaPolish(false);
          return;
        }
        
        const lastDate = new Date(data.lastDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          setLoginStreak((data.streak || 0) + 1);
          setPolishRequired(3);
        } else if (diffDays <= 3) {
          setLoginStreak(1);
          setPolishRequired(5);
        } else if (diffDays <= 7) {
          setLoginStreak(1);
          setPolishRequired(8);
        } else {
          setLoginStreak(1);
          setPolishRequired(12);
        }
      } else {
        setLoginStreak(1);
        setPolishRequired(5);
      }
      
      setPolishCount(0);
      setPolishComplete(false);
      setShowKatanaPolish(true);
      setKegareQuote(KEGARE_QUOTES[Math.floor(Math.random() * KEGARE_QUOTES.length)]);
    } catch (e) {
      console.log('Kegare check error', e);
    }
  };

  const handlePolish = async () => {
    if (polishComplete) return;
    
    const newCount = polishCount + 1;
    setPolishCount(newCount);
    
    try {
      const { sound } = await Audio.Sound.createAsync(SFX_POLISH);
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {}
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(katanaScaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(katanaScaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    
    if (newCount >= polishRequired) {
      setPolishComplete(true);
      
      try {
        const { sound } = await Audio.Sound.createAsync(SFX_KATANA_SHINE);
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s: any) => {
          if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
        });
      } catch (e) {}
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(katanaGlowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(katanaGlowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
      
      const streakXp = loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5;
      await addXpWithLevelCheck(streakXp);
      
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(KEGARE_KEY, JSON.stringify({
        lastDate: today,
        streak: loginStreak,
      }));
    }
  };

  const dismissKatanaPolish = () => {
    setShowKatanaPolish(false);
    katanaGlowAnim.setValue(0);
    katanaScaleAnim.setValue(1);
  };

  // ===== Yokai Encounter Functions =====
  const triggerYokaiDefeat = (feature: YokaiFeature, xpGain: number) => {
    // Use the yokai that was showing on the tab (deterministic)
    const tabYokai = getTabYokai(feature);
    const pool = YOKAI_LIST.filter(y => y.features.includes(feature));
    if (pool.length === 0) return;
    const yokai = tabYokai || pool[Math.floor(Math.random() * pool.length)];
    markYokaiDefeated(yokai.id);
    setYokaiEncounter(yokai);
    setYokaiPhase('appear');
    setYokaiXp(xpGain);
    setYokaiFeature(feature);
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };


  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 500);
    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
      addXpWithLevelCheck(yokaiXp);
    }, 1500);
  };


  const closeYokaiModal = () => {
    setYokaiEncounter(null);
    setYokaiPhase(null);
    setYokaiXp(0);
    yokaiShakeAnim.setValue(0);
  };

  // ===== Stats Functions =====
  const saveStats = async (stats: any, allocated: boolean, realloc: string | null) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
        stats, allocated, lastRealloc: realloc
      }));
    } catch (e) { console.log('Stats save error', e); }
  };

  const confirmStatsAllocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    setSamuraiStats(tempStats);
    setStatsAllocated(true);
    setShowStatsAlloc(false);
    await saveStats(tempStats, true, lastRealloc);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('武士の器、定まれり');
  };

  const canReallocate = () => {
    if (!lastRealloc) return true;
    const last = new Date(lastRealloc);
    const now = new Date();
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  };

  const startReallocation = () => {
    if (!canReallocate()) {
      showSaveSuccess('月に一度のみ再配分可能');
      return;
    }
    setTempStats({...samuraiStats});
    setShowReallocModal(true);
  };

  const confirmReallocation = async () => {
    const total = tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue;
    if (total !== 300) return;
    if (tempStats.power < 20 || tempStats.mind < 20 || tempStats.skill < 20 || tempStats.virtue < 20) return;
    const diff = Math.abs(tempStats.power - samuraiStats.power) + Math.abs(tempStats.mind - samuraiStats.mind) + Math.abs(tempStats.skill - samuraiStats.skill) + Math.abs(tempStats.virtue - samuraiStats.virtue);
    if (diff > reallocBudget * 2) {
      showSaveSuccess('最大' + reallocBudget + 'ポイントまで');
      return;
    }
    const now = new Date().toISOString();
    setSamuraiStats(tempStats);
    setLastRealloc(now);
    setShowReallocModal(false);
    await saveStats(tempStats, true, now);
    playCorrectSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSaveSuccess('過去は変えられぬ。だが、解釈は変えられる');
  };

  const adjustTempStat = (key: 'power' | 'mind' | 'skill' | 'virtue', delta: number) => {
    const newVal = tempStats[key] + delta;
    if (newVal < 20 || newVal > 100) return;
    const others = Object.entries(tempStats).filter(([k]) => k !== key).reduce((s, [, v]) => s + v, 0);
    if (others + newVal > 300) return;
    setTempStats(prev => ({...prev, [key]: newVal}));
  };

  // ===== Battle System Functions =====
  const getAvailableEnemies = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const lv = Math.max(1, levelInfo.level);
    return ENEMIES.filter(e => lv >= e.minLv && lv <= e.maxLv);
  };

  const shakeAnimation = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const startBattle = (enemy: any) => {
    setBattleEnemy(enemy);
    setBattleMode('fighting');
    setPlayerHp(100);
    setEnemyHp(100);
    setBattleTurnLog([]);
    setBattleResult(null);
    setBattleAnimating(false);
    setBattleXpGained(0);
    setTab('battle');
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const executeBattleTurn = async () => {
    if (battleAnimating || !battleEnemy) return;
    setBattleAnimating(true);

    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const levelInfo = getLevelFromXp(totalXp);
    const playerLevel = Math.max(1, levelInfo.level);

    const playerAtk = playerLevel * 8 + Math.floor(samuraiStats.power * 0.3) + Math.floor(Math.random() * 15) + 5;
    const enemyAtk = battleEnemy.power * 0.7 + Math.floor(Math.random() * battleEnemy.power * 0.4);

    const dmgToEnemy = Math.max(8, Math.round(playerAtk - battleEnemy.power * 0.2));
    const dmgToPlayer = Math.max(5, Math.round(enemyAtk - playerLevel * 2));

    shakeAnimation(battleShakeAnim);

    const newEnemyHp = Math.max(0, enemyHp - dmgToEnemy);
    setEnemyHp(newEnemyHp);

    const turnText = '⚔️ ' + dmgToEnemy + 'ダメージ！';
    setBattleTurnLog(prev => [...prev, turnText]);

    setTimeout(() => {
      shakeAnimation(playerShakeAnim);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newPlayerHp = Math.max(0, playerHp - dmgToPlayer);
      setPlayerHp(newPlayerHp);

      const enemyTurnText = '🔥 ' + battleEnemy.name + 'の反撃！ ' + dmgToPlayer + 'ダメージ';
      setBattleTurnLog(prev => [...prev, enemyTurnText]);

      if (newEnemyHp <= 0) {
        setBattleResult('win');
        setBattleMode('result');
        const baseXp = battleEnemy.isBoss ? 50 : 25;
        const streakBonus = battleWinStreak >= 5 ? 25 : battleWinStreak >= 3 ? 15 : battleWinStreak >= 1 ? 5 : 0;
        const totalGain = baseXp + streakBonus;
        setBattleXpGained(totalGain);
        setBattleQuote(BATTLE_WIN_QUOTES[Math.floor(Math.random() * BATTLE_WIN_QUOTES.length)]);
        setBattleWinStreak(prev => prev + 1);
        addXpWithLevelCheck(totalGain);
        playWinSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (newPlayerHp <= 0) {
        setBattleResult('lose');
        setBattleMode('result');
        setBattleXpGained(5);
        setBattleQuote(BATTLE_LOSE_QUOTES[Math.floor(Math.random() * BATTLE_LOSE_QUOTES.length)]);
        setBattleWinStreak(0);
        addXpWithLevelCheck(5);
        playFailSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setBattleAnimating(false);
    }, 800);
  };

  const renderBattleTab = () => {
    const levelInfo = getLevelFromXp(totalXp);

    const YOKAI_MISSIONS: { [key: string]: { mission: string; tab: YokaiFeature; action: string } } = {
      mikkabozu: { mission: '今日の目標を書け', tab: 'goal', action: '目標タブで目標を保存する' },
      hyakume: { mission: '10分以上集中しろ', tab: 'focus', action: '集中タイマーを完了する' },
      deebu: { mission: '目標を立てて動け', tab: 'goal', action: '目標タブで目標を保存する' },
      atodeyaru: { mission: '今すぐ目標を書け', tab: 'goal', action: '目標タブで目標を保存する' },
      scroll: { mission: 'SNSをやめて集中しろ', tab: 'focus', action: '集中タイマーを完了する' },
      tetsuya: { mission: '明日のアラームをセットしろ', tab: 'alarm', action: 'アラームをセットする' },
      nidoneel: { mission: '明日ちゃんと起きろ', tab: 'alarm', action: 'アラームを解除する' },
      hikakuzou: { mission: '感謝を３つ以上書け', tab: 'gratitude', action: '感謝を３つ以上書く' },
      peeping: { mission: '自分のことに感謝しろ', tab: 'gratitude', action: '感謝を３つ以上書く' },
      mottemiteya: { mission: '他人じゃなく自分を見ろ', tab: 'gratitude', action: '感謝を３つ以上書く' },
      moumuri: { mission: '相談してミッションをこなせ', tab: 'consult', action: '相談ミッションを完了する' },
      atamadekkachi: { mission: '振り返りを書け', tab: 'review', action: '振り返りを保存する' },
    };

    return (
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('menu'); setTab('innerWorld'); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={{ color: '#888', fontSize: 16 }}>← 修行の間</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: '900' }}>⚔️ 修行対戦 ⚔️</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>妖怪を選んでミッションをこなせ</Text>
        </View>

        {YOKAI_LIST.map((yokai) => {
          const mission = YOKAI_MISSIONS[yokai.id];
          const isDefeated = defeatedYokaiToday.includes(yokai.id);
          if (!mission) return null;
          return (
            <Pressable
              key={yokai.id}
              onPress={() => {
                if (isDefeated) {
                  showSaveSuccess('この妖怪は今日倒した');
                  return;
                }
                playTapSound();
                setTab(mission.tab === 'consult' ? 'consult' : mission.tab as any);
                setShowStartScreen(false);
              }}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDefeated ? '#0a1a0a' : (pressed ? '#1a0808' : '#0a0a1a'),
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: isDefeated ? '#1a3a1a' : '#8B0000',
                opacity: isDefeated ? 0.5 : 1,
              }]}
            >
              <View style={{
                width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
                borderWidth: 2, borderColor: isDefeated ? '#1a3a1a' : '#8B0000',
                backgroundColor: '#0a0a0a', marginRight: 14,
              }}>
                <Image
                  source={isDefeated ? YOKAI_LOSE_IMAGES[yokai.id] : YOKAI_IMAGES[yokai.id]}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: isDefeated ? '#4a4a4a' : '#ccc', fontSize: 15, fontWeight: '800' }}>{yokai.name}</Text>
                  {isDefeated && <Text style={{ color: '#2a6a2a', fontSize: 11, marginLeft: 8, fontWeight: '700' }}>✓ 討伐済</Text>}
                </View>
                <Text style={{ color: isDefeated ? '#333' : '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                  {isDefeated ? '─' : mission.mission}
                </Text>
                <Text style={{ color: '#444', fontSize: 10, marginTop: 2 }}>
                  {isDefeated ? '' : mission.action}
                </Text>
              </View>
              {!isDefeated && <Text style={{ color: '#555', fontSize: 18 }}>›</Text>}
            </Pressable>
          );
        })}

        {defeatedYokaiToday.length > 0 && (
          <Text style={{ color: '#D4AF37', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
            🔥 今日の討伐: {defeatedYokaiToday.length} / {YOKAI_LIST.length}
          </Text>
        )}
      </ScrollView>
    );
  };

  const renderCharacterTab = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const characterImage = CHARACTER_IMAGES[Math.max(1, Math.min(10, levelInfo.level))] || CHARACTER_IMAGES[1];
    
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          サムライ育成
        </Text>
        
        {/* キャラクター画像 */}
        <View style={{ 
          width: 250, 
          height: 250, 
          borderRadius: 20, 
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: '#D4AF37',
          marginVertical: 20,
          backgroundColor: '#1a1a2e',
        }}>
          <Image 
            source={characterImage} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        
        {/* レベルと称号 */}
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
          Lv.{levelInfo.level}
        </Text>
        <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '600', marginTop: 4 }}>
          {levelInfo.title}
        </Text>
        
        {/* EXPバー */}
        <View style={{ width: '100%', marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#888', fontSize: 14 }}>EXP</Text>
            <Text style={{ color: '#888', fontSize: 14 }}>
              {levelInfo.level >= 10 ? 'MAX' : `${levelInfo.xpInLevel} / ${levelInfo.xpForLevel}`}
            </Text>
          </View>
          <View style={{ 
            height: 12, 
            backgroundColor: '#333', 
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            <View style={{ 
              height: '100%', 
              width: `${levelInfo.progress * 100}%`,
              backgroundColor: '#D4AF37',
              borderRadius: 6,
            }} />
          </View>
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            総EXP: {totalXp}
          </Text>
        </View>
        
        {/* ステータス表示 */}
        <View style={{ marginTop: 28, width: '100%', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700' }}>武士の器</Text>
            {statsAllocated && canReallocate() && (
              <Pressable onPress={startReallocation}>
                <Text style={{ color: '#888', fontSize: 12 }}>再配分</Text>
              </Pressable>
            )}
          </View>
          
          {!statsAllocated && levelInfo.level >= 1 ? (
            <Pressable
              onPress={() => { setTempStats({power: 75, mind: 75, skill: 75, virtue: 75}); setShowStatsAlloc(true); playTapSound(); }}
              style={{ backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>ステータスを配分する</Text>
              <Text style={{ color: '#333', fontSize: 12, marginTop: 4 }}>300ポイントを自由に配分</Text>
            </Pressable>
          ) : statsAllocated ? (
            <View>
              {[
                {key: 'power', label: '力', color: '#ef4444', icon: '⚔️'},
                {key: 'mind', label: '心', color: '#3b82f6', icon: '🧘'},
                {key: 'skill', label: '技', color: '#22c55e', icon: '🎯'},
                {key: 'virtue', label: '徳', color: '#a855f7', icon: '✨'},
              ].map(stat => (
                <View key={stat.key} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>
                      {stat.icon} {stat.label}
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 15, fontWeight: 'bold' }}>
                      {samuraiStats[stat.key as keyof typeof samuraiStats]}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: samuraiStats[stat.key as keyof typeof samuraiStats] + '%', backgroundColor: stat.color, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
              <Text style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                合計: {samuraiStats.power + samuraiStats.mind + samuraiStats.skill + samuraiStats.virtue} / 300
              </Text>
            </View>
          ) : (
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Lv.1で解放</Text>
          )}
        </View>

        {/* レベル別解放要素 */}
        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 12, width: '100%' }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            解放済み能力
          </Text>
          {[
            { lv: 1, label: 'サムライ相談', icon: '💬' },
            { lv: 1, label: 'ステータス配分', icon: '📊' },
            { lv: 2, label: 'サムライミッション', icon: '🎯' },
            { lv: 3, label: '修行対戦', icon: '⚔️' },
            { lv: 3, label: '鬼コーチモード', icon: '🔥' },
            { lv: 5, label: 'サムライアラーム', icon: '⏰' },
            { lv: 7, label: 'ドラゴンボス挑戦', icon: '🐉' },
            { lv: 9, label: '覚醒の扉', icon: '🌊' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, width: 28 }}>{item.icon}</Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#ccc' : '#444', fontSize: 14, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ color: levelInfo.level >= item.lv ? '#22c55e' : '#555', fontSize: 12 }}>
                {levelInfo.level >= item.lv ? '✅' : 'Lv.' + item.lv}
              </Text>
            </View>
          ))}
          {levelInfo.level < 10 && (
            <Text style={{ color: '#555', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
              次のレベルまで: {levelInfo.nextLevelXp - totalXp} XP
            </Text>
          )}
        </View>
        
        {/* 進化プレビュー */}
        {levelInfo.level < 10 && (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>次の姿</Text>
            <View style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#333',
              opacity: 0.5,
            }}>
              <Image 
                source={CHARACTER_IMAGES[Math.min(10, levelInfo.level + 1)]} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
              {LEVEL_TITLES[levelInfo.level + 1]}
            </Text>
          </View>
        )}

        {/* Battle Arena Section */}
        {(isPro || levelInfo.level >= 3) && (
          <View style={{ marginTop: 32, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#8B0000', fontSize: 16, fontWeight: '900', marginHorizontal: 12 }}>☠️ 対戦場 ☠️</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {getAvailableEnemies().map((enemy) => (
                <Pressable
                  key={enemy.id}
                  onPress={() => startBattle(enemy)}
                  style={({ pressed }) => [{
                    width: '48%',
                    backgroundColor: pressed ? '#2a0a0a' : '#0a0a1a',
                    borderRadius: 14,
                    padding: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: enemy.isBoss ? '#8B0000' : '#222',
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View style={{
                    width: 70, height: 70, borderRadius: 12, overflow: 'hidden',
                    borderWidth: 2, borderColor: enemy.isBoss ? '#8B0000' : '#333',
                    backgroundColor: '#0a0a0a',
                  }}>
                    <Image source={enemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </View>
                  {enemy.isBoss && (
                    <Text style={{ color: '#8B0000', fontSize: 9, fontWeight: '900', marginTop: 4 }}>👹 BOSS</Text>
                  )}
                  <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{enemy.name}</Text>
                  <Text style={{ color: '#555', fontSize: 9, fontStyle: 'italic', marginTop: 2, textAlign: 'center' }} numberOfLines={1}>
                    「{enemy.quote}」
                  </Text>
                </Pressable>
              ))}
            </View>

            {battleWinStreak > 0 && (
              <Text style={{ color: '#D4AF37', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                🔥 {battleWinStreak}連勝中
              </Text>
            )}
          </View>
        )}

        {!isPro && levelInfo.level < 3 && (
          <View style={{ marginTop: 32, width: '100%', alignItems: 'center', opacity: 0.4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#555', fontSize: 14, marginHorizontal: 12 }}>☠️ 対戦場 ☠️</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>
            <Text style={{ color: '#555', fontSize: 13 }}>🔒 Lv.3「足軽」で解放</Text>
          </View>
        )}

      </ScrollView>
    );
  };




  // ===== Ritual Tutorial =====
  const [tutorialPhase, setTutorialPhase] = useState<number | null>(null);

  // ============================================================
  // === MIKKABOZU EVENT / STORY + MISSION SYSTEM ===
  // ============================================================
  const SCREEN_W = Dimensions.get('window').width;
  const SCREEN_H = Dimensions.get('window').height;
  const [mikkabozuEventDone, setMikkabozuEventDone] = useState(false);
  const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);
  const [atodeyaruEventDone, setAtodeyaruEventDone] = useState(false);
  const [atodeyaruActive, setAtodeyaruActive] = useState(false);
  const [storyStage, setStoryStage] = useState<number>(1);
  const [deebuEventDone, setDeebuEventDone] = useState(false);
  const [deebuActive, setDeebuActive] = useState(false);
  const [deebuBattleOpen, setDeebuBattleOpen] = useState(false);
  const [deebuPhase, setDeebuPhase] = useState<'menu'|'train_select'|'training'|'photo'|'reason'|'done'>('menu');
  const [deebuHits, setDeebuHits] = useState(0);
  const [deebuTrainingType, setDeebuTrainingType] = useState<string|null>(null);
  const [deebuTrainingDone, setDeebuTrainingDone] = useState(false);
  const [deebuPhotoDone, setDeebuPhotoDone] = useState(false);
  const [deebuPhotoUri, setDeebuPhotoUri] = useState<string|null>(null);
  const [deebuReason, setDeebuReason] = useState('');
  const deebuShakeAnim = useRef(new Animated.Value(0)).current;
  const [deebuFlash, setDeebuFlash] = useState(false);
  const [moumuriEventDone, setMoumuriEventDone] = useState(false);
  const [moumuriActive, setMoumuriActive] = useState(false);
  const [moumuriBO, setMoumuriBO] = useState(false);
  const [moumuriPhase, setMoumuriPhase] = useState<'menu'|'zen'|'kansha'|'done'>('menu');
  const [moumuriZenText, setMoumuriZenText] = useState('');
  const [moumuriZenDone, setMoumuriZenDone] = useState(false);
  const [moumuriKanshaList, setMoumuriKanshaList] = useState<string[]>([]);
  const [moumuriKanshaInput, setMoumuriKanshaInput] = useState('');
  const moumuriShakeAnim = useRef(new Animated.Value(0)).current;
  const [moumuriFlash, setMoumuriFlash] = useState(false);
  const [mk2EventDone, setMk2EventDone] = useState(false);
  const [mk2Active, setMk2Active] = useState(false);
  const [mk2BO, setMk2BO] = useState(false);
  const [mk2Phase, setMk2Phase] = useState<string>('menu');
  const [mk2Day, setMk2Day] = useState(1);
  const [mk2Done, setMk2Done] = useState<string[]>([]);
  const [mk2CM, setMk2CM] = useState('');
  const [mk2WasReset, setMk2WasReset] = useState(false);
  const [mk2TextVal, setMk2TextVal] = useState('');
  const [mk2ListItems, setMk2ListItems] = useState<string[]>([]);
  const [mk2ListInput, setMk2ListInput] = useState('');
  const [mk2Hits, setMk2Hits] = useState(0);
  const [mk2TT, setMk2TT] = useState<string|null>(null);
  const [mk2PhotoUri, setMk2PhotoUri] = useState<string|null>(null);
  const [mk2ReasonVal, setMk2ReasonVal] = useState('');
  const [mk2FocusLeft, setMk2FocusLeft] = useState(30);
  const mk2Shake = useRef(new Animated.Value(0)).current;
  const [mk2Flash, setMk2Flash] = useState(false);
  const endingSilhouetteOp = useRef(new Animated.Value(0)).current;
  const endingStarted = useRef(false);
  const endingSounds = useRef<any[]>([]);
  const endingTimers = useRef<any[]>([]);
  const endingActive = useRef(false);
  const endingW1Op = useRef(new Animated.Value(0)).current;
  const endingW2Op = useRef(new Animated.Value(0)).current;
  const [mk2SamuraiReply, setMk2SamuraiReply] = useState('');
  const [mk2ConsultLoading, setMk2ConsultLoading] = useState(false);
  const [dayCount, setDayCount] = useState(0);
  const [storyActive, setStoryActive] = useState(false);
  const monsterBgmRef = useRef<any>(null);
  const [storyPhase, setStoryPhase] = useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'|'ending1'|'ending2'|'ending3'|'ending4'>('dark');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [storyTypeText, setStoryTypeText] = useState('');
  const [storyTypingDone, setStoryTypingDone] = useState(false);
  const [missionCount, setMissionCount] = useState(0);
  const [storyOverlayOpacity] = useState(new Animated.Value(0));
  const [storyEyesOpacity] = useState(new Animated.Value(0));
  const [samuraiVoice, setSamuraiVoice] = useState('');
  const [selectedMission, setSelectedMission] = useState<string|null>(null);
  const [sqIdx, setSqIdx] = useState(0);
  const [sqScore, setSqScore] = useState(0);
  const [sqAnswered, setSqAnswered] = useState(false);
  const [sqCorrect, setSqCorrect] = useState(false);
















  const getSqQ = () => {
    const qs = SQ_DATA[selectedMission || 'english'] || SQ_DATA.english;
    return qs[sqIdx] || qs[0];
  };

  const playVoice = async (voiceAsset: any, volume: number = 1.0) => {
    try {
      const { sound } = await Audio.Sound.createAsync(voiceAsset);
      await sound.setVolumeAsync(Math.min(volume, MASTER_VOLUME));
      await sound.playAsync();
    } catch(e) {}
  };

  const playRandomScream = async () => {
    try {
      const asset = SCREAM_VOICES[Math.floor(Math.random() * SCREAM_VOICES.length)];
      await playVoice(asset, 0.7);
    } catch(e) {}
  };

  const speakMikkabozu = async (text: string) => {
    try {
      if (!settings.autoVoice) return;
      const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.setRateAsync(1.8, false);
      await sound.playAsync();
    } catch(e) { console.log('mikkabozu voice error', e); }
  };

  const storyTypewriter = (text: string, onDone?: () => void) => {
    let i = 0;
    setStoryTypeText('');
    setStoryTypingDone(false);
    const interval = setInterval(() => {
      i++;
      setStoryTypeText(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setStoryTypingDone(true);
        if (onDone) onDone();
      }
    }, 80);
  };

  const samuraiSpeak = (text: string) => {
    let i = 0;
    setSamuraiVoice('');
    const interval = setInterval(() => {
      i++;
      setSamuraiVoice(text.substring(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 100);
  };

  const checkMikkabozuEvent = async () => {
    try {
      // TEMP_TEST
      setTimeout(() => startStoryEvent(), 500); return;
      const done = await AsyncStorage.getItem(MIKKABOZU_EVENT_KEY);
      if (done === 'true') { setMikkabozuEventDone(true); setInnerWorldUnlocked(true); return; }
      const today = new Date().toISOString().split('T')[0];
      const firstOpen = await AsyncStorage.getItem(FIRST_OPEN_DATE_KEY);
      if (!firstOpen) {
        await AsyncStorage.setItem(FIRST_OPEN_DATE_KEY, today);
        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, '1');
        await AsyncStorage.setItem('last_open_date', today);
        setDayCount(1); return;
      }
      const storedCount = await AsyncStorage.getItem(MIKKABOZU_DAY_KEY);
      let count = parseInt(storedCount || '1', 10);
      const lastDay = await AsyncStorage.getItem('last_open_date');
      if (lastDay !== today) {
        count += 1;
        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, String(count));
        await AsyncStorage.setItem('last_open_date', today);
      }
      setDayCount(count);
      if (count >= 3) { setTimeout(() => startStoryEvent(), 1000); }
    } catch (e) { console.log('Mikkabozu check error:', e); }
  };

  const startStoryEvent = () => {
    setStoryStage(1);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(STORY_SCENES[0].text);
      Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MK_APPEAR), 1500);
    }, 5000);
  };

  const advanceScene = () => {
    const scenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    if (!storyTypingDone) { setStoryTypeText(scenes[sceneIndex].text); setStoryTypingDone(true); return; }
    const next = sceneIndex + 1;
    if (storyStage === 1 && next === 4) { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('どう挑む？'); return; }
    if (storyStage === 2 && next === 4) { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('missionBrief'); return; }
    if (storyStage === 3 && next === 4) { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('missionBrief'); return; }
    if (storyStage === 4 && next === 4) { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('missionBrief'); return; }
    if (storyStage === 5 && next === 4) { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('missionBrief'); return; }
    if (next >= scenes.length) { setStoryPhase('clear'); return; }
    setSceneIndex(next); setSamuraiVoice(''); storyTypewriter(scenes[next].text);
  };

  const selectMission = (missionId: string) => {
    setSelectedMission(missionId);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    if (['pushup','squat','situp'].includes(missionId)) {
      setMissionCount(0); setStoryPhase('mission');
      const label = PHYSICAL_MISSIONS.find(m => m.id === missionId)?.label || '';
      samuraiSpeak(label + '、やれ。');
    } else {
      setSqIdx(0); setSqScore(0); setSqAnswered(false); setSqCorrect(false);
      setStoryPhase('quiz'); samuraiSpeak('頭を使え。');
    }
  };

  const missionCompletingRef = useRef(false);
  const onMissionComplete = async () => {
    if (missionCompletingRef.current) return;
    missionCompletingRef.current = true;
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(50);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_MK_DEFEAT); }, 1500);
  };

  const countMissionTap = async () => {
    const next = missionCount + 1; setMissionCount(next);
    if (next % 3 === 0) playRandomScream();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    if (next >= MISSION_TARGET) { await onMissionComplete(); }
    else { try { const { sound } = await Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {} }
  };

  const answerQuiz = (choiceIndex: number) => {
    if (sqAnswered) return;
    setSqAnswered(true);
    const q = getSqQ();
    const correct = q.answer === choiceIndex;
    setSqCorrect(correct);
    if (correct) { setSqScore(sqScore + 1); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {} try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {} }
    else { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e) {} }
    setTimeout(() => { if (sqIdx + 1 >= SQ_TOTAL) { onMissionComplete(); } else { setSqIdx(sqIdx + 1); setSqAnswered(false); setSqCorrect(false); } }, 1200);
  };

  const advanceVictoryScene = () => {
    const scenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    if (!storyTypingDone) { setStoryTypeText(scenes[sceneIndex].text); setStoryTypingDone(true); return; }
    if (sceneIndex === 4) { setSceneIndex(5); setSamuraiVoice(''); storyTypewriter(scenes[5].text); return; }
    setStoryPhase('clear');
  };

  const completeStoryEvent = async () => {
    if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; }
    if (storyStage === 5) {
      try { await AsyncStorage.setItem(MK2_EVENT_KEY, 'true'); } catch(e) {}
      setMk2EventDone(true);
    } else if (storyStage === 4) {
      try { await AsyncStorage.setItem(MOUMURI_EVENT_KEY, 'true'); } catch(e) {}
      setMoumuriEventDone(true);
    } else if (storyStage === 3) {
      try { await AsyncStorage.setItem(DEEBU_EVENT_KEY, 'true'); } catch(e) {}
      setDeebuEventDone(true);
    } else if (storyStage === 2) {
      try { await AsyncStorage.setItem(ATODEYARU_EVENT_KEY, 'true'); } catch(e) {}
      setAtodeyaruEventDone(true);
    } else {
      try { await AsyncStorage.setItem(MIKKABOZU_EVENT_KEY, 'true'); } catch(e) {}
      setMikkabozuEventDone(true);
    }
    setInnerWorldUnlocked(true); setStoryActive(false);
    setStoryPhase('dark'); storyOverlayOpacity.setValue(0); storyEyesOpacity.setValue(0);
    setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice(''); setMissionCount(0);
  };
  // === ATODEYARU EVENT / STAGE 2 ===
  const startAtodeyaruEvent = () => {
    setStoryStage(2);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(ATODEYARU_SCENES[0].text);
      Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_ATO_APPEAR), 1500);
    }, 5000);
  };

  const triggerAtodeyaruDefeat = async () => {
    setStoryStage(2);
    setAtodeyaruActive(false);
    try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(50);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_ATO_DEFEAT); }, 1500);
  };

  const checkAtodeyaruCondition = (logs: DailyLog[]) => {
    if (!atodeyaruActive) return;
    const today = getTodayStr();
    const todayLog = logs.find(l => l.date === today);
    if (!todayLog) return;
    const routineTotal = todayLog.routines.length;
    const routineDoneCount = (todayLog.routineDone || []).length;
    const routineHalf = Math.ceil(routineTotal / 2);
    if (routineTotal === 0 && todayLog.todos.length === 0) return;
    const routineOk = routineTotal === 0 || routineDoneCount >= routineHalf;
    const todoOk = todayLog.todos.length === 0 || todayLog.todos.every(t => t.done);
    if (routineOk && todoOk) { triggerAtodeyaruDefeat(); }
  };
  // === DEEBU EVENT / STAGE 3 ===
  const startDeebuEvent = () => {
    setStoryStage(3);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(DEEBU_SCENES[0].text);
      Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_DEEBU_APPEAR), 1500);
    }, 5000);
  };

  const openDeebuBattle = () => {
    playTapSound();
    setDeebuBattleOpen(true);
    setDeebuPhase(deebuTrainingDone && deebuPhotoDone ? 'done' : 'menu');
  };

  const deebuDefeatingRef = useRef(false);
  const triggerDeebuDefeat = async () => {
    if (deebuDefeatingRef.current) return;
    deebuDefeatingRef.current = true;
    setStoryStage(3);
    setDeebuActive(false); setDeebuBattleOpen(false);
    try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(50);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_DEEBU_DEFEAT); }, 1500);
  };

  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    if (next % 4 === 0) playRandomScream();
    setDeebuFlash(true); setTimeout(() => setDeebuFlash(false), 150);
    Animated.sequence([
      Animated.timing(deebuShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    if (next >= DEEBU_HIT_TARGET) {
      setDeebuTrainingDone(true);
      setTimeout(() => { if (deebuPhotoDone) { setDeebuPhase('done'); } else { setDeebuPhase('menu'); } }, 800);
    }
  };

  const deebuPickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]) { setDeebuPhotoUri(result.assets[0].uri); setDeebuPhase('reason'); }
    } catch(e) { console.log('deebu photo error', e); }
  };

  const deebuTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled && result.assets?.[0]) { setDeebuPhotoUri(result.assets[0].uri); setDeebuPhase('reason'); }
    } catch(e) { console.log('deebu camera error', e); }
  };

  const deebuSubmitReason = () => {
    if (!deebuReason.trim()) return;
    playTapSound();
    setDeebuPhotoDone(true);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    if (deebuTrainingDone) { setDeebuPhase('done'); } else { setDeebuPhase('menu'); showSaveSuccess('\u6b32\u671b\u65ad\u3061\u5207\u308a\uff01\u3042\u3068\u306f\u7b4b\u30c8\u30ec\u3060\uff01'); }
  };
  // === END DEEBU EVENT ===

  // === MOUMURI EVENT / STAGE 4 ===
  const startMoumuriEvent = () => {
    setStoryStage(4);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(MOUMURI_SCENES[0].text);
      Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MOUMURI_APPEAR), 1500);
    }, 5000);
  };

  const openMoumuriBattle = () => {
    playTapSound();
    setMoumuriBO(true);
    setMoumuriPhase(moumuriZenDone && moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 'done' : 'menu');
  };

  const moumuriDefeatingRef = useRef(false);
  const triggerMoumuriDefeat = async () => {
    if (moumuriDefeatingRef.current) return;
    moumuriDefeatingRef.current = true;
    setStoryStage(4);
    setMoumuriActive(false); setMoumuriBO(false);
    try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(50);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_MOUMURI_DEFEAT); }, 1500);
  };

  const moumuriSubmitZen = () => {
    if (!moumuriZenText.trim()) return;
    playTapSound();
    setMoumuriZenDone(true);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    if (moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET) { setMoumuriPhase('done'); }
    else { setMoumuriPhase('menu'); showSaveSuccess('\u4e00\u65e5\u4e00\u5584\u9054\u6210\uff01\u3042\u3068\u306f\u611f\u8b1d\u3060\uff01'); }
  };

  const moumuriAddKansha = () => {
    if (!moumuriKanshaInput.trim()) return;
    const next = [...moumuriKanshaList, moumuriKanshaInput.trim()];
    setMoumuriKanshaList(next);
    setMoumuriKanshaInput('');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    setMoumuriFlash(true); setTimeout(() => setMoumuriFlash(false), 150);
    Animated.sequence([
      Animated.timing(moumuriShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(moumuriShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(moumuriShakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(moumuriShakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(moumuriShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    if (next.length >= MOUMURI_KANSHA_TARGET) {
      if (moumuriZenDone) { setTimeout(() => setMoumuriPhase('done'), 800); }
      else { setTimeout(() => { setMoumuriPhase('menu'); showSaveSuccess('\u611f\u8b1d10\u500b\u9054\u6210\uff01\u3042\u3068\u306f\u4e00\u65e5\u4e00\u5584\uff01'); }, 800); }
    }
  };
  // === END MOUMURI EVENT ===

  // === MK2 EVENT / STAGE 5 ===
  const mk2LocalDate = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const mk2Yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };

  const startMk2Event = () => {
    setStoryStage(5);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(MK2_SCENES[0].text);
      Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MK2_APPEAR), 1500);
    }, 5000);
  };

  const openMk2Battle = async () => {
    playTapSound();
    let raw = null; try { raw = await AsyncStorage.getItem(MK2_PROGRESS_KEY); } catch(e) {}
    const prog = raw ? JSON.parse(raw) : { day1: null, day2: null, day3: null };
    const today = mk2LocalDate(); const yday = mk2Yesterday();
    setMk2Done([]); setMk2TextVal(''); setMk2ListItems([]); setMk2ListInput(''); setMk2Hits(0); setMk2PhotoUri(null); setMk2ReasonVal(''); setMk2FocusLeft(5); setMk2WasReset(false);
    if (prog.day3) { setMk2Day(3); setMk2Phase('done'); }
    else if (prog.day2) {
      if (prog.day2 === today) { setMk2Day(2); setMk2Phase('day_clear'); }
      else if (prog.day2 === yday) { setMk2Day(3); setMk2Phase('menu'); }
      else { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); setMk2Day(1); setMk2Phase('menu'); setMk2WasReset(true); }
    } else if (prog.day1) {
      if (prog.day1 === today) { setMk2Day(1); setMk2Phase('day_clear'); }
      else if (prog.day1 === yday) { setMk2Day(2); setMk2Phase('menu'); }
      else { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); setMk2Day(1); setMk2Phase('menu'); setMk2WasReset(true); }
    } else { setMk2Day(1); setMk2Phase('menu'); }
    setMk2BO(true);
  };

  const mk2CompleteDay = async () => {
    const today = mk2LocalDate();
    let raw = null; try { raw = await AsyncStorage.getItem(MK2_PROGRESS_KEY); } catch(e) {}
    const prog = raw ? JSON.parse(raw) : { day1: null, day2: null, day3: null };
    if (mk2Day === 1) prog.day1 = today;
    else if (mk2Day === 2) prog.day2 = today;
    else if (mk2Day === 3) prog.day3 = today;
    try { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify(prog)); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    // TEST MODE: defeat immediately
    triggerMk2Defeat();
  };

  const mk2DefeatingRef = useRef(false);
  const triggerMk2Defeat = async () => {
    if (mk2DefeatingRef.current) return;
    mk2DefeatingRef.current = true;
    setStoryStage(5); setMk2Active(false); setMk2BO(false);
    try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(100);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_MK2_DEFEAT); }, 1500);
  };

  const mk2SubmitText = async () => {
    if (!mk2TextVal.trim()) return;
    playTapSound();
    // Save to dailyLogs
    const tagMap: { [k: string]: string } = { goal: '\u76ee\u6a19', alarm: '\u65e9\u8d77\u304d', consult: '\u76f8\u8ac7', diary: '\u65e5\u8a18' };
    const tag = tagMap[mk2CM] || mk2CM;
    const deedText = '\u3010' + tag + '\u3011' + mk2TextVal.trim();
    upsertTodayLog(prev => ({
      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],
      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,
      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],
      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deedText],
    }));
    // Consult: send to samurai king
    if (mk2CM === 'consult') {
      setMk2ConsultLoading(true); setMk2SamuraiReply('');
      setMk2Phase('mk2_consult_reply');
      try {
        const reply = await callSamuraiKing(mk2TextVal.trim());
        setMk2SamuraiReply(reply);
      } catch(e) {
        setMk2SamuraiReply('\u901a\u4fe1\u30a8\u30e9\u30fc\u3067\u3054\u3056\u308b\u3002\u3057\u304b\u3057\u60a9\u307f\u3092\u66f8\u3044\u305f\u3053\u3068\u306f\u7acb\u6d3e\u3067\u3054\u3056\u308b\u3002');
      }
      setMk2ConsultLoading(false);
      return;
    }
    // Other text missions: complete immediately
    setMk2Done(prev => [...prev, mk2CM]);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    setMk2TextVal(''); setMk2Phase('menu');
  };

  const mk2AddListItem = () => {
    if (!mk2ListInput.trim()) return;
    const itemText = mk2ListInput.trim();
    const next = [...mk2ListItems, itemText];
    setMk2ListItems(next); setMk2ListInput('');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    // Save to dailyLogs
    const listTag = mk2CM === 'kansha' ? '\u611f\u8b1d' : '\u5584\u884c';
    const deed = '\u3010' + listTag + '\u3011' + itemText;
    upsertTodayLog(prev => ({
      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],
      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,
      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],
      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deed],
    }));
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    mk2DamageEffect();
    const target = MK2_LIST_CFG[mk2CM]?.target || 10;
    if (next.length >= target) {
      setMk2Done(prev => [...prev, mk2CM]);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      setTimeout(() => { setMk2Phase('menu'); setMk2ListItems([]); }, 800);
    }
  };

  const mk2DamageEffect = () => {
    setMk2Flash(true); setTimeout(() => setMk2Flash(false), 150);
    Animated.sequence([
      Animated.timing(mk2Shake, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(mk2Shake, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(mk2Shake, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(mk2Shake, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(mk2Shake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
  };

  const mk2TrainTap = () => {
    const next = mk2Hits + 1; setMk2Hits(next);
    if (next % 4 === 0) playRandomScream();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    mk2DamageEffect();
    const target = mk2CM === 'training3' ? 5 : 3;
    if (next >= target) {
      setMk2Done(prev => [...prev, mk2CM]);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      setTimeout(() => { setMk2Phase('menu'); setMk2Hits(0); }, 800);
    }
  };

  const mk2PickPhoto = async () => {
    try { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 }); if (!r.canceled && r.assets?.[0]) { setMk2PhotoUri(r.assets[0].uri); setMk2Phase('mk2_reason'); } } catch(e) {}
  };
  const mk2TakePhoto = async () => {
    try { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ quality: 0.7 }); if (!r.canceled && r.assets?.[0]) { setMk2PhotoUri(r.assets[0].uri); setMk2Phase('mk2_reason'); } } catch(e) {}
  };
  const mk2SubmitReason = () => {
    if (!mk2ReasonVal.trim()) return; playTapSound();
    setMk2Done(prev => [...prev, 'photo']); setMk2ReasonVal(''); setMk2Phase('menu');
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
  };

  const mk2StartFocus = () => {
    let sec = 5; setMk2FocusLeft(5);
    const id = setInterval(() => {
      sec--; setMk2FocusLeft(sec);
      if (sec <= 0) {
        clearInterval(id);
        setMk2Done(prev => [...prev, 'focus']);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
        mk2DamageEffect();
      }
    }, 1000);
  };
  // === END MK2 EVENT ===

  // === END ATODEYARU EVENT ===

  // === END MIKKABOZU EVENT ===
  const [tutorialDone, setTutorialDone] = useState(false);
  const tutorialShadowAnim = useRef(new Animated.Value(0)).current;
  // ===== IMINASHI (Anti-cheat Yokai) =====
  const [isIminashiActive, setIsIminashiActive] = useState(false);
  const [iminashiMessage, setIminashiMessage] = useState('');
  const lastUserInputRef = useRef('');
  const actionStartTimeRef = useRef(Date.now());
  // ===== Inner World (修行の間) =====
  const renderInnerWorldTab = () => {
    const levelInfo = getLevelFromXp(totalXp);

    if (innerWorldView === 'stageMap') {
      const W1_STAGES = [
        { id: 1, name: '三日坊主', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.75 },
        { id: 2, name: 'アトデヤル', icon: NODE_KATANA, cleared: atodeyaruEventDone, x: 0.3, y: 0.60 },
        { id: 3, name: 'デーブ', icon: NODE_SCROLL, cleared: deebuEventDone, x: 0.6, y: 0.47 },
        { id: 4, name: 'モウムリ', icon: NODE_BRAIN, cleared: moumuriEventDone, x: 0.35, y: 0.34 },
        { id: 5, name: '三日坊主II', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },
      ];
      return (
        <ImageBackground source={WORLD1_BG} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: '#DAA520', fontSize: 13, fontWeight: '900', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6 }}>WORLD 1</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6, marginTop: 2 }}>{'「目覚め」'}</Text>
          </View>
          {W1_STAGES.map((stage) => {
            const isNext = !stage.cleared && W1_STAGES.filter(s => s.id < stage.id).every(s => s.cleared);
            const isLocked = !stage.cleared && !isNext;
            return (
              <Pressable key={stage.id} onPress={() => { playTapSound(); if (stage.cleared && stage.id === 1) { startStoryEvent(); } else if (stage.cleared && stage.id === 2) { startAtodeyaruEvent(); } else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (stage.cleared && stage.id === 3) { startDeebuEvent(); } else if (isNext && stage.id === 3) { startDeebuEvent(); } else if (stage.cleared && stage.id === 4) { startMoumuriEvent(); } else if (isNext && stage.id === 4) { startMoumuriEvent(); } else if (stage.cleared && stage.id === 5) { startMk2Event(); } else if (isNext && stage.id === 5) { startMk2Event(); } else if (isNext) showSaveSuccess('近日実装'); else showSaveSuccess('前のステージをクリア'); }} style={{ position: 'absolute', left: SCREEN_W * stage.x - 35, top: SCREEN_H * stage.y - 35, alignItems: 'center', opacity: isLocked ? 0.4 : 1 }}>
                <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#555', overflow: 'hidden', backgroundColor: '#000' }}>
                  <Image source={isLocked ? NODE_LOCKED : stage.icon} style={{ width: '100%', height: '100%' }} resizeMode='contain' />
                </View>
                <Text style={{ color: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#888', fontSize: 11, fontWeight: '900', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 4 }}>{stage.id + '. ' + stage.name}</Text>
                {stage.cleared && <Text style={{ color: '#DAA520', fontSize: 9, fontWeight: 'bold' }}>{'✔ CLEAR'}</Text>}
                {stage.id === 5 && <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', marginTop: 1 }}>BOSS</Text>}
              </Pressable>
            );
          })}
        </ImageBackground>
      );
    }

    if (innerWorldView === 'yokaiDex') {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ color: '#888', fontSize: 16 }}>← 修行の間</Text>
          </Pressable>

          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20 }}>👹 妖怪図鑑</Text>

          <ScrollView>
            {YOKAI_LIST.map((yokai) => (
              <View key={yokai.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0a0a1a',
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#222',
              }}>
                <View style={{
                  width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
                  borderWidth: 2, borderColor: '#333', backgroundColor: '#0a0a0a', marginRight: 14,
                }}>
                  <Image source={YOKAI_IMAGES[yokai.id]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#ccc', fontSize: 16, fontWeight: '700' }}>{yokai.name}</Text>
                  <Text style={{ color: '#555', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>
                    「{yokai.quote}」
                  </Text>
                  <Text style={{ color: '#444', fontSize: 10, marginTop: 4 }}>
                    {yokai.features.map((f: string) => (
                      f === 'consult' ? '相談' : f === 'gratitude' ? '感謝' : f === 'goal' ? '目標' : f === 'review' ? '振り返り' : f === 'focus' ? '集中' : 'アラーム'
                    )).join(' / ')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 10 }}>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: '900', letterSpacing: 4 }}>── 修行の間 ──</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Lv.{levelInfo.level} {LEVEL_TITLES[levelInfo.level]}</Text>
        </View>

        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('stageMap'); }}
          style={({ pressed }) => [{ backgroundColor: pressed ? '#0a1a0a' : '#0a0a1a', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#DAA520' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>{'⚔️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900' }}>{'ステージマップ'}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{'World 1 「目覚め」'}</Text>
            </View>
            <Text style={{ color: '#DAA520', fontSize: 18 }}>{'›'}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3「足軽」で解放');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#1a0808' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: (isPro || levelInfo.level >= 3) ? '#8B0000' : '#222',
            opacity: (isPro || levelInfo.level >= 3) ? 1 : 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>⚔️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: (isPro || levelInfo.level >= 3) ? '#ef4444' : '#555', fontSize: 18, fontWeight: '900' }}>修行対戦</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{(isPro || levelInfo.level >= 3) ? '敵と戦い、己を磨け' : '🔒 Lv.3で解放'}</Text>
            </View>
            {(isPro || levelInfo.level >= 3) && <Text style={{ color: '#555', fontSize: 18 }}>›</Text>}
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('yokaiDex'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#333',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>👹</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ccc', fontSize: 18, fontWeight: '900' }}>妖怪図鑑</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>出会った妖怪たち</Text>
            </View>
            <Text style={{ color: '#555', fontSize: 18 }}>›</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); setTab('character'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#333',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>🧑‍🎓</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ccc', fontSize: 18, fontWeight: '900' }}>育成</Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>ステータス・レベル確認</Text>
            </View>
            <Text style={{ color: '#555', fontSize: 18 }}>›</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); showSaveSuccess('Lv.9以降 解放予定'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#222',
            opacity: 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>🐉</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 18, fontWeight: '900' }}>覚醒</Text>
              <Text style={{ color: '#444', fontSize: 11, marginTop: 2 }}>🔒 Lv.9以降 解放予定</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { playTapSound(); showSaveSuccess('近日実装'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a0a18' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#222',
            opacity: 0.4,
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>📜</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 18, fontWeight: '900' }}>戦歴</Text>
              <Text style={{ color: '#444', fontSize: 11, marginTop: 2 }}>近日実装</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    );
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
          onPress={async () => {
            playTapSound();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (!alarmSet) {
              // アラームをセット：通知をスケジュール
              const now = new Date();
              let triggerDate = new Date();
              triggerDate.setHours(alarmHour, alarmMinute, 0, 0);
              
              // 設定時刻が過去なら翌日に
              if (triggerDate <= now) {
                triggerDate.setDate(triggerDate.getDate() + 1);
              }
              
              // 既存の通知をキャンセル
              if (alarmNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(alarmNotificationId);
              }
              
              // 新しい通知をスケジュール
              const notifId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: '⚔️ サムライキング参上',
                  body: `起きろ！${alarmMission}を撮影して目を覚ませ！`,
                  sound: true,
                  data: { type: 'wakeup_alarm' },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: triggerDate,
                },
              });
              setAlarmNotificationId(notifId);
              setAlarmSet(true);
              Alert.alert('アラーム設定完了', 
                alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\n撮影場所：' + alarmMission);
            } else {
              // アラームを解除
              if (alarmNotificationId) {
                await Notifications.cancelScheduledNotificationAsync(alarmNotificationId);
                setAlarmNotificationId(null);
              }
              setAlarmSet(false);
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
              markMissionStarted(); // サムライミッション開始判定
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
                markMissionStarted(); // サムライミッション開始判定
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

  const renderOnboarding = () => {
    // Step 1: Welcome（思想のみ）
    if (onboardingStep === 1) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingTitle}>
              漢は、考えすぎると動けなくなる。
            </Text>
            <Text style={styles.newOnboardingTitle}>
              ブシログは、"一歩だけ"を決めるアプリだ。
            </Text>
            <Text style={styles.newOnboardingSubtext}>
              説教しない。監視しない。逃げ道は残す。
            </Text>
          </View>
          <Pressable 
            style={styles.newOnboardingButton} 
            onPress={() => { playTapSound(); setOnboardingStep(2); }}
          >
            <Text style={styles.newOnboardingButtonText}>次へ</Text>
          </Pressable>
        </View>
      );
    }

    // Step 2: 使い方の本質
    if (onboardingStep === 2) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingTitle}>迷ったら、相談する。</Text>
            <Text style={styles.newOnboardingTitle}>決めたら、ミッションにする。</Text>
            <Text style={styles.newOnboardingTitle}>やったら、強くなる。</Text>
            <Text style={styles.newOnboardingSubtext}>
              全部、1〜3分で終わる。
            </Text>
          </View>
          <Pressable 
            style={styles.newOnboardingButton} 
            onPress={() => { playTapSound(); setOnboardingStep(3); }}
          >
            <Text style={styles.newOnboardingButtonText}>わかった</Text>
          </Pressable>
        </View>
      );
    }

    // Step 3: 始め方の選択
    if (onboardingStep === 3) {
      return (
        <View style={styles.newOnboardingContainer}>
          <View style={styles.newOnboardingContent}>
            <Text style={styles.newOnboardingQuestion}>どう始める？</Text>
          </View>
          <View style={styles.newOnboardingChoices}>
            <Pressable 
              style={styles.newOnboardingPrimaryChoice} 
              onPress={() => { 
                playTapSound(); 
                setUserStartChoice('free');
                setOnboardingStep(4); 
              }}
            >
              <Text style={styles.newOnboardingChoiceTitle}>まずは無料で試す</Text>
              <Text style={styles.newOnboardingChoiceSub}>3日間、すべての機能を使える</Text>
            </Pressable>
            
            <Pressable 
              style={styles.newOnboardingSecondaryChoice} 
              onPress={() => { 
                playTapSound(); 
                setUserStartChoice('serious');
                setOnboardingStep(4); 
              }}
            >
              <Text style={styles.newOnboardingChoiceTitle2}>最初から本気でいく</Text>
              <Text style={styles.newOnboardingChoiceSub2}>Proモード・鬼コーチ解放</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Step 4: 分岐画面
    if (onboardingStep === 4) {
      if (userStartChoice === 'serious') {
        // 本気を選んだ人
        return (
          <View style={styles.newOnboardingContainer}>
            <View style={styles.newOnboardingContent}>
              <Text style={styles.newOnboardingTitle}>Proモードでは、</Text>
              <Text style={styles.newOnboardingTitle}>相談は無制限。</Text>
              <Text style={styles.newOnboardingTitle}>鬼コーチが選べる。</Text>
              <Text style={styles.newOnboardingTitle}>制限は、なくなる。</Text>
              <Text style={styles.newOnboardingSubtext}>
                いつでも解約できる。
              </Text>
            </View>
            <Pressable 
              style={styles.newOnboardingButton} 
              onPress={async () => { 
                playTapSound();
                await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, choice: 'serious' }));
                setIsOnboarding(false);
                setShowPaywall(true); // Paywall表示
              }}
            >
              <Text style={styles.newOnboardingButtonText}>Proで始める</Text>
            </Pressable>
          </View>
        );
      } else {
        // 無料を選んだ人
        return (
          <View style={styles.newOnboardingContainer}>
            <View style={styles.newOnboardingContent}>
              <Text style={styles.newOnboardingTitle}>3日間、すべて解放する。</Text>
              <Text style={styles.newOnboardingTitle}>合わなければ、消していい。</Text>
            </View>
            <Pressable 
              style={styles.newOnboardingButton} 
              onPress={async () => { 
                playTapSound();
                // 3日間トライアル開始
                const trialStart = new Date().toISOString();
                await AsyncStorage.setItem(FIRST_LAUNCH_KEY, trialStart);
                await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, choice: 'free' }));
                setIsOnboarding(false);
              }}
            >
              <Text style={styles.newOnboardingButtonText}>無料で始める</Text>
            </Pressable>
          </View>
        );
      }
    }

    return null;
  };

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

  // === Story Overlay ===
  if (storyActive) {
    const currentScenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    const currentScene = currentScenes[sceneIndex] || currentScenes[0];
    const sceneImg = storyStage === 5
      ? (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG)
      : storyStage === 4
      ? (currentScene.img === 2 ? MOUMURI_SCENE2_IMG : MOUMURI_SCENE1_IMG)
      : storyStage === 3
      ? (currentScene.img === 2 ? DEEBU_SCENE2_IMG : DEEBU_SCENE1_IMG)
      : storyStage === 2
        ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)
        : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);
    const sqQ = getSqQ();
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Animated.View style={{ flex: 1, opacity: storyOverlayOpacity }}>

          {storyPhase === 'dark' && (<View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#555', fontSize: 14 }}>{'…'}</Text></View>)}

          {storyPhase === 'eyes' && (<View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Animated.View style={{ opacity: storyEyesOpacity }}><Image source={MIKKABOZU_EYES} style={{ width: 200, height: 200, resizeMode: 'contain' }} /></Animated.View></View>)}

          {storyPhase === 'scenes' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceScene} style={{ flex: 1 }}>
              <ImageBackground source={sceneImg} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: storyStage >= 3 ? SCREEN_H * 0.46 : SCREEN_H * 0.50, left: storyStage >= 3 ? 70 : 55, right: storyStage >= 3 ? 70 : 55, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: storyStage >= 3 ? 15 : 17, fontWeight: 'bold', textAlign: 'center', lineHeight: storyStage >= 3 ? 24 : 28, letterSpacing: 1 }}>{storyTypeText}</Text>
                </View>
                {storyTypingDone && (<View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'タップして次へ'}</Text></View>)}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {storyPhase === 'missionSelect' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'三日坊主'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'ミッションを選べ'}</Text>
              <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'⚔️ 体を動かす'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                {PHYSICAL_MISSIONS.map((m) => (<TouchableOpacity key={m.id} onPress={() => selectMission(m.id)} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text><Text style={{ color: '#DAA520', fontSize: 11, marginTop: 4 }}>{m.count + '回'}</Text></TouchableOpacity>))}
              </View>
              <Text style={{ color: '#4FC3F7', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'✏️ 頭を使う'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                {SQ_MISSIONS.map((m) => (<TouchableOpacity key={m.id} onPress={() => selectMission(m.id)} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text><Text style={{ color: '#4FC3F7', fontSize: 11, marginTop: 4 }}>{SQ_TOTAL + '問'}</Text></TouchableOpacity>))}
              </View>
              {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 80, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}
            </View>
          )}

          {storyPhase === 'missionBrief' && storyStage === 5 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode="contain" />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4e09\u65e5\u574a\u4e3bII'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\u6700\u7d42\u6c7a\u6226'}</Text>
              <View style={{ backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>
                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\u{1f525} 3\u65e5\u9593\u9023\u7d9a\u3067\u5168\u30df\u30c3\u30b7\u30e7\u30f3\u9054\u6210'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 8 }}>
                <Text style={{ color: '#DAA520', fontSize: 13, textAlign: 'center' }}>{'DAY1: \u76ee\u6a19 + \u65e9\u8d77\u304d + \u7b4b\u30c8\u30ec30 + \u6b32\u671b\u65ad\u3061'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 8 }}>
                <Text style={{ color: '#4FC3F7', fontSize: 13, textAlign: 'center' }}>{'DAY2: \u96c6\u4e2d + \u76f8\u8ac7 + \u611f\u8b1d15 + \u4e09\u5584'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(155,89,182,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 16 }}>
                <Text style={{ color: '#c39bd3', fontSize: 13, textAlign: 'center' }}>{'DAY3: \u65e5\u8a18 + \u30eb\u30fc\u30c6\u30a3\u30f3\u5168 + TODO\u5168 + \u7b4b\u30c8\u30ec50'}</Text>
              </View>
              <Text style={{ color: '#e74c3c', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>{'\u203b 1\u65e5\u3067\u3082\u30b5\u30dc\u308b\u3068\u30ea\u30bb\u30c3\u30c8'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setMk2Active(true); try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'true'); await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); } catch(e) {} }} style={{ backgroundColor: 'rgba(231,76,60,0.2)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u53d7\u3051\u3066\u7acb\u3064'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'missionBrief' && storyStage === 4 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Image source={YOKAI_IMAGES.moumuri} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode="contain" />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30e2\u30a6\u30e0\u30ea'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\u2694\uFE0F \u4e00\u65e5\u4e00\u5584\u3092\u8a18\u9332\u305b\u3088'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 }}>
                <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\u{1f64f} \u611f\u8b1d\u309210\u500b\u66f8\u3051'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>{'\u30e2\u30a6\u30e0\u30ea\u3092\u30bf\u30c3\u30d7\u3057\u3066\u6311\u6226\u958b\u59cb'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setMoumuriActive(true); setMoumuriZenText(''); setMoumuriZenDone(false); setMoumuriKanshaList([]); setMoumuriKanshaInput(''); try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'missionBrief' && storyStage === 3 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Image source={YOKAI_IMAGES.deebu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode="contain" />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30c7\u30fc\u30d6'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\u2694\uFE0F \u7b4b\u30c8\u30ec20\u56de\u3067\u653b\u6483'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 }}>
                <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\u{1f4f8} \u6b32\u671b\u3092\u65ad\u3061\u5207\u308c'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>{'\u30c7\u30fc\u30d6\u3092\u30bf\u30c3\u30d7\u3057\u3066\u6311\u6226\u958b\u59cb'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setDeebuActive(true); setDeebuHits(0); setDeebuTrainingDone(false); setDeebuPhotoDone(false); setDeebuPhotoUri(null); setDeebuReason(''); try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'missionBrief' && storyStage === 2 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30a2\u30c8\u30c7\u30e4\u30eb'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>
                <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{'今日のルーティンを半分こなし\nTODOを全て完了せよ'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\u6761\u4ef6\u3092\u9054\u6210\u3059\u308b\u3068\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10\u3067\u304d\u308b'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setAtodeyaruActive(true); try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'mission' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'三日坊主'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{'⚔️ ' + (PHYSICAL_MISSIONS.find(m => m.id === selectedMission)?.label || '') + ' ' + MISSION_TARGET + '回で討伐！'}</Text>
              <Text style={{ color: '#fff', fontSize: 72, fontWeight: '900', marginBottom: 6 }}>{missionCount}</Text>
              <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{missionCount + ' / ' + MISSION_TARGET}</Text>
              {missionCount < MISSION_TARGET ? (
                <TouchableOpacity onPress={countMissionTap} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 24, fontWeight: '900' }}>{'押せ'}</Text>
                </TouchableOpacity>
              ) : (<Text style={{ color: '#DAA520', fontSize: 22, fontWeight: '900', letterSpacing: 3 }}>{'討伐完了'}</Text>)}
              {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 100, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}
            </View>
          )}

          {storyPhase === 'quiz' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
              <Text style={{ color: '#4FC3F7', fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>{SQ_MISSIONS.find(m => m.id === (selectedMission || 'english'))?.label || ''}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'Q' + (sqIdx + 1) + ' / ' + SQ_TOTAL}</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{sqQ.q}</Text>
              </View>
              {sqQ.choices.map((choice: string, idx: number) => (
                <TouchableOpacity key={idx} onPress={() => answerQuiz(idx)} disabled={sqAnswered} style={{ backgroundColor: sqAnswered && idx === sqQ.answer ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: sqAnswered && idx === sqQ.answer ? '#2ecc71' : 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 10, width: '100%' }}>
                  <Text style={{ color: sqAnswered && idx === sqQ.answer ? '#2ecc71' : '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>{choice}</Text>
                </TouchableOpacity>
              ))}
              {sqAnswered && (<Text style={{ color: sqCorrect ? '#2ecc71' : '#e74c3c', fontSize: 22, fontWeight: '900', marginTop: 10, letterSpacing: 2 }}>{sqCorrect ? '⭕ 正解！' : '❌ 不正解'}</Text>)}
              <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'center' }}>
                {Array.from({ length: SQ_TOTAL }).map((_, i) => (<View key={i} style={{ width: 12, height: 12, borderRadius: 6, marginHorizontal: 4, backgroundColor: i < sqIdx ? '#2ecc71' : i === sqIdx ? '#4FC3F7' : '#333' }} />))}
              </View>
            </View>
          )}

          {storyPhase === 'defeat' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Video source={storyStage === 5 ? MIKKABOZU_DEFEAT_VIDEO : storyStage === 4 ? MOUMURI_DEFEAT_VIDEO : storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO} style={{ width: 300, height: 300 }} resizeMode={ResizeMode.CONTAIN} shouldPlay isLooping={false} onPlaybackStatusUpdate={(status: any) => { if (status.didJustFinish) { const sc = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES; setSceneIndex(4); setSamuraiVoice(''); setStoryPhase('victory'); storyTypewriter(sc[4].text); } }} />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', marginTop: 16, letterSpacing: 3 }}>{'討伐！'}</Text>
            </View>
          )}

          {storyPhase === 'victory' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceVictoryScene} style={{ flex: 1 }}>
              <ImageBackground source={storyStage === 5 ? STORY_SCENE2_IMG : storyStage === 4 ? MOUMURI_SCENE2_IMG : storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: SCREEN_H * 0.50, left: 55, right: 55, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>{storyTypeText}</Text>
                </View>
                {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 120, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}
                {storyTypingDone && (<View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'タップして次へ'}</Text></View>)}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {storyPhase === 'ending1' && (
            <Pressable onPress={() => { if (storyTypingDone && !endingStarted.current) {
              endingStarted.current = true;
              endingW1Op.setValue(0);
              setStoryPhase('ending2');
              Animated.timing(endingW1Op, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
              Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => { sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); }).catch(e => {});
              setTimeout(() => {
                setStoryTypeText(''); setStoryTypingDone(false);
                setStoryPhase('ending3');
                endingSilhouetteOp.setValue(0);
                endingActive.current = true;
                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2500));
                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 5500));
                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return;
                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
                  Audio.Sound.createAsync(SFX_TETSUYA_APPEAR).then(({sound}) => { sound.setVolumeAsync(0.8).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 10000); }).catch(e => {});
                }, 7500));
                endingTimers.current.push(setTimeout(() => { if (!endingActive.current) return; playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\n三日坊主を倒したか。\n\nだが、夜はまだ長い。\n俺はテツヤ。\n\nお前が寝ない限り、\n俺は消えない。\n\n……楽しみにしてろ。'); }, 9500));
              }, 6000);
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Text style={{ color: '#DAA520', fontSize: 20, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 34 }}>{storyTypeText}</Text>
              {storyTypingDone && (
                <Text style={{ color: '#555', fontSize: 12, marginTop: 40 }}>{'タップで次へ'}</Text>
              )}
            </Pressable>
          )}

          {storyPhase === 'ending2' && (
            <ImageBackground source={ENDING_W1_COMPLETE_BG} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} resizeMode="cover">
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)' }} />
              <Animated.View style={{ opacity: endingW1Op, alignItems: 'center' }}>
                <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 5, marginBottom: 12 }}>{'WORLD 1'}</Text>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 6, marginBottom: 16 }}>{'COMPLETE'}</Text>
                <View style={{ width: 60, height: 2, backgroundColor: '#DAA520', marginBottom: 16 }} />
                <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 2 }}>{'── 三日坊主殺し ──'}</Text>
              </Animated.View>
            </ImageBackground>
          )}

          {storyPhase === 'ending3' && (
            <Pressable onPress={() => { if (storyTypingDone) {
              endingActive.current = false;
              endingTimers.current.forEach(t => clearTimeout(t)); endingTimers.current = [];
              endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = [];
              endingW2Op.setValue(0);
              setStoryPhase('ending4');
              Animated.timing(endingW2Op, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Animated.Image source={TETSUYA_SILHOUETTE} style={{ width: 200, height: 200, opacity: endingSilhouetteOp, marginBottom: 30 }} resizeMode="contain" />
              <Text style={{ color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 30 }}>{storyTypeText}</Text>
              {storyTypingDone && (
                <Text style={{ color: '#555', fontSize: 12, marginTop: 40 }}>{'タップで次へ'}</Text>
              )}
            </Pressable>
          )}

          {storyPhase === 'ending4' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <Animated.View style={{ opacity: endingW2Op, alignItems: 'center' }}>
                <Text style={{ color: '#9b59b6', fontSize: 14, letterSpacing: 5, marginBottom: 12 }}>{'WORLD 2'}</Text>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 30, textAlign: 'center' }}>{'── 夜の支配者 ──'}</Text>
                <Text style={{ color: '#888', fontSize: 15, letterSpacing: 2, marginTop: 16, fontStyle: 'italic' }}>{'「逃げるなよ。」'}</Text>
              </Animated.View>
              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 40, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'修行の間へ'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'clear' && (
            <ImageBackground source={storyStage === 5 ? ENDING_CLEAR_BG : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} resizeMode="cover">
              {storyStage === 5 && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />}
              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>WORLD 1</Text>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 4, marginBottom: 12, textAlign: 'center' }}>{storyStage === 5 ? 'FINAL STAGE CLEAR' : storyStage === 4 ? 'STAGE 4 CLEAR' : storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}</Text>
              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{storyStage === 5 ? '三日坊主IIを討伐' : storyStage === 4 ? 'モウムリを討伐' : storyStage === 3 ? 'デーブを討伐' : storyStage === 2 ? 'アトデヤルを討伐' : '三日坊主を討伐'}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>+50 XP</Text>
              <TouchableOpacity onPress={() => { if (storyStage === 5) { endingStarted.current = false; endingStarted.current = false; endingActive.current = false; endingTimers.current.forEach(t => clearTimeout(t)); endingTimers.current = []; endingSounds.current.forEach(s => { try { s.stopAsync(); s.unloadAsync(); } catch(e) {} }); endingSounds.current = []; if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('ending1'); setTimeout(() => storyTypewriter('三日。\nたった三日。\n\n「どうせ続かない」\n「お前には無理だ」\n「また明日でいい」\n\n全部、斬った。\n\nお前は──侍だ。'), 800); } else { completeStoryEvent(); } }} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{storyStage === 5 ? '次へ' : '修行の間へ'}</Text>
              </TouchableOpacity>
            </ImageBackground>
          )}

        </Animated.View>
      </View>
    );
  }

  // スタート画面表示（オンボーディング完了後）
  if (showStartScreen && !isOnboarding) {
    return (
      <>
        {renderStartScreen()}


      {/* Ritual Tutorial */}
      {tutorialPhase !== null && (
        <Modal visible={true} animationType="fade" transparent={tutorialPhase === 3}>

          {/* Phase 0: Silent opening */}
          {tutorialPhase === 0 && (
            <Pressable
              onPress={() => advanceTutorial(1)}
              style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}
            >
              <Image
                source={require('./assets/icon.png')}
                style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 40, opacity: 0.8 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '700', letterSpacing: 2 }}>
                ここは、修行の場だ
              </Text>
            </Pressable>
          )}

          {/* Phase 1: First action */}
          {tutorialPhase === 1 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginBottom: 16 }}>
                ── サムライキング ──
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 40, lineHeight: 36 }}>
                まずは、今日を刻め
              </Text>

              <Pressable
                onPress={() => {
                  advanceTutorial(2);
                }}
                style={({ pressed }) => [{
                  backgroundColor: pressed ? '#1a8a6a' : '#2dd4a8',
                  paddingVertical: 22,
                  paddingHorizontal: 60,
                  borderRadius: 16,
                  marginBottom: 30,
                }]}
              >
                <Text style={{ color: '#000', fontSize: 20, fontWeight: '900' }}>
                  今日の目標を書く
                </Text>
              </Pressable>

              <Pressable onPress={skipTutorial} style={{ padding: 12 }}>
                <Text style={{ color: '#444', fontSize: 13 }}>
                  今はいい
                </Text>
              </Pressable>
            </View>
          )}

          {/* Phase 2: Go to goal tab */}
          {tutorialPhase === 2 && (
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
              <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 30, lineHeight: 30 }}>
                目標を書いて保存すると{"\n"}妖怪が倒れる
              </Text>
              <Pressable
                onPress={() => {
                  setTutorialPhase(null);
                  setShowStartScreen(false);
                  setTab('goal');
                  // After goal save, tutorial will continue
                  setTimeout(() => {
                    if (tutorialPhase === null && !tutorialDone) {
                      setTutorialPhase(3);
                    }
                  }, 30000);
                }}
                style={({ pressed }) => [{
                  backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                  paddingVertical: 18,
                  paddingHorizontal: 50,
                  borderRadius: 14,
                }]}
              >
                <Text style={{ color: '#000', fontSize: 18, fontWeight: '900' }}>
                  目標タブへ
                </Text>
              </Pressable>
            </View>
          )}

          {/* Phase 3: Shadow flicker (transparent overlay) */}
          {tutorialPhase === 3 && (
            <Pressable
              onPress={() => advanceTutorial(4)}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
              <Animated.View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#0a0a0a',
                opacity: tutorialShadowAnim,
              }} />
            </Pressable>
          )}

          {/* Phase 4: Inner world hint */}
          {tutorialPhase === 4 && (
            <Pressable
              onPress={() => advanceTutorial(5)}
              style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 }}
            >
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginBottom: 16 }}>
                ── サムライキング ──
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 40 }}>
                修行には、表と裏がある
              </Text>
              <View style={{
                borderWidth: 1, borderColor: '#D4AF37', borderRadius: 20, padding: 3,
                shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15,
              }}>
                <Image
                  source={require('./assets/icon.png')}
                  style={{ width: 80, height: 80, borderRadius: 18, opacity: 0.9 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ color: '#555', fontSize: 12, marginTop: 20 }}>
                タップで続ける
              </Text>
            </Pressable>
          )}

        </Modal>
      )}

      {/* IMINASHI Overlay */}
      {isIminashiActive && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.92)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
            <Text style={{ color: '#444', fontSize: 60, marginBottom: 20 }}>🌫️</Text>
            <Text style={{ color: '#666', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
              ── イミナシ ──
            </Text>
            <Text style={{ color: '#888', fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginBottom: 30, lineHeight: 28 }}>
              「{iminashiMessage}」
            </Text>
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
              XPは得られなかった{"\n"}もう一度、真剣に向き合え
            </Text>
            <Pressable
              onPress={clearIminashi}
              style={({ pressed }) => [{
                backgroundColor: pressed ? '#222' : '#1a1a1a',
                paddingVertical: 16,
                paddingHorizontal: 40,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#333',
              }]}
            >
              <Text style={{ color: '#888', fontSize: 16, fontWeight: '600' }}>ズルしても意味ないぞ</Text>
            </Pressable>
          </View>
        </Modal>
      )}

      {/* Katana Polishing Modal */}
      {showKatanaPolish && (
        <Modal visible={true} animationType="fade" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            
            <Text style={{ color: '#8B0000', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
              ── 刀の手入れ ──
            </Text>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', marginBottom: 24 }}>
              {polishComplete ? '磨き上げ完了' : '刃を磨け'}
            </Text>
            
            <Pressable
              onPress={handlePolish}
              disabled={polishComplete}
              style={{ alignItems: 'center' }}
            >
              <Animated.View style={{
                transform: [{ scale: katanaScaleAnim }],
                opacity: katanaGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                }),
              }}>
                <Animated.View style={{
                  shadowColor: '#D4AF37',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: katanaGlowAnim,
                  shadowRadius: 30,
                }}>
                  <Image
                    source={polishComplete ? KATANA_CLEAN : KATANA_RUSTY}
                    style={{ width: 280, height: 280 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>

            {!polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{ width: 200, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{
                    height: '100%',
                    width: (polishCount / polishRequired * 100) + '%',
                    backgroundColor: '#D4AF37',
                    borderRadius: 4,
                  }} />
                </View>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
                  {polishCount} / {polishRequired}
                </Text>
                <Text style={{ color: '#444', fontSize: 12, marginTop: 16 }}>
                  刀をタップして磨け
                </Text>
              </View>
            )}

            {polishComplete && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <View style={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  width: '100%',
                  borderLeftWidth: 3,
                  borderLeftColor: '#D4AF37',
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: 12, marginBottom: 4 }}>サムライキングの言葉</Text>
                  <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic' }}>
                    「{kegareQuote}」
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold' }}>
                    +{loginStreak >= 7 ? 20 : loginStreak >= 3 ? 10 : 5} XP
                  </Text>
                </View>

                {loginStreak > 1 && (
                  <Text style={{ color: '#f59e0b', fontSize: 14, marginBottom: 16 }}>
                    🔥 {loginStreak}日連続ログイン！
                  </Text>
                )}

                <Pressable
                  onPress={dismissKatanaPolish}
                  style={({ pressed }) => [{
                    backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                    paddingVertical: 18,
                    paddingHorizontal: 50,
                    borderRadius: 14,
                  }]}
                >
                  <Text style={{ color: '#000', fontSize: 18, fontWeight: '900' }}>道場へ</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>
      )}


      </>
    );
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
                <Pressable
                  onPress={() => {
                    playTapSound();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const levelInfo = getLevelFromXp(totalXp);
                    if (levelInfo.level >= 1) {
                      setTab('character');
                    } else {
                      showSaveSuccess('修行の成果は、やがて姿を持つ');
                    }
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }], alignItems: 'center' }]}
                >
                  <Animated.View style={{ 
                    opacity: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
                    transform: [{ scale: logoGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
                    shadowColor: getLevelFromXp(totalXp).level >= 1 ? '#D4AF37' : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: getLevelFromXp(totalXp).level >= 1 ? 0.8 : 0,
                    shadowRadius: 10,
                  }}>
                    <Image source={require('./assets/icon.png')} style={styles.headerIcon} />
                  </Animated.View>
                </Pressable>
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
                      {tab === 'alarm' && ((isPro || getLevelFromXp(totalXp).level >= 5) ? renderAlarmTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
                          <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>サムライアラーム</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.5「若侍」で解放</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>修行を積み、己を磨け</Text>
                        </View>
                      ))}
                      {tab === 'gratitude' && renderGratitudeTab()}
                      {tab === 'settings' && renderSettingsTab()}
                      {tab === 'innerWorld' && renderInnerWorldTab()}
                      {tab === 'character' && renderCharacterTab()}
                      {tab === 'battle' && ((isPro || getLevelFromXp(totalXp).level >= 3) ? renderBattleTab() : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
                          <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>修行対戦</Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Lv.3「足軽」で解放</Text>
                          <Text style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center' }}>まずは修行を積め</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </>
            )}
          </View>
      </KeyboardAvoidingView>

      {/* Floating MK2 */}
      {mk2Active && !storyActive && (
        <Pressable onPress={openMk2Battle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#e74c3c' }}>
          <Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode="contain" />
          <Text style={{ color: '#ff6b6b', fontSize: 9, fontWeight: '900', marginTop: 3 }}>{'\u4e09\u65e5\u574a\u4e3bII'}</Text>
          <View style={{ backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\u6700\u7d42\u6c7a\u6226'}</Text>
          </View>
        </Pressable>
      )}

      {/* MK2 Battle Modal */}
      {mk2BO && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setMk2BO(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\u4e09\u65e5\u574a\u4e3bII'}</Text>
                <View style={{ width: 50 }} />
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              {/* Day tabs */}
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {[1,2,3].map(d => (
                  <View key={d} style={{ flex: 1, marginHorizontal: 3, backgroundColor: mk2Day === d ? (d === 1 ? 'rgba(218,165,32,0.2)' : d === 2 ? 'rgba(79,195,247,0.2)' : 'rgba(155,89,182,0.2)') : '#111', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: mk2Day === d ? 2 : 1, borderColor: mk2Day === d ? (d === 1 ? '#DAA520' : d === 2 ? '#4FC3F7' : '#9b59b6') : '#333' }}>
                    <Text style={{ color: mk2Day === d ? '#fff' : '#555', fontSize: 12, fontWeight: '900' }}>{'DAY ' + d}</Text>
                    <Text style={{ color: mk2Day === d ? '#888' : '#333', fontSize: 10 }}>{d === 1 ? '\u4f53' : d === 2 ? '\u5fc3' : '\u7fd2\u6163'}</Text>
                  </View>
                ))}
              </View>

              {/* Boss */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  {mk2Flash && <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(231,76,60,0.5)', zIndex: 2 }} />}
                  <Animated.Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 80, height: 80, borderRadius: 40, transform: [{ translateX: mk2Shake }] }} resizeMode="contain" />
                </View>
                <View style={{ width: '70%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 4 }}>
                  <View style={{ width: (Math.max(0, 3 - (mk2Day - 1)) / 3 * 100) + '%', height: 8, backgroundColor: '#e74c3c', borderRadius: 4 }} />
                </View>
                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, 3 - (mk2Day - 1)) + '/3'}</Text>
              </View>

              {/* Reset warning */}
              {mk2WasReset && mk2Phase === 'menu' && (
                <View style={{ backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', textAlign: 'center' }}>{'\u3084\u3063\u3071\u308a\u4e09\u65e5\u574a\u4e3b\u3060\u306a\u3002\n\u6700\u521d\u304b\u3089\u3084\u308a\u76f4\u3057\u3060\u3002'}</Text>
                </View>
              )}

              {/* Menu - mission cards */}
              {mk2Phase === 'menu' && (
                <View>
                  {(mk2Day === 1 ? MK2_DAY1 : mk2Day === 2 ? MK2_DAY2 : MK2_DAY3).map(id => {
                    const m = MK2_MISSIONS[id]; if (!m) return null;
                    const done = mk2Done.includes(id);
                    return (
                      <Pressable key={id} onPress={() => { if (!done) { setMk2CM(id); if (m.phase === 'mk2_text') setMk2TextVal(''); if (m.phase === 'mk2_list') { setMk2ListItems([]); setMk2ListInput(''); } if (m.phase === 'mk2_ts') setMk2Hits(0); if (m.phase === 'mk2_focus') setMk2FocusLeft(5); setMk2Phase(m.phase); if (id === 'routines' || id === 'todos') { const tl = dailyLogs.find(l => l.date === getTodayStr()); if (id === 'routines' && tl && tl.routines.length > 0 && (tl.routineDone||[]).length >= tl.routines.length) { setMk2Done(prev => [...prev,'routines']); } if (id === 'todos' && tl && (tl.todos.length === 0 || tl.todos.every(t => t.done))) { setMk2Done(prev => [...prev,'todos']); } } } }} style={{ backgroundColor: done ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)', borderWidth: 2, borderColor: done ? '#2ecc71' : '#333', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, marginRight: 12 }}>{done ? '\u2714\uFE0F' : m.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: done ? '#2ecc71' : '#fff', fontSize: 15, fontWeight: '900' }}>{done ? m.title + '\u9054\u6210\uff01' : m.title}</Text>
                          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{m.sub}</Text>
                        </View>
                        {!done && <Text style={{ color: '#555', fontSize: 18 }}>{'\u203a'}</Text>}
                      </Pressable>
                    );
                  })}
                  {(mk2Day === 1 ? MK2_DAY1 : mk2Day === 2 ? MK2_DAY2 : MK2_DAY3).every(id => mk2Done.includes(id)) && (
                    <TouchableOpacity onPress={mk2CompleteDay} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{mk2Day === 3 ? '\u3068\u3069\u3081\u3092\u523a\u305b\uff01' : 'DAY ' + mk2Day + ' CLEAR!'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Text input phase */}
              {mk2Phase === 'mk2_text' && MK2_TEXT_CFG[mk2CM] && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{MK2_TEXT_CFG[mk2CM].title}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{MK2_TEXT_CFG[mk2CM].prompt}</Text>
                  <TextInput style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }} placeholder={MK2_TEXT_CFG[mk2CM].ph} placeholderTextColor="#555" multiline value={mk2TextVal} onChangeText={setMk2TextVal} />
                  <TouchableOpacity onPress={mk2SubmitText} style={{ backgroundColor: mk2TextVal.trim() ? '#DAA520' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: mk2TextVal.trim() ? 1 : 0.5 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{MK2_TEXT_CFG[mk2CM].btn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 8 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {mk2Phase === 'mk2_alarm' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2DD4BF', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{'⏰ サムライアラーム'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{'明日の起床時間をセットしろ。\n撮影しないと止まらない。'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h + 1) % 24); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text></Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h - 1 + 24) % 24); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text></Pressable>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>{':'}</Text>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m + 15) % 60); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text></Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m - 15 + 60) % 60); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text></Pressable>
                    </View>
                  </View>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>{'📸 撮影ミッション'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
                      <Pressable key={m} onPress={() => { playTapSound(); setAlarmMission(m); }} style={{ backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginHorizontal: 4 }}>
                        <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold', fontSize: 14 }}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TouchableOpacity onPress={async () => {
                    playConfirmSound();
                    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
                    const now = new Date(); let triggerDate = new Date();
                    triggerDate.setHours(alarmHour, alarmMinute, 0, 0);
                    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);
                    if (alarmNotificationId) { await Notifications.cancelScheduledNotificationAsync(alarmNotificationId); }
                    const notifId = await Notifications.scheduleNotificationAsync({
                      content: { title: '⚔️ サムライキング参上', body: '起きろ！' + alarmMission + 'を撮影して目を覚ませ！', sound: true, data: { type: 'wakeup_alarm' } },
                      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
                    });
                    setAlarmNotificationId(notifId); setAlarmSet(true);
                    setMk2Done(prev => [...prev, 'alarm']); setMk2Phase('menu');
                    Alert.alert('⏰ アラームセット完了', alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\n撮影場所：' + alarmMission);
                  }} style={{ backgroundColor: '#2DD4BF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'アラームをセット'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 8 }}><Text style={{ color: '#666', fontSize: 13 }}>{'← 戻る'}</Text></TouchableOpacity>
                </View>
              )}

              {/* List input phase */}
              {mk2Phase === 'mk2_list' && MK2_LIST_CFG[mk2CM] && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{MK2_LIST_CFG[mk2CM].title}</Text>
                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{mk2ListItems.length + ' / ' + MK2_LIST_CFG[mk2CM].target}</Text>
                  {mk2ListItems.map((k, i) => (
                    <View key={i} style={{ backgroundColor: 'rgba(79,195,247,0.08)', borderRadius: 10, padding: 12, width: '100%', marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#4FC3F7', fontSize: 14, marginRight: 8 }}>{(i+1) + '.'}</Text>
                      <Text style={{ color: '#ccc', fontSize: 14, flex: 1 }}>{k}</Text>
                    </View>
                  ))}
                  {mk2ListItems.length < MK2_LIST_CFG[mk2CM].target && (
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 16 }}>
                      <TextInput style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 8 }} placeholder={MK2_LIST_CFG[mk2CM].ph} placeholderTextColor="#555" value={mk2ListInput} onChangeText={setMk2ListInput} onSubmitEditing={mk2AddListItem} returnKeyType="done" />
                      <TouchableOpacity onPress={mk2AddListItem} style={{ backgroundColor: mk2ListInput.trim() ? '#4FC3F7' : '#333', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', opacity: mk2ListInput.trim() ? 1 : 0.5 }}>
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'+'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* Consult reply */}
              {mk2Phase === 'mk2_consult_reply' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\u{1f3ef} \u4f8d\u30ad\u30f3\u30b0\u306e\u8a00\u8449'}</Text>
                  {mk2ConsultLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                      <ActivityIndicator size="large" color="#DAA520" />
                      <Text style={{ color: '#888', fontSize: 13, marginTop: 12 }}>{'\u4f8d\u304c\u8003\u3048\u4e2d...'}</Text>
                    </View>
                  ) : (
                    <View style={{ width: '100%' }}>
                      <View style={{ backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                        <Text style={{ color: '#ddd', fontSize: 15, lineHeight: 24 }}>{mk2SamuraiReply}</Text>
                      </View>
                      <TouchableOpacity onPress={() => { setMk2Done(prev => [...prev, 'consult']); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {} setMk2TextVal(''); setMk2Phase('menu'); }} style={{ backgroundColor: '#DAA520', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\u627f\u77e5\uff01'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Training select */}
              {mk2Phase === 'mk2_ts' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\u7b4b\u30c8\u30ec\u3092\u9078\u3079'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                    {DEEBU_EXERCISES.map((ex) => (
                      <TouchableOpacity key={ex.id} onPress={() => { setMk2TT(ex.id); setMk2Hits(0); setMk2Phase('mk2_training'); }} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 2, borderColor: '#DAA520', borderRadius: 14, paddingVertical: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, marginBottom: 6 }}>{ex.icon}</Text>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{ex.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* Training counter */}
              {mk2Phase === 'mk2_training' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>{'\u2694\uFE0F ' + (DEEBU_EXERCISES.find(e => e.id === mk2TT)?.label || '')}</Text>
                  <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900', marginBottom: 4 }}>{mk2Hits}</Text>
                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{mk2Hits + ' / ' + (mk2CM === 'training3' ? 50 : 30)}</Text>
                  {!mk2Done.includes(mk2CM) ? (
                    <TouchableOpacity onPress={mk2TrainTap} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#DAA520', fontSize: 28, fontWeight: '900' }}>{'\u62bc\u305b\uff01'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\u7b4b\u30c8\u30ec\u5b8c\u4e86\uff01'}</Text>
                      <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                        <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: 'bold' }}>{'\u6b21\u3078'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Photo */}
              {mk2Phase === 'mk2_photo' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{'\u{1f4f8} \u6b32\u671b\u3092\u65ad\u3066'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>{'\u6211\u6162\u3059\u308b\u3082\u306e\u3092\u64ae\u308c'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={mk2TakePhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', marginRight: 16 }}>
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\u{1f4f7}'}</Text>
                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\u64ae\u5f71'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={mk2PickPhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center' }}>
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\u{1f5bc}\uFE0F'}</Text>
                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\u9078\u629e'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* Reason */}
              {mk2Phase === 'mk2_reason' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', marginBottom: 12 }}>{'\u306a\u305c\u6211\u6162\u3059\u308b\uff1f'}</Text>
                  {mk2PhotoUri && <Image source={{ uri: mk2PhotoUri }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 16, borderWidth: 2, borderColor: '#333' }} />}
                  <TextInput style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }} placeholder={'\u6211\u6162\u3059\u308b\u7406\u7531\u3092\u66f8\u3051'} placeholderTextColor="#555" multiline value={mk2ReasonVal} onChangeText={setMk2ReasonVal} />
                  <TouchableOpacity onPress={mk2SubmitReason} style={{ backgroundColor: mk2ReasonVal.trim() ? '#4FC3F7' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: mk2ReasonVal.trim() ? 1 : 0.5 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\u6b32\u671b\u3092\u65ad\u3061\u5207\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Focus */}
              {mk2Phase === 'mk2_focus' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#9b59b6', fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\u{1f9d8} \u96c6\u4e2d\u305b\u3088'}</Text>
                  {mk2FocusLeft > 0 && !mk2Done.includes('focus') ? (
                    <View style={{ alignItems: 'center' }}>
                      {mk2FocusLeft === 5 ? (
                        <TouchableOpacity onPress={mk2StartFocus} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(155,89,182,0.15)', borderWidth: 3, borderColor: '#9b59b6', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#9b59b6', fontSize: 24, fontWeight: '900' }}>{'START'}</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900' }}>{mk2FocusLeft}</Text>
                          <View style={{ width: 200, height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 12 }}>
                            <View style={{ width: ((5 - mk2FocusLeft) / 5 * 100) + '%', height: 8, backgroundColor: '#9b59b6', borderRadius: 4 }} />
                          </View>
                          <Text style={{ color: '#888', fontSize: 13, marginTop: 12 }}>{'\u96d1\u5ff5\u3092\u6368\u3066\u308d'}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\u96c6\u4e2d\u5b8c\u4e86\uff01'}</Text>
                      <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ backgroundColor: 'rgba(155,89,182,0.2)', borderWidth: 1, borderColor: '#9b59b6', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                        <Text style={{ color: '#9b59b6', fontSize: 14, fontWeight: 'bold' }}>{'\u6b21\u3078'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 16 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* Check routines/todos */}
              {mk2Phase === 'mk2_check' && (
                <View style={{ alignItems: 'center' }}>
                  {(() => {
                    const tl = dailyLogs.find(l => l.date === getTodayStr());
                    if (mk2CM === 'routines') {
                      const total = tl?.routines?.length || 0;
                      const doneC = (tl?.routineDone || []).length;
                      const ok = total > 0 && doneC >= total;
                      return (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>{'\u{1f4cb} \u30eb\u30fc\u30c6\u30a3\u30f3\u30c1\u30a7\u30c3\u30af'}</Text>
                          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', marginBottom: 4 }}>{doneC + '/' + total}</Text>
                          {ok || mk2Done.includes('routines') ? (
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>{'\u5168\u5b8c\u4e86\uff01'}</Text>
                              <TouchableOpacity onPress={() => { if (!mk2Done.includes('routines')) setMk2Done(prev => [...prev,'routines']); setMk2Phase('menu'); }} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                                <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: 'bold' }}>{'\u78ba\u8a8d'}</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={{ color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{'\u30eb\u30fc\u30c6\u30a3\u30f3\u3092\u5168\u3066\u3053\u306a\u3057\u3066\u304b\u3089\u623b\u308c'}</Text>
                          )}
                        </View>
                      );
                    } else {
                      const total = tl?.todos?.length || 0;
                      const doneC = tl?.todos?.filter(t => t.done)?.length || 0;
                      const ok = total === 0 || doneC >= total;
                      return (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>{'\u2705 TODO\u30c1\u30a7\u30c3\u30af'}</Text>
                          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', marginBottom: 4 }}>{doneC + '/' + total}</Text>
                          {ok || mk2Done.includes('todos') ? (
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>{'\u5168\u5b8c\u4e86\uff01'}</Text>
                              <TouchableOpacity onPress={() => { if (!mk2Done.includes('todos')) setMk2Done(prev => [...prev,'todos']); setMk2Phase('menu'); }} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                                <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: 'bold' }}>{'\u78ba\u8a8d'}</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={{ color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{'TODO\u3092\u5168\u3066\u5b8c\u4e86\u3057\u3066\u304b\u3089\u623b\u308c'}</Text>
                          )}
                        </View>
                      );
                    }
                  })()}
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 16 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* Day clear */}
              {mk2Phase === 'day_clear' && (
                <View style={{ alignItems: 'center', paddingTop: 30 }}>
                  <Text style={{ color: '#2ecc71', fontSize: 28, fontWeight: '900', letterSpacing: 3, marginBottom: 12 }}>{'DAY ' + mk2Day + ' CLEAR!'}</Text>
                  <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 24, marginBottom: 30 }}>{'\u660e\u65e5\u307e\u305f\u6765\u3044\u3002\n\u30b5\u30dc\u3063\u305f\u3089\u30ea\u30bb\u30c3\u30c8\u3060\u305e\u3002'}</Text>
                  <TouchableOpacity onPress={() => setMk2BO(false)} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderWidth: 1, borderColor: '#2ecc71', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#2ecc71', fontSize: 16, fontWeight: 'bold' }}>{'\u9589\u3058\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* All done */}
              {mk2Phase === 'done' && (
                <View style={{ alignItems: 'center', paddingTop: 30 }}>
                  <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'3\u65e5\u9593\u5168\u9054\u6210\uff01'}</Text>
                  <TouchableOpacity onPress={() => triggerMk2Defeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\u3068\u3069\u3081\u3092\u523a\u305b\uff01'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Floating Moumuri */}
      {moumuriActive && !storyActive && (
        <Pressable onPress={openMoumuriBattle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#9b59b6' }}>
          <Image source={YOKAI_IMAGES.moumuri} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode="contain" />
          <Text style={{ color: '#c39bd3', fontSize: 10, fontWeight: '900', marginTop: 3 }}>{'\u30e2\u30a6\u30e0\u30ea'}</Text>
          <View style={{ backgroundColor: '#9b59b6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\u6311\u6226\uff01'}</Text>
          </View>
        </Pressable>
      )}

      {/* Moumuri Battle Modal */}
      {moumuriBO && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setMoumuriBO(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                <Text style={{ color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\u30e2\u30a6\u30e0\u30ea\u6226'}</Text>
                <View style={{ width: 50 }} />
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              {/* Boss */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  {moumuriFlash && <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(155,89,182,0.5)', zIndex: 2 }} />}
                  <Animated.Image source={YOKAI_IMAGES.moumuri} style={{ width: 100, height: 100, borderRadius: 50, opacity: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 0.4 : 1, transform: [{ translateX: moumuriShakeAnim }] }} resizeMode="contain" />
                </View>
                <Text style={{ color: '#9b59b6', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{'\u30e2\u30a6\u30e0\u30ea'}</Text>
                <View style={{ width: '60%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 6 }}>
                  <View style={{ width: (Math.max(0, MOUMURI_KANSHA_TARGET - moumuriKanshaList.length) / MOUMURI_KANSHA_TARGET * 100) + '%', height: 8, backgroundColor: '#9b59b6', borderRadius: 4 }} />
                </View>
                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, MOUMURI_KANSHA_TARGET - moumuriKanshaList.length) + '/' + MOUMURI_KANSHA_TARGET}</Text>
              </View>

              {/* Menu */}
              {moumuriPhase === 'menu' && (
                <View>
                  <Pressable onPress={() => { if (!moumuriZenDone) setMoumuriPhase('zen'); }} style={{ backgroundColor: moumuriZenDone ? 'rgba(46,204,113,0.1)' : 'rgba(218,165,32,0.1)', borderWidth: 2, borderColor: moumuriZenDone ? '#2ecc71' : '#DAA520', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginRight: 14 }}>{moumuriZenDone ? '\u2714\uFE0F' : '\u2694\uFE0F'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: moumuriZenDone ? '#2ecc71' : '#DAA520', fontSize: 17, fontWeight: '900' }}>{moumuriZenDone ? '\u4e00\u65e5\u4e00\u5584\u9054\u6210\uff01' : '\u4e00\u65e5\u4e00\u5584'}</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{moumuriZenDone ? moumuriZenText : '\u4eca\u65e5\u306e\u5584\u3044\u884c\u3044\u3092\u66f8\u3051'}</Text>
                    </View>
                    {!moumuriZenDone && <Text style={{ color: '#DAA520', fontSize: 20 }}>{'\u203a'}</Text>}
                  </Pressable>

                  <Pressable onPress={() => { if (moumuriKanshaList.length < MOUMURI_KANSHA_TARGET) setMoumuriPhase('kansha'); }} style={{ backgroundColor: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 'rgba(46,204,113,0.1)' : 'rgba(79,195,247,0.1)', borderWidth: 2, borderColor: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '#2ecc71' : '#4FC3F7', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginRight: 14 }}>{moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '\u2714\uFE0F' : '\u{1f64f}'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '#2ecc71' : '#4FC3F7', fontSize: 17, fontWeight: '900' }}>{moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '\u611f\u8b1d10\u500b\u9054\u6210\uff01' : '\u611f\u8b1d\u3092\u66f8\u3051'}</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{moumuriKanshaList.length + '/' + MOUMURI_KANSHA_TARGET + ' \u611f\u8b1d\u304c\u30e2\u30a6\u30e0\u30ea\u306b\u30c0\u30e1\u30fc\u30b8'}</Text>
                    </View>
                    {moumuriKanshaList.length < MOUMURI_KANSHA_TARGET && <Text style={{ color: '#4FC3F7', fontSize: 20 }}>{'\u203a'}</Text>}
                  </Pressable>

                  {moumuriZenDone && moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET && (
                    <TouchableOpacity onPress={() => triggerMoumuriDefeat()} style={{ backgroundColor: '#9b59b6', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\u3068\u3069\u3081\u3092\u523a\u305b\uff01'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Zen input */}
              {moumuriPhase === 'zen' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\u2694\uFE0F \u4e00\u65e5\u4e00\u5584'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 22 }}>{'\u4eca\u65e5\u4eba\u306b\u3057\u305f\u512a\u3057\u3044\u3053\u3068\u3001\n\u826f\u3044\u884c\u3044\u3092\u66f8\u3051\u3002'}</Text>
                  <TextInput
                    style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }}
                    placeholder={'\u4f8b\uff1a\u540c\u50da\u306b\u30b3\u30fc\u30d2\u30fc\u3092\u5165\u308c\u305f'}
                    placeholderTextColor="#555"
                    multiline
                    value={moumuriZenText}
                    onChangeText={setMoumuriZenText}
                  />
                  <TouchableOpacity onPress={moumuriSubmitZen} style={{ backgroundColor: moumuriZenText.trim() ? '#DAA520' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: moumuriZenText.trim() ? 1 : 0.5 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\u5584\u884c\u3092\u8a18\u9332'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMoumuriPhase('menu')} style={{ padding: 12, marginTop: 8 }}>
                    <Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Kansha input */}
              {moumuriPhase === 'kansha' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\u{1f64f} \u611f\u8b1d\u3092\u66f8\u3051'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{moumuriKanshaList.length + ' / ' + MOUMURI_KANSHA_TARGET}</Text>
                  {moumuriKanshaList.map((k, i) => (
                    <View key={i} style={{ backgroundColor: 'rgba(79,195,247,0.08)', borderRadius: 10, padding: 12, width: '100%', marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#4FC3F7', fontSize: 14, marginRight: 8 }}>{(i + 1) + '.'}</Text>
                      <Text style={{ color: '#ccc', fontSize: 14, flex: 1 }}>{k}</Text>
                    </View>
                  ))}
                  {moumuriKanshaList.length < MOUMURI_KANSHA_TARGET && (
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 16 }}>
                      <TextInput
                        style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 8 }}
                        placeholder={'\u611f\u8b1d\u3057\u3066\u3044\u308b\u3053\u3068\u3092\u66f8\u3051'}
                        placeholderTextColor="#555"
                        value={moumuriKanshaInput}
                        onChangeText={setMoumuriKanshaInput}
                        onSubmitEditing={moumuriAddKansha}
                        returnKeyType="done"
                      />
                      <TouchableOpacity onPress={moumuriAddKansha} style={{ backgroundColor: moumuriKanshaInput.trim() ? '#4FC3F7' : '#333', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', opacity: moumuriKanshaInput.trim() ? 1 : 0.5 }}>
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'+'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setMoumuriPhase('menu')} style={{ padding: 12, marginTop: 4 }}>
                    <Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Done */}
              {moumuriPhase === 'done' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'\u30df\u30c3\u30b7\u30e7\u30f3\u5168\u9054\u6210\uff01'}</Text>
                  <TouchableOpacity onPress={() => triggerMoumuriDefeat()} style={{ backgroundColor: '#9b59b6', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\u3068\u3069\u3081\u3092\u523a\u305b\uff01'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Floating Deebu */}
      {deebuActive && !storyActive && (
        <Pressable onPress={openDeebuBattle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#e74c3c' }}>
          <Image source={YOKAI_IMAGES.deebu} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode="contain" />
          <Text style={{ color: '#ff6b6b', fontSize: 10, fontWeight: '900', marginTop: 3 }}>{'\u30c7\u30fc\u30d6'}</Text>
          <View style={{ backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\u6311\u6226\uff01'}</Text>
          </View>
        </Pressable>
      )}

      {/* Deebu Battle Modal */}
      {deebuBattleOpen && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setDeebuBattleOpen(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\u30c7\u30fc\u30d6\u6226'}</Text>
                <View style={{ width: 50 }} />
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              {/* Boss */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  {deebuFlash && <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(231,76,60,0.5)', zIndex: 2 }} />}
                  <Animated.Image source={YOKAI_IMAGES.deebu} style={{ width: 100, height: 100, borderRadius: 50, opacity: deebuTrainingDone ? 0.4 : 1, transform: [{ translateX: deebuShakeAnim }] }} resizeMode="contain" />
                </View>
                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{'\u30c7\u30fc\u30d6'}</Text>
                <View style={{ width: '60%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 6 }}>
                  <View style={{ width: (Math.max(0, DEEBU_HIT_TARGET - deebuHits) / DEEBU_HIT_TARGET * 100) + '%', height: 8, backgroundColor: '#e74c3c', borderRadius: 4 }} />
                </View>
                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, DEEBU_HIT_TARGET - deebuHits) + '/' + DEEBU_HIT_TARGET}</Text>
              </View>

              {/* Menu */}
              {deebuPhase === 'menu' && (
                <View>
                  <Pressable onPress={() => { if (!deebuTrainingDone) setDeebuPhase('train_select'); }} style={{ backgroundColor: deebuTrainingDone ? 'rgba(46,204,113,0.1)' : 'rgba(218,165,32,0.1)', borderWidth: 2, borderColor: deebuTrainingDone ? '#2ecc71' : '#DAA520', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginRight: 14 }}>{deebuTrainingDone ? '\u2714\uFE0F' : '\u2694\uFE0F'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: deebuTrainingDone ? '#2ecc71' : '#DAA520', fontSize: 17, fontWeight: '900' }}>{deebuTrainingDone ? '\u7b4b\u30c8\u30ec\u5b8c\u4e86\uff01' : '\u7b4b\u30c8\u30ec\u3067\u653b\u6483'}</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{deebuTrainingDone ? deebuHits + '\u56de\u9054\u6210' : '\u7b4b\u30c8\u30ec\u3092\u9078\u3093\u3067' + DEEBU_HIT_TARGET + '\u56de\u30c0\u30e1\u30fc\u30b8\u3092\u4e0e\u3048\u308d'}</Text>
                    </View>
                    {!deebuTrainingDone && <Text style={{ color: '#DAA520', fontSize: 20 }}>{'\u203a'}</Text>}
                  </Pressable>

                  <Pressable onPress={() => { if (!deebuPhotoDone) setDeebuPhase('photo'); }} style={{ backgroundColor: deebuPhotoDone ? 'rgba(46,204,113,0.1)' : 'rgba(79,195,247,0.1)', borderWidth: 2, borderColor: deebuPhotoDone ? '#2ecc71' : '#4FC3F7', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginRight: 14 }}>{deebuPhotoDone ? '\u2714\uFE0F' : '\u{1f4f8}'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: deebuPhotoDone ? '#2ecc71' : '#4FC3F7', fontSize: 17, fontWeight: '900' }}>{deebuPhotoDone ? '\u6b32\u671b\u65ad\u3061\u5207\u308a\uff01' : '\u6b32\u671b\u3092\u65ad\u3061\u5207\u308c'}</Text>
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{deebuPhotoDone ? '\u6211\u6162\u3059\u308b\u3082\u306e\u3092\u5c01\u5370\u3057\u305f' : '\u6211\u6162\u3059\u308b\u3082\u306e\u3092\u64ae\u3063\u3066\u7406\u7531\u3092\u66f8\u3051'}</Text>
                    </View>
                    {!deebuPhotoDone && <Text style={{ color: '#4FC3F7', fontSize: 20 }}>{'\u203a'}</Text>}
                  </Pressable>

                  {deebuTrainingDone && deebuPhotoDone && (
                    <TouchableOpacity onPress={() => triggerDeebuDefeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>
                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\u3068\u3069\u3081\u3092\u523a\u305b\uff01'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Train select */}
              {deebuPhase === 'train_select' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\u7b4b\u30c8\u30ec\u3092\u9078\u3079'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                    {DEEBU_EXERCISES.map((ex) => (
                      <TouchableOpacity key={ex.id} onPress={() => { setDeebuTrainingType(ex.id); setDeebuPhase('training'); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {} }} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 2, borderColor: '#DAA520', borderRadius: 14, paddingVertical: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, marginBottom: 6 }}>{ex.icon}</Text>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{ex.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ padding: 12 }}>
                    <Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Training counter */}
              {deebuPhase === 'training' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>{'\u2694\uFE0F ' + (DEEBU_EXERCISES.find(e => e.id === deebuTrainingType)?.label || '')}</Text>
                  <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900', marginBottom: 4 }}>{deebuHits}</Text>
                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{deebuHits + ' / ' + DEEBU_HIT_TARGET}</Text>
                  {deebuHits < DEEBU_HIT_TARGET ? (
                    <TouchableOpacity onPress={deebuTrainingTap} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#DAA520', fontSize: 28, fontWeight: '900' }}>{'\u62bc\u305b\uff01'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\u7b4b\u30c8\u30ec\u5b8c\u4e86\uff01'}</Text>
                      <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                        <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: 'bold' }}>{'\u6b21\u3078'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Photo */}
              {deebuPhase === 'photo' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\u{1f4f8} \u6b32\u671b\u3092\u65ad\u3061\u5207\u308c'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 22 }}>{'\u4eca\u6211\u6162\u3057\u305f\u3044\u3082\u306e\u3092\u64ae\u308c\u3002\n\u305d\u308c\u304c\u304a\u524d\u306e\u5f31\u3055\u3060\u3002'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={deebuTakePhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', marginRight: 16 }}>
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\u{1f4f7}'}</Text>
                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\u64ae\u5f71'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={deebuPickPhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center' }}>
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\u{1f5bc}\uFE0F'}</Text>
                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\u9078\u629e'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ padding: 12 }}>
                    <Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Reason */}
              {deebuPhase === 'reason' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', marginBottom: 12 }}>{'\u306a\u305c\u6211\u6162\u3059\u308b\uff1f'}</Text>
                  {deebuPhotoUri && <Image source={{ uri: deebuPhotoUri }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 16, borderWidth: 2, borderColor: '#333' }} />}
                  <TextInput
                    style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }}
                    placeholder={'\u6211\u6162\u3059\u308b\u7406\u7531\u3092\u66f8\u3051'}
                    placeholderTextColor="#555"
                    multiline
                    value={deebuReason}
                    onChangeText={setDeebuReason}
                  />
                  <TouchableOpacity onPress={deebuSubmitReason} style={{ backgroundColor: deebuReason.trim() ? '#4FC3F7' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: deebuReason.trim() ? 1 : 0.5 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\u6b32\u671b\u3092\u65ad\u3061\u5207\u308b'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Done */}
              {deebuPhase === 'done' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'\u30df\u30c3\u30b7\u30e7\u30f3\u5168\u9054\u6210\uff01'}</Text>
                  <TouchableOpacity onPress={() => triggerDeebuDefeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\u3068\u3069\u3081\u3092\u523a\u305b\uff01'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Floating Atodeyaru */}
      {atodeyaruActive && !storyActive && (
        <View style={{ position: 'absolute', bottom: 120, right: 16, zIndex: 999, alignItems: 'center' }}>
          <Pressable onPress={() => { const quips = ATODEYARU_QUIPS; const q = quips[Math.floor(Math.random() * quips.length)]; showSaveSuccess(q); }}>
            <Image source={YOKAI_IMAGES.atodeyaru} style={{ width: 60, height: 60, borderRadius: 30 }} resizeMode="contain" />
            <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 2 }}>{'アトデヤル'}</Text>
            <View style={{ backgroundColor: '#e67e22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{'タップ！'}</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Yokai Defeat Modal */}
      {yokaiEncounter && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>

              {yokaiPhase === 'appear' && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700', letterSpacing: 3, marginBottom: 12 }}>☠️ 妖怪出現 ☠️</Text>
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 20 }}>{yokaiEncounter.name}</Text>

                  <View style={{ width: 240, height: 240, borderRadius: 24, overflow: 'hidden', borderWidth: 3, borderColor: '#ef4444', backgroundColor: '#1a0a0a', marginBottom: 24, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20 }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#1a0808', borderRadius: 14, padding: 18, marginBottom: 30, width: '90%', borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
                    <Text style={{ color: '#ef4444', fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 28 }}>
                      「{yokaiEncounter.quote}」
                    </Text>
                  </View>

                  <Pressable
                    onPress={yokaiAttack}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                      paddingVertical: 22,
                      paddingHorizontal: 70,
                      borderRadius: 16,
                      shadowColor: '#D4AF37',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: pressed ? 0.3 : 0.7,
                      shadowRadius: 15,
                    }]}
                  >
                    <Text style={{ color: '#000', fontSize: 26, fontWeight: '900' }}>⚔️ 斬る！</Text>
                  </Pressable>
                </View>
              )}

              {yokaiPhase === 'attack' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#D4AF37', fontSize: 36, fontWeight: '900', marginBottom: 24, letterSpacing: 4 }}>⚔️ 一太刀！</Text>
                  <Animated.View style={{
                    transform: [{ translateX: yokaiShakeAnim }],
                    width: 260, height: 260, borderRadius: 24, overflow: 'hidden',
                    borderWidth: 4, borderColor: '#D4AF37', backgroundColor: '#1a0a0a',
                    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 25,
                  }}>
                    <Video
                      source={YOKAI_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </Animated.View>
                </View>
              )}

              {yokaiPhase === 'defeated' && (
                <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }} style={{ width: '100%' }}>
                  <Text style={{ color: '#D4AF37', fontSize: 40, fontWeight: '900', marginBottom: 6, letterSpacing: 2 }}>討伐成功！</Text>
                  <Text style={{ color: '#aaa', fontSize: 16, marginBottom: 24 }}>{yokaiEncounter.name}を倒した！</Text>

                  <View style={{ width: 280, height: 280, borderRadius: 24, overflow: 'hidden', borderWidth: 3, borderColor: '#333', backgroundColor: '#0a0a0a', marginBottom: 24 }}>
                    <Video
                      source={YOKAI_LOSE_VIDEOS[yokaiEncounter.id]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  </View>

                  <View style={{ backgroundColor: '#0a0a1a', borderRadius: 14, padding: 18, marginBottom: 16, width: '90%', borderLeftWidth: 4, borderLeftColor: '#555' }}>
                    <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>{yokaiEncounter.name}の最期</Text>
                    <Text style={{ color: '#999', fontSize: 17, fontStyle: 'italic', textAlign: 'center', lineHeight: 26 }}>
                      「{yokaiEncounter.defeatQuote}」
                    </Text>
                  </View>

                  <View style={{ backgroundColor: '#1a1a0a', borderRadius: 14, padding: 18, marginBottom: 20, width: '90%', borderLeftWidth: 4, borderLeftColor: '#D4AF37' }}>
                    <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>── サムライキング ──</Text>
                    <Text style={{ color: '#ccc', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 26 }}>
                      「{SAMURAI_KING_DEFEAT_QUOTES[Math.floor(Math.random() * SAMURAI_KING_DEFEAT_QUOTES.length)]}」
                    </Text>
                  </View>

                  <Text style={{ color: '#D4AF37', fontSize: 36, fontWeight: '900', marginBottom: 24, textShadowColor: '#D4AF37', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>+{yokaiXp} XP</Text>

                  <Pressable
                    onPress={closeYokaiModal}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#8B6914' : '#D4AF37',
                      paddingVertical: 20,
                      paddingHorizontal: 60,
                      borderRadius: 16,
                      shadowColor: '#D4AF37',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                      marginBottom: 20,
                    }]}
                  >
                    <Text style={{ color: '#000', fontSize: 20, fontWeight: '900' }}>続ける</Text>
                  </Pressable>
                </ScrollView>
              )}

          </View>
        </Modal>
      )}

      {/* Stats Allocation Modal */}
      <Modal visible={showStatsAlloc} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              武士の器を定めよ
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              300ポイントを配分せよ（各最低20）
            </Text>

            {[
              {key: 'power', label: '力 (Power)', color: '#ef4444'},
              {key: 'mind', label: '心 (Mind)', color: '#3b82f6'},
              {key: 'skill', label: '技 (Skill)', color: '#22c55e'},
              {key: 'virtue', label: '徳 (Virtue)', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 16, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <View style={{ height: '100%', width: tempStats[stat.key as keyof typeof tempStats] + '%', backgroundColor: stat.color, borderRadius: 3 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>-</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>-1</Text>
                  </Pressable>
                  <View style={{ width: 50, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 11 }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 1); playTapSound(); }}
                    style={{ backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
                  >
                    <Text style={{ color: '#aaa', fontSize: 16 }}>+1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 14, textAlign: 'center', marginVertical: 12, fontWeight: 'bold' }}>
              合計: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
              {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300 ? ' (調整が必要)' : ' ✅'}
            </Text>

            <Pressable
              onPress={confirmStatsAllocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#000' : '#888', fontSize: 16, fontWeight: 'bold' }}>
                決定する
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowStatsAlloc(false)}
              style={{ padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>戻る</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Reallocation Modal */}
      <Modal visible={showReallocModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              修行回想
            </Text>
            <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 4, fontStyle: 'italic' }}>
              「過去は変えられぬ。だが、解釈は変えられる」
            </Text>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
              月に一度、最大{reallocBudget}ポイントまで再配分可能
            </Text>

            {[
              {key: 'power', label: '力', color: '#ef4444'},
              {key: 'mind', label: '心', color: '#3b82f6'},
              {key: 'skill', label: '技', color: '#22c55e'},
              {key: 'virtue', label: '徳', color: '#a855f7'},
            ].map(stat => (
              <View key={stat.key} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: stat.color, fontSize: 15, fontWeight: '600' }}>{stat.label}</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {samuraiStats[stat.key as keyof typeof samuraiStats]} → {tempStats[stat.key as keyof typeof tempStats]}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, -5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>-</Text>
                  </Pressable>
                  <View style={{ width: 60, alignItems: 'center' }}>
                    <Text style={{ color: '#ccc', fontSize: 18, fontWeight: 'bold' }}>
                      {tempStats[stat.key as keyof typeof tempStats]}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => { adjustTempStat(stat.key as any, 5); playTapSound(); }}
                    style={{ backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#22c55e' : '#ef4444', fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
              合計: {tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue} / 300
            </Text>

            <Pressable
              onPress={confirmReallocation}
              disabled={tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue !== 300}
              style={{ 
                backgroundColor: tempStats.power + tempStats.mind + tempStats.skill + tempStats.virtue === 300 ? '#D4AF37' : '#444',
                padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8
              }}
            >
              <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>再配分を確定</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowReallocModal(false)}
              style={{ padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>戻る</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>利用規約</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.modalText}>{TERMS_OF_SERVICE_TEXT}</Text>
            </ScrollView>
            <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => setShowTerms(false)}>
              <Text style={styles.primaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {renderSaveToast()}
      {renderPaywall()}
      {renderMissionAlarm()}
      {renderAlternativeAction()}
      {renderMissionProposal()}
      
      {/* レベルアップモーダル */}
      <Modal visible={showLevelUpModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#D4AF37', fontSize: 16, marginBottom: 8 }}>🎊 LEVEL UP! 🎊</Text>
          <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>
            Lv.{levelUpInfo?.newLevel || 1}
          </Text>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: '600', marginBottom: 24 }}>
            {LEVEL_TITLES[levelUpInfo?.newLevel || 1]}
          </Text>
          
          {/* キャラ画像 */}
          <View style={{ 
            width: 200, 
            height: 200, 
            borderRadius: 20, 
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: '#D4AF37',
            marginBottom: 24,
            backgroundColor: '#1a1a2e',
          }}>
            <Image 
              source={CHARACTER_IMAGES[Math.max(1, Math.min(10, levelUpInfo?.newLevel || 1))]} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {levelUpInfo?.newLevel === 1 
              ? 'サムライの姿が目覚めた！\nロゴをタップして育成画面を開こう' 
              : '新たな力を手に入れた！'}
          </Text>
          
          <Pressable
            style={{ backgroundColor: '#D4AF37', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 }}
            onPress={() => {
              playCorrectSound();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowLevelUpModal(false);
            }}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>確認</Text>
          </Pressable>
        </View>
      </Modal>
      
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
