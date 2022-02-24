import useSWRImmutable from 'swr/immutable';

import { fetcher } from 'src/api';
import { getPagesLookupParams } from 'src/components/QuranReader/api';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getMushafId } from 'src/utils/api';
import { makePagesLookupUrl } from 'src/utils/apiPaths';
import { PagesLookUpResponse, VersesResponse } from 'types/ApiResponses';
import LookupRange from 'types/LookupRange';
import LookupRecord from 'types/LookupRecord';
import { QuranReaderDataType } from 'types/QuranReader';

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
  resourceId: number | string,
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  isUsingDefaultFont: boolean,
): {
  pagesCount: number;
  hasError: boolean;
  pagesVersesRange: Record<number, LookupRecord>;
  lookupRange: LookupRange;
  isLoading: boolean;
} => {
  const { data, error, isValidating } = useSWRImmutable<PagesLookUpResponse>(
    makePagesLookupUrl(
      getPagesLookupParams(
        resourceId,
        quranReaderDataType,
        getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
        initialData,
      ),
    ),
    fetcher,
    {
      fallbackData: initialData.pagesLookup,
      revalidateOnMount: !isUsingDefaultFont,
    },
  );

  return {
    pagesCount: data.totalPage,
    pagesVersesRange: data.pages,
    lookupRange: data.lookupRange,
    hasError: !!error,
    isLoading: isValidating,
  };
};

export default useFetchPagesLookup;
