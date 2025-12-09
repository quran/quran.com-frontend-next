import { useEffect, useRef } from 'react';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import getTranslationsLabelString from '@/components/QuranReader/ReadingView/utils/translation';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Verse from '@/types/Verse';

interface TranslationPageVerse {
  verse: Verse;
  bookmarksRangeUrl: string | null;
  verseIdx: number;
  quranReaderStyles: QuranReaderStyles;
  isLastVerseInView: boolean;
  notesRange: {
    from: string;
    to: string;
  } | null;
}

const TranslationPageVerse: React.FC<TranslationPageVerse> = ({
  verse,
  bookmarksRangeUrl,
  verseIdx,
  quranReaderStyles,
  isLastVerseInView,
  notesRange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { verseKeysQueue } = useVerseTrackerContext();

  const { data: notesCount } = useCountRangeNotes(notesRange);

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

  const hasNotes = notesCount && notesCount[verse.verseKey] > 0;

  return (
    <div
      ref={isLastVerseInView ? containerRef : undefined}
      // key={currentVerseIndex}
      // if isLastPage, we want to detect when this element will be in the user's viewport
      // so we can add the last verse key to the queue
    >
      {verse.verseNumber === 1 && (
        <ChapterHeader
          translationsLabel={getTranslationsLabelString(verse.translations)}
          translationsCount={verse.translations?.length}
          chapterId={String(verse.chapterId)}
          isTranslationView
        />
      )}

      <TranslationViewCell
        verseIndex={verseIdx}
        verse={verse}
        key={verse.id}
        quranReaderStyles={quranReaderStyles}
        bookmarksRangeUrl={bookmarksRangeUrl}
        hasNotes={hasNotes}
      />
    </div>
  );
};

export default TranslationPageVerse;
