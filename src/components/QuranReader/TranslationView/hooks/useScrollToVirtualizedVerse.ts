import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import { QuranReaderDataType } from 'types/QuranReader';

/**
 * This hook listens to startingVerse query param and navigate to
 * the location where the verse is in the virtualized list.
 *
 * [NOTE]: This is meant to be used for TranslationView only.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 */
const useScrollToVirtualizedTranslationView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
) => {
  const router = useRouter();
  const { startingVerse } = router.query;

  useEffect(() => {
    // if startingVerse is present in the url
    if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
      const startingVerseNumber = Number(startingVerse);
      // if the startingVerse is a valid integer and is above 1
      if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
        virtuosoRef.current.scrollToIndex(startingVerseNumber - 1);
      }
    }
  }, [quranReaderDataType, startingVerse, virtuosoRef]);
};

export default useScrollToVirtualizedTranslationView;
