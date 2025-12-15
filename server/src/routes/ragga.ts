// server/src/routes/ragga.ts
import type { Request, Response } from 'express';
import { requireOpenAIKey, getOpenAIModel } from '../core/env';
import type { ApiResponse, RaggaCoachResult, RaggaRequestBody } from '../core/types';

export async function raggaHandler(req: Request, res: Response<ApiResponse<RaggaCoachResult>>) {
  try {
    const body = (req.body ?? {}) as RaggaRequestBody;

    if (!body.text || !body.text.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'text is required',
      });
    }

    // ここでENVの存在チェック（キー無かったらここでエラーにする）
    requireOpenAIKey();
    const model = getOpenAIModel() ?? 'gpt-4.1-mini';

    // まだOpenAI呼び出しは繋がない（次のステップでやる）
    // まずは動作確認のためダミー応答
    const dummy: RaggaCoachResult = {
      patois: `Mi hear yuh: ${body.text}`,
      english: `I heard you: ${body.text}`,
      japanese: `受け取ったメッセージ: ${body.text}`,
    };

    return res.json({ ok: true, data: dummy });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.message ?? 'unknown error',
      details: e,
    });
  }
}