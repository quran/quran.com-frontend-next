import React from 'react';

import TranslatedAyah from './TranslatedAyah';
import styles from './TranslationPage.module.scss';

import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationPageProps = {
  verses: Verse[];
  pageNumber: number;
  lang: string;
  onAyahClick?: (verseKey: string) => void;
};

/**
 * Renders translation text in a book-like format for "Reading - Translation" mode.
 * Shows verse numbers inline with translation text in a continuous justified paragraph.
 * Note: ChapterHeader is rendered at the Page level to prevent re-mounting when switching modes.
 *
 * @returns {JSX.Element} The translation page component
 */
const TranslationPage: React.FC<TranslationPageProps> = ({
  verses,
  pageNumber,
  lang,
  onAyahClick,
}) => {
  // Build continuous translation text with inline verse numbers
  const getTranslationContent = () => {
    if (!verses || verses.length === 0) return null;

    return verses.map((verse, index) => {
      const translation: Translation | undefined = verse.translations?.[0];
      if (!translation) return null;

      return (
        <TranslatedAyah
          key={verse.verseKey}
          verseKey={verse.verseKey}
          verseNumber={verse.verseNumber}
          translationHtml={translation.text}
          languageId={translation.languageId}
          lang={lang}
          isLastVerse={index === verses.length - 1}
          onAyahClick={onAyahClick}
        />
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.translationContent}>{getTranslationContent()}</div>
      <div className={styles.pageFooter}>
        <span className={styles.pageNumber}>{pageNumber}</span>
      </div>
    </div>
  );
};

export default TranslationPage;
