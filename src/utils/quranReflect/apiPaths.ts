/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import stringify from '@/utils/qs-stringify';
import AyahReflectionsRequestParams from 'types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import Tab from 'types/QuranReflect/Tab';

const STAGING_API_HOST = 'https://quranreflect.org';
const PRODUCTION_API_HOST = 'https://quranreflect.com';
const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

// env variables in Vercel can't be dynamic, we have to hardcode the urls here. https://stackoverflow.com/questions/44342226/next-js-error-only-absolute-urls-are-supported
export const API_HOST = isProd ? PRODUCTION_API_HOST : STAGING_API_HOST;

export const makeQuranReflectApiUrl = (path: string, parameters = {}): string => {
  const params = {
    client_auth_token: process.env.NEXT_PUBLIC_QURAN_REFLECT_TOKEN,
    ...parameters,
  };
  return `${API_HOST}/${path}?${stringify(params)}`;
};

/* eslint-disable import/prefer-default-export */
export const makeAyahReflectionsUrl = ({
  surahId,
  ayahNumber,
  locale,
  page = 1,
  tab = Tab.MostPopular,
}: AyahReflectionsRequestParams) => {
  const surahNumber = Number(surahId) + 1;
  return makeQuranReflectApiUrl('posts.json', {
    'q[filters_attributes][0][chapter_id]': surahNumber,
    'q[filters_attributes][0][from]': ayahNumber,
    'q[filters_attributes][0][to]': ayahNumber,
    'q[filters_operation]': 'OR',
    page,
    tab,
    lang: locale,
    feed: true,
  });
};

const makeReflectionViewsUrl = (postId: string) => {
  return makeQuranReflectApiUrl(`v1/posts/${postId}/views`);
};

export const postReflectionViews = async (postId: string): Promise<AyahReflectionsResponse> =>
  fetcher(makeReflectionViewsUrl(postId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

export const getAyahReflections = async (
  ayahReflectionsUrl: string,
): Promise<AyahReflectionsResponse> => fetcher(ayahReflectionsUrl);
