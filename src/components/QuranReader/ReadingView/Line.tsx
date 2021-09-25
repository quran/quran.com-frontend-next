import React, { RefObject, useEffect } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './Line.module.scss';

import VerseText from 'src/components/Verse/VerseText';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from 'src/hooks/useScrollToElement';
import { selectEnableAutoScrolling } from 'src/redux/slices/AudioPlayer/state';
import { selectIsLineHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import Word from 'types/Word';

export type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
};

const Line = ({ lineKey, words, isBigTextLayout }: LineProps) => {
  const isHighlighted = useSelector(selectIsLineHighlighted(words.map((word) => word.verseKey)));
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);

  useEffect(() => {
    if (isHighlighted && enableAutoScrolling) {
      scrollToSelectedItem();
    }
  }, [isHighlighted, scrollToSelectedItem, enableAutoScrolling]);

  return (
    <div
      ref={selectedItemRef}
      id={lineKey}
      className={classNames(styles.container, {
        [styles.highlighted]: isHighlighted,
        [styles.mobileInline]: isBigTextLayout,
      })}
    >
      <div className={classNames(styles.line, { [styles.mobileInline]: isBigTextLayout })}>
        <VerseText words={words} isReadingMode isHighlighted={isHighlighted} />
      </div>
    </div>
  );
};

export default React.memo(Line);
