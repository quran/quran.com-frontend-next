import { camelizeKeys } from 'humps';
import { makeUrl } from './utils/api';
import Chapter from '../types/ChapterType';
import Verse from '../types/VerseType';
import { makeVersesUrl } from './utils/apiPaths';

export const fetcher = async function fetcher(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  return res.json();
};

export const getChapters = async () => {
  const payload = await fetcher(makeUrl(`/chapters`));

  return camelizeKeys(payload) as { chapters: Chapter[] };
};

export const getChapter = async (id: string | number) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}`));

  return camelizeKeys(payload) as { chapter: Chapter };
};

export const getChapterInfo = async (id: string | number) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}/info`));

  return camelizeKeys(payload);
};

export const getChapterVerses = async (id: string | number, params?: Record<string, unknown>) => {
  const payload = await fetcher(makeVersesUrl(id, params));
  // TODO (@abdellatif): parameterize the default translation

  return camelizeKeys(payload) as { verses: Verse[] };
};

export const getChapterVersesResponse = async (
  id: string | number,
  params?: Record<string, unknown>,
) => {
  return fetcher(makeVersesUrl(id, params));
};
