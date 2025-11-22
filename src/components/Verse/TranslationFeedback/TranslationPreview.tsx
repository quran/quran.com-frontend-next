import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationPreview.module.scss';

import Loader from '@/components/QuranReader/Loader';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import Translation from '@/types/Translation';
import { WordVerse } from '@/types/Word';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

type Props = {
  verse: WordVerse;
  selectedTranslationId: string;
};

const TranslationPreview: React.FC<Props> = ({ verse, selectedTranslationId }) => {
  const shouldFetch = Boolean(selectedTranslationId);
  const { t } = useTranslation('common');

  const chapterNumber = getChapterNumberFromKey(verse.verseKey);
  const verseNumber = getVerseNumberFromKey(verse.verseKey);

  const { data, translationFontScale } = useVerseAndTranslation({
    chapter: chapterNumber,
    from: verseNumber,
    to: verseNumber,
    translationsLimit: undefined,
  });

  const isLoadingTranslation = !data && shouldFetch;

  const translation = useMemo((): Translation | null => {
    const translations = data?.verses?.[0]?.translations;
    if (!translations) return null;

    const selectedTranslation = translations.find(
      (tran) => tran.resourceId === parseInt(selectedTranslationId, 10),
    );

    return selectedTranslation ?? null;
  }, [data, selectedTranslationId]);

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
          languageId={translation.languageId!}
          translationFontScale={translationFontScale}
        />
      </div>
    );
  }

  // In Practical this should never happen
  return <div className={styles.error}>{t('error.general')}</div>;
};

export default TranslationPreview;
