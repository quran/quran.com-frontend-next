import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionBody.module.scss';

import ReflectionDisclaimerMessage from '@/components/QuranReader/ReflectionView/ReflectionDisclaimerMessage';
import ReflectionItem from '@/components/QuranReader/ReflectionView/ReflectionItem';
import ReflectionNotAvailableMessage from '@/components/QuranReader/ReflectionView/ReflectionNotAvailableMessage';
import TafsirEndOfScrollingActions from '@/components/QuranReader/TafsirView/TafsirEndOfScrollingActions';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Button from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getQuranReflectVerseUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { ReflectionVerseReference } from 'types/ReflectionVerseReference';

/**
 * From reflection data, extract the verse references
 * This is is a temporary function, once we migrate to use Quran.com's API we will probably remove this function
 *
 * @param {object} reflection
 * @returns {ReflectionVerseReference[]} verseReferences
 */
const getVerseReferencesFromReflection = (reflection: any): ReflectionVerseReference[] => {
  return reflection.filters.map((filter) => {
    const { surahNumber, from, to } = filter;

    return {
      chapter: Number(surahNumber),
      from: Number(from),
      to: Number(to),
    };
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
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const hasNextVerse = !isLastVerseOfSurah(
    chaptersData,
    selectedChapterId,
    Number(selectedVerseNumber),
  );
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
      <VerseAndTranslation
        from={Number(selectedVerseNumber)}
        to={Number(selectedVerseNumber)}
        chapter={Number(selectedChapterId)}
      />
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      {data?.posts?.length === 0 ? (
        <ReflectionNotAvailableMessage />
      ) : (
        <ReflectionDisclaimerMessage />
      )}
      {data?.posts?.posts?.map((reflection) => (
        <ReflectionItem
          id={reflection.id}
          key={reflection.id}
          date={reflection.createdAt}
          authorName={reflection?.author?.name}
          authorUsername={reflection?.author?.username}
          isAuthorVerified={reflection?.author?.verified}
          reflectionText={reflection?.body}
          reflectionGroup={reflection?.group}
          reflectionGroupLink={reflection?.groupLink}
          avatarUrl={reflection?.author?.profileImg}
          verseReferences={getVerseReferencesFromReflection(reflection)}
          likesCount={reflection?.likes}
          commentsCount={reflection?.commentsCount}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
        />
      ))}
      <div className={styles.readMoreButtonContainer}>
        <Button href={getQuranReflectVerseUrl(selectedChapterId, selectedVerseNumber)} isNewTab>
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
