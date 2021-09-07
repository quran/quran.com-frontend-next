import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import classNames from 'classnames';
import Chapter from 'types/Chapter';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
  chapters: Record<string, Chapter>;
};

const Line = ({ lineKey, words, isBigTextLayout, chapters }: LineProps) => (
  <div
    id={lineKey}
    className={classNames(styles.container, { [styles.mobileInline]: isBigTextLayout })}
  >
    <div className={classNames(styles.line, { [styles.mobileInline]: isBigTextLayout })}>
      <VerseText chapters={chapters} words={words} isReadingMode />
    </div>
  </div>
);

export default React.memo(Line);
