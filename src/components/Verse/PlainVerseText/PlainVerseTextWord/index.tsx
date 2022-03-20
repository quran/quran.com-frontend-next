import React, { ReactNode } from 'react';

import styles from './PlainVerseTextWord.module.scss';

import Word from 'types/Word';

interface Props {
  word: Word;
  children: ReactNode;
  shouldShowWordByWordTranslation: boolean;
  shouldShowWordByWordTransliteration: boolean;
}

const PlainVerseTextWord: React.FC<Props> = ({
  word,
  children,
  shouldShowWordByWordTransliteration,
  shouldShowWordByWordTranslation,
}) => {
  return (
    <div className={styles.plainVerseWordContainer} key={word.location}>
      {children}
      {shouldShowWordByWordTranslation && (
        <p className={styles.plainVerseWbwText}>{word?.translation?.text}</p>
      )}
      {shouldShowWordByWordTransliteration && (
        <p className={styles.plainVerseWbwText}>{word?.transliteration?.text}</p>
      )}
    </div>
  );
};

export default PlainVerseTextWord;
