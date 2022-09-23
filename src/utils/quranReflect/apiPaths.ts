/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import stringify from '@/utils/qs-stringify';
import AyahReflectionsRequestParams from 'types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import Tab from 'types/QuranReflect/Tab';

export const makeQuranReflectApiUrl = (path: string, parameters = {}): string => {
  const params = {
    client_auth_token: process.env.NEXT_PUBLIC_QURAN_REFLECT_TOKEN,
    ...parameters,
  };
  return `https://quranreflect.com/${path}?${stringify(params)}`;
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

export const getAyahReflections = async (
  ayahReflectionsUrl: string,
): Promise<AyahReflectionsResponse> => fetcher(ayahReflectionsUrl);
