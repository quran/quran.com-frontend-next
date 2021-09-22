import React from 'react';

import classNames from 'classnames';

import styles from './Line.module.scss';

import VerseText from 'src/components/Verse/VerseText';
import Word from 'types/Word';

export type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
  isHighlighted?: boolean;
};

const Line = ({ lineKey, words, isBigTextLayout, isHighlighted }: LineProps) => (
  <div
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

export default React.memo(Line);
