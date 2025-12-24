import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationPreview.module.scss';

import Loader from '@/components/QuranReader/Loader';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { VersesResponse } from '@/types/ApiResponses';
import { WordVerse } from '@/types/Word';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

const FONT_SCALE_FOR_TRANSLATION_PREVIEW = 2; // 2 is 16px based on design

/**
 * Finds the selected translation from the verses response data.
 *
 * @param {VersesResponse} data - The verses response containing translation data
 * @param {string} selectedTranslationId - The ID of the translation to find
 * @returns {object|null} The selected translation object or null if not found
 */
const findSelectedTranslation = (data: VersesResponse, selectedTranslationId: string) => {
  const translations = data?.verses?.[0]?.translations;
  if (!translations) return null;

  const selectedTranslation = translations.find(
    (translation) => translation.resourceId === parseInt(selectedTranslationId, 10),
  );

  return selectedTranslation ?? null;
};

interface TranslationPreviewProps {
  verse: WordVerse;
  selectedTranslationId: string;
}

const TranslationPreview: React.FC<TranslationPreviewProps> = ({
  verse,
  selectedTranslationId,
}) => {
  const shouldFetch = Boolean(selectedTranslationId);
  const { t } = useTranslation('common');

  const chapterNumber = getChapterNumberFromKey(verse.verseKey);
  const verseNumber = getVerseNumberFromKey(verse.verseKey);

  const { data, error } = useVerseAndTranslation({
    chapter: chapterNumber,
    from: shouldFetch ? verseNumber : undefined,
    to: verseNumber,
    translationsLimit: undefined,
  });

  const isLoadingTranslation = !data && shouldFetch && !error;

  const translation = useMemo(
    () => findSelectedTranslation(data, selectedTranslationId),
    [data, selectedTranslationId],
  );

  if (!shouldFetch) return null;

  if (isLoadingTranslation) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (translation) {
    return (
      <div>
        <TranslationText
          key={selectedTranslationId}
          text={`"${translation.text}"`}
          languageId={translation.languageId}
          translationFontScale={FONT_SCALE_FOR_TRANSLATION_PREVIEW}
        />
      </div>
    );
  }

  // In practice this should never happen
  return <div className={styles.error}>{t('error.general')}</div>;
};

export default TranslationPreview;
