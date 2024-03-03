import { useEffect, useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';
import TranslationViewCell from '../TranslationViewCell';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from '@/types/ApiResponses';
import Translation from '@/types/Translation';
import Verse from '@/types/Verse';
import { getPageBookmarks } from '@/utils/auth/api';
import { toLocalizedNumber } from '@/utils/locale';

interface TranslationPageVerse {
  verse: Verse;
  selectedTranslations?: number[];
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
  selectedTranslations,
  bookmarksRangeUrl,
  mushafId,
  verseIdx,
  quranReaderStyles,
  initialData,
  firstVerseInPage,
  isLastVerseInView,
  notesRange,
}) => {
  const { t, lang } = useTranslation('common');
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

  const getTranslationNameString = (translations?: Translation[]) => {
    let translationName = t('settings.no-translation-selected');
    if (translations?.length === 1) translationName = translations?.[0].resourceName;
    if (translations?.length === 2) {
      translationName = t('settings.value-and-other', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });
    }
    if (translations?.length > 2) {
      translationName = t('settings.value-and-others', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });
    }

    return translationName;
  };

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
          chapterId={String(verse.chapterId)}
          pageNumber={verse.pageNumber}
          hizbNumber={verse.hizbNumber}
          isTranslationSelected={selectedTranslations?.length > 0}
        />
      )}

      <TranslationViewCell
        verseIndex={verseIdx}
        verse={verse}
        key={verse.id}
        quranReaderStyles={quranReaderStyles}
        pageBookmarks={pageBookmarks}
        bookmarksRangeUrl={bookmarksRangeUrl}
        hasNotes={notesCount && notesCount[verse.verseKey] > 0}
      />
    </div>
  );
};

export default TranslationPageVerse;
