import React, { ReactNode } from 'react';

import classNames from 'classnames';

import styles from './PlainVerseTextWord.module.scss';

import InlineWordByWord from '@/dls/InlineWordByWord';
import Word from 'types/Word';

interface Props {
  word: Word;
  children: ReactNode;
  shouldShowWordByWordTranslation: boolean;
  shouldShowWordByWordTransliteration: boolean;
  isHighlighted?: boolean;
}

const PlainVerseTextWord: React.FC<Props> = ({
  word,
  children,
  shouldShowWordByWordTransliteration,
  shouldShowWordByWordTranslation,
  isHighlighted = false,
}) => {
  return (
    <div className={classNames(styles.plainVerseWordContainer, {
      [styles.highlighted]: isHighlighted,
    })} key={word.location}>
      {children}
      {shouldShowWordByWordTranslation && (
        <InlineWordByWord className={styles.plainVerseWbwText} text={word?.translation?.text} />
      )}
      {shouldShowWordByWordTransliteration && (
        <InlineWordByWord className={styles.plainVerseWbwText} text={word?.transliteration?.text} />
      )}
    </div>
  );
};

export default PlainVerseTextWord;
