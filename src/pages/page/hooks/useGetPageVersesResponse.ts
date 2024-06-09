import { useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { getPageVerses } from '@/api';
import useGetMushaf from '@/hooks/useGetMushaf';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { VersesResponse } from '@/types/ApiResponses';
import { getDefaultWordFields } from '@/utils/api';

/**
 * This hooks fetches the page's verses data by the pageId
 *
 * @param {string} pageId
 *
 * @returns {{ pageVersesResponse: VersesResponse; isLoading: boolean; error: any }}
 */

const useGetPageVersesResponse = (pageId: string) => {
  const [data, setData] = useState<VersesResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const mushafId = useGetMushaf();
  const { lang: locale } = useTranslation();

  useEffect(() => {
    const getData = async () => {
      try {
        const pageVersesResponse = await getPageVerses(pageId, locale, {
          perPage: 'all',
          mushaf: mushafId,
          filterPageWords: true,
          ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
        });

        setData(pageVersesResponse);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [locale, mushafId, pageId]);

  return { isLoading, pageVersesResponse: data, error };
};

export default useGetPageVersesResponse;
