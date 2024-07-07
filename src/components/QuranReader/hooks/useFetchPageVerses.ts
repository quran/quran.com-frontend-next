import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getPageVerses } from '@/api';
import useGetMushaf from '@/hooks/useGetMushaf';
import getPageVersesParams from '@/pages/page/utils/getPageVersesParams';
import { selectIsUsingDefaultFont, selectQuranFont } from '@/redux/slices/QuranReader/styles';
import { VersesResponse } from '@/types/ApiResponses';
import { getDefaultWordFields } from '@/utils/api';
import { makePageVersesUrl } from '@/utils/apiPaths';

/**
 * This hooks fetches the page's verses data by the pageId
 *
 * @param {string} pageId
 * @param {VersesResponse} initialData
 *
 * @returns {{ pageVersesResponse: VersesResponse; isLoading: boolean; error: any }}
 */

const useFetchPageVerses = (pageId: string, initialData: VersesResponse) => {
  const { lang: locale } = useTranslation();
  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const mushafId = useGetMushaf();
  const params = getPageVersesParams(mushafId, getDefaultWordFields(quranFont));

  const { data, isValidating, error } = useSWRImmutable(
    makePageVersesUrl(pageId, locale, params),
    async () => getPageVerses(pageId, locale, params),
    {
      fallbackData: initialData,
      revalidateOnMount: !isUsingDefaultFont,
    },
  );

  return { isLoading: isValidating, data, error };
};

export default useFetchPageVerses;
