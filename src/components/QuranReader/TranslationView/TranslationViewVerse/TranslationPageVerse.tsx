import { useEffect, useRef } from 'react';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Verse from '@/types/Verse';

interface TranslationPageVerse {
  verse: Verse;
  verseIdx: number;
  quranReaderStyles: QuranReaderStyles;
  isLastVerseInView: boolean;
}

const TranslationPageVerse: React.FC<TranslationPageVerse> = ({
  verse,
  verseIdx,
  quranReaderStyles,
  isLastVerseInView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { verseKeysQueue } = useVerseTrackerContext();

  useEffect(() => {
    let observer: IntersectionObserver = null;

    if (containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            verseKeysQueue.current.add(verse.verseKey);
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.5,
        },
      );
      observer.observe(containerRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [isLastVerseInView, verse, verseKeysQueue]);

  // Only show chapter header for verse 1 of a chapter (for multi-chapter pages like page 604)
  const shouldShowChapterHeader = verse.verseNumber === 1;

  // First cell has header above it when:
  // 1. ChapterHeader shows above this verse, OR
  // 2. It's the first verse in view (verseIdx === 0) - ReaderTopActions shows above
  const isFirstCellWithHeader = shouldShowChapterHeader || verseIdx === 0;

  return (
    <div
      ref={isLastVerseInView ? containerRef : undefined}
      // key={currentVerseIndex}
      // if isLastPage, we want to detect when this element will be in the user's viewport
      // so we can add the last verse key to the queue
    >
      {shouldShowChapterHeader && (
        <ChapterHeader chapterId={String(verse.chapterId)} isTranslationView />
      )}

      <TranslationViewCell
        verseIndex={verseIdx}
        verse={verse}
        key={verse.id}
        quranReaderStyles={quranReaderStyles}
        isFirstCellWithHeader={isFirstCellWithHeader}
      />
    </div>
  );
};

export default TranslationPageVerse;
