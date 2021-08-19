import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import classNames from 'classnames';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
};

const Line = ({ lineKey, words, isBigTextLayout }: LineProps) => (
  <div
    id={lineKey}
    className={classNames(styles.container, { [styles.mobileInline]: isBigTextLayout })}
  >
    <div className={classNames(styles.line, { [styles.mobileInline]: isBigTextLayout })}>
      <VerseText words={words} isReadingMode />
    </div>
  </div>
);

export default React.memo(Line);
