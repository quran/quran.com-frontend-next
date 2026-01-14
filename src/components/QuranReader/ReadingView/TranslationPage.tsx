import React from 'react';

import styles from './TranslationPage.module.scss';

import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationPageProps = {
  verses: Verse[];
  pageNumber: number;
};

/**
 * Strips HTML tags from translation text for clean inline display.
 *
 * @param {string} html - The HTML string to strip
 * @returns {string} Plain text without HTML tags
 */
const stripHtmlTags = (html: string): string => {
  // Remove HTML tags but preserve the text content
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Renders translation text in a book-like format for "Reading - Translation" mode.
 * Shows verse numbers inline with translation text in a continuous justified paragraph.
 * Note: ChapterHeader is rendered at the Page level to prevent re-mounting when switching modes.
 *
 * @returns {JSX.Element} The translation page component
 */
const TranslationPage: React.FC<TranslationPageProps> = ({ verses, pageNumber }) => {
  // Build continuous translation text with inline verse numbers
  const getTranslationContent = () => {
    if (!verses || verses.length === 0) return null;

    return verses.map((verse, index) => {
      const translation: Translation | undefined = verse.translations?.[0];
      if (!translation) return null;

      // Strip HTML and get plain text
      const plainText = stripHtmlTags(translation.text);

      return (
        <span key={verse.verseKey}>
          <span className={styles.verseNumber}>{verse.verseNumber}.</span> {plainText}
          {index < verses.length - 1 && ' '}
        </span>
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
