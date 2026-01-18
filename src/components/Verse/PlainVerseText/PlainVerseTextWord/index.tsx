import React, { ReactNode } from 'react';

import styles from './PlainVerseTextWord.module.scss';

import InlineWordByWord from '@/dls/InlineWordByWord';
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
        <InlineWordByWord
          className={styles.plainVerseWbwText}
          text={word?.translation?.text}
          data-testid="wbw-translation"
        />
      )}
      {shouldShowWordByWordTransliteration && (
        <InlineWordByWord
          className={styles.plainVerseWbwText}
          text={word?.transliteration?.text}
          data-testid="wbw-transliteration"
        />
      )}
    </div>
  );
};

export default PlainVerseTextWord;
