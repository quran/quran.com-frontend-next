import { decamelizeKeys } from 'humps';
import { ITEMS_PER_PAGE, makeUrl } from './api';

export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translations: 20,
  limit: ITEMS_PER_PAGE,
};

export const makeVersesUrl = (id: string | number, params?: Record<string, unknown>) => {
  const apiParams = Object.assign(params, DEFAULT_VERSES_PARAMS);

  return makeUrl(`/verses/by_chapter/${id}`, decamelizeKeys(apiParams));
};
