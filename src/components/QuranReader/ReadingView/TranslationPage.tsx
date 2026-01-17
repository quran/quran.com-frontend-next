import React from 'react';

import classNames from 'classnames';

import TranslatedAyah from './TranslatedAyah';
import styles from './TranslationPage.module.scss';

import { getLanguageDataById, toLocalizedNumber } from '@/utils/locale';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type TranslationPageProps = {
  verses: Verse[];
  pageNumber: number;
  lang: string;
  bookmarksRangeUrl?: string | null;
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
  bookmarksRangeUrl,
}) => {
  // Get language data from the first translation for RTL direction and number formatting
  const firstTranslation: Translation | undefined = verses?.[0]?.translations?.[0];
  const langData = firstTranslation?.languageId
    ? getLanguageDataById(firstTranslation.languageId)
    : null;

  // Build continuous translation text with inline verse numbers
  const getTranslationContent = () => {
    if (!verses || verses.length === 0) return null;

    return verses.map((verse, index) => {
      const translation: Translation | undefined = verse.translations?.[0];
      if (!translation) return null;

      return (
        <TranslatedAyah
          key={verse.verseKey}
          verse={verse}
          translationHtml={translation.text}
          languageId={translation.languageId}
          lang={lang}
          isLastVerse={index === verses.length - 1}
          bookmarksRangeUrl={bookmarksRangeUrl}
        />
      );
    });
  };

  return (
    <div className={classNames(styles.container, langData && styles[langData.direction])}>
      <div className={styles.translationContent}>{getTranslationContent()}</div>
      <div className={styles.pageFooter}>
        <span className={styles.pageNumber}>
          {toLocalizedNumber(pageNumber, langData?.code || lang)}
        </span>
      </div>
    </div>
  );
};

export default TranslationPage;
