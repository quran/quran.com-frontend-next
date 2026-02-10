import Language from '@/types/Language';
import { makeUrl } from '@/utils/api';

export const makeLayeredTranslationByVerseUrl = (
  verseKey: string,
  language: Language,
  resourceId?: number,
): string =>
  makeUrl(`/layered_translations/by_verse/${verseKey}`, {
    language,
    ...(resourceId ? { resourceId } : {}),
  });

export const makeLayeredTranslationCountWithinRangeUrl = (
  range: { from: string; to: string },
  language: Language,
  resourceId?: number,
): string =>
  makeUrl('/layered_translations/count_within_range', {
    from: range.from,
    to: range.to,
    language,
    ...(resourceId ? { resourceId } : {}),
  });
