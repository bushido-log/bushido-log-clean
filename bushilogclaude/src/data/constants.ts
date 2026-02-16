// Config / Constants
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
// Samurai Walk keys
export const DIFFICULTY_KEY = 'BUSHIDO_DIFFICULTY_V1';
export const WALK_DATA_KEY = 'BUSHIDO_WALK_DATA_V1';
export const WALK_BOSS_KEY = 'BUSHIDO_WALK_BOSS_V1';
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
export const W1_BATTLE_KEY = 'BUSHIDO_W1_BATTLE_V1';
