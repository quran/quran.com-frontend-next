import { useEffect, useState } from 'react';

import { fetchResourceMushafPagesDetails } from 'src/components/QuranReader/api';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getMushafId } from 'src/utils/api';
import { VersesResponse } from 'types/ApiResponses';
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
const useFetchPagesCount = (
  resourceId: number | string,
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
): {
  pagesCount: number;
  hasError: boolean;
  pagesVersesRange: Record<number, LookupRecord>;
} => {
  const [pagesDetails, setPagesDetails] = useState({
    pagesCount: 1,
    pages: {},
  });
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setHasError(false);
    fetchResourceMushafPagesDetails(
      resourceId,
      quranReaderDataType,
      getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
      initialData,
    )
      .then((response) => {
        setPagesDetails({ pagesCount: response.totalPage, pages: response.pages });
      })
      .catch(() => {
        setHasError(true);
      });
  }, [
    resourceId,
    quranReaderDataType,
    quranReaderStyles.quranFont,
    quranReaderStyles.mushafLines,
    initialData,
  ]);
  return { pagesCount: pagesDetails.pagesCount, pagesVersesRange: pagesDetails.pages, hasError };
};

export default useFetchPagesCount;
