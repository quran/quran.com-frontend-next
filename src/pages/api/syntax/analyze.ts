import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchSyntaxAnalysisViaQuranMcp } from '@/lib/syntaxAnalysisQuranMcp';
import type { SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

type ErrorBody = { error: string };

const MAX_WORD_LENGTH = 200;

/**
 * POST `/api/syntax/analyze` — morphology + optional sarf/verb charts via
 * [Quran MCP](https://mcp.quran.ai/documentation) (Streamable HTTP).
 * @returns {Promise<void>} JSON body: `SyntaxAnalysisResult` or `{ error }`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyntaxAnalysisResult | ErrorBody>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { textUthmani, verseKey } = req.body as {
    textUthmani?: string;
    verseKey?: string;
  };

  const text = typeof textUthmani === 'string' ? textUthmani.trim() : '';
  if (!text) {
    return res.status(400).json({ error: 'Missing or empty textUthmani' });
  }
  if (text.length > MAX_WORD_LENGTH) {
    return res.status(400).json({ error: 'textUthmani too long' });
  }

  try {
    const fromMcp = await fetchSyntaxAnalysisViaQuranMcp({
      textUthmani: text,
      verseKey: typeof verseKey === 'string' ? verseKey : undefined,
    });
    return res.status(200).json(fromMcp);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Quran MCP syntax analysis failed';
    return res.status(502).json({ error: message });
  }
}
