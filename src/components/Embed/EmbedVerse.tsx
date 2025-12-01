import React from 'react';

import classNames from 'classnames';

import styles from './Embed.module.scss';
import EmbedVerseText from './EmbedVerseText';

import { EmbedConfig, EmbedTextAlignment } from 'types/Embed';
import Verse from 'types/Verse';

interface EmbedVerseProps {
  verse: Verse;
  config: EmbedConfig;
  chapterName?: string;
}

/**
 * Renders a single verse with its translations for the embed widget.
 * Uses EmbedVerseText component for proper Quran font rendering.
 *
 * @returns {JSX.Element} The verse display component
 */
const EmbedVerse: React.FC<EmbedVerseProps> = ({ verse, config, chapterName }) => {
  const textAlignClass = {
    [EmbedTextAlignment.Start]: styles.textAlignStart,
    [EmbedTextAlignment.Center]: styles.textAlignCenter,
    [EmbedTextAlignment.End]: styles.textAlignEnd,
  }[config.textAlign];

  return (
    <div className={styles.verseContainer}>
      {/* Verse Reference */}
      {config.showReference && (
        <div className={styles.verseReference}>
          <span className={styles.verseNumber}>{verse.verseNumber}</span>
          {chapterName && <span className={styles.chapterName}>{chapterName}</span>}
        </div>
      )}

      {/* Arabic Text - Use EmbedVerseText with explicit font config */}
      {verse.words && verse.words.length > 0 && (
        <div className={styles.arabicTextContainer}>
          <EmbedVerseText words={verse.words} quranFont={config.quranFont} />
        </div>
      )}

      {/* Translations */}
      {verse.translations?.map((translation) => (
        <div
          key={translation.id}
          className={classNames(styles.translationContainer, textAlignClass)}
        >
          <div
            className={styles.translationText}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: translation.text }}
          />
          {config.showTranslationName && translation.resourceName && (
            <div className={styles.translationName}>{translation.resourceName}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmbedVerse;
