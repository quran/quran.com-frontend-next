import { useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';

import useFetchPagesLookup from '@/components/QuranReader/hooks/useFetchPagesLookup';
import DataContext from '@/contexts/DataContext';
import { selectIsUsingDefaultFont } from '@/redux/slices/QuranReader/styles';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';

/**
 * This hooks calculates the total number of verses based on the verses range
 * and the current Mushaf settings
 *
 * @param {number|string} resourceId
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {VersesResponse} initialData
 * @param {QuranReaderStyles} quranReaderStyles
 *
 * @returns {number} versesCount
 */

const useGetVersesCount = ({
  resourceId,
  quranReaderDataType,
  initialData,
  quranReaderStyles,
}): number => {
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const { lookupRange } = useFetchPagesLookup(
    resourceId,
    quranReaderDataType,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );

  const chaptersData = useContext(DataContext);

  const versesCount = useMemo(() => {
    return generateVerseKeysBetweenTwoVerseKeys(chaptersData, lookupRange.from, lookupRange.to)
      .length;
  }, [chaptersData, lookupRange.from, lookupRange.to]);

  return versesCount;
};

export default useGetVersesCount;
