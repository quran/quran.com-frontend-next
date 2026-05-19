/* eslint-disable max-lines -- chart normalization mirrors API contract */
import type {
  SyntaxAnalysisIsmChart,
  SyntaxAnalysisResult,
  SyntaxAnalysisSarfChart,
  SyntaxAnalysisSarfColumnKey,
  SyntaxAnalysisVerbChart,
  SyntaxAnalysisVerbSlot,
} from 'types/SyntaxAnalysis';

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

export function normalizeSarfChart(raw: unknown): SyntaxAnalysisSarfChart | undefined {
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

export function normalizeIsmChart(raw: unknown): SyntaxAnalysisIsmChart | undefined {
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

export function normalizeVerbChart(raw: unknown): SyntaxAnalysisVerbChart | undefined {
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
  const pt = patternType;
  const wp = wordPattern;
  const looksPresent =
    /مضارع/.test(pt) || /مضارع/.test(wp) || /\b(imperfect|present\s+tense|\bpresent\b)/i.test(wp);
  const looksPast =
    /ماض[يى]/.test(pt) || /ماض[يى]/.test(wp) || /\b(perfect|past\s+tense|\bpast\b)/i.test(wp);
  return { looksPresent, looksPast };
}

/* eslint-disable react-func/max-lines-per-function -- verb merge mirrors API rules */
function mergeVerbChartsOntoResult(
  result: SyntaxAnalysisResult,
  r: Record<string, unknown>,
  patternType: string,
  wordPattern: string,
): SyntaxAnalysisResult {
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

  let out = result;
  if (verbPresentTenseChart) out = { ...out, verbPresentTenseChart };
  if (verbPastTenseChart) out = { ...out, verbPastTenseChart };
  if (verbChartOut) out = { ...out, verbChart: verbChartOut };
  return out;
}
/* eslint-enable react-func/max-lines-per-function */

/**
 * Merges optional chart keys from a partial model payload onto an existing base result
 * (same rules as full `/api/syntax/analyze` OpenAI normalization for charts).
 * @returns {SyntaxAnalysisResult} Base plus any valid optional charts from `rawCharts`.
 */
export function applyOptionalChartsToResult(
  base: SyntaxAnalysisResult,
  rawCharts: unknown,
): SyntaxAnalysisResult {
  if (!rawCharts || typeof rawCharts !== 'object') return base;
  const r = rawCharts as Record<string, unknown>;
  const { patternType, wordPattern } = base.pattern;

  let result: SyntaxAnalysisResult = { ...base };
  const sarfChart = normalizeSarfChart(r.sarfChart);
  if (sarfChart) result = { ...result, sarfChart };

  result = mergeVerbChartsOntoResult(result, r, patternType, wordPattern);

  const ismChart = normalizeIsmChart(r.ismChart);
  if (ismChart) result = { ...result, ismChart };
  return result;
}
