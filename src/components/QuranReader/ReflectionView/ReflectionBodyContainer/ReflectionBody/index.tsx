import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReflectionDisclaimerMessage from '../../ReflectionDisclaimerMessage';

import styles from './ReflectionBody.module.scss';

import Button from 'src/components/dls/Button/Button';
import Separator from 'src/components/dls/Separator/Separator';
import ReflectionItem, {
  VerseReference,
} from 'src/components/QuranReader/ReflectionView/ReflectionItem';
import TafsirEndOfScrollingActions from 'src/components/QuranReader/TafsirView/TafsirEndOfScrollingActions';
import TranslationText from 'src/components/QuranReader/TranslationView/TranslationText';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import { logButtonClick } from 'src/utils/eventLogger';
import {
  fakeNavigate,
  getQuranReflectVerseUrl,
  getVerseReflectionNavigationUrl,
} from 'src/utils/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from 'src/utils/verse';

/**
 * From reflection data, extract the verse references
 * This is is a temporary function, once we migrate to use Quran.com's API we will probably remove this function
 *
 * @param {Object} reflection
 * @returns {VerseReference[]} verseReferences
 */
const getVerseReferencesFromReflection = (reflection: any): VerseReference[] => {
  return reflection.filters.map((filter) => {
    const chapter = filter.surahNumber;
    const { from, to } = filter;
    return { chapter, from, to };
  });
};

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  data: any;
  scrollToTop: () => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
  translationFontScale: number;
}

const ReflectionBody: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  data,
  scrollToTop,
  setSelectedVerseNumber,
  translationFontScale,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const hasNextVerse = !isLastVerseOfSurah(selectedChapterId, Number(selectedVerseNumber));
  const hasPrevVerse = !isFirstVerseOfSurah(Number(selectedVerseNumber));

  const loadNextVerse = useCallback(() => {
    logButtonClick('reflection_next_verse');
    scrollToTop();
    const newVerseNumber = String(Number(selectedVerseNumber) + 1);
    fakeNavigate(
      getVerseReflectionNavigationUrl(
        makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
      ),
      lang,
    );
    setSelectedVerseNumber(newVerseNumber);
  }, [lang, scrollToTop, selectedChapterId, selectedVerseNumber, setSelectedVerseNumber]);

  const loadPrevVerse = useCallback(() => {
    const newVerseNumber = String(Number(selectedVerseNumber) - 1);
    logButtonClick('reflection_prev_verse');
    scrollToTop();
    setSelectedVerseNumber(newVerseNumber);
    fakeNavigate(
      getVerseReflectionNavigationUrl(
        makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
      ),
      lang,
    );
  }, [lang, scrollToTop, selectedChapterId, selectedVerseNumber, setSelectedVerseNumber]);

  return (
    <div className={styles.container}>
      {data?.verse && (
        <div className={styles.verseContainer}>
          <PlainVerseText words={data.verse?.words} />
        </div>
      )}
      {data?.verse?.translations?.length > 0 && (
        <div className={styles.translationContainer}>
          <TranslationText
            languageId={data.verse.translations?.[0].languageId}
            resourceName={data.verse.translations?.[0].resourceName}
            translationFontScale={translationFontScale}
            text={data.verse.translations?.[0].text}
          />
        </div>
      )}
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      <ReflectionDisclaimerMessage />
      {data?.reflections?.map((reflection) => (
        <ReflectionItem
          id={reflection.id}
          key={reflection.id}
          date={reflection.createdAt}
          authorName={reflection?.author?.name}
          authorUsername={reflection?.author?.username}
          isAuthorVerified={reflection?.author?.verified}
          reflectionText={reflection?.body}
          avatarUrl={reflection?.author?.profileImg}
          verseReferences={getVerseReferencesFromReflection(reflection)}
        />
      ))}
      <div className={styles.readMoreButtonContainer}>
        <Button
          href={getQuranReflectVerseUrl(
            makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
          )}
          newTab
        >
          {t('read-more-quran-reflect')}
        </Button>
      </div>

      <div className={styles.endOfScrollActionsContainer}>
        <TafsirEndOfScrollingActions
          hasNextVerseGroup={hasNextVerse}
          hasPrevVerseGroup={hasPrevVerse}
          onNextButtonClicked={loadNextVerse}
          onPreviousButtonClicked={loadPrevVerse}
        />
      </div>
    </div>
  );
};

export default ReflectionBody;
