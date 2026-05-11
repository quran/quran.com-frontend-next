import type { SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

import { SYNTAX_ANALYSIS_MOCK_RESPONSE } from '@/services/syntaxAnalysis.mock';

export type SyntaxAnalysisRequest = {
  /** Preferred: Uthmani text from the selected `Word` */
  textUthmani: string;
  verseKey?: string;
};

export type SyntaxAnalysisErrorBody = {
  error: string;
};

/** When true, `fetchSyntaxAnalysis` returns pasted mock data (see `syntaxAnalysis.mock.ts`). */
export function isSyntaxAnalysisMockMode(): boolean {
  return process.env.NEXT_PUBLIC_SYNTAX_ANALYSIS_MOCK === 'true';
}

/**
 * Calls the Next.js API route that proxies to an LLM (OpenAI when `OPENAI_API_KEY` is set),
 * unless mock mode is on — then returns `SYNTAX_ANALYSIS_MOCK_RESPONSE` with no token.
 *
 * Must run in the browser or any environment where `/api/syntax/analyze` is reachable (real mode only).
 */
export async function fetchSyntaxAnalysis(
  payload: SyntaxAnalysisRequest,
): Promise<SyntaxAnalysisResult> {
  if (isSyntaxAnalysisMockMode()) {
    void payload;
    await new Promise((r) => {
      setTimeout(r, 200);
    });
    return structuredClone(SYNTAX_ANALYSIS_MOCK_RESPONSE);
  }

  const res = await fetch('/api/syntax/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as SyntaxAnalysisResult | SyntaxAnalysisErrorBody;

  if (!res.ok || 'error' in body) {
    throw new Error(
      'error' in body ? body.error : `Syntax analysis failed (${res.status})`,
    );
  }

  return body;
}

/**
 * Resolves display text for syntax analysis from a Word-like object.
 * `WordVerse` does not carry `textUthmani`; use fields on `Word` instead.
 */
export function getWordTextUthmaniForSyntax(word: {
  textUthmani?: string;
  qpcUthmaniHafs?: string;
  text?: string;
}): string {
  return (word.textUthmani || word.qpcUthmaniHafs || word.text || '').trim();
}
