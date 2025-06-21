import { useEffect, useRef } from 'react';

import useSWRImmutable from 'swr/immutable';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import getTranslationNameString from '@/components/QuranReader/ReadingView/utils/translation';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import useCountRangeQuestions from '@/hooks/auth/useCountRangeQuestions';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from '@/types/ApiResponses';
import Verse from '@/types/Verse';
import { getPageBookmarks } from '@/utils/auth/api';

interface TranslationPageVerse {
  verse: Verse;
  bookmarksRangeUrl: string | null;
  mushafId: number;
  verseIdx: number;
  quranReaderStyles: QuranReaderStyles;
  initialData: VersesResponse;
  firstVerseInPage: Verse;
  isLastVerseInView: boolean;
  notesRange: {
    from: string;
    to: string;
  } | null;
}

const TranslationPageVerse: React.FC<TranslationPageVerse> = ({
  verse,
  bookmarksRangeUrl,
  mushafId,
  verseIdx,
  quranReaderStyles,
  initialData,
  firstVerseInPage,
  isLastVerseInView,
  notesRange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { verseKeysQueue } = useVerseTrackerContext();

  const { data: pageBookmarks } = useSWRImmutable(bookmarksRangeUrl, async () => {
    const response = await getPageBookmarks(
      mushafId,
      Number(firstVerseInPage.chapterId),
      Number(firstVerseInPage.verseNumber),
      initialData.pagination.perPage,
    );
    return response;
  });

  const { data: notesCount } = useCountRangeNotes(notesRange);
  const { data: questionsCount } = useCountRangeQuestions(notesRange);

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

  const hasQuestions = questionsCount && questionsCount[verse.verseKey] > 0;
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
          translationName={getTranslationNameString(verse.translations)}
          translationsCount={verse.translations?.length}
          chapterId={String(verse.chapterId)}
          pageNumber={verse.pageNumber}
          hizbNumber={verse.hizbNumber}
        />
      )}

      <TranslationViewCell
        verseIndex={verseIdx}
        verse={verse}
        key={verse.id}
        quranReaderStyles={quranReaderStyles}
        pageBookmarks={pageBookmarks}
        bookmarksRangeUrl={bookmarksRangeUrl}
        hasNotes={hasNotes}
        hasQuestions={hasQuestions}
      />
    </div>
  );
};

export default TranslationPageVerse;
