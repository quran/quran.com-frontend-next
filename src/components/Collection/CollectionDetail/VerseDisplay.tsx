import React, { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './CollectionVerseCell.module.scss';

import { fetcher } from '@/api';
import Error from '@/components/Error';
import BottomActions from '@/components/QuranReader/TranslationView/BottomActions';
import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useQcfFont from '@/hooks/useQcfFont';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getVerseWords, makeVerseKey } from '@/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type VerseDisplayProps = {
  chapterId: number;
  verseNumber: number;
};

interface VerseResponse {
  verse: Verse;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ chapterId, verseNumber }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);

  const verseKey = makeVerseKey(chapterId, verseNumber);

  const queryKey = isPersistGateHydrationComplete
    ? makeByVerseKeyUrl(verseKey, {
        words: true,
        translationFields: 'resource_name,language_id',
        translations: selectedTranslations.join(','),
        ...getDefaultWordFields(quranReaderStyles.quranFont),
        ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
        wordTranslationLanguage: 'en',
        wordTransliteration: 'true',
      })
    : null;

  const {
    data: verseData,
    isValidating,
    error,
    mutate,
  } = useSWRImmutable<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const verse = useMemo(() => {
    if (!verseData?.verse) return undefined;
    return { ...verseData.verse, chapterId: verseData.verse.chapterId ?? chapterId };
  }, [verseData, chapterId]);

  const versesForFont = useMemo(() => (verse ? [verse] : []), [verse]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  if (error && !isValidating) {
    return <Error onRetryClicked={mutate} error={error} />;
  }

  if (isValidating && !verse) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  if (!verse) return null;

  return (
    <>
      <TopActions verse={verse} className={styles.topActionsContainer} />

      <div className={styles.contentContainer}>
        <div className={styles.arabicVerseContainer}>
          <VerseText words={getVerseWords(verse)} shouldShowH1ForSEO={false} />
        </div>
        <div>
          {verse.translations?.map((translation: Translation) => (
            <div key={translation.id} className={styles.verseTranslationContainer}>
              <TranslationText
                translationFontScale={quranReaderStyles.translationFontScale}
                text={translation.text}
                languageId={translation.languageId}
                resourceName={verse.translations?.length > 1 ? translation.resourceName : null}
              />
            </div>
          ))}
        </div>
      </div>

      <BottomActions
        className={styles.bottomActionsContainer}
        verseKey={verse.verseKey}
        hasRelatedVerses={verse.hasRelatedVerses}
      />
    </>
  );
};

export default VerseDisplay;
