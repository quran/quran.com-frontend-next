import React from 'react';
import Word from 'types/Word';
import VerseText from 'src/components/Verse/VerseText';
import classNames from 'classnames';
import styles from './Line.module.scss';

type LineProps = {
  words: Word[];
  lineKey: string;
  hasSpecialLayout: boolean;
};

const Line = ({ lineKey, words, hasSpecialLayout }: LineProps) => (
  <div id={lineKey} className={classNames(styles.container, { [styles.inline]: hasSpecialLayout })}>
    <div className={classNames(styles.line, { [styles.inline]: hasSpecialLayout })}>
      <VerseText words={words} isReadingMode />
    </div>
  </div>
);

export default React.memo(Line);
