/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchSyntaxAnalysisViaQuranMcp } from '@/lib/syntaxAnalysisQuranMcp';
import type {
  SyntaxAnalysisIsmChart,
  SyntaxAnalysisResult,
  SyntaxAnalysisSarfChart,
  SyntaxAnalysisSarfColumnKey,
  SyntaxAnalysisVerbChart,
  SyntaxAnalysisVerbSlot,
} from 'types/SyntaxAnalysis';

type ErrorBody = { error: string };

const MAX_WORD_LENGTH = 200;

function extractJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonStr);
}

const SYNTAX_SARF_KEYS: SyntaxAnalysisSarfColumnKey[] = [
  'pastTense',
  'presentTense',
  'idea',
  'doer',
];

function isSarfFullColumnStrings(v: unknown): v is Record<SyntaxAnalysisSarfColumnKey, string> {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return SYNTAX_SARF_KEYS.every((k) => typeof o[k] === 'string');
}

function normalizeSarfChart(raw: unknown): SyntaxAnalysisSarfChart | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const s = raw as Record<string, unknown>;
  if (!isSarfFullColumnStrings(s.columnHeaders) || !isSarfFullColumnStrings(s.activeVoice)) {
    return undefined;
  }
  const partialStrings = (key: string): Partial<Record<SyntaxAnalysisSarfColumnKey, string>> => {
    const v = s[key];
    if (!v || typeof v !== 'object') return {};
    const o = v as Record<string, unknown>;
    const entries = SYNTAX_SARF_KEYS.filter((k) => typeof o[k] === 'string').map((k) => [
      k,
      o[k],
    ]) as [SyntaxAnalysisSarfColumnKey, string][];
    return Object.fromEntries(entries) as Partial<Record<SyntaxAnalysisSarfColumnKey, string>>;
  };
  return {
    columnHeaders: s.columnHeaders,
    activeVoice: s.activeVoice,
    passiveVoiceLabels: partialStrings('passiveVoiceLabels'),
    passiveVoiceForms: partialStrings('passiveVoiceForms'),
    commandingLabels: partialStrings('commandingLabels'),
    commandingForms: partialStrings('commandingForms'),
  };
}

const ISM_CASE_KEYS = ['Rafa', 'Nasab', 'Jar'] as const;
const ISM_NUMBER_KEYS = ['singular', 'dual', 'plural'] as const;

function normalizeIsmChart(raw: unknown): SyntaxAnalysisIsmChart | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const chart = raw as Record<string, unknown>;
  const valid = (['Masculine', 'Feminine'] as const).every((gender) => {
    const g = chart[gender];
    if (!g || typeof g !== 'object') return false;
    const go = g as Record<string, unknown>;
    return ISM_CASE_KEYS.every((caseName) => {
      const row = go[caseName];
      if (!row || typeof row !== 'object') return false;
      const ro = row as Record<string, unknown>;
      return ISM_NUMBER_KEYS.every((num) => typeof ro[num] === 'string');
    });
  });
  return valid ? (raw as SyntaxAnalysisIsmChart) : undefined;
}

const VERB_CHART_PERSON_KEYS = [
  '3rdPersonMasculine',
  '3rdPersonFeminine',
  '2ndPersonMasculine',
  '2ndPersonFeminine',
] as const;

/** Full iteration order including 1st person (not part of the four person-number rows). */
const VERB_CHART_ALL_KEYS: readonly (keyof SyntaxAnalysisVerbChart)[] = [
  ...VERB_CHART_PERSON_KEYS,
  '1stPerson',
];

function isVerbSlot(v: unknown): v is { pronoun: string; meaning: string; verb: string } {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.pronoun === 'string' && typeof o.meaning === 'string' && typeof o.verb === 'string'
  );
}

/**
 * Strict grid: every person row must be complete (otherwise the whole chart is dropped).
 * @returns {SyntaxAnalysisVerbChart | undefined} Parsed verb chart, or undefined if invalid.
 */
function normalizeVerbChartStrict(raw: unknown): SyntaxAnalysisVerbChart | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const fourOk = VERB_CHART_PERSON_KEYS.every((key) => {
    const block = o[key];
    if (!block || typeof block !== 'object') return false;
    const b = block as Record<string, unknown>;
    return (['singular', 'dual', 'plural'] as const).every((num) => isVerbSlot(b[num]));
  });
  if (!fourOk) return undefined;
  const first = o['1stPerson'];
  if (!first || typeof first !== 'object') return undefined;
  const fb = first as Record<string, unknown>;
  if (!isVerbSlot(fb.singular) || !isVerbSlot(fb.plural)) return undefined;
  return raw as SyntaxAnalysisVerbChart;
}

/**
 * Keep every person block that is individually valid so one bad row (e.g. incomplete 1st person)
 * does not strip the entire present/past chart from the API response.
 * @returns {SyntaxAnalysisVerbChart | undefined} Chart with only valid person blocks, or undefined.
 */
function normalizeVerbChartBestEffort(raw: unknown): SyntaxAnalysisVerbChart | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const out: Partial<SyntaxAnalysisVerbChart> = {};

  VERB_CHART_ALL_KEYS.forEach((personKey) => {
    const block = o[personKey];
    if (!block || typeof block !== 'object') return;
    const b = block as Record<string, unknown>;

    if (personKey === '1stPerson') {
      if (!isVerbSlot(b.singular) || !isVerbSlot(b.plural)) return;
      out['1stPerson'] = {
        singular: b.singular as SyntaxAnalysisVerbSlot,
        plural: b.plural as SyntaxAnalysisVerbSlot,
      };
      return;
    }

    const sg = b.singular;
    const du = b.dual;
    const pl = b.plural;
    if (!isVerbSlot(sg) || !isVerbSlot(du) || !isVerbSlot(pl)) return;
    out[personKey] = {
      singular: sg as SyntaxAnalysisVerbSlot,
      dual: du as SyntaxAnalysisVerbSlot,
      plural: pl as SyntaxAnalysisVerbSlot,
    };
  });

  if (Object.keys(out).length === 0) return undefined;
  return out as SyntaxAnalysisVerbChart;
}

function normalizeVerbChart(raw: unknown): SyntaxAnalysisVerbChart | undefined {
  return normalizeVerbChartStrict(raw) ?? normalizeVerbChartBestEffort(raw);
}

const VERB_PRESENT_CHART_JSON_KEYS = [
  'verbPresentTenseChart',
  'verbPresentChart',
  'presentTenseVerbChart',
] as const;

function pickFirstVerbChartRaw(r: Record<string, unknown>, keys: readonly string[]): unknown {
  const key = keys.find((k) => {
    const v = r[k];
    return Boolean(v && typeof v === 'object');
  });
  return key ? r[key] : undefined;
}

function verbTensePatternHints(
  patternType: string,
  wordPattern: string,
): {
  looksPresent: boolean;
  looksPast: boolean;
} {
  const looksPresent =
    /مضارع/.test(patternType) || /\b(imperfect|present\s+tense|\bpresent\b)/i.test(wordPattern);
  const looksPast =
    /ماض[يى]/.test(patternType) || /\b(perfect|past\s+tense|\bpast\b)/i.test(wordPattern);
  return { looksPresent, looksPast };
}

function normalizeResult(raw: unknown): SyntaxAnalysisResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const root = r.rootLetter as Record<string, unknown> | undefined;
  const pattern = r.pattern as Record<string, unknown> | undefined;
  const breakdown = r.wordBreakDown;

  if (
    !root ||
    typeof root.arabicName !== 'string' ||
    typeof root.rootLetter !== 'string' ||
    !pattern ||
    typeof pattern.wordPattern !== 'string' ||
    typeof pattern.patternType !== 'string' ||
    !Array.isArray(breakdown)
  ) {
    return null;
  }

  const { patternType, wordPattern } = pattern;

  const parts: SyntaxAnalysisResult['wordBreakDown'] = breakdown.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const p = item as Record<string, unknown>;
    if (typeof p.part === 'string' && typeof p.meaning === 'string') {
      return [{ part: p.part, meaning: p.meaning }];
    }
    return [];
  });

  const base: SyntaxAnalysisResult = {
    rootLetter: {
      arabicName: root.arabicName,
      rootLetter: root.rootLetter,
    },
    wordBreakDown: parts,
    pattern: {
      wordPattern: pattern.wordPattern,
      patternType: pattern.patternType,
    },
  };

  let result: SyntaxAnalysisResult = base;
  const sarfChart = normalizeSarfChart(r.sarfChart);
  if (sarfChart) result = { ...result, sarfChart };

  const { looksPresent, looksPast } = verbTensePatternHints(patternType, wordPattern);

  const legacyVerbChart = normalizeVerbChart(r.verbChart);
  let verbPresentTenseChart = normalizeVerbChart(
    pickFirstVerbChartRaw(r, VERB_PRESENT_CHART_JSON_KEYS),
  );
  let verbPastTenseChart = normalizeVerbChart(r.verbPastTenseChart);

  const ambiguousTense = looksPresent && looksPast;
  if (!ambiguousTense) {
    if (!verbPresentTenseChart && legacyVerbChart && looksPresent) {
      verbPresentTenseChart = legacyVerbChart;
    }
    if (!verbPastTenseChart && legacyVerbChart && looksPast) {
      verbPastTenseChart = legacyVerbChart;
    }
  }

  let verbChartOut: SyntaxAnalysisVerbChart | undefined = legacyVerbChart;
  if (
    verbChartOut &&
    (verbPresentTenseChart === verbChartOut || verbPastTenseChart === verbChartOut)
  ) {
    verbChartOut = undefined;
  }

  if (verbPresentTenseChart) result = { ...result, verbPresentTenseChart };
  if (verbPastTenseChart) result = { ...result, verbPastTenseChart };
  if (verbChartOut) result = { ...result, verbChart: verbChartOut };

  const ismChart = normalizeIsmChart(r.ismChart);
  if (ismChart) result = { ...result, ismChart };
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyntaxAnalysisResult | ErrorBody>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model =
    process.env.SYNTAX_ANALYSIS_MODEL || process.env.OPENAI_SYNTAX_MODEL || 'gpt-4o-mini';

  const envProvider = process.env.SYNTAX_ANALYSIS_PROVIDER?.trim().toLowerCase();
  /**
   * `quran_mcp` — [Quran MCP](https://mcp.quran.ai/documentation) Streamable HTTP (no OpenAI key).
   * `openai` — LLM JSON (requires OPENAI_API_KEY).
   * Default: OpenAI when a key is set, otherwise Quran MCP.
   */
  let syntaxProvider: 'openai' | 'quran_mcp';
  if (envProvider === 'quran_mcp' || envProvider === 'openai') {
    syntaxProvider = envProvider;
  } else if (apiKey) {
    syntaxProvider = 'openai';
  } else {
    syntaxProvider = 'quran_mcp';
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

  if (syntaxProvider === 'openai' && !apiKey) {
    return res.status(503).json({
      error:
        'Syntax analysis (OpenAI) is not configured. Set OPENAI_API_KEY, or set SYNTAX_ANALYSIS_PROVIDER=quran_mcp to use https://mcp.quran.ai/',
    });
  }

  if (syntaxProvider === 'quran_mcp') {
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

  const systemPrompt = `You are an expert in Quranic Arabic morphology, صرف (Sarf), and نحو.
Respond with ONLY valid JSON (no markdown fences). Include the REQUIRED fields below. When the analyzed word supports them, also include the OPTIONAL chart objects using these exact key names and nesting.

REQUIRED:
- rootLetter: { "arabicName": string, "rootLetter": string }
  - arabicName: short Arabic gloss or label for the root (may repeat or describe the letters).
  - rootLetter: the lexical root as Arabic consonants (usually three letters in Arabic script).
- wordBreakDown: [ { "part": string, "meaning": string }, ... ]
- pattern: { "wordPattern": string, "patternType": string }
  - patternType: concise Arabic grammatical category for this surface form (e.g. فعل ماضي، فعل مضارع، اسم فاعل، مصدر).
  - wordPattern: fuller morphological description of THIS token — typically English (person, gender, number, verb form/bāb, noun case, etc.), e.g. "3rd person masculine singular (form IV) imperfect verb".

OPTIONAL — include when relevant (omit entirely if not applicable). Prefer this order in your JSON object when multiple charts apply:

1) sarfChart — verb-derived morphology table (active / passive / commanding rows for the UI):
{
  "sarfChart": {
    "columnHeaders": {
      "pastTense": string,
      "presentTense": string,
      "idea": string,
      "doer": string
    },
    "activeVoice": { "pastTense": string, "presentTense": string, "idea": string, "doer": string },
    "passiveVoiceLabels": { same four keys, strings (row labels e.g. Passive + Arabic grammar terms) },
    "passiveVoiceForms": { same four keys, Arabic strings },
    "commandingLabels": { optional keys among the four; strings for أمر / نهى / ظرف },
    "commandingForms": { same optional keys; Arabic; multiple ظرف variants may use " | " },
    For commanding rows omit "doer" or leave unused cells absent if there is no أمر/نهى/ظرف counterpart under doer.
  }
}
- columnHeaders: human-readable titles per column, e.g. "PastTense - فعل ماضى", "PresentTense - فعل مضارع", "Idea - مصدر", "Doer - اسم فاعل".
- Align passiveVoiceLabels with passiveVoiceForms; commandingLabels with commandingForms.

2) verbPresentTenseChart & verbPastTenseChart — same structure for مضارع and ماضي conjugations (full grid):
Each chart object has keys exactly:
"3rdPersonMasculine" | "3rdPersonFeminine" | "2ndPersonMasculine" | "2ndPersonFeminine" | "1stPerson"
- For 3rd/2nd persons each value is: { "singular": verbSlot, "dual": verbSlot, "plural": verbSlot }
- For "1stPerson": { "singular": verbSlot, "plural": verbSlot } only (no dual).
- verbSlot = { "pronoun": string (Arabic), "meaning": string (short English), "verb": string (Arabic conjugated form) }

3) verbChart — legacy optional key; same object shape as verbPastTenseChart (full conjugation grid). Include when returned separately from verbPastTenseChart if needed.

4) ismChart — اسم declension grid for a singular noun/adjective template:
{
  "ismChart": {
    "Masculine": {
      "Rafa": { "singular": string, "dual": string, "plural": string },
      "Nasab": { "singular": string, "dual": string, "plural": string },
      "Jar": { "singular": string, "dual": string, "plural": string }
    },
    "Feminine": {
      "Rafa": { "singular": string, "dual": string, "plural": string },
      "Nasab": { "singular": string, "dual": string, "plural": string },
      "Jar": { "singular": string, "dual": string, "plural": string }
    }
  }
}

Use Arabic script for Arabic forms and pronouns; keep English glosses concise.`;

  const userPrompt = `Verse context: ${verseKey || 'unknown'}
Arabic word (Uthmani): ${text}

Analyze this single word and fill the JSON.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return res.status(502).json({
        error: `OpenAI error (${openaiRes.status}): ${errText.slice(0, 200)}`,
      });
    }

    const completion = (await openaiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'Empty model response' });
    }

    let parsed: unknown;
    try {
      parsed = extractJsonFromContent(content);
    } catch {
      return res.status(502).json({ error: 'Model returned invalid JSON' });
    }

    const normalized = normalizeResult(parsed);
    if (!normalized) {
      return res.status(502).json({ error: 'Could not normalize model output' });
    }

    return res.status(200).json(normalized);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Syntax analysis failed';
    return res.status(500).json({ error: message });
  }
}
