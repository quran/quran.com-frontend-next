/* eslint-disable react/no-multi-comp */
import React, { useRef } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

const TranslationView = ({
  verses,
  quranReaderStyles,
  quranReaderDataType,
}: TranslationViewProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const dispatch = useDispatch();
  const [firstVerse] = verses;
  const showChapterHeader = firstVerse.verseNumber === 1;
  return (
    <div className={styles.container}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        totalCount={verses.length}
        overscan={30}
        initialItemCount={10} // needed for SSR
        rangeChanged={(range) => {
          const firstVisibleVerse = verses[range.startIndex];
          dispatch({
            type: setLastReadVerse.type,
            payload: {
              verseKey: firstVisibleVerse.verseKey,
              chapterId: firstVisibleVerse.chapterId,
              page: firstVisibleVerse.pageNumber,
              hizb: firstVisibleVerse.hizbNumber,
            },
          });
        }}
        itemContent={(index) => {
          const verse = verses[index];
          return verse ? (
            <TranslationViewCell
              verseIndex={index}
              verse={verse}
              key={verses[index].id}
              quranReaderStyles={quranReaderStyles}
            />
          ) : null;
        }}
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
