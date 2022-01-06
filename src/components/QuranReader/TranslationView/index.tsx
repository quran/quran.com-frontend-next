import React, { useRef } from 'react';

import { useDispatch } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import { setLastReadVerse } from 'src/redux/slices/QuranReader/readingTracker';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const dispatch = useDispatch();
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
      />
    </div>
  );
};

export default TranslationView;
