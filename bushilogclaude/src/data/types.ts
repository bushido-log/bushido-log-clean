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
