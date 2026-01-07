import { useEffect, useRef } from 'react';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import getTranslationsLabelString from '@/components/QuranReader/ReadingView/utils/translation';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import Verse from '@/types/Verse';
import { QuestionsData } from '@/utils/auth/api';

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
  questionsData?: Record<string, QuestionsData>;
}

const TranslationPageVerse: React.FC<TranslationPageVerse> = ({
  verse,
  bookmarksRangeUrl,
  verseIdx,
  quranReaderStyles,
  isLastVerseInView,
  notesRange,
  questionsData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { verseKeysQueue } = useVerseTrackerContext();

  const { data: notesCount } = useCountRangeNotes(notesRange);

  // Only show Answers tab when we confirm questions exist
  const hasQuestions = questionsData?.[verse.verseKey]?.total > 0;

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
          pageNumber={verse.pageNumber}
          hizbNumber={verse.hizbNumber}
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
        hasQuestions={hasQuestions}
      />
    </div>
  );
};

export default TranslationPageVerse;
