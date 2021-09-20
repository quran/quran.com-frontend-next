import React, { RefObject, useEffect } from 'react';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';

import useScroll from 'src/hooks/useScrollToElement';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const SCROLL_TO_SELECTED_ELEMENT_OPTIONS = {
  block: 'nearest', // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
} as ScrollIntoViewOptions;

const TranslationView = ({ verses }: TranslationViewProps) => {
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SCROLL_TO_SELECTED_ELEMENT_OPTIONS);

  useEffect(() => {
    setTimeout(() => scrollToSelectedItem(), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {verses.map((verse, index) => (
        <TranslationViewCell
          verse={verse}
          isHighlighted={false}
          ref={index === 5 ? selectedItemRef : null}
        />
      ))}
    </div>
  );
};

export default TranslationView;
