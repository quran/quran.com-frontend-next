/* eslint-disable @typescript-eslint/naming-convention */

import { makeQuranReflectApiUrl } from '@/utils/quranReflect/api';
import Tab from 'types/QuranReflect/Tab';
import VerseReflectionsRequestParams from 'types/VerseReflectionsRequestParams';

/* eslint-disable import/prefer-default-export */
export const makeVerseReflectionsUrl = ({
  chapterId,
  verseNumber,
  locale,
  page = 1,
  tab = Tab.MostPopular,
}: VerseReflectionsRequestParams) => {
  const chapterNumber = Number(chapterId) + 1;
  return makeQuranReflectApiUrl('posts.json', {
    'q[filters_attributes][0][chapter_id]': chapterNumber,
    'q[filters_attributes][0][from]': verseNumber,
    'q[filters_attributes][0][to]': verseNumber,
    page,
    tab,
    lang: locale,
    feed: true,
  });
};
