import { fetcher } from '@/api';
import { getDefaultWordFields } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

interface VerseResponse {
  verse: Verse;
}

const fetchVerseForCopy = async (
  verseKey: string,
  selectedTranslations: number[],
): Promise<Verse> =>
  fetcher(
    makeByVerseKeyUrl(verseKey, {
      words: true,
      ...getDefaultWordFields(QuranFont.Uthmani),
      translationFields: 'resource_name,language_name',
      ...(selectedTranslations?.length
        ? { translations: selectedTranslations.join(',') }
        : undefined),
      fields: 'text_uthmani,chapter_id,verse_number,verse_key',
    }),
  ).then((res: VerseResponse) => res.verse);

export default fetchVerseForCopy;
