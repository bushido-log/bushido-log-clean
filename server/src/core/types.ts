// server/src/core/types.ts

export type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

// ===== API (RAGGA COACH) =====
export type RaggaRequestBody = {
  text: string;
};

export type RaggaCoachResult = {
  patois: string;
  english: string;
  japanese: string;
};

// 汎用のAPIレスポンス（成功/失敗を統一）
export type ApiOk<T> = {
  ok: true;
  data: T;
};

export type ApiNg = {
  ok: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiOk<T> | ApiNg;

// ===== ENV =====
export type ServerEnv = {
  PORT?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string; // 例: gpt-4.1-mini など
  ALLOWED_ORIGINS?: string; // 例: "http://localhost:19006,https://example.com"
};