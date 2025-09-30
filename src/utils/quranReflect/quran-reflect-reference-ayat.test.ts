/**
 * Test Suite: buildReferredVerseText — minimal docs
 *
 * Validates rendering of Quran references across LTR (en) and RTL (ar/ur/fa).
 *
 * Covers:
 * - Single ayah, multiple ayat, ranges, surah-only, and mixed (surah + ayat).
 * - Localized digits via `toLocalizedNumber`.
 * - Punctuation: LTR uses ", ", RTL uses "، ".
 * - Order: LTR <chapter>:<verse>, RTL <verse>:<chapter>.
 * - When both surah-only and ayat exist, inserts a single localized "and".
 * - Empty input returns "".
 *
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

/* eslint-disable max-lines, react-func/max-lines-per-function */
import buildReferredVerseText from '../../components/QuranReader/ReflectionView/ReflectionItem/AuthorInfo/buildReferredVerseText';

import type Reference from '@/types/QuranReflect/Reference';
import { isRTLLocale, toLocalizedNumber } from '@/utils/locale';
import { makeVerseKey } from '@/utils/verse';

type CommonDict = Record<'ayah' | 'surah' | 'and', string>;

const en: CommonDict = { ayah: 'Ayah', surah: 'Surah', and: 'and' };
const ar: CommonDict = { ayah: 'آية', surah: 'سورة', and: 'و' };
const ur: CommonDict = { ayah: 'آیت', surah: 'سورہ', and: 'اور' };
const fa: CommonDict = { ayah: 'آیه', surah: 'سوره', and: 'و' };

const maps: Record<string, CommonDict> = { en, ar, ur, fa };

vi.mock('next-translate/getT', () => ({
  default: async (lang: string) => {
    const dict = maps[lang] ?? maps.en;
    return (key: string) => {
      const plainKey = key.includes(':') ? key.split(':')[1] : key;
      return dict[plainKey] ?? key;
    };
  },
}));

const makeRef = (chapterId: number, from: number, to?: number): Reference => ({
  chapterId,
  from,
  to: typeof to === 'number' ? to : 0,
  id:
    to === undefined
      ? `surah-${chapterId}${from ? `-${from}` : ''}`
      : `surah-${chapterId}-${from}:${to}`,
});

const COMMA = { ltr: ', ', rtl: '، ' } as const;

/* eslint-disable max-lines, react-func/max-lines-per-function */
// ---- LTR (en) ----
describe('buildReferredVerseText — LTR (en)', () => {
  let t: (k: string) => string;
  beforeAll(async () => {
    const { default: getT } = await import('next-translate/getT');
    t = await getT('en', 'common');
  });

  it('single ayah', () => {
    const verses = [makeRef(2, 1, 1)];
    const out = buildReferredVerseText(verses, verses, 'en', t);
    expect(out).toBe(`${t('common:ayah')} ${makeVerseKey('2', '1')}`);
  });

  it('multiple ayat, stable order, LTR comma', () => {
    const all = [makeRef(2, 1, 1), makeRef(1, 1, 1)];
    const out = buildReferredVerseText(all, all, 'en', t);
    const expected = `${t('common:ayah')} ${makeVerseKey('2', '1')}${COMMA.ltr}${makeVerseKey(
      '1',
      '1',
    )}`;
    expect(out).toBe(expected);
  });

  it('mixed: surah-only + ayat (includes a range)', () => {
    const verseRefs = [makeRef(18, 4, 5), makeRef(2, 0, 0), makeRef(8, 12, 12)];
    const nonChapters = [makeRef(18, 4, 5), makeRef(8, 12, 12)];
    const out = buildReferredVerseText(verseRefs, nonChapters, 'en', t);
    const surahs = `${t('common:surah')} ${toLocalizedNumber(2, 'en')}`;
    const verses = `${makeVerseKey('18', '4', '5')}${COMMA.ltr}${makeVerseKey('8', '12')}`;
    expect(out).toBe(`${surahs} ${t('common:and')} ${t('common:ayah')} ${verses}`);
  });

  it('surah-only', () => {
    const out = buildReferredVerseText([makeRef(36, 0, 0)], [], 'en', t);
    expect(out).toBe(`${t('common:surah')} ${toLocalizedNumber(36, 'en')}`);
  });
});

// ---- RTL (ar / ur / fa) ----
describe.each([
  { lang: 'ar', comma: COMMA.rtl },
  { lang: 'ur', comma: COMMA.rtl },
  { lang: 'fa', comma: COMMA.rtl },
] as const)('buildReferredVerseText — RTL (%s)', ({ lang, comma }) => {
  let t: (k: string) => string;
  beforeAll(async () => {
    const { default: getT } = await import('next-translate/getT');
    t = await getT(lang, 'common');
  });

  it('flags RTL locale', () => {
    expect(isRTLLocale(lang)).toBe(true);
  });

  it('single ayah uses localized numerals and ":" order (verse:chapter)', () => {
    const r = [makeRef(2, 1, 1)];
    const out = buildReferredVerseText(r, r, lang, t);
    const expected = `${t('common:ayah')} ${toLocalizedNumber(1, lang)}:${toLocalizedNumber(
      2,
      lang,
    )}`;
    expect(out).toBe(expected);
  });

  it('multiple ayat join with Arabic comma and single space', () => {
    const all = [makeRef(2, 1, 1), makeRef(1, 1, 1)];
    const out = buildReferredVerseText(all, all, lang, t);
    const first = `${toLocalizedNumber(1, lang)}:${toLocalizedNumber(2, lang)}`;
    const second = `${toLocalizedNumber(1, lang)}:${toLocalizedNumber(1, lang)}`;

    // enforce exact comma character and spacing
    expect(comma).toBe('، ');
    expect(out).toBe(`${t('common:ayah')} ${first}${comma}${second}`);
  });

  it('mixed: surah-only + ayat (+range) with localized digits', () => {
    const verseRefs = [makeRef(18, 4, 5), makeRef(2, 0, 0), makeRef(8, 12, 12)];
    const nonChapters = [makeRef(18, 4, 5), makeRef(8, 12, 12)];
    const out = buildReferredVerseText(verseRefs, nonChapters, lang, t);

    const surahs = `${t('common:surah')} ${toLocalizedNumber(2, lang)}`;
    const v1 = `${toLocalizedNumber(4, lang)}:${toLocalizedNumber(18, lang)}-${toLocalizedNumber(
      5,
      lang,
    )}`;
    const v2 = `${toLocalizedNumber(12, lang)}:${toLocalizedNumber(8, lang)}`;
    expect(out).toBe(`${surahs} ${t('common:and')} ${t('common:ayah')} ${v1}${comma}${v2}`);
  });
});

// ---- edge cases ----
describe('buildReferredVerseText — edge cases', () => {
  it('empty input → empty string (all locales)', async () => {
    const { default: getT } = await import('next-translate/getT');
    await Promise.all(
      (['en', 'ar', 'ur', 'fa'] as const).map(async (lang) => {
        const t = await getT(lang, 'common');
        expect(buildReferredVerseText([], [], lang, t)).toBe('');
      }),
    );
  });

  it('range where from === to is rendered as single ayah', async () => {
    const { default: getT } = await import('next-translate/getT');
    const t = await getT('en', 'common');
    const verses = [makeRef(2, 5, 5)];
    const out = buildReferredVerseText(verses, verses, 'en', t);
    expect(out).toBe(`${t('common:ayah')} ${makeVerseKey('2', '5')}`);
  });

  it('invalid range (from > to) — documents current behavior (no crash)', async () => {
    const { default: getT } = await import('next-translate/getT');
    const t = await getT('en', 'common');
    const verses = [makeRef(2, 10, 5)];
    const out = buildReferredVerseText(verses, verses, 'en', t);
    expect(typeof out).toBe('string');
  });

  it('no extra spaces or trailing commas (LTR)', async () => {
    const { default: getT } = await import('next-translate/getT');
    const t = await getT('en', 'common');
    const all = [makeRef(2, 1, 1), makeRef(1, 1, 1)];
    const out = buildReferredVerseText(all, all, 'en', t);
    expect(out).not.toMatch(/\s{2,}/);
    expect(out.endsWith(',')).toBe(false);
    expect(out.endsWith(' ')).toBe(false);
  });

  it('no extra spaces or trailing commas (RTL)', async () => {
    const { default: getT } = await import('next-translate/getT');
    const t = await getT('ar', 'common');
    const all = [makeRef(2, 1, 1), makeRef(1, 1, 1)];
    const out = buildReferredVerseText(all, all, 'ar', t);
    expect(out).not.toMatch(/\s{2,}/);
    expect(out.endsWith('،')).toBe(false);
    expect(out.endsWith(' ')).toBe(false);
  });
});
