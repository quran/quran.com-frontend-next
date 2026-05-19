import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

import { applyOptionalChartsToResult } from '@/lib/syntaxAnalysisCharts';
import { runMcpSyntaxStudyOnClient } from '@/lib/syntaxAnalysisQuranMcpMorphology';
import { buildOptionalChartsFromMcp } from '@/lib/syntaxChartsFromMcp';
import type { SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

const DEFAULT_QURAN_MCP_URL = 'https://mcp.quran.ai/';

export type QuranMcpSyntaxOptions = {
  textUthmani: string;
  verseKey?: string;
  /** Base URL for Streamable HTTP MCP (per https://mcp.quran.ai/documentation ). */
  mcpUrl?: string;
};

/**
 * Grounded word study from [Quran MCP](https://mcp.quran.ai/) (`fetch_word_morphology` + `fetch_word_paradigm`).
 * Sarf and verb charts are derived from MCP paradigm stems (same JSON shapes as the legacy analyzer).
 * @returns {@link SyntaxAnalysisResult} with optional charts when paradigm data is available.
 */
export async function fetchSyntaxAnalysisViaQuranMcp(
  options: QuranMcpSyntaxOptions,
): Promise<SyntaxAnalysisResult> {
  const baseUrl = options.mcpUrl || process.env.QURAN_SYNTAX_MCP_URL || DEFAULT_QURAN_MCP_URL;
  const trimmed = baseUrl.trim();
  const url = new URL(trimmed.endsWith('/') ? trimmed : `${trimmed}/`);

  const transport = new StreamableHTTPClientTransport(url);
  const client = new Client({ name: 'quran.com-frontend', version: '1.0.0' });

  try {
    await client.connect(transport);
    const bundle = await runMcpSyntaxStudyOnClient(client, options.textUthmani, options.verseKey);
    const rawCharts = buildOptionalChartsFromMcp(bundle.pickedWord, bundle.paradigm);
    return applyOptionalChartsToResult(bundle.base, rawCharts);
  } finally {
    await client.close().catch(() => undefined);
  }
}
