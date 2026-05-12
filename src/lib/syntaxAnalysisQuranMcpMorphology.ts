/* eslint-disable max-lines -- MCP response mapping is verbose but linear */
import type { Client } from '@modelcontextprotocol/sdk/client';

import type { SyntaxAnalysisBreakdownPart, SyntaxAnalysisResult } from 'types/SyntaxAnalysis';

/** Verse key as surah:ayah (e.g. 2:255). */
const AYAH_KEY_RE = /^\s*\d{1,3}:\d{1,3}\s*$/;

export type MorphologyWord = Record<string, unknown>;

function str(o: MorphologyWord, key: string): string | undefined {
  const v = o[key];
  return typeof v === 'string' ? v : undefined;
}

function obj(o: MorphologyWord, key: string): Record<string, unknown> | undefined {
  const v = o[key];
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

function arr(o: MorphologyWord, key: string): unknown[] | undefined {
  const v = o[key];
  return Array.isArray(v) ? v : undefined;
}

export function isValidAyahKey(verseKey: string | undefined): verseKey is string {
  if (!verseKey) return false;
  return AYAH_KEY_RE.test(verseKey);
}

export function pickMorphologyWord(
  words: MorphologyWord[],
  textUthmani: string,
): MorphologyWord | undefined {
  if (!words.length) return undefined;
  const t = textUthmani.trim();
  const exact = words.find((w) => str(w, 'text_uthmani')?.trim() === t);
  if (exact) return exact;
  return (
    words.find(
      (w) =>
        (str(w, 'text_uthmani')?.includes(t) ?? false) ||
        (t.includes(str(w, 'text_uthmani') || '') && str(w, 'text_uthmani')),
    ) ?? words[0]
  );
}

function englishPatternLine(w: MorphologyWord): string {
  const desc = str(w, 'description')?.trim();
  if (desc) return desc;
  const g = obj(w, 'grammatical_features');
  if (!g) return str(w, 'translation')?.trim() || 'Morphological analysis (Quran MCP)';
  const parts: string[] = [];
  const push = (label: string, key: string) => {
    const v = g[key];
    if (v != null && String(v)) parts.push(`${label}: ${v}`);
  };
  push('POS', 'part_of_speech');
  push('person', 'person');
  push('gender', 'gender');
  push('number', 'number');
  push('aspect', 'aspect');
  push('mood', 'mood');
  push('case', 'case');
  const vf = g.verb_form;
  if (vf != null) parts.push(`verb form: ${vf}`);
  return parts.join('; ') || 'Morphological analysis (Quran MCP)';
}

function arabicPatternType(w: MorphologyWord): string {
  const g = obj(w, 'grammatical_features');
  const pos = String(g?.part_of_speech || '').toLowerCase();
  if (pos.includes('verb')) {
    const a = String(g?.aspect || '').toLowerCase();
    if (a.includes('perfect')) return 'فعل ماضي';
    if (a.includes('imperfect')) return 'فعل مضارع';
    if (a.includes('imperative')) return 'فعل أمر';
    return 'فعل';
  }
  if (pos.includes('noun') || pos.includes('adjective') || pos.includes('participle')) {
    const c = String(g?.case || '').toLowerCase();
    if (c.includes('gen')) return 'اسم مجرور';
    if (c.includes('acc')) return 'اسم منصوب';
    if (c.includes('nom')) return 'اسم مرفوع';
    return 'اسم';
  }
  if (pos.includes('prep')) return 'حرف جر';
  if (pos.includes('pron')) return 'ضمير';
  if (pos.includes('particle') || pos.includes('part')) return 'أداة';
  return 'صيغة قرآنية';
}

function segmentsToBreakdown(w: MorphologyWord): SyntaxAnalysisBreakdownPart[] {
  const segs = arr(w, 'morpheme_segments');
  if (segs?.length) {
    return segs.flatMap((raw) => {
      if (!raw || typeof raw !== 'object') return [];
      const s = raw as Record<string, unknown>;
      const part = typeof s.text === 'string' ? s.text.trim() : '';
      if (!part) return [];
      const g1 = typeof s.grammar_description === 'string' ? s.grammar_description.trim() : '';
      const g2 = typeof s.part_of_speech_name === 'string' ? s.part_of_speech_name.trim() : '';
      const meaning = g1 || g2 || '—';
      return [{ part, meaning }];
    });
  }
  const whole = str(w, 'text_uthmani')?.trim() || '';
  if (!whole) return [];
  return [{ part: whole, meaning: str(w, 'translation')?.trim() || englishPatternLine(w) }];
}

export function morphologyWordToSyntaxResult(w: MorphologyWord): SyntaxAnalysisResult {
  const rootLetters = (str(w, 'root') || str(w, 'lemma') || '—').trim() || '—';
  const arabicName = (str(w, 'lemma') || str(w, 'root') || rootLetters).trim() || rootLetters;
  return {
    rootLetter: { arabicName, rootLetter: rootLetters },
    pattern: { wordPattern: englishPatternLine(w), patternType: arabicPatternType(w) },
    wordBreakDown: segmentsToBreakdown(w),
  };
}

export function parseToolJsonPayload(result: unknown): unknown {
  if (!result || typeof result !== 'object') throw new Error('Invalid MCP tool response');
  const r = result as {
    structuredContent?: unknown;
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
  };
  if (r.isError) {
    const msg =
      r.content
        ?.filter(
          (c): c is { type: 'text'; text: string } =>
            c.type === 'text' && typeof c.text === 'string',
        )
        .map((c) => c.text)
        .join('\n') || 'MCP tool returned an error';
    throw new Error(msg);
  }
  if (r.structuredContent && typeof r.structuredContent === 'object') {
    return r.structuredContent;
  }
  const textBlock = r.content?.find((c) => c.type === 'text' && typeof c.text === 'string');
  if (!textBlock?.text) throw new Error('Empty MCP tool response');
  return JSON.parse(textBlock.text) as unknown;
}

/**
 * Calls `fetch_grounding_rules` then `fetch_word_morphology` on an initialized MCP client.
 * @returns {Promise<SyntaxAnalysisResult>} Normalized result for the resolved word (no optional charts).
 */
export async function runFetchWordMorphologyOnClient(
  client: Client,
  textUthmani: string,
  verseKey?: string,
): Promise<SyntaxAnalysisResult> {
  await client.callTool({ name: 'fetch_grounding_rules', arguments: {} });

  const morphArgs: Record<string, string> = {};
  if (isValidAyahKey(verseKey)) {
    morphArgs.ayah_key = verseKey.trim();
    morphArgs.word_text = textUthmani;
  } else {
    morphArgs.word = textUthmani;
  }

  const morphResult = await client.callTool({
    name: 'fetch_word_morphology',
    arguments: morphArgs,
  });

  const payload = parseToolJsonPayload(morphResult) as { words?: MorphologyWord[] };
  const words = Array.isArray(payload.words) ? payload.words : [];
  const picked = pickMorphologyWord(words, textUthmani);
  if (!picked) throw new Error('Quran MCP returned no morphology for this word');
  return morphologyWordToSyntaxResult(picked);
}
