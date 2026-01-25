import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import StudyModeVerseText from '../../StudyModeVerseText';

import styles from './RelatedVerses.module.scss';

import { fetcher } from '@/api';
import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Collapsible from '@/dls/Collapsible/Collapsible';
import Pill from '@/dls/Pill';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import {
  isArabicText,
  isRTLLocale,
  toLocalizedVerseKey,
  toLocalizedVerseKeyRTL,
} from '@/utils/locale';
import { getVerseWords } from '@/utils/verse';
import RelatedVerse from 'types/RelatedVerse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

interface VerseResponse {
  verse: Verse;
}

interface RelatedVerseCollapsibleProps {
  relatedVerse: RelatedVerse;
  onGoToVerse?: (chapterId: string, verseNumber: string) => void;
}

const RelatedVerseCollapsible: React.FC<RelatedVerseCollapsibleProps> = ({
  relatedVerse,
  onGoToVerse,
}) => {
  const { t, lang } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);

  // Parse verse key to get chapter and verse numbers
  const [chapterId, verseNumber] = relatedVerse.verseKey.split(':');

  // Fetch verse data when accordion is opened
  const queryKey = isOpen
    ? makeByVerseKeyUrl(relatedVerse.verseKey, {
        words: true,
        translationFields: 'resource_name,language_id',
        translations: selectedTranslations.join(','),
        ...getDefaultWordFields(quranReaderStyles.quranFont),
        ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
        wordTranslationLanguage: 'en',
        wordTransliteration: 'true',
      })
    : null;

  const { data, isValidating } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const verse = data?.verse;

  // Get localized verse reference (e.g., "٢:٢٥٥" for Arabic)
  const verseKey = `${chapterId}:${verseNumber}`;
  const verseReference = isRTLLocale(lang)
    ? toLocalizedVerseKeyRTL(verseKey, lang)
    : toLocalizedVerseKey(verseKey, lang);

  // Show pill if: not in Arabic locale OR (in Arabic locale AND relation is Arabic text)
  const shouldShowPill = lang !== 'ar' || isArabicText(relatedVerse.relation);

  const title = (
    <div className={styles.header}>
      <p className={styles.headerText}>
        {relatedVerse.chapterName} {verseReference}
      </p>
      {shouldShowPill && (
        <Pill containerClassName={styles.relationBadge}>{relatedVerse.relation}</Pill>
      )}
    </div>
  );

  return (
    <div className={styles.collapsibleItem}>
      <Collapsible
        title={title}
        suffix={<ChevronDownIcon />}
        shouldRotateSuffixOnToggle
        onOpenChange={setIsOpen}
        headerLeftClassName={styles.collapsibleHeader}
      >
        {() => (
          <div className={styles.collapsibleContent}>
            {isValidating && !verse && (
              <div className={styles.loadingContainer}>
                <span>{t('loading')}</span>
              </div>
            )}

            {verse && (
              <div className={styles.verseContainer}>
                <TopActions verse={verse} bookmarksRangeUrl="" shouldUseModalZIndex />
                <div className={styles.arabicText}>
                  <StudyModeVerseText words={getVerseWords(verse)} />
                </div>
                <div className={styles.translationsContainer}>
                  {verse.translations?.map((translation: Translation) => (
                    <TranslationText
                      key={translation.id}
                      translationFontScale={quranReaderStyles.translationFontScale}
                      text={translation.text}
                      languageId={translation.languageId}
                      resourceName={
                        verse.translations?.length > 1 ? translation.resourceName : null
                      }
                    />
                  ))}
                </div>
              </div>
            )}
            <Button
              className={styles.goToVerseButton}
              size={ButtonSize.Small}
              variant={ButtonVariant.Compact}
              onClick={() => onGoToVerse?.(chapterId, verseNumber)}
            >
              {t('go-to-verse')}
            </Button>
          </div>
        )}
      </Collapsible>
    </div>
  );
};

export default RelatedVerseCollapsible;
