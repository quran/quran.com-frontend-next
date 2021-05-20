import { camelizeKeys } from 'humps';
import { makeUrl, ITEMS_PER_PAGE } from './utils/api';
import ChapterType from '../types/ChapterType';
import VerseType from '../types/VerseType';

export const fetcher = async function fetcher(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  return res.json();
};

export const getChapters = async () => {
  const payload = await fetcher(makeUrl(`/chapters`));

  return camelizeKeys(payload) as { chapters: ChapterType[] };
};

export const getChapter = async (id: string | number | string[]) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}`));

  return camelizeKeys(payload) as { chapter: ChapterType };
};

export const getChapterInfo = async (id: string | number | string[]) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}/info`));

  return camelizeKeys(payload);
};

export const getChapterVerses = async (id: string | number | string[], fontType: string) => {
  const payload = await fetcher(
    makeUrl(`/verses/by_chapter/${id}`, {
      words: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      word_fields: `verse_key,v1_page,location, ${fontType}`,
      fields: 'v1_page',
      translations: 20,
      limit: ITEMS_PER_PAGE,
    }),
  ); // TODO (@abdellatif): parameterize the default translation

  return camelizeKeys(payload) as { verses: VerseType[] };
};

export const getChapterVersesResponse = async (
  id: string | number | string[],
  fontType: string,
) => {
  return fetcher(
    makeUrl(`/verses/by_chapter/${id}`, {
      words: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      word_fields: `verse_key,v1_page,location,${fontType}`,
      translations: 20,
      limit: ITEMS_PER_PAGE,
    }),
  );
};
