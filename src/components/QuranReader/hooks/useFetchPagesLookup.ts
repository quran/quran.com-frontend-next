import useSWRImmutable from 'swr/immutable';

import { getPagesLookupParams } from '@/components/QuranReader/api';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makePagesLookupUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { PagesLookUpResponse, VersesResponse } from 'types/ApiResponses';
import LookupRange from 'types/LookupRange';
import LookupRecord from 'types/LookupRecord';

/**
 * This hooks fetches the total number of pages of a specific Mushaf of
 * a resource e.g. a page/juz/verse/range/hiz etc.
 *
 * @param {number|string} resourceId
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {VersesResponse} initialData
 * @param {QuranReaderStyles} quranReaderStyles
 *
 * @returns {{ pagesCount: number; hasError: boolean }}
 */
const useFetchPagesLookup = (
  resourceId: number | string | null,
  quranReaderDataType: QuranReaderDataType,
  initialData?: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  isUsingDefaultFont: boolean,
): {
  data: PagesLookUpResponse | undefined;
  pagesCount: number;
  hasError: boolean;
  pagesVersesRange: Record<number, LookupRecord>;
  lookupRange: LookupRange;
  isLoading: boolean;
} => {
  const shouldFetch = resourceId !== null && resourceId !== undefined;

  const { data, error, isValidating } = useSWRImmutable<PagesLookUpResponse>(
    shouldFetch
      ? makePagesLookupUrl(
          getPagesLookupParams(
            resourceId,
            quranReaderDataType,
            getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
            initialData,
          ),
        )
      : null,
    shouldFetch ? fetcher : null,
    shouldFetch
      ? {
          fallbackData: initialData?.pagesLookup,
          revalidateOnMount: !isUsingDefaultFont,
        }
      : undefined,
  );

  const resolvedData = shouldFetch ? data ?? initialData?.pagesLookup : initialData?.pagesLookup;
  const lookupRange: LookupRange = resolvedData?.lookupRange ?? { from: '', to: '' };

  return {
    data: resolvedData,
    pagesCount: resolvedData?.totalPage ?? 0,
    pagesVersesRange: (resolvedData?.pages ?? {}) as Record<number, LookupRecord>,
    lookupRange,
    hasError: shouldFetch ? !!error : false,
    isLoading: shouldFetch ? isValidating && !resolvedData : false,
  };
};

export default useFetchPagesLookup;
