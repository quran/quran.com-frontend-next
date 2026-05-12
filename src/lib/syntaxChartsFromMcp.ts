import type { MorphologyWord } from '@/lib/syntaxAnalysisQuranMcpMorphology';
import type {
  SyntaxAnalysisVerbChart,
  SyntaxAnalysisVerbSlot,
} from 'types/SyntaxAnalysis';

type ParadigmStem = { stem: string; description: string };

function str(w: MorphologyWord, key: string): string | undefined {
  const v = w[key];
  return typeof v === 'string' ? v : undefined;
}

function asStemRows(raw: unknown): ParadigmStem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const o = item as Record<string, unknown>;
    const stem = typeof o.stem === 'string' ? o.stem.trim() : '';
    const description = typeof o.description === 'string' ? o.description.trim() : '';
    if (!stem) return [];
    return [{ stem, description: description || stem }];
  });
}

type ParadigmPayload = {
  perfect: ParadigmStem[];
  imperfect: ParadigmStem[];
  imperative: ParadigmStem[];
  lemma: string;
  root: string;
  gloss: string;
};

function firstLemmaGloss(payload: Record<string, unknown>): string {
  const cands = payload.candidate_lemmas;
  if (!Array.isArray(cands) || !cands.length) return '';
  const first = cands[0];
  if (!first || typeof first !== 'object') return '';
  const g = (first as Record<string, unknown>).gloss;
  return typeof g === 'string' ? g.trim() : '';
}

function unwrapParadigmPayload(raw: unknown): ParadigmPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const inner = o.paradigm;
  const bucket =
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as Record<string, unknown>)
      : o;
  const perfect = asStemRows(bucket.perfect);
  const imperfect = asStemRows(bucket.imperfect);
  const imperative = asStemRows(bucket.imperative);
  const lemma = typeof o.lemma === 'string' ? o.lemma.trim() : '';
  const root = typeof o.root === 'string' ? o.root.trim() : '';
  const gloss = firstLemmaGloss(o) || str(o as unknown as MorphologyWord, 'gloss')?.trim() || '';
  if (!perfect.length && !imperfect.length && !imperative.length) return null;
  return { perfect, imperfect, imperative, lemma, root, gloss };
}

/** Maps English paradigm descriptions to our verb-grid slot coordinates. */
type SlotCoord = {
  chartKey: keyof SyntaxAnalysisVerbChart;
  number: 'singular' | 'dual' | 'plural';
};

function slotFromDescription(description: string): SlotCoord | null {
  const d = description.toLowerCase();
  const has = (re: RegExp) => re.test(d);

  let person: '1' | '2' | '3' | null = null;
  if (has(/\b1st\b/) || has(/\bfirst person\b/)) person = '1';
  else if (has(/\b2nd\b/) || has(/\bsecond person\b/)) person = '2';
  else if (has(/\b3rd\b/) || has(/\bthird person\b/)) person = '3';
  if (!person) return null;

  let number: 'singular' | 'dual' | 'plural' = 'singular';
  if (has(/\bdual\b/)) number = 'dual';
  else if (has(/\bplural\b/)) number = 'plural';

  if (person === '1') {
    const n: 'singular' | 'plural' = has(/\bplural\b/) ? 'plural' : 'singular';
    return { chartKey: '1stPerson', number: n };
  }

  const feminine = has(/\bfeminine\b/) && !has(/\bmasculine feminine\b/);
  const chartKey = (() => {
    if (person === '3') return feminine ? '3rdPersonFeminine' : '3rdPersonMasculine';
    if (person === '2') return feminine ? '2ndPersonFeminine' : '2ndPersonMasculine';
    return '3rdPersonMasculine';
  })();

  return { chartKey, number };
}

function stemToSlot(row: ParadigmStem): SyntaxAnalysisVerbSlot {
  return {
    pronoun: '—',
    meaning: row.description,
    verb: row.stem,
  };
}

function buildVerbChartFromStems(stems: ParadigmStem[]): SyntaxAnalysisVerbChart | undefined {
  if (!stems.length) return undefined;

  const byCoord = new Map<string, ParadigmStem>();
  const used = new Set<ParadigmStem>();
  for (const row of stems) {
    const coord = slotFromDescription(row.description);
    if (!coord) continue;
    const key =
      coord.chartKey === '1stPerson'
        ? `1stPerson:${coord.number}`
        : `${coord.chartKey}:${coord.number}`;
    if (!byCoord.has(key)) byCoord.set(key, row);
  }

  const fallbackQueue = [...stems];
  const takeFallback = (): ParadigmStem => {
    const next = fallbackQueue.find((s) => !used.has(s)) ?? stems[0];
    used.add(next);
    return next;
  };

  const pick = (chartKey: keyof SyntaxAnalysisVerbChart, number: 'singular' | 'dual' | 'plural') => {
    const mapKey = `${chartKey}:${number}`;
    const hit = byCoord.get(mapKey);
    if (hit) {
      used.add(hit);
      return stemToSlot(hit);
    }
    return stemToSlot(takeFallback());
  };

  const chart: SyntaxAnalysisVerbChart = {
    '3rdPersonMasculine': {
      singular: pick('3rdPersonMasculine', 'singular'),
      dual: pick('3rdPersonMasculine', 'dual'),
      plural: pick('3rdPersonMasculine', 'plural'),
    },
    '3rdPersonFeminine': {
      singular: pick('3rdPersonFeminine', 'singular'),
      dual: pick('3rdPersonFeminine', 'dual'),
      plural: pick('3rdPersonFeminine', 'plural'),
    },
    '2ndPersonMasculine': {
      singular: pick('2ndPersonMasculine', 'singular'),
      dual: pick('2ndPersonMasculine', 'dual'),
      plural: pick('2ndPersonMasculine', 'plural'),
    },
    '2ndPersonFeminine': {
      singular: pick('2ndPersonFeminine', 'singular'),
      dual: pick('2ndPersonFeminine', 'dual'),
      plural: pick('2ndPersonFeminine', 'plural'),
    },
    '1stPerson': {
      singular: pick('1stPerson', 'singular'),
      plural: pick('1stPerson', 'plural'),
    },
  };

  return chart;
}

/**
 * Builds optional chart payloads (same JSON keys as the former OpenAI chart pass)
 * from Quran MCP morphology + `fetch_word_paradigm` stems.
 */
export function buildOptionalChartsFromMcp(
  pickedWord: MorphologyWord,
  paradigmRaw: unknown,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const payload = unwrapParadigmPayload(paradigmRaw);
  const surface = str(pickedWord, 'text_uthmani')?.trim() || '';
  const translation = str(pickedWord, 'translation')?.trim() || '';

  if (payload && (payload.perfect.length || payload.imperfect.length || payload.imperative.length)) {
    const lemmaOrRoot = payload.lemma || payload.root || surface || '—';
    const glossBit = payload.gloss ? ` (${payload.gloss})` : '';
    const ideaCell = payload.lemma ? `${payload.lemma}${glossBit}` : lemmaOrRoot;

    const firstPerfect = payload.perfect[0]?.stem || '—';
    const firstImperfect = payload.imperfect[0]?.stem || '—';
    const firstImperative = payload.imperative[0]?.stem;

    out.sarfChart = {
      columnHeaders: {
        pastTense: 'Past — فعل ماضٍ',
        presentTense: 'Present — فعل مضارع',
        idea: 'Lemma — المصدر / الجذر',
        doer: 'Gloss — معنى',
      },
      activeVoice: {
        pastTense: firstPerfect,
        presentTense: firstImperfect,
        idea: ideaCell,
        doer: payload.gloss || translation || payload.root || '—',
      },
      passiveVoiceLabels: {},
      passiveVoiceForms: {},
      commandingLabels: firstImperative
        ? { pastTense: 'Imperative — صيغة أمر (عيّنة من القرآن)' }
        : {},
      commandingForms: firstImperative
        ? {
            pastTense: firstImperative,
            ...(payload.imperative[1]?.stem ? { presentTense: payload.imperative[1].stem } : {}),
          }
        : {},
    };

    const past = buildVerbChartFromStems(payload.perfect);
    const present = buildVerbChartFromStems(payload.imperfect);
    if (past) out.verbPastTenseChart = past;
    if (present) out.verbPresentTenseChart = present;
  }

  return out;
}
