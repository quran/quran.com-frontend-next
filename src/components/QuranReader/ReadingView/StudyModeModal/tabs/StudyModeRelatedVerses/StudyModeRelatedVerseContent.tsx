import React, { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import StudyModeBodyContent from '../../StudyModeBodyContent';

import styles from './StudyModeRelatedVerses.module.scss';
import StudyModeRelatedVerseSkeleton from './StudyModeRelatedVerseSkeleton';

import { fetcher } from '@/api';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Collapsible from '@/dls/Collapsible/Collapsible';
import Separator from '@/dls/Separator/Separator';
import useQcfFont from '@/hooks/useQcfFont';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByRangeVersesUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKeyAuto } from '@/utils/locale';
import { VersesResponse } from 'types/ApiResponses';
import RelatedVerse from 'types/RelatedVerse';

const NOOP = (): void => {};

interface StudyModeRelatedVerseContentProps {
  relatedVerse: RelatedVerse;
  currentVerseKey: string;
  onGoToVerse?: (chapterId: string, verseNumber: string, previousVerseKey?: string) => void;
}

const StudyModeRelatedVerseContent: React.FC<StudyModeRelatedVerseContentProps> = ({
  relatedVerse,
  currentVerseKey,
  onGoToVerse,
}) => {
  const { t, lang } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const wordByWordLocale = useSelector(selectWordByWordLocale);

  const [chapterId, verseNumber] = relatedVerse.verseKeyFrom.split(':');

  const handleGoToVerse = useCallback(() => {
    logButtonClick('study_mode_goto_verse', { verseKey: relatedVerse.verseKeyFrom });
    onGoToVerse?.(chapterId, verseNumber, currentVerseKey);
  }, [chapterId, verseNumber, onGoToVerse, relatedVerse.verseKeyFrom, currentVerseKey]);

  // Fetch verse data for the range
  const queryKey = makeByRangeVersesUrl(lang, {
    from: relatedVerse.verseKeyFrom,
    to: relatedVerse.verseKeyTo,
    words: true,
    perPage: 'all',
    translationFields: 'resource_name,language_id',
    translations: selectedTranslations.join(','),
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
    wordTranslationLanguage: wordByWordLocale,
    wordTransliteration: 'true',
  });

  const { data, isValidating } = useSWR<VersesResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const verses = data?.verses;

  const title = useMemo(() => {
    const verseKeyFrom = toLocalizedVerseKeyAuto(relatedVerse.verseKeyFrom, lang);

    // Single verse: "Al-Fatihah 1:1"
    if (relatedVerse.verseIdFrom === relatedVerse.verseIdTo) {
      return `${relatedVerse.chapterNameFrom} ${verseKeyFrom}`;
    }

    const surahFrom = relatedVerse.verseKeyFrom.split(':')[0];
    const surahTo = relatedVerse.verseKeyTo.split(':')[0];

    // Cross-surah range: "Al-Fatihah 1:4 - Al-Baqarah 2:3"
    if (surahFrom !== surahTo) {
      const verseKeyTo = toLocalizedVerseKeyAuto(relatedVerse.verseKeyTo, lang);
      return `${relatedVerse.chapterNameFrom} ${verseKeyFrom} - ${relatedVerse.chapterNameTo} ${verseKeyTo}`;
    }

    // Same surah range: "Al-Fatihah 1:1-4"
    const verseNumberTo = toLocalizedNumber(Number(relatedVerse.verseKeyTo.split(':')[1]), lang);
    return `${relatedVerse.chapterNameFrom} ${verseKeyFrom}-${verseNumberTo}`;
  }, [relatedVerse, lang]);

  const versesForFont = useMemo(() => verses || [], [verses]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  if (isValidating || !verses || verses.length === 0) {
    return <StudyModeRelatedVerseSkeleton />;
  }

  return (
    <>
      <div className={styles.relatedVerse}>
        <Collapsible
          title={<p className={styles.title}>{title}</p>}
          suffix={<ChevronDownIcon />}
          shouldRotateSuffixOnToggle
          headerLeftClassName={styles.collapsibleHeader}
        >
          {({ isOpen }) => {
            if (!isOpen) return null;

            return (
              <div className={styles.relatedVerseContent}>
                {verses.map((verse) => (
                  <>
                    <StudyModeBodyContent
                      verse={verse}
                      showWordBox={false}
                      onWordClick={NOOP}
                      onWordBoxClose={NOOP}
                      onNavigatePreviousWord={NOOP}
                      onNavigateNextWord={NOOP}
                      canNavigateWordPrev={false}
                      canNavigateWordNext={false}
                    />
                    <div className={styles.relatedVerseCta}>
                      <Button
                        className={styles.goToVerseButton}
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Compact}
                        onClick={handleGoToVerse}
                      >
                        {t('go-to-verse')}
                      </Button>
                    </div>
                  </>
                ))}
              </div>
            );
          }}
        </Collapsible>
      </div>
      <div className={styles.relatedVerseSeparatorContainer}>
        <Separator />
      </div>
    </>
  );
};

export default StudyModeRelatedVerseContent;
