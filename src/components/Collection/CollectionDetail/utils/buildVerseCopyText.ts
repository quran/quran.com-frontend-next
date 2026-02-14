import { stripHtml } from '@/utils/string';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import Chapter from 'types/Chapter';
import Language from 'types/Language';
import Verse from 'types/Verse';

type Params = {
  verse: Verse;
  chapter?: Chapter | null;
  lang: string;
  qdcUrl: string;
};

const getArabicTextUthmani = (verse: Verse): string => {
  if (verse.textUthmani) return verse.textUthmani;
  if (!verse.words?.length) return '';
  return verse.words
    .map((w) => w.textUthmani || w.text || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getTranslationName = (t: any): string =>
  (t?.resourceName || t?.languageName || t?.authorName || '').toString().trim();

const buildVerseCopyText = ({ verse, chapter, lang, qdcUrl }: Params): string => {
  const [surah, ayah] = getVerseAndChapterNumbersFromKey(verse.verseKey);

  const isArabicLocale = lang === Language.AR || lang?.startsWith(`${Language.AR}-`);
  // NOTE: `data/chapters/ar.json` uses `transliteratedName` for the Arabic surah name.
  const surahName = isArabicLocale
    ? chapter?.nameArabic || chapter?.transliteratedName || ''
    : chapter?.transliteratedName || '';
  const header = surahName ? `${surahName} (${surah}:${ayah})` : `${surah}:${ayah}`;

  const arabicText = getArabicTextUthmani(verse);

  const translationBlocks =
    verse.translations
      ?.map((tr: any) => {
        const text = stripHtml(tr?.text || '');
        const name = getTranslationName(tr);
        if (name) return `${text}\n- ${name}`.trim();
        return text.trim();
      })
      ?.filter(Boolean) ?? [];

  const blocks: string[] = [header];
  if (arabicText) blocks.push(arabicText);
  if (translationBlocks.length) blocks.push(...translationBlocks);
  blocks.push(qdcUrl);

  return blocks.join('\n\n').trim();
};

export default buildVerseCopyText;
