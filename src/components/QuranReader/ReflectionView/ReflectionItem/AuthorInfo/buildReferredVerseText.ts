import Reference from '@/types/QuranReflect/Reference';
import { isRTLLocale, toLocalizedNumber } from '@/utils/locale';
import quranStructure from '@/utils/quranStructure';
import { makeVerseKey } from '@/utils/verse';

const AR_COMMA = '، ';

const buildChapterVerseCounts = () => {
  const counts: Record<number, number> = {};
  quranStructure.forEach(({ chapter, verses }) => {
    counts[chapter] = verses;
  });
  return counts;
};

const CHAPTER_VERSES_COUNT = buildChapterVerseCounts();

const getChapterVersesCount = (chapterId?: number | string) => {
  if (typeof chapterId === 'number') return CHAPTER_VERSES_COUNT[chapterId];
  if (typeof chapterId === 'string') return CHAPTER_VERSES_COUNT[Number(chapterId)];
  return undefined;
};

const isChapterOnly = (reference: Reference) => {
  if (reference.from !== 0) return false;

  if (reference.to === 0) return true;

  if (typeof reference.to !== 'number') return false;

  const versesCount = getChapterVersesCount(reference.chapterId);
  return typeof versesCount === 'number' && reference.to === versesCount;
};
const hasRange = (r: Reference): r is Reference & { to: number } =>
  typeof r.to === 'number' && r.to > 0 && r.to !== r.from;

function buildRTLText(
  verseReferences: Reference[],
  nonChapterVerseReferences: Reference[],
  lang: string,
  t: (key: string) => string,
): string {
  const chapterNumbers = verseReferences
    .filter(isChapterOnly)
    .map((r) => toLocalizedNumber(r.chapterId, lang));

  const chaptersText = chapterNumbers.join(AR_COMMA);

  const verseItems = nonChapterVerseReferences.map((r) => {
    const chapterNum = toLocalizedNumber(r.chapterId, lang);
    const startAyah = toLocalizedNumber(r.from, lang);
    const isRange = hasRange(r);
    const endAyah = isRange ? toLocalizedNumber(r.to, lang) : '';
    return isRange ? `${startAyah}:${chapterNum}-${endAyah}` : `${startAyah}:${chapterNum}`;
  });

  const versesText = verseItems.join(AR_COMMA);

  if (chaptersText && versesText) {
    return `${t('common:surah')} ${chaptersText} ${t('common:and')} ${t(
      'common:ayah',
    )} ${versesText}`;
  }
  if (chaptersText) return `${t('common:surah')} ${chaptersText}`;
  if (versesText) return `${t('common:ayah')} ${versesText}`;
  return '';
}

function buildLTRText(
  verseReferences: Reference[],
  nonChapterVerseReferences: Reference[],
  lang: string,
  t: (key: string) => string,
): string {
  const chapters = verseReferences
    .filter(isChapterOnly)
    .map((r) => toLocalizedNumber(r.chapterId, lang));

  let text = '';
  if (chapters.length > 0) {
    text += `${t('common:surah')} ${chapters.join(', ')}`;
  }

  const verses = nonChapterVerseReferences.map((r) => {
    const chapter = toLocalizedNumber(r.chapterId, lang);
    const from = toLocalizedNumber(r.from, lang);
    const rangeTo = hasRange(r) ? toLocalizedNumber(r.to, lang) : undefined;
    return makeVerseKey(chapter, from, rangeTo);
  });

  if (verses.length > 0) {
    if (chapters.length > 0) text += ` ${t('common:and')} `;
    text += `${t('common:ayah')} ${verses.join(', ')}`;
  }

  return text;
}

export default function buildReferredVerseText(
  verseReferences: Reference[],
  nonChapterVerseReferences: Reference[],
  lang: string,
  t: (key: string) => string,
): string {
  return isRTLLocale(lang)
    ? buildRTLText(verseReferences, nonChapterVerseReferences, lang, t)
    : buildLTRText(verseReferences, nonChapterVerseReferences, lang, t);
}
