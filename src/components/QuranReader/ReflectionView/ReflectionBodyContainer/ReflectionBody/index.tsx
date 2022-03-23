import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReflectionDisclaimerMessage from '../../ReflectionDisclaimerMessage';

import styles from './ReflectionBody.module.scss';

import Button from 'src/components/dls/Button/Button';
import Separator from 'src/components/dls/Separator/Separator';
import ReflectionItem, {
  VerseReference,
} from 'src/components/QuranReader/ReflectionView/ReflectionItem';
import TafsirEndOfScrollingActions from 'src/components/QuranReader/TafsirView/TafsirEndOfScrollingActions';
import VerseAndTranslation from 'src/components/Verse/VerseAndTranslation';
import DataContext from 'src/contexts/DataContext';
import { logButtonClick } from 'src/utils/eventLogger';
import {
  fakeNavigate,
  getQuranReflectVerseUrl,
  getVerseReflectionNavigationUrl,
} from 'src/utils/navigation';
import {
  getVerseAndChapterNumbersFromKey,
  isFirstVerseOfSurah,
  isLastVerseOfSurah,
  makeVerseKey,
} from 'src/utils/verse';

/**
 * From reflection data, extract the verse references
 * This is is a temporary function, once we migrate to use Quran.com's API we will probably remove this function
 *
 * @param {Object} reflection
 * @returns {VerseReference[]} verseReferences
 */
const getVerseReferencesFromReflection = (reflection: any): VerseReference[] => {
  return reflection.referencedAyahs.map((reference) => {
    const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(reference.key);
    let from;
    let to;

    if (verseNumber.includes('-')) {
      [from, to] = verseNumber.split('-');
    } else {
      from = verseNumber;
      to = verseNumber;
    }

    return { chapter: Number(chapterNumber), from: Number(from), to: Number(to) };
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
      <ReflectionDisclaimerMessage />
      {data?.posts?.map((reflection) => (
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
          likesCount={reflection?.likesCount}
          commentsCount={reflection?.commentsCount}
        />
      ))}
      <div className={styles.readMoreButtonContainer}>
        <Button
          href={getQuranReflectVerseUrl(
            makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
          )}
          isNewTab
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
