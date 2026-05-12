import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';

import { runFetchWordMorphologyOnClient } from '@/lib/syntaxAnalysisQuranMcpMorphology';
import type { SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

const DEFAULT_QURAN_MCP_URL = 'https://mcp.quran.ai/';

export type QuranMcpSyntaxOptions = {
  textUthmani: string;
  verseKey?: string;
  /** Base URL for Streamable HTTP MCP (per https://mcp.quran.ai/documentation ). */
  mcpUrl?: string;
};

/**
 * Grounded word morphology from [Quran MCP](https://mcp.quran.ai/) via Streamable HTTP.
 * @returns {@link SyntaxAnalysisResult} derived from `fetch_word_morphology` (charts omitted).
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
    return await runFetchWordMorphologyOnClient(client, options.textUthmani, options.verseKey);
  } finally {
    await client.close().catch(() => undefined);
  }
}
