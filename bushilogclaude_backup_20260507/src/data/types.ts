// === Samurai Walk: Difficulty & Walk Data ===
export type Difficulty = 'easy' | 'normal' | 'hard';

export type WalkDayLog = {
  date: string;
  steps: number;
  damageDealt: number;
};

export type WalkData = {
  todaySteps: number;
  totalSteps: number;
  streak: number;        // 連続日数
  lastActiveDate: string;
  saboriDays: number;    // 連続サボり日数
  dailyLogs: WalkDayLog[];
};

export const DEFAULT_WALK_DATA: WalkData = {
  todaySteps: 0,
  totalSteps: 0,
  streak: 0,
  lastActiveDate: '',
  saboriDays: 0,
  dailyLogs: [],
};

export type WalkBossState = {
  bossIndex: number;       // 現在のボス (0-4)
  currentHp: number;       // 現在HP
  maxHp: number;           // 最大HP
  damageToday: number;     // 今日与えたダメージ
  lastDamageDate: string;  // 最後にダメージを適用した日
  defeated: boolean[];     // 倒したボスの記録
};

export const DEFAULT_WALK_BOSS: WalkBossState = {
  bossIndex: 0,
  currentHp: 30000,
  maxHp: 30000,
  damageToday: 0,
  lastDamageDate: '',
  defeated: [false, false, false, false, false],
};

export type YokaiFeature = 'consult' | 'gratitude' | 'goal' | 'review' | 'focus' | 'alarm';

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
