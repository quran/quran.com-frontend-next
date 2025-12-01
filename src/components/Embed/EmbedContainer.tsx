import React, { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './Embed.module.scss';
import EmbedVerse from './EmbedVerse';

import useQcfFont from '@/hooks/useQcfFont';
import { EmbedConfig, EmbedTextAlignment } from 'types/Embed';
import Verse from 'types/Verse';

interface EmbedContainerProps {
  verses: Verse[];
  config: EmbedConfig;
  chapterName?: string;
  error?: string;
}

/**
 * Container component for the embed widget.
 * Handles layout, footer branding, postMessage for dynamic height, and font loading.
 *
 * @returns {JSX.Element} The embed container with verses and footer
 */
const EmbedContainer: React.FC<EmbedContainerProps> = ({ verses, config, chapterName, error }) => {
  const { t } = useTranslation('embed');

  // Load QCF fonts for the verses using the existing hook
  useQcfFont(config.quranFont, verses);

  // Send height to parent for dynamic iframe sizing
  useEffect(() => {
    const sendHeight = (): void => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'quran-embed-resize', height }, '*');
    };

    // Initial height
    sendHeight();

    // Re-send on resize
    window.addEventListener('resize', sendHeight);
    return () => window.removeEventListener('resize', sendHeight);
  }, [verses]);

  const readMoreUrl = `https://quran.com/${config.chapterId}/${config.fromVerse}`;

  const textAlignClass = {
    [EmbedTextAlignment.Start]: styles.textAlignStart,
    [EmbedTextAlignment.Center]: styles.textAlignCenter,
    [EmbedTextAlignment.End]: styles.textAlignEnd,
  }[config.textAlign];

  if (error) {
    return (
      <div className={styles.embedContainer} style={{ borderRadius: `${config.borderRadius}px` }}>
        <div className={styles.errorContainer}>
          <div className={styles.errorTitle}>{t('error-title')}</div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.embedContainer, textAlignClass)}
      style={{ borderRadius: `${config.borderRadius}px` }}
      data-theme={config.theme}
    >
      {verses.map((verse) => (
        <EmbedVerse key={verse.verseKey} verse={verse} config={config} chapterName={chapterName} />
      ))}

      <div className={styles.footer}>
        <a
          href="https://quran.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.poweredBy}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://quran.com/icons/Logo.svg"
            alt="Quran.com"
            className={styles.logo}
            width={16}
            height={16}
          />
          <span>{t('powered-by')}</span>
        </a>

        <a href={readMoreUrl} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
          {t('read-more')}
        </a>
      </div>
    </div>
  );
};

export default EmbedContainer;
