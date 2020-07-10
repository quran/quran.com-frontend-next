import { camelizeKeys } from 'humps';
import { makeUrl } from './utils/api';
import ChapterType from '../types/ChapterType';
import VerseType from '../types/VerseType';

export const fetcher = async function (input: RequestInfo, init?: RequestInit) {
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

export const getChapterVerses = async (id: string | number | string[]) => {
  const payload = await fetcher(makeUrl(`/chapters/${id}/verses?translations=20`)); // TODO (@abdellatif): parameterize the default translation

  return camelizeKeys(payload) as { verses: VerseType[] };
};

export const getChapterVersesResponse = async (id: string | number | string[]) => {
  return fetcher(makeUrl(`/chapters/${id}/verses`));
};
