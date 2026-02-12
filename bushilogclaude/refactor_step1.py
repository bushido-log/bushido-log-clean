#!/usr/bin/env python3
"""
BUSHIDO LOG Refactoring Step 1
Extracts constants, types, assets, data, and utility functions from App.tsx
into separate files under src/

Creates:
  src/data/constants.ts   - API URLs, storage keys, config, texts
  src/data/types.ts       - Type definitions
  src/data/assets.ts      - All require() calls (images, sounds, videos)
  src/data/yokaiData.ts   - Yokai system data
  src/data/battleData.ts  - Battle system data  
  src/utils/helpers.ts    - Utility functions
  src/utils/sounds.ts     - Sound playback functions
  src/utils/api.ts        - API call functions

Modifies:
  App.tsx - Replaces extracted code with imports
"""
import os

FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original_len = len(src)

os.makedirs('src/data', exist_ok=True)
os.makedirs('src/utils', exist_ok=True)

# ============================================================
# 1. src/data/constants.ts
# ============================================================
constants_ts = '''// Config / Constants
export const API_BASE = "https://bushido-log-server.onrender.com";
export const SAMURAI_TTS_URL = `${API_BASE}/tts`;
export const SAMURAI_CHAT_URL = `${API_BASE}/samurai-chat`;
export const SAMURAI_MISSION_URL = `${API_BASE}/mission`;

// AsyncStorage Keys
export const SESSION_KEY = 'samurai_session_id';
export const HISTORY_KEY = 'BUSHIDO_LOG_HISTORY_V1';
export const DAILY_LOGS_KEY = 'BUSHIDO_DAILY_LOGS_V1';
export const ONBOARDING_KEY = 'BUSHIDO_ONBOARDING_V1';
export const XP_KEY = 'BUSHIDO_TOTAL_XP_V1';
export const SETTINGS_KEY = 'BUSHIDO_SETTINGS_V1';
export const STATS_KEY = 'BUSHIDO_STATS_V1';
export const KEGARE_KEY = 'BUSHIDO_KEGARE_V1';
export const TUTORIAL_KEY = 'BUSHIDO_TUTORIAL_DONE';
export const BLOCKLIST_KEY = 'BUSHIDO_BLOCKLIST_V1';
export const SAMURAI_TIME_KEY = 'BUSHIDO_SAMURAI_TIME_V1';
export const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';
export const SAMURAI_MISSION_KEY = 'SAMURAI_MISSION_V1';
export const FIRST_LAUNCH_KEY = 'BUSHIDO_FIRST_LAUNCH_V1';
export const INTRO_SKIP_KEY = 'BUSHIDO_INTRO_SKIP_V1';
export const FIRST_OPEN_DATE_KEY = 'bushido_first_open_date';
export const MIKKABOZU_DAY_KEY = 'bushido_mikkabozu_day_count';
export const MIKKABOZU_EVENT_KEY = 'bushido_mikkabozu_event_done';
export const ATODEYARU_EVENT_KEY = 'bushido_atodeyaru_event_done';
export const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';
export const DEEBU_EVENT_KEY = 'bushido_deebu_event_done';
export const DEEBU_ACTIVE_KEY = 'bushido_deebu_active';
export const MOUMURI_EVENT_KEY = 'bushido_moumuri_event_done';
export const MOUMURI_ACTIVE_KEY = 'bushido_moumuri_active';
export const MK2_EVENT_KEY = 'bushido_mk2_event_done';
export const MK2_ACTIVE_KEY = 'bushido_mk2_active';
export const MK2_PROGRESS_KEY = 'bushido_mk2_progress';
export const FREE_TRIAL_DAYS = 3;

export const MAX_LEVEL = 10;
export const DAYS_PER_LEVEL = 3;
export const MASTER_VOLUME = 0.3;

// レベル別称号
export const LEVEL_TITLES: { [key: number]: string } = {
  0: '名もなき者',
  1: '無位',
  2: '見習',
  3: '足軽',
  4: '武童',
  5: '若侍',
  6: '侍',
  7: '侍将',
  8: '武将',
  9: '武神',
  10: '龍神',
};

// レベルアップに必要なXP（累計）
export const LEVEL_XP_THRESHOLDS = [0, 30, 80, 150, 250, 400, 600, 900, 1300, 1700, 2500];

export const DEFAULT_ROUTINES = [
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

export const urgeMessage = 'その欲望、一刀両断！サムライキング参上。';

export const KEGARE_QUOTES = [
  '刀を磨く者、心も磨かれる',
  '錆びた刀では、己は斬れぬ',
  '日々の手入れが、真の強さを生む',
  '武士の朝は、刀と共に始まる',
  '磨かれた刃は、迷いを断つ',
];
'''

with open('src/data/constants.ts', 'w', encoding='utf-8') as f:
    f.write(constants_ts)
print('[OK] src/data/constants.ts')

# ============================================================
# 2. src/data/types.ts
# ============================================================
types_ts = '''export type YokaiFeature = 'consult' | 'gratitude' | 'goal' | 'review' | 'focus' | 'alarm';

export interface YokaiData {
  id: string;
  name: string;
  quote: string;
  defeatQuote: string;
  features: YokaiFeature[];
}

export type Message = {
  id: string;
  from: 'user' | 'king';
  text: string;
  createdAt?: string;
};

export type HistoryEntry = {
  id: string;
  date: string;
  issue: string;
  reflection: string;
  reply: string;
  imageUri?: string;
};

export type GoodDeedEntry = {
  id: string;
  date: string;
  text: string;
  imageUri?: string;
  tag?: string;
};

export type NightReview = {
  proud: string;
  lesson: string;
  nextAction: string;
};

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type DailyLog = {
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

export type OnboardingData = {
  identity: string;
  quit: string;
  rule: string;
};

export type AppSettings = {
  autoVoice: boolean;
  readingSpeed: 'slow' | 'normal' | 'fast';
  enableHaptics: boolean;
  enableSfx: boolean;
  strictness: 'soft' | 'normal' | 'hard';
};

export type SamuraiTimeState = {
  date: string;
  seconds: number;
  dailyMinutes: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  autoVoice: true,
  readingSpeed: 'normal',
  enableHaptics: true,
  enableSfx: true,
  strictness: 'normal',
};
'''

with open('src/data/types.ts', 'w', encoding='utf-8') as f:
    f.write(types_ts)
print('[OK] src/data/types.ts')

# ============================================================
# 3. src/data/assets.ts
# ============================================================
assets_ts = '''// All asset require() calls - paths relative to src/data/

// 音ファイル
export const STARTUP_SOUND = require('../../sounds/startup.mp3');
export const TAP_SOUND = require('../../sounds/tap.mp3');
export const CONFIRM_SOUND = require('../../sounds/confirm.mp3');
export const RITUAL_SOUND = require('../../sounds/ritual.mp3');
export const CHECK_SOUND = require('../../sounds/check.mp3');
export const CORRECT_SOUND = require('../../sounds/correct.mp3');
export const WRONG_SOUND = require('../../sounds/wrong.mp3');
export const LEVELUP_SOUND = require('../../sounds/sfx_levelup.mp3');
export const EXP_SOUND = require('../../sounds/sfx_exp.mp3');
export const EVOLUTION_SOUND = require('../../sounds/sfx_evolution.mp3');
export const WIN_SOUND = require('../../sounds/sfx_win.mp3');
export const FAIL_SOUND = require('../../sounds/sfx_fail.mp3');
export const ATTACK_SOUND = require('../../sounds/sfx_attack.mp3');
export const ENTER_SOUND = require('../../sounds/enter.mp3');
export const FOCUS_START_SOUND = require('../../sounds/focus_start.mp3');
export const KATANA_SOUND = require('../../sounds/katana_swish.mp3');
export const SFX_POLISH = require('../../sounds/sfx_polish.mp3');
export const SFX_KATANA_SHINE = require('../../sounds/sfx_katana_shine.mp3');
export const SFX_FOOTSTEP = require('../../sounds/sfx_footstep.mp3');
export const SFX_EYE_GLOW = require('../../sounds/sfx_eye_glow.mp3');

// 道場画像
export const DOJO_GATE_DIM = require('../../assets/images/dojo_gate_dim.png');
export const DOJO_GATE_LIGHT = require('../../assets/images/dojo_gate_light.png');
export const CONSULT_BG = require('../../assets/images/consult_bg.png');

// Intro動画
export const INTRO_VIDEO = require('../../assets/intro_video.mov');

// キャラクター画像
export const CHARACTER_IMAGES: { [key: number]: any } = {
  1: require('../../assets/characters/level01.png'),
  2: require('../../assets/characters/level02.png'),
  3: require('../../assets/characters/level03.png'),
  4: require('../../assets/characters/level04.png'),
  5: require('../../assets/characters/level05.png'),
  6: require('../../assets/characters/level06.png'),
  7: require('../../assets/characters/level07.png'),
  8: require('../../assets/characters/level08.png'),
  9: require('../../assets/characters/level09.png'),
  10: require('../../assets/characters/level10.png'),
};

// 刀画像
export const KATANA_RUSTY = require('../../assets/images/katana_rusty.png');
export const KATANA_CLEAN = require('../../assets/images/katana_clean.png');

// 妖怪画像
export const YOKAI_IMAGES: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/yokai_mikkabozu.png'),
  hyakume: require('../../assets/yokai/yokai_hyakume.png'),
  deebu: require('../../assets/yokai/yokai_deebu.png'),
  atodeyaru: require('../../assets/yokai/yokai_atodeyaru.png'),
  scroll: require('../../assets/yokai/yokai_scroll.png'),
  tetsuya: require('../../assets/yokai/yokai_tetsuya.png'),
  nidoneel: require('../../assets/yokai/yokai_nidoneel.png'),
  hikakuzou: require('../../assets/yokai/yokai_hikakuzou.png'),
  peeping: require('../../assets/yokai/yokai_peeping.png'),
  mottemiteya: require('../../assets/yokai/yokai_mottemiteya.png'),
  moumuri: require('../../assets/yokai/yokai_moumuri.png'),
  atamadekkachi: require('../../assets/yokai/yokai_atamadekkachi.png'),
};

export const YOKAI_LOSE_IMAGES: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/loseyokai_mikkabozu.png'),
  hyakume: require('../../assets/yokai/loseyokai_hyakume.png'),
  deebu: require('../../assets/yokai/loseyokai_deebu.png'),
  atodeyaru: require('../../assets/yokai/loseyokai_atodeyaru.png'),
  scroll: require('../../assets/yokai/loseyokai_scroll.png'),
  tetsuya: require('../../assets/yokai/loseyokai_tetsuya.png'),
  nidoneel: require('../../assets/yokai/loseyokai_nidoneel.png'),
  hikakuzou: require('../../assets/yokai/loseyokai_hikakuzou.png'),
  peeping: require('../../assets/yokai/loseyokai_peeping.png'),
  mottemiteya: require('../../assets/yokai/loseyokai_mottemiteya.png'),
  moumuri: require('../../assets/yokai/loseyokai_moumuri.png'),
  atamadekkachi: require('../../assets/yokai/loseyokai_atamadekkachi.png'),
};

export const YOKAI_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/yokai_mikkabozu.mp4'),
  hyakume: require('../../assets/yokai/yokai_hyakume.mp4'),
  deebu: require('../../assets/yokai/yokai_deebu.mp4'),
  atodeyaru: require('../../assets/yokai/yokai_atodeyaru.mp4'),
  scroll: require('../../assets/yokai/yokai_scroll.mp4'),
  tetsuya: require('../../assets/yokai/yokai_tetsuya.mp4'),
  nidoneel: require('../../assets/yokai/yokai_nidoneel.mp4'),
  hikakuzou: require('../../assets/yokai/yokai_hikakuzou.mp4'),
  peeping: require('../../assets/yokai/yokai_peeping.mp4'),
  mottemiteya: require('../../assets/yokai/yokai_mottemiteya.mp4'),
  moumuri: require('../../assets/yokai/yokai_moumuri.mp4'),
  atamadekkachi: require('../../assets/yokai/yokai_atamadekkachi.mp4'),
};

export const YOKAI_LOSE_VIDEOS: { [key: string]: any } = {
  mikkabozu: require('../../assets/yokai/loseyokai_mikkabozu.mp4'),
  hyakume: require('../../assets/yokai/loseyokai_hyakume.mp4'),
  deebu: require('../../assets/yokai/loseyokai_deebu.mp4'),
  atodeyaru: require('../../assets/yokai/loseyokai_atodeyaru.mp4'),
  scroll: require('../../assets/yokai/loseyokai_scroll.mp4'),
  tetsuya: require('../../assets/yokai/loseyokai_tetsuya.mp4'),
  nidoneel: require('../../assets/yokai/loseyokai_nidoneel.mp4'),
  hikakuzou: require('../../assets/yokai/loseyokai_hikakuzou.mp4'),
  peeping: require('../../assets/yokai/loseyokai_peeping.mp4'),
  mottemiteya: require('../../assets/yokai/loseyokai_mottemiteya.mp4'),
  moumuri: require('../../assets/yokai/loseyokai_moumuri.mp4'),
  atamadekkachi: require('../../assets/yokai/loseyokai_atamadekkachi.mp4'),
};

// ストーリー画像
export const MIKKABOZU_EYES = require('../../assets/yokai/mikkabozu_eyes.png');
export const STORY_SCENE1_IMG = require('../../assets/story/mikkabozu_scene1.png');
export const STORY_SCENE2_IMG = require('../../assets/story/mikkabozu_scene2.png');
export const ATODEYARU_SCENE1_IMG = require('../../assets/story/atodeyaru_scene1.png');
export const ATODEYARU_SCENE2_IMG = require('../../assets/story/atodeyaru_scene2.png');
export const ATODEYARU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_atodeyaru.mp4');
export const DEEBU_SCENE1_IMG = require('../../assets/story/deebu_scene1.png');
export const DEEBU_SCENE2_IMG = require('../../assets/story/deebu_scene2.png');
export const DEEBU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_deebu.mp4');
export const MOUMURI_SCENE1_IMG = require('../../assets/story/moumuri_scene1.png');
export const MOUMURI_SCENE2_IMG = require('../../assets/story/moumuri_scene2.png');
export const MOUMURI_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_moumuri.mp4');
export const TETSUYA_SILHOUETTE = require('../../assets/yokai/tetsuya_silhouette.png');
export const MIKKABOZU_DEFEAT_VIDEO = require('../../assets/yokai/loseyokai_mikkabozu.mp4');

// マップ素材
export const WORLD1_BG = require('../../assets/map/bg/world1_bg.png');
export const NODE_FIST = require('../../assets/map/nodes/node_fist.png');
export const NODE_KATANA = require('../../assets/map/nodes/node_katana.png');
export const NODE_SCROLL = require('../../assets/map/nodes/node_scroll.png');
export const NODE_BRAIN = require('../../assets/map/nodes/node_brain.png');
export const NODE_BOSS = require('../../assets/map/nodes/node_boss.png');
export const NODE_LOCKED = require('../../assets/map/nodes/node_locked.png');

// バトル敵画像
export const ENEMY_IMAGES: { [key: string]: any } = {
  enemy01: require('../../assets/enemies/enemy01.png'),
  enemy02: require('../../assets/enemies/enemy02.png'),
  enemy03: require('../../assets/enemies/enemy03.png'),
  enemy04: require('../../assets/enemies/enemy04.png'),
  enemy05: require('../../assets/enemies/enemy05.png'),
  dragon_boss01: require('../../assets/enemies/dragon_boss01.png'),
  dragon_boss02: require('../../assets/enemies/dragon_boss02.png'),
  dragon_boss03: require('../../assets/enemies/dragon_boss03.png'),
  dragon_boss04: require('../../assets/enemies/dragon_boss04.png'),
};
'''

with open('src/data/assets.ts', 'w', encoding='utf-8') as f:
    f.write(assets_ts)
print('[OK] src/data/assets.ts')

# ============================================================
# 4. src/data/yokaiData.ts
# ============================================================
# Read YOKAI_LIST from App.tsx
import re
yokai_start = src.index("const YOKAI_LIST: YokaiData[] = [")
yokai_end = src.index("];\n", yokai_start) + 2

yokai_list_code = src[yokai_start:yokai_end]

yokai_data_ts = f'''import {{ YokaiData }} from './types';

export {yokai_list_code}
'''

with open('src/data/yokaiData.ts', 'w', encoding='utf-8') as f:
    f.write(yokai_data_ts)
print('[OK] src/data/yokaiData.ts')

# ============================================================
# 5. src/data/battleData.ts
# ============================================================
# Extract ENEMIES, BATTLE_WIN_QUOTES, BATTLE_LOSE_QUOTES
enemies_start = src.index("const ENEMIES = [")
enemies_end = src.index("];\n", enemies_start) + 2
enemies_code = src[enemies_start:enemies_end]
# Fix: ENEMIES references ENEMY_IMAGES which is now in assets
enemies_code = enemies_code.replace("image: ENEMY_IMAGES.", "image: ENEMY_IMAGES.")

win_start = src.index("const BATTLE_WIN_QUOTES = [")
win_end = src.index("];\n", win_start) + 2
win_code = src[win_start:win_end]

lose_start = src.index("const BATTLE_LOSE_QUOTES = [")
lose_end = src.index("];\n", lose_start) + 2
lose_code = src[lose_start:lose_end]

battle_data_ts = f'''import {{ ENEMY_IMAGES }} from './assets';

export {enemies_code}

export {win_code}

export {lose_code}
'''

with open('src/data/battleData.ts', 'w', encoding='utf-8') as f:
    f.write(battle_data_ts)
print('[OK] src/data/battleData.ts')

# ============================================================
# 6. src/utils/helpers.ts
# ============================================================
helpers_ts = '''import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVEL_XP_THRESHOLDS, LEVEL_TITLES, MAX_LEVEL, DAYS_PER_LEVEL, SESSION_KEY } from '../data/constants';
import { DailyLog } from '../data/types';

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string) {
  return dateStr.slice(5);
}

export function daysDiff(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStreakCount(logs: DailyLog[]): number {
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

export function getRankFromXp(xp: number) {
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const label = LEVEL_TITLES[level] || '名もなき者';
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const next = level >= 10 ? 0 : nextThreshold - xp;
  return { label, next, level };
}

export function getLevelFromXp(xp: number) {
  let level = 0;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_XP_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[level + 1] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
  const xpInLevel = xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const progress = level >= 10 ? 1 : xpInLevel / xpForLevel;
  return { 
    level, 
    title: LEVEL_TITLES[level] || '名もなき者',
    xp,
    xpInLevel,
    xpForLevel,
    progress,
    nextLevelXp: nextThreshold,
  };
}

export function getSamuraiLevelInfo(streak: number) {
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

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
'''

with open('src/utils/helpers.ts', 'w', encoding='utf-8') as f:
    f.write(helpers_ts)
print('[OK] src/utils/helpers.ts')

# ============================================================
# 7. src/utils/sounds.ts
# ============================================================
sounds_ts = '''import { Audio } from 'expo-av';
import { MASTER_VOLUME } from '../data/constants';
import {
  STARTUP_SOUND, TAP_SOUND, CONFIRM_SOUND, RITUAL_SOUND,
  CHECK_SOUND, CORRECT_SOUND, WRONG_SOUND, LEVELUP_SOUND,
  EXP_SOUND, EVOLUTION_SOUND, WIN_SOUND, FAIL_SOUND,
  ATTACK_SOUND, ENTER_SOUND, FOCUS_START_SOUND,
} from '../data/assets';

export async function playSound(source: any) {
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

export async function playPressSound() { await playSound(STARTUP_SOUND); }
export async function playTapSound() { await playSound(TAP_SOUND); }
export async function playConfirmSound() { await playSound(CONFIRM_SOUND); }
export async function playRitualSound() { await playSound(RITUAL_SOUND); }
export async function playCheckSound() { await playSound(CHECK_SOUND); }
export async function playCorrectSound() { await playSound(CORRECT_SOUND); }
export async function playWrongSound() { await playSound(WRONG_SOUND); }
export async function playLevelupSound() { await playSound(LEVELUP_SOUND); }
export async function playExpSound() { await playSound(EXP_SOUND); }
export async function playEvolutionSound() { await playSound(EVOLUTION_SOUND); }
export async function playWinSound() { await playSound(WIN_SOUND); }
export async function playFailSound() { await playSound(FAIL_SOUND); }
export async function playAttackSound() { await playSound(ATTACK_SOUND); }

export async function playEnterSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(ENTER_SOUND);
    await sound.setVolumeAsync(0.15);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.log('enter sound error', e);
  }
}

export async function playFocusStartSound() { await playSound(FOCUS_START_SOUND); }
'''

with open('src/utils/sounds.ts', 'w', encoding='utf-8') as f:
    f.write(sounds_ts)
print('[OK] src/utils/sounds.ts')

# ============================================================
# 8. src/utils/api.ts
# ============================================================
api_ts = '''import { SAMURAI_CHAT_URL, SAMURAI_MISSION_URL } from '../data/constants';
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
'''

with open('src/utils/api.ts', 'w', encoding='utf-8') as f:
    f.write(api_ts)
print('[OK] src/utils/api.ts')

# ============================================================
# 9. Modify App.tsx - Replace extracted code with imports
# ============================================================

# Build new import block
NEW_IMPORTS = """// === Extracted modules ===
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
  DOJO_GATE_DIM, DOJO_GATE_LIGHT, CONSULT_BG, INTRO_VIDEO,
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
"""

# Find the position to insert imports (after existing imports, before constants)
insert_marker = "// =========================\n// Config / Constants\n// ========================="
if insert_marker not in src:
    print('[ERROR] Cannot find Config/Constants marker')
    exit(1)

# Remove sections from App.tsx and replace with imports

# Remove from "// =========================\n// Config / Constants" to just before "export default function App()"
# But we need to keep the Notifications setup and the PRIVACY/TERMS text

# Strategy: Remove specific blocks, keep what's between

# Lines to remove (by finding exact text blocks):
blocks_to_remove = []

# Block 1: Config/Constants (API URLs, sound requires, image requires, etc) through YOKAI_LOSE_VIDEOS
block1_start = insert_marker
block1_end = "const YOKAI_LOSE_VIDEOS: { [key: string]: any } = {\n"
# Find end of YOKAI_LOSE_VIDEOS
idx = src.index(block1_end)
idx = src.index("};\n", idx) + 3

# Find what comes after - it should be the type YokaiFeature
remaining_after_block1 = src[idx:]

# Block 2: type/interface definitions through DEFAULT_SETTINGS
block2_start = "type YokaiFeature = "
block2_end_marker = "// =========================\n// Utils\n// ========================="

# Block 3: Utility functions
block3_end_marker = "// =========================\n// API\n// ========================="

# Block 4: API functions  
block4_end_marker = "// =========================\n// UI: Samurai Avatar"

# Let's do this more carefully - find exact line ranges
lines = src.split('\n')

# Find key line numbers
def find_line(text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    return -1

config_start = find_line("// Config / Constants")  # line ~44
yokai_feature_line = find_line("type YokaiFeature = ")
yokai_list_start = find_line("const YOKAI_LIST: YokaiData[] = [")
yokai_list_end_line = find_line("];", yokai_list_start) 
enemy_images_start = find_line("const ENEMY_IMAGES: { [key: string]: any } = {")
enemies_start_line = find_line("const ENEMIES = [")
enemies_end_line = find_line("];", enemies_start_line)
battle_win_start = find_line("const BATTLE_WIN_QUOTES = [")
battle_lose_end_line = find_line("];", find_line("const BATTLE_LOSE_QUOTES = ["))
level_titles_start = find_line("const LEVEL_TITLES: { [key: number]: string } = {")
session_key_line = find_line("const SESSION_KEY = ")
storage_keys_start = find_line("const HISTORY_KEY = ")
default_routines_end = find_line("];", find_line("const DEFAULT_ROUTINES = ["))
urge_line = find_line("const urgeMessage = ")
privacy_start = find_line("const PRIVACY_POLICY_TEXT = `")
terms_end = find_line("`;", find_line("const TERMS_OF_SERVICE_TEXT = `"))
types_start = find_line("// Types", find_line("// =====", terms_end) if terms_end > 0 else 0)
default_settings_end = find_line("};", find_line("const DEFAULT_SETTINGS: AppSettings = {"))
utils_start = find_line("// Utils", default_settings_end)
get_session_end = find_line("}", find_line("async function getSessionId"))
audio_helpers_start = find_line("// Audio helpers")
focus_start_end = find_line("}", find_line("async function playFocusStartSound"))
api_start = find_line("// API", focus_start_end)
api_end = find_line("// UI: Samurai Avatar") - 1

print(f'\n--- Line ranges ---')
print(f'Config/Constants: ~{config_start}')
print(f'YOKAI_LIST: {yokai_list_start}-{yokai_list_end_line}')
print(f'ENEMIES: {enemies_start_line}-{enemies_end_line}')
print(f'Types: ~{types_start}')
print(f'Utils: ~{utils_start}')
print(f'Audio: ~{audio_helpers_start}')
print(f'API: ~{api_start}-{api_end}')

# Now do the actual replacement
# Strategy: replace the entire block from Config/Constants to UI: Samurai Avatar
# with just the import statements + PRIVACY/TERMS text (which we keep in App.tsx)

# Extract privacy/terms text to keep
privacy_idx = src.index("const PRIVACY_POLICY_TEXT = `")
terms_end_str = "const TERMS_OF_SERVICE_TEXT = `"
terms_idx = src.index(terms_end_str)
terms_block_end = src.index("`;", terms_idx) + 2
privacy_terms_block = src[privacy_idx:terms_block_end + 1]

# Find the full block to remove
remove_start = src.index(insert_marker)
remove_end = src.index("// =========================\n// UI: Samurai Avatar")

# Build replacement
replacement = NEW_IMPORTS + "\n" + privacy_terms_block + "\n\n"

# Replace
new_src = src[:remove_start] + replacement + src[remove_end:]

# Write
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(new_src)

new_len = len(new_src)
removed = original_len - new_len
print(f'\n✅ Refactoring complete!')
print(f'   App.tsx: {original_len:,} -> {new_len:,} chars ({removed:,} chars removed)')
print(f'   New files: 7 created in src/')
