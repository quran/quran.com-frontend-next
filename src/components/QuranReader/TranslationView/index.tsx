/* eslint-disable react/no-multi-comp */
import React, { useRef } from 'react';

import dynamic from 'next/dynamic';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useQcfFont from 'src/hooks/useQcfFont';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getChapterData } from 'src/utils/chapter';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
  size: number;
  setSize: (size: number | ((_size: number) => number)) => Promise<Verse[]>;
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

const getTotalCount = (
  firstVerse: Verse,
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
): number => {
  const { chapterId } = firstVerse;
  if (quranReaderDataType === QuranReaderDataType.Verse) {
    return 1;
  }
  if (quranReaderDataType === QuranReaderDataType.VerseRange) {
    return Number(initialData.metaData.to) - Number(initialData.metaData.from) + 1;
  }

  // TODO: add page/juz
  const chapterData = getChapterData(String(chapterId));
  return chapterData.versesCount;
};

const FETCHING_THRESHOLD = 5;
const ITEMS_PER_PAGE = 10;

const TranslationView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  verses,
  setSize,
  size,
}: TranslationViewProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useQcfFont(quranReaderStyles.quranFont, verses);
  const [firstVerse] = verses;
  const { verseNumber: firstVerseNumber } = firstVerse;
  const showChapterHeader = firstVerseNumber === 1;

  const onRangeChange = (renderedRange: ListRange) => {
    if (size * ITEMS_PER_PAGE - renderedRange.endIndex + 1 <= FETCHING_THRESHOLD) {
      const pageNumberOfRange = Math.floor(renderedRange.endIndex / ITEMS_PER_PAGE) + 1;
      setSize(pageNumberOfRange);
    }
  };

  const itemContentRenderer = (currentVerseIndex: number) => {
    return verses[currentVerseIndex] ? (
      <TranslationViewCell
        verseIndex={currentVerseIndex}
        verse={verses[currentVerseIndex]}
        key={verses[currentVerseIndex].id}
        quranReaderStyles={quranReaderStyles}
      />
    ) : (
      <TranslationViewCellSkeleton />
    );
  };

  return (
    <div className={styles.container}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        totalCount={getTotalCount(firstVerse, quranReaderDataType, initialData)}
        overscan={800}
        rangeChanged={onRangeChange}
        initialItemCount={verses.length} // needed for SSR.
        itemContent={itemContentRenderer}
        components={{
          Footer: () => (
            <EndOfScrollingControls
              quranReaderDataType={quranReaderDataType}
              lastVerse={verses[verses.length - 1]}
            />
          ),
          ...(showChapterHeader && {
            Header: () => (
              <ChapterHeader
                chapterId={String(firstVerse.chapterId)}
                pageNumber={firstVerse.pageNumber}
                hizbNumber={firstVerse.hizbNumber}
              />
            ),
          }),
        }}
      />
    </div>
  );
};

export default TranslationView;
