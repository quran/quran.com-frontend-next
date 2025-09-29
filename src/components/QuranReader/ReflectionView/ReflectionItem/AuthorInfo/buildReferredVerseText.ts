import Reference from '@/types/QuranReflect/Reference';
import { isRTLLocale, toLocalizedNumber } from '@/utils/locale';
import { makeVerseKey } from '@/utils/verse';

const isChapterOnly = (r: Reference) => r.from === 0 && r.to === 0;
const hasRange = (r: Reference): r is Reference & { to: number } =>
  typeof r.to === 'number' && r.to > 0 && r.to !== r.from;

function buildRTLText(
  verseReferences: Reference[],
  nonChapterVerseReferences: Reference[],
  lang: string,
  t: (key: string) => string,
): string {
  const AR_COMMA = '، ';

  const chapterNumbers = verseReferences
    .filter(isChapterOnly)
    .map((r) => toLocalizedNumber(r.chapterId, lang));

  const chaptersText = chapterNumbers.join(AR_COMMA);

  const verseItems = nonChapterVerseReferences.map((r) => {
    const chapterNum = toLocalizedNumber(r.chapterId, lang);
    const startAyah = toLocalizedNumber(r.from, lang);
    const endAyah = hasRange(r) ? toLocalizedNumber(r.to, lang) : '';
    return hasRange(r) ? `${startAyah}:${chapterNum}-${endAyah}` : `${startAyah}:${chapterNum}`;
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

  const verses = nonChapterVerseReferences.map((r) =>
    makeVerseKey(
      toLocalizedNumber(r.chapterId, lang),
      toLocalizedNumber(r.from, lang),
      toLocalizedNumber(r.to, lang),
    ),
  );

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
