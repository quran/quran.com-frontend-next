import React, { useRef } from 'react';

import { useDispatch } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

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
  const dispatch = useDispatch();
  const virtuoso = useRef(null);
  return (
    <div className={styles.container}>
      <Virtuoso
        ref={virtuoso}
        useWindowScroll
        totalCount={verses.length}
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
            <TranslationViewCell verse={verse} quranReaderStyles={quranReaderStyles} />
          ) : null;
        }}
      />
    </div>
  );
};

export default TranslationView;
