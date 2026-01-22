import { useEffect, useRef } from 'react';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import getTranslationNameString from '@/components/QuranReader/ReadingView/utils/translation';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from '@/types/QuranReader';
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
  quranReaderDataType: QuranReaderDataType;
}

const TranslationPageVerse: React.FC<TranslationPageVerse> = ({
  verse,
  bookmarksRangeUrl,
  verseIdx,
  quranReaderStyles,
  isLastVerseInView,
  notesRange,
  questionsData,
  quranReaderDataType,
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

  // Show chapter header when:
  // 1. It's a single verse view (QuranReaderDataType.Verse) - always show the header
  // 2. It's verse 1 of a chapter - for multi-chapter pages (like page 604)
  // Note: We don't show chapter header just because it's the first verse in view (e.g., /page/10)
  // In those cases, ReaderTopActions handles the top actions display
  const isSingleVerseView = quranReaderDataType === QuranReaderDataType.Verse;
  const isFirstVerseOfChapter = verse.verseNumber === 1;
  const shouldShowChapterHeader = isSingleVerseView || isFirstVerseOfChapter;

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
        <ChapterHeader
          translationName={getTranslationNameString(verse.translations)}
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
        hasQuestions={hasQuestions}
        isFirstCellWithHeader={isFirstCellWithHeader}
      />
    </div>
  );
};

export default TranslationPageVerse;
