/* eslint-disable max-lines */
import React from 'react';

import styles from '../TranslationView.module.scss';

import useDedupedFetchVerse from './hooks/useDedupedFetchVerse';
import TranslationPageVerse from './TranslationPageVerse';

import TranslationViewSkeleton from '@/components/QuranReader/TranslationView/TranslationViewSkeleton';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getMushafId } from '@/utils/api';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  quranReaderStyles: QuranReaderStyles;
  selectedTranslations: number[];
  setApiPageToVersesMap: (data: Record<number, Verse[]>) => void;
  quranReaderDataType: QuranReaderDataType;
  wordByWordLocale: string;
  reciterId: number;
  resourceId: number | string;
  initialData: VersesResponse;
  verseIdx: number;
  totalVerses: number;
}

const TranslationViewVerse: React.FC<Props> = ({
  quranReaderDataType,
  wordByWordLocale,
  reciterId,
  resourceId,
  setApiPageToVersesMap,
  initialData,
  quranReaderStyles,
  selectedTranslations,
  verseIdx,
  totalVerses,
}) => {
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { verse, firstVerseInPage, bookmarksRangeUrl } = useDedupedFetchVerse({
    verseIdx,
    quranReaderDataType,
    quranReaderStyles,
    wordByWordLocale,
    reciterId,
    resourceId,
    selectedTranslations,
    initialData,
    setApiPageToVersesMap,
    mushafId,
  });

  if (!verse) {
    return <TranslationViewSkeleton numberOfSkeletons={1} />;
  }

  return (
    <div className={styles.container}>
      <TranslationPageVerse
        isLastVerseInView={verseIdx + 1 === totalVerses}
        verse={verse}
        verseIdx={verseIdx}
        mushafId={mushafId}
        quranReaderStyles={quranReaderStyles}
        selectedTranslations={selectedTranslations}
        bookmarksRangeUrl={bookmarksRangeUrl}
        initialData={initialData}
        firstVerseInPage={firstVerseInPage}
      />
    </div>
  );
};

export default TranslationViewVerse;
