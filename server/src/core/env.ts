// server/src/core/env.ts
import 'dotenv/config';
import type { ServerEnv } from './types';

function pickEnv(): ServerEnv {
  return {
    PORT: process.env.PORT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
}

export const env = pickEnv();

export function getPort(): number {
  const raw = env.PORT ?? '3001';
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0) throw new Error(`Invalid PORT: ${raw}`);
  return port;
}

export function getAllowedOrigins(): string[] {
  const raw = env.ALLOWED_ORIGINS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function requireOpenAIKey(): string {
  const key = env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error('OPENAI_API_KEY is missing. Put it in server/.env');
  return key;
}

export function getOpenAIModel(): string | undefined {
  const m = env.OPENAI_MODEL?.trim();
  return m ? m : undefined;
}