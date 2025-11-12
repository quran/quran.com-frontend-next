import React, { ReactNode, useState } from 'react';

import classNames from 'classnames';

import styles from './VersePreviewWord.module.scss';

import InlineWordByWord from '@/dls/InlineWordByWord';
import Word from 'types/Word';

interface Props {
  word: Word;
  children: ReactNode;
  shouldShowInlineTranslation: boolean;
  shouldShowInlineTransliteration: boolean;
  shouldShowTooltip: boolean;
}

const VersePreviewWord: React.FC<Props> = ({
  word,
  children,
  shouldShowInlineTranslation,
  shouldShowInlineTransliteration,
  shouldShowTooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const hasTooltipContent =
    shouldShowTooltip && (word?.translation?.text || word?.transliteration?.text);

  return (
    <div
      className={styles.wordContainer}
      onMouseEnter={() => hasTooltipContent && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {shouldShowInlineTranslation && (
        <InlineWordByWord className={styles.inlineText} text={word?.translation?.text} />
      )}
      {shouldShowInlineTransliteration && (
        <InlineWordByWord className={styles.inlineText} text={word?.transliteration?.text} />
      )}
      {hasTooltipContent && showTooltip && (
        <div className={styles.tooltip}>
          {word?.translation?.text && (
            <div className={styles.tooltipText}>{word.translation.text}</div>
          )}
          {word?.transliteration?.text && (
            <div className={classNames(styles.tooltipText, styles.transliteration)}>
              {word.transliteration.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VersePreviewWord;
